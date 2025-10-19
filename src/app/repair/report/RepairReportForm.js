"use client";

import { useId, useRef, useState } from "react";
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

export default function RepairReportForm() {
  const [costItems, setCostItems] = useState([createEmptyCostItem()]);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const fileInputId = useId();

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

  return (
    <div style={formStyles.wrapper}>
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
            <input style={formStyles.input} placeholder="ระบบจะสร้างอัตโนมัติ" readOnly />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>
              ทะเบียนรถ <span style={formStyles.required}>*</span>
            </label>
            <input style={formStyles.input} placeholder="กรอกทะเบียนรถ" />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>ประเภทรถ</label>
            <input style={formStyles.input} placeholder="เช่น รถตู้ / รถเก๋ง" />
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
          <textarea style={formStyles.textarea} placeholder="อธิบายอาการหรือปัญหาที่พบ" />
        </div>
        <div style={formStyles.fieldGrid(3)}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>ระดับความสำคัญ</label>
            <input style={formStyles.input} placeholder="เช่น สูง / กลาง / ต่ำ" />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>
              วันที่แจ้ง <span style={formStyles.required}>*</span>
            </label>
            <input type="date" style={formStyles.input} />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>กำหนดแล้วเสร็จ (ETA)</label>
            <input type="date" style={formStyles.input} />
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
            <button type="button" style={formStyles.addLineButton} onClick={addCostItem}>
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
          >
            <FaPlus size={14} /> เพิ่ม
          </button>
        </div>
        {!!attachments.length && (
          <div style={formStyles.attachmentList}>
            {attachments.map((file, index) => (
              <div style={formStyles.attachmentItem} key={`${file.name}-${file.lastModified}-${index}`}>
                <div style={formStyles.attachmentName}>
                  <FaFileLines size={16} />
                  <span>
                    {file.name} ({formatCurrency(file.size / 1000)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  style={formStyles.removeAttachmentButton}
                  onClick={() => removeAttachment(index)}
                >
                  <FaTrash size={14} /> ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={formStyles.submitRow}>
        <button type="button" style={formStyles.submitButton}>
          <FaPaperPlane /> บันทึกแจ้งซ่อม
        </button>
      </div>
    </div>
  );
}
