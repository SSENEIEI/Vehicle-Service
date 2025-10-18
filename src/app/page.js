"use client";

import { useState } from "react";
import Image from "next/image";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4fb",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
  },
  card: {
    width: "500px",
    maxWidth: "94vw",
    backgroundColor: "#e8edf4",
    borderRadius: "36px",
    padding: "58px 72px 66px",
    boxShadow: "0 18px 36px rgba(15, 43, 85, 0.16)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "36px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    color: "#0f4ea2",
  },
  icon: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    backgroundColor: "#0f4ea2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    letterSpacing: "0.6px",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  label: {
    display: "block",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f4ea2",
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    height: "60px",
    borderRadius: "20px",
    border: "2px solid #1b55aa",
    padding: "0 22px",
    fontSize: "17px",
    color: "#16305f",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  button: {
    width: "100%",
    height: "62px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#0553b3",
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  buttonDisabled: {
    backgroundColor: "#93b5de",
    cursor: "not-allowed",
  },
  message: {
    marginTop: "6px",
    fontSize: "16px",
    fontWeight: "600",
    textAlign: "center",
  },
};

export default function Home() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, text: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback({ type: null, text: "" });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      let payload = {};
      let rawBody = "";
      try {
        rawBody = await response.text();
        const contentType = response.headers.get("content-type") || "";
        const candidate = rawBody.trim();

        if (!candidate) {
          payload = {};
        } else if (contentType.includes("application/json")) {
          payload = JSON.parse(candidate);
        } else if (candidate.startsWith("{") || candidate.startsWith("[")) {
          payload = JSON.parse(candidate);
        } else {
          setFeedback({ type: "error", text: "เซิร์ฟเวอร์ตอบกลับไม่ใช่ JSON" });
          return;
        }
      } catch (parseError) {
        console.error("Login response parsing failed", parseError, rawBody);
        setFeedback({ type: "error", text: "เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง" });
        return;
      }

      if (!response.ok) {
        const errorText = payload?.error || "ไม่สามารถเข้าสู่ระบบได้";
        setFeedback({ type: "error", text: errorText });
        return;
      }

      try {
        if (payload?.token) {
          localStorage.setItem("token", payload.token);
        }
        if (payload?.user) {
          localStorage.setItem("userProfile", JSON.stringify(payload.user));
          const roleValue = payload.user.role || "admin";
          localStorage.setItem("userRole", roleValue);
        }
      } catch (storageError) {
        console.error("Persisting login session failed", storageError);
      }

      window.alert("เข้าสู่ระบบสำเร็จ");
      setFeedback({ type: "success", text: "ลงชื่อเข้าใช้สำเร็จ" });
      setFormData({ username: "", password: "" });
      window.location.href = "/company-booking";
    } catch (error) {
      console.error("Login request failed", error);
      setFeedback({ type: "error", text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <header style={styles.header}>
          <span style={styles.icon}>
            <Image src="/car-solid-full.svg" alt="Car icon" width={36} height={36} priority />
          </span>
          <h1 style={styles.title}>ระบบจองรถยนต์</h1>
        </header>

        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="username">
            Username:
          </label>
          <input
            style={styles.input}
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />

          <label style={styles.label} htmlFor="password">
            Password:
          </label>
          <input
            style={styles.input}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />

          <button
            style={{
              ...styles.button,
              ...(isSubmitting ? styles.buttonDisabled : null),
            }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>

          {feedback.text ? (
            <p
              style={{
                ...styles.message,
                color: feedback.type === "error" ? "#c0392b" : "#1b5e20",
              }}
            >
              {feedback.text}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
