"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import html2canvas from "html2canvas";
import { fetchJSON, postJSON, putJSON, deleteJSON } from '@/lib/http';
import "./globals.css";
import { formatWelcome } from '@/lib/formatters';
import { FaBus, FaUtensils, FaFilePdf, FaWallet } from "react-icons/fa";

// Re-defining the styles object for a modern, clean UI
const styles = {
  
  container: {
    minHeight: "100vh",
    background: "#eef1f5", // Light gray background similar to mockup
    fontFamily: "sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  authContainer: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    width: "100%",
    maxWidth: "560px",
    textAlign: "center",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "16px",
    color: "#2f3e4f",
  },
  brandTitle: {
    fontSize: "34px",
    fontWeight: 800,
    margin: 0,
  },
  loginPill: {
    display: "inline-block",
    backgroundColor: "#2f4760",
    color: "#fff",
    padding: "14px 24px",
    borderRadius: "14px",
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  formGroup: {
    marginBottom: "20px",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #bdc3c7",
    fontSize: "16px",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #bdc3c7",
    fontSize: "16px",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  },
  submitButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#3498db",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.3s",
  },
  // Menu page styles
  menuWrapper: {
    minHeight: "100vh",
    background: "#eef1f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "relative",
  },
  menuCard: {
    background: "#fff",
    borderRadius: 24,
    width: "100%",
    maxWidth: 720,
    padding: 32,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    textAlign: "center",
  },
  menuWelcome: {
    fontWeight: 700,
    color: "#2f3e4f",
    marginTop: 0,
    marginBottom: 12,
  },
  menuBrandRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#2f3e4f",
    marginBottom: 20,
  },
  menuBrandTitle: { fontSize: 34, fontWeight: 800, margin: 0 },
  menuButtons: { display: "flex", flexDirection: "column", gap: 18, marginTop: 10 },
  menuBtn: {
    border: "none",
    borderRadius: 18,
    padding: "18px 24px",
    color: "#fff",
    fontWeight: 800,
    fontSize: 20,
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
  },
  logoutTopRight: {
    position: "absolute",
    right: 24,
    top: 24,
    padding: "10px 16px",
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  // OT page styles
  otCard: {
    background: "#fff",
    borderRadius: 24,
    width: "100%",
    maxWidth: 720,
    padding: 32,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    textAlign: "center",
  },
  otTitle: {
    fontSize: 34,
    fontWeight: 900,
    color: "#2f3e4f",
    marginTop: 8,
    marginBottom: 24,
  },
  otBtnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  // OT Return page styles
  otReturnWrapper: {
    minHeight: "100vh",
    background: "#eef1f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "relative",
  },
  otReturnCard: {
    background: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 1340,
    padding: 24,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  },
  // Generic panel/card for OT Return sections (เหมือนแยกเป็น "ตู้")
  panelCard: {
    background: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 1340,
    padding: 24,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  },
  // Tight card (no inner padding) for edge-to-edge table
  panelCardTight: {
    background: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 1340,
    padding: 0,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    overflow: "hidden",
  },
  otReturnHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  otReturnTitle: { fontSize: 28, fontWeight: 900, color: "#2f3e4f", margin: 0 },
  otReturnTopRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  otReturnControls: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "#f7f9fb",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  otReturnLabel: { fontWeight: 700, color: "#2f3e4f" },
  otReturnInput: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #bdc3c7",
    background: "#fff",
    fontSize: 16,
    minWidth: 120,
  },
  otShiftPill: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #bdc3c7",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  otReturnAction: {
    padding: "10px 14px",
    borderRadius: 10,
    background: "#1f8ef1",
    color: "#fff",
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
  },
  otReturnTableWrap: { width: "100%", marginTop: 0, overflowX: 'auto' },
  otReturnTable: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  otReturnThMain: { background: "#102a3b", color: "#fff", padding: 8, textAlign: "center", fontWeight: 900, whiteSpace: "nowrap", fontSize: 12 },
  otReturnThDeptAC: { background: "#2ecc71", color: "#0f2a40", padding: 8, textAlign: "center", fontWeight: 900, fontSize: 14 },
  otReturnThDeptRF: { background: "#f1c40f", color: "#0f2a40", padding: 8, textAlign: "center", fontWeight: 900, fontSize: 14 },
  otReturnThDeptSSC: { background: "#12b3c7", color: "#0f2a40", padding: 8, textAlign: "center", fontWeight: 900, fontSize: 14 },
  otReturnTdName: { border: "1px solid #dfe6ee", padding: 8, fontWeight: 800, color: "#2f3e4f", width: 160, background: "#ffffff", fontSize: 13 },
  otReturnTdCell: { border: "1px solid #e6edf3", padding: 6, minWidth: 60, height: 36, backgroundColor: "#ffffff", textAlign: "center", fontSize: 12 },
  otReturnFooter: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 },
  // Route check page styles
  routeCard: {
    background: "#fff",
    borderRadius: 24,
    width: "100%",
    maxWidth: 980,
    padding: 24,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  },
  routeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  routeTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#2f3e4f",
  },
  routeTitle: { fontSize: 34, fontWeight: 900, margin: 0 },
  routeUpdate: { fontSize: 18, margin: "8px 0 16px 0", color: "#2f3e4f" },
  routeTable: { width: "100%", borderCollapse: "collapse" },
  routeTh: { background: "#17344f", color: "#fff", padding: 14, fontWeight: 800, textAlign: "center" },
  routeTd: { border: "1px solid #d6dee6", padding: 12, textAlign: "center" },
  routeTdName: { border: "1px solid #d6dee6", padding: 12, textAlign: "left", fontWeight: 800, color: "#2f3e4f" },
  uploadBtn: { padding: "6px 10px", background: "#3498db", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 },
  pdfLink: { color: "#c0392b", display: 'inline-flex', alignItems: 'center', gap: 6 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  dashboardContainer: {
    minHeight: "100vh",
    background: "#f0f2f5",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0",
  },
  welcomeText: {
    fontSize: "16px",
    color: "#7f8c8d",
    margin: "5px 0 0 0",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  dateInfo: {
    fontSize: "16px",
    color: "#2c3e50",
    fontWeight: "600",
  },
  logoutButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#e74c3c",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  actionButtonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  actionButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    lineHeight: 1.2,
    cursor: "pointer",
    color: "#fff",
    minWidth: "150px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    transition: "transform 0.15s, box-shadow 0.3s, background-color 0.3s",
  },
  dateSelector: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  dateLabel: {
    fontSize: "16px",
    color: "#2c3e50",
    fontWeight: "500",
    marginRight: "10px",
  },
  dateInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #bdc3c7",
  },
  tableContainer: {
    overflowX: "auto",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    backgroundColor: "#ffffff",
  },
  tableHeader: {
    padding: "15px",
    textAlign: "left",
    fontWeight: "700",
    color: "#ffffff",
    borderRight: "1px solid #3b4a6b", // for a cleaner look
  },
  tableHeaderFirst: {
    padding: "15px",
    textAlign: "left",
    fontWeight: "700",
    color: "#ffffff",
    borderRight: "1px solid #3b4a6b",
  },
  bookingCell: {
    padding: "5px",
    border: "1px solid #ecf0f1",
    cursor: "pointer",
    height: "50px", // fixed height for better alignment
  },
  productNameCell: {
    padding: "12px",
    backgroundColor: "#f9f9f9",
    fontWeight: "600",
    color: "#34495e",
    borderRight: "1px solid #ecf0f1",
  },
  vendorCell: {
    padding: "12px",
    backgroundColor: "#f9f9f9",
    color: "#7f8c8d",
    borderRight: "1px solid #ecf0f1",
  },
  overlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000",
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    width: "90%",
    maxWidth: "500px",
    maxHeight: '85vh',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    zIndex: "1001",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "20px",
    textAlign: "center",
  },
  modalFormGroup: {
    marginBottom: "15px",
  },
  modalLabel: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "500",
    color: "#34495e",
  },
  modalInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #bdc3c7",
    boxSizing: "border-box",
  },
  modalSelect: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #bdc3c7",
    boxSizing: "border-box",
  },
  modalButtonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  confirmButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2ecc71",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  cancelButton: {
    padding: "12px 20px",
    border: "1px solid #bdc3c7",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#7f8c8d",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s, color 0.3s",
  },
  deleteButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#e74c3c",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("login");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    department: "AC",
  });
  const [bookingForm, setBookingForm] = useState({
    productId: "",
    department: "AC",
    percentage: 50,
    bookingDate: new Date().toISOString().split("T")[0],
  });

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    vendor: "",
  });
  const [productAction, setProductAction] = useState("add"); // "add" | "edit"
  const [productSort, setProductSort] = useState("added"); // added | name | vendor
  // Locations (persistent via API)
  const [locations, setLocations] = useState([]); // [{id,name}]
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState(null);
  // User management (adminscrap only)
  const [showUserModal, setShowUserModal] = useState(false);
  const [usersList, setUsersList] = useState([]); // {id,username,department}
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [editUser, setEditUser] = useState(null); // user currently editing
  const [editPassword, setEditPassword] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [newUser, setNewUser] = useState({ username: '', password: '', display_name: '', department: '', plant_id: '', department_id: '' });
  const [newUserDeptIds, setNewUserDeptIds] = useState([]); // multi-dept for create
  const [editDeptIds, setEditDeptIds] = useState([]); // multi-dept for edit

  // OT Return (admin) state
  const [otDate, setOtDate] = useState(() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [otTime, setOtTime] = useState("17:00");
  const [otShift, setOtShift] = useState("เช้า"); // เช้า | บ่าย | ดึก (for example)
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [newShiftTh, setNewShiftTh] = useState("");
  const [newShiftEn, setNewShiftEn] = useState("");
  const [newDepartTime, setNewDepartTime] = useState("");
  const [newDepartIsEntry, setNewDepartIsEntry] = useState(0); // 1 = เข้า, 0 = ออก
  const [editingDepartTime, setEditingDepartTime] = useState(null); // { id, time, is_entry }

  // OT master data (from APIs)
  const [otPlants, setOtPlants] = useState([]); // [{id, code, name}]
  const [otDepartmentsApi, setOtDepartmentsApi] = useState([]); // [{id, plant_id, plant_code, code, name}]
  const [otShifts, setOtShifts] = useState([]); // [{id, name_th, name_en, is_active}]
  const [otDepartTimes, setOtDepartTimes] = useState([]); // [{id, shift_id, time, is_active}]
  const [otRoutesApi, setOtRoutesApi] = useState([]); // [{id, name, vendor, display_order}]
  const [otMastersLoading, setOtMastersLoading] = useState(false);
  const [otMastersError, setOtMastersError] = useState(null);
  // Current selected shift/time (IDs) for OT Return
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [selectedDepartTimeId, setSelectedDepartTimeId] = useState(null);
  // OT routes management (สายรถ + vendor)
  const [otRouteList, setOtRouteList] = useState([
    { id: 1, name: 'คลองอุดม', vendor: '' },
    { id: 2, name: 'วิจิตรา', vendor: '' },
    { id: 3, name: 'สระแท่น', vendor: '' },
    { id: 4, name: 'นาดี', vendor: '' },
    { id: 5, name: 'ครัวอากู๋', vendor: '' },
    { id: 6, name: 'บ้านเลียบ', vendor: '' },
    { id: 7, name: 'สันติสุข', vendor: '' },
    { id: 8, name: 'ปราจีนบุรี', vendor: '' },
    { id: 9, name: 'สระแก้ว', vendor: '' },
    { id: 10, name: 'ดงน้อย', vendor: '' },
  ]);
  const [routeSort, setRouteSort] = useState('added'); // added | name | vendor
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeAction, setRouteAction] = useState('add');
  const [routeForm, setRouteForm] = useState({ id: '', name: '', vendor: '' });
  const openRouteModal = (action, r=null) => {
    setRouteAction(action);
    if (r) setRouteForm({ id: r.id, name: r.name, vendor: r.vendor||'' });
    else setRouteForm({ id: '', name: '', vendor: '' });
    setShowRouteModal(true);
  };
  const handleRouteSubmit = (e) => {
    e.preventDefault();
    if (!routeForm.name.trim()) return;
    const doSave = async () => {
      const payload = { id: routeForm.id, name: routeForm.name.trim(), vendor: routeForm.vendor.trim() || null, display_order: 0 };
      if (routeAction === 'add') await postJSON('/api/ot/routes', { name: payload.name, vendor: payload.vendor, display_order: 0 });
      else await putJSON('/api/ot/routes', payload);
      await fetchOtRoutes();
      setShowRouteModal(false);
    };
    doSave().catch(err => alert(err.message));
  };
  const handleRouteDelete = (id) => {
    if (!confirm('ต้องการลบสายรถนี้หรือไม่?')) return;
    const doDel = async () => {
      await deleteJSON(`/api/ot/routes?id=${id}`);
      await fetchOtRoutes();
    };
    doDel().catch(err => alert(err.message));
  };

  // Load OT master data when navigating to OT Return
  const fetchOtPlants = async () => {
    try {
      const data = await fetchJSON('/api/ot/plants');
      if (!Array.isArray(data)) throw new Error('โหลดโรงงานล้มเหลว');
      setOtPlants(data);
    } catch (err) {
      setOtMastersError(prev => prev || (err?.message || 'โหลดโรงงานล้มเหลว'));
      setOtPlants([]);
    }
  };
  const fetchOtDepartments = async () => {
    try {
      const data = await fetchJSON('/api/ot/departments');
      if (!Array.isArray(data)) throw new Error('โหลดแผนกล้มเหลว');
      setOtDepartmentsApi(data);
    } catch (err) {
      setOtMastersError(prev => prev || (err?.message || 'โหลดแผนกล้มเหลว'));
      setOtDepartmentsApi([]);
    }
  };
  const fetchOtShifts = async () => {
    try {
      const data = await fetchJSON('/api/ot/shifts');
      const rows = (Array.isArray(data) ? data : []).filter(s => s.is_active !== 0);
      setOtShifts(rows);
      // initialize selectedShiftId if empty (fixes initial depart-time dropdown being empty)
      if (!selectedShiftId && rows.length) setSelectedShiftId(rows[0].id);
    } catch (err) {
      setOtMastersError(prev => prev || (err?.message || 'โหลดกะล้มเหลว'));
      setOtShifts([]);
    }
  };
  const fetchOtDepartTimes = async (shiftId = null) => {
    try {
      const url = shiftId ? `/api/ot/depart-times?shiftId=${shiftId}` : '/api/ot/depart-times';
      const data = await fetchJSON(url, {}, { cache: 'no-store' });
      const rowsAll = Array.isArray(data) ? data : [];
      // Hide inactive (soft-deleted) times from UI
      const rows = rowsAll.filter(r => r && r.is_active !== 0);
      setOtDepartTimes(rows);
      // ensure selectedDepartTimeId belongs to current shift; otherwise pick first
      if (shiftId) {
        const has = rows.some(r => r.id === selectedDepartTimeId);
        if (!has) setSelectedDepartTimeId(rows[0]?.id || null);
      } else {
        const filtered = selectedShiftId ? rows.filter(r=>r.shift_id === selectedShiftId) : rows;
        if (!selectedDepartTimeId && filtered.length) setSelectedDepartTimeId(filtered[0].id);
      }
    } catch (err) {
      setOtMastersError(prev => prev || (err?.message || 'โหลดเวลาออกล้มเหลว'));
      setOtDepartTimes([]);
    }
  };
  const fetchOtRoutes = async () => {
    try {
      const data = await fetchJSON('/api/ot/routes');
      setOtRoutesApi(Array.isArray(data) ? data : []);
    } catch (err) {
      setOtMastersError(prev => prev || (err?.message || 'โหลดสายรถล้มเหลว'));
      setOtRoutesApi([]);
    }
  };
  const loadOtMasters = async () => {
    try {
      setOtMastersLoading(true);
      setOtMastersError(null);
      await Promise.all([
        fetchOtPlants(),
        fetchOtDepartments(),
        fetchOtShifts(),
        fetchOtRoutes(),
      ]);
      // fetch times after shift state ensured
      await fetchOtDepartTimes(selectedShiftId);
    } catch (e) {
      setOtMastersError(e.message || 'โหลดข้อมูล OT ไม่สำเร็จ');
    } finally {
      setOtMastersLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentPage === 'otReturn') {
      loadOtMasters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, currentPage]);

  // Refetch depart times when selected shift changes
  useEffect(() => {
    if (selectedShiftId && isLoggedIn && currentPage === 'otReturn') {
      fetchOtDepartTimes(selectedShiftId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShiftId]);

  // Ensure depart times are loaded once masters arrive and selectedShiftId was auto-set
  useEffect(() => {
    if (!isLoggedIn || currentPage !== 'otReturn') return;
    if (otShifts && otShifts.length && !selectedShiftId) {
      setSelectedShiftId(otShifts[0].id);
    }
  }, [otShifts, isLoggedIn, currentPage, selectedShiftId]);

  // Department management (โรงงาน/แผนก) - colors and CRUD via API
  const deptColors = { AC: '#2ecc71', RF: '#f1c40f', SSC: '#12b3c7' };
  const [deptSort, setDeptSort] = useState('added'); // added | plant | name
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptAction, setDeptAction] = useState('add');
  const [deptForm, setDeptForm] = useState({ id: '', plant_id: '', name: '' });
  // Inline plant management for Dept modal
  const [addingPlant, setAddingPlant] = useState(false);
  const [newPlantText, setNewPlantText] = useState('');
  const [managePlants, setManagePlants] = useState(false);
  const openDeptModal = (action, d=null) => {
    setDeptAction(action);
    if (d) setDeptForm({ id: d.id, plant_id: d.plant_id, name: d.name || d.code || '' });
    else setDeptForm({ id: '', plant_id: otPlants[0]?.id || '', name: '' });
    setShowDeptModal(true);
  };
  const submitDept = (e) => {
    e.preventDefault();
    const { plant_id, name } = deptForm;
    if (!plant_id || !name.trim()) { alert('กรุณาเลือกโรงงานและกรอกชื่อแผนก'); return; }
    const normalizedName = name.trim().toUpperCase();
    const doSave = async () => {
      if (deptAction === 'add') await postJSON('/api/ot/departments', { plant_id, name: normalizedName || null });
      else await putJSON('/api/ot/departments', { id: deptForm.id, plant_id, name: normalizedName || null });
      await fetchOtDepartments();
      setShowDeptModal(false);
    };
    doSave().catch(err => alert(err.message));
  };
  // Add a new plant inline
  const addPlantInline = async () => {
    const text = (newPlantText || '').trim();
    if (!text) { alert('กรุณากรอกชื่อ/รหัสโรงงาน'); return; }
    try {
      const c = text.toUpperCase();
      await postJSON('/api/ot/plants', { code: c, name: c });
      setAddingPlant(false);
      setNewPlantText('');
      await fetchOtPlants();
      await fetchOtDepartments();
    } catch (e) { alert(e.message); }
  };
  const deletePlantInline = async (id, code) => {
    if (!confirm(`ลบโรงงาน ${code}? การลบนี้จะมีผลกับทุกตาราง (ข้อมูลแผนก/ยอดที่เกี่ยวข้องจะถูกลบด้วย)`)) return;
    try {
      await deleteJSON(`/api/ot/plants?id=${id}`);
      await fetchOtPlants();
      await fetchOtDepartments();
    } catch (e) { alert(e.message); }
  };
  const deleteDept = (id) => {
    if (!confirm('ต้องการลบแผนกนี้หรือไม่?')) return;
    const doDel = async () => {
      await deleteJSON(`/api/ot/departments?id=${id}`);
      await fetchOtDepartments();
    };
    doDel().catch(err => alert(err.message));
  };
  const otRoutes = useMemo(
    () => [
      "1. คลองอุดม",
      "2. วิจิตรา",
      "3. สระแท่น",
      "4. นาดี",
      "5. ครัวอากู๋",
      "6. บ้านเลียบ",
      "7. สันติสุข",
      "8. ปราจีนบุรี",
      "9. สระแก้ว",
      "10. ดงน้อย",
    ],
    []
  );
  // Dynamic plant order: keep AC/RF/SSC first if present, then others alphabetically
  const plantOrderPref = useMemo(() => ['AC','RF','SSC'], []);
  const plantCodesDynamic = useMemo(() => {
    const codes = Array.from(new Set(
      otPlants.length ? otPlants.map(p=>p.code) : otDepartmentsApi.map(d=>d.plant_code)
    ).values());
    return codes.sort((a,b)=>{
      const ia = plantOrderPref.indexOf(a); const ib = plantOrderPref.indexOf(b);
      const sa = ia === -1 ? 999 : ia; const sb = ib === -1 ? 999 : ib;
      if (sa !== sb) return sa - sb; return (a||'').localeCompare(b||'');
    });
  }, [otPlants, otDepartmentsApi, plantOrderPref]);
  const getPlantColor = (code) => deptColors[code] || '#95a5a6';

  // Route check (PDFs per route and shift)
  const [routeData, setRouteData] = useState([]);
  const [routePdfs, setRoutePdfs] = useState({}); // {`${key}-day`: url, `${key}-night`: url}
  const [routePdfsUpdatedAt, setRoutePdfsUpdatedAt] = useState(null); // ms timestamp
  const [isLoadingRoutePdfs, setIsLoadingRoutePdfs] = useState(false);

  // Load persisted route PDFs and last updated when navigating to Route Check
  useEffect(() => {
    if (!(isLoggedIn && currentPage === 'routeCheck')) return;
    let aborted = false;
    const load = async () => {
      try {
        setIsLoadingRoutePdfs(true);
  const data = await fetchJSON('/api/route-pdfs/list', {}, { cache: 'no-store' });
  if (!data) throw new Error('load failed');
        if (aborted) return;
        setRoutePdfs(data.map || {});
        setRoutePdfsUpdatedAt(data.lastUpdated || null);
      } catch (e) {
        // ignore
      } finally {
        if (!aborted) setIsLoadingRoutePdfs(false);
      }
    };
    load();
    return () => { aborted = true; };
  }, [isLoggedIn, currentPage]);

  // Load dynamic route list from DB when entering Route Check
  useEffect(() => {
    if (!(isLoggedIn && currentPage === 'routeCheck')) return;
    let aborted = false;
    const loadRoutes = async () => {
      try {
  const rows = await fetchJSON('/api/ot/routes', {}, { cache: 'no-store' });
        if (aborted) return;
        const list = (Array.isArray(rows) ? rows : []).map(r => ({
          id: r.id,
          name: r.name,
          key: `route-${r.id}`,
        }));
        setRouteData(list);
      } catch {
        setRouteData([]);
      }
    };
    loadRoutes();
    return () => { aborted = true; };
  }, [isLoggedIn, currentPage]);
  const [uploadModal, setUploadModal] = useState({ open: false, routeKey: null, column: null, file: null, _busy: false });

  // Counts and lock state for OT Return
  const [otCounts, setOtCounts] = useState({}); // key `${routeId}:${deptId}` -> number
  const [otLockInfo, setOtLockInfo] = useState({ the_date: null, is_locked: 0 }); // legacy whole-day lock
  const [otTimeLock, setOtTimeLock] = useState({ is_locked: 0 }); // current shift/time global lock
  const [otDeptLocks, setOtDeptLocks] = useState({}); // legacy whole-day dept locks (kept for back-compat)
  const [otDeptTimeLocks, setOtDeptTimeLocks] = useState({}); // dept locks for current shift/time
  const countsKey = (routeId, deptId) => `${routeId}:${deptId}`;
  const getRouteTotal = (routeId) => {
    return otDepartmentsApi.reduce((sum, d) => sum + (parseInt(otCounts[countsKey(routeId, d.id)]) || 0), 0);
  };
  const canEditCell = (dept) => {
    const isAdminga = String(user?.username || '').toLowerCase() === 'adminga';
    // Bypass all locks for adminga
    if (isAdminga) return true;
  // Lock per current time-slot
  if (otTimeLock?.is_locked) return false;
  if (otDeptTimeLocks && otDeptTimeLocks[dept.id]) return false;
    // Super admin can always edit when not locked
    if (user?.is_super_admin) return true;
    // Determine the set of departments this user controls
    const myDeptIds = (Array.isArray(user?.department_ids) && user.department_ids.length)
      ? user.department_ids
      : (user?.department_id ? [user.department_id] : []);
    // Must be within user's plant (if specified)
    if (user?.plant_id && user.plant_id !== dept.plant_id) return false;
    // Must be one of the user's departments
    if (!myDeptIds.includes(dept.id)) return false;
    return true;
  };
  // Count editor modal state
  const [countModal, setCountModal] = useState({ open: false, route: null, dept: null, value: '', canEdit: true });
  const openCountModal = (route, dept) => {
    const allowed = canEditCell(dept);
    const key = countsKey(route.id, dept.id);
    const current = otCounts[key];
    setCountModal({ open: true, route, dept, value: (current ?? '').toString(), canEdit: allowed });
  };
  const submitCountModal = async () => {
    if (!countModal.canEdit) { setCountModal({ open:false, route:null, dept:null, value:'', canEdit:true }); return; }
    const val = countModal.value === '' ? 0 : parseInt(countModal.value) || 0;
    setOtCounts(prev => ({ ...prev, [countsKey(countModal.route.id, countModal.dept.id)]: val }));
    await saveOtCount(countModal.route, countModal.dept, val);
    setCountModal({ open: false, route: null, dept: null, value: '', canEdit: true });
  };
  const formatTime = (t) => (typeof t === 'string' && t.length >= 5) ? t.slice(0,5) : t;
  const loadOtCounts = async () => {
    if (!otDate || !selectedShiftId || !selectedDepartTimeId) return;
    const params = new URLSearchParams({ date: otDate, shiftId: String(selectedShiftId), departTimeId: String(selectedDepartTimeId) });
    const data = await fetchJSON(`/api/ot/counts?${params.toString()}`);
    if (!Array.isArray(data)) { alert('โหลดจำนวนล้มเหลว'); return; }
    const map = {};
    (Array.isArray(data) ? data : []).forEach(row => {
      map[countsKey(row.route_id, row.department_id)] = row.count || 0;
    });
    setOtCounts(map);
  };
  const saveOtCount = async (route, dept, value) => {
    const plantId = dept.plant_id;
    const payload = {
      the_date: otDate,
      route_id: route.id,
      plant_id: plantId,
      department_id: dept.id,
      shift_id: selectedShiftId,
      depart_time_id: selectedDepartTimeId,
      count: Math.max(0, parseInt(value) || 0),
    };
    try {
      // Preflight: double-check latest lock state to avoid race with other users
      try {
        const [slotLock, deptLock] = await Promise.all([
          fetchJSON(`/api/ot/locks?date=${otDate}&shiftId=${selectedShiftId}&departTimeId=${selectedDepartTimeId}`),
          fetchJSON(`/api/ot/locks?date=${otDate}&departmentId=${dept.id}&shiftId=${selectedShiftId}&departTimeId=${selectedDepartTimeId}`),
        ]);
        const lockedNow = !!(slotLock?.is_locked) || !!(deptLock?.is_locked);
        if (lockedNow) {
          alert('ช่วงเวลานี้ถูกล็อกแล้ว ไม่สามารถบันทึกได้ กรุณาปลดล็อกก่อน');
          await loadOtLock();
          await loadOtCounts();
          return;
        }
      } catch (_) {
        // ignore preflight errors; proceed to submit and let server be source of truth
      }
      await postJSON('/api/ot/counts', payload);
    } catch (e) {
      // Map statuses to clear messages and refresh state
      const status = e?.status || 0;
      let msg = e?.message || 'บันทึกจำนวนล้มเหลว';
      if (status === 423) msg = 'ช่วงเวลานี้ถูกล็อกแล้ว ไม่สามารถบันทึกได้ กรุณาปลดล็อกก่อน';
      else if (status === 401) msg = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
      else if (status === 403) msg = 'ไม่มีสิทธิ์แก้ไขจำนวนของแผนกนี้';
      else if (status === 400) msg = 'ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง';
      alert(msg);
      try { await loadOtLock(); } catch {}
      try { await loadOtCounts(); } catch {}
    }
  };
  const loadOtLock = async () => {
    if (!otDate) return;
    // Day-level (legacy)
    try {
      const data = await fetchJSON(`/api/ot/locks?date=${otDate}`);
      if (data) setOtLockInfo(data);
    } catch {}
    // Time-slot global lock
    if (selectedShiftId && selectedDepartTimeId) {
      try {
        const data2 = await fetchJSON(`/api/ot/locks?date=${otDate}&shiftId=${selectedShiftId}&departTimeId=${selectedDepartTimeId}`);
        if (data2) setOtTimeLock(data2); else setOtTimeLock({ is_locked: 0 });
      } catch { setOtTimeLock({ is_locked: 0 }); }
    } else {
      setOtTimeLock({ is_locked: 0 });
    }
    // Department time-slot locks
    try {
      if (selectedShiftId && selectedDepartTimeId) {
        const deptIds = (Array.isArray(otDepartmentsApi) ? otDepartmentsApi.map(d=>d.id) : []);
        const pairs = await Promise.all(deptIds.map(async (id) => {
          const data = await fetchJSON(`/api/ot/locks?date=${otDate}&departmentId=${id}&shiftId=${selectedShiftId}&departTimeId=${selectedDepartTimeId}`);
          return [id, !!(data?.is_locked)];
        }));
        const map = {}; pairs.forEach(([id, v]) => { map[id] = v; });
        setOtDeptTimeLocks(map);
      } else {
        setOtDeptTimeLocks({});
      }
    } catch (e) {
      setOtDeptTimeLocks({});
    }
  };
  const toggleOtLock = async (forceLocked) => {
    if (!selectedShiftId || !selectedDepartTimeId) return alert('กรุณาเลือกกะและเวลา');
    const next = typeof forceLocked === 'boolean' ? (forceLocked ? 1 : 0) : (otTimeLock?.is_locked ? 0 : 1);
    // optimistic update for current time slot
    setOtTimeLock(prev => ({ ...(prev||{}), the_date: otDate, shift_id: selectedShiftId, depart_time_id: selectedDepartTimeId, is_locked: next }));
    try {
      await postJSON('/api/ot/locks', { the_date: otDate, is_locked: next, shift_id: selectedShiftId, depart_time_id: selectedDepartTimeId });
      await loadOtLock();
    } catch (e) {
      alert('สลับล็อคล้มเหลว');
      setOtTimeLock(prev => ({ ...(prev||{}), the_date: otDate, shift_id: selectedShiftId, depart_time_id: selectedDepartTimeId, is_locked: next ? 0 : 1 }));
    }
  };
  const toggleMyDeptLock = async (forceLocked) => {
    const myDeptIds = (Array.isArray(user?.department_ids) && user.department_ids.length)
      ? user.department_ids
      : (user?.department_id ? [user.department_id] : []);
    if (!myDeptIds.length) return alert('บัญชีของคุณยังไม่ได้ระบุแผนก');
    if (!selectedShiftId || !selectedDepartTimeId) return alert('กรุณาเลือกกะและเวลา');
    // Decide target state using current time-slot locks
    const anyUnlocked = myDeptIds.some(id => !otDeptTimeLocks[id]);
    const next = typeof forceLocked === 'boolean' ? (forceLocked ? 1 : 0) : (anyUnlocked ? 1 : 0);
    // Optimistic update for all my departments
    setOtDeptTimeLocks(prev => {
      const copy = { ...(prev || {}) };
      myDeptIds.forEach(id => { copy[id] = next; });
      return copy;
    });
    try {
      const results = await Promise.all(myDeptIds.map(async (id) => {
        try {
          await postJSON('/api/ot/locks', { the_date: otDate, is_locked: next, department_id: id, shift_id: selectedShiftId, depart_time_id: selectedDepartTimeId });
          return null;
        } catch (e) {
          return e?.message || 'error';
        }
      }));
      const firstErr = results.find(Boolean);
      if (firstErr) alert(firstErr || 'สลับล็อคแผนกล้มเหลว');
    } catch (e) {
      alert('สลับล็อคแผนกล้มเหลว');
    } finally {
      await loadOtLock();
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentPage === 'otReturn') {
      loadOtLock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otDate, selectedShiftId, selectedDepartTimeId, isLoggedIn, currentPage]);

  useEffect(() => {
    if (isLoggedIn && currentPage === 'otReturn' && selectedShiftId && selectedDepartTimeId) {
      loadOtCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otDate, selectedShiftId, selectedDepartTimeId]);

  // Load locations from API
  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      setLocationError(null);
      const data = await fetchJSON('/api/locations');
      if (Array.isArray(data)) {
        setLocations(data);
        if (data.length > 0 && !data.some((l) => l.name === registerForm.department)) {
          setRegisterForm((prev) => ({ ...prev, department: data[0].name }));
        }
      } else {
        setLocationError('โหลด location ไม่สำเร็จ');
      }
    } catch (err) {
      console.error('Fetch locations error', err);
      setLocationError(err?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    try {
      await postJSON('/api/locations', { name: newLocation.trim() });
      setNewLocation("");
      fetchLocations();
    } catch (err) {
      alert(err?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteLocation = async (id, name) => {
    if (!confirm(`ลบ location "${name}" ?`)) return;
    try {
      await deleteJSON('/api/locations', { id });
      fetchLocations();
    } catch (err) {
      alert(err?.message || "เกิดข้อผิดพลาด");
    }
  };

  // User management functions
  const loadUsers = async () => {
    try {
      setUserLoading(true);
      setUserError(null);
      const data = await fetchJSON('/api/users');
      if (Array.isArray(data)) setUsersList(data);
      else setUserError('โหลดผู้ใช้ล้มเหลว');
    } catch (e) {
      setUserError(e?.message || "เกิดข้อผิดพลาด");
    } finally {
      setUserLoading(false);
    }
  };

  const openEditUser = (u) => {
    setEditUser(u);
    setEditPassword("");
    setEditDepartment(u.department);
    setEditDeptIds(Array.isArray(u.department_ids) ? u.department_ids : (u.department_id ? [u.department_id] : []));
  };

  const submitEditUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const data = await putJSON('/api/users', {
        id: editUser.id,
        password: editPassword || undefined,
        department: editDepartment,
        plant_id: editUser.plant_id || null,
        department_id: (editDeptIds && editDeptIds.length ? editDeptIds[0] : (editUser.department_id || null)),
        department_ids: editDeptIds,
      });
      await loadUsers();
      setEditUser(null);
      alert(data?.message || 'บันทึกสำเร็จ');
    } catch (err) {
      alert(err?.message || "เกิดข้อผิดพลาด");
    }
  };

  const deleteUser = async (u) => {
    if (!confirm(`ลบผู้ใช้ ${u.username}?`)) return;
    try {
      const data = await deleteJSON('/api/users', { id: u.id });
      await loadUsers();
      alert(data?.message || 'ลบสำเร็จ');
    } catch (err) {
      alert(err?.message || "เกิดข้อผิดพลาด");
    }
  };

  // Function to open the product modal
  const openProductModal = (
    action,
    product = { id: "", name: "", vendor: "" }
  ) => {
    setProductAction(action);
    setProductForm(product);
    setShowProductModal(true);
  };

  // Function to handle product submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = productAction === 'edit'
        ? await putJSON('/api/products', productForm)
        : await postJSON('/api/products', productForm);
      alert(data?.message || 'บันทึกสำเร็จ');
      setShowProductModal(false);
      loadProducts();
    } catch (error) {
      console.error(error);
      alert(error?.message || "เกิดข้อผิดพลาด");
    }
  };

  // Function to handle product deletion
  const handleProductDelete = async (id) => {
    if (!confirm("ต้องการลบสินค้านี้หรือไม่?")) return;
    try {
      const data = await deleteJSON('/api/products', { id });
      alert(data?.message || 'ลบสำเร็จ');
      loadProducts();
    } catch (error) {
      console.error(error);
      alert(error?.message || "เกิดข้อผิดพลาด");
    }
  };

  // Sorted products for management table (not affecting main schedule display)
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (productSort === 'name') {
      return list.sort((a,b)=> (a.name||'').localeCompare(b.name||'', 'th')); 
    }
    if (productSort === 'vendor') {
      return list.sort((a,b)=> {
        const v = (a.vendor||'').localeCompare(b.vendor||'', 'th');
        if (v !== 0) return v;
        return (a.name||'').localeCompare(b.name||'', 'th');
      });
    }
    // added => by id asc (older first)
    return list.sort((a,b)=> (a.id||0) - (b.id||0));
  }, [products, productSort]);

  // Initial load (intentional single run)
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userData =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
      setCurrentPage("menu");
      loadProducts();
      loadBookings();
      fetchLocations();
      // Preload masters needed for greeting consistency
      fetchOtPlants();
      fetchOtDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isLoggedIn]);

  const loadProducts = async () => {
    try {
      const data = await fetchJSON('/api/products');
      setProducts(Array.isArray(data) ? data : (data?.products || []));
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await fetchJSON(`/api/bookings?date=${selectedDate}`);
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await postJSON('/api/auth/login', loginForm);
      if (data && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
    setCurrentPage("menu");
        loadProducts();
        loadBookings();
        fetchLocations();
        // Preload masters needed for greeting consistency
        fetchOtPlants();
        fetchOtDepartments();
        alert("เข้าสู่ระบบสำเร็จ");
      } else alert((data && data.error) || 'เข้าสู่ระบบล้มเหลว');
    } catch (error) {
      alert(error?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await postJSON('/api/auth/register', registerForm);
      if (data && !data.error) {
        alert("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
        setCurrentPage("login");
        setRegisterForm({ username: "", password: "", department: "AC" });
      } else alert((data && data.error) || 'สมัครสมาชิกล้มเหลว');
    } catch (error) {
      alert(error?.message || "เกิดข้อผิดพลาด");
    }
  };

  const getTruckBookings = (truckNumber) => {
    return bookings.filter((booking) => booking.truck_number === truckNumber);
  };

  const getTotalUsedPercentage = (truckNumber, productId) => {
    return bookings
      .filter(
        (b) => b.truck_number === truckNumber && b.product_id === productId
      )
      .reduce((total, b) => total + b.percentage, 0);
  };

  const getAvailablePercentage = (truckNumber, productId) => {
    return 100 - getTotalUsedPercentage(truckNumber, productId);
  };

  // Welcome text using shared formatter
  const welcomeText = useMemo(() => formatWelcome(user, otDepartmentsApi, otPlants), [user, otDepartmentsApi, otPlants]);

  const openBookingForm = (truckNumber, product) => {
    const available = getAvailablePercentage(truckNumber, product.id);
    if (available <= 0) {
      alert("คันนี้เต็มแล้ว ไม่สามารถจองได้");
      return;
    }
    setSelectedTruck(truckNumber);
    setShowBookingForm(true);
    setBookingForm({
      productId: product.id,
      department: user.department,
      percentage: available >= 100 ? 100 : 50,
      bookingDate: selectedDate,
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const available = getAvailablePercentage(
        selectedTruck,
        bookingForm.productId
      );
      if (bookingForm.percentage > available) {
        alert(`เปอร์เซ็นต์จองเกินที่ว่าง! เหลือ ${available}%`);
        return;
      }
      const data = await postJSON('/api/bookings', { ...bookingForm, truckNumber: selectedTruck });
      if (data && !data.error) {
        alert("จองสำเร็จ");
        setShowBookingForm(false);
        loadBookings();
        setBookingForm({
          productId: "",
          department: user.department,
          percentage: 50,
          bookingDate: new Date().toISOString().split("T")[0],
        });
      } else alert((data && data.error) || 'จองไม่สำเร็จ');
    } catch (error) {
      alert(error?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage("login");
  };

  const handleSaveAsImage = async () => {
    // Choose capture target by page
    let targetId = "dashboard-content";
    if (currentPage === "otReturn") targetId = "ot-return-capture"; // capture only controls+table
    else if (currentPage === "routeCheck") targetId = "route-content";

    const element = document.getElementById(targetId);
    if (!element) {
      alert("ไม่พบพื้นที่สำหรับบันทึกรูปภาพ");
      return;
    }
    // Night shift black background for OT Return snapshot
    let backgroundColor = '#ffffff';
    if (currentPage === 'otReturn') {
      try {
        const s = otShifts.find(x => x.id === selectedShiftId);
        const isNight = /กลางคืน/i.test(String(s?.name_th||'')) || /night/i.test(String(s?.name_en||''));
        if (isNight) backgroundColor = '#000000';
      } catch {}
    }
    const canvas = await html2canvas(element, { scale: 2, backgroundColor });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    const filename = `${currentPage || "dashboard"}.png`;
    link.download = filename;
    link.click();
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.authContainer}>
          <div style={styles.brandRow}>
            <FaBus size={40} />
            <h1 style={styles.brandTitle}>ระบบจองรถรับส่ง</h1>
          </div>

          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: 700, color: "#2f3e4f" }}>
                Username:
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: 700, color: "#2f3e4f" }}>
                Password:
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                style={styles.input}
                required
              />
            </div>
            <button type="submit" style={{ ...styles.submitButton, backgroundColor: "#2f4760" }}>
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Menu page (shown after login, before dashboard)
  if (isLoggedIn && currentPage === "menu") {
    return (
      <div style={styles.menuWrapper} id="route-content">
  <button onClick={handleLogout} style={{ ...styles.logoutTopRight, top: 68 }}>ออกจากระบบ</button>
        <div style={styles.menuCard}>
          <p style={styles.menuWelcome}>ยินดีต้อนรับ, {welcomeText}</p>
          <div style={styles.menuBrandRow}>
            <FaBus size={40} />
            <h1 style={styles.menuBrandTitle}>ระบบจองรถรับส่ง</h1>
          </div>
          <div style={styles.menuButtons}>
            {user.isAdmin && (
              <button
                style={{ ...styles.menuBtn, background: "#e74c3c" }}
                onClick={() => setCurrentPage("otMenu")}
              >แจ้ง OT (สำหรับแอดมิน)</button>
            )}
            <button
              style={{ ...styles.menuBtn, background: "#f1c40f", color: "#ffff" }}
              onClick={() => router.push('/truck-table')}
            >ตารางจัดรถขากลับ</button>
            <button
              style={{ ...styles.menuBtn, background: "#2ecc71" }}
              onClick={() => router.push('/transport-register')}
            >ขึ้นทะเบียนรถรับส่ง</button>
            <button
              style={{ ...styles.menuBtn, background: "#1abcde" }}
              onClick={() => setCurrentPage("routeCheck")}
            >ตรวจสอบเส้นทางรถ</button>
            {String(user?.username||'').toLowerCase()==='adminga' && (
              <button
                style={{ ...styles.menuBtn, background: "#8e44ad" }}
                onClick={() => setCurrentPage("vendor")}
              >สำหรับ Vendor</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // OT Admin page (after menu, before dashboard)
  if (isLoggedIn && currentPage === "otMenu") {
    if (!user?.isAdmin) {
      setCurrentPage("menu");
      return null;
    }
    return (
      <div style={styles.menuWrapper}>
  <button onClick={() => setCurrentPage('menu')} style={{ ...styles.logoutTopRight, background:'#34495e' }}>กลับเมนูหลัก</button>
  <button onClick={handleLogout} style={{ ...styles.logoutTopRight, top: 68 }}>ออกจากระบบ</button>
        <div style={styles.otCard}>
          <p style={styles.menuWelcome}>ยินดีต้อนรับ, {welcomeText}</p>
          <h1 style={styles.otTitle}>แจ้ง OT (สำหรับแอดมิน)</h1>
          <div style={styles.menuButtons}>
            <button
              style={{ ...styles.menuBtn, background: "#e74c3c" }}
              onClick={() => setCurrentPage("otReturn")}
            >
              <span style={styles.otBtnContent}>
                <FaBus size={28} />
                <span>แจ้ง OT รถกลับบ้าน</span>
              </span>
            </button>
            <button
              style={{ ...styles.menuBtn, background: "#f1c40f", color: "#ffff" }}
              onClick={() => router.push('/ot-overview')}
            >
              <span style={styles.otBtnContent}>
                <FaUtensils size={28} />
                <span>แจ้ง OT ภาพรวม</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vendor page (simple stub)
  if (isLoggedIn && currentPage === "vendor") {
    // Guard: only adminga can view vendor page
    if (String(user?.username||'').toLowerCase() !== 'adminga') {
      setCurrentPage('menu');
      return null;
    }
    return (
      <div style={styles.menuWrapper}>
  <button onClick={() => setCurrentPage('menu')} style={{ ...styles.logoutTopRight, background:'#34495e' }}>กลับเมนูหลัก</button>
  <button onClick={handleLogout} style={{ ...styles.logoutTopRight, top: 68 }}>ออกจากระบบ</button>
        <div style={styles.otCard}>
          <p style={styles.menuWelcome}>ยินดีต้อนรับ, {welcomeText}</p>
          <h1 style={styles.otTitle}>สำหรับ Vendor</h1>
          <div style={styles.menuButtons}>
            <button
              style={{ ...styles.menuBtn, background: "#e74c3c" }}
              onClick={() => router.push('/vendor-plan')}
            >
              <span style={styles.otBtnContent}>
                <FaBus size={28} />
                <span>แผนจัดรถ</span>
              </span>
            </button>
            <button
              style={{ ...styles.menuBtn, background: "#f1c40f", color: "#ffff" }}
              onClick={() => router.push('/vendor-costs')}
            >
              <span style={styles.otBtnContent}>
                <FaWallet size={28} />
                <span>คำนวณค่าใช้จ่าย</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Route Check page
  if (isLoggedIn && currentPage === "routeCheck") {
    const isAdminga = String(user?.username || '').toLowerCase() === 'adminga' || !!user?.is_super_admin;
    const lastUpdatedStr = routePdfsUpdatedAt
      ? new Date(routePdfsUpdatedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
      : '-';
  const onPickFile = (routeKey, column) => setUploadModal({ open: true, routeKey, column, file: null, _busy: false });
    const onFileChange = (e) => {
      const f = e.target.files?.[0] || null;
      const MAX_BYTES = 4 * 1024 * 1024; // ~4MB to stay under Vercel function payload limits
      if (f && f.size > MAX_BYTES) {
        alert('ไฟล์ใหญ่เกินไป (เกิน 4 MB) — กรุณาลดขนาดก่อนอัปโหลด');
        setUploadModal((m) => ({ ...m, file: null }));
        return;
      }
      setUploadModal((m) => ({ ...m, file: f }));
    };
    const savePdf = async () => {
      // prevent double-submit
      if (!uploadModal.file || uploadModal._busy) return;
      // guard again on size in case input validation was bypassed
      const MAX_BYTES = 4 * 1024 * 1024;
      if (uploadModal.file.size > MAX_BYTES) {
        alert('ไฟล์ใหญ่เกินไป (เกิน 4 MB) — กรุณาลดขนาดก่อนอัปโหลด');
        return;
      }
      setUploadModal((m) => ({ ...m, _busy: true }));
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result;
          // Prefer multipart/form-data to avoid base64 payload inflation on server limits
          const form = new FormData();
          form.append('routeKey', uploadModal.routeKey);
          form.append('column', uploadModal.column);
          form.append('file', uploadModal.file);
          // Use native fetch for multipart but add a timeout via AbortController
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 15000);
          let data = null;
          let ok = false;
          try {
            const res = await fetch('/api/route-pdfs/save', { method: 'POST', body: form, signal: controller.signal });
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              try { data = await res.json(); } catch {}
            } else {
              try { data = { error: await res.text() }; } catch {}
            }
            ok = res.ok;
          } finally {
            clearTimeout(tid);
          }
          if (ok && data?.ok) {
            const k = `${uploadModal.routeKey}-${uploadModal.column}`;
            setRoutePdfs((prev) => ({ ...prev, [k]: data.url }));
            setRoutePdfsUpdatedAt(Date.now());
            setUploadModal({ open: false, routeKey: null, column: null, file: null, _busy: false });
          } else {
            alert((data && data.error) || 'อัปโหลดไม่สำเร็จ');
            setUploadModal((m) => ({ ...m, _busy: false }));
          }
        } catch (err) {
          alert('เกิดข้อผิดพลาดในการบันทึกไฟล์');
          setUploadModal((m) => ({ ...m, _busy: false }));
        }
      };
      reader.onerror = () => {
        alert('ไม่สามารถอ่านไฟล์ได้');
        setUploadModal((m) => ({ ...m, _busy: false }));
      };
      reader.readAsDataURL(uploadModal.file);
    };

    return (
      <div style={styles.menuWrapper}>
        <button onClick={() => setCurrentPage('menu')} style={{ ...styles.logoutTopRight, background:'#34495e' }}>กลับเมนูหลัก</button>
        <button onClick={handleLogout} style={{ ...styles.logoutTopRight, top: 68 }}>ออกจากระบบ</button>
        <div style={styles.routeCard}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#2f3e4f' }}>
              <FaBus size={34} />
              <h1 style={styles.routeTitle}>ตรวจสอบเส้นทางรถ</h1>
            </div>
            <div style={styles.routeUpdate}>อัปเดตล่าสุดวันที่: {lastUpdatedStr}</div>
          </div>
          <table style={styles.routeTable}>
            <thead>
              <tr>
                <th style={styles.routeTh}>สายรถ</th>
                <th style={styles.routeTh}>กะกลางวัน<br/>Day Shift</th>
                <th style={styles.routeTh}>กะกลางวัน<br/>Day Shift</th>
              </tr>
            </thead>
            <tbody>
              {routeData.map((r, idx) => (
                <tr key={r.key}>
                  <td style={styles.routeTdName}>{idx+1}. {r.name}</td>
                  {['day','night'].map((col) => {
                    const key = `${r.key}-${col}`;
                    const url = routePdfs[key];
                    return (
                      <td key={col} style={styles.routeTd}>
                        {url ? (
                          <a style={styles.pdfLink} href={url} target="_blank" rel="noopener noreferrer">
                            <FaFilePdf size={28} />
                          </a>
                        ) : (
                          <span style={{ color: '#7f8c8d' }}>-</span>
                        )}
                        {isAdminga && (
                          <div style={{ marginTop: 8 }}>
                            <button style={styles.uploadBtn} onClick={() => onPickFile(r.key, col)}>เพิ่มไฟล์</button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAdminga && uploadModal.open && (
          <>
            <div style={styles.overlay} onClick={() => setUploadModal({ open: false, routeKey: null, column: null, file: null })} />
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>อัปโหลดไฟล์ PDF</h2>
              <div style={styles.modalFormGroup}>
                <label style={styles.modalLabel}>เลือกไฟล์ (PDF):</label>
                <input type="file" accept="application/pdf" onChange={onFileChange} style={styles.modalInput} />
              </div>
              <div style={styles.modalActions}>
                <button onClick={savePdf} disabled={!uploadModal.file} style={{ ...styles.confirmButton, opacity: uploadModal.file ? 1 : 0.5 }}>บันทึก</button>
                <button onClick={() => setUploadModal({ open: false, routeKey: null, column: null, file: null })} style={styles.cancelButton}>ยกเลิก</button>
              </div>
            </div>
          </>
        )}

        
      </div>
    );
  }

  // OT Return page
  if (isLoggedIn && currentPage === "otReturn") {
    const todayStr = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
    return (
  <div id="ot-return-content" style={{
        ...styles.otReturnWrapper,
        ...(() => {
          try {
            const s = otShifts.find(x => x.id === selectedShiftId);
            const isNight = /กลางคืน/i.test(String(s?.name_th||'')) || /night/i.test(String(s?.name_en||''));
            return isNight ? { background: '#000000' } : {};
          } catch { return {}; }
        })()
      }}>
        <div style={{ display:'flex', flexDirection:'column', gap: 16, width: '100%', maxWidth: 1340 }}>
          {/* Panel: หัวเรื่อง + ยินดีต้อนรับ */}
          <div style={{ ...styles.panelCard, paddingBottom: 16 }}>
            <div style={styles.otReturnHeaderRow}>
            <div>
              <h1 style={styles.otReturnTitle}>แจ้ง OT รถกลับบ้าน (สำหรับแอดมิน)</h1>
              <div style={{ color: '#2f3e4f', fontWeight: 600 }}>ยินดีต้อนรับ, {welcomeText}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 18, color: '#2f3e4f' }}>{todayStr}</div>
              <button onClick={() => setCurrentPage('menu')} style={{ ...styles.logoutButton, borderRadius: '12px', background:'#34495e' }}>กลับเมนูหลัก</button>
              <button onClick={handleLogout} style={{ ...styles.logoutButton, borderRadius: '12px' }}>ออกจากระบบ</button>
            </div>
            </div>
          </div>

          {/* Capture Wrapper: Controls + Table */}
          <div id="ot-return-capture">
            {/* Panel: ตัวเลือกวัน/กะ/เวลารถออก + ปุ่มย่อย */}
            <div style={{ ...styles.panelCard, paddingTop: 16 }}>
              <div style={styles.otReturnControls}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={styles.otReturnLabel}>เลือกวันที่:</span>
              <input type="date" value={otDate} onChange={(e)=>setOtDate(e.target.value)} style={styles.otReturnInput} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={styles.otReturnLabel}>กะ:</span>
              <select value={selectedShiftId || ''} onChange={(e)=>setSelectedShiftId(Number(e.target.value)||null)} style={styles.otReturnInput}>
                {otShifts.map(s=> (
                  <option key={s.id} value={s.id}>{s.name_th || s.name_en || `Shift ${s.id}`}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={styles.otReturnLabel}>เลือกเวลารถ:</span>
              <select value={selectedDepartTimeId || ''} onChange={(e)=>setSelectedDepartTimeId(Number(e.target.value)||null)} style={styles.otReturnInput}>
                {otDepartTimes
                  .filter(t => !selectedShiftId || t.shift_id === selectedShiftId)
                  .map(t => (
                    <option key={t.id} value={t.id}>{formatTime(t.time)}</option>
                  ))}
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                {user?.is_super_admin && (
                  <>
                    <button style={{ ...styles.otReturnAction, background: '#8e44ad' }} onClick={()=>{ fetchLocations(); loadUsers(); setShowUserModal(true); }}>แก้ไข User</button>
                    <button style={{ ...styles.otReturnAction, background: '#8e44ad' }} onClick={()=>setShowShiftModal(true)}>แก้ไขกะ</button>
                    <button style={{ ...styles.otReturnAction, background: '#8e44ad' }} onClick={()=>setShowTimeModal(true)}>แก้ไขเวลารถ</button>
                  </>
                )}
                <button style={styles.otReturnAction} onClick={handleSaveAsImage}>บันทึกรูปภาพ</button>
              </div>
              </div>
            </div>

            {/* Panel: ตารางสรุปจำนวนคนต่อสายรถ/แผนก */}
            <div style={{ ...styles.panelCardTight }}>
            <div style={{
              ...styles.otReturnTableWrap,
              ...(otTimeLock?.is_locked
                ? {
                    opacity: 0.5,
                    ...(String(user?.username || '').toLowerCase() === 'adminga'
                      ? {}
                      : { pointerEvents: 'none' }),
                  }
                : {})
            }}>
              {otMastersError && <div style={{ color: '#e74c3c', marginBottom: 8 }}>{otMastersError}</div>}
              <table style={styles.otReturnTable}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{...styles.otReturnThMain, width: 160}}>สายรถ</th>
                    <th rowSpan={2} style={{...styles.otReturnThMain, width: 64}}>รวม</th>
                    {plantCodesDynamic.map(code => (
                      <th key={`plant-h-${code}`} colSpan={otDepartmentsApi.filter(d=>d.plant_code===code).length} style={{...styles.otReturnThMain, background:getPlantColor(code), color:'#0f2a40'}}>{code}</th>
                    ))}
                  </tr>
                  <tr>
                    {plantCodesDynamic.flatMap(code => (
                      otDepartmentsApi.filter(d=>d.plant_code===code).map(d => (
                        <th key={`dept-${code}-${d.id}`} style={styles.otReturnThMain}>{d.code || d.name}</th>
                      ))
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {otRoutesApi.map((r,i)=> (
                    <tr key={r.id}>
                      <td style={styles.otReturnTdName}>{i+1}. {r.name}</td>
                      <td style={{...styles.otReturnTdCell, width: 64, fontWeight: 800}}>{getRouteTotal(r.id)}</td>
                      {plantCodesDynamic.flatMap(code => (
                        otDepartmentsApi.filter(d=>d.plant_code===code).map(d => {
                          const isLockedCell = !!(otTimeLock?.is_locked) || !!otDeptTimeLocks[d.id];
                          const canEdit = canEditCell(d);
                          const value = parseInt(otCounts[countsKey(r.id, d.id)]) || 0;
                          const cellStyle = {
                            ...styles.otReturnTdCell,
                            cursor: canEdit ? 'pointer' : 'default',
                            opacity: (isLockedCell ? 0.6 : (canEdit ? 1 : 0.35)),
                            ...(canEdit ? {} : { pointerEvents: 'none', backgroundColor: '#f5f6f7' })
                          };
                          return (
                            <td key={`cell-${code}-${i}-${d.id}`} style={{ ...cellStyle, ...(value > 0 ? { backgroundColor: '#eafaf1' } : {}) }} onClick={()=>openCountModal(r,d)}>
                              <span style={{ fontWeight: 700 }}>{value} คน</span>
                            </td>
                          );
                        })
                      ))}
                    </tr>
                  ))}
                  {otRoutesApi.length===0 && (
                    <tr>
                      <td colSpan={2 + otDepartmentsApi.length} style={{ textAlign: 'center', padding: 12, color: '#7f8c8d' }}>ไม่มีข้อมูลสายรถ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
              {/* Footer actions integrated into the same panel */}
              <div style={{ ...styles.otReturnFooter, padding: '10px 16px 16px', marginTop: 8 }}>
              {user?.is_super_admin ? (
                <>
                  <button style={{ ...styles.confirmButton, padding: '12px 18px' }} onClick={()=>toggleOtLock(true)}>ยืนยันการจอง</button>
                  <button style={{ ...styles.cancelButton, padding: '12px 18px' }} onClick={()=>toggleOtLock(false)}>ยกเลิก</button>
                </>
              ) : ((user?.isAdmin || user?.is_admin) && user?.department_id) ? (
                // <button style={{ ...styles.confirmButton, padding: '12px 18px' }} onClick={()=>toggleMyDeptLock(true)}>ยืนยันการจอง</button>
                //<button style={{ ...styles.cancelButton, padding: '12px 18px' }} onClick={()=>toggleMyDeptLock(false)}>ยกเลิก</button>
                //ถ้าจะให้ปรากกฎปุ่มเฉพาะให้ผู้ใช้ทั่วไป นำโค้ดข้างบนไปไว้ในคอมเม้นต์นี้
                <>
                  
                </>
              )
               : null}
              </div>
            </div>
          </div>

          {/* Count Editor Modal (moved into OT Return page) */}
          {countModal.open && (
            <>
              <div style={styles.overlay} onClick={()=>setCountModal({ open:false, route:null, dept:null, value:'', canEdit: true })} />
              <div style={styles.modal}>
                <h2 style={styles.modalTitle}>แก้ไขจำนวน ({countModal.route?.name} - {countModal.dept?.code || countModal.dept?.name})</h2>
                <div style={styles.modalFormGroup}>
                  <label style={styles.modalLabel}>จำนวนคน:</label>
                  <input
                    type="number"
                    min={0}
                    value={countModal.value}
                    onChange={(e)=>{
                      const onlyNum = e.target.value.replace(/[^0-9]/g,'');
                      setCountModal(prev=>({ ...prev, value: onlyNum }));
                    }}
                    onKeyDown={(e)=>{ if (e.key==='Enter') submitCountModal(); }}
                    style={styles.modalInput}
                    disabled={!countModal.canEdit}
                    autoFocus
                  />
                </div>
                {!countModal.canEdit && (
                  <div style={{ color:'#e67e22', fontSize:13 }}>วันถูกล็อคหรือสิทธิ์ของคุณไม่ตรงกับโรงงาน/แผนกนี้</div>
                )}
                <div style={styles.modalButtonGroup}>
                  <button onClick={submitCountModal} style={styles.confirmButton}>บันทึก</button>
                  <button onClick={()=>setCountModal({ open:false, route:null, dept:null, value:'', canEdit: true })} style={styles.cancelButton}>ยกเลิก</button>
                </div>
              </div>
            </>
          )}

          {/* Manage Routes Section (Admin only) */}
          {user?.is_super_admin && (
          <div style={{
            marginTop: 24,
            backgroundColor: '#ffffff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>แก้ไขข้อมูลสายรถ</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <button onClick={() => openRouteModal('add')} style={{ ...styles.confirmButton, backgroundColor: '#27ae60' }}>➕ เพิ่มสายรถ</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 14, color: '#2c3e50', fontWeight: 600 }}>จัดเรียง:</label>
                <select
                  value={routeSort}
                  onChange={(e)=>setRouteSort(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #bdc3c7', background: '#fff', fontSize: 14, cursor: 'pointer' }}
                >
                  <option value="added">ลำดับตามที่เพิ่ม</option>
                  <option value="name">ชื่อสายรถ (ก-ฮ)</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#17344f', color: 'white' }}>
                    <th style={styles.tableHeader}>สายรถ</th>
                    <th style={styles.tableHeader}>Vendor</th>
                    <th style={styles.tableHeader}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(routeSort === 'added' ? otRoutesApi
                    : routeSort === 'name' ? [...otRoutesApi].sort((a,b)=> (a.name||'').localeCompare(b.name||'','th'))
                    : [...otRoutesApi].sort((a,b)=> (a.vendor||'').localeCompare(b.vendor||'','th'))
                  ).map((r, idx) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #dfe6e9' }}>
                      <td style={{ padding: '12px' }}>{idx+1}. {r.name}</td>
                      <td style={{ padding: '12px' }}>{r.vendor}</td>
                      <td style={{ padding: '12px', display: 'flex', gap: 10 }}>
                        <button onClick={() => openRouteModal('edit', r)} style={{ padding: '8px 12px', backgroundColor: '#34b3ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>แก้ไข</button>
                        <button onClick={() => handleRouteDelete(r.id)} style={{ padding: '8px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>ลบ</button>
                      </td>
                    </tr>
                  ))}
                  {otRoutesApi.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#7f8c8d' }}>ไม่มีสายรถ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Route Modal */}
          {showRouteModal && (
            <>
              <div style={styles.overlay} onClick={() => setShowRouteModal(false)}></div>
              <div style={styles.modal}>
                <h2 style={styles.modalTitle}>{routeAction === 'edit' ? 'แก้ไขสายรถ' : 'เพิ่มสายรถ'}</h2>
                <form onSubmit={handleRouteSubmit}>
                  <div style={styles.modalFormGroup}>
                    <label style={styles.modalLabel}>ชื่อสายรถ:</label>
                    <input
                      type="text"
                      value={routeForm.name}
                      onChange={(e)=>setRouteForm(prev=>({...prev, name: e.target.value}))}
                      style={styles.modalInput}
                      required
                    />
                  </div>
                  <div style={styles.modalFormGroup}>
                    <label style={styles.modalLabel}>Vendor:</label>
                    <input
                      type="text"
                      value={routeForm.vendor}
                      onChange={(e)=>setRouteForm(prev=>({...prev, vendor: e.target.value}))}
                      style={styles.modalInput}
                    />
                  </div>
                  <div style={styles.modalButtonGroup}>
                    <button type="submit" style={styles.confirmButton}>บันทึก</button>
                    <button type="button" onClick={()=>setShowRouteModal(false)} style={styles.cancelButton}>ยกเลิก</button>
                    {routeAction === 'edit' && (
                      <button type="button" onClick={()=>{ handleRouteDelete(routeForm.id); setShowRouteModal(false); }} style={styles.deleteButton}>ลบ</button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}
          
          {/* Manage Departments Section (Super admin only) */}
          {user?.is_super_admin && (
          <div style={{
            marginTop: 24,
            backgroundColor: '#ffffff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>แก้ไขข้อมูลแผนก</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <button onClick={() => openDeptModal('add')} style={{ ...styles.confirmButton, backgroundColor: '#27ae60' }}>➕ เพิ่มแผนก</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 14, color: '#2c3e50', fontWeight: 600 }}>จัดเรียง:</label>
                <select value={deptSort} onChange={(e)=>setDeptSort(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #bdc3c7', background: '#fff', fontSize: 14, cursor: 'pointer' }}>
                  <option value="added">ลำดับตามที่เพิ่ม</option>
                  <option value="plant">โรงงาน</option>
                  <option value="name">แผนก (ก-ฮ)</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#17344f', color: 'white' }}>
                    <th style={styles.tableHeader}>โรงงาน</th>
                    <th style={styles.tableHeader}>แผนก</th>
                    <th style={styles.tableHeader}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    deptSort === 'added' ? otDepartmentsApi
                    : deptSort === 'plant' ? [...otDepartmentsApi].sort((a,b)=> (a.plant_code||'').localeCompare(b.plant_code||'','th'))
                    : [...otDepartmentsApi].sort((a,b)=> (a.name||a.code||'').localeCompare(b.name||b.code||'','th'))
                  ).map((d)=> (
                    <tr key={d.id} style={{ borderBottom: '1px solid #dfe6e9' }}>
                      <td style={{ padding: 12 }}>
                        <span style={{ display: 'inline-block', padding: '10px 18px', borderRadius: 8, background: deptColors[d.plant_code]||'#ccc', color: '#0f2a40', fontWeight: 900, minWidth: 70, textAlign: 'center' }}>{d.plant_code}</span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ display: 'inline-block', padding: '10px 18px', borderRadius: 8, background: '#eafaf1', color: '#0f2a40', fontWeight: 900, minWidth: 70, textAlign: 'center' }}>{d.name || d.code}</span>
                      </td>
                      <td style={{ padding: 12, display: 'flex', gap: 10 }}>
                        <button onClick={()=>openDeptModal('edit', d)} style={{ padding: '8px 12px', backgroundColor: '#34b3ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>แก้ไข</button>
                        <button onClick={()=>deleteDept(d.id)} style={{ padding: '8px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>ลบ</button>
                      </td>
                    </tr>
                  ))}
                  {otDepartmentsApi.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#7f8c8d' }}>ไม่มีแผนก</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Dept Modal (Super admin only) */}
          {showDeptModal && user?.is_super_admin && (
            <>
              <div style={styles.overlay} onClick={()=>setShowDeptModal(false)}></div>
              <div style={styles.modal}>
                <h2 style={styles.modalTitle}>{deptAction==='edit' ? 'แก้ไขแผนก' : 'เพิ่มแผนก'}</h2>
                <form onSubmit={submitDept}>
                  <div style={styles.modalFormGroup}>
                    <label style={styles.modalLabel}>โรงงาน:</label>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <select value={deptForm.plant_id} onChange={(e)=>setDeptForm(prev=>({...prev, plant_id: Number(e.target.value)||''}))} style={{ ...styles.modalSelect, flex:1 }}>
                        {otPlants.map(p=> <option key={p.id} value={p.id}>{p.code}</option>)}
                      </select>
                      <button type="button" onClick={()=>{ setAddingPlant(v=>!v); setManagePlants(false); }} style={{ padding:'10px 12px', border:'1px solid #bdc3c7', borderRadius:8, background:'#f5f7f9', fontWeight:700 }}>+ เพิ่ม</button>
                      <button type="button" onClick={()=>{ setManagePlants(v=>!v); setAddingPlant(false); }} style={{ padding:'10px 12px', border:'1px solid #bdc3c7', borderRadius:8, background:'#f5f7f9', fontWeight:700 }}>จัดการ</button>
                    </div>
                    {addingPlant && (
                      <div style={{ display:'flex', gap:8, marginTop:8 }}>
                        <input placeholder="ชื่อ/รหัสโรงงาน (เช่น AC)" value={newPlantText} onChange={(e)=>setNewPlantText(e.target.value)} style={{ ...styles.modalInput, flex:1 }} />
                        <button type="button" onClick={addPlantInline} style={styles.confirmButton}>บันทึก</button>
                        <button type="button" onClick={()=>{ setAddingPlant(false); setNewPlantText(''); }} style={styles.cancelButton}>ยกเลิก</button>
                      </div>
                    )}
                    {managePlants && (
                      <div style={{ marginTop:8, border:'1px solid #ecf0f1', borderRadius:8, maxHeight:180, overflowY:'auto' }}>
                        {otPlants.length===0 && <div style={{ padding:10, color:'#7f8c8d' }}>ยังไม่มีโรงงาน</div>}
                        {otPlants.map(p => (
                          <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', borderBottom:'1px solid #ecf0f1' }}>
                            <div style={{ fontWeight:700, color:'#2f3e4f' }}>{p.code}{p.name && p.name!==p.code ? ` - ${p.name}`: ''}</div>
                            <button type="button" onClick={()=>deletePlantInline(p.id, p.code)} style={styles.deleteButton}>ลบ</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={styles.modalFormGroup}>
                    <label style={styles.modalLabel}>ชื่อแผนก:</label>
                    <input type="text" value={deptForm.name} onChange={(e)=>setDeptForm(prev=>({...prev, name: e.target.value}))} style={styles.modalInput} required />
                  </div>
                  <div style={styles.modalButtonGroup}>
                    <button type="submit" style={styles.confirmButton}>บันทึก</button>
                    <button type="button" onClick={()=>setShowDeptModal(false)} style={styles.cancelButton}>ยกเลิก</button>
                    {deptAction==='edit' && (
                      <button type="button" onClick={()=>{ deleteDept(deptForm.id); setShowDeptModal(false); }} style={styles.deleteButton}>ลบ</button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Shift Modal */}
  {showShiftModal && user?.is_super_admin && (
          <>
            <div style={styles.overlay} onClick={()=>setShowShiftModal(false)} />
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>จัดการ กะ / Shift</h2>
              <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                <input type="text" placeholder="ชื่อกะ (ไทย)" value={newShiftTh} onChange={(e)=>setNewShiftTh(e.target.value)} style={styles.modalInput} />
                <input type="text" placeholder="ชื่อกะ (EN)" value={newShiftEn} onChange={(e)=>setNewShiftEn(e.target.value)} style={styles.modalInput} />
                <button
                  onClick={async ()=>{
                    if (!newShiftTh.trim() && !newShiftEn.trim()) return;
                    try {
                      await postJSON('/api/ot/shifts', { name_th: newShiftTh.trim() || null, name_en: newShiftEn.trim() || null });
                      setNewShiftTh(''); setNewShiftEn('');
                      fetchOtShifts();
                    } catch (e) {
                      alert(e?.message || 'เพิ่มกะล้มเหลว');
                    }
                  }}
                  style={styles.confirmButton}
                >เพิ่ม</button>
              </div>
              <div style={{ border:'1px solid #ecf0f1', borderRadius:8, maxHeight: 260, overflowY: 'auto' }}>
                {otShifts.map(s => (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderBottom:'1px solid #ecf0f1' }}>
                    <div>
                      <div style={{ fontWeight:700, color:'#2f3e4f' }}>{s.name_th || s.name_en || `Shift ${s.id}`}</div>
                      {(s.name_th && s.name_en) && <div style={{ fontSize:12, color:'#7f8c8d' }}>{s.name_en}</div>}
                    </div>
                    <button
                      onClick={async ()=>{
                        if (!confirm('ลบกะนี้?')) return;
                        try {
                          await deleteJSON(`/api/ot/shifts?id=${s.id}`);
                          fetchOtShifts();
                        } catch (e) {
                          alert(e?.message || 'ลบกะล้มเหลว');
                        }
                      }}
                      style={styles.deleteButton}
                    >ลบ</button>
                  </div>
                ))}
                {otShifts.length===0 && <div style={{ padding: 12, color:'#7f8c8d' }}>ไม่มีข้อมูลกะ</div>}
              </div>
              <div style={styles.modalButtonGroup}>
                <button onClick={fetchOtShifts} style={{...styles.confirmButton, backgroundColor:'#3498db'}}>รีเฟรช</button>
                <button onClick={()=>setShowShiftModal(false)} style={styles.cancelButton}>ปิด</button>
              </div>
            </div>
          </>
        )}

        {/* Time Modal */}
  {showTimeModal && user?.is_super_admin && (
          <>
            <div style={styles.overlay} onClick={()=>setShowTimeModal(false)} />
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>จัดการ เวลารถออก - เข้า</h2>
              <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
                <select value={selectedShiftId || ''} onChange={(e)=>setSelectedShiftId(Number(e.target.value)||null)} style={styles.modalSelect}>
                  {otShifts.map(s => <option key={s.id} value={s.id}>{s.name_th || s.name_en || `Shift ${s.id}`}</option>)}
                </select>
                <input type="time" value={newDepartTime} onChange={(e)=>setNewDepartTime(e.target.value)} style={styles.modalInput} />
                <select value={newDepartIsEntry} onChange={(e)=> setNewDepartIsEntry(Number(e.target.value)||0)} style={styles.modalSelect}>
                  <option value={0}>เวลาออก</option>
                  <option value={1}>เวลาเข้า</option>
                </select>
                <button
                  onClick={async ()=>{
                    if (!selectedShiftId || !newDepartTime) return;
                    try {
                      await postJSON('/api/ot/depart-times', { shift_id: selectedShiftId, time: newDepartTime, is_entry: newDepartIsEntry ? 1 : 0 });
                      setNewDepartTime('');
                      setNewDepartIsEntry(0);
                      fetchOtDepartTimes(selectedShiftId);
                    } catch (e) {
                      alert(e?.message || 'เพิ่มเวลาออกล้มเหลว');
                    }
                  }}
                  style={styles.confirmButton}
                >เพิ่ม</button>
              </div>
              <div style={{ border:'1px solid #ecf0f1', borderRadius:8, maxHeight: 260, overflowY: 'auto' }}>
                {otDepartTimes.filter(t=>!selectedShiftId || t.shift_id === selectedShiftId).map(t => (
                  <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderBottom:'1px solid #ecf0f1', gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'#2f3e4f' }}>{(otShifts.find(s=>s.id===t.shift_id)?.name_th) || 'กะ'}</div>
                      <div style={{ fontSize:12, color:'#7f8c8d' }}>
                        {editingDepartTime?.id === t.id ? (
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                            <input type="time" value={editingDepartTime.time}
                                   onChange={(e)=> setEditingDepartTime(prev=> ({ ...prev, time: e.target.value }))}
                                   style={{ ...styles.modalInput, width:140 }} />
                            <select value={Number(editingDepartTime.is_entry)||0} onChange={(e)=> setEditingDepartTime(prev=> ({ ...prev, is_entry: Number(e.target.value)||0 }))} style={{ ...styles.modalSelect, width:120 }}>
                              <option value={0}>เวลาออก</option>
                              <option value={1}>เวลาเข้า</option>
                            </select>
                          </div>
                        ) : (
                          <>
                            {formatTime(t.time)} น.
                            <span style={{ marginLeft:8, padding:'2px 6px', borderRadius:6, fontSize:11, fontWeight:800, color: t.is_entry ? '#0b5345' : '#7f3f00', background: t.is_entry ? '#e8f8f5' : '#fff4e6' }}>
                              {t.is_entry ? 'เข้า' : 'ออก'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {editingDepartTime?.id === t.id ? (
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          onClick={async ()=>{
                            try {
                              const body = { id: t.id, time: editingDepartTime.time, shift_id: t.shift_id, is_entry: Number(editingDepartTime.is_entry)||0 };
                              await putJSON('/api/ot/depart-times', body);
                              setEditingDepartTime(null);
                              fetchOtDepartTimes(selectedShiftId);
                            } catch (e) {
                              alert(e?.message || 'อัปเดตเวลาออกล้มเหลว');
                            }
                          }}
                          style={styles.confirmButton}
                        >บันทึก</button>
                        <button onClick={()=> setEditingDepartTime(null)} style={styles.cancelButton}>ยกเลิก</button>
                      </div>
                    ) : (
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          onClick={()=> setEditingDepartTime({ id: t.id, time: (typeof t.time === 'string' && t.time.length>=5) ? t.time.slice(0,5) : t.time, is_entry: Number(t.is_entry)||0 })}
                          style={{ ...styles.confirmButton, backgroundColor:'#8e44ad' }}
                        >แก้ไข</button>
                        <button
                          onClick={async ()=>{
                            if (!confirm('ลบเวลาออก/เข้า นี้?')) return;
                            try {
                              await deleteJSON(`/api/ot/depart-times?id=${t.id}`);
                              fetchOtDepartTimes(selectedShiftId);
                            } catch (e) {
                              alert(e?.message || 'ลบเวลาออก/เข้าล้มเหลว');
                            }
                          }}
                          style={styles.deleteButton}
                        >ลบ</button>
                      </div>
                    )}
                  </div>
                ))}
                {otDepartTimes.filter(t=>!selectedShiftId || t.shift_id === selectedShiftId).length===0 && <div style={{ padding: 12, color:'#7f8c8d' }}>ยังไม่มีเวลา</div>}
              </div>
              <div style={styles.modalButtonGroup}>
                <button onClick={()=>fetchOtDepartTimes(selectedShiftId)} style={{...styles.confirmButton, backgroundColor:'#3498db'}}>รีเฟรช</button>
                <button onClick={()=>setShowTimeModal(false)} style={styles.cancelButton}>ปิด</button>
              </div>
            </div>
          </>
        )}

        {/* User Management Modal (for OT Return page) */}
  {showUserModal && user?.is_super_admin && (
          <>
            <div style={styles.overlay} onClick={() => setShowUserModal(false)}></div>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>จัดการผู้ใช้</h2>
              {userLoading && <div style={{ marginBottom: 10 }}>กำลังโหลด...</div>}
              {userError && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{userError}</div>}
              {/* Create User */}
              <form onSubmit={async (e)=>{
                e.preventDefault();
                try {
                  const selectedDeptIds = Array.isArray(newUserDeptIds) ? newUserDeptIds : [];
                  const mainDeptId = selectedDeptIds.length ? selectedDeptIds[0] : (newUser.department_id || null);
                  const payload = {
                    username: newUser.username.trim(),
                    password: newUser.password,
                    plant_id: newUser.plant_id || null,
                    department_id: mainDeptId,
                    department_ids: selectedDeptIds,
                    is_admin: 1,
                    is_super_admin: 0,
                  };
                  await postJSON('/api/users', payload);
                  setNewUser({ username: '', password: '', display_name: '', department: '', plant_id: '', department_id: '' });
                  setNewUserDeptIds([]);
                  await loadUsers();
                  alert('เพิ่มผู้ใช้สำเร็จ');
                } catch (err) {
                  alert(err?.message || 'เกิดข้อผิดพลาด');
                }
              }} style={{ border: '1px solid #ecf0f1', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <h3 style={{ marginTop: 0, fontSize: 16 }}>เพิ่มผู้ใช้ใหม่</h3>
                <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                  <input placeholder="Username" value={newUser.username} onChange={(e)=>setNewUser(prev=>({...prev, username: e.target.value}))} style={{ ...styles.modalInput, flex:1 }} required />
                  <input placeholder="Password" type="password" value={newUser.password} onChange={(e)=>setNewUser(prev=>({...prev, password: e.target.value}))} style={{ ...styles.modalInput, flex:1 }} required />
                </div>
                <div style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                  <select value={newUser.plant_id} onChange={(e)=>{
                    const pid = Number(e.target.value) || '';
                    setNewUser(prev=>({...prev, plant_id: pid, department_id: ''}));
                    const allowed = otDepartmentsApi.filter(d=>!pid || d.plant_id === pid).map(d=>d.id);
                    setNewUserDeptIds(prev => prev.filter(id => allowed.includes(id)));
                  }} style={{ ...styles.modalSelect, flex:1 }}>
                    <option value="">เลือกโรงงาน</option>
                    {otPlants.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                  </select>
                  <div style={{ flex:1, minHeight:120, maxHeight:200, overflowY:'auto', border:'1px solid #bdc3c7', borderRadius:8, padding:8 }}>
                    {otDepartmentsApi
                      .filter(d=>!newUser.plant_id || d.plant_id === newUser.plant_id)
                      .map(d => {
                        const checked = newUserDeptIds.includes(d.id);
                        return (
                          <label key={d.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 2px', cursor:'pointer' }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e)=>{
                                setNewUserDeptIds(prev => {
                                  const set = new Set(prev);
                                  if (e.target.checked) set.add(d.id); else set.delete(d.id);
                                  return Array.from(set);
                                });
                              }}
                            />
                            <span>{d.code || d.name}</span>
                          </label>
                        );
                      })}
                    {otDepartmentsApi.filter(d=>!newUser.plant_id || d.plant_id === newUser.plant_id).length===0 && (
                      <div style={{ color:'#7f8c8d' }}>ไม่มีแผนกในโรงงานนี้</div>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <button type="submit" style={{ ...styles.confirmButton, marginLeft: 'auto' }}>เพิ่มผู้ใช้</button>
                </div>
              </form>
              <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #ecf0f1', borderRadius: 8, marginBottom: 15 }}>
                {usersList.map((u) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{u.username}</strong>
                    </div>
                    <button
                      onClick={async () => { await Promise.all([fetchOtPlants(), fetchOtDepartments()]); openEditUser(u); }}
                      style={{ ...styles.confirmButton, padding: '6px 10px', backgroundColor: '#3498db' }}
                    >แก้ไข</button>
                    {u.username !== 'adminscrap' && !u.is_super_admin && (
                      <button
                        onClick={() => deleteUser(u)}
                        style={{ ...styles.deleteButton, padding: '6px 10px' }}
                      >ลบ</button>
                    )}
                  </div>
                ))}
                {!userLoading && usersList.length === 0 && (
                  <div style={{ padding: 12, color: '#7f8c8d' }}>ไม่มีผู้ใช้</div>
                )}
              </div>
              {editUser && (
                <form onSubmit={submitEditUser} style={{ border: '1px solid #ecf0f1', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <h3 style={{ marginTop: 0, fontSize: 16 }}>แก้ไข: {editUser.username}</h3>
                  <div style={{ marginBottom: 10 }}>
                    <label style={styles.modalLabel}>รหัสผ่านใหม่ (ว่าง = ไม่เปลี่ยน)</label>
                    <input type="password" value={editPassword} onChange={(e)=>setEditPassword(e.target.value)} style={styles.modalInput} />
                  </div>
                  {/* Removed legacy Department field */}
                  <div style={{ display:'flex', gap:10, marginBottom: 10, alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <label style={styles.modalLabel}>โรงงาน</label>
                      <select
                        value={editUser.plant_id || ''}
                        onChange={(e)=> {
                          const pid = Number(e.target.value)||null;
                          setEditUser(prev=> ({ ...prev, plant_id: pid }));
                          const allowed = otDepartmentsApi.filter(d=>!pid || d.plant_id === pid).map(d=>d.id);
                          setEditDeptIds(prev => prev.filter(id => allowed.includes(id)));
                        }}
                        style={styles.modalSelect}
                      >
                        <option value="">- ไม่ระบุ -</option>
                        {otPlants.map(p=> <option key={p.id} value={p.id}>{p.code}</option>)}
                      </select>
                    </div>
                    <div style={{ flex:1 }}>
                      <label style={styles.modalLabel}>แผนก (ติ๊กได้หลายแผนก)</label>
                      <div style={{ minHeight:120, maxHeight:200, overflowY:'auto', border:'1px solid #bdc3c7', borderRadius:8, padding:8 }}>
                        {otDepartmentsApi
                          .filter(d => !editUser.plant_id || d.plant_id === editUser.plant_id)
                          .map(d=> {
                            const checked = editDeptIds.includes(d.id);
                            return (
                              <label key={d.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 2px', cursor:'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e)=>{
                                    setEditDeptIds(prev => {
                                      const set = new Set(prev);
                                      if (e.target.checked) set.add(d.id); else set.delete(d.id);
                                      return Array.from(set);
                                    });
                                  }}
                                />
                                <span>{d.code || d.name}</span>
                              </label>
                            );
                          })}
                        {otDepartmentsApi.filter(d => !editUser.plant_id || d.plant_id === editUser.plant_id).length===0 && (
                          <div style={{ color:'#7f8c8d' }}>ไม่มีแผนกในโรงงานนี้</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={styles.modalButtonGroup}>
                    <button type="submit" style={styles.confirmButton}>บันทึก</button>
                    <button type="button" onClick={()=>setEditUser(null)} style={styles.cancelButton}>ยกเลิก</button>
                  </div>
                </form>
              )}
              <div style={styles.modalButtonGroup}>
                <button type="button" onClick={()=>loadUsers()} style={{ ...styles.confirmButton, backgroundColor:'#9b59b6' }}>รีเฟรช</button>
                <button type="button" onClick={()=>setShowUserModal(false)} style={styles.cancelButton}>ปิด</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer} id="dashboard-content">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>ระบบจองรถ - Dashboard</h1>
          <p style={styles.welcomeText}>
            ยินดีต้อนรับ, {formatWelcome()}
          </p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.dateInfo}>
            {new Date(selectedDate).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <button onClick={() => setCurrentPage('menu')} style={{ ...styles.logoutButton, background:'#34495e' }}>กลับเมนูหลัก</button>
          <button onClick={handleLogout} style={styles.logoutButton}>ออกจากระบบ</button>
        </div>
      </div>

      {/* Date Selector */}
      <div
        style={{
          ...styles.dateSelector,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="date" style={styles.dateLabel}>
            เลือกวันที่:
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <div style={styles.actionButtonGroup}>
          <a
            href="/dashboard"
            style={{
              ...styles.actionButton,
              backgroundColor: "#3498db",
              textDecoration: "none",
            }}
          >
            เปิดหน้า /dashboard
          </a>
          {user.username === 'adminscrap' && (
            <button
              onClick={() => { fetchLocations(); setShowLocationModal(true); }}
              style={{
                ...styles.actionButton,
                backgroundColor: '#8e44ad',
              }}
            >แก้ไข Location</button>
          )}
          <button
            onClick={handleSaveAsImage}
            style={{
              ...styles.actionButton,
              backgroundColor: "#2ecc71",
            }}
          >บันทึกเป็นรูปภาพ</button>
          {user.username === 'adminscrap' && (
            <button
              onClick={async () => { await Promise.all([fetchOtPlants(), fetchOtDepartments(), loadUsers()]); setShowUserModal(true); }}
              style={{
                ...styles.actionButton,
                backgroundColor: '#1abc9c',
              }}
            >แก้ไข User</button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th
                style={{
                  ...styles.tableHeaderFirst,
                  backgroundColor: "#2c3e50", // A dark shade for a professional look
                }}
                rowSpan={2}
              >
                ประเภทสินค้า
              </th>
              <th
                style={{ ...styles.tableHeader, backgroundColor: "#2c3e50" }}
                rowSpan={2}
              >
                Vendor
              </th>
              <th
                style={{ ...styles.tableHeader, textAlign: "center", backgroundColor: "#3498db" }}
                colSpan={2}
              >
                08:00 - 12:00
              </th>
              <th
                style={{ ...styles.tableHeader, textAlign: "center", backgroundColor: "#2ecc71" }}
                colSpan={2}
              >
                13:00 - 17:00
              </th>
              <th
                style={{ ...styles.tableHeader, textAlign: "center", backgroundColor: "#e74c3c" }}
                colSpan={2}
              >
                18:00 - 20:00
              </th>
            </tr>
            <tr>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <th
                  key={num}
                  style={{
                    ...styles.tableHeader,
                    backgroundColor: "#34495e",
                  }}
                >
                  คันที่ {num}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={styles.productNameCell}>{product.name}</td>
                <td style={styles.vendorCell}>{product.vendor}</td>
                {[1, 2, 3, 4, 5, 6].map((truckNum) => {
                  const truckBookings = getTruckBookings(truckNum).filter(
                    (b) => b.product_id === product.id
                  );
                  return (
                    <td
                      key={truckNum}
                      style={styles.bookingCell}
                      onClick={() => openBookingForm(truckNum, product)}
                    >
                      <div style={{ display: "flex", height: "100%" }}>
                        {truckBookings.length === 0 && (
                          <div
                            style={{
                              margin: "auto",
                              color: "#ccc",
                              fontWeight: "bold",
                            }}
                          >
                            -
                          </div>
                        )}
                        {truckBookings.map((b) => (
                          <div
                            key={b.id}
                            style={{
                              backgroundColor:
                                b.department === "AC"
                                  ? "#e74c3c" // Red
                                  : b.department === "RF"
                                  ? "#f1c40f" // Yellow
                                  : "#3498db", // Blue
                              width: `${b.percentage}%`,
                              color: "white",
                              textAlign: "center",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              cursor: "pointer",
                              padding: "0 5px",
                            }}
                          >
                            <span
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {b.department}
                            </span>
                            {(b.username === user.username || user.isAdmin) && (
                              <span
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm("ต้องการยกเลิก booking นี้หรือไม่?")
                                  ) {
                                    try {
                                      await deleteJSON(`/api/bookings/${b.id}`);
                                      alert("ลบ booking สำเร็จ");
                                      loadBookings();
                                    } catch (err) {
                                      alert(err?.message || 'ลบไม่สำเร็จ');
                                    }
                                  }
                                }}
                                style={{
                                  position: "absolute",
                                  top: "2px",
                                  right: "2px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  fontSize: "12px",
                                  color: "white",
                                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                                }}
                              >
                                ❌
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Product Management Section */}
      {user.isAdmin && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginBottom: "15px", color: "#2c3e50" }}>
            จัดการสินค้า
          </h2>

          {/* Add Product Button */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '15px' }}>
            <button
              onClick={() => openProductModal("add")}
              style={{
                padding: "10px 15px",
                backgroundColor: "#2ecc71",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ➕ เพิ่มสินค้า
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 14, color: '#2c3e50', fontWeight: 600 }}>จัดเรียง:</label>
              <select
                value={productSort}
                onChange={(e)=> setProductSort(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #bdc3c7',
                  background: '#fff',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                <option value="added">ลำดับที่เพิ่ม</option>
                <option value="name">ชื่อสินค้า (ก-ฮ)</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
          </div>

          {/* Product Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#34495e", color: "white" }}>
                  <th style={styles.tableHeader}>ชื่อสินค้า</th>
                  <th style={styles.tableHeader}>Vendor</th>
                  <th style={styles.tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #dfe6e9" }}>
                    <td style={{ padding: "12px" }}>{p.name}</td>
                    <td style={{ padding: "12px" }}>{p.vendor}</td>
                    <td
                      style={{ padding: "12px", display: "flex", gap: "10px" }}
                    >
                      <button
                        onClick={() => openProductModal("edit", p)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#3498db",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => handleProductDelete(p.id)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                      >
                        🗑️ ลบ
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#7f8c8d",
                      }}
                    >
                      ไม่มีสินค้า
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <>
          <div
            style={styles.overlay}
            onClick={() => setShowProductModal(false)}
          ></div>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {productAction === "edit" ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
            </h2>
            <form onSubmit={handleProductSubmit}>
              <div style={styles.modalFormGroup}>
                <label style={styles.modalLabel}>ชื่อสินค้า:</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  style={styles.modalInput}
                  disabled={!user.isAdmin}
                  required
                />
              </div>

              <div style={styles.modalFormGroup}>
                <label style={styles.modalLabel}>Vendor:</label>
                <input
                  type="text"
                  value={productForm.vendor}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      vendor: e.target.value,
                    }))
                  }
                  style={styles.modalInput}
                  disabled={!user.isAdmin}
                  required
                />
              </div>

              {user.isAdmin && (
                <div style={styles.modalButtonGroup}>
                  <button type="submit" style={styles.confirmButton}>
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    style={styles.cancelButton}
                  >
                    ยกเลิก
                  </button>
                  {productAction === "edit" && (
                    <button
                      type="button"
                      onClick={() => handleProductDelete(productForm.id)}
                      style={styles.deleteButton}
                    >
                      ลบ
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </>
      )}

      {/* Booking Modal */}
      {showBookingForm && (
        <>
          <div
            style={styles.overlay}
            onClick={() => setShowBookingForm(false)}
          ></div>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>จองรถคันที่ {selectedTruck}</h2>
            <form onSubmit={handleBooking}>
              <div style={styles.modalFormGroup}>
                <label style={styles.modalLabel}>Department:</label>
                <select
                  value={bookingForm.department}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  style={styles.modalSelect}
                  disabled={!user.isAdmin}
                >
                  {locations.length > 0 ? (
                    locations.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name}
                      </option>
                    ))
                  ) : (
                    <option value={bookingForm.department}>
                      {bookingForm.department}
                    </option>
                  )}
                </select>
              </div>
              {/* Location (display-only) */}
              <div style={styles.modalFormGroup}>
                <label style={styles.modalLabel}>Location:</label>
                {user.isAdmin ? (
                  <select
                    value={bookingForm.department}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    style={styles.modalSelect}
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                    {locations.length === 0 && (
                      <option value={bookingForm.department}>{bookingForm.department}</option>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={bookingForm.department}
                    style={{
                      ...styles.modalInput,
                      backgroundColor: '#e9ecef',
                      cursor: 'not-allowed'
                    }}
                    disabled
                  />
                )}
              </div>

              <div style={styles.modalFormGroup}>
                <label style={styles.modalLabel}>เปอร์เซ็นต์การจอง:</label>
                <select
                  value={bookingForm.percentage}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      percentage: parseInt(e.target.value),
                    }))
                  }
                  style={styles.modalSelect}
                >
                  {getAvailablePercentage(
                    selectedTruck,
                    bookingForm.productId
                  ) >= 50 && <option value={50}>50%</option>}
                  {getAvailablePercentage(
                    selectedTruck,
                    bookingForm.productId
                  ) === 100 && <option value={100}>100%</option>}
                </select>
              </div>

              <div style={styles.modalFormGroup}>
                <label style={styles.modalLabel}>วันที่จอง:</label>
                <input
                  type="date"
                  value={bookingForm.bookingDate}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      bookingDate: e.target.value,
                    }))
                  }
                  style={styles.modalInput}
                  required
                />
              </div>

              <div style={styles.modalButtonGroup}>
                <button type="submit" style={styles.confirmButton}>
                  ยืนยันการจอง
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  style={styles.cancelButton}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Location Management Modal */}
      {showLocationModal && user.username === 'adminscrap' && (
        <>
          <div style={styles.overlay} onClick={() => setShowLocationModal(false)}></div>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>จัดการ Location</h2>
            <form onSubmit={handleAddLocation} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="เพิ่ม location ใหม่"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  style={{ ...styles.modalInput, flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={!newLocation.trim()}
                  style={{
                    ...styles.confirmButton,
                    opacity: newLocation.trim() ? 1 : 0.6,
                    cursor: newLocation.trim() ? 'pointer' : 'not-allowed'
                  }}
                >เพิ่ม</button>
              </div>
            </form>
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ecf0f1', borderRadius: '8px' }}>
              {loadingLocations && (
                <div style={{ padding: '10px', fontSize: '14px' }}>กำลังโหลด...</div>
              )}
              {!loadingLocations && locations.length === 0 && (
                <div style={{ padding: '10px', fontSize: '14px', color: '#7f8c8d' }}>ไม่มี location</div>
              )}
              {locations.map((l) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #ecf0f1' }}>
                  <span>{l.name}</span>
                  <button
                    onClick={() => handleDeleteLocation(l.id, l.name)}
                    style={{ ...styles.deleteButton, padding: '6px 10px' }}
                  >ลบ</button>
                </div>
              ))}
            </div>
            {locationError && (
              <div style={{ color: '#e74c3c', marginTop: '10px' }}>{locationError}</div>
            )}
            <div style={styles.modalButtonGroup}>
              <button
                type="button"
                onClick={() => fetchLocations()}
                style={{ ...styles.confirmButton, backgroundColor: '#3498db' }}
              >รีเฟรช</button>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                style={styles.cancelButton}
              >ปิด</button>
            </div>
          </div>
        </>
      )}

      {/* User Management Modal */}
  {showUserModal && user?.is_super_admin && (
        <>
          <div style={styles.overlay} onClick={() => setShowUserModal(false)}></div>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>จัดการผู้ใช้</h2>
            {userLoading && <div style={{ marginBottom: 10 }}>กำลังโหลด...</div>}
            {userError && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{userError}</div>}
            {/* Create User */}
            <form onSubmit={async (e)=>{
              e.preventDefault();
              try {
                const payload = {
                  username: newUser.username.trim(),
                  password: newUser.password,
                  department: newUser.department || '',
                  display_name: newUser.display_name || undefined,
                  plant_id: newUser.plant_id || null,
                  department_id: newUser.department_id || null,
                  is_admin: 1,
                  is_super_admin: 0,
                };
                await postJSON('/api/users', payload);
                setNewUser({ username: '', password: '', display_name: '', department: '', plant_id: '', department_id: '' });
                await loadUsers();
                alert('เพิ่มผู้ใช้สำเร็จ');
              } catch (err) {
                alert(err?.message || 'เกิดข้อผิดพลาด');
              }
            }} style={{ border: '1px solid #ecf0f1', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <h3 style={{ marginTop: 0, fontSize: 16 }}>เพิ่มผู้ใช้ใหม่</h3>
              <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                <input placeholder="Username" value={newUser.username} onChange={(e)=>setNewUser(prev=>({...prev, username: e.target.value}))} style={{ ...styles.modalInput, flex:1 }} required />
                <input placeholder="Password" type="password" value={newUser.password} onChange={(e)=>setNewUser(prev=>({...prev, password: e.target.value}))} style={{ ...styles.modalInput, flex:1 }} required />
              </div>
              <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                <input placeholder="ชื่อแสดง (ถ้ามี)" value={newUser.display_name} onChange={(e)=>setNewUser(prev=>({...prev, display_name: e.target.value}))} style={{ ...styles.modalInput, flex:1 }} />
                <input placeholder="Department (legacy)" value={newUser.department} onChange={(e)=>setNewUser(prev=>({...prev, department: e.target.value}))} style={{ ...styles.modalInput, flex:1 }} />
              </div>
              <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                <select value={newUser.plant_id} onChange={(e)=>setNewUser(prev=>({...prev, plant_id: Number(e.target.value)||'' , department_id: ''}))} style={{ ...styles.modalSelect, flex:1 }}>
                  <option value="">เลือกโรงงาน</option>
                  {otPlants.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                </select>
                <select value={newUser.department_id} onChange={(e)=>setNewUser(prev=>({...prev, department_id: Number(e.target.value)||''}))} style={{ ...styles.modalSelect, flex:1 }}>
                  <option value="">เลือกแผนก</option>
                  {otDepartmentsApi.filter(d=>!newUser.plant_id || d.plant_id === newUser.plant_id).map(d => <option key={d.id} value={d.id}>{d.code || d.name}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <button type="submit" style={{ ...styles.confirmButton, marginLeft: 'auto' }}>เพิ่มผู้ใช้</button>
              </div>
            </form>
            <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #ecf0f1', borderRadius: 8, marginBottom: 15 }}>
              {usersList.map((u) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ flex: 1 }}>
                    <strong>{u.username}</strong>
                    <div style={{ fontSize: 12, color: '#7f8c8d' }}>{u.department}</div>
                  </div>
                  <button
                    onClick={async () => { await Promise.all([fetchOtPlants(), fetchOtDepartments()]); openEditUser(u); }}
                    style={{ ...styles.confirmButton, padding: '6px 10px', backgroundColor: '#3498db' }}
                  >แก้ไข</button>
                  {u.username !== 'adminscrap' && !u.is_super_admin && (
                    <button
                      onClick={() => deleteUser(u)}
                      style={{ ...styles.deleteButton, padding: '6px 10px' }}
                    >ลบ</button>
                  )}
                </div>
              ))}
              {!userLoading && usersList.length === 0 && (
                <div style={{ padding: 12, color: '#7f8c8d' }}>ไม่มีผู้ใช้</div>
              )}
            </div>
            {editUser && (
              <form onSubmit={submitEditUser} style={{ border: '1px solid #ecf0f1', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <h3 style={{ marginTop: 0, fontSize: 16 }}>แก้ไข: {editUser.username}</h3>
                <div style={{ marginBottom: 10 }}>
                  <label style={styles.modalLabel}>รหัสผ่านใหม่ (ว่าง = ไม่เปลี่ยน)</label>
                  <input type="password" value={editPassword} onChange={(e)=>setEditPassword(e.target.value)} style={styles.modalInput} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={styles.modalLabel}>Department</label>
                  <select value={editDepartment || ''} onChange={(e)=>setEditDepartment(e.target.value)} style={styles.modalSelect}>
                    {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                    {locations.length===0 && <option value={editDepartment}>{editDepartment}</option>}
                  </select>
                </div>
                <div style={{ display:'flex', gap:10, marginBottom: 10 }}>
                  <div style={{ flex:1 }}>
                    <label style={styles.modalLabel}>โรงงาน</label>
                    <select
                      value={editUser.plant_id || ''}
                      onChange={(e)=> setEditUser(prev=> ({ ...prev, plant_id: Number(e.target.value)||null }))}
                      style={styles.modalSelect}
                    >
                      <option value="">- ไม่ระบุ -</option>
                      {otPlants.map(p=> <option key={p.id} value={p.id}>{p.code}</option>)}
                    </select>
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={styles.modalLabel}>แผนก</label>
                    <select
                      value={editUser.department_id || ''}
                      onChange={(e)=> setEditUser(prev=> ({ ...prev, department_id: Number(e.target.value)||null }))}
                      style={styles.modalSelect}
                    >
                      <option value="">- ไม่ระบุ -</option>
                      {otDepartmentsApi
                        .filter(d => !editUser.plant_id || d.plant_id === editUser.plant_id)
                        .map(d=> <option key={d.id} value={d.id}>{d.code || d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={styles.modalButtonGroup}>
                  <button type="submit" style={styles.confirmButton}>บันทึก</button>
                  <button type="button" onClick={()=>setEditUser(null)} style={styles.cancelButton}>ยกเลิก</button>
                </div>
              </form>
            )}
            <div style={styles.modalButtonGroup}>
              <button type="button" onClick={()=>loadUsers()} style={{ ...styles.confirmButton, backgroundColor:'#9b59b6' }}>รีเฟรช</button>
              <button type="button" onClick={()=>setShowUserModal(false)} style={styles.cancelButton}>ปิด</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
