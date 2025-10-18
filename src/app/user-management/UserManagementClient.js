"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import {
  FaUserGear,
  FaUserLarge,
  FaPenToSquare,
  FaTrashCan,
  FaUserPlus,
  FaBuildingUser,
  FaBuilding,
  FaPeopleGroup,
  FaUserTie,
  FaRegImages,
  FaCarSide,
  FaIndustry,
} from "react-icons/fa6";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    border: "1px solid #d4deef",
    boxShadow: "0 12px 24px rgba(15, 59, 124, 0.08)",
    overflow: "hidden",
  },
  tableTitleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "20px 26px",
    borderBottom: "1px solid #d4deef",
    color: "#1d2f4b",
    backgroundColor: "#f5f8ff",
  },
  tableTitleInner: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "20px",
    fontWeight: "700",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeadCell: {
    textAlign: "left",
    padding: "16px 26px",
    fontSize: "15px",
    fontWeight: "700",
    color: "#1d2f4b",
    backgroundColor: "#f9fbff",
    borderBottom: "1px solid #dfe6f4",
  },
  tableRow: {
    borderBottom: "1px solid #eef2fc",
  },
  tableCell: {
    padding: "16px 26px",
    fontSize: "15px",
    color: "#2d3a57",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    fontWeight: "600",
  },
  actionGroup: {
    display: "inline-flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "nowrap",
  },
  actionButton: (variant = "primary") => {
    const palette = {
      primary: { bg: "#0c4aa1", hover: "#09387a" },
      danger: { bg: "#d64545", hover: "#b23535" },
      ghost: { bg: "#ffffff", hover: "#eef3ff", border: "#baccf0" },
    }[variant];

    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      borderRadius: "14px",
      border: variant === "ghost" ? `1px solid ${palette.border}` : "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "700",
      color: variant === "ghost" ? "#0c3c85" : "#ffffff",
      backgroundColor: palette.bg,
      transition: "background-color 0.2s ease",
      whiteSpace: "nowrap",
    };
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(17, 36, 71, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 1200,
  },
  modalContent: {
    width: "100%",
    maxWidth: "520px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 18px 36px rgba(15, 59, 124, 0.18)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 26px",
    borderBottom: "1px solid #dfe6f4",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1d2f4b",
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#7c90b1",
    cursor: "pointer",
    lineHeight: 1,
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    padding: "24px 26px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  fieldLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1d2f4b",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #d4deef",
    fontSize: "15px",
    color: "#1d2f4b",
    backgroundColor: "#f9fbff",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #d4deef",
    fontSize: "15px",
    color: "#1d2f4b",
    backgroundColor: "#f9fbff",
    outline: "none",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "18px 26px",
    borderTop: "1px solid #dfe6f4",
  },
};

const users = [
  { id: 1, name: "นายคงกร สุขสันต์" },
  { id: 2, name: "นางสาวศิริพร วัฒนกิจ" },
  { id: 3, name: "นายสมชาย อยู่ดี" },
  { id: 4, name: "นายสมปอง ใจดี" },
];

const departments = [
  { id: 101, name: "ฝ่ายบริหาร" },
  { id: 102, name: "ฝ่ายบุคคล" },
  { id: 103, name: "ฝ่ายจัดซื้อ" },
  { id: 104, name: "ฝ่ายเทคนิค" },
];

const divisions = [
  { id: 201, name: "หน่วยงานภาคสนาม" },
  { id: 202, name: "หน่วยงานซ่อมบำรุง" },
  { id: 203, name: "หน่วยงานบริการลูกค้า" },
  { id: 204, name: "หน่วยงานวางแผน" },
];

const factories = [
  { id: 501, name: "โรงงานพระนคร" },
  { id: 502, name: "โรงงานบางพลี" },
  { id: 503, name: "โรงงานลาดกระบัง" },
  { id: 504, name: "โรงงานชลบุรี" },
];

const drivers = [
  { id: 301, name: "นายคงกร สุขสันต์", phone: "089-009-09676" },
  { id: 302, name: "นายสมหมาย มีชัย", phone: "081-345-6789" },
  { id: 303, name: "นางสาวศิริพร วัฒนกิจ", phone: "086-222-3344" },
  { id: 304, name: "นายสมปอง ใจดี", phone: "080-555-6677" },
];

const vehicles = [
  { id: 401, name: "Toyota Commuter", registration: "ฮม-4521", type: "รถตู้" },
  { id: 402, name: "Isuzu D-Max", registration: "ขข-7812", type: "รถกระบะ" },
  { id: 403, name: "Honda Accord", registration: "1กข-9988", type: "รถเก๋ง" },
  { id: 404, name: "Mitsubishi Fuso", registration: "89-5476", type: "รถบรรทุก" },
];

const createInitialUserForm = () => ({
  username: "",
  password: "",
  factory: "",
  department: "",
  division: "",
  role: "",
});

export default function UserManagementClient() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState(createInitialUserForm);

  const resetUserForm = () => {
    setUserForm(createInitialUserForm());
  };

  const handleOpenAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
    resetUserForm();
  };

  const handleInputChange = (field) => (event) => {
    const { value } = event.target;
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitAddUser = (event) => {
    event.preventDefault();
    // TODO: replace with real submission logic.
    handleCloseAddUserModal();
  };

  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaUserGear size={26} />}
      headerSubtitle="จัดการผู้ใช้"
    >
      <div style={styles.container}>
        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaUserLarge size={22} /> รายชื่อผู้ใช้
            </span>
            <button
              type="button"
              style={styles.actionButton("ghost")}
              onClick={handleOpenAddUserModal}
            >
              <FaUserPlus size={16} /> เพิ่มผู้ใช้
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "60%" }}>ชื่อ</th>
                <th style={{ ...styles.tableHeadCell, width: "40%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <span style={styles.userCell}>
                      <FaUserLarge size={24} color="#8fa3c7" />
                      {user.name}
                    </span>
                  </td>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                      <button type="button" style={styles.actionButton("primary")}>
                        <FaPenToSquare size={14} /> แก้ไข
                      </button>
                      <button type="button" style={styles.actionButton("danger")}>
                        <FaTrashCan size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaIndustry size={22} /> รายชื่อโรงงาน
            </span>
            <button type="button" style={styles.actionButton("ghost")}>
              <FaIndustry size={16} /> เพิ่มโรงงาน
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "60%" }}>ชื่อโรงงาน</th>
                <th style={{ ...styles.tableHeadCell, width: "40%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {factories.map((factory) => (
                <tr key={factory.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <span style={styles.userCell}>
                      <FaIndustry size={22} color="#8fa3c7" />
                      {factory.name}
                    </span>
                  </td>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                      <button type="button" style={styles.actionButton("primary")}>
                        <FaPenToSquare size={14} /> แก้ไข
                      </button>
                      <button type="button" style={styles.actionButton("danger")}>
                        <FaTrashCan size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaBuildingUser size={22} /> รายชื่อแผนก
            </span>
            <button type="button" style={styles.actionButton("ghost")}>
              <FaBuilding size={16} /> เพิ่มแผนก
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "60%" }}>ชื่อแผนก</th>
                <th style={{ ...styles.tableHeadCell, width: "40%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <span style={styles.userCell}>
                      <FaBuilding size={22} color="#8fa3c7" />
                      {department.name}
                    </span>
                  </td>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                      <button type="button" style={styles.actionButton("primary")}>
                        <FaPenToSquare size={14} /> แก้ไข
                      </button>
                      <button type="button" style={styles.actionButton("danger")}>
                        <FaTrashCan size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaPeopleGroup size={22} /> รายชื่อฝ่าย
            </span>
            <button type="button" style={styles.actionButton("ghost")}>
              <FaPeopleGroup size={16} /> เพิ่มฝ่าย
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "60%" }}>ชื่อฝ่าย</th>
                <th style={{ ...styles.tableHeadCell, width: "40%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {divisions.map((division) => (
                <tr key={division.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <span style={styles.userCell}>
                      <FaPeopleGroup size={22} color="#8fa3c7" />
                      {division.name}
                    </span>
                  </td>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                      <button type="button" style={styles.actionButton("primary")}>
                        <FaPenToSquare size={14} /> แก้ไข
                      </button>
                      <button type="button" style={styles.actionButton("danger")}>
                        <FaTrashCan size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaUserTie size={22} /> รายชื่อพนักงานขับรถบริษัทฯ
            </span>
            <button type="button" style={styles.actionButton("ghost")}>
              <FaUserPlus size={16} /> เพิ่มพนักงานขับรถ
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "45%" }}>ชื่อ</th>
                <th style={{ ...styles.tableHeadCell, width: "25%" }}>เบอร์โทรศัพท์</th>
                <th style={{ ...styles.tableHeadCell, width: "30%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <span style={styles.userCell}>
                      <FaUserTie size={22} color="#8fa3c7" />
                      {driver.name}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{driver.phone}</td>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                      <button type="button" style={styles.actionButton("primary")}>
                        <FaPenToSquare size={14} /> แก้ไข
                      </button>
                      <button type="button" style={styles.actionButton("ghost")}>
                        <FaRegImages size={14} /> ดูรูป
                      </button>
                      <button type="button" style={styles.actionButton("danger")}>
                        <FaTrashCan size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaCarSide size={22} /> รถบริษัท
            </span>
            <button type="button" style={styles.actionButton("ghost")}>
              <FaCarSide size={16} /> เพิ่มรถบริษัท
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "35%" }}>ชื่อรถ</th>
                <th style={{ ...styles.tableHeadCell, width: "25%" }}>ทะเบียนรถ</th>
                <th style={{ ...styles.tableHeadCell, width: "20%" }}>ประเภทรถ</th>
                <th style={{ ...styles.tableHeadCell, width: "30%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <span style={styles.userCell}>
                      <FaCarSide size={22} color="#8fa3c7" />
                      {vehicle.name}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{vehicle.registration}</td>
                  <td style={styles.tableCell}>{vehicle.type}</td>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                      <button type="button" style={styles.actionButton("primary")}>
                        <FaPenToSquare size={14} /> แก้ไข
                      </button>
                      <button type="button" style={styles.actionButton("ghost")}>
                        <FaRegImages size={14} /> ดูรูป
                      </button>
                      <button type="button" style={styles.actionButton("danger")}>
                        <FaTrashCan size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {isAddUserModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseAddUserModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitAddUser}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>เพิ่มผู้ใช้</span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={handleCloseAddUserModal}
                aria-label="ปิดหน้าต่าง"
              >
                ×
              </button>
            </header>

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="user-username">
                  Username
                </label>
                <input
                  id="user-username"
                  type="text"
                  style={styles.input}
                  value={userForm.username}
                  onChange={handleInputChange("username")}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="user-password">
                  Password
                </label>
                <input
                  id="user-password"
                  type="password"
                  style={styles.input}
                  value={userForm.password}
                  onChange={handleInputChange("password")}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="user-factory">
                  โรงงาน
                </label>
                <select
                  id="user-factory"
                  style={styles.select}
                  value={userForm.factory}
                  onChange={handleInputChange("factory")}
                  required
                >
                  <option value="" disabled>
                    เลือกโรงงาน
                  </option>
                  {factories.map((factory) => (
                    <option key={factory.id} value={factory.id}>
                      {factory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="user-department">
                  แผนก
                </label>
                <select
                  id="user-department"
                  style={styles.select}
                  value={userForm.department}
                  onChange={handleInputChange("department")}
                  required
                >
                  <option value="" disabled>
                    เลือกแผนก
                  </option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="user-division">
                  ฝ่าย
                </label>
                <select
                  id="user-division"
                  style={styles.select}
                  value={userForm.division}
                  onChange={handleInputChange("division")}
                  required
                >
                  <option value="" disabled>
                    เลือกฝ่าย
                  </option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="user-role">
                  บทบาทผู้ใช้
                </label>
                <select
                  id="user-role"
                  style={styles.select}
                  value={userForm.role}
                  onChange={handleInputChange("role")}
                  required
                >
                  <option value="" disabled>
                    เลือกบทบาท
                  </option>
                  <option value="user">ผู้ใช้ทั่วไป</option>
                  <option value="vendor">ผู้ให้บริการ (Vendor)</option>
                </select>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseAddUserModal}
              >
                ยกเลิก
              </button>
              <button type="submit" style={styles.actionButton("primary")}>
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
