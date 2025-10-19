"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_ROLE, ROLE_LABELS, getMenuItemsForRole, normalizeRole } from "@/lib/menuItems";
import { fetchJSON, postJSON } from "@/lib/http";
import {
  FaCarSide,
  FaLocationDot,
  FaClipboardList,
  FaUsers,
  FaChevronRight,
} from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";
import CargoAttachmentsInput from "@/components/CargoAttachmentsInput";

const colors = {
  primary: "#0c4aa1",
  sidebarBg: "#0d4fa6",
  sidebarActive: "#0a3d80",
  accent: "#f4f8ff",
  border: "#c7d6f3",
  textDark: "#0f274f",
  textLight: "#5c6f9c",
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#e9f1ff",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
  },
  sidebar: {
    width: "280px",
    backgroundColor: colors.sidebarBg,
    color: "#ffffff",
    padding: "26px 22px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxShadow: "4px 0 20px rgba(10, 32, 74, 0.22)",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#08386e",
    color: "#ffffff",
    borderRadius: "14px",
    border: "none",
    padding: "10px 18px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  languageToggle: {
    marginLeft: "auto",
    backgroundColor: "#ffffff",
    color: colors.primary,
    borderRadius: "12px",
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
  },
  menuTitle: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.6px",
    marginBottom: "8px",
  },
  menuList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  menuItem: (active = false) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 16px",
    borderRadius: "16px",
    backgroundColor: active ? colors.sidebarActive : "transparent",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: active ? "700" : "600",
    letterSpacing: "0.4px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  }),
  menuIcon: {
    width: "28px",
    height: "28px",
  },
  contentArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "28px 32px 36px",
    gap: "22px",
  },
  topBar: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "18px 28px",
    boxShadow: "0 12px 24px rgba(15, 59, 124, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: colors.primary,
    fontSize: "24px",
    fontWeight: "800",
  },
  welcome: {
    color: colors.primary,
    fontSize: "18px",
    fontWeight: "700",
  },
  body: {
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    padding: "32px",
    boxShadow: "0 12px 28px rgba(15, 59, 124, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    width: "100%",
  },
  mainForm: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
  },
  sectionCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    backgroundColor: colors.accent,
    padding: "22px 24px",
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
    color: colors.primary,
  },
  formGrid: (columns = 3) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: "18px",
  }),
  label: {
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  input: {
    width: "100%",
    height: "44px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.border}`,
    padding: "0 14px",
    fontSize: "15px",
    color: colors.textDark,
    backgroundColor: "#ffffff",
  },
  textarea: {
    width: "100%",
    minHeight: "76px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.border}`,
    padding: "12px 14px",
    fontSize: "15px",
    color: colors.textDark,
    backgroundColor: "#ffffff",
  },
  fileUpload: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  fileButton: {
    padding: "10px 16px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.primary}`,
    backgroundColor: "#ffffff",
    color: colors.primary,
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  asideActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "8px",
    width: "100%",
  },
  formFooter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    width: "100%",
    marginTop: "16px",
    gap: "8px",
  },
  bookingFieldWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  bookingPicker: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "6px",
    backgroundColor: "#ffffff",
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    boxShadow: "0 12px 24px rgba(15, 59, 124, 0.18)",
    maxHeight: "280px",
    overflowY: "auto",
    zIndex: 30,
    display: "flex",
    flexDirection: "column",
  },
  bookingOption: {
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
  },
  bookingOptionHover: {
    backgroundColor: "#f3f7ff",
  },
  bookingOptionTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "700",
    color: colors.textDark,
    fontSize: "15px",
  },
  bookingOptionMeta: {
    fontSize: "13px",
    color: colors.textLight,
  },
  bookingStatusBadge: {
    padding: "4px 10px",
    borderRadius: "999px",
    backgroundColor: "#ffec99",
    color: "#8c6d1f",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  actionButton: (variant = "primary") => ({
    minWidth: "180px",
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    fontSize: "18px",
    fontWeight: "800",
    color: variant === "dark" ? "#ffffff" : colors.primary,
    backgroundColor:
      variant === "primary"
        ? "#e6f0ff"
        : variant === "outline"
        ? "#ffffff"
        : "#0b3d80",
    boxShadow: variant === "dark" ? "0 10px 24px rgba(11, 61, 128, 0.35)" : "none",
    border: variant === "outline" ? `1.5px solid ${colors.primary}` : "none",
    cursor: "pointer",
  }),
  row: {
    display: "flex",
    gap: "18px",
  },
  routeSection: {
    borderRadius: "22px",
    backgroundColor: "#ffffff",
    padding: "24px 26px",
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  routeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "20px",
    fontWeight: "800",
    color: colors.primary,
  },
  routeIconWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    backgroundColor: "#ecf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.primary,
  },
  routeDescription: {
    margin: 0,
    color: colors.textLight,
    fontSize: "14px",
  },
  pointCards: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },
  pointCard: {
    backgroundColor: "#fafdff",
    borderRadius: "20px",
    border: `2px solid ${colors.border}`,
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  pointHeaderBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  pointHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: colors.primary,
  },
  pointNote: {
    margin: 0,
    fontSize: "13px",
    color: colors.textLight,
  },
  pointTabs: {
    display: "flex",
    gap: "10px",
  },
  pointTab: (active = false) => ({
    padding: "6px 18px",
    borderRadius: "18px",
    border: active ? "2px solid #1b5ec2" : `1px solid ${colors.border}`,
    backgroundColor: active ? "#eef4ff" : "#f8faff",
    color: active ? colors.primary : colors.textLight,
    fontSize: "14px",
    fontWeight: "700",
  }),
  pointTabLabel: {
    display: "flex",
    alignItems: "center",
    padding: "6px 0",
    color: colors.textLight,
    fontSize: "14px",
    fontWeight: "700",
  },
  pointGridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  pointGridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  pointGridOne: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
  },
  subSectionLabel: {
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
    marginTop: "4px",
  },
  bottomNote: {
    margin: 0,
    fontSize: "13px",
    color: colors.textLight,
    textAlign: "right",
  },
  helperText: {
    fontSize: "13px",
    color: colors.textLight,
    marginTop: "6px",
  },
  errorText: {
    margin: "0 0 12px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#c0392b",
  },
  disabledCard: {
    opacity: 0.6,
    pointerEvents: "none",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "rgba(15, 39, 79, 0.45)",
    zIndex: 9999,
  },
  modalCard: {
    width: "100%",
    maxWidth: "520px",
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    boxShadow: "0 24px 48px rgba(11, 61, 128, 0.28)",
  },
  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: colors.primary,
  },
  modalLabel: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
  },
  modalEmailValue: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: colors.primary,
    backgroundColor: colors.accent,
    borderRadius: "16px",
    border: `1.5px solid ${colors.border}`,
    padding: "12px 16px",
  },
  modalExtraSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  modalAddButton: {
    alignSelf: "flex-start",
    padding: "10px 16px",
    borderRadius: "14px",
    border: `1.5px solid ${colors.primary}`,
    backgroundColor: "#ffffff",
    color: colors.primary,
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "14px",
  },
};

function createEmptyPickupPoint() {
  return {
    sequenceNo: 1,
    travelDate: "",
    departTime: "",
    passengerCount: "1",
    passengerNames: "",
    locationName: "",
    district: "",
    province: "",
    flightNumber: "",
    flightTime: "",
    driverNote: "",
  };
}

function createEmptyDropOffPoint(sequenceNo = 1) {
  return {
    sequenceNo,
    travelDate: "",
    departTime: "",
    arriveTime: "",
    passengerCount: "1",
    passengerNames: "",
    locationName: "",
    district: "",
    province: "",
    flightNumber: "",
    flightTime: "",
    driverNote: "",
  };
}

function toDateInputValue(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const str = String(value);
  if (str.includes("T")) {
    return str.split("T")[0];
  }
  return str.slice(0, 10);
}

function toTimeInputValue(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(11, 16);
  }
  const str = String(value);
  return str.slice(0, 5);
}

function formatVehicleOption(vehicle) {
  if (!vehicle || typeof vehicle !== "object") {
    return "";
  }
  const registration = vehicle.registration ? String(vehicle.registration).trim() : "";
  const name = vehicle.name ? String(vehicle.name).trim() : "";
  if (registration && name) {
    return `${registration} - ${name}`;
  }
  return registration || name || `รถ ${vehicle.id}`;
}

function LabeledField({ label, required = false, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column" }}>
      <span style={styles.label}>
        {label}
        {required ? <span style={{ color: "#d24c5a" }}>*</span> : null}
      </span>
      {children}
    </label>
  );
}

export default function CompanyBookingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(DEFAULT_ROLE);
  const [profileSummary, setProfileSummary] = useState({
    name: "",
    department: "",
    factory: "",
  });
  const [factories, setFactories] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoadingOrgOptions, setIsLoadingOrgOptions] = useState(false);
  const [orgOptionsError, setOrgOptionsError] = useState("");
  const [requesterOrgForm, setRequesterOrgForm] = useState({
    factory: "",
    division: "",
    department: "",
  });
  const [cargoFiles, setCargoFiles] = useState([]);
  const [pickupPointForm, setPickupPointForm] = useState(createEmptyPickupPoint());
  const [dropOffPointForms, setDropOffPointForms] = useState([createEmptyDropOffPoint(1)]);
  const [cargoDetails, setCargoDetails] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [additionalEmails, setAdditionalEmails] = useState([""]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [isLoadingPendingBookings, setIsLoadingPendingBookings] = useState(false);
  const [pendingBookingsError, setPendingBookingsError] = useState("");
  const [showBookingPicker, setShowBookingPicker] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isLoadingBookingDetail, setIsLoadingBookingDetail] = useState(false);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [vehicleOptionsError, setVehicleOptionsError] = useState("");
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [gaVehicleId, setGaVehicleId] = useState("");
  const [gaVehicleType, setGaVehicleType] = useState("");
  const [gaDriverName, setGaDriverName] = useState("");
  const [gaDriverPhone, setGaDriverPhone] = useState("");
  const [gaStatus, setGaStatus] = useState("");
  const [gaRejectReason, setGaRejectReason] = useState("");
  const formRef = useRef(null);
  const bookingPickerRef = useRef(null);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("userRole");
      if (storedRole) {
        setUserRole(normalizeRole(storedRole));
      }
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        const nameCandidate =
          parsedProfile?.displayName ||
          parsedProfile?.fullName ||
          parsedProfile?.name ||
          parsedProfile?.username ||
          "";
        if (nameCandidate) {
          setRequesterName(nameCandidate);
        }
        setProfileSummary({
          name: nameCandidate || "",
          department:
            parsedProfile?.departmentName ||
            parsedProfile?.department ||
            "",
          factory:
            parsedProfile?.factoryName ||
            parsedProfile?.factory ||
            "",
        });
        const employeeCandidate =
          parsedProfile?.employeeId ||
          parsedProfile?.employeeCode ||
          parsedProfile?.empNo ||
          parsedProfile?.username ||
          "";
        if (employeeCandidate) {
          setEmployeeId(String(employeeCandidate));
        }
        const emailCandidate =
          parsedProfile?.email ||
          parsedProfile?.contactEmail ||
          parsedProfile?.workEmail ||
          "";
        if (emailCandidate) {
          setContactEmail(emailCandidate);
        }
        const phoneCandidate =
          parsedProfile?.phone ||
          parsedProfile?.contactPhone ||
          parsedProfile?.mobile ||
          "";
        if (phoneCandidate) {
          setContactPhone(String(phoneCandidate));
        }
      }
    } catch (error) {
      console.warn("Failed to restore stored session", error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOrgOptions() {
      setIsLoadingOrgOptions(true);
      setOrgOptionsError("");
      try {
        const [factoryData, divisionData, departmentData] = await Promise.all([
          fetchJSON("/api/user-management/factories"),
          fetchJSON("/api/user-management/divisions"),
          fetchJSON("/api/user-management/departments"),
        ]);

        if (cancelled) {
          return;
        }

        setFactories(factoryData?.factories || []);
        setDivisions(divisionData?.divisions || []);
        setDepartments(departmentData?.departments || []);

        if (!factoryData || !divisionData || !departmentData) {
          setOrgOptionsError("ไม่สามารถโหลดข้อมูลโรงงาน/ฝ่าย/แผนกได้");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("โหลดข้อมูลหน่วยงานไม่สำเร็จ", error);
          setOrgOptionsError("ไม่สามารถโหลดข้อมูลโรงงาน/ฝ่าย/แผนกได้");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrgOptions(false);
        }
      }
    }

    loadOrgOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const divisionOptions = useMemo(() => {
    const selectedFactoryId = Number(requesterOrgForm.factory);
    if (!selectedFactoryId) {
      return [];
    }
    return divisions.filter((division) => Number(division.factoryId) === selectedFactoryId);
  }, [divisions, requesterOrgForm.factory]);

  const departmentOptions = useMemo(() => {
    const selectedDivisionId = Number(requesterOrgForm.division);
    if (!selectedDivisionId) {
      return [];
    }
    return departments.filter((department) => Number(department.divisionId) === selectedDivisionId);
  }, [departments, requesterOrgForm.division]);

  const vehicleTypeOptions = useMemo(() => {
    const types = new Set();
    for (const vehicle of vehicleOptions) {
      if (vehicle?.vehicleType) {
        types.add(String(vehicle.vehicleType));
      }
    }
    return Array.from(types);
  }, [vehicleOptions]);

  const vehicleTypeOptionsWithCurrent = useMemo(() => {
    if (!gaVehicleType) {
      return vehicleTypeOptions;
    }
    if (vehicleTypeOptions.some((type) => type === gaVehicleType)) {
      return vehicleTypeOptions;
    }
    return [gaVehicleType, ...vehicleTypeOptions];
  }, [gaVehicleType, vehicleTypeOptions]);

  const normalizedRole = normalizeRole(userRole);
  const visibleMenuItems = useMemo(() => getMenuItemsForRole(normalizedRole), [normalizedRole]);
  const roleLabel = ROLE_LABELS[normalizedRole] || normalizedRole;
  const isAdmin = normalizedRole === "admin";

  const loadVehicleOptions = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    setIsLoadingVehicles(true);
    setVehicleOptionsError("");
    try {
      const response = await fetchJSON("/api/company-assets/vehicles");
      const vehicles = Array.isArray(response?.vehicles) ? response.vehicles : [];
      setVehicleOptions(vehicles);
      if (!vehicles.length) {
        setVehicleOptionsError("ไม่พบข้อมูลรถบริษัท");
      }
    } catch (error) {
      console.error("โหลดข้อมูลรถบริษัทไม่สำเร็จ", error);
      setVehicleOptions([]);
      setVehicleOptionsError("ไม่สามารถโหลดข้อมูลรถบริษัทได้");
    } finally {
      setIsLoadingVehicles(false);
    }
  }, [isAdmin]);

  const loadPendingBookings = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    setIsLoadingPendingBookings(true);
    setPendingBookingsError("");
    try {
      const response = await fetchJSON("/api/bookings/company?status=pending");
      if (!response || !Array.isArray(response.bookings)) {
        throw new Error("invalid response");
      }
      setPendingBookings(response.bookings);
    } catch (error) {
      console.error("โหลดรายการการจองที่รออนุมัติไม่สำเร็จ", error);
      setPendingBookingsError("ไม่สามารถโหลดรายการรออนุมัติได้");
    } finally {
      setIsLoadingPendingBookings(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadPendingBookings();
    } else {
      setPendingBookings([]);
      setSelectedBookingId(null);
      setShowBookingPicker(false);
      setPendingBookingsError("");
    }
  }, [isAdmin, loadPendingBookings]);

  useEffect(() => {
    if (isAdmin) {
      loadVehicleOptions();
    } else {
      setVehicleOptions([]);
      setVehicleOptionsError("");
      setGaVehicleId("");
      setGaVehicleType("");
      setGaDriverName("");
      setGaDriverPhone("");
      setGaStatus("");
      setGaRejectReason("");
    }
  }, [isAdmin, loadVehicleOptions]);

  useEffect(() => {
    if (!gaVehicleId || gaVehicleType) {
      return;
    }
    const matchedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === gaVehicleId);
    if (matchedVehicle?.vehicleType) {
      setGaVehicleType(String(matchedVehicle.vehicleType));
    }
  }, [gaVehicleId, gaVehicleType, vehicleOptions]);

  useEffect(() => {
    if (gaStatus !== "rejected" && gaRejectReason) {
      setGaRejectReason("");
    }
  }, [gaStatus, gaRejectReason]);

  useEffect(() => {
    if (!gaVehicleId) {
      return;
    }
    const exists = vehicleOptions.some((vehicle) => String(vehicle.id) === gaVehicleId);
    if (!exists) {
      setGaVehicleId("");
    }
  }, [gaVehicleId, vehicleOptions]);

  useEffect(() => {
    if (!isAdmin || !showBookingPicker) {
      return undefined;
    }
    function handleClickOutside(event) {
      if (bookingPickerRef.current && !bookingPickerRef.current.contains(event.target)) {
        setShowBookingPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdmin, showBookingPicker]);
  let welcomeText;
  if (normalizedRole === "admin") {
    welcomeText = "ผู้ดูแลระบบ";
  } else {
    const baseName = profileSummary.name || roleLabel;
    let composed = baseName;
    if (profileSummary.department) {
      composed += ` ${profileSummary.department}`;
    }
    if (profileSummary.factory) {
      composed += ` (${profileSummary.factory})`;
    } else if (!profileSummary.department && roleLabel && roleLabel !== baseName) {
      composed += ` (${roleLabel})`;
    }
    welcomeText = composed;
  }

  const handleAddDropOffPoint = () => {
    setDropOffPointForms((prev) => [...prev, createEmptyDropOffPoint(prev.length + 1)]);
  };

  const handleEmployeeIdChange = (event) => {
    setEmployeeId(event.target.value);
    if (formError) {
      setFormError("");
    }
  };

  const handleRequesterNameChange = (event) => {
    setRequesterName(event.target.value);
    if (formError) {
      setFormError("");
    }
  };

  const handleFactoryChange = (event) => {
    const { value } = event.target;
    setRequesterOrgForm((prev) => ({
      ...prev,
      factory: value,
      division: "",
      department: "",
    }));
  };

  const handleDivisionChange = (event) => {
    const { value } = event.target;
    setRequesterOrgForm((prev) => ({
      ...prev,
      division: value,
      department: "",
    }));
  };

  const handleDepartmentChange = (event) => {
    const { value } = event.target;
    setRequesterOrgForm((prev) => ({
      ...prev,
      department: value,
    }));
  };

  const handleContactEmailChange = (event) => {
    const { value } = event.target;
    setContactEmail(value);
    if (formError) {
      setFormError("");
    }
    if (confirmError) {
      setConfirmError("");
    }
  };

  const handleContactPhoneChange = (event) => {
    const { value } = event.target;
    setContactPhone(value);
    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formRef.current) {
      return;
    }
    if (!formRef.current.checkValidity()) {
      setFormError("กรุณากรอกข้อมูลให้ครบถ้วนในช่องที่มี *");
      formRef.current.reportValidity();
      return;
    }
    setFormError("");
    setConfirmError("");
    if (additionalEmails.length === 0) {
      setAdditionalEmails([""]);
    }
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    if (isSubmitting) {
      return;
    }
    setConfirmError("");
    setIsConfirmModalOpen(false);
  };

  const handleAdditionalEmailChange = (index, value) => {
    setAdditionalEmails((prev) =>
      prev.map((email, idx) => (idx === index ? value : email))
    );
    if (confirmError) {
      setConfirmError("");
    }
  };

  const handleAddAdditionalEmail = () => {
    setAdditionalEmails((prev) => [...prev, ""]);
    if (confirmError) {
      setConfirmError("");
    }
  };

  const handleCargoDetailsChange = (event) => {
    setCargoDetails(event.target.value);
    if (formError) {
      setFormError("");
    }
  };

  const handlePickupPointChange = (field, value) => {
    setPickupPointForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDropOffPointChange = (index, field, value) => {
    setDropOffPointForms((prev) =>
      prev.map((point, idx) =>
        idx === index
          ? {
              ...point,
              [field]: value,
            }
          : point
      )
    );
  };

  const handleEmployeeFieldFocus = () => {
    if (!isAdmin) {
      return;
    }
    setPendingBookingsError("");
    if (!pendingBookings.length && !isLoadingPendingBookings) {
      loadPendingBookings();
    }
    setShowBookingPicker(true);
  };

  const handleBookingOptionSelect = async (booking) => {
    setShowBookingPicker(false);
    setSelectedBookingId(booking.id);
    setEmployeeId(booking.requesterEmpNo || "");
    setRequesterName(booking.requesterName || "");
    setContactPhone(booking.contactPhone || "");
    setContactEmail(booking.contactEmail || "");
    setRequesterOrgForm({
      factory: booking.factoryId ? String(booking.factoryId) : "",
      division: booking.divisionId ? String(booking.divisionId) : "",
      department: booking.departmentId ? String(booking.departmentId) : "",
    });
    setGaVehicleId("");
    setGaVehicleType("");
    setIsLoadingBookingDetail(true);
    setPendingBookingsError("");
    try {
      const detail = await fetchJSON(`/api/bookings/company?id=${booking.id}`);
      if (!detail?.booking) {
        throw new Error("missing booking detail");
      }
      const detailData = detail.booking;
      setEmployeeId(detailData.requesterEmpNo || "");
      setRequesterName(detailData.requesterName || "");
      setContactPhone(detailData.contactPhone || "");
      setContactEmail(detailData.contactEmail || "");
      setRequesterOrgForm({
        factory: detailData.factoryId ? String(detailData.factoryId) : "",
        division: detailData.divisionId ? String(detailData.divisionId) : "",
        department: detailData.departmentId ? String(detailData.departmentId) : "",
      });
      setCargoDetails(detailData.cargoDetails || "");
      if (detailData.pickupPoints?.length) {
        const pickup = detailData.pickupPoints[0];
        setPickupPointForm({
          sequenceNo: pickup.sequenceNo || 1,
          travelDate: toDateInputValue(pickup.travelDate),
          departTime: toTimeInputValue(pickup.departTime),
          passengerCount: pickup.passengerCount ? String(pickup.passengerCount) : "",
          passengerNames: pickup.passengerNames || "",
          locationName: pickup.locationName || "",
          district: pickup.district || "",
          province: pickup.province || "",
          flightNumber: pickup.flightNumber || "",
          flightTime: toTimeInputValue(pickup.flightTime),
          driverNote: pickup.driverNote || "",
        });
      } else {
        setPickupPointForm(createEmptyPickupPoint());
      }

      if (detailData.dropOffPoints?.length) {
        const dropPoints = detailData.dropOffPoints.map((point, index) => ({
          sequenceNo: point.sequenceNo || index + 1,
          travelDate: toDateInputValue(point.travelDate),
          departTime: toTimeInputValue(point.departTime),
          arriveTime: toTimeInputValue(point.arriveTime),
          passengerCount: point.passengerCount ? String(point.passengerCount) : "",
          passengerNames: point.passengerNames || "",
          locationName: point.locationName || "",
          district: point.district || "",
          province: point.province || "",
          flightNumber: point.flightNumber || "",
          flightTime: toTimeInputValue(point.flightTime),
          driverNote: point.driverNote || "",
        }));
        setDropOffPointForms(dropPoints.length ? dropPoints : [createEmptyDropOffPoint(1)]);
      } else {
        setDropOffPointForms([createEmptyDropOffPoint(1)]);
      }

      if (detailData.additionalEmails?.length) {
        setAdditionalEmails(detailData.additionalEmails);
      } else {
        setAdditionalEmails([""]);
      }

      const detailVehicleId = detailData.gaVehicleId ? String(detailData.gaVehicleId) : "";
      setGaVehicleId(detailVehicleId);
      if (detailData.gaVehicleType) {
        setGaVehicleType(String(detailData.gaVehicleType));
      } else if (detailVehicleId) {
        const matchedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === detailVehicleId);
        setGaVehicleType(matchedVehicle?.vehicleType ? String(matchedVehicle.vehicleType) : "");
      } else {
        setGaVehicleType("");
      }
      setGaDriverName(detailData.gaDriverName || "");
      setGaDriverPhone(detailData.gaDriverPhone || "");
      const normalizedStatus = detailData.gaStatus ? String(detailData.gaStatus).toLowerCase() : "";
      setGaStatus(normalizedStatus === "pending" ? "" : normalizedStatus);
      setGaRejectReason(detailData.gaRejectReason || "");
    } catch (error) {
      console.error("โหลดรายละเอียดการจองไม่สำเร็จ", error);
      setPendingBookingsError("ไม่สามารถโหลดรายละเอียดการจองได้");
    } finally {
      setIsLoadingBookingDetail(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!formRef.current) {
      setConfirmError("ไม่พบข้อมูลแบบฟอร์ม");
      return;
    }

    const formData = new FormData(formRef.current);
    const pickupPayload = {
      sequenceNo: pickupPointForm.sequenceNo || 1,
      travelDate: pickupPointForm.travelDate,
      departTime: pickupPointForm.departTime,
      passengerCount: pickupPointForm.passengerCount,
      passengerNames: pickupPointForm.passengerNames,
      locationName: pickupPointForm.locationName,
      district: pickupPointForm.district,
      province: pickupPointForm.province,
      flightNumber: pickupPointForm.flightNumber,
      flightTime: pickupPointForm.flightTime,
      driverNote: pickupPointForm.driverNote,
    };
    const dropOffPayload = dropOffPointForms.map((point, index) => ({
      sequenceNo: point.sequenceNo || index + 1,
      travelDate: point.travelDate,
      departTime: point.departTime,
      arriveTime: point.arriveTime,
      passengerCount: point.passengerCount,
      passengerNames: point.passengerNames,
      locationName: point.locationName,
      district: point.district,
      province: point.province,
      flightNumber: point.flightNumber,
      flightTime: point.flightTime,
      driverNote: point.driverNote,
    }));
    const payload = {
      employeeId: String(formData.get("employeeId") || "").trim(),
      requesterName: String(formData.get("requesterName") || "").trim(),
      factoryId: String(formData.get("factoryId") || "").trim(),
      divisionId: String(formData.get("divisionId") || "").trim(),
      departmentId: String(formData.get("departmentId") || "").trim(),
      contactPhone: String(formData.get("contactPhone") || "").trim(),
      contactEmail: String(formData.get("contactEmail") || contactEmail || "").trim(),
      cargoDetails: String(formData.get("cargoDetails") || "").trim(),
      additionalEmails: additionalEmails
        .map((email) => email.trim())
        .filter((email) => email.length > 0),
      pickupPoint: pickupPayload,
      dropOffPoints: dropOffPayload,
      gaDriverName: gaDriverName.trim(),
      gaDriverPhone: gaDriverPhone.trim(),
      gaVehicleId,
      gaVehicleType,
      gaStatus,
      gaRejectReason: gaRejectReason.trim(),
      bookingId: selectedBookingId,
    };

    setConfirmError("");
    setIsSubmitting(true);
    try {
      const result = await postJSON("/api/bookings/company", payload);
      setIsConfirmModalOpen(false);
      setFormError("");
      if (selectedBookingId) {
        const statusLabel = result?.gaStatus === "approved"
          ? "อนุมัติ"
          : result?.gaStatus === "rejected"
          ? "ไม่อนุมัติ"
          : "อัปเดต";
        alert(`บันทึกสถานะการจอง${statusLabel ? ` (${statusLabel})` : ""}เรียบร้อย`);
        if (isAdmin) {
          await loadPendingBookings();
        }
        setSelectedBookingId(null);
        setShowBookingPicker(false);
        setPendingBookingsError("");
        setEmployeeId("");
        setRequesterName("");
        setContactPhone("");
        setContactEmail("");
        setRequesterOrgForm({ factory: "", division: "", department: "" });
        setPickupPointForm(createEmptyPickupPoint());
        setDropOffPointForms([createEmptyDropOffPoint(1)]);
        setAdditionalEmails([""]);
        setCargoDetails("");
        setGaDriverName("");
        setGaDriverPhone("");
        setGaVehicleId("");
        setGaVehicleType("");
        setGaStatus("");
        setGaRejectReason("");
      } else {
        setAdditionalEmails([""]);
        setContactEmail(payload.contactEmail);
        setEmployeeId(payload.employeeId);
        setRequesterName(payload.requesterName);
        setContactPhone(payload.contactPhone);
        setCargoDetails(payload.cargoDetails || "");
        setGaDriverName("");
        setGaDriverPhone("");
        setGaVehicleId("");
        setGaVehicleType("");
        setGaStatus("");
        setGaRejectReason("");
        if (result?.referenceCode) {
          alert(`บันทึกการจองรถบริษัทฯ เรียบร้อย (รหัสอ้างอิง ${result.referenceCode})`);
        } else {
          alert("บันทึกการจองรถบริษัทฯ เรียบร้อย");
        }
      }
    } catch (error) {
      console.error("ส่งข้อมูลการจองไม่สำเร็จ", error);
      setConfirmError(error?.message || "ไม่สามารถบันทึกการจองได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => router.push("/")}
          >
            <FaArrowLeft /> กลับเมนูหลัก
          </button>
          <button type="button" style={styles.languageToggle}>
            EN
          </button>
        </div>

        <div>
          <p style={styles.menuTitle}>เมนู</p>
          <ul style={styles.menuList}>
            {visibleMenuItems.length === 0 ? (
              <li
                style={{
                  ...styles.menuItem(false),
                  justifyContent: "center",
                  opacity: 0.65,
                  pointerEvents: "none",
                }}
              >
                ไม่มีเมนูที่สามารถเข้าถึงได้
              </li>
            ) : (
              visibleMenuItems.map((item) => {
                const isActive = item.path ? pathname === item.path : false;

                return (
                  <li
                    key={item.label}
                    style={styles.menuItem(isActive)}
                    onClick={item.path ? () => router.push(item.path) : undefined}
                  >
                    <span style={styles.menuIcon}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive ? <FaChevronRight size={14} /> : null}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </aside>

      <section style={styles.contentArea}>
        <header style={styles.topBar}>
          <div style={styles.topBarTitle}>
            <FaCarSide size={26} />
            Vehicle Service <span style={{ fontWeight: "600" }}>จองรถบริษัทฯ (สำหรับผู้จอง)</span>
          </div>
          <p style={styles.welcome}>ยินดีต้อนรับ {welcomeText}</p>
        </header>

        <div style={styles.body}>
          <form ref={formRef} style={styles.mainForm} onSubmit={handleSubmit}>
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <FaCarSide size={20} /> ข้อมูลผู้จองรถบริษัทฯ
              </div>
              <p style={{ color: colors.textLight, margin: 0, fontSize: "14px" }}>
                โปรดกรอกข้อมูลให้ครบถ้วน เพื่อใช้ในการติดต่อประสานงาน
              </p>
              {orgOptionsError ? <p style={styles.errorText}>{orgOptionsError}</p> : null}
              <div style={styles.formGrid(3)}>
                <LabeledField label="รหัสพนักงานผู้จอง" required>
                  {isAdmin ? (
                    <div style={styles.bookingFieldWrapper} ref={bookingPickerRef}>
                      <input
                        style={styles.input}
                        name="employeeId"
                        value={employeeId}
                        onChange={handleEmployeeIdChange}
                        onFocus={handleEmployeeFieldFocus}
                        placeholder="เลือกรหัสการจองที่รออนุมัติ"
                        autoComplete="off"
                        required
                      />
                      {showBookingPicker ? (
                        <div style={styles.bookingPicker}>
                          {isLoadingPendingBookings ? (
                            <div style={{ padding: "16px", fontSize: "14px", color: colors.textLight }}>
                              กำลังโหลด...
                            </div>
                          ) : pendingBookings.length === 0 ? (
                            <div style={{ padding: "16px", fontSize: "14px", color: colors.textLight }}>
                              ไม่มีรายการรออนุมัติ
                            </div>
                          ) : (
                            pendingBookings.map((booking) => (
                              <div
                                key={booking.id}
                                style={styles.bookingOption}
                                role="button"
                                tabIndex={0}
                                onMouseEnter={(event) => {
                                  event.currentTarget.style.backgroundColor = "#f3f7ff";
                                }}
                                onMouseLeave={(event) => {
                                  event.currentTarget.style.backgroundColor = "#ffffff";
                                }}
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  handleBookingOptionSelect(booking);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    handleBookingOptionSelect(booking);
                                  }
                                }}
                              >
                                <div style={styles.bookingOptionTitle}>
                                  <span>
                                    {booking.requesterEmpNo} — {booking.requesterName}
                                  </span>
                                  <span style={styles.bookingStatusBadge}>รออนุมัติ</span>
                                </div>
                                <span style={styles.bookingOptionMeta}>
                                  {booking.factoryName} · {booking.divisionName} · {booking.departmentName}
                                </span>
                                <span style={styles.bookingOptionMeta}>
                                  {booking.contactEmail}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <input
                      style={styles.input}
                      name="employeeId"
                      value={employeeId}
                      onChange={handleEmployeeIdChange}
                      required
                    />
                  )}
                  {isLoadingBookingDetail ? (
                    <p style={styles.helperText}>กำลังโหลดข้อมูลการจอง...</p>
                  ) : null}
                  {pendingBookingsError ? <p style={styles.errorText}>{pendingBookingsError}</p> : null}
                </LabeledField>
                <LabeledField label="ชื่อผู้จอง" required>
                  <input
                    style={styles.input}
                    name="requesterName"
                    value={requesterName}
                    onChange={handleRequesterNameChange}
                    required
                  />
                </LabeledField>
                <LabeledField label="โรงงาน" required>
                  <select
                    style={styles.input}
                    name="factoryId"
                    value={requesterOrgForm.factory}
                    onChange={handleFactoryChange}
                    disabled={isLoadingOrgOptions && factories.length === 0}
                    required
                  >
                    <option value="" disabled>
                      {isLoadingOrgOptions ? "กำลังโหลด..." : "เลือกโรงงาน"}
                    </option>
                    {factories.map((factory) => (
                      <option key={factory.id} value={String(factory.id)}>
                        {factory.name}
                      </option>
                    ))}
                  </select>
                  {!isLoadingOrgOptions && factories.length === 0 ? (
                    <p style={styles.helperText}>ยังไม่มีข้อมูลโรงงาน</p>
                  ) : null}
                </LabeledField>
                <LabeledField label="ฝ่าย" required>
                  <select
                    style={styles.input}
                    name="divisionId"
                    value={requesterOrgForm.division}
                    onChange={handleDivisionChange}
                    disabled={!requesterOrgForm.factory || isLoadingOrgOptions}
                    required
                  >
                    <option value="" disabled>
                      {!requesterOrgForm.factory
                        ? "เลือกโรงงานก่อน"
                        : isLoadingOrgOptions
                        ? "กำลังโหลด..."
                        : "เลือกฝ่าย"}
                    </option>
                    {divisionOptions.map((division) => (
                      <option key={division.id} value={String(division.id)}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                  {requesterOrgForm.factory && !isLoadingOrgOptions && divisionOptions.length === 0 ? (
                    <p style={styles.helperText}>ยังไม่มีข้อมูลฝ่ายในโรงงานนี้</p>
                  ) : null}
                </LabeledField>
                <LabeledField label="แผนก" required>
                  <select
                    style={styles.input}
                    name="departmentId"
                    value={requesterOrgForm.department}
                    onChange={handleDepartmentChange}
                    disabled={!requesterOrgForm.division || isLoadingOrgOptions}
                    required
                  >
                    <option value="" disabled>
                      {!requesterOrgForm.division
                        ? "เลือกฝ่ายก่อน"
                        : isLoadingOrgOptions
                        ? "กำลังโหลด..."
                        : "เลือกแผนก"}
                    </option>
                    {departmentOptions.map((department) => (
                      <option key={department.id} value={String(department.id)}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  {requesterOrgForm.division && !isLoadingOrgOptions && departmentOptions.length === 0 ? (
                    <p style={styles.helperText}>ยังไม่มีข้อมูลแผนกในฝ่ายนี้</p>
                  ) : null}
                </LabeledField>
                <LabeledField label="เบอร์ติดต่อกลับ" required>
                  <input
                    style={styles.input}
                    name="contactPhone"
                    value={contactPhone}
                    onChange={handleContactPhoneChange}
                    required
                  />
                </LabeledField>
                <LabeledField label="E-mail ติดต่อกลับ" required>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <input
                      style={styles.input}
                      type="email"
                      name="contactEmail"
                      value={contactEmail}
                      onChange={handleContactEmailChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </LabeledField>
              </div>
            </section>

            <section style={styles.routeSection}>
              <div style={styles.routeHeader}>
                <span style={styles.routeIconWrap}>
                  <FaLocationDot size={20} />
                </span>
                จุดรับ-ส่ง (เพิ่มได้หลายจุด)
              </div>
              <p style={styles.routeDescription}>
                กำหนดเส้นทาง / ปลายทาง พร้อมข้อมูลเที่ยวบินและหมายเหตุถึงคนขับ
              </p>
              <div style={styles.pointCards}>
                <div style={styles.pointCard}>
                  <div style={styles.pointHeaderBlock}>
                    <div style={styles.pointHeaderRow}>
                      <h4 style={styles.pointTitle}>{`จุดที่ ${pickupPointForm.sequenceNo || 1}`}</h4>
                      <span style={styles.pointNote}>ข้อมูลจุดขึ้นโดยสาร</span>
                    </div>
                    <div style={styles.pointTabs}>
                      <span style={styles.pointTab(true)}>ค้นหา</span>
                      <span style={styles.pointTabLabel}>ข้อมูลจุดขึ้นโดยสาร</span>
                    </div>
                  </div>
                  <div style={styles.pointGridThree}>
                    <LabeledField label="วันรถออก" required>
                      <input
                        style={styles.input}
                        type="date"
                        name="pickupTravelDate"
                        value={pickupPointForm.travelDate}
                        onChange={(event) =>
                          handlePickupPointChange("travelDate", event.target.value)
                        }
                        required
                      />
                    </LabeledField>
                    <LabeledField label="เวลารถออก" required>
                      <input
                        style={styles.input}
                        type="time"
                        name="pickupDepartTime"
                        value={pickupPointForm.departTime}
                        onChange={(event) =>
                          handlePickupPointChange("departTime", event.target.value)
                        }
                        required
                      />
                    </LabeledField>
                    <LabeledField label="จำนวนผู้โดยสารขึ้นจุดนี้" required>
                      <input
                        style={styles.input}
                        type="number"
                        min="1"
                        name="pickupPassengerCount"
                        value={pickupPointForm.passengerCount}
                        onChange={(event) =>
                          handlePickupPointChange("passengerCount", event.target.value)
                        }
                        required
                      />
                    </LabeledField>
                  </div>
                  <div style={styles.pointGridOne}>
                    <LabeledField label="รายชื่อคนขึ้นจุดนี้">
                      <input
                        style={styles.input}
                        name="pickupPassengerNames"
                        value={pickupPointForm.passengerNames}
                        onChange={(event) =>
                          handlePickupPointChange("passengerNames", event.target.value)
                        }
                        placeholder=""
                      />
                    </LabeledField>
                  </div>
                  <div style={styles.pointGridThree}>
                    <LabeledField label="สถานที่รับ" required>
                      <input
                        style={styles.input}
                        name="pickupLocationName"
                        value={pickupPointForm.locationName}
                        onChange={(event) =>
                          handlePickupPointChange("locationName", event.target.value)
                        }
                        placeholder=""
                        required
                      />
                    </LabeledField>
                    <LabeledField label="อำเภอ" required>
                      <input
                        style={styles.input}
                        name="pickupDistrict"
                        value={pickupPointForm.district}
                        onChange={(event) =>
                          handlePickupPointChange("district", event.target.value)
                        }
                        placeholder=""
                        required
                      />
                    </LabeledField>
                    <LabeledField label="จังหวัด" required>
                      <input
                        style={styles.input}
                        name="pickupProvince"
                        value={pickupPointForm.province}
                        onChange={(event) =>
                          handlePickupPointChange("province", event.target.value)
                        }
                        placeholder=""
                        required
                      />
                    </LabeledField>
                  </div>
                  <p style={styles.subSectionLabel}>เดินทางโดยเครื่องบิน (จุดต้นทาง)</p>
                  <div style={styles.pointGridThree}>
                    <LabeledField label="เที่ยวบิน">
                      <input
                        style={styles.input}
                        name="pickupFlightNumber"
                        value={pickupPointForm.flightNumber}
                        onChange={(event) =>
                          handlePickupPointChange("flightNumber", event.target.value)
                        }
                        placeholder="เช่น TG123"
                      />
                    </LabeledField>
                    <LabeledField label="เวลาแลนดิ้ง">
                      <input
                        style={styles.input}
                        type="time"
                        name="pickupFlightTime"
                        value={pickupPointForm.flightTime}
                        onChange={(event) =>
                          handlePickupPointChange("flightTime", event.target.value)
                        }
                      />
                    </LabeledField>
                    <LabeledField label="หมายเหตุถึงคนขับ+ต้นทาง">
                      <input
                        style={styles.input}
                        name="pickupDriverNote"
                        value={pickupPointForm.driverNote}
                        onChange={(event) =>
                          handlePickupPointChange("driverNote", event.target.value)
                        }
                        placeholder=""
                      />
                    </LabeledField>
                  </div>
                  <button type="button" style={styles.fileButton} onClick={handleAddDropOffPoint}>
                    + เพิ่มจุดรับ - ส่งถัดไป
                  </button>
                </div>

                {dropOffPointForms.map((point, index) => {
                  const sequenceLabel = point.sequenceNo || index + 1;
                  const title = sequenceLabel === 1 ? "ปลายทาง" : `ปลายทางที่ ${sequenceLabel}`;
                  const isLast = index === dropOffPointForms.length - 1;
                  return (
                    <div key={`dropoff-${point.sequenceNo || index}`} style={styles.pointCard}>
                      <div style={styles.pointHeaderBlock}>
                        <div style={styles.pointHeaderRow}>
                          <h4 style={styles.pointTitle}>{title}</h4>
                          <span style={styles.pointNote}>ข้อมูลจุดรับผู้โดยสาร</span>
                        </div>
                        <div style={styles.pointTabs}>
                          <span style={styles.pointTab(true)}>ปลายทาง</span>
                          <span style={styles.pointTabLabel}>ข้อมูลจุดรับผู้โดยสาร</span>
                        </div>
                      </div>
                      <div style={styles.pointGridThree}>
                        <LabeledField label="เวลาถึงปลายทาง" required>
                          <input
                            style={styles.input}
                            type="time"
                            name={`dropoff-${index}-arriveTime`}
                            value={point.arriveTime}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "arriveTime", event.target.value)
                            }
                            required
                          />
                        </LabeledField>
                        <LabeledField label="จำนวนผู้โดยสารขึ้นจุดนี้" required>
                          <input
                            style={styles.input}
                            type="number"
                            min="1"
                            name={`dropoff-${index}-passengerCount`}
                            value={point.passengerCount}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "passengerCount", event.target.value)
                            }
                            required
                          />
                        </LabeledField>
                      </div>
                      <div style={styles.pointGridOne}>
                        <LabeledField label="รายชื่อคนขึ้นจุดนี้">
                          <input
                            style={styles.input}
                            name={`dropoff-${index}-passengerNames`}
                            value={point.passengerNames}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "passengerNames", event.target.value)
                            }
                            placeholder=""
                          />
                        </LabeledField>
                      </div>
                      <div style={styles.pointGridThree}>
                        <LabeledField label="สถานที่รับ" required>
                          <input
                            style={styles.input}
                            name={`dropoff-${index}-locationName`}
                            value={point.locationName}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "locationName", event.target.value)
                            }
                            placeholder=""
                            required
                          />
                        </LabeledField>
                        <LabeledField label="อำเภอ" required>
                          <input
                            style={styles.input}
                            name={`dropoff-${index}-district`}
                            value={point.district}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "district", event.target.value)
                            }
                            placeholder=""
                            required
                          />
                        </LabeledField>
                        <LabeledField label="จังหวัด" required>
                          <input
                            style={styles.input}
                            name={`dropoff-${index}-province`}
                            value={point.province}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "province", event.target.value)
                            }
                            placeholder=""
                            required
                          />
                        </LabeledField>
                      </div>
                      <p style={styles.subSectionLabel}>เดินทางโดยเครื่องบิน (จุดปลายทาง)</p>
                      <div style={styles.pointGridThree}>
                        <LabeledField label="เที่ยวบิน">
                          <input
                            style={styles.input}
                            name={`dropoff-${index}-flightNumber`}
                            value={point.flightNumber}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "flightNumber", event.target.value)
                            }
                            placeholder="เช่น TG123"
                          />
                        </LabeledField>
                        <LabeledField label="เวลาแลนดิ้ง">
                          <input
                            style={styles.input}
                            type="time"
                            name={`dropoff-${index}-flightTime`}
                            value={point.flightTime}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "flightTime", event.target.value)
                            }
                          />
                        </LabeledField>
                        <LabeledField label="หมายเหตุถึงคนขับ+ปลายทาง">
                          <input
                            style={styles.input}
                            name={`dropoff-${index}-driverNote`}
                            value={point.driverNote}
                            onChange={(event) =>
                              handleDropOffPointChange(index, "driverNote", event.target.value)
                            }
                            placeholder=""
                          />
                        </LabeledField>
                      </div>
                      {isLast ? (
                        <p style={styles.bottomNote}>สามารถเพิ่มได้หลายจุดตามลำดับการเดินทาง</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <FaClipboardList size={20} /> ระบุกรณีมีของบรรทุกบนรถ
              </div>
              <LabeledField label="ระบุรายละเอียด" required>
                <textarea
                  style={styles.textarea}
                  name="cargoDetails"
                  placeholder="ระบุรายละเอียด เช่น ประเภทของสิ่งของ ขนาดหรือน้ำหนัก จุดโหลด/สิ่งที่ควรระวัง"
                  value={cargoDetails}
                  onChange={handleCargoDetailsChange}
                  required
                ></textarea>
              </LabeledField>
              <CargoAttachmentsInput
                files={cargoFiles}
                onChange={setCargoFiles}
                buttonStyle={styles.fileButton}
                helperStyle={{ color: colors.textLight, fontSize: "14px" }}
              />
            </section>

            <section
              style={{
                ...styles.sectionCard,
                ...(isAdmin ? {} : styles.disabledCard),
              }}
            >
              <div style={styles.sectionHeader}>
                <FaUsers size={20} /> สำหรับพนักงาน GA Service
              </div>
              <p style={styles.routeDescription}>
                ยืนยันการจัดรถ ในกรณีไม่อนุมัติการจอง โปรดระบุเหตุผล
              </p>
              <div style={styles.formGrid(3)}>
                <LabeledField label="ยืนยันพนักงานขับรถ" required>
                  <input
                    style={styles.input}
                    name="gaDriverName"
                    value={gaDriverName}
                    onChange={(event) => setGaDriverName(event.target.value)}
                    disabled={!isAdmin}
                    required={isAdmin}
                  />
                </LabeledField>
                <LabeledField label="เบอร์โทรพนักงานขับรถ" required>
                  <input
                    style={styles.input}
                    name="gaDriverPhone"
                    value={gaDriverPhone}
                    onChange={(event) => setGaDriverPhone(event.target.value)}
                    disabled={!isAdmin}
                    required={isAdmin}
                  />
                </LabeledField>
                <LabeledField label="ยืนยันรถที่ใช้" required>
                  <select
                    style={styles.input}
                    name="gaVehicleId"
                    value={gaVehicleId}
                    onChange={(event) => {
                      const selectedId = event.target.value;
                      setGaVehicleId(selectedId);
                      if (!selectedId) {
                        setGaVehicleType("");
                        return;
                      }
                      const matchedVehicle = vehicleOptions.find((vehicle) => String(vehicle.id) === selectedId);
                      if (matchedVehicle?.vehicleType) {
                        setGaVehicleType(String(matchedVehicle.vehicleType));
                      }
                    }}
                    disabled={!isAdmin || isLoadingVehicles}
                    required
                  >
                    <option value="">
                      {isLoadingVehicles ? "กำลังโหลดข้อมูล..." : "เลือกรถ"}
                    </option>
                    {vehicleOptions.map((vehicle) => (
                      <option key={vehicle.id} value={String(vehicle.id)}>
                        {formatVehicleOption(vehicle)}
                      </option>
                    ))}
                  </select>
                </LabeledField>
                <LabeledField label="ประเภทรถ" required>
                  <select
                    style={styles.input}
                    name="gaVehicleType"
                    value={gaVehicleType}
                    onChange={(event) => setGaVehicleType(event.target.value)}
                    disabled={!isAdmin || (!vehicleTypeOptionsWithCurrent.length && !gaVehicleType)}
                    required
                  >
                    <option value="">ระบุ</option>
                    {vehicleTypeOptionsWithCurrent.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </LabeledField>
                <LabeledField label="สถานะการจอง" required>
                  <select
                    style={styles.input}
                    name="gaStatus"
                    value={gaStatus}
                    onChange={(event) => setGaStatus(event.target.value)}
                    disabled={!isAdmin}
                    required={isAdmin}
                  >
                    <option value="">ระบุ</option>
                    <option value="approved">อนุมัติ</option>
                    <option value="rejected">ไม่อนุมัติ</option>
                  </select>
                </LabeledField>
                <LabeledField label="เหตุผลการไม่อนุมัติ">
                  <input
                    style={styles.input}
                    name="gaRejectReason"
                    value={gaRejectReason}
                    onChange={(event) => setGaRejectReason(event.target.value)}
                    disabled={!isAdmin || gaStatus !== "rejected"}
                    required={isAdmin && gaStatus === "rejected"}
                  />
                </LabeledField>
              </div>
              {isAdmin && vehicleOptionsError ? (
                <p style={styles.errorText}>{vehicleOptionsError}</p>
              ) : null}
            </section>
            <div style={styles.formFooter}>
              {formError ? <p style={styles.errorText}>{formError}</p> : null}
              <div style={styles.asideActions}>
                <button type="button" style={styles.actionButton("outline")}>
                  ยกเลิกการจอง
                </button>
                <button type="submit" style={styles.actionButton("dark")}>
                  บันทึกการจอง
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      </main>
      {isConfirmModalOpen ? (
        <div style={styles.modalOverlay} onClick={handleCloseConfirmModal}>
          <div
            style={styles.modalCard}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>ตรวจสอบอีเมลสำหรับการติดต่อกลับ</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={styles.modalLabel}>E-mail ติดต่อกลับ :</span>
              <p style={styles.modalEmailValue}>{contactEmail}</p>
            </div>
            <div style={styles.modalExtraSection}>
              <span style={styles.modalLabel}>E-mail ติดต่อกลับเพิ่มเติม</span>
              {additionalEmails.map((email, index) => (
                <input
                  key={`additional-email-${index}`}
                  style={styles.input}
                  type="email"
                  value={email}
                  placeholder="ระบุ E-mail เพิ่มเติม"
                  onChange={(event) =>
                    handleAdditionalEmailChange(index, event.target.value)
                  }
                />
              ))}
              <button
                type="button"
                style={styles.modalAddButton}
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddAdditionalEmail();
                }}
              >
                + E-mail ติดต่อกลับ
              </button>
            </div>
            {confirmError ? (
              <p style={{ ...styles.errorText, alignSelf: "flex-start" }}>{confirmError}</p>
            ) : null}
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{
                  ...styles.actionButton("outline"),
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
                onClick={handleCloseConfirmModal}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                style={{
                  ...styles.actionButton("dark"),
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "wait" : "pointer",
                }}
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? "กำลังส่ง..." : "ยืนยันการจอง"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
