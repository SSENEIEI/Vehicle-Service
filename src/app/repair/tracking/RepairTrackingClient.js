'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaMagnifyingGlass,
  FaCalendarDays,
  FaPaperclip,
  FaTable,
  FaFileExcel,
  FaRotateRight,
} from 'react-icons/fa6';
import { fetchJSON } from '@/lib/http';

const colors = {
  primary: '#0c4aa1',
  surface: '#ffffff',
  border: '#d5dfee',
  accent: '#f4f7fc',
  textDark: '#1d2f4b',
  textMuted: '#5a6c8f',
  success: '#1f8243',
  warning: '#ffa726',
};

const badgeStyle = (background, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '76px',
  borderRadius: '999px',
  backgroundColor: background,
  color,
  fontSize: '13px',
  fontWeight: '700',
  padding: '6px 12px',
});

const statusButtonStyle = (background, color, disabled) => ({
  ...badgeStyle(background, color),
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: 'none',
});

const layoutStyles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  headerCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '20px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '700',
    color: colors.textDark,
  },
  headerSubtitle: {
    fontSize: '15px',
    color: colors.textMuted,
  },
  filtersRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr repeat(2, 1fr)',
    gap: '16px',
  },
  filterField: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '14px',
    border: `1.5px solid ${colors.border}`,
    padding: '10px 14px',
    backgroundColor: colors.surface,
    fontSize: '14px',
    color: colors.textMuted,
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '16px',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: '18px',
    border: `1px solid ${colors.border}`,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryLabel: {
    fontSize: '15px',
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: colors.textDark,
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  tableHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tableTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: '700',
    color: colors.textDark,
  },
  exportGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  exportButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#1b7c3a',
    color: '#ffffff',
    padding: '10px 16px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  refreshButton: (disabled = false) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '14px',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.primary,
    padding: '10px 16px',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  }),
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadCell: {
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '700',
    color: colors.textDark,
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.accent,
  },
  tableCell: {
    textAlign: 'left',
    fontSize: '14px',
    color: colors.textDark,
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.border}`,
    verticalAlign: 'middle',
  },
  badge: badgeStyle,
  statusButton: statusButtonStyle,
  select: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    fontSize: '14px',
    color: colors.textDark,
  },
  tableEmpty: {
    padding: '24px 16px',
    textAlign: 'center',
    color: colors.textMuted,
  },
  errorBanner: {
    backgroundColor: '#ffe1e1',
    color: '#b3261e',
    borderRadius: '14px',
    border: '1px solid #f6bcbc',
    padding: '12px 16px',
    fontWeight: '600',
    fontSize: '14px',
  },
};

const defaultSummary = Object.freeze({
  total: 0,
  pending: 0,
  waitingRepair: 0,
  completed: 0,
  totalCost: 0,
});

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const statusByKey = (statusInfo = {}, key) =>
  statusInfo[key] || statusInfo.pending || {
    label: 'รออนุมัติ',
    background: '#ffd0cb',
    color: '#d64545',
  };

const priorityStyle = (priorityRaw) => {
  const priority = String(priorityRaw || '').toLowerCase();
  if (!priority) {
    return { label: '-', background: '#e2e8f6', color: colors.textMuted };
  }
  if (priority.includes('เร่ง') || priority.includes('urgent')) {
    return { label: priorityRaw, background: '#ffcdd2', color: '#c62828' };
  }
  if (priority.includes('สูง') || priority.includes('high')) {
    return { label: priorityRaw, background: '#ffe0b2', color: '#ef6c00' };
  }
  if (priority.includes('ต่ำ') || priority.includes('low')) {
    return { label: priorityRaw, background: '#dcedc8', color: '#558b2f' };
  }
  return { label: priorityRaw, background: '#d5e8ff', color: colors.primary };
};

const formatDateLabel = (value) => {
  if (!value) return '-';
  const str = String(value).slice(0, 10);
  const [year, month, day] = str.split('-');
  if (!year || !month || !day) {
    return str;
  }
  return `${day}-${month}-${year}`;
};

const computeDurationLabel = (reportDate, completedDate) => {
  if (!reportDate) {
    return '-';
  }
  const start = new Date(reportDate);
  const end = completedDate ? new Date(completedDate) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '-';
  }
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) {
    return '-';
  }
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalDays = diffDays + 1;
  return completedDate ? `${totalDays} วัน` : `${totalDays} วัน (ดำเนินการ)`;
};

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const parseSummaryValue = (summary, key) => Number(summary?.[key]) || 0;

export default function RepairTrackingClient() {
  const [repairs, setRepairs] = useState([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [statusInfo, setStatusInfo] = useState({});
  const [garages, setGarages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [assigningGarageId, setAssigningGarageId] = useState(null);

  const loadData = useCallback(async (withSpinner = true) => {
    if (withSpinner) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError('');
    try {
      const [trackingResponse, garagesResponse] = await Promise.all([
        fetchJSON('/api/repair/tracking'),
        fetchJSON('/api/user-management/garages'),
      ]);

      if (!trackingResponse) {
        throw new Error('ไม่สามารถโหลดข้อมูลติดตามงานซ่อมได้');
      }

      setRepairs(Array.isArray(trackingResponse.repairs) ? trackingResponse.repairs : []);
      setSummary({ ...defaultSummary, ...(trackingResponse.summary || {}) });
      setStatusInfo(trackingResponse.statusInfo || {});

      if (garagesResponse && Array.isArray(garagesResponse.garages)) {
        setGarages(
          garagesResponse.garages.filter((garage) => garage?.isActive !== 0)
        );
      } else {
        setGarages([]);
      }
    } catch (err) {
      console.error('Failed to load repair tracking data', err);
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลได้');
      setRepairs([]);
      setSummary(defaultSummary);
      setStatusInfo({});
      setGarages([]);
    } finally {
      if (withSpinner) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const handleAdvanceStatus = useCallback(
    async (id) => {
      if (!id) return;
      setUpdatingStatusId(id);
      try {
        const response = await fetch('/api/repair/tracking', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'advance-status', id }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || 'ไม่สามารถอัปเดตสถานะได้');
        }
        await loadData(false);
      } catch (err) {
        console.error('Failed to advance status', err);
        setError(err?.message || 'ไม่สามารถอัปเดตสถานะได้');
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [loadData]
  );

  const handleGarageChange = useCallback(
    async (id, value) => {
      if (!id) {
        return;
      }
      setAssigningGarageId(id);
      try {
        const response = await fetch('/api/repair/tracking', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'assign-garage', id, garageId: value }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || 'ไม่สามารถบันทึกอู่ได้');
        }
        await loadData(false);
      } catch (err) {
        console.error('Failed to assign garage', err);
        setError(err?.message || 'ไม่สามารถบันทึกอู่ได้');
      } finally {
        setAssigningGarageId(null);
      }
    },
    [loadData]
  );

  const summaryCards = useMemo(
    () => [
      { label: 'รายการซ่อมทั้งหมด', value: parseSummaryValue(summary, 'total') },
      { label: 'รออนุมัติ', value: parseSummaryValue(summary, 'pending') },
      { label: 'รอซ่อม', value: parseSummaryValue(summary, 'waitingRepair') },
      { label: 'ซ่อมเสร็จ', value: parseSummaryValue(summary, 'completed') },
      {
        label: 'รวมค่าใช้จ่าย',
        value: parseSummaryValue(summary, 'totalCost'),
        format: (val) => formatCurrency(val),
      },
    ],
    [summary]
  );

  return (
    <div style={layoutStyles.wrapper}>
      <div style={layoutStyles.headerCard}>
        <div style={layoutStyles.headerTitle}>
          <FaTable size={20} /> รายงานการติดตามแจ้งซ่อมรถบริษัทฯ
        </div>
        <p style={layoutStyles.headerSubtitle}>
          ติดตามสถานะงานซ่อม, การมอบหมายอู่ และความคืบหน้าทั้งหมดจากข้อมูลที่แจ้งซ่อม
        </p>

        <div style={layoutStyles.filtersRow}>
          <div style={layoutStyles.filterField}>
            <FaMagnifyingGlass /> ค้นหา: เลขแจ้งซ่อม/ทะเบียนรถ/คำอธิบาย (เร็ว ๆ นี้)
          </div>
          <div style={layoutStyles.filterField}>
            <FaCalendarDays /> ตั้งแต่วันที่ (เร็ว ๆ นี้)
          </div>
          <div style={layoutStyles.filterField}>
            <FaCalendarDays /> ถึงวันที่ (เร็ว ๆ นี้)
          </div>
        </div>
      </div>

      <div style={layoutStyles.summaryRow}>
        {summaryCards.map((item) => (
          <div key={item.label} style={layoutStyles.summaryCard}>
            <span style={layoutStyles.summaryLabel}>{item.label}</span>
            <span style={layoutStyles.summaryValue}>
              {item.format ? item.format(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>

      {error && <div style={layoutStyles.errorBanner}>{error}</div>}

      <div style={layoutStyles.tableCard}>
        <div style={layoutStyles.tableHeaderRow}>
          <div style={layoutStyles.tableTitle}>
            <FaPaperclip size={18} /> ตารางติดตามงานซ่อม
          </div>
          <div style={layoutStyles.exportGroup}>
            <button
              type="button"
              style={layoutStyles.refreshButton(isRefreshing || isLoading)}
              onClick={() => loadData(false)}
              disabled={isRefreshing || isLoading}
            >
              <FaRotateRight /> {isRefreshing ? 'กำลังรีเฟรช' : 'รีเฟรช'}
            </button>
            <button type="button" style={layoutStyles.exportButton}>
              <FaFileExcel /> Export Excel
            </button>
          </div>
        </div>

        <table style={layoutStyles.table}>
          <thead>
            <tr>
              <th style={layoutStyles.tableHeadCell}>เลขแจ้งซ่อม</th>
              <th style={layoutStyles.tableHeadCell}>ทะเบียนรถ</th>
              <th style={layoutStyles.tableHeadCell}>ประเภทรถ</th>
              <th style={layoutStyles.tableHeadCell}>อาการ/ปัญหา</th>
              <th style={layoutStyles.tableHeadCell}>สถานะการซ่อม</th>
              <th style={layoutStyles.tableHeadCell}>ลำดับความสำคัญ</th>
              <th style={layoutStyles.tableHeadCell}>ผู้แจ้ง</th>
              <th style={layoutStyles.tableHeadCell}>อู่/ศูนย์บริการ</th>
              <th style={layoutStyles.tableHeadCell}>วันแจ้งซ่อม</th>
              <th style={layoutStyles.tableHeadCell}>วันซ่อมเสร็จ</th>
              <th style={layoutStyles.tableHeadCell}>ระยะเวลาดำเนินการ</th>
              <th style={layoutStyles.tableHeadCell}>ค่าใช้จ่าย</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={12} style={layoutStyles.tableEmpty}>
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : repairs.length === 0 ? (
              <tr>
                <td colSpan={12} style={layoutStyles.tableEmpty}>
                  ยังไม่มีรายการแจ้งซ่อม
                </td>
              </tr>
            ) : (
              repairs.map((row) => {
                const statusMeta = statusByKey(statusInfo, row.status);
                const priorityMeta = priorityStyle(row.priorityLevel);
                const completedLabel = row.completedDate || row.etaDate;
                const hasActiveGarage = row.garageId
                  ? garages.some((garage) => Number(garage.id) === Number(row.garageId))
                  : false;
                return (
                  <tr key={row.id}>
                    <td style={layoutStyles.tableCell}>{row.repairCode}</td>
                    <td style={layoutStyles.tableCell}>{row.vehicleRegistration}</td>
                    <td style={layoutStyles.tableCell}>{row.vehicleType || '-'}</td>
                    <td style={layoutStyles.tableCell}>{row.issueDescription || '-'}</td>
                    <td style={layoutStyles.tableCell}>
                      <button
                        type="button"
                        style={layoutStyles.statusButton(
                          statusMeta.background,
                          statusMeta.color,
                          row.status === 'completed' || updatingStatusId === row.id
                        )}
                        onClick={() => handleAdvanceStatus(row.id)}
                        disabled={row.status === 'completed' || updatingStatusId === row.id}
                      >
                        {updatingStatusId === row.id ? 'กำลังอัปเดต...' : statusMeta.label}
                      </button>
                    </td>
                    <td style={layoutStyles.tableCell}>
                      <span style={layoutStyles.badge(priorityMeta.background, priorityMeta.color)}>
                        {priorityMeta.label}
                      </span>
                    </td>
                    <td style={layoutStyles.tableCell}>-</td>
                    <td style={layoutStyles.tableCell}>
                      <select
                        style={layoutStyles.select}
                        value={row.garageId ? String(row.garageId) : ''}
                        onChange={(event) => handleGarageChange(row.id, event.target.value)}
                        disabled={assigningGarageId === row.id || garages.length === 0}
                      >
                        <option value="">
                          {garages.length === 0 ? 'ไม่มีอู่ที่พร้อมใช้งาน' : 'เลือกอู่'}
                        </option>
                        {!hasActiveGarage && row.garageId && row.garageName && (
                          <option value={String(row.garageId)}>
                            {row.garageName} (ปิดการใช้งาน)
                          </option>
                        )}
                        {garages.map((garage) => (
                          <option key={garage.id} value={String(garage.id)}>
                            {garage.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={layoutStyles.tableCell}>{formatDateLabel(row.reportDate)}</td>
                    <td style={layoutStyles.tableCell}>{formatDateLabel(completedLabel)}</td>
                    <td style={layoutStyles.tableCell}>
                      {computeDurationLabel(row.reportDate, row.completedDate)}
                    </td>
                    <td style={layoutStyles.tableCell}>{formatCurrency(row.netTotal)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
