'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaMagnifyingGlass,
  FaCalendarDays,
  FaGavel,
  FaListCheck,
  FaPaperclip,
  FaCircleInfo,
  FaFileLines,
  FaCoins,
  FaTrophy,
  FaXmark,
} from 'react-icons/fa6';
import { fetchJSON } from '@/lib/http';
import { normalizeRole } from '@/lib/menuItems';

const colors = {
  primary: '#0c4aa1',
  surface: '#ffffff',
  border: '#d5dfee',
  accent: '#f4f7fc',
  textDark: '#1d2f4b',
  textMuted: '#5a6c8f',
  badgeOpen: '#c8efd7',
  badgeOpenText: '#1f8243',
  badgeClosed: '#ffd6d6',
  badgeClosedText: '#d64545',
  badgeAward: '#dce7ff',
  badgeAwardText: '#0c4aa1',
};

const layoutStyles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  headerCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '20px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
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
    gridTemplateColumns: '1.5fr 0.8fr repeat(2, 1fr)',
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
  dropdownIndicator: {
    marginLeft: 'auto',
    fontWeight: '700',
    color: colors.textDark,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '20px',
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: '700',
    color: colors.textDark,
  },
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
  statusBadge: (background, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '72px',
    borderRadius: '999px',
    backgroundColor: background,
    color,
    fontSize: '13px',
    fontWeight: '700',
    padding: '6px 12px',
  }),
  rowActions: {
    display: 'flex',
    gap: '10px',
  },
  detailButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    border: `1.5px solid ${colors.textDark}`,
    backgroundColor: colors.surface,
    color: colors.textDark,
    fontWeight: '700',
    padding: '8px 16px',
    cursor: 'pointer',
  },
  bidButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#0b1533',
    color: '#ffffff',
    fontWeight: '700',
    padding: '8px 18px',
    cursor: 'pointer',
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
  successBanner: {
    backgroundColor: '#daf5d8',
    color: '#1f8243',
    borderRadius: '14px',
    border: '1px solid #b6e7b2',
    padding: '12px 16px',
    fontWeight: '600',
    fontSize: '14px',
  },
  bidTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '8px',
  },
  bidHeadCell: {
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: colors.textDark,
    padding: '8px 12px',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.accent,
  },
  bidCell: {
    textAlign: 'left',
    fontSize: '13px',
    color: colors.textDark,
    padding: '8px 12px',
    borderBottom: `1px solid ${colors.border}`,
    verticalAlign: 'middle',
  },
  winnerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '999px',
    backgroundColor: colors.badgeAward,
    color: colors.badgeAwardText,
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
  },
  selectWinnerButton: {
    borderRadius: '12px',
    border: 'none',
    backgroundColor: colors.primary,
    color: '#ffffff',
    fontWeight: '700',
    padding: '8px 14px',
    cursor: 'pointer',
  },
  detailDrawer: {
    marginTop: '12px',
    backgroundColor: colors.accent,
    borderRadius: '18px',
    border: `1px solid ${colors.border}`,
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  detailTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '17px',
    fontWeight: '700',
    color: colors.textDark,
  },
  closeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    border: `1px solid ${colors.textDark}`,
    backgroundColor: colors.surface,
    color: colors.textDark,
    padding: '6px 12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: colors.surface,
    borderRadius: '14px',
    border: `1px solid ${colors.border}`,
    padding: '12px 14px',
  },
  detailLabel: {
    fontSize: '13px',
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: '15px',
    color: colors.textDark,
    fontWeight: '600',
    wordBreak: 'break-word',
  },
  costTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '4px',
  },
  costHeadCell: {
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: colors.textDark,
    padding: '8px 12px',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.accent,
  },
  costCell: {
    textAlign: 'left',
    fontSize: '13px',
    color: colors.textDark,
    padding: '8px 12px',
    borderBottom: `1px solid ${colors.border}`,
  },
  attachmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  attachmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    padding: '10px 14px',
  },
  attachmentMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    color: colors.textDark,
    fontSize: '13px',
  },
  attachmentLink: {
    color: colors.primary,
    textDecoration: 'underline',
    fontWeight: '700',
  },
  bidForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  bidInput: {
    height: '44px',
    borderRadius: '12px',
    border: `1.5px solid ${colors.border}`,
    padding: '0 14px',
    fontSize: '15px',
    color: colors.textDark,
    backgroundColor: colors.surface,
  },
  bidActionsRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bidSubmitButton: {
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#0b1533',
    color: '#ffffff',
    fontWeight: '700',
    padding: '10px 20px',
    cursor: 'pointer',
    minWidth: '160px',
  },
  bidHint: {
    fontSize: '13px',
    color: colors.textMuted,
  },
  bidMeta: {
    fontSize: '14px',
    color: colors.textMuted,
    lineHeight: 1.5,
  },
  bidAdminHint: {
    fontSize: '12px',
    color: colors.textMuted,
    marginTop: '6px',
  },
};

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const formatDateLabel = (value) => {
  if (!value) return '-';
  const str = String(value).slice(0, 10);
  const [year, month, day] = str.split('-');
  if (!year || !month || !day) {
    return str;
  }
  return `${day}-${month}-${year}`;
};

const deriveAuctionStatus = (row) => {
  if (!row) {
    return { key: 'open', label: 'Open', background: colors.badgeOpen, color: colors.badgeOpenText };
  }

  if (row.assignedVendorUsername) {
    return {
      key: 'awarded',
      label: 'เลือกผู้ชนะแล้ว',
      background: colors.badgeAward,
      color: colors.badgeAwardText,
    };
  }

  const isClosed = !row.isBiddingOpen;
  if (isClosed) {
    return { key: 'closed', label: 'Close', background: colors.badgeClosed, color: colors.badgeClosedText };
  }

  return { key: 'open', label: 'Open', background: colors.badgeOpen, color: colors.badgeOpenText };
};

const formatFileSize = (bytes) => {
  const size = Number(bytes) || 0;
  if (!size) return '-';
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

export default function RepairBiddingClient() {
  const [repairs, setRepairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [userRole, setUserRole] = useState('admin');
  const [isTogglingId, setIsTogglingId] = useState(null);
  const [toggleError, setToggleError] = useState('');
  const [bidsByRepair, setBidsByRepair] = useState({});
  const [bidPrice, setBidPrice] = useState('');
  const [bidFile, setBidFile] = useState(null);
  const [bidSubmitError, setBidSubmitError] = useState('');
  const [bidSuccessMessage, setBidSuccessMessage] = useState('');
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [fileResetCounter, setFileResetCounter] = useState(0);
  const successTimeoutRef = useRef(null);

  const isAdmin = normalizeRole(userRole) === 'admin';
  const [selectWinnerError, setSelectWinnerError] = useState('');
  const [selectingWinnerKey, setSelectingWinnerKey] = useState('');

  const fetchBiddingPayload = useCallback(async () => {
    const response = await fetchJSON('/api/repair/bidding');
    if (!response || !Array.isArray(response.repairs)) {
      throw new Error('Invalid response');
    }
    return {
      repairs: response.repairs,
      bidsByRepair: response.bidsByRepair || {},
    };
  }, []);

  const resetBidForm = useCallback(({ keepSuccess = false } = {}) => {
    setBidFile(null);
    setBidSubmitError('');
    if (!keepSuccess) {
      setBidSuccessMessage('');
    }
    setFileResetCounter((prev) => prev + 1);
  }, []);

  const getBidsForRepair = useCallback(
    (repairId) => {
      if (!repairId) return [];
      const list = bidsByRepair[repairId] || [];
      return Array.isArray(list) ? list : [];
    },
    [bidsByRepair]
  );

  const handleOpenBid = useCallback((repairId) => {
    if (!repairId) return;
    setSelectedId(repairId);
  }, []);

  const handleBidPriceChange = useCallback((event) => {
    setBidPrice(event?.target?.value ?? '');
    setBidSubmitError('');
  }, []);

  const handleBidFileChange = useCallback((event) => {
    const file = event?.target?.files?.[0] || null;
    setBidFile(file);
    setBidSubmitError('');
  }, []);

  const handleSelectWinner = useCallback(
    async (repairId, vendorUsername) => {
      if (!isAdmin || !repairId || !vendorUsername) {
        return;
      }

      const key = `${repairId}:${vendorUsername}`;

      try {
        setSelectWinnerError('');
        setSelectingWinnerKey(key);
        const response = await fetchJSON(
          '/api/repair/bidding',
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: repairId, action: 'select-winner', vendorUsername }),
          },
          { retries: 0 }
        );

        if (!response?.success || !response?.repair) {
          throw new Error('Invalid response');
        }

        setRepairs((prev) => prev.map((item) => (item.id === repairId ? response.repair : item)));

        if (Array.isArray(response.bids)) {
          setBidsByRepair((prev) => ({
            ...prev,
            [repairId]: response.bids,
          }));
        }
      } catch (err) {
        console.error('Failed to select winning vendor', err);
        setSelectWinnerError(err?.message || 'ไม่สามารถเลือกผู้ชนะได้');
      } finally {
        setSelectingWinnerKey('');
      }
    },
    [isAdmin]
  );

  const handleSubmitBid = useCallback(
    async (event) => {
      event?.preventDefault?.();
      if (!selectedId) {
        setBidSubmitError('กรุณาเลือกรายการที่ต้องการเสนอราคา');
        return;
      }

      if (isAdmin) {
        setBidSubmitError('บัญชีผู้ดูแลระบบไม่สามารถเสนอราคาได้');
        return;
      }

      const currentRepair = repairs.find((item) => item.id === selectedId);
      if (!currentRepair) {
        setBidSubmitError('ไม่พบรายการแจ้งซ่อม');
        return;
      }

      if (!currentRepair.isBiddingOpen) {
        setBidSubmitError('รายการนี้ปิดรับเสนอราคาแล้ว');
        return;
      }

      const normalizedPrice = String(bidPrice || '').replace(/,/g, '').trim();
      const numericPrice = Number.parseFloat(normalizedPrice);
      if (!normalizedPrice || Number.isNaN(numericPrice) || numericPrice <= 0) {
        setBidSubmitError('กรุณาระบุราคาที่ถูกต้อง (มากกว่า 0 บาท)');
        return;
      }

      if (!bidFile) {
        setBidSubmitError('กรุณาแนบไฟล์ใบเสนอราคา (PDF)');
        return;
      }

      if (bidFile.type !== 'application/pdf') {
        setBidSubmitError('รองรับเฉพาะไฟล์ PDF เท่านั้น');
        return;
      }

      if (bidFile.size > 5 * 1024 * 1024) {
        setBidSubmitError('ไฟล์แนบมีขนาดเกินกำหนด (สูงสุด 5MB)');
        return;
      }

      setBidSubmitting(true);
      setBidSubmitError('');

      try {
        let token = '';
        try {
          token = localStorage.getItem('token') || '';
        } catch {
          token = '';
        }

        const formData = new FormData();
        formData.append('repairId', String(selectedId));
        formData.append('quoteAmount', numericPrice.toFixed(2));
        formData.append('attachment', bidFile);

        const response = await fetch('/api/repair/bidding', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          const message = data?.error || data?.message || 'ไม่สามารถบันทึกเสนอราคาได้';
          throw new Error(message);
        }

        if (!data?.bid) {
          throw new Error('ข้อมูลตอบกลับไม่ถูกต้อง');
        }

        setBidsByRepair((prev) => ({
          ...prev,
          [selectedId]: [data.bid],
        }));

        const bidAmount = Number(data.bid.quoteAmount);
        if (Number.isFinite(bidAmount)) {
          setBidPrice(bidAmount.toFixed(2));
        }

        resetBidForm({ keepSuccess: true });
        setBidSuccessMessage('บันทึกเสนอราคาเรียบร้อยแล้ว');
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        successTimeoutRef.current = setTimeout(() => {
          setBidSuccessMessage('');
        }, 4000);
      } catch (err) {
        console.error('Failed to submit bid', err);
        setBidSubmitError(err.message || 'ไม่สามารถบันทึกเสนอราคาได้');
      } finally {
        setBidSubmitting(false);
      }
    },
    [bidFile, bidPrice, isAdmin, repairs, resetBidForm, selectedId]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError('');
        setToggleError('');
        setSelectWinnerError('');
        const payload = await fetchBiddingPayload();
        if (!mounted) return;
        setRepairs(payload.repairs);
        setBidsByRepair(payload.bidsByRepair);
      } catch (err) {
        console.error('Failed to load bidding data', err);
        if (!mounted) return;
        setError('ไม่สามารถโหลดข้อมูลประมูลงานซ่อมได้');
        setRepairs([]);
        setBidsByRepair({});
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchBiddingPayload]);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        setUserRole(normalizeRole(storedRole));
      }
    } catch (err) {
      console.warn('Failed to restore role for bidding page', err);
    }
  }, []);

  useEffect(() => () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (isAdmin || !selectedId) {
      setBidPrice('');
      resetBidForm();
      return;
    }
    setBidPrice('');
    resetBidForm();
  }, [selectedId, isAdmin, resetBidForm]);

  useEffect(() => {
    if (isAdmin) {
      setSelectWinnerError('');
    }
  }, [isAdmin, selectedId]);

  useEffect(() => {
    if (isAdmin || !selectedId) {
      return;
    }
    const currentBid = getBidsForRepair(selectedId)[0];
    if (currentBid && typeof currentBid.quoteAmount === 'number') {
      setBidPrice(Number(currentBid.quoteAmount).toFixed(2));
    } else {
      setBidPrice('');
    }
  }, [getBidsForRepair, selectedId, isAdmin]);

  const selectedRepair = useMemo(
    () => repairs.find((repair) => repair.id === selectedId) || null,
    [repairs, selectedId]
  );

  const myBid = useMemo(() => {
    if (isAdmin || !selectedRepair) {
      return null;
    }
    const bids = getBidsForRepair(selectedRepair.id);
    return bids.length ? bids[0] : null;
  }, [getBidsForRepair, isAdmin, selectedRepair]);

  const handleToggleBidding = useCallback(
    async (rowId) => {
      if (!rowId || !isAdmin) {
        return;
      }

      try {
        setIsTogglingId(rowId);
        setToggleError('');
        setSelectWinnerError('');
        const response = await fetchJSON(
          '/api/repair/bidding',
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: rowId, action: 'toggle-bidding' }),
          },
          { retries: 0 }
        );

        if (!response?.success || !response?.repair) {
          throw new Error('Invalid toggle response');
        }

        setRepairs((prev) => prev.map((item) => (item.id === rowId ? response.repair : item)));
      } catch (err) {
        console.error('Failed to toggle bidding status', err);
        setToggleError('ไม่สามารถเปลี่ยนสถานะการประมูลได้');
      } finally {
        setIsTogglingId(null);
      }
    },
    [isAdmin]
  );

  const renderAuctionStatus = (row) => {
    const info = deriveAuctionStatus(row);
    const isBusy = isTogglingId === row?.id;

    if (!isAdmin) {
      return (
        <span style={layoutStyles.statusBadge(info.background, info.color)}>{info.label}</span>
      );
    }

    const isAwarded = Boolean(row?.assignedVendorUsername);
    const disabled = isBusy || isAwarded;

    return (
      <button
        type="button"
        style={{
          ...layoutStyles.statusBadge(info.background, info.color),
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
        }}
        onClick={() => {
          if (!disabled) {
            handleToggleBidding(row.id);
          }
        }}
        disabled={disabled}
      >
        {isBusy ? '...' : info.label}
      </button>
    );
  };

  return (
    <div style={layoutStyles.wrapper}>
      <div style={layoutStyles.headerCard}>
        <div style={layoutStyles.headerTitle}>
          <FaGavel size={20} /> ระบบประมูลงานซ่อมรถสำหรับผู้ให้บริการ (Vendor)
        </div>
        <p style={layoutStyles.headerSubtitle}>เชื่อมโยงข้อมูลจากแบบฟอร์มแจ้งซ่อม (แอดมิน)</p>

        <div style={layoutStyles.filtersRow}>
          <div style={layoutStyles.filterField}>
            <FaMagnifyingGlass /> ค้นหา: เลขแจ้งซ่อม/ทะเบียนรถ
          </div>
          <div style={layoutStyles.filterField}>
            ทั้งหมด
            <span style={layoutStyles.dropdownIndicator}>▼</span>
          </div>
          <div style={layoutStyles.filterField}>
            <FaCalendarDays /> ตั้งแต่วันที่
          </div>
          <div style={layoutStyles.filterField}>
            <FaCalendarDays /> ถึงวันที่
          </div>
        </div>
      </div>

      <div style={layoutStyles.sectionCard}>
        <div style={layoutStyles.sectionHeader}>
          <FaListCheck size={18} /> รายการประมูลงานซ่อม
        </div>

        {error ? (
          <div style={layoutStyles.errorBanner}>{error}</div>
        ) : null}
        {toggleError ? (
          <div style={layoutStyles.errorBanner}>{toggleError}</div>
        ) : null}
        {selectWinnerError ? (
          <div style={layoutStyles.errorBanner}>{selectWinnerError}</div>
        ) : null}

        {isLoading ? (
          <div style={layoutStyles.tableEmpty}>กำลังโหลดข้อมูล...</div>
        ) : repairs.length === 0 ? (
          <div style={layoutStyles.tableEmpty}>ยังไม่มีรายการประมูล</div>
        ) : (
          <table style={layoutStyles.table}>
            <thead>
              <tr>
                <th style={layoutStyles.tableHeadCell}>เลขแจ้งซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>ทะเบียนรถ</th>
                <th style={layoutStyles.tableHeadCell}>ประเภทรถ</th>
                <th style={layoutStyles.tableHeadCell}>รายการแจ้งซ่อม</th>
                <th style={layoutStyles.tableHeadCell}>แจ้งเมื่อ</th>
                <th style={layoutStyles.tableHeadCell}>สถานะประมูล</th>
                <th style={layoutStyles.tableHeadCell}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((row) => {
                const existingBid = isAdmin ? null : getBidsForRepair(row.id)[0] || null;
                const bidButtonDisabled = !row.isBiddingOpen;
                const bidButtonLabel = existingBid ? 'แก้ไขราคา' : 'เสนอราคา';

                return (
                  <tr key={row.id}>
                    <td style={layoutStyles.tableCell}>{row.repairCode || '-'}</td>
                    <td style={layoutStyles.tableCell}>{row.vehicleRegistration || '-'}</td>
                    <td style={layoutStyles.tableCell}>{row.vehicleType || '-'}</td>
                    <td style={layoutStyles.tableCell}>{row.issueDescription || '-'}</td>
                    <td style={layoutStyles.tableCell}>{formatDateLabel(row.reportDate)}</td>
                    <td style={layoutStyles.tableCell}>{renderAuctionStatus(row)}</td>
                    <td style={layoutStyles.tableCell}>
                      <div style={layoutStyles.rowActions}>
                        <button
                          type="button"
                          style={layoutStyles.detailButton}
                          onClick={() => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                        >
                          รายละเอียด
                        </button>
                        {isAdmin ? null : (
                          <button
                            type="button"
                            style={{
                              ...layoutStyles.bidButton,
                              cursor: bidButtonDisabled ? 'not-allowed' : 'pointer',
                              opacity: bidButtonDisabled ? 0.6 : 1,
                            }}
                            onClick={() => handleOpenBid(row.id)}
                            disabled={bidButtonDisabled}
                          >
                            {bidButtonLabel}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {selectedRepair ? (
          <div style={layoutStyles.detailDrawer}>
            <div style={layoutStyles.detailHeader}>
              <div style={layoutStyles.detailTitle}>
                <FaCircleInfo size={18} /> รายละเอียดเลขแจ้งซ่อม {selectedRepair.repairCode || '-'}
              </div>
              <button type="button" style={layoutStyles.closeButton} onClick={() => setSelectedId(null)}>
                <FaXmark /> ปิด
              </button>
            </div>

            <div style={layoutStyles.detailGrid}>
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>สถานะประมูล</span>
                <span style={layoutStyles.detailValue}>{deriveAuctionStatus(selectedRepair).label}</span>
              </div>
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>สถานะงานซ่อม</span>
                <span style={layoutStyles.detailValue}>{selectedRepair.statusLabel || '-'}</span>
              </div>
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>วันที่แจ้ง</span>
                <span style={layoutStyles.detailValue}>{formatDateLabel(selectedRepair.reportDate)}</span>
              </div>
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>กำหนดเสร็จ</span>
                <span style={layoutStyles.detailValue}>{formatDateLabel(selectedRepair.etaDate)}</span>
              </div>
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>วันที่เสร็จ</span>
                <span style={layoutStyles.detailValue}>{formatDateLabel(selectedRepair.completedDate)}</span>
              </div>
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>ระดับความเร่งด่วน</span>
                <span style={layoutStyles.detailValue}>{selectedRepair.priorityLevel || '-'}</span>
              </div>
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>ผู้สร้างรายการ</span>
                <span style={layoutStyles.detailValue}>{selectedRepair.createdBy || '-'}</span>
              </div>
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>ผู้ให้บริการที่เลือก</span>
                <span style={layoutStyles.detailValue}>{selectedRepair.assignedVendorUsername || '-'} </span>
              </div>
            </div>

            <div style={layoutStyles.detailItem}>
              <span style={layoutStyles.detailLabel}>รายละเอียดปัญหา</span>
              <span style={layoutStyles.detailValue}>{selectedRepair.issueDescription || '-'}</span>
            </div>

            <div style={layoutStyles.detailItem}>
              <span style={layoutStyles.detailLabel}>
                <FaCoins /> รายการค่าใช้จ่าย
              </span>
              {selectedRepair.costItems && selectedRepair.costItems.length ? (
                isAdmin ? (
                  <>
                    <table style={layoutStyles.costTable}>
                      <thead>
                        <tr>
                          <th style={layoutStyles.costHeadCell}>รายการ</th>
                          <th style={layoutStyles.costHeadCell}>จำนวน</th>
                          <th style={layoutStyles.costHeadCell}>ราคาต่อหน่วย</th>
                          <th style={layoutStyles.costHeadCell}>ราคารวม</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRepair.costItems.map((item, index) => (
                          <tr key={`cost-${index}`}>
                            <td style={layoutStyles.costCell}>{item.description || '-'}</td>
                            <td style={layoutStyles.costCell}>{item.quantity || '-'}</td>
                            <td style={layoutStyles.costCell}>{formatCurrency(item.unitPrice)}</td>
                            <td style={layoutStyles.costCell}>{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: colors.textMuted, fontSize: '13px' }}>Subtotal</div>
                        <div style={{ fontWeight: '700', color: colors.textDark }}>{formatCurrency(selectedRepair.subtotal)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: colors.textMuted, fontSize: '13px' }}>VAT</div>
                        <div style={{ fontWeight: '700', color: colors.textDark }}>{formatCurrency(selectedRepair.vatAmount)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: colors.textMuted, fontSize: '13px' }}>Net</div>
                        <div style={{ fontWeight: '700', color: colors.textDark }}>{formatCurrency(selectedRepair.netTotal)}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <table style={layoutStyles.costTable}>
                    <thead>
                      <tr>
                        <th style={layoutStyles.costHeadCell}>รายการ</th>
                        <th style={layoutStyles.costHeadCell}>จำนวน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRepair.costItems.map((item, index) => (
                        <tr key={`cost-${index}`}>
                          <td style={layoutStyles.costCell}>{item.description || '-'}</td>
                          <td style={layoutStyles.costCell}>{item.quantity || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                <span style={layoutStyles.detailValue}>-</span>
              )}
            </div>

            <div style={layoutStyles.detailItem}>
              <span style={layoutStyles.detailLabel}>
                <FaFileLines /> เอกสารแนบจากแบบฟอร์มแจ้งซ่อม
              </span>
              {selectedRepair.attachments && selectedRepair.attachments.length ? (
                <div style={layoutStyles.attachmentList}>
                  {selectedRepair.attachments.map((file, index) => (
                    <div key={`attachment-${index}`} style={layoutStyles.attachmentItem}>
                      <div style={layoutStyles.attachmentMeta}>
                        <span>{file.name || `ไฟล์แนบ ${index + 1}`}</span>
                        <span style={{ color: colors.textMuted, fontSize: '12px' }}>
                          {file.type || 'unknown'} • {formatFileSize(file.size)}
                        </span>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" style={layoutStyles.attachmentLink}>
                        ดาวน์โหลด
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={layoutStyles.detailValue}>ไม่มีไฟล์แนบ</span>
              )}
            </div>

            {isAdmin ? (
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>
                  <FaGavel /> ข้อเสนอราคาจาก Vendor
                </span>
                {(() => {
                  const bids = getBidsForRepair(selectedRepair.id);
                  if (!bids.length) {
                    return <span style={layoutStyles.detailValue}>ยังไม่มีเสนอราคา</span>;
                  }

                  return (
                    <>
                      <table style={layoutStyles.bidTable}>
                        <thead>
                          <tr>
                            <th style={layoutStyles.bidHeadCell}>Vendor</th>
                            <th style={layoutStyles.bidHeadCell}>ราคาเสนอ</th>
                            <th style={layoutStyles.bidHeadCell}>ส่งเมื่อ</th>
                            <th style={layoutStyles.bidHeadCell}>สถานะ</th>
                            <th style={layoutStyles.bidHeadCell}>การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bids.map((bid) => {
                            const key = `${selectedRepair.id}:${bid.vendorUsername}`;
                            const isWinner = Boolean(bid.isWinner);
                            const isSelecting = selectingWinnerKey === key;
                            const disableSelect = isWinner || Boolean(selectingWinnerKey && selectingWinnerKey !== key);
                            return (
                              <tr key={key}>
                                <td style={layoutStyles.bidCell}>{bid.vendorUsername}</td>
                                <td style={layoutStyles.bidCell}>{formatCurrency(bid.quoteAmount)}</td>
                                <td style={layoutStyles.bidCell}>{formatDateLabel(bid.submittedAt)}</td>
                                <td style={layoutStyles.bidCell}>
                                  {isWinner ? (
                                    <span style={layoutStyles.winnerBadge}>
                                      <FaTrophy size={12} /> ชนะการประมูล
                                    </span>
                                  ) : (
                                    <span style={layoutStyles.detailLabel}>รอพิจารณา</span>
                                  )}
                                </td>
                                <td style={layoutStyles.bidCell}>
                                  <button
                                    type="button"
                                    style={{
                                      ...layoutStyles.selectWinnerButton,
                                      cursor: disableSelect ? 'not-allowed' : 'pointer',
                                      opacity: disableSelect ? 0.6 : 1,
                                    }}
                                    onClick={() => handleSelectWinner(selectedRepair.id, bid.vendorUsername)}
                                    disabled={disableSelect}
                                  >
                                    {isSelecting ? 'กำลังเลือก...' : isWinner ? 'เลือกแล้ว' : 'เลือกผู้ชนะ'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div style={layoutStyles.bidAdminHint}>
                        เมื่อเลือกผู้ชนะแล้ว ระบบจะปิดการประมูลและบันทึกผู้ชนะไว้ในรายการติดตามงานซ่อมอัตโนมัติ
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : null}

            {!isAdmin ? (
              <div style={layoutStyles.detailItem}>
                <span style={layoutStyles.detailLabel}>
                  <FaCoins /> การเสนอราคาของคุณ
                </span>
                <div style={layoutStyles.bidMeta}>
                  {myBid ? (
                    <>
                      <div>
                        เสนอราคาล่าสุด: {formatCurrency(myBid.quoteAmount || 0)}
                        {myBid.submittedAt ? ` (ส่งเมื่อ ${formatDateLabel(myBid.submittedAt)})` : ''}
                      </div>
                      <div>
                        สถานะของคุณ: {myBid.isWinner ? 'ได้รับการคัดเลือกเป็นผู้ชนะ' : 'รอการคัดเลือกจากแอดมิน'}
                      </div>
                      {myBid.attachmentName ? (
                        <div>ไฟล์ใบเสนอราคา: {myBid.attachmentName}</div>
                      ) : null}
                    </>
                  ) : (
                    <div>ยังไม่มีเสนอราคาจากคุณ</div>
                  )}
                </div>

                {selectedRepair.isBiddingOpen ? (
                  <form style={layoutStyles.bidForm} onSubmit={handleSubmitBid}>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="ระบุราคาที่ต้องการเสนอ (บาท)"
                      style={layoutStyles.bidInput}
                      value={bidPrice}
                      onChange={handleBidPriceChange}
                      disabled={bidSubmitting}
                      autoComplete="off"
                    />
                    <input
                      key={fileResetCounter}
                      type="file"
                      accept="application/pdf"
                      onChange={handleBidFileChange}
                      disabled={bidSubmitting}
                    />
                    <span style={layoutStyles.bidHint}>รองรับไฟล์ PDF ขนาดไม่เกิน 5MB</span>
                    {bidSubmitError ? (
                      <div style={layoutStyles.errorBanner}>{bidSubmitError}</div>
                    ) : null}
                    {bidSuccessMessage ? (
                      <div style={layoutStyles.successBanner}>{bidSuccessMessage}</div>
                    ) : null}
                    <div style={layoutStyles.bidActionsRow}>
                      <button
                        type="submit"
                        style={{
                          ...layoutStyles.bidSubmitButton,
                          cursor: bidSubmitting ? 'wait' : 'pointer',
                          opacity: bidSubmitting ? 0.7 : 1,
                        }}
                        disabled={bidSubmitting}
                      >
                        {bidSubmitting ? 'กำลังบันทึก...' : myBid ? 'อัปเดตเสนอราคา' : 'ส่งเสนอราคา'}
                      </button>
                      <span style={layoutStyles.bidHint}>กรุณากรอกราคาเป็นตัวเลขและแนบใบเสนอราคา</span>
                    </div>
                  </form>
                ) : (
                  <div style={layoutStyles.bidMeta}>
                    {myBid && myBid.isWinner
                      ? 'คุณได้รับการคัดเลือกเป็นผู้ชนะสำหรับงานนี้'
                      : 'รายการนี้ปิดรับเสนอราคาแล้ว'}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div style={layoutStyles.sectionCard}>
        <div style={layoutStyles.sectionHeader}>
          <FaPaperclip size={16} /> ตรวจสอบสถานะเคลมค่าใช้จ่าย
        </div>
        <p style={{ ...layoutStyles.headerSubtitle, marginTop: '-4px' }}>
          ค้นหาได้เฉพาะรายการที่เป็น Vendor ของ User นี้เท่านั้น
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            style={{
              flex: '1 1 280px',
              height: '42px',
              borderRadius: '14px',
              border: `1.5px solid ${colors.border}`,
              padding: '0 14px',
              fontSize: '15px',
              color: colors.textMuted,
              backgroundColor: colors.surface,
            }}
            placeholder="เลขแจ้งซ่อม / Vendor name"
            disabled
          />
          <button
            type="button"
            style={{
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#0b1533',
              color: '#ffffff',
              fontWeight: '700',
              padding: '10px 22px',
              cursor: 'not-allowed',
              opacity: 0.6,
            }}
          >
            อยู่ระหว่างพัฒนา
          </button>
        </div>

        <div style={layoutStyles.tableEmpty}>ฟังก์ชันนี้จะพร้อมใช้งานในขั้นตอนถัดไป</div>
      </div>
    </div>
  );
}
