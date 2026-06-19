"use client";

export default function PaymentLoadingOverlay({
  title,
  subtitle,
  isUpsell,
}: {
  title: string;
  subtitle: string;
  isUpsell?: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(255,255,255,0.95)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24, textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48, height: 48,
          border: "3px solid var(--line, #e9dfe0)",
          borderTopColor: "var(--accent, #011843)",
          borderRadius: "50%",
          animation: "p-spin 0.8s linear infinite",
          marginBottom: 16,
        }}
      />
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--ink, #201a1b)", margin: "0 0 6px" }}>
        {title}
      </p>
      <p style={{ fontSize: 14, color: "var(--muted, #71686a)", margin: 0 }}>
        {subtitle}
      </p>
      <style>{`
        @keyframes p-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
