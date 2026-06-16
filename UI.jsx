// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ value, label, color }) {
  return (
    <div className="stat-card" style={{ color }}>
      <div className="stat-val">{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return <div className="sec-label">{children}</div>
}

// ── FormGroup ─────────────────────────────────────────────────────────────────
export function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ as: Tag = 'input', ...props }) {
  return <Tag className="field" {...props} />
}

// ── DeleteBtn ─────────────────────────────────────────────────────────────────
export function DeleteBtn({ onClick, label = 'Delete' }) {
  return (
    <button className="btn-del" onClick={onClick} aria-label={label}>
      <i className="ti ti-x" />
    </button>
  )
}

// ── AddPanel ──────────────────────────────────────────────────────────────────
export function AddPanel({ open, children }) {
  if (!open) return null
  return <div className="add-panel">{children}</div>
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ eyebrow, title, right }) {
  return (
    <div style={{ marginBottom: '1.25rem', paddingTop: '.75rem' }}>
      <div className="eyebrow">{eyebrow}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.5rem' }}>
        <h1 className="page-title">{title}</h1>
        {right}
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, children }) {
  return (
    <div className="empty-state">
      <i className={`ti ${icon}`} />
      <span>{children}</span>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 28, color: 'var(--lime)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}