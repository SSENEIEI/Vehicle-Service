"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  FaCarSide,
  FaClipboardList,
  FaPaperclip,
  FaFileLines,
  FaPaperPlane,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";

const colors = {
  primary: "#0c4aa1",
  border: "#d5dfee",
  accent: "#f4f7fc",
  textDark: "#1d2f4b",
  textMuted: "#5a6c8f",
  success: "#1f8243",
  warning: "#ffd54f",
  surface: "#ffffff",
};

const formStyles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  headerCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "20px",
    fontWeight: "700",
    color: colors.textDark,
  },
  headerSubtitle: {
    fontSize: "15px",
    color: colors.textMuted,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: "700",
    color: colors.textDark,
  },
  fieldGrid: (columns = 3) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: "18px",
  }),
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  required: {
    color: "#d64545",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    height: "42px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.border}`,
    padding: "0 14px",
    fontSize: "15px",
    color: colors.textDark,
    backgroundColor: colors.surface,
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    borderRadius: "16px",
    border: `1.5px solid ${colors.border}`,
    padding: "14px",
    fontSize: "15px",
    color: colors.textDark,
    backgroundColor: colors.surface,
  },
  costHeaderRow: {
    display: "grid",
    gridTemplateColumns: "2fr repeat(4, 1fr)",
    gap: "14px",
    fontWeight: "700",
    color: colors.textDark,
  },
  costRow: {
    display: "grid",
    gridTemplateColumns: "2fr repeat(4, 1fr)",
    gap: "14px",
  },
  addLineButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.primary}`,
    backgroundColor: colors.surface,
    color: colors.primary,
    fontWeight: "700",
    padding: "10px 16px",
    cursor: "pointer",
  },
  totalsRow: {
    display: "grid",
    gridTemplateColumns: "2fr repeat(4, 1fr)",
    gap: "14px",
    alignItems: "center",
  },
  totalCell: {
    fontSize: "18px",
    fontWeight: "700",
  },
  attachmentRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  fileInput: {
    flex: "1",
    height: "42px",
    borderRadius: "14px",
    border: `1.5px dashed ${colors.border}`,
    padding: "10px 12px",
    fontSize: "15px",
    color: colors.textMuted,
    backgroundColor: colors.accent,
    cursor: "pointer",
  },
  iconLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  submitRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "16px",
    border: "none",
    backgroundColor: "#0b2b4f",
    color: "#ffffff",
    fontWeight: "700",
    padding: "14px 26px",
    fontSize: "16px",
    cursor: "pointer",
  },
  attachmentList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  attachmentItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderRadius: "14px",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.accent,
  },
  attachmentName: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: colors.textDark,
    fontWeight: "600",
  },
  removeAttachmentButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#e35b5b",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorText: {
    marginTop: "6px",
    fontSize: "14px",
    color: "#d64545",
  },
  successText: {
    marginTop: "6px",
    fontSize: "14px",
    color: colors.success,
  },
};

const createEmptyCostItem = () => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  description: "",
  quantity: "",
  unitPrice: "",
  note: "",
});

const formatCurrency = (value) => {
  const target = Number.isFinite(value) ? value : 0;
  return target.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatFileSize = (bytes) => {
  const size = Number(bytes) || 0;
  if (size <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let current = size;
  let unitIndex = 0;
  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }
  const precision = unitIndex === 0 ? 0 : 2;
  return `${current.toFixed(precision)} ${units[unitIndex]}`;
};

export default function RepairReportForm() {
  const [repairCode, setRepairCode] = useState("");
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [etaDate, setEtaDate] = useState("");
  const [costItems, setCostItems] = useState([createEmptyCostItem()]);
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef(null);
  const fileInputId = useId();

  const fetchNextRepairCode = useCallback(async () => {
    setIsLoadingCode(true);
    setCodeError("");
    try {
      const response = await fetch("/api/repair/report/next-code", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = await response.json();
      if (!payload?.nextCode) {
        throw new Error("Missing nextCode in response");
      }
      setRepairCode(payload.nextCode);
    } catch (error) {
      console.error("Failed to fetch next repair code", error);
      setRepairCode("");
      setCodeError("ไม่สามารถสร้างเลขแจ้งซ่อมได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsLoadingCode(false);
    }
  }, []);

  useEffect(() => {
    fetchNextRepairCode();
  }, [fetchNextRepairCode]);

  const handleCostItemChange = (id, field, value) => {
    setCostItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addCostItem = () => {
    setCostItems((prev) => [...prev, createEmptyCostItem()]);
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentsAdded = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) {
      return;
    }
    setAttachments((prev) => [...prev, ...selectedFiles]);
    event.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, position) => position !== index));
  };

  const calculateRowTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    return quantity * unitPrice;
  };

  const subtotal = costItems.reduce(
    (sum, item) => sum + calculateRowTotal(item),
    0
  );
  const vatAmount = subtotal * 0.07;
  const netTotal = subtotal + vatAmount;

  const resetForm = () => {
    setVehicleRegistration("");
    setVehicleType("");
    setPriorityLevel("");
    setIssueDescription("");
    setReportDate("");
    setEtaDate("");
    setCostItems([createEmptyCostItem()]);
    setAttachments([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setSubmitError("");
    setSubmitMessage("");

    if (!repairCode) {
      setSubmitError(codeError || "ระบบไม่สามารถสร้างเลขแจ้งซ่อมได้");
      return;
    }

    if (!vehicleRegistration.trim()) {
      setSubmitError("กรุณากรอกทะเบียนรถ");
      return;
    }

    if (!issueDescription.trim()) {
      setSubmitError("กรุณาระบุอาการ/ปัญหา");
      return;
    }

    if (!reportDate) {
      setSubmitError("กรุณาเลือกวันที่แจ้ง");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        repairCode,
        vehicleRegistration: vehicleRegistration.trim(),
        vehicleType: vehicleType.trim(),
        priorityLevel: priorityLevel.trim(),
        issueDescription: issueDescription.trim(),
        reportDate,
        etaDate: etaDate || null,
        costItems: costItems.map((item) => ({
          description: String(item.description || "").trim(),
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          note: String(item.note || "").trim(),
          total: Number(calculateRowTotal(item).toFixed(2)),
        })),
        subtotal: Number(subtotal.toFixed(2)),
        vatAmount: Number(vatAmount.toFixed(2)),
        netTotal: Number(netTotal.toFixed(2)),
        attachments: attachments.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      };

      const response = await fetch("/api/repair/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || "ไม่สามารถบันทึกคำขอได้");
      }

      const result = await response.json();
      setSubmitMessage(
        `บันทึกคำขอซ่อมเรียบร้อย (เลขที่ ${result?.repairCode || repairCode})`
      );
      resetForm();
      fetchNextRepairCode();
    } catch (error) {
      console.error("Failed to submit repair report", error);
      setSubmitError(error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form style={formStyles.wrapper} onSubmit={handleSubmit} noValidate>
      <div style={formStyles.headerCard}>
        <div style={formStyles.headerTitle}>
          <FaFileLines size={22} /> แบบฟอร์มแจ้งซ่อมรถ (แอดมิน)
        </div>
        <p style={formStyles.headerSubtitle}>
          บันทึกคำขอซ่อมรถให้สอดคล้องกับแผนซ่อมรถ: กำหนดความสำคัญ, ค่าใช้จ่าย และกำหนดแล้วเสร็จ
        </p>
      </div>

      <div style={formStyles.sectionCard}>
        <div style={formStyles.sectionHeader}>
          <FaCarSide size={20} /> ข้อมูลรถ
        </div>
        <div style={formStyles.fieldGrid(3)}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>เลขแจ้งซ่อม (อัตโนมัติ)</label>
            <input
              style={formStyles.input}
              placeholder={isLoadingCode ? "กำลังสร้างเลข..." : "ระบบจะสร้างอัตโนมัติ"}
              value={repairCode}
              readOnly
            />
            {codeError && <p style={formStyles.errorText}>{codeError}</p>}
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>
              ทะเบียนรถ <span style={formStyles.required}>*</span>
            </label>
            <input
              style={formStyles.input}
              placeholder="กรอกทะเบียนรถ"
              value={vehicleRegistration}
              onChange={(event) => setVehicleRegistration(event.target.value)}
            />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>ประเภทรถ</label>
            <input
              style={formStyles.input}
              placeholder="เช่น รถตู้ / รถเก๋ง"
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={formStyles.sectionCard}>
        <div style={formStyles.sectionHeader}>
          <FaClipboardList size={20} /> รายละเอียดงานซ่อม
        </div>
        <div style={formStyles.field}>
          <label style={formStyles.label}>
            อาการ/ปัญหา <span style={formStyles.required}>*</span>
          </label>
          <textarea
            style={formStyles.textarea}
            placeholder="อธิบายอาการหรือปัญหาที่พบ"
            value={issueDescription}
            onChange={(event) => setIssueDescription(event.target.value)}
          />
        </div>
        <div style={formStyles.fieldGrid(3)}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>ระดับความสำคัญ</label>
            <select
              style={formStyles.input}
              value={priorityLevel}
              onChange={(event) => setPriorityLevel(event.target.value)}
            >
              <option value="">เลือกระดับความสำคัญ</option>
              <option value="สูง">สูง</option>
              <option value="ปานกลาง">ปานกลาง</option>
              <option value="ต่ำ">ต่ำ</option>
            </select>
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>
              วันที่แจ้ง <span style={formStyles.required}>*</span>
            </label>
            <input
              type="date"
              style={formStyles.input}
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
            />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>กำหนดแล้วเสร็จ (ETA)</label>
            <input
              type="date"
              style={formStyles.input}
              value={etaDate}
              onChange={(event) => setEtaDate(event.target.value)}
            />
          </div>
        </div>

        <div>
          <div style={formStyles.costHeaderRow}>
            <span>รายละเอียดค่าใช้จ่าย</span>
            <span>จำนวน</span>
            <span>ราคา/หน่วย</span>
            <span>รวมราคา</span>
            <span>หมายเหตุ</span>
          </div>
          {costItems.map((item) => {
            const rowTotal = calculateRowTotal(item);
            return (
              <div style={formStyles.costRow} key={item.id}>
                <input
                  style={formStyles.input}
                  placeholder="รายการ"
                  value={item.description}
                  onChange={(event) =>
                    handleCostItemChange(item.id, "description", event.target.value)
                  }
                />
                <input
                  style={formStyles.input}
                  placeholder="0"
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(event) =>
                    handleCostItemChange(item.id, "quantity", event.target.value)
                  }
                />
                <input
                  style={formStyles.input}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(event) =>
                    handleCostItemChange(item.id, "unitPrice", event.target.value)
                  }
                />
                <input
                  style={formStyles.input}
                  readOnly
                  value={formatCurrency(rowTotal)}
                />
                <input
                  style={formStyles.input}
                  placeholder=""
                  value={item.note}
                  onChange={(event) =>
                    handleCostItemChange(item.id, "note", event.target.value)
                  }
                />
              </div>
            );
          })}
          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              style={formStyles.addLineButton}
              onClick={addCostItem}
              disabled={isSubmitting}
            >
              <FaPlus size={14} /> เพิ่มรายการ
            </button>
          </div>
        </div>

        <div style={formStyles.totalsRow}>
          <div />
          <div>
            <span style={formStyles.totalCell}>รวม (ก่อนภาษี)</span>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>
              {formatCurrency(subtotal)}
            </div>
          </div>
          <div>
            <span style={formStyles.totalCell}>VAT 7%</span>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>
              {formatCurrency(vatAmount)}
            </div>
          </div>
          <div>
            <span style={{ ...formStyles.totalCell, color: colors.success }}>ยอดรวมสุทธิ</span>
            <div style={{ fontSize: "20px", fontWeight: "800", color: colors.success }}>
              {formatCurrency(netTotal)}
            </div>
          </div>
          <div />
        </div>
      </div>

      <div style={formStyles.sectionCard}>
        <div style={formStyles.sectionHeader}>
          <FaPaperclip size={18} /> เอกสารแนบแจ้งซ่อม
        </div>
        <div style={formStyles.attachmentRow}>
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleAttachmentsAdded}
            disabled={isSubmitting}
          />
          <label
            htmlFor={fileInputId}
            style={{ ...formStyles.fileInput, display: "flex", alignItems: "center" }}
          >
            <span style={formStyles.iconLabel}>
              <FaPaperclip /> เพิ่มไฟล์แนบ (PDF / Excel / Word)
            </span>
          </label>
          <button
            type="button"
            style={formStyles.addLineButton}
            onClick={openFilePicker}
            disabled={isSubmitting}
          >
            <FaPlus size={14} /> เพิ่ม
          </button>
        </div>
        {!!attachments.length && (
          <div style={formStyles.attachmentList}>
            {attachments.map((file, index) => (
              <div style={formStyles.attachmentItem} key={`${file.name}-${file.lastModified || index}`}>
                <div style={formStyles.attachmentName}>
                  <FaFileLines size={16} />
                  <span>
                    {file.name} ({formatFileSize(file.size)})
                  </span>
                </div>
                <button
                  type="button"
                  style={formStyles.removeAttachmentButton}
                  onClick={() => removeAttachment(index)}
                  disabled={isSubmitting}
                >
                  <FaTrash size={14} /> ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={formStyles.submitRow}>
        <button
          type="submit"
          style={{
            ...formStyles.submitButton,
            opacity: isSubmitting ? 0.65 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
          disabled={isSubmitting}
        >
          <FaPaperPlane /> {isSubmitting ? "กำลังบันทึก..." : "บันทึกแจ้งซ่อม"}
        </button>
      </div>
      {submitError && <p style={formStyles.errorText}>{submitError}</p>}
      {submitMessage && <p style={formStyles.successText}>{submitMessage}</p>}
    </form>
  );
}
