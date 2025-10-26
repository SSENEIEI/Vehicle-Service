import { query } from "@/lib/db";

const TARGET_COLUMNS = [
  {
    name: "rental_company",
    definition: "VARCHAR(180) NULL",
    position: "AFTER contact_email",
  },
  {
    name: "rental_cost",
    definition: "DECIMAL(12,2) NULL",
    position: "AFTER rental_company",
  },
  {
    name: "rental_payment_type",
    definition: "VARCHAR(60) NULL",
    position: "AFTER rental_cost",
  },
];

export async function ensureRentalSupportColumns() {
  const rows = await query(
    `SELECT COLUMN_NAME AS columnName
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME IN ('rental_company', 'rental_cost', 'rental_payment_type')`
  );

  const existing = new Set(
    rows.map((row) => String(row?.columnName || row?.COLUMN_NAME || "").toLowerCase())
  );

  for (const column of TARGET_COLUMNS) {
    if (!existing.has(column.name)) {
      await query(
        `ALTER TABLE bookings
         ADD COLUMN ${column.name} ${column.definition} ${column.position}`
      );
    }
  }
}
