import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { normalizeRole } from '@/lib/menuItems';
import {
  STATUS_INFO,
  ensureBiddingInfrastructure,
  fetchRepairsForRole,
  decorateRepairRow,
  fetchRepairById,
  sanitizeRepairForRole,
  fetchBidsForRepairs,
  fetchBidsForRepair,
  decorateBid,
  filterBidsForRole,
  groupBidsByRepair,
  validateQuoteAttachment,
} from './utils';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    const role = normalizeRole(user.role);
    const username = String(user.username || '').trim();

    await ensureBiddingInfrastructure();
    const rows = await fetchRepairsForRole(role);
    const repairs = rows
      .map(decorateRepairRow)
      .filter(Boolean)
      .map((item) => sanitizeRepairForRole(item, role));

    const repairIds = repairs.map((item) => item.id).filter(Boolean);
    let bidsByRepair = {};

    if (repairIds.length) {
      const bidRows = await fetchBidsForRepairs(repairIds);
      const decoratedBids = bidRows.map(decorateBid);
      const scopedBids = filterBidsForRole(decoratedBids, role, username);
      bidsByRepair = groupBidsByRepair(scopedBids);
    }

    return NextResponse.json({
      repairs,
      statusInfo: STATUS_INFO,
      bidsByRepair,
    });
  } catch (error) {
    console.error('[repair/bidding] GET error', error);
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลประมูลงานซ่อมได้' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await ensureBiddingInfrastructure();
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    const role = normalizeRole(user.role);
    const username = String(user.username || '').trim();

    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเปลี่ยนสถานะประมูลได้' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = Number(body?.id);
    const action = String(body?.action || '').trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: 'รหัสรายการไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (action === 'toggle-bidding') {
      const current = await fetchRepairById(id);
      if (!current) {
        return NextResponse.json(
          { error: 'ไม่พบรายการแจ้งซ่อม' },
          { status: 404 }
        );
      }

      const currentDecorated = decorateRepairRow(current);
      const nextState = currentDecorated.isBiddingOpen ? 0 : 1;

      await query(
        `UPDATE repair_requests
         SET is_bidding_open = ?, updated_at = NOW()
         WHERE id = ?`,
        [nextState, id]
      );

      const updated = await fetchRepairById(id);
      const repair = sanitizeRepairForRole(decorateRepairRow(updated), role);

      return NextResponse.json({ success: true, repair });
    }

    if (action === 'select-winner') {
      const vendorUsername = String(body?.vendorUsername || '').trim();
      if (!vendorUsername) {
        return NextResponse.json(
          { error: 'กรุณาระบุ Vendor ที่ต้องการเลือก' },
          { status: 400 }
        );
      }

      const current = await fetchRepairById(id);
      if (!current) {
        return NextResponse.json(
          { error: 'ไม่พบรายการแจ้งซ่อม' },
          { status: 404 }
        );
      }

      const bids = await fetchBidsForRepair(id);
      if (!bids.length) {
        return NextResponse.json(
          { error: 'ยังไม่มีเสนอราคาสำหรับรายการนี้' },
          { status: 400 }
        );
      }

      const winningBid = bids.find((bid) => bid.vendorUsername === vendorUsername);
      if (!winningBid) {
        return NextResponse.json(
          { error: 'ไม่พบเสนอราคาของ Vendor ที่เลือก' },
          { status: 404 }
        );
      }

      await query(
        `UPDATE repair_bids
         SET is_winner = CASE WHEN vendor_username = ? THEN 1 ELSE 0 END,
             updated_at = CURRENT_TIMESTAMP
         WHERE repair_request_id = ?`,
        [vendorUsername, id]
      );

      await query(
        `UPDATE repair_requests
         SET assigned_vendor_username = ?,
             is_bidding_open = 0,
             updated_at = NOW()
         WHERE id = ?`,
        [vendorUsername, id]
      );

      const updated = await fetchRepairById(id);
      const repair = sanitizeRepairForRole(decorateRepairRow(updated), role);

      const refreshedBids = await fetchBidsForRepair(id);
      const decoratedBids = refreshedBids.map(decorateBid);
      const scopedBids = filterBidsForRole(decoratedBids, role, username);

      return NextResponse.json({ success: true, repair, bids: scopedBids });
    }

    return NextResponse.json(
      { error: 'รูปแบบการดำเนินการไม่รองรับ' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[repair/bidding] PATCH error', error);
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตสถานะประมูลได้' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await ensureBiddingInfrastructure();
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const role = normalizeRole(user.role);
    if (role !== 'vendor') {
      return NextResponse.json({ error: 'อนุญาตเฉพาะผู้ให้บริการ (Vendor)' }, { status: 403 });
    }

    const username = String(user.username || '').trim();

    const formData = await request.formData();
    const repairIdValue = formData.get('repairId');
    const quoteAmountValue = formData.get('quoteAmount');
    const attachment = formData.get('attachment');

    const repairId = Number(repairIdValue);
    if (!Number.isInteger(repairId) || repairId <= 0) {
      const error = new Error('รหัสงานซ่อมไม่ถูกต้อง');
      error.status = 400;
      throw error;
    }

    const quoteNormalized = String(quoteAmountValue || '').replace(/,/g, '').trim();
    const quoteAmount = Number.parseFloat(quoteNormalized);
    if (!quoteNormalized || Number.isNaN(quoteAmount) || quoteAmount <= 0) {
      const error = new Error('กรุณาระบุราคาที่ต้องการเสนอ');
      error.status = 400;
      throw error;
    }

    if (!attachment || typeof attachment.arrayBuffer !== 'function') {
      const error = new Error('กรุณาแนบไฟล์ใบเสนอราคา (PDF)');
      error.status = 400;
      throw error;
    }

    const repairRow = await fetchRepairById(repairId);
    if (!repairRow) {
      const error = new Error('ไม่พบรายการแจ้งซ่อม');
      error.status = 404;
      throw error;
    }

    const repair = decorateRepairRow(repairRow);
    if (!repair.isBiddingOpen) {
      const error = new Error('รายการนี้ปิดรับเสนอราคาแล้ว');
      error.status = 409;
      throw error;
    }

    const mimeType = attachment.type || 'application/pdf';
    const arrayBuffer = await attachment.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    validateQuoteAttachment(buffer, mimeType);

    const attachmentName = attachment.name || `quotation-${repair.repairCode || repairId}.pdf`;
    const normalizedQuote = Math.round(quoteAmount * 100) / 100;

    await query(
      `INSERT INTO repair_bids (
         repair_request_id,
         vendor_username,
         quote_amount,
         attachment_name,
         attachment_mime,
         attachment_data,
         is_winner
       ) VALUES (?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         quote_amount = VALUES(quote_amount),
         attachment_name = VALUES(attachment_name),
         attachment_mime = VALUES(attachment_mime),
         attachment_data = VALUES(attachment_data),
         updated_at = CURRENT_TIMESTAMP`,
      [repairId, username, normalizedQuote, attachmentName, mimeType, buffer]
    );

    const rows = await query(
      `SELECT
         id,
         repair_request_id AS repairRequestId,
         vendor_username AS vendorUsername,
         quote_amount AS quoteAmount,
         attachment_name AS attachmentName,
         attachment_mime AS attachmentMime,
         is_winner AS isWinner,
         created_at AS createdAt
       FROM repair_bids
       WHERE repair_request_id = ? AND vendor_username = ?
       LIMIT 1`,
        [repairId, username]
    );

    const bidRow = rows.length ? rows[0] : null;
    if (!bidRow) {
      const error = new Error('ไม่สามารถบันทึกเสนอราคาได้');
      error.status = 500;
      throw error;
    }

    const bid = decorateBid(bidRow);

    return NextResponse.json({ success: true, bid });
  } catch (error) {
    console.error('[repair/bidding] POST error', error);
    const status = Number.isInteger(error?.status) ? error.status : 500;
    const message = status >= 500 ? 'ไม่สามารถบันทึกเสนอราคาได้' : error.message || 'ไม่สามารถบันทึกเสนอราคาได้';
    return NextResponse.json({ error: message }, { status });
  }
}
