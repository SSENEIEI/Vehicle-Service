import { initDatabase, query } from '@/lib/db';

export const STATUS_INFO = {
  pending: { label: 'รออนุมัติ', background: '#ffd0cb', color: '#d64545' },
  waiting_repair: { label: 'รอซ่อม', background: '#ffe9a9', color: '#8a6d1d' },
  completed: { label: 'ซ่อมเสร็จ', background: '#c7f1d4', color: '#1f8243' },
};

const DATE_SLICE_LENGTH = 10;
const MAX_VENDOR_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5 MB

export function formatDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const str = String(value);
  if (str.length >= DATE_SLICE_LENGTH) {
    return str.slice(0, DATE_SLICE_LENGTH);
  }
  return str;
}

export function toNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseJSONColumn(raw) {
  if (!raw) return null;
  if (Array.isArray(raw) || typeof raw === 'object') {
    return raw;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function parseAttachments(raw) {
  const data = parseJSONColumn(raw);
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      url: String(item.url || ''),
      name: String(item.name || ''),
      size: Number(item.size) || 0,
      type: String(item.type || ''),
    }))
    .filter((item) => /^https?:\/\//i.test(item.url));
}

export function parseCostItems(raw) {
  const data = parseJSONColumn(raw);
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      description: String(item.description || item.name || ''),
      quantity: toNumber(item.quantity ?? item.qty),
      unitPrice: toNumber(item.unitPrice ?? item.price),
      total: toNumber(item.total ?? item.amount),
    }));
}

export async function ensureBiddingInfrastructure() {
  await initDatabase();

  const vendorColumn = await query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'repair_requests'
       AND COLUMN_NAME = 'assigned_vendor_username'
     LIMIT 1`
  );

  if (!vendorColumn.length) {
    await query(
      `ALTER TABLE repair_requests
       ADD COLUMN assigned_vendor_username VARCHAR(120) NULL AFTER garage_id`
    );
  }

  const biddingColumn = await query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'repair_requests'
       AND COLUMN_NAME = 'is_bidding_open'
     LIMIT 1`
  );

  if (!biddingColumn.length) {
    await query(
      `ALTER TABLE repair_requests
       ADD COLUMN is_bidding_open TINYINT(1) NOT NULL DEFAULT 1 AFTER assigned_vendor_username`
    );
    await query(`UPDATE repair_requests SET is_bidding_open = 1 WHERE is_bidding_open IS NULL`);
  }

  const bidsTable = await query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'repair_bids'
     LIMIT 1`
  );

  if (!bidsTable.length) {
    await query(`
      CREATE TABLE repair_bids (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        repair_request_id BIGINT UNSIGNED NOT NULL,
        vendor_username VARCHAR(120) NOT NULL,
        quote_amount DECIMAL(12,2) NOT NULL,
        attachment_name VARCHAR(255) NOT NULL,
        attachment_mime VARCHAR(120) NOT NULL,
        attachment_data LONGBLOB NOT NULL,
        is_winner TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_repair_bid_vendor (repair_request_id, vendor_username),
        KEY idx_repair_bids_request (repair_request_id),
        KEY idx_repair_bids_vendor (vendor_username),
        CONSTRAINT fk_repair_bids_request FOREIGN KEY (repair_request_id) REFERENCES repair_requests(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }
}

export function decorateRepairRow(row) {
  if (!row) return null;
  const status = row.status || 'pending';
  const statusMeta = STATUS_INFO[status] || STATUS_INFO.pending;
  const attachments = parseAttachments(row.attachments);
  const costItems = parseCostItems(row.costItems);

  return {
    id: row.id,
    repairCode: row.repairCode,
    vehicleRegistration: row.vehicleRegistration,
    vehicleType: row.vehicleType,
    priorityLevel: row.priorityLevel,
    issueDescription: row.issueDescription,
    createdBy: row.createdBy || null,
    reporterName: row.reporterName || row.createdBy || null,
    status,
    statusLabel: statusMeta.label,
    statusBackground: statusMeta.background,
    statusColor: statusMeta.color,
    reportDate: formatDate(row.reportDate),
    etaDate: formatDate(row.etaDate),
    completedDate: formatDate(row.completedDate),
    subtotal: toNumber(row.subtotal),
    vatAmount: toNumber(row.vatAmount),
    netTotal: toNumber(row.netTotal),
    garageId: row.garageId ? Number(row.garageId) : null,
    garageName: row.garageName || null,
    assignedVendorUsername: row.assignedVendorUsername || null,
    updatedAt: row.updatedAt ? formatDate(row.updatedAt) : null,
    attachments,
    costItems,
    isBiddingOpen: row.isBiddingOpen === null || row.isBiddingOpen === undefined ? true : Number(row.isBiddingOpen) === 1,
  };
}

export function sanitizeRepairForRole(repair, role) {
  if (!repair) return null;
  if (role === 'admin') {
    return repair;
  }

  const sanitized = { ...repair };
  sanitized.attachments = [];
  sanitized.costItems = Array.isArray(repair.costItems)
    ? repair.costItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
      }))
    : [];
  sanitized.subtotal = null;
  sanitized.vatAmount = null;
  sanitized.netTotal = null;
  return sanitized;
}

export async function fetchRepairsForRole(role) {
  const conditions = [];
  if (role === 'vendor') {
    conditions.push('rr.is_bidding_open = 1');
    conditions.push('(rr.status IS NULL OR rr.status <> "completed")');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await query(
    `SELECT
       rr.id,
       rr.repair_code AS repairCode,
       rr.vehicle_registration AS vehicleRegistration,
       rr.vehicle_type AS vehicleType,
       rr.priority_level AS priorityLevel,
       rr.issue_description AS issueDescription,
       rr.status,
       rr.report_date AS reportDate,
       rr.eta_date AS etaDate,
       rr.completed_date AS completedDate,
       rr.subtotal,
       rr.vat_amount AS vatAmount,
       rr.net_total AS netTotal,
       rr.attachments,
       rr.cost_items AS costItems,
       rr.assigned_vendor_username AS assignedVendorUsername,
       rr.is_bidding_open AS isBiddingOpen,
       rr.updated_at AS updatedAt,
       rr.created_by AS createdBy,
       COALESCE(u.username, rr.created_by) AS reporterName,
       rg.name AS garageName
     FROM repair_requests rr
     LEFT JOIN repair_garages rg ON rr.garage_id = rg.id
     LEFT JOIN users u ON u.username = rr.created_by
     ${whereClause}
     ORDER BY rr.created_at DESC`
  );

  return Array.isArray(rows) ? rows : [];
}

export async function fetchRepairById(repairId) {
  const rows = await query(
    `SELECT
       rr.id,
       rr.repair_code AS repairCode,
       rr.vehicle_registration AS vehicleRegistration,
       rr.vehicle_type AS vehicleType,
       rr.priority_level AS priorityLevel,
       rr.issue_description AS issueDescription,
       rr.status,
       rr.report_date AS reportDate,
       rr.eta_date AS etaDate,
       rr.completed_date AS completedDate,
       rr.subtotal,
       rr.vat_amount AS vatAmount,
       rr.net_total AS netTotal,
       rr.attachments,
       rr.cost_items AS costItems,
       rr.assigned_vendor_username AS assignedVendorUsername,
       rr.is_bidding_open AS isBiddingOpen,
       rr.updated_at AS updatedAt,
       rr.created_by AS createdBy,
       COALESCE(u.username, rr.created_by) AS reporterName,
       rg.name AS garageName
     FROM repair_requests rr
     LEFT JOIN repair_garages rg ON rr.garage_id = rg.id
     LEFT JOIN users u ON u.username = rr.created_by
     WHERE rr.id = ?
     LIMIT 1`,
    [repairId]
  );

  return rows.length ? rows[0] : null;
}

export async function fetchBidsForRepair(repairId) {
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
     WHERE repair_request_id = ?
     ORDER BY created_at ASC, id ASC`,
    [repairId]
  );

  return Array.isArray(rows) ? rows : [];
}

export async function fetchBidsForRepairs(repairIds) {
  if (!Array.isArray(repairIds) || !repairIds.length) {
    return [];
  }

  const placeholders = repairIds.map(() => '?').join(',');
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
     WHERE repair_request_id IN (${placeholders})
     ORDER BY repair_request_id ASC, created_at ASC, id ASC`,
    repairIds
  );

  return Array.isArray(rows) ? rows : [];
}

export function decorateBid(row) {
  return {
    id: row.id,
    repairRequestId: row.repairRequestId,
    vendorUsername: row.vendorUsername,
    quoteAmount: toNumber(row.quoteAmount),
    attachmentName: row.attachmentName,
    attachmentMime: row.attachmentMime,
    isWinner: Number(row.isWinner) === 1,
    submittedAt: row.createdAt ? formatDate(row.createdAt) : null,
  };
}

export function filterBidsForRole(bids, role, username) {
  if (role === 'admin') {
    return bids;
  }
  if (role === 'vendor') {
    return bids.filter((bid) => bid.vendorUsername === username);
  }
  return [];
}

export function groupBidsByRepair(bids) {
  return bids.reduce((acc, bid) => {
    if (!bid || !bid.repairRequestId) {
      return acc;
    }
    const list = acc[bid.repairRequestId] || [];
    list.push(bid);
    acc[bid.repairRequestId] = list;
    return acc;
  }, {});
}

export function validateQuoteAttachment(buffer, mimeType) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    const error = new Error('ไฟล์แนบไม่ถูกต้อง');
    error.status = 400;
    throw error;
  }

  if (buffer.length > MAX_VENDOR_ATTACHMENT_SIZE) {
    const error = new Error('ไฟล์แนบมีขนาดเกินกำหนด (สูงสุด 5MB)');
    error.status = 413;
    throw error;
  }

  if (mimeType !== 'application/pdf') {
    const error = new Error('รองรับเฉพาะไฟล์ PDF เท่านั้น');
    error.status = 400;
    throw error;
  }
}
