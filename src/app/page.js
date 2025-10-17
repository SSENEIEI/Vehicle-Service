"use client";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f7fc",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
  },
  card: {
    width: "360px",
    backgroundColor: "#eef1f6",
    borderRadius: "28px",
    padding: "48px 42px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    color: "#0f4ea2",
  },
  icon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#0f4ea2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  label: {
    display: "block",
    fontSize: "16px",
    fontWeight: "700",
    color: "#114b9c",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    height: "52px",
    borderRadius: "18px",
    border: "2px solid #1c5ec2",
    padding: "0 18px",
    fontSize: "15px",
    color: "#1c2b4d",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  button: {
    width: "100%",
    height: "56px",
    borderRadius: "18px",
    border: "none",
    backgroundColor: "#0553b3",
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "800",
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
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 6.5c.5-1.6 1.9-2.5 4.5-2.5s3.9.9 4.5 2.5l1.8 5.4c.4 1.1-.5 2.1-1.6 2.1h-9.4c-1.1 0-2-1-1.6-2.1L7.5 6.5z"
                fill="#ffffff"
              />
              <rect x="5" y="14" width="14" height="5" rx="2.5" fill="#ffffff" />
            </svg>
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
