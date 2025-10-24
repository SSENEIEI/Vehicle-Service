"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { deleteJSON, fetchJSON, postJSON, putJSON } from "@/lib/http";
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
  FaScrewdriverWrench,
} from "react-icons/fa6";

const SUPER_ADMIN_USERNAME = "gaservice";

const isSuperAdminUser = (user) => {
  if (!user) return false;
  const username = String(user.username || "").trim().toLowerCase();
  if (username === SUPER_ADMIN_USERNAME) {
    return true;
  }
  if (
    user.role === "admin" &&
    !user.factoryId &&
    !user.departmentId &&
    !user.divisionId
  ) {
    return true;
  }
  return false;
};

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
  textarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #d4deef",
    fontSize: "15px",
    color: "#1d2f4b",
    backgroundColor: "#f9fbff",
    outline: "none",
    boxSizing: "border-box",
    minHeight: "96px",
    resize: "vertical",
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
  imagePreview: {
    width: "100%",
    maxHeight: "240px",
    borderRadius: "16px",
    border: "1px solid #d4deef",
    objectFit: "cover",
  },
};

const createInitialUserForm = () => ({
  username: "",
  password: "",
  email: "",
  factory: "",
  department: "",
  division: "",
  role: "",
});

const createInitialGarageForm = () => ({
  name: "",
  address: "",
});

const ROLE_LABELS = {
  admin: "ผู้ดูแลระบบ",
  user: "ผู้ใช้ทั่วไป",
  vendor: "ผู้ให้บริการ",
};

export default function UserManagementClient() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState("create");
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(createInitialUserForm);
  const [users, setUsers] = useState([]);
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [garages, setGarages] = useState([]);

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingFactories, setIsLoadingFactories] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingGarages, setIsLoadingGarages] = useState(true);

  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userFormError, setUserFormError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isEditingSuperAdmin, setIsEditingSuperAdmin] = useState(false);

  const [isFactoryModalOpen, setIsFactoryModalOpen] = useState(false);
  const [factoryModalMode, setFactoryModalMode] = useState("create");
  const [editingFactoryId, setEditingFactoryId] = useState(null);
  const [factoryForm, setFactoryForm] = useState({ id: null, name: "" });
  const [factoryFormError, setFactoryFormError] = useState("");
  const [isSubmittingFactory, setIsSubmittingFactory] = useState(false);
  const [deletingFactoryId, setDeletingFactoryId] = useState(null);

  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [departmentModalMode, setDepartmentModalMode] = useState("create");
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({ id: null, factoryId: "", divisionId: "", name: "" });
  const [departmentFormError, setDepartmentFormError] = useState("");
  const [isSubmittingDepartment, setIsSubmittingDepartment] = useState(false);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState(null);

  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [divisionModalMode, setDivisionModalMode] = useState("create");
  const [editingDivisionId, setEditingDivisionId] = useState(null);
  const [divisionForm, setDivisionForm] = useState({ id: null, factoryId: "", name: "" });
  const [divisionFormError, setDivisionFormError] = useState("");
  const [isSubmittingDivision, setIsSubmittingDivision] = useState(false);
  const [deletingDivisionId, setDeletingDivisionId] = useState(null);

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverModalMode, setDriverModalMode] = useState("create");
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [driverForm, setDriverForm] = useState({ name: "", phone: "", imageFile: null, imagePreview: "", existingImageUrl: "" });
  const [driverFormError, setDriverFormError] = useState("");
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
  const [deletingDriverId, setDeletingDriverId] = useState(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleModalMode, setVehicleModalMode] = useState("create");
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({ name: "", registration: "", vehicleType: "", imageFile: null, imagePreview: "", existingImageUrl: "" });
  const [vehicleFormError, setVehicleFormError] = useState("");
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);

  const [isGarageModalOpen, setIsGarageModalOpen] = useState(false);
  const [garageModalMode, setGarageModalMode] = useState("create");
  const [editingGarageId, setEditingGarageId] = useState(null);
  const [garageForm, setGarageForm] = useState(createInitialGarageForm);
  const [garageFormError, setGarageFormError] = useState("");
  const [isSubmittingGarage, setIsSubmittingGarage] = useState(false);
  const [deletingGarageId, setDeletingGarageId] = useState(null);

  const [imagePreviewModal, setImagePreviewModal] = useState({ isOpen: false, title: "", url: "" });

  const resetUserForm = () => {
    setUserForm(createInitialUserForm());
  };

  const handleOpenAddUserModal = () => {
    setUserModalMode("create");
    setEditingUserId(null);
    setUserForm(createInitialUserForm());
    setUserFormError("");
    setIsEditingSuperAdmin(false);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUserModal = (user) => {
    if (!user) return;
    const superAdmin = isSuperAdminUser(user);
    setUserModalMode("edit");
    setEditingUserId(user.id ?? null);
    setUserForm({
      username: user.username || "",
      password: "",
      email: user.email || "",
      factory: user.factoryId ? String(user.factoryId) : "",
      department: user.departmentId ? String(user.departmentId) : "",
      division: user.divisionId ? String(user.divisionId) : "",
      role: user.role || "",
    });
    setUserFormError("");
    setIsEditingSuperAdmin(superAdmin);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setUserModalMode("create");
    setEditingUserId(null);
    setUserFormError("");
    setIsEditingSuperAdmin(false);
    resetUserForm();
  };

  const handleOpenFactoryModal = () => {
    setFactoryModalMode("create");
    setEditingFactoryId(null);
    setFactoryForm({ id: null, name: "" });
    setFactoryFormError("");
    setIsFactoryModalOpen(true);
  };

  const handleOpenEditFactoryModal = (factory) => {
    if (!factory) return;
    setFactoryModalMode("edit");
    setEditingFactoryId(factory.id ?? null);
    setFactoryForm({ id: factory.id ?? null, name: factory.name || "" });
    setFactoryFormError("");
    setIsFactoryModalOpen(true);
  };

  const handleCloseFactoryModal = () => {
    setIsFactoryModalOpen(false);
    setFactoryModalMode("create");
    setEditingFactoryId(null);
    setFactoryForm({ id: null, name: "" });
    setFactoryFormError("");
  };

  const handleOpenDepartmentModal = () => {
    setDepartmentModalMode("create");
    setEditingDepartmentId(null);
    setDepartmentForm({
      id: null,
      factoryId: factories.length ? String(factories[0].id) : "",
      divisionId: "",
      name: "",
    });
    setDepartmentFormError("");
    setIsDepartmentModalOpen(true);
  };

  const handleOpenEditDepartmentModal = (department) => {
    if (!department) return;
    setDepartmentModalMode("edit");
    setEditingDepartmentId(department.id ?? null);
    setDepartmentForm({
      id: department.id ?? null,
      factoryId: department.factoryId ? String(department.factoryId) : "",
      divisionId: department.divisionId ? String(department.divisionId) : "",
      name: department.name || "",
    });
    setDepartmentFormError("");
    setIsDepartmentModalOpen(true);
  };

  const handleCloseDepartmentModal = () => {
    setIsDepartmentModalOpen(false);
    setDepartmentModalMode("create");
    setEditingDepartmentId(null);
    setDepartmentForm({ id: null, factoryId: "", divisionId: "", name: "" });
    setDepartmentFormError("");
  };

  const handleOpenDivisionModal = () => {
    setDivisionModalMode("create");
    setEditingDivisionId(null);
    setDivisionForm({ id: null, factoryId: factories.length ? String(factories[0].id) : "", name: "" });
    setDivisionFormError("");
    setIsDivisionModalOpen(true);
  };

  const handleOpenEditDivisionModal = (division) => {
    if (!division) return;
    setDivisionModalMode("edit");
    setEditingDivisionId(division.id ?? null);
    setDivisionForm({
      id: division.id ?? null,
      factoryId: division.factoryId ? String(division.factoryId) : "",
      name: division.name || "",
    });
    setDivisionFormError("");
    setIsDivisionModalOpen(true);
  };

  const handleCloseDivisionModal = () => {
    setIsDivisionModalOpen(false);
    setDivisionModalMode("create");
    setEditingDivisionId(null);
    setDivisionForm({ id: null, factoryId: "", name: "" });
    setDivisionFormError("");
  };

  const resetDriverForm = () => {
    setDriverForm((prev) => {
      if (prev.imagePreview && prev.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imagePreview);
      }
      return { name: "", phone: "", imageFile: null, imagePreview: "", existingImageUrl: "" };
    });
  };

  const handleOpenDriverModal = () => {
    setDriverModalMode("create");
    setEditingDriverId(null);
    resetDriverForm();
    setDriverFormError("");
    setIsDriverModalOpen(true);
  };

  const handleOpenEditDriverModal = (driver) => {
    if (!driver) return;
    setDriverModalMode("edit");
    setEditingDriverId(driver.id ?? null);
    setDriverForm({
      name: driver.name || "",
      phone: driver.phone || "",
      imageFile: null,
      imagePreview: driver.photoUrl || "",
      existingImageUrl: driver.photoUrl || "",
    });
    setDriverFormError("");
    setIsDriverModalOpen(true);
  };

  const handleCloseDriverModal = () => {
    setIsDriverModalOpen(false);
    setDriverModalMode("create");
    setEditingDriverId(null);
    resetDriverForm();
    setDriverFormError("");
  };

  const resetVehicleForm = () => {
    setVehicleForm((prev) => {
      if (prev.imagePreview && prev.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imagePreview);
      }
      return {
        name: "",
        registration: "",
        vehicleType: "",
        imageFile: null,
        imagePreview: "",
        existingImageUrl: "",
      };
    });
  };

  const handleOpenVehicleModal = () => {
    setVehicleModalMode("create");
    setEditingVehicleId(null);
    resetVehicleForm();
    setVehicleFormError("");
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicleModal = (vehicle) => {
    if (!vehicle) return;
    setVehicleModalMode("edit");
    setEditingVehicleId(vehicle.id ?? null);
    setVehicleForm({
      name: vehicle.name || "",
      registration: vehicle.registration || "",
      vehicleType: vehicle.vehicleType || "",
      imageFile: null,
      imagePreview: vehicle.photoUrl || "",
      existingImageUrl: vehicle.photoUrl || "",
    });
    setVehicleFormError("");
    setIsVehicleModalOpen(true);
  };

  const handleCloseVehicleModal = () => {
    setIsVehicleModalOpen(false);
    setVehicleModalMode("create");
    setEditingVehicleId(null);
    resetVehicleForm();
    setVehicleFormError("");
  };

  const resetGarageForm = () => {
    setGarageForm(createInitialGarageForm());
  };

  const handleOpenGarageModal = () => {
    setGarageModalMode("create");
    setEditingGarageId(null);
    resetGarageForm();
    setGarageFormError("");
    setIsGarageModalOpen(true);
  };

  const handleOpenEditGarageModal = (garage) => {
    if (!garage) return;
    setGarageModalMode("edit");
    setEditingGarageId(garage.id ?? null);
    setGarageForm({
      name: garage.name || "",
      address: garage.address || "",
    });
    setGarageFormError("");
    setIsGarageModalOpen(true);
  };

  const handleCloseGarageModal = () => {
    setIsGarageModalOpen(false);
    setGarageModalMode("create");
    setEditingGarageId(null);
    resetGarageForm();
    setGarageFormError("");
  };

  const handleDriverImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setDriverForm((prev) => {
      if (prev.imagePreview && prev.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imagePreview);
      }
      return {
        ...prev,
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : prev.existingImageUrl || "",
      };
    });
  };

  const handleVehicleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setVehicleForm((prev) => {
      if (prev.imagePreview && prev.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imagePreview);
      }
      return {
        ...prev,
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : prev.existingImageUrl || "",
      };
    });
  };

  const openImagePreview = (title, url) => {
    if (!url) return;
    setImagePreviewModal({ isOpen: true, title, url });
  };

  const closeImagePreview = () => {
    setImagePreviewModal({ isOpen: false, title: "", url: "" });
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

  const loadDrivers = useCallback(async () => {
    setIsLoadingDrivers(true);
    try {
      const data = await fetchJSON("/api/company-assets/drivers");
      setDrivers(Array.isArray(data?.drivers) ? data.drivers : []);
    } catch (error) {
      console.error("โหลดพนักงานขับรถไม่สำเร็จ", error);
      setDrivers([]);
    } finally {
      setIsLoadingDrivers(false);
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    setIsLoadingVehicles(true);
    try {
      const data = await fetchJSON("/api/company-assets/vehicles");
      setVehicles(Array.isArray(data?.vehicles) ? data.vehicles : []);
    } catch (error) {
      console.error("โหลดรถบริษัทไม่สำเร็จ", error);
      setVehicles([]);
    } finally {
      setIsLoadingVehicles(false);
    }
  }, []);

  const loadGarages = useCallback(async () => {
    setIsLoadingGarages(true);
    try {
      const data = await fetchJSON("/api/user-management/garages");
      setGarages(Array.isArray(data?.garages) ? data.garages : []);
    } catch (error) {
      console.error("โหลดรายชื่ออู่ไม่สำเร็จ", error);
      setGarages([]);
    } finally {
      setIsLoadingGarages(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadFactories();
    loadDepartments();
    loadDivisions();
    loadDrivers();
    loadVehicles();
    loadGarages();
  }, [loadUsers, loadFactories, loadDepartments, loadDivisions, loadDrivers, loadVehicles, loadGarages]);

  useEffect(() => {
    if (!isDepartmentModalOpen) {
      return;
    }

    if (factories.length && !departmentForm.factoryId) {
      setDepartmentForm((prev) => ({ ...prev, factoryId: String(factories[0].id) }));
      return;
    }

    const selectedFactoryId = Number(departmentForm.factoryId);
    if (!selectedFactoryId) {
      return;
    }

    if (!departmentForm.divisionId) {
      const availableDivisions = divisions.filter(
        (division) => Number(division.factoryId) === selectedFactoryId
      );
      if (availableDivisions.length) {
        setDepartmentForm((prev) => ({ ...prev, divisionId: String(availableDivisions[0].id) }));
      }
    }
  }, [isDepartmentModalOpen, factories, departmentForm.factoryId, departmentForm.divisionId, divisions]);

  const handleInputChange = (field) => (event) => {
    const { value } = event.target;
    setUserForm((prev) => {
      if (field === "role") {
        return {
          ...prev,
          [field]: value,
          email: value === "admin" ? prev.email : "",
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleFactorySelectChange = (event) => {
    const { value } = event.target;
    setUserForm((prev) => ({
      ...prev,
      factory: value,
      division: "",
      department: "",
    }));
  };

  const handleDivisionSelectChange = (event) => {
    const { value } = event.target;
    setUserForm((prev) => ({
      ...prev,
      division: value,
      department: "",
    }));
  };

  const handleDepartmentSelectChange = (event) => {
    const { value } = event.target;
    setUserForm((prev) => ({
      ...prev,
      department: value,
    }));
  };

  const handleGarageInputChange = (field) => (event) => {
    const { value } = event.target;
    setGarageForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const divisionOptions = useMemo(() => {
    const factoryId = Number(userForm.factory);
    if (!factoryId) return [];
    return divisions.filter((division) => Number(division.factoryId) === factoryId);
  }, [divisions, userForm.factory]);

  const departmentOptions = useMemo(() => {
    const divisionId = Number(userForm.division);
    if (!divisionId) return [];
    return departments.filter((department) => Number(department.divisionId) === divisionId);
  }, [departments, userForm.division]);

  const departmentModalDivisionOptions = useMemo(() => {
    const factoryId = Number(departmentForm.factoryId);
    if (!factoryId) return [];
    return divisions.filter((division) => Number(division.factoryId) === factoryId);
  }, [divisions, departmentForm.factoryId]);

  const shouldShowEmailField = userForm.role === "admin";

  const handleSubmitUser = async (event) => {
    event.preventDefault();
    if (isSubmittingUser) return;
    setUserFormError("");

    const isEditing = userModalMode === "edit";
    const editingSuperAdmin = isEditing && isEditingSuperAdmin;
    const username = userForm.username.trim();
    const password = userForm.password.trim();
    const role = userForm.role;
    const email = userForm.email.trim();
    const factoryId = userForm.factory ? Number(userForm.factory) : null;
    const departmentId = userForm.department ? Number(userForm.department) : null;
    const divisionId = userForm.division ? Number(userForm.division) : null;

    if (!username) {
      setUserFormError("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    if (!role) {
      setUserFormError("กรุณาเลือกบทบาทผู้ใช้");
      return;
    }

    if (!editingSuperAdmin) {
      if (!factoryId || !divisionId || !departmentId) {
        setUserFormError("กรุณาเลือกโรงงาน ฝ่าย และแผนก");
        return;
      }
    }

    if (!isEditing && !password) {
      setUserFormError("กรุณากรอกรหัสผ่าน");
      return;
    }

    const payload = {
      username,
      role,
    };

    if (!editingSuperAdmin) {
      payload.factoryId = factoryId;
      payload.departmentId = departmentId;
      payload.divisionId = divisionId;
    }

    if (role === "admin") {
      payload.email = email || null;
    }

    if (!isEditing || password) {
      payload.password = password;
    }

    setIsSubmittingUser(true);
    try {
      if (isEditing) {
        if (!editingUserId) {
          throw new Error("ไม่พบรหัสผู้ใช้");
        }
        await putJSON("/api/user-management/users", {
          id: editingUserId,
          ...payload,
        });
      } else {
        await postJSON("/api/user-management/users", payload);
      }
      await loadUsers();
      handleCloseUserModal();
    } catch (error) {
      console.error(isEditing ? "แก้ไขผู้ใช้ไม่สำเร็จ" : "เพิ่มผู้ใช้ไม่สำเร็จ", error);
      setUserFormError(
        error?.message || (isEditing ? "ไม่สามารถแก้ไขผู้ใช้ได้" : "ไม่สามารถเพิ่มผู้ใช้ได้")
      );
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
      if (factoryModalMode === "edit") {
        if (!editingFactoryId) {
          throw new Error("ไม่พบรหัสโรงงาน");
        }
        await putJSON("/api/user-management/factories", { id: editingFactoryId, name });
      } else {
        await postJSON("/api/user-management/factories", { name });
      }
      await loadFactories();
      await loadDepartments();
      await loadDivisions();
      await loadUsers();
      handleCloseFactoryModal();
    } catch (error) {
      console.error(
        factoryModalMode === "edit" ? "แก้ไขโรงงานไม่สำเร็จ" : "เพิ่มโรงงานไม่สำเร็จ",
        error
      );
      setFactoryFormError(
        error?.message || (factoryModalMode === "edit" ? "ไม่สามารถแก้ไขโรงงานได้" : "ไม่สามารถเพิ่มโรงงานได้")
      );
    } finally {
      setIsSubmittingFactory(false);
    }
  };

  const handleSubmitDepartment = async (event) => {
    event.preventDefault();
    if (isSubmittingDepartment) return;
    setDepartmentFormError("");

    const factoryId = Number(departmentForm.factoryId);
    const divisionId = Number(departmentForm.divisionId);
    const name = departmentForm.name.trim();

    if (!factoryId) {
      setDepartmentFormError("กรุณาเลือกโรงงาน");
      return;
    }

    if (!divisionId) {
      setDepartmentFormError("กรุณาเลือกฝ่าย");
      return;
    }

    if (!name) {
      setDepartmentFormError("กรุณาระบุชื่อแผนก");
      return;
    }

    setIsSubmittingDepartment(true);
    try {
      if (departmentModalMode === "edit") {
        if (!editingDepartmentId) {
          throw new Error("ไม่พบรหัสแผนก");
        }
        await putJSON("/api/user-management/departments", {
          id: editingDepartmentId,
          factoryId,
          divisionId,
          name,
        });
      } else {
        await postJSON("/api/user-management/departments", { factoryId, divisionId, name });
      }
      await loadDepartments();
      await loadDivisions();
      await loadUsers();
      handleCloseDepartmentModal();
    } catch (error) {
      console.error(
        departmentModalMode === "edit" ? "แก้ไขแผนกไม่สำเร็จ" : "เพิ่มแผนกไม่สำเร็จ",
        error
      );
      setDepartmentFormError(
        error?.message ||
          (departmentModalMode === "edit" ? "ไม่สามารถแก้ไขแผนกได้" : "ไม่สามารถเพิ่มแผนกได้")
      );
    } finally {
      setIsSubmittingDepartment(false);
    }
  };

  const handleSubmitDivision = async (event) => {
    event.preventDefault();
    if (isSubmittingDivision) return;
    setDivisionFormError("");

    const factoryId = Number(divisionForm.factoryId);
    const name = divisionForm.name.trim();

    if (!factoryId) {
      setDivisionFormError("กรุณาเลือกโรงงาน");
      return;
    }

    if (!name) {
      setDivisionFormError("กรุณาระบุชื่อฝ่าย");
      return;
    }

    setIsSubmittingDivision(true);
    try {
      if (divisionModalMode === "edit") {
        if (!editingDivisionId) {
          throw new Error("ไม่พบรหัสฝ่าย");
        }
        await putJSON("/api/user-management/divisions", {
          id: editingDivisionId,
          factoryId,
          name,
        });
      } else {
        await postJSON("/api/user-management/divisions", { factoryId, name });
      }
      await loadDivisions();
      await loadDepartments();
      await loadUsers();
      handleCloseDivisionModal();
    } catch (error) {
      console.error(
        divisionModalMode === "edit" ? "แก้ไขฝ่ายไม่สำเร็จ" : "เพิ่มฝ่ายไม่สำเร็จ",
        error
      );
      setDivisionFormError(
        error?.message ||
          (divisionModalMode === "edit" ? "ไม่สามารถแก้ไขฝ่ายได้" : "ไม่สามารถเพิ่มฝ่ายได้")
      );
    } finally {
      setIsSubmittingDivision(false);
    }
  };

  const handleDepartmentFormFactoryChange = (event) => {
    const { value } = event.target;
    setDepartmentForm((prev) => ({ ...prev, factoryId: value, divisionId: "" }));
  };

  const handleDepartmentFormDivisionChange = (event) => {
    const { value } = event.target;
    setDepartmentForm((prev) => ({ ...prev, divisionId: value }));
  };

  const handleDivisionFactoryChange = (event) => {
    const { value } = event.target;
    setDivisionForm((prev) => ({ ...prev, factoryId: value }));
  };

  const submitFormData = async (url, method, formData) => {
    const response = await fetch(url, { method, body: formData });
    let payload = null;
    try {
      payload = await response.json();
    } catch (parseError) {
      payload = null;
    }
    if (!response.ok) {
      const error = new Error(payload?.error || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  };

  const handleSubmitDriver = async (event) => {
    event.preventDefault();
    if (isSubmittingDriver) return;
    setDriverFormError("");

    const name = driverForm.name.trim();
    const phone = driverForm.phone.trim();
    const isEdit = driverModalMode === "edit";

    if (!name) {
      setDriverFormError("กรุณาระบุชื่อพนักงานขับรถ");
      return;
    }

    if (!phone) {
      setDriverFormError("กรุณาระบุเบอร์โทรศัพท์");
      return;
    }

    if (!isEdit && !driverForm.imageFile) {
      setDriverFormError("กรุณาเลือกรูปภาพ");
      return;
    }

    if (isEdit && !editingDriverId) {
      setDriverFormError("ไม่พบรหัสพนักงานขับรถ");
      return;
    }

    const formData = new FormData();
    if (isEdit) {
      formData.append("id", String(editingDriverId));
    }
    formData.append("name", name);
    formData.append("phone", phone);
    if (driverForm.imageFile) {
      formData.append("image", driverForm.imageFile);
    }

    setIsSubmittingDriver(true);
    try {
      await submitFormData("/api/company-assets/drivers", isEdit ? "PUT" : "POST", formData);
      await loadDrivers();
      handleCloseDriverModal();
    } catch (error) {
      console.error(isEdit ? "แก้ไขพนักงานขับรถไม่สำเร็จ" : "เพิ่มพนักงานขับรถไม่สำเร็จ", error);
      setDriverFormError(
        error?.message || (isEdit ? "ไม่สามารถแก้ไขพนักงานขับรถได้" : "ไม่สามารถเพิ่มพนักงานขับรถได้")
      );
    } finally {
      setIsSubmittingDriver(false);
    }
  };

  const handleDeleteDriver = async (driver) => {
    if (!driver?.id || deletingDriverId === driver.id) return;
    const confirmed = window.confirm(`ยืนยันการลบพนักงานขับรถ ${driver.name || ""}?`);
    if (!confirmed) return;

    setDeletingDriverId(driver.id);
    try {
      await deleteJSON("/api/company-assets/drivers", { id: driver.id });
      await loadDrivers();
    } catch (error) {
      console.error("ลบพนักงานขับรถไม่สำเร็จ", error);
      window.alert(error?.message || "ไม่สามารถลบพนักงานขับรถได้");
    } finally {
      setDeletingDriverId(null);
    }
  };

  const handleSubmitVehicle = async (event) => {
    event.preventDefault();
    if (isSubmittingVehicle) return;
    setVehicleFormError("");

    const name = vehicleForm.name.trim();
    const registration = vehicleForm.registration.trim();
    const vehicleType = vehicleForm.vehicleType.trim();
    const isEdit = vehicleModalMode === "edit";

    if (!name) {
      setVehicleFormError("กรุณาระบุชื่อรถ");
      return;
    }

    if (!registration) {
      setVehicleFormError("กรุณาระบุทะเบียนรถ");
      return;
    }

    if (!vehicleType) {
      setVehicleFormError("กรุณาระบุประเภทรถ");
      return;
    }

    if (!isEdit && !vehicleForm.imageFile) {
      setVehicleFormError("กรุณาเลือกรูปภาพ");
      return;
    }

    if (isEdit && !editingVehicleId) {
      setVehicleFormError("ไม่พบรหัสรถบริษัท");
      return;
    }

    const formData = new FormData();
    if (isEdit) {
      formData.append("id", String(editingVehicleId));
    }
    formData.append("name", name);
    formData.append("registration", registration);
    formData.append("vehicleType", vehicleType);
    if (vehicleForm.imageFile) {
      formData.append("image", vehicleForm.imageFile);
    }

    setIsSubmittingVehicle(true);
    try {
      await submitFormData("/api/company-assets/vehicles", isEdit ? "PUT" : "POST", formData);
      await loadVehicles();
      handleCloseVehicleModal();
    } catch (error) {
      console.error(isEdit ? "แก้ไขรถบริษัทไม่สำเร็จ" : "เพิ่มรถบริษัทไม่สำเร็จ", error);
      setVehicleFormError(
        error?.message || (isEdit ? "ไม่สามารถแก้ไขรถบริษัทได้" : "ไม่สามารถเพิ่มรถบริษัทได้")
      );
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (!vehicle?.id || deletingVehicleId === vehicle.id) return;
    const confirmed = window.confirm(`ยืนยันการลบรถ ${vehicle.name || ""}?`);
    if (!confirmed) return;

    setDeletingVehicleId(vehicle.id);
    try {
      await deleteJSON("/api/company-assets/vehicles", { id: vehicle.id });
      await loadVehicles();
    } catch (error) {
      console.error("ลบรถบริษัทไม่สำเร็จ", error);
      window.alert(error?.message || "ไม่สามารถลบรถบริษัทได้");
    } finally {
      setDeletingVehicleId(null);
    }
  };

  const handleSubmitGarage = async (event) => {
    event.preventDefault();
    if (isSubmittingGarage) return;
    setGarageFormError("");

    const name = garageForm.name.trim();
    const address = garageForm.address.trim();
    const isEdit = garageModalMode === "edit";

    if (!name) {
      setGarageFormError("กรุณาระบุชื่ออู่");
      return;
    }

    const payload = {
      name,
      address,
    };

    setIsSubmittingGarage(true);
    try {
      if (isEdit) {
        if (!editingGarageId) {
          throw new Error("ไม่พบรหัสอู่");
        }
        await putJSON("/api/user-management/garages", {
          id: editingGarageId,
          ...payload,
        });
      } else {
        await postJSON("/api/user-management/garages", payload);
      }
      await loadGarages();
      handleCloseGarageModal();
    } catch (error) {
      console.error(isEdit ? "แก้ไขข้อมูลอู่ไม่สำเร็จ" : "เพิ่มข้อมูลอู่ไม่สำเร็จ", error);
      setGarageFormError(
        error?.message || (isEdit ? "ไม่สามารถแก้ไขข้อมูลอู่ได้" : "ไม่สามารถเพิ่มข้อมูลอู่ได้")
      );
    } finally {
      setIsSubmittingGarage(false);
    }
  };

  const handleDeleteGarage = async (garage) => {
    if (!garage?.id || deletingGarageId === garage.id) return;
    const confirmed = window.confirm(`ยืนยันการลบอู่ ${garage.name || ""}?`);
    if (!confirmed) return;

    setDeletingGarageId(garage.id);
    try {
      await deleteJSON("/api/user-management/garages", { id: garage.id });
      await loadGarages();
    } catch (error) {
      console.error("ลบข้อมูลอู่ไม่สำเร็จ", error);
      window.alert(error?.message || "ไม่สามารถลบข้อมูลอู่ได้");
    } finally {
      setDeletingGarageId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?.id || deletingUserId === user.id) return;
    const confirmed = window.confirm(`ยืนยันการลบผู้ใช้ ${user.username || ""}?`);
    if (!confirmed) return;

    setDeletingUserId(user.id);
    try {
      await deleteJSON("/api/user-management/users", { id: user.id });
      await loadUsers();
    } catch (error) {
      console.error("ลบผู้ใช้ไม่สำเร็จ", error);
      window.alert(error?.message || "ไม่สามารถลบผู้ใช้ได้");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteFactory = async (factory) => {
    if (!factory?.id || deletingFactoryId === factory.id) return;
    const confirmed = window.confirm(`ยืนยันการลบโรงงาน ${factory.name || ""}?`);
    if (!confirmed) return;

    setDeletingFactoryId(factory.id);
    try {
      await deleteJSON("/api/user-management/factories", { id: factory.id });
      await loadFactories();
      await loadDepartments();
      await loadDivisions();
      await loadUsers();
    } catch (error) {
      console.error("ลบโรงงานไม่สำเร็จ", error);
      window.alert(error?.message || "ไม่สามารถลบโรงงานได้");
    } finally {
      setDeletingFactoryId(null);
    }
  };

  const handleDeleteDepartment = async (department) => {
    if (!department?.id || deletingDepartmentId === department.id) return;
    const confirmed = window.confirm(`ยืนยันการลบแผนก ${department.name || ""}?`);
    if (!confirmed) return;

    setDeletingDepartmentId(department.id);
    try {
      await deleteJSON("/api/user-management/departments", { id: department.id });
      await loadDepartments();
      await loadDivisions();
      await loadUsers();
    } catch (error) {
      console.error("ลบแผนกไม่สำเร็จ", error);
      window.alert(error?.message || "ไม่สามารถลบแผนกได้");
    } finally {
      setDeletingDepartmentId(null);
    }
  };

  const handleDeleteDivision = async (division) => {
    if (!division?.id || deletingDivisionId === division.id) return;
    const confirmed = window.confirm(`ยืนยันการลบฝ่าย ${division.name || ""}?`);
    if (!confirmed) return;

    setDeletingDivisionId(division.id);
    try {
      await deleteJSON("/api/user-management/divisions", { id: division.id });
      await loadDivisions();
      await loadUsers();
    } catch (error) {
      console.error("ลบฝ่ายไม่สำเร็จ", error);
      window.alert(error?.message || "ไม่สามารถลบฝ่ายได้");
    } finally {
      setDeletingDivisionId(null);
    }
  };

  const canAddDivision = factories.length > 0;
  const canAddDepartment = factories.length > 0 && divisions.length > 0;

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
                <th style={{ ...styles.tableHeadCell, width: "18%" }}>ฝ่าย</th>
                <th style={{ ...styles.tableHeadCell, width: "16%" }}>แผนก</th>
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
                  const isSuperAdmin = isSuperAdminUser(user);
                  return (
                    <tr key={user.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <span style={styles.userCell}>
                          <FaUserLarge size={24} color="#8fa3c7" />
                          <span style={styles.userMeta}>
                            <span>{user.username}</span>
                          </span>
                        </span>
                      </td>
                      <td style={styles.tableCell}>{ROLE_LABELS[user.role] || user.role || "-"}</td>
                      <td style={styles.tableCell}>{user.factoryName || "-"}</td>
                      <td style={styles.tableCell}>{user.divisionName || "-"}</td>
                      <td style={styles.tableCell}>{user.departmentName || "-"}</td>
                      <td style={{ ...styles.tableCell, textAlign: "center" }}>
                        <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                          <button
                            type="button"
                            style={styles.actionButton("primary")}
                            onClick={() => handleOpenEditUserModal(user)}
                          >
                            <FaPenToSquare size={14} /> แก้ไข
                          </button>
                          {!isSuperAdmin && (
                            <button
                              type="button"
                              style={{
                                ...styles.actionButton("danger"),
                                opacity: deletingUserId === user.id ? 0.6 : 1,
                                cursor: deletingUserId === user.id ? "not-allowed" : "pointer",
                              }}
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingUserId === user.id}
                            >
                              <FaTrashCan size={14} />
                              {deletingUserId === user.id ? " กำลังลบ..." : " ลบ"}
                            </button>
                          )}
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
                        <button
                          type="button"
                          style={styles.actionButton("primary")}
                          onClick={() => handleOpenEditFactoryModal(factory)}
                        >
                          <FaPenToSquare size={14} /> แก้ไข
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton("danger"),
                            opacity: deletingFactoryId === factory.id ? 0.6 : 1,
                            cursor: deletingFactoryId === factory.id ? "not-allowed" : "pointer",
                          }}
                          onClick={() => handleDeleteFactory(factory)}
                          disabled={deletingFactoryId === factory.id}
                        >
                          <FaTrashCan size={14} />
                          {deletingFactoryId === factory.id ? " กำลังลบ..." : " ลบ"}
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
              title={canAddDivision ? undefined : "กรุณาเพิ่มโรงงานก่อน"}
            >
              <FaPeopleGroup size={16} /> เพิ่มฝ่าย
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "45%" }}>ชื่อฝ่าย</th>
                <th style={{ ...styles.tableHeadCell, width: "35%" }}>โรงงาน</th>
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
                      {division.factoryName ||
                        factories.find((factory) => factory.id === division.factoryId)?.name ||
                        "-"}
                    </td>
                    <td style={{ ...styles.tableCell, textAlign: "center" }}>
                      <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                        <button
                          type="button"
                          style={styles.actionButton("primary")}
                          onClick={() => handleOpenEditDivisionModal(division)}
                        >
                          <FaPenToSquare size={14} /> แก้ไข
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton("danger"),
                            opacity: deletingDivisionId === division.id ? 0.6 : 1,
                            cursor: deletingDivisionId === division.id ? "not-allowed" : "pointer",
                          }}
                          onClick={() => handleDeleteDivision(division)}
                          disabled={deletingDivisionId === division.id}
                        >
                          <FaTrashCan size={14} />
                          {deletingDivisionId === division.id ? " กำลังลบ..." : " ลบ"}
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
              title={canAddDepartment ? undefined : "กรุณาเพิ่มโรงงานและฝ่ายก่อน"}
            >
              <FaBuilding size={16} /> เพิ่มแผนก
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "30%" }}>ชื่อแผนก</th>
                <th style={{ ...styles.tableHeadCell, width: "30%" }}>ฝ่าย</th>
                <th style={{ ...styles.tableHeadCell, width: "20%" }}>โรงงาน</th>
                <th style={{ ...styles.tableHeadCell, width: "20%", textAlign: "center" }}>
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
                    <td style={styles.tableCell}>
                      {department.divisionName ||
                        divisions.find((division) => division.id === department.divisionId)?.name ||
                        "-"}
                    </td>
                    <td style={styles.tableCell}>
                      {department.factoryName ||
                        factories.find((factory) => factory.id === department.factoryId)?.name ||
                        "-"}
                    </td>
                    <td style={{ ...styles.tableCell, textAlign: "center" }}>
                      <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                        <button
                          type="button"
                          style={styles.actionButton("primary")}
                          onClick={() => handleOpenEditDepartmentModal(department)}
                        >
                          <FaPenToSquare size={14} /> แก้ไข
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton("danger"),
                            opacity: deletingDepartmentId === department.id ? 0.6 : 1,
                            cursor: deletingDepartmentId === department.id ? "not-allowed" : "pointer",
                          }}
                          onClick={() => handleDeleteDepartment(department)}
                          disabled={deletingDepartmentId === department.id}
                        >
                          <FaTrashCan size={14} />
                          {deletingDepartmentId === department.id ? " กำลังลบ..." : " ลบ"}
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
              <FaScrewdriverWrench size={22} /> รายชื่ออู่
            </span>
            <button type="button" style={styles.actionButton("ghost")} onClick={handleOpenGarageModal}>
              <FaScrewdriverWrench size={16} /> เพิ่มอู่ซ่อมรถ
            </button>
          </header>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeadCell, width: "78%" }}>ชื่ออู่</th>
                <th style={{ ...styles.tableHeadCell, width: "22%", textAlign: "center" }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingGarages ? (
                <tr>
                  <td colSpan={2} style={styles.tableEmpty}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : garages.length === 0 ? (
                <tr>
                  <td colSpan={2} style={styles.tableEmpty}>
                    ยังไม่มีรายชื่ออู่
                  </td>
                </tr>
              ) : (
                garages.map((garage) => (
                  <tr key={garage.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.userCell}>
                        <FaScrewdriverWrench size={22} color="#8fa3c7" />
                        <span style={styles.userMeta}>
                          <span>{garage.name}</span>
                          {garage.address ? (
                            <span style={styles.userMetaSecondary}>{garage.address}</span>
                          ) : null}
                        </span>
                      </span>
                    </td>
                    <td style={{ ...styles.tableCell, textAlign: "center" }}>
                      <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                        <button
                          type="button"
                          style={styles.actionButton("primary")}
                          onClick={() => handleOpenEditGarageModal(garage)}
                        >
                          <FaPenToSquare size={14} /> แก้ไข
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton("danger"),
                            opacity: deletingGarageId === garage.id ? 0.6 : 1,
                            cursor: deletingGarageId === garage.id ? "not-allowed" : "pointer",
                          }}
                          onClick={() => handleDeleteGarage(garage)}
                          disabled={deletingGarageId === garage.id}
                        >
                          <FaTrashCan size={14} />
                          {deletingGarageId === garage.id ? " กำลังลบ..." : " ลบ"}
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
            <button type="button" style={styles.actionButton("ghost")} onClick={handleOpenDriverModal}>
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
              {isLoadingDrivers ? (
                <tr>
                  <td colSpan={3} style={styles.tableEmpty}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={styles.tableEmpty}>
                    ยังไม่มีข้อมูลพนักงานขับรถ
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.userCell}>
                        <FaUserTie size={22} color="#8fa3c7" />
                        {driver.name}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{driver.phone || "-"}</td>
                    <td style={{ ...styles.tableCell, textAlign: "center" }}>
                      <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                        <button
                          type="button"
                          style={styles.actionButton("primary")}
                          onClick={() => handleOpenEditDriverModal(driver)}
                        >
                          <FaPenToSquare size={14} /> แก้ไข
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton("ghost"),
                            opacity: driver.photoUrl ? 1 : 0.5,
                            pointerEvents: driver.photoUrl ? "auto" : "none",
                          }}
                          onClick={() => openImagePreview(driver.name, driver.photoUrl)}
                          disabled={!driver.photoUrl}
                        >
                          <FaRegImages size={14} /> ดูรูป
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton("danger"),
                            opacity: deletingDriverId === driver.id ? 0.6 : 1,
                            cursor: deletingDriverId === driver.id ? "not-allowed" : "pointer",
                          }}
                          onClick={() => handleDeleteDriver(driver)}
                          disabled={deletingDriverId === driver.id}
                        >
                          <FaTrashCan size={14} />
                          {deletingDriverId === driver.id ? " กำลังลบ..." : " ลบ"}
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
              <FaCarSide size={22} /> รถบริษัท
            </span>
            <button type="button" style={styles.actionButton("ghost")} onClick={handleOpenVehicleModal}>
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
              {isLoadingVehicles ? (
                <tr>
                  <td colSpan={4} style={styles.tableEmpty}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={4} style={styles.tableEmpty}>
                    ยังไม่มีข้อมูลรถบริษัท
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.userCell}>
                        <FaCarSide size={22} color="#8fa3c7" />
                        {vehicle.name}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{vehicle.registration}</td>
                    <td style={styles.tableCell}>{vehicle.vehicleType}</td>
                    <td style={{ ...styles.tableCell, textAlign: "center" }}>
                      <div style={{ ...styles.actionGroup, width: "100%", justifyContent: "center" }}>
                        <button
                          type="button"
                          style={styles.actionButton("primary")}
                          onClick={() => handleOpenEditVehicleModal(vehicle)}
                        >
                          <FaPenToSquare size={14} /> แก้ไข
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton("ghost"),
                            opacity: vehicle.photoUrl ? 1 : 0.5,
                            pointerEvents: vehicle.photoUrl ? "auto" : "none",
                          }}
                          onClick={() => openImagePreview(vehicle.name, vehicle.photoUrl)}
                          disabled={!vehicle.photoUrl}
                        >
                          <FaRegImages size={14} /> ดูรูป
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton("danger"),
                            opacity: deletingVehicleId === vehicle.id ? 0.6 : 1,
                            cursor: deletingVehicleId === vehicle.id ? "not-allowed" : "pointer",
                          }}
                          onClick={() => handleDeleteVehicle(vehicle)}
                          disabled={deletingVehicleId === vehicle.id}
                        >
                          <FaTrashCan size={14} />
                          {deletingVehicleId === vehicle.id ? " กำลังลบ..." : " ลบ"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      {isUserModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseUserModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitUser}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                {userModalMode === "edit" ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}
              </span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={handleCloseUserModal}
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
                  required={userModalMode === "create"}
                  placeholder={
                    userModalMode === "edit" ? "เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน" : undefined
                  }
                />
                {userModalMode === "edit" && (
                  <p style={styles.helperText}>หากไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่างไว้</p>
                )}
              </div>

              {shouldShowEmailField && (
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel} htmlFor="user-email">
                    E-mail
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    style={styles.input}
                    value={userForm.email}
                    onChange={handleInputChange("email")}
                    placeholder="example@company.com"
                  />
                </div>
              )}

              {!isEditingSuperAdmin && (
                <>
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
                    <label style={styles.fieldLabel} htmlFor="user-division">
                      ฝ่าย
                    </label>
                    <select
                      id="user-division"
                      style={styles.select}
                      value={userForm.division}
                      onChange={handleDivisionSelectChange}
                      required
                      disabled={!userForm.factory || divisionOptions.length === 0}
                    >
                      <option value="" disabled>
                        {userForm.factory ? "เลือกฝ่าย" : "เลือกโรงงานก่อน"}
                      </option>
                      {divisionOptions.map((division) => (
                        <option key={division.id} value={String(division.id)}>
                          {division.name}
                        </option>
                      ))}
                    </select>
                    {userForm.factory && divisionOptions.length === 0 && (
                      <p style={styles.helperText}>ยังไม่มีฝ่ายในโรงงานนี้</p>
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
                      disabled={!userForm.division || departmentOptions.length === 0}
                    >
                      <option value="" disabled>
                        {userForm.division ? "เลือกแผนก" : "เลือกฝ่ายก่อน"}
                      </option>
                      {departmentOptions.map((department) => (
                        <option key={department.id} value={String(department.id)}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {userForm.division && departmentOptions.length === 0 && (
                      <p style={styles.helperText}>ยังไม่มีแผนกในฝ่ายนี้</p>
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
                </>
              )}
            </div>

            {userFormError && <p style={{ ...styles.errorText, padding: "0 26px" }}>{userFormError}</p>}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseUserModal}
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
                {isSubmittingUser
                  ? "กำลังบันทึก..."
                  : userModalMode === "edit"
                    ? "บันทึกการแก้ไข"
                    : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isFactoryModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseFactoryModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitFactory}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                {factoryModalMode === "edit" ? "แก้ไขโรงงาน" : "เพิ่มโรงงาน"}
              </span>
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
                  onChange={(event) =>
                    setFactoryForm((prev) => ({ ...prev, name: event.target.value }))
                  }
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
                {isSubmittingFactory
                  ? "กำลังบันทึก..."
                  : factoryModalMode === "edit"
                    ? "บันทึกการแก้ไข"
                    : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isDepartmentModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseDepartmentModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitDepartment}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                {departmentModalMode === "edit" ? "แก้ไขแผนก" : "เพิ่มแผนก"}
              </span>
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
                <label style={styles.fieldLabel} htmlFor="department-division">
                  ฝ่าย
                </label>
                <select
                  id="department-division"
                  style={styles.select}
                  value={departmentForm.divisionId}
                  onChange={handleDepartmentFormDivisionChange}
                  disabled={!departmentForm.factoryId || departmentModalDivisionOptions.length === 0}
                  required
                >
                  <option value="" disabled>
                    เลือกฝ่าย
                  </option>
                  {departmentModalDivisionOptions.map((division) => (
                    <option key={division.id} value={String(division.id)}>
                      {division.name}
                    </option>
                  ))}
                </select>
                {departmentForm.factoryId && departmentModalDivisionOptions.length === 0 && (
                  <span style={styles.helperText}>ยังไม่มีฝ่ายในโรงงานนี้</span>
                )}
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
                {isSubmittingDepartment
                  ? "กำลังบันทึก..."
                  : departmentModalMode === "edit"
                    ? "บันทึกการแก้ไข"
                    : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isDivisionModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseDivisionModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitDivision}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                {divisionModalMode === "edit" ? "แก้ไขฝ่าย" : "เพิ่มฝ่าย"}
              </span>
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
                  disabled={!divisionForm.factoryId}
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
                {isSubmittingDivision
                  ? "กำลังบันทึก..."
                  : divisionModalMode === "edit"
                    ? "บันทึกการแก้ไข"
                    : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isGarageModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseGarageModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitGarage}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                {garageModalMode === "edit" ? "แก้ไขข้อมูลอู่" : "เพิ่มอู่ซ่อมรถ"}
              </span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={handleCloseGarageModal}
                aria-label="ปิดหน้าต่าง"
              >
                ×
              </button>
            </header>

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="garage-name">
                  ชื่ออู่
                </label>
                <input
                  id="garage-name"
                  type="text"
                  style={styles.input}
                  value={garageForm.name}
                  onChange={handleGarageInputChange("name")}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="garage-address">
                  ที่อยู่ (ถ้ามี)
                </label>
                <textarea
                  id="garage-address"
                  style={styles.textarea}
                  value={garageForm.address}
                  onChange={handleGarageInputChange("address")}
                  placeholder="บ้านเลขที่ / ถนน / เขต / จังหวัด"
                />
              </div>
            </div>

            {garageFormError && (
              <p style={{ ...styles.errorText, padding: "0 26px" }}>{garageFormError}</p>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseGarageModal}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  ...styles.actionButton("primary"),
                  opacity: isSubmittingGarage ? 0.7 : 1,
                  pointerEvents: isSubmittingGarage ? "none" : "auto",
                }}
                disabled={isSubmittingGarage}
              >
                {isSubmittingGarage
                  ? "กำลังบันทึก..."
                  : garageModalMode === "edit"
                    ? "บันทึกการแก้ไข"
                    : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isDriverModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseDriverModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitDriver}
            encType="multipart/form-data"
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                {driverModalMode === "edit" ? "แก้ไขพนักงานขับรถ" : "เพิ่มพนักงานขับรถ"}
              </span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={handleCloseDriverModal}
                aria-label="ปิดหน้าต่าง"
              >
                ×
              </button>
            </header>

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="driver-name">
                  ชื่อพนักงานขับรถ
                </label>
                <input
                  id="driver-name"
                  type="text"
                  style={styles.input}
                  value={driverForm.name}
                  onChange={(event) =>
                    setDriverForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="driver-phone">
                  เบอร์โทรศัพท์
                </label>
                <input
                  id="driver-phone"
                  type="tel"
                  style={styles.input}
                  value={driverForm.phone}
                  onChange={(event) =>
                    setDriverForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="driver-image">
                  รูปภาพพนักงานขับรถ
                </label>
                <input
                  id="driver-image"
                  type="file"
                  accept="image/png,image/jpeg"
                  style={styles.input}
                  onChange={handleDriverImageChange}
                />
                <p style={styles.helperText}>รองรับไฟล์ JPG หรือ PNG ขนาดไม่เกิน 5 MB</p>
                {driverModalMode === "edit" && (
                  <p style={styles.helperText}>หากไม่ต้องการเปลี่ยนรูป ให้เว้นว่างไว้</p>
                )}
                {driverForm.imagePreview && (
                  <Image
                    src={driverForm.imagePreview}
                    alt={driverForm.name ? `ตัวอย่างรูปของ ${driverForm.name}` : "ตัวอย่างรูปพนักงาน"}
                    width={600}
                    height={400}
                    style={styles.imagePreview}
                    unoptimized
                  />
                )}
              </div>
            </div>

            {driverFormError && (
              <p style={{ ...styles.errorText, padding: "0 26px" }}>{driverFormError}</p>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseDriverModal}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  ...styles.actionButton("primary"),
                  opacity: isSubmittingDriver ? 0.7 : 1,
                  pointerEvents: isSubmittingDriver ? "none" : "auto",
                }}
                disabled={isSubmittingDriver}
              >
                {isSubmittingDriver
                  ? "กำลังบันทึก..."
                  : driverModalMode === "edit"
                    ? "บันทึกการแก้ไข"
                    : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isVehicleModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseVehicleModal}>
          <form
            style={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmitVehicle}
            encType="multipart/form-data"
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                {vehicleModalMode === "edit" ? "แก้ไขรถบริษัท" : "เพิ่มรถบริษัท"}
              </span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={handleCloseVehicleModal}
                aria-label="ปิดหน้าต่าง"
              >
                ×
              </button>
            </header>

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="vehicle-name">
                  ชื่อรถ
                </label>
                <input
                  id="vehicle-name"
                  type="text"
                  style={styles.input}
                  value={vehicleForm.name}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="vehicle-registration">
                  ทะเบียนรถ
                </label>
                <input
                  id="vehicle-registration"
                  type="text"
                  style={styles.input}
                  value={vehicleForm.registration}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, registration: event.target.value }))
                  }
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="vehicle-type">
                  ประเภทรถ
                </label>
                <input
                  id="vehicle-type"
                  type="text"
                  style={styles.input}
                  value={vehicleForm.vehicleType}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, vehicleType: event.target.value }))
                  }
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="vehicle-image">
                  รูปรถบริษัท
                </label>
                <input
                  id="vehicle-image"
                  type="file"
                  accept="image/png,image/jpeg"
                  style={styles.input}
                  onChange={handleVehicleImageChange}
                />
                <p style={styles.helperText}>รองรับไฟล์ JPG หรือ PNG ขนาดไม่เกิน 5 MB</p>
                {vehicleModalMode === "edit" && (
                  <p style={styles.helperText}>หากไม่ต้องการเปลี่ยนรูป ให้เว้นว่างไว้</p>
                )}
                {vehicleForm.imagePreview && (
                  <Image
                    src={vehicleForm.imagePreview}
                    alt={vehicleForm.name ? `ตัวอย่างรูปของ ${vehicleForm.name}` : "ตัวอย่างรูปรถ"}
                    width={600}
                    height={400}
                    style={styles.imagePreview}
                    unoptimized
                  />
                )}
              </div>
            </div>

            {vehicleFormError && (
              <p style={{ ...styles.errorText, padding: "0 26px" }}>{vehicleFormError}</p>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.actionButton("ghost")}
                onClick={handleCloseVehicleModal}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  ...styles.actionButton("primary"),
                  opacity: isSubmittingVehicle ? 0.7 : 1,
                  pointerEvents: isSubmittingVehicle ? "none" : "auto",
                }}
                disabled={isSubmittingVehicle}
              >
                {isSubmittingVehicle
                  ? "กำลังบันทึก..."
                  : vehicleModalMode === "edit"
                    ? "บันทึกการแก้ไข"
                    : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      )}

      {imagePreviewModal.isOpen && imagePreviewModal.url && (
        <div style={styles.modalOverlay} onClick={closeImagePreview}>
          <div
            style={{ ...styles.modalContent, maxWidth: "640px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <header style={styles.modalHeader}>
              <span style={styles.modalTitle}>{imagePreviewModal.title || "ดูรูปภาพ"}</span>
              <button
                type="button"
                style={styles.modalClose}
                onClick={closeImagePreview}
                aria-label="ปิดหน้าต่าง"
              >
                ×
              </button>
            </header>
            <div style={{ padding: "24px 26px" }}>
              <Image
                src={imagePreviewModal.url}
                alt={imagePreviewModal.title || "แสดงตัวอย่างรูปภาพ"}
                width={640}
                height={460}
                style={{
                  ...styles.imagePreview,
                  maxHeight: "460px",
                  objectFit: "contain",
                  backgroundColor: "#f5f8ff",
                }}
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
