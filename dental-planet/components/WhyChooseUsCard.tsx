export default function WhyChooseUsCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string; // medical symbol or text icon
}) {
  return (
    <div className="h-100 bg-white rounded-4 p-4 text-center shadow-sm why-card">
      {/* ICON */}
      <div
        className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
        style={{
          width: 56,
          height: 56,
          border: "2px solid #2563eb",
          color: "#2563eb",
          fontSize: "1.4rem",
          fontWeight: 700,
        }}
      >
        {icon}
      </div>

      <h5 className="fw-bold mb-2">{title}</h5>

      <p className="text-muted mb-0">{description}</p>
    </div>
  );
}
