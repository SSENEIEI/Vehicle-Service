"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { fetchJSON, postJSON } from "@/lib/http";
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
  userMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  userMetaSecondary: {
    fontSize: "13px",
    color: "#5f7196",
    fontWeight: "500",
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
  errorText: {
    color: "#d64545",
    fontSize: "13px",
    fontWeight: "600",
  },
  helperText: {
    fontSize: "13px",
    color: "#4a5a78",
  },
  tableEmpty: {
    padding: "24px 26px",
    textAlign: "center",
    fontSize: "15px",
    color: "#4a5a78",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "18px 26px",
    borderTop: "1px solid #dfe6f4",
  },
};

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

const ROLE_LABELS = {
  admin: "ผู้ดูแลระบบ",
  user: "ผู้ใช้ทั่วไป",
  vendor: "ผู้ให้บริการ",
};

export default function UserManagementClient() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState(createInitialUserForm);
  const [users, setUsers] = useState([]);
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingFactories, setIsLoadingFactories] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);

  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userFormError, setUserFormError] = useState("");

  const [isAddFactoryModalOpen, setIsAddFactoryModalOpen] = useState(false);
  const [factoryForm, setFactoryForm] = useState({ name: "" });
  const [factoryFormError, setFactoryFormError] = useState("");
  const [isSubmittingFactory, setIsSubmittingFactory] = useState(false);

  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({ factoryId: "", name: "" });
  const [departmentFormError, setDepartmentFormError] = useState("");
  const [isSubmittingDepartment, setIsSubmittingDepartment] = useState(false);

  const [isAddDivisionModalOpen, setIsAddDivisionModalOpen] = useState(false);
  const [divisionForm, setDivisionForm] = useState({ factoryId: "", departmentId: "", name: "" });
  const [divisionFormError, setDivisionFormError] = useState("");
  const [isSubmittingDivision, setIsSubmittingDivision] = useState(false);

  const resetUserForm = () => {
    setUserForm(createInitialUserForm());
  };

  const handleOpenAddUserModal = () => {
    setUserFormError("");
    setIsAddUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
    setUserFormError("");
    resetUserForm();
  };

  const handleOpenFactoryModal = () => {
    setFactoryForm({ name: "" });
    setFactoryFormError("");
    setIsAddFactoryModalOpen(true);
  };

  const handleCloseFactoryModal = () => {
    setIsAddFactoryModalOpen(false);
    setFactoryForm({ name: "" });
    setFactoryFormError("");
  };

  const handleOpenDepartmentModal = () => {
    setDepartmentForm((prev) => ({ factoryId: factories.length ? String(factories[0].id) : "", name: "" }));
    setDepartmentFormError("");
    setIsAddDepartmentModalOpen(true);
  };

  const handleCloseDepartmentModal = () => {
    setIsAddDepartmentModalOpen(false);
    setDepartmentForm({ factoryId: "", name: "" });
    setDepartmentFormError("");
  };

  const handleOpenDivisionModal = () => {
    setDivisionForm({ factoryId: "", departmentId: "", name: "" });
    setDivisionFormError("");
    setIsAddDivisionModalOpen(true);
  };

  const handleCloseDivisionModal = () => {
    setIsAddDivisionModalOpen(false);
    setDivisionForm({ factoryId: "", departmentId: "", name: "" });
    setDivisionFormError("");
  };

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await fetchJSON("/api/user-management/users");
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (error) {
      console.error("โหลดผู้ใช้ไม่สำเร็จ", error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const loadFactories = useCallback(async () => {
    setIsLoadingFactories(true);
    try {
      const data = await fetchJSON("/api/user-management/factories");
      setFactories(Array.isArray(data?.factories) ? data.factories : []);
    } catch (error) {
      console.error("โหลดโรงงานไม่สำเร็จ", error);
      setFactories([]);
    } finally {
      setIsLoadingFactories(false);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    setIsLoadingDepartments(true);
    try {
      const data = await fetchJSON("/api/user-management/departments");
      setDepartments(Array.isArray(data?.departments) ? data.departments : []);
    } catch (error) {
      console.error("โหลดแผนกไม่สำเร็จ", error);
      setDepartments([]);
    } finally {
      setIsLoadingDepartments(false);
    }
  }, []);

  const loadDivisions = useCallback(async () => {
    setIsLoadingDivisions(true);
    try {
      const data = await fetchJSON("/api/user-management/divisions");
      setDivisions(Array.isArray(data?.divisions) ? data.divisions : []);
    } catch (error) {
      console.error("โหลดฝ่ายไม่สำเร็จ", error);
      setDivisions([]);
    } finally {
      setIsLoadingDivisions(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadFactories();
    loadDepartments();
    loadDivisions();
  }, [loadUsers, loadFactories, loadDepartments, loadDivisions]);

  useEffect(() => {
    if (isAddDepartmentModalOpen && factories.length && !departmentForm.factoryId) {
      setDepartmentForm((prev) => ({ ...prev, factoryId: String(factories[0].id) }));
    }
  }, [isAddDepartmentModalOpen, factories, departmentForm.factoryId]);

  const handleInputChange = (field) => (event) => {
    const { value } = event.target;
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFactorySelectChange = (event) => {
    const { value } = event.target;
    setUserForm((prev) => ({
      ...prev,
      factory: value,
      department: "",
      division: "",
    }));
  };

  const handleDepartmentSelectChange = (event) => {
    const { value } = event.target;
    setUserForm((prev) => ({
      ...prev,
      department: value,
      division: "",
    }));
  };

  const departmentOptions = useMemo(() => {
    const factoryId = Number(userForm.factory);
    if (!factoryId) return [];
    return departments.filter((department) => Number(department.factoryId) === factoryId);
  }, [departments, userForm.factory]);

  const divisionOptions = useMemo(() => {
    const departmentId = Number(userForm.department);
    if (!departmentId) return [];
    return divisions.filter((division) => Number(division.departmentId) === departmentId);
  }, [divisions, userForm.department]);

  const divisionDepartmentOptions = useMemo(() => {
    const factoryId = Number(divisionForm.factoryId);
    if (!factoryId) return [];
    return departments.filter((department) => Number(department.factoryId) === factoryId);
  }, [departments, divisionForm.factoryId]);

  const handleSubmitAddUser = async (event) => {
    event.preventDefault();
    if (isSubmittingUser) return;
    setUserFormError("");

    const payload = {
      username: userForm.username.trim(),
      password: userForm.password.trim(),
      role: userForm.role,
      factoryId: userForm.factory ? Number(userForm.factory) : null,
      departmentId: userForm.department ? Number(userForm.department) : null,
      divisionId: userForm.division ? Number(userForm.division) : null,
    };

    if (!payload.username || !payload.password) {
      setUserFormError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (!payload.factoryId || !payload.departmentId || !payload.divisionId) {
      setUserFormError("กรุณาเลือกโรงงาน แผนก และฝ่าย");
      return;
    }

    setIsSubmittingUser(true);
    try {
      await postJSON("/api/user-management/users", payload);
      await loadUsers();
      handleCloseAddUserModal();
    } catch (error) {
      console.error("เพิ่มผู้ใช้ไม่สำเร็จ", error);
      setUserFormError(error?.message || "ไม่สามารถเพิ่มผู้ใช้ได้");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleSubmitFactory = async (event) => {
    event.preventDefault();
    if (isSubmittingFactory) return;
    setFactoryFormError("");

    const name = factoryForm.name.trim();
    if (!name) {
      setFactoryFormError("กรุณาระบุชื่อโรงงาน");
      return;
    }

    setIsSubmittingFactory(true);
    try {
      await postJSON("/api/user-management/factories", { name });
      await loadFactories();
      handleCloseFactoryModal();
    } catch (error) {
      console.error("เพิ่มโรงงานไม่สำเร็จ", error);
      setFactoryFormError(error?.message || "ไม่สามารถเพิ่มโรงงานได้");
    } finally {
      setIsSubmittingFactory(false);
    }
  };

  const handleSubmitDepartment = async (event) => {
    event.preventDefault();
    if (isSubmittingDepartment) return;
    setDepartmentFormError("");

    const factoryId = Number(departmentForm.factoryId);
    const name = departmentForm.name.trim();

    if (!factoryId) {
      setDepartmentFormError("กรุณาเลือกโรงงาน");
      return;
    }

    if (!name) {
      setDepartmentFormError("กรุณาระบุชื่อแผนก");
      return;
    }

    setIsSubmittingDepartment(true);
    try {
      await postJSON("/api/user-management/departments", { factoryId, name });
      await loadDepartments();
      handleCloseDepartmentModal();
    } catch (error) {
      console.error("เพิ่มแผนกไม่สำเร็จ", error);
      setDepartmentFormError(error?.message || "ไม่สามารถเพิ่มแผนกได้");
    } finally {
      setIsSubmittingDepartment(false);
    }
  };

  const handleSubmitDivision = async (event) => {
    event.preventDefault();
    if (isSubmittingDivision) return;
    setDivisionFormError("");

    const factoryId = Number(divisionForm.factoryId);
    const departmentId = Number(divisionForm.departmentId);
    const name = divisionForm.name.trim();

    if (!factoryId) {
      setDivisionFormError("กรุณาเลือกโรงงาน");
      return;
    }

    if (!departmentId) {
      setDivisionFormError("กรุณาเลือกแผนก");
      return;
    }

    if (!name) {
      setDivisionFormError("กรุณาระบุชื่อฝ่าย");
      return;
    }

    setIsSubmittingDivision(true);
    try {
      await postJSON("/api/user-management/divisions", { factoryId, departmentId, name });
      await loadDivisions();
      handleCloseDivisionModal();
    } catch (error) {
      console.error("เพิ่มฝ่ายไม่สำเร็จ", error);
      setDivisionFormError(error?.message || "ไม่สามารถเพิ่มฝ่ายได้");
    } finally {
      setIsSubmittingDivision(false);
    }
  };

  const handleDepartmentFormFactoryChange = (event) => {
    const { value } = event.target;
    setDepartmentForm((prev) => ({ ...prev, factoryId: value }));
  };

  const handleDivisionFactoryChange = (event) => {
    const { value } = event.target;
    setDivisionForm((prev) => ({ ...prev, factoryId: value, departmentId: "" }));
  };

  const handleDivisionDepartmentChange = (event) => {
    const { value } = event.target;
    setDivisionForm((prev) => ({ ...prev, departmentId: value }));
  };

  const canAddDepartment = factories.length > 0;
  const canAddDivision = factories.length > 0 && departments.length > 0;

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
                <th style={{ ...styles.tableHeadCell, width: "22%" }}>ชื่อผู้ใช้</th>
                <th style={{ ...styles.tableHeadCell, width: "14%" }}>บทบาท</th>
                <th style={{ ...styles.tableHeadCell, width: "20%" }}>โรงงาน</th>
                <th style={{ ...styles.tableHeadCell, width: "20%" }}>แผนก</th>
                <th style={{ ...styles.tableHeadCell, width: "14%" }}>ฝ่าย</th>
                <th style={{ ...styles.tableHeadCell, width: "10%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={6} style={styles.tableEmpty}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.tableEmpty}>
                    ยังไม่มีข้อมูลผู้ใช้
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const displayName = user.fullName || user.username;
                  const showUsername = Boolean(user.fullName && user.fullName !== user.username);
                  return (
                    <tr key={user.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <span style={styles.userCell}>
                          <FaUserLarge size={24} color="#8fa3c7" />
                          <span style={styles.userMeta}>
                            <span>{displayName}</span>
                            {showUsername && (
                              <span style={styles.userMetaSecondary}>({user.username})</span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td style={styles.tableCell}>{ROLE_LABELS[user.role] || user.role || "-"}</td>
                      <td style={styles.tableCell}>{user.factoryName || "-"}</td>
                      <td style={styles.tableCell}>{user.departmentName || "-"}</td>
                      <td style={styles.tableCell}>{user.divisionName || "-"}</td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaIndustry size={22} /> รายชื่อโรงงาน
            </span>
            <button
              type="button"
              style={styles.actionButton("ghost")}
              onClick={handleOpenFactoryModal}
            >
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
              {isLoadingFactories ? (
                <tr>
                  <td colSpan={2} style={styles.tableEmpty}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : factories.length === 0 ? (
                <tr>
                  <td colSpan={2} style={styles.tableEmpty}>
                    ยังไม่มีข้อมูลโรงงาน
                  </td>
                </tr>
              ) : (
                factories.map((factory) => (
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
                ))
              )}
            </tbody>
          </table>
        </section>

        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaBuildingUser size={22} /> รายชื่อแผนก
            </span>
            <button
              type="button"
              style={{
                ...styles.actionButton("ghost"),
                opacity: canAddDepartment ? 1 : 0.5,
                pointerEvents: canAddDepartment ? "auto" : "none",
              }}
              onClick={canAddDepartment ? handleOpenDepartmentModal : undefined}
              disabled={!canAddDepartment}
              title={canAddDepartment ? undefined : "กรุณาเพิ่มโรงงานก่อน"}
            >
              <FaBuilding size={16} /> เพิ่มแผนก
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "40%" }}>ชื่อแผนก</th>
                <th style={{ ...styles.tableHeadCell, width: "35%" }}>โรงงาน</th>
                <th style={{ ...styles.tableHeadCell, width: "25%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingDepartments ? (
                <tr>
                  <td colSpan={3} style={styles.tableEmpty}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={3} style={styles.tableEmpty}>
                    ยังไม่มีข้อมูลแผนก
                  </td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr key={department.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.userCell}>
                        <FaBuilding size={22} color="#8fa3c7" />
                        {department.name}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{department.factoryName || factories.find((f) => f.id === department.factoryId)?.name || "-"}</td>
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
                ))
              )}
            </tbody>
          </table>
        </section>

        <section style={styles.tableCard}>
          <header style={styles.tableTitleBar}>
            <span style={styles.tableTitleInner}>
              <FaPeopleGroup size={22} /> รายชื่อฝ่าย
            </span>
            <button
              type="button"
              style={{
                ...styles.actionButton("ghost"),
                opacity: canAddDivision ? 1 : 0.5,
                pointerEvents: canAddDivision ? "auto" : "none",
              }}
              onClick={canAddDivision ? handleOpenDivisionModal : undefined}
              disabled={!canAddDivision}
              title={canAddDivision ? undefined : "กรุณาเพิ่มโรงงานและแผนกก่อน"}
            >
              <FaPeopleGroup size={16} /> เพิ่มฝ่าย
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "30%" }}>ชื่อฝ่าย</th>
                <th style={{ ...styles.tableHeadCell, width: "30%" }}>แผนก</th>
                <th style={{ ...styles.tableHeadCell, width: "20%" }}>โรงงาน</th>
                <th style={{ ...styles.tableHeadCell, width: "20%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingDivisions ? (
                <tr>
                  <td colSpan={4} style={styles.tableEmpty}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : divisions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={styles.tableEmpty}>
                    ยังไม่มีข้อมูลฝ่าย
                  </td>
                </tr>
              ) : (
                divisions.map((division) => (
                  <tr key={division.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.userCell}>
                        <FaPeopleGroup size={22} color="#8fa3c7" />
                        {division.name}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {division.departmentName ||
                        departments.find((dept) => dept.id === division.departmentId)?.name ||
                        "-"}
                    </td>
                    <td style={styles.tableCell}>
                      {division.factoryName ||
                        factories.find((factory) => factory.id === division.factoryId)?.name ||
                        "-"}
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
                ))
              )}
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
                  onChange={handleFactorySelectChange}
                  required
                  disabled={factories.length === 0}
                >
                  <option value="" disabled>
                    เลือกโรงงาน
                  </option>
                  {factories.map((factory) => (
                    <option key={factory.id} value={String(factory.id)}>
                      {factory.name}
                    </option>
                  ))}
                </select>
                {factories.length === 0 && (
                  <p style={styles.helperText}>ยังไม่มีโรงงาน กรุณาเพิ่มโรงงานก่อน</p>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="user-department">
                  แผนก
                </label>
                <select
                  id="user-department"
                  style={styles.select}
                  value={userForm.department}
                  onChange={handleDepartmentSelectChange}
                  required
                  disabled={!userForm.factory || departmentOptions.length === 0}
                >
                  <option value="" disabled>
                    {userForm.factory ? "เลือกแผนก" : "เลือกโรงงานก่อน"}
                  </option>
                  {departmentOptions.map((department) => (
                    <option key={department.id} value={String(department.id)}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {userForm.factory && departmentOptions.length === 0 && (
                  <p style={styles.helperText}>ยังไม่มีแผนกในโรงงานนี้</p>
                )}
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
                  disabled={!userForm.department || divisionOptions.length === 0}
                >
                  <option value="" disabled>
                    {userForm.department ? "เลือกฝ่าย" : "เลือกแผนกก่อน"}
                  </option>
                  {divisionOptions.map((division) => (
                    <option key={division.id} value={String(division.id)}>
                      {division.name}
                    </option>
                  ))}
                </select>
                {userForm.department && divisionOptions.length === 0 && (
                  <p style={styles.helperText}>ยังไม่มีฝ่ายในแผนกนี้</p>
                )}
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

            {userFormError && <p style={{ ...styles.errorText, padding: "0 26px" }}>{userFormError}</p>}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseAddUserModal}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  ...styles.actionButton("primary"),
                  opacity: isSubmittingUser ? 0.7 : 1,
                  pointerEvents: isSubmittingUser ? "none" : "auto",
                }}
                disabled={isSubmittingUser}
              >
                {isSubmittingUser ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isAddFactoryModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseFactoryModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitFactory}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>เพิ่มโรงงาน</span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={handleCloseFactoryModal}
                aria-label="ปิดหน้าต่าง"
              >
                ×
              </button>
            </header>

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="factory-name">
                  ชื่อโรงงาน
                </label>
                <input
                  id="factory-name"
                  type="text"
                  style={styles.input}
                  value={factoryForm.name}
                  onChange={(event) => setFactoryForm({ name: event.target.value })}
                  required
                />
              </div>
            </div>

            {factoryFormError && <p style={{ ...styles.errorText, padding: "0 26px" }}>{factoryFormError}</p>}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseFactoryModal}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  ...styles.actionButton("primary"),
                  opacity: isSubmittingFactory ? 0.7 : 1,
                  pointerEvents: isSubmittingFactory ? "none" : "auto",
                }}
                disabled={isSubmittingFactory}
              >
                {isSubmittingFactory ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isAddDepartmentModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseDepartmentModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitDepartment}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>เพิ่มแผนก</span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={handleCloseDepartmentModal}
                aria-label="ปิดหน้าต่าง"
              >
                ×
              </button>
            </header>

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="department-factory">
                  โรงงาน
                </label>
                <select
                  id="department-factory"
                  style={styles.select}
                  value={departmentForm.factoryId}
                  onChange={handleDepartmentFormFactoryChange}
                  required
                >
                  <option value="" disabled>
                    เลือกโรงงาน
                  </option>
                  {factories.map((factory) => (
                    <option key={factory.id} value={String(factory.id)}>
                      {factory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="department-name">
                  ชื่อแผนก
                </label>
                <input
                  id="department-name"
                  type="text"
                  style={styles.input}
                  value={departmentForm.name}
                  onChange={(event) =>
                    setDepartmentForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {departmentFormError && (
              <p style={{ ...styles.errorText, padding: "0 26px" }}>{departmentFormError}</p>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseDepartmentModal}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  ...styles.actionButton("primary"),
                  opacity: isSubmittingDepartment ? 0.7 : 1,
                  pointerEvents: isSubmittingDepartment ? "none" : "auto",
                }}
                disabled={isSubmittingDepartment}
              >
                {isSubmittingDepartment ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isAddDivisionModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseDivisionModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitDivision}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>เพิ่มฝ่าย</span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={handleCloseDivisionModal}
                aria-label="ปิดหน้าต่าง"
              >
                ×
              </button>
            </header>

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="division-factory">
                  โรงงาน
                </label>
                <select
                  id="division-factory"
                  style={styles.select}
                  value={divisionForm.factoryId}
                  onChange={handleDivisionFactoryChange}
                  required
                >
                  <option value="" disabled>
                    เลือกโรงงาน
                  </option>
                  {factories.map((factory) => (
                    <option key={factory.id} value={String(factory.id)}>
                      {factory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="division-department">
                  แผนก
                </label>
                <select
                  id="division-department"
                  style={styles.select}
                  value={divisionForm.departmentId}
                  onChange={handleDivisionDepartmentChange}
                  required
                  disabled={!divisionForm.factoryId || divisionDepartmentOptions.length === 0}
                >
                  <option value="" disabled>
                    {divisionForm.factoryId ? "เลือกแผนก" : "เลือกโรงงานก่อน"}
                  </option>
                  {divisionDepartmentOptions.map((department) => (
                    <option key={department.id} value={String(department.id)}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {divisionForm.factoryId && divisionDepartmentOptions.length === 0 && (
                  <p style={styles.helperText}>ยังไม่มีแผนกในโรงงานนี้</p>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="division-name">
                  ชื่อฝ่าย
                </label>
                <input
                  id="division-name"
                  type="text"
                  style={styles.input}
                  value={divisionForm.name}
                  onChange={(event) =>
                    setDivisionForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                  disabled={!divisionForm.departmentId}
                />
              </div>
            </div>

            {divisionFormError && <p style={{ ...styles.errorText, padding: "0 26px" }}>{divisionFormError}</p>}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseDivisionModal}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  ...styles.actionButton("primary"),
                  opacity: isSubmittingDivision ? 0.7 : 1,
                  pointerEvents: isSubmittingDivision ? "none" : "auto",
                }}
                disabled={isSubmittingDivision}
              >
                {isSubmittingDivision ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
