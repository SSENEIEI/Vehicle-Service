'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
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
  filterInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: colors.textDark,
    backgroundColor: 'transparent',
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
  exportButton: (disabled = false) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#1b7c3a',
    color: '#ffffff',
    padding: '10px 16px',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
  }),
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
  manageButton: (disabled = false) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    border: `1px solid ${colors.primary}`,
    backgroundColor: colors.surface,
    color: colors.primary,
    padding: '8px 14px',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.65 : 1,
  }),
  documentListWrapper: {
    padding: '16px 20px',
    backgroundColor: colors.accent,
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  documentListHeader: {
    fontWeight: '700',
    color: colors.textDark,
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    gap: '12px',
  },
  documentMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    color: colors.textDark,
    fontSize: '14px',
  },
  documentLink: {
    color: colors.primary,
    textDecoration: 'underline',
    fontWeight: '700',
  },
};

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

const computeDurationLabel = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return '-';
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '-';
  }
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) {
    return '-';
  }
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return `${diffDays} วัน`;
};

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const parseSummaryValue = (summary, key) => Number(summary?.[key]) || 0;

const parseDateOnly = (value) => {
  if (!value) return null;
  const str = String(value).slice(0, 10);
  const [year, month, day] = str.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const formatFileSize = (bytes) => {
  const size = Number(bytes) || 0;
  if (size <= 0) {
    return '-';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let current = size;
  let unitIndex = 0;
  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }
  const precision = unitIndex === 0 ? 0 : 2;
  return `${current.toFixed(precision)} ${units[unitIndex]}`;
};

const buildSummary = (rows) => {
  const summary = {
    total: 0,
    pending: 0,
    waitingRepair: 0,
    completed: 0,
    totalCost: 0,
  };

  if (!Array.isArray(rows) || rows.length === 0) {
    return summary;
  }

  for (const row of rows) {
    summary.total += 1;
    const status = row?.status || 'pending';
    if (status === 'waiting_repair') {
      summary.waitingRepair += 1;
    } else if (status === 'completed') {
      summary.completed += 1;
    } else {
      summary.pending += 1;
    }
    summary.totalCost += Number(row?.netTotal) || 0;
  }

  return summary;
};

export default function RepairTrackingClient() {
  const [repairs, setRepairs] = useState([]);
  const [statusInfo, setStatusInfo] = useState({});
  const [vendorOptions, setVendorOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [assigningVendorRowId, setAssigningVendorRowId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedDocumentRowId, setExpandedDocumentRowId] = useState(null);

  const loadData = useCallback(async (withSpinner = true) => {
    if (withSpinner) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError('');
    try {
      const [trackingResponse, usersResponse] = await Promise.all([
        fetchJSON('/api/repair/tracking'),
        fetchJSON('/api/user-management/users'),
      ]);

      if (!trackingResponse) {
        throw new Error('ไม่สามารถโหลดข้อมูลติดตามงานซ่อมได้');
      }

      setRepairs(Array.isArray(trackingResponse.repairs) ? trackingResponse.repairs : []);
      setStatusInfo(trackingResponse.statusInfo || {});

      const vendorUsers = Array.isArray(usersResponse?.users)
        ? usersResponse.users.filter((user) => user?.role === 'vendor' && user?.status !== 'inactive')
        : [];

      const seenUsernames = new Set();
      const normalizedVendors = [];

      for (const vendor of vendorUsers) {
        const username = String(vendor?.username || '').trim();
        if (!username || seenUsernames.has(username.toLowerCase())) {
          continue;
        }
        seenUsernames.add(username.toLowerCase());
        normalizedVendors.push({
          key: vendor?.id ? `vendor-${vendor.id}` : `vendor-${username}`,
          username,
        });
      }

      normalizedVendors.sort((a, b) => a.username.localeCompare(b.username, 'th-TH'));

      setVendorOptions(normalizedVendors);
      setExpandedDocumentRowId(null);
    } catch (err) {
      console.error('Failed to load repair tracking data', err);
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลได้');
      setRepairs([]);
      setStatusInfo({});
      setVendorOptions([]);
      setExpandedDocumentRowId(null);
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

  const filteredRepairs = useMemo(() => {
    if (!Array.isArray(repairs) || repairs.length === 0) {
      return [];
    }

    const normalizedTerm = searchTerm.trim().toLowerCase();
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    return repairs.filter((row) => {
      const valuesToSearch = [
        row.repairCode,
        row.vehicleRegistration,
        row.vehicleType,
        row.issueDescription,
        row.priorityLevel,
        row.reporterName,
        row.garageName,
        row.assignedVendorUsername,
      ];

      const matchesSearch =
        !normalizedTerm ||
        valuesToSearch.some((value) =>
          String(value || '').toLowerCase().includes(normalizedTerm)
        );

      if (!matchesSearch) {
        return false;
      }

      if (!start && !end) {
        return true;
      }

      const report = parseDateOnly(row.reportDate);
      const eta = parseDateOnly(row.etaDate);
      if (!report || !eta) {
        return false;
      }

      if (start && report < start) {
        return false;
      }
      if (end && eta > end) {
        return false;
      }

      return true;
    });
  }, [repairs, searchTerm, startDate, endDate]);

  const filteredSummary = useMemo(() => buildSummary(filteredRepairs), [filteredRepairs]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || startDate || endDate
  );

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

  const handleVendorAssign = useCallback(
    async (id, username) => {
      if (!id) {
        return;
      }
      setAssigningVendorRowId(id);
      try {
        const response = await fetch('/api/repair/tracking', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'assign-vendor', id, vendorUsername: username }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || 'ไม่สามารถบันทึกผู้ให้บริการได้');
        }
        await loadData(false);
      } catch (err) {
        console.error('Failed to assign vendor', err);
        setError(err?.message || 'ไม่สามารถบันทึกผู้ให้บริการได้');
      } finally {
        setAssigningVendorRowId(null);
      }
    },
    [loadData]
  );

  const handleExportExcel = useCallback(async () => {
    if (!Array.isArray(filteredRepairs) || filteredRepairs.length === 0 || isLoading) {
      window.alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    setIsExporting(true);

    try {
      const XLSX = await import('xlsx');
      const headerLabels = [
        'เลขแจ้งซ่อม',
        'ทะเบียนรถ',
        'ประเภทรถ',
        'อาการ/ปัญหา',
        'สถานะการซ่อม',
        'ลำดับความสำคัญ',
        'ผู้แจ้ง',
  'ผู้ให้บริการ (Vendor)',
        'วันแจ้งซ่อม',
        'วันซ่อมเสร็จ',
        'ระยะเวลาดำเนินการ',
        'ค่าใช้จ่าย (บาท)',
      ];

      // Build worksheet rows using the same column order shown in the table.
      const dataRows = filteredRepairs.map((row) => {
        const statusMeta = statusByKey(statusInfo, row.status);
        const priorityMeta = priorityStyle(row.priorityLevel);
        const vendorLabel = row.assignedVendorUsername || '-';

        return [
          row.repairCode || '-',
          row.vehicleRegistration || '-',
          row.vehicleType || '-',
          row.issueDescription || '-',
          statusMeta.label,
          priorityMeta.label,
          row.reporterName || '-',
          vendorLabel,
          formatDateLabel(row.reportDate),
          formatDateLabel(row.etaDate),
          computeDurationLabel(row.reportDate, row.etaDate),
          Number(row.netTotal) || 0,
        ];
      });

      const worksheet = XLSX.utils.aoa_to_sheet([headerLabels, ...dataRows]);

      const summaryRows = [
        [],
        ['สรุป'],
        ['รายการซ่อมทั้งหมด', parseSummaryValue(filteredSummary, 'total')],
        ['รออนุมัติ', parseSummaryValue(filteredSummary, 'pending')],
        ['รอซ่อม', parseSummaryValue(filteredSummary, 'waitingRepair')],
        ['ซ่อมเสร็จ', parseSummaryValue(filteredSummary, 'completed')],
        ['รวมค่าใช้จ่าย (บาท)', formatCurrency(parseSummaryValue(filteredSummary, 'totalCost'))],
      ];

      XLSX.utils.sheet_add_aoa(worksheet, summaryRows, { origin: -1 });

      const columnWidths = headerLabels.map((label, index) => {
        const maxContentLength = Math.max(
          label.length,
          ...dataRows.map((row) => String(row[index] ?? '').length)
        );
        return { wch: Math.min(Math.max(maxContentLength + 4, 12), 32) };
      });
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Repair Tracking');

      const now = new Date();
      const timestamp = `${now.toISOString().slice(0, 10)}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      XLSX.writeFile(workbook, `repair-tracking-${timestamp}.xlsx`);
    } catch (err) {
      console.error('Failed to export repair tracking Excel', err);
      window.alert('ไม่สามารถส่งออกไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  }, [filteredRepairs, filteredSummary, isLoading, statusInfo]);

  const summaryCards = useMemo(
    () => [
      { label: 'รายการซ่อมทั้งหมด', value: parseSummaryValue(filteredSummary, 'total') },
      { label: 'รออนุมัติ', value: parseSummaryValue(filteredSummary, 'pending') },
      { label: 'รอซ่อม', value: parseSummaryValue(filteredSummary, 'waitingRepair') },
      { label: 'ซ่อมเสร็จ', value: parseSummaryValue(filteredSummary, 'completed') },
      {
        label: 'รวมค่าใช้จ่าย',
        value: parseSummaryValue(filteredSummary, 'totalCost'),
        format: (val) => formatCurrency(val),
      },
    ],
    [filteredSummary]
  );

  const canExport = !isLoading && filteredRepairs.length > 0;

  return (
    <div style={layoutStyles.wrapper}>
      <div style={layoutStyles.headerCard}>
        <div style={layoutStyles.headerTitle}>
          <FaTable size={20} /> รายงานการติดตามแจ้งซ่อมรถบริษัทฯ
        </div>
        <p style={layoutStyles.headerSubtitle}>
          ติดตามสถานะงานซ่อม, การมอบหมายผู้ให้บริการ และความคืบหน้าทั้งหมดจากข้อมูลที่แจ้งซ่อม
        </p>

        <div style={layoutStyles.filtersRow}>
          <div style={layoutStyles.filterField}>
            <FaMagnifyingGlass />
            <input
              style={layoutStyles.filterInput}
              placeholder="ค้นหา: เลขแจ้งซ่อม/ทะเบียนรถ/คำอธิบาย"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="ค้นหางานซ่อม"
            />
          </div>
          <div style={layoutStyles.filterField}>
            <FaCalendarDays />
            <input
              type="date"
              style={layoutStyles.filterInput}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              aria-label="ค้นหาตั้งแต่วันที่"
            />
          </div>
          <div style={layoutStyles.filterField}>
            <FaCalendarDays />
            <input
              type="date"
              style={layoutStyles.filterInput}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              aria-label="ค้นหาถึงวันที่"
            />
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
            <button
              type="button"
              style={layoutStyles.exportButton(isExporting || !canExport)}
              onClick={handleExportExcel}
              disabled={isExporting || !canExport}
            >
              <FaFileExcel /> {isExporting ? 'กำลังส่งออก...' : 'Export Excel'}
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
              <th style={layoutStyles.tableHeadCell}>ผู้ให้บริการ (Vendor)</th>
              <th style={layoutStyles.tableHeadCell}>วันแจ้งซ่อม</th>
              <th style={layoutStyles.tableHeadCell}>วันซ่อมเสร็จ</th>
              <th style={layoutStyles.tableHeadCell}>ระยะเวลาดำเนินการ</th>
              <th style={layoutStyles.tableHeadCell}>ค่าใช้จ่าย</th>
              <th style={layoutStyles.tableHeadCell}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={13} style={layoutStyles.tableEmpty}>
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : filteredRepairs.length === 0 ? (
              <tr>
                <td colSpan={13} style={layoutStyles.tableEmpty}>
                  {hasActiveFilters
                    ? 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'
                    : 'ยังไม่มีรายการแจ้งซ่อม'}
                </td>
              </tr>
            ) : (
               filteredRepairs.map((row) => {
                const statusMeta = statusByKey(statusInfo, row.status);
                const priorityMeta = priorityStyle(row.priorityLevel);
                const hasActiveVendor = row.assignedVendorUsername
                  ? vendorOptions.some(
                      (vendor) => vendor.username.toLowerCase() === row.assignedVendorUsername.toLowerCase()
                    )
                  : false;
                const attachments = Array.isArray(row.attachments) ? row.attachments : [];
                const hasAttachments = attachments.length > 0;
                const isExpanded = expandedDocumentRowId === row.id;
                return (
                  <Fragment key={row.id}>
                    <tr>
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
                      <td style={layoutStyles.tableCell}>{row.reporterName || '-'}</td>
                      <td style={layoutStyles.tableCell}>
                        <select
                          style={layoutStyles.select}
                          value={row.assignedVendorUsername || ''}
                          onChange={(event) => handleVendorAssign(row.id, event.target.value)}
                          disabled={
                            assigningVendorRowId === row.id ||
                            (vendorOptions.length === 0 && !row.assignedVendorUsername)
                          }
                        >
                          <option value="">
                            {vendorOptions.length === 0 ? 'ไม่มี Vendor ที่พร้อมใช้งาน' : 'เลือก Vendor'}
                          </option>
                          {!hasActiveVendor && row.assignedVendorUsername && (
                            <option value={row.assignedVendorUsername}>
                              {row.assignedVendorUsername} (ไม่พบบัญชี Vendor)
                            </option>
                          )}
                          {vendorOptions.map((vendor) => (
                            <option key={vendor.key} value={vendor.username}>
                              {vendor.username}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={layoutStyles.tableCell}>{formatDateLabel(row.reportDate)}</td>
                      <td style={layoutStyles.tableCell}>{formatDateLabel(row.etaDate)}</td>
                      <td style={layoutStyles.tableCell}>
                        {computeDurationLabel(row.reportDate, row.etaDate)}
                      </td>
                      <td style={layoutStyles.tableCell}>{formatCurrency(row.netTotal)}</td>
                      <td style={layoutStyles.tableCell}>
                        <button
                          type="button"
                          style={layoutStyles.manageButton(!hasAttachments)}
                          onClick={() => {
                            if (!hasAttachments) {
                              window.alert('ไม่มีเอกสารแนบสำหรับรายการนี้');
                              return;
                            }
                            setExpandedDocumentRowId((current) =>
                              current === row.id ? null : row.id
                            );
                          }}
                          disabled={!hasAttachments}
                        >
                          <FaPaperclip /> เอกสาร
                        </button>
                      </td>
                    </tr>
                    {isExpanded && hasAttachments && (
                      <tr key={`${row.id}-documents`}>
                        <td style={layoutStyles.tableCell} colSpan={13}>
                          <div style={layoutStyles.documentListWrapper}>
                            <span style={layoutStyles.documentListHeader}>
                              เอกสารแนบทั้งหมด ({attachments.length} รายการ)
                            </span>
                            {attachments.map((file, index) => (
                              <div key={`${row.id}-doc-${index}`} style={layoutStyles.documentItem}>
                                <div style={layoutStyles.documentMeta}>
                                  <span>{file.name || `เอกสารที่ ${index + 1}`}</span>
                                  <span>{formatFileSize(file.size)}</span>
                                </div>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={layoutStyles.documentLink}
                                >
                                  เปิดไฟล์
                                </a>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
