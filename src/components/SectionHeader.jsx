export default function SectionHeader({ title, subtitle, align = "center", gold = false }) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}>
      <h2 className="section-title mb-3">{title}</h2>
      <div className={`gold-divider mb-4 ${align === "center" ? "mx-auto" : ""}`} />
      {subtitle && (
        <p className={`section-subtitle ${align === "center" ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
