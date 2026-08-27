export function Field({ label, htmlFor, children, hint }) {
  return (
    <div>
      <label className="form-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs font-medium text-slate-400">{hint}</p>}
    </div>
  );
}

export function Input(props) {
  return <input id={props.id} {...props} className={`form-input ${props.className || ''}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select id={props.id} {...props} className={`form-input ${props.className || ''}`}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea id={props.id} rows={props.rows || 3} {...props} className={`form-input resize-none ${props.className || ''}`} />;
}
