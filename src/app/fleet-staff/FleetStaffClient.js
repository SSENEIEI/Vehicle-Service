"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import DashboardShell from "@/components/DashboardShell";
import { menuItems } from "@/lib/menuItems";
import { FaUsers, FaCarSide } from "react-icons/fa6";
import { FaUserTie, FaCalendarAlt } from "react-icons/fa";
import { fetchJSON } from "@/lib/http";

const colors = {
  background: "#eef0f5",
  surface: "#ffffff",
  border: "#d1d8e5",
  textDark: "#1d2939",
  textMuted: "#687082",
  accent: "#fcfcfe",
  statusAvailable: "#2f9151",
  statusBusy: "#d64545",
  statusPending: "#c97a1e",
  sectionDivider: "#c7cfdd",
};

const STATUS_LABELS = {
  available: "พร้อมใช้งาน",
  pending: "รออนุมัติ",
  busy: "กำลังใช้งาน",
};

const STATUS_VISUALS = {
  available: {
    text: colors.statusAvailable,
    background: "rgba(47, 145, 81, 0.12)",
  },
  pending: {
    text: colors.statusPending,
    background: "rgba(201, 122, 30, 0.14)",
  },
  busy: {
    text: colors.statusBusy,
    background: "rgba(214, 69, 69, 0.12)",
  },
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: colors.textDark,
  },
  pageTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "26px",
    fontWeight: "800",
  },
  pageSubtitle: {
    fontSize: "15px",
    color: colors.textMuted,
  },
  dateBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: colors.surface,
    borderRadius: "14px",
    border: `1px solid ${colors.border}`,
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: "700",
    color: colors.textDark,
  },
  sectionBlock: {
    backgroundColor: colors.surface,
    borderRadius: "22px",
    border: `1px solid ${colors.border}`,
    padding: "22px 26px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "20px",
    fontWeight: "800",
    color: colors.textDark,
  },
  cardGrid: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  vehicleCard: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    backgroundColor: colors.accent,
    borderRadius: "18px",
    border: `1px solid ${colors.border}`,
    padding: "18px",
    minHeight: "290px",
  },
  cardImageWrapper: {
    width: "100%",
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #f5f6fb 0%, #ffffff 100%)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: colors.textDark,
  },
  cardDetails: {
    fontSize: "14px",
    color: colors.textMuted,
    lineHeight: "1.6",
  },
  statusBadge: (statusKey) => {
    const visuals = STATUS_VISUALS[statusKey] || STATUS_VISUALS.available;
    return {
      alignSelf: "flex-end",
      borderRadius: "999px",
      padding: "6px 12px",
      fontWeight: "700",
      fontSize: "13px",
      color: visuals.text,
      backgroundColor: visuals.background,
    };
  },
  staffCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    backgroundColor: colors.accent,
    borderRadius: "18px",
    border: `1px solid ${colors.border}`,
    padding: "18px",
    minHeight: "260px",
  },
  avatarWrapper: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    border: `3px solid ${colors.border}`,
    backgroundColor: "#f5f6fb",
  },
  staffName: {
    fontSize: "18px",
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
  },
  staffDetails: {
    fontSize: "14px",
    color: colors.textMuted,
    textAlign: "center",
  },
};

function deriveVehicleStatus(vehicle) {
  if (vehicle.lockedStatus === "pending") {
    return "pending";
  }
  if (vehicle.lockedStatus === "approved") {
    return "busy";
  }
  if (vehicle.isLocked) {
    return "pending";
  }
  return "available";
}

function deriveDriverStatus(driver) {
  if (driver.lockedStatus === "pending") {
    return "pending";
  }
  if (driver.lockedStatus === "approved") {
    return "busy";
  }
  if (driver.pendingAssignments) {
    return "pending";
  }
  if (driver.isLocked) {
    return "pending";
  }
  return "available";
}

export default function FleetStaffClient() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [vehicleRes, driverRes] = await Promise.all([
          fetchJSON("/api/company-assets/vehicles"),
          fetchJSON("/api/company-assets/drivers"),
        ]);

        if (!cancelled) {
          setVehicles(Array.isArray(vehicleRes?.vehicles) ? vehicleRes.vehicles : []);
          setDrivers(Array.isArray(driverRes?.drivers) ? driverRes.drivers : []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err?.message || "ไม่สามารถโหลดข้อมูลได้";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentDateLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  }, []);

  const vehiclesWithStatus = useMemo(() => {
    return vehicles.map((vehicle) => {
      const statusKey = deriveVehicleStatus(vehicle);
      return {
        ...vehicle,
        statusKey,
        statusLabel: STATUS_LABELS[statusKey] || STATUS_LABELS.available,
      };
    });
  }, [vehicles]);

  const driversWithStatus = useMemo(() => {
    return drivers.map((driver) => {
      const statusKey = deriveDriverStatus(driver);
      return {
        ...driver,
        statusKey,
        statusLabel: STATUS_LABELS[statusKey] || STATUS_LABELS.available,
      };
    });
  }, [drivers]);

  return (
    <DashboardShell
      menuItems={menuItems}
      headerIcon={<FaUsers size={26} />}
      headerSubtitle="รถและพนักงานบริษัทฯ"
    >
      <div style={styles.container}>
        <header style={styles.headerSection}>
          <div style={styles.headerLeft}>
            <div style={styles.pageTitle}>
              <FaUsers size={26} /> Company Vehicles & Drivers Dashboard
            </div>
            <p style={styles.pageSubtitle}>
              เลือกวันที่เพื่อดูความพร้อมของรถและพนักงานขับรถตามวันนั้น
            </p>
          </div>
          <span style={styles.dateBadge}>
            <FaCalendarAlt /> ข้อมูลวันนี้ <strong>{currentDateLabel}</strong>
          </span>
        </header>

        {error ? (
          <div
            style={{
              backgroundColor: "#fff4f4",
              border: "1px solid #f0c2c2",
              color: "#a12b2b",
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            ไม่สามารถโหลดข้อมูลได้: {error}
          </div>
        ) : null}

        <section style={styles.sectionBlock}>
          <h2 style={styles.sectionHeader}>
            <FaCarSide size={20} /> รถบริษัทฯ ที่มีอยู่
          </h2>
          {loading && !vehiclesWithStatus.length ? (
            <p style={{ color: colors.textMuted }}>กำลังโหลดข้อมูลรถ...</p>
          ) : (
            <div style={styles.cardGrid}>
              {vehiclesWithStatus.length === 0 ? (
                <p style={{ color: colors.textMuted }}>ยังไม่มีข้อมูลรถบริษัทฯ</p>
              ) : (
                vehiclesWithStatus.map((vehicle) => {
                  const vehicleImage = vehicle.photoUrl || "/images/vehicles/van-white-1.png";
                  return (
                    <article key={`vehicle-${vehicle.id}`} style={styles.vehicleCard}>
                      <header style={{ fontSize: "16px", color: colors.textMuted }}>
                        {vehicle.registration || "-"}
                      </header>
                      <div style={styles.cardImageWrapper}>
                        <Image
                          src={vehicleImage}
                          alt={vehicle.name || "รถบริษัท"}
                          width={320}
                          height={180}
                          style={{ width: "80%", height: "auto", objectFit: "contain" }}
                        />
                      </div>
                      <h3 style={styles.cardTitle}>{vehicle.name || "รถบริษัท"}</h3>
                      <p style={styles.cardDetails}>
                        ทะเบียน : {vehicle.registration || "-"}
                        <br /> ประเภทรถ : {vehicle.vehicleType || "-"}
                      </p>
                      <span style={styles.statusBadge(vehicle.statusKey)}>
                        {vehicle.statusLabel}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>

        <section style={styles.sectionBlock}>
          <h2 style={styles.sectionHeader}>
            <FaUserTie size={20} /> พนักงานขับรถบริษัทฯ
          </h2>
          {loading && !driversWithStatus.length ? (
            <p style={{ color: colors.textMuted }}>กำลังโหลดข้อมูลพนักงานขับรถ...</p>
          ) : (
            <div style={styles.cardGrid}>
              {driversWithStatus.length === 0 ? (
                <p style={{ color: colors.textMuted }}>ยังไม่มีข้อมูลพนักงานขับรถ</p>
              ) : (
                driversWithStatus.map((driver) => {
                  const driverImage = driver.photoUrl || "/images/staff/staff-male-1.png";
                  return (
                    <article key={`driver-${driver.id}`} style={styles.staffCard}>
                      <header style={{ fontSize: "16px", color: colors.textMuted }}>
                        {driver.code || driver.employeeNo || "พนักงานขับรถ"}
                      </header>
                      <div style={styles.avatarWrapper}>
                        <Image
                          src={driverImage}
                          alt={driver.name || "พนักงานขับรถ"}
                          width={200}
                          height={200}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <h3 style={styles.staffName}>{driver.name || "-"}</h3>
                      <p style={styles.staffDetails}>โทร: {driver.phone || "-"}</p>
                      <span style={styles.statusBadge(driver.statusKey)}>
                        {driver.statusLabel}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
