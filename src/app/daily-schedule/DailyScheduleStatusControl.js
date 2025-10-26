'use client';

import { useState, useTransition } from "react";
import { FaCheck, FaClipboardList, FaSpinner } from "react-icons/fa6";

const STATUS_LABELS = {
  on_process: "On Process",
  complete: "Complete",
};

export default function DailyScheduleStatusControl({ scheduleDate, initialStatus, variantStyles }) {
  const [status, setStatus] = useState(initialStatus === "complete" ? "complete" : "on_process");
  const [isPending, startTransition] = useTransition();
  const isComplete = status === "complete";

  const handleClick = () => {
    if (isComplete || isPending) {
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch("/api/daily-schedule/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: scheduleDate }),
        });
        if (!response.ok) {
          console.error("update schedule status failed", response.statusText);
          window.alert("ไม่สามารถบันทึกสถานะได้");
          return;
        }
        const payload = await response.json();
        if (payload.status === "complete") {
          setStatus("complete");
        }
      } catch (error) {
        console.error("update schedule status failed", error);
        window.alert("ไม่สามารถบันทึกสถานะได้");
      }
    });
  };

  const badgeStyle = variantStyles?.[status] || variantStyles?.on_process || {};
  const label = STATUS_LABELS[status] || "On Process";
  const icon = isPending && !isComplete ? <FaSpinner size={12} /> : status === "complete" ? <FaCheck size={12} /> : <FaClipboardList size={12} />;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isComplete || isPending}
      style={{
        ...badgeStyle,
        border: "none",
        cursor: isComplete ? "default" : "pointer",
        opacity: isPending && !isComplete ? 0.7 : 1,
      }}
      title={isComplete ? "สถานะแผนวันนี้ถูกตรวจแล้ว" : "คลิกเพื่อยืนยันว่าแผนวันนี้ตรวจเรียบร้อย"}
    >
      {icon}
      {label}
    </button>
  );
}
