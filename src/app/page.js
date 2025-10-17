"use client";

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
};

export default function Home() {
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <header style={styles.header}>
          <span style={styles.icon}>
            <Image src="/car-solid-full.svg" alt="Car icon" width={36} height={36} priority />
          </span>
          <h1 style={styles.title}>ระบบจองรถยนต์</h1>
        </header>

        <form style={styles.form}>
          <label style={styles.label} htmlFor="username">
            Username:
          </label>
          <input style={styles.input} id="username" name="username" type="text" />

          <label style={styles.label} htmlFor="password">
            Password:
          </label>
          <input style={styles.input} id="password" name="password" type="password" />

          <button style={styles.button} type="submit">
            เข้าสู่ระบบ
          </button>
        </form>
      </section>
    </main>
  );
}
