import { useState } from 'react';
import { CalendarDays, MapPin, Navigation, Search, SlidersHorizontal } from 'lucide-react';

const SPECIALTIES = [
  'Especialidad o servicio',
  'Enfermería a domicilio',
  'Toma de presión',
  'Curaciones',
  'Inyectables',
  'Enfermero por hora',
  'Kinesiología',
  'Prácticas de laboratorio',
  'Controles de salud',
];

const MODALITIES = ['Modalidad', 'A domicilio', 'En consultorio', 'E-consulta'];

function Field({ label, icon: Icon, children }) {
  return (
    <label className="group flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3 sm:px-5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="relative flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-action" /> : null}
        {children}
      </span>
    </label>
  );
}

const selectClass =
  'w-full appearance-none bg-transparent pr-5 text-sm font-semibold text-navy-800 outline-none cursor-pointer';

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function SearchBar() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    document.querySelector('#profesionales')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <div className="relative z-20 -mt-28">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-3 shadow-float ring-1 ring-slate-900/5 sm:rounded-full"
      >
        <div className="flex flex-col divide-y divide-slate-100 lg:flex-row lg:items-stretch lg:divide-y-0 lg:divide-x">
          <Field label="¿Qué necesitás?" icon={Search}>
            <span className="relative block flex-1">
              <select name="especialidad" defaultValue="" className={selectClass} aria-label="Especialidad o servicio">
                {SPECIALTIES.map((item, index) => (
                  <option key={item} value={index === 0 ? '' : item} disabled={index === 0}>
                    {item}
                  </option>
                ))}
              </select>
              <Chevron />
            </span>
          </Field>

          <Field label="¿Dónde?" icon={MapPin}>
            <input
              type="text"
              name="ubicacion"
              placeholder="Ciudad o barrio"
              className="w-full bg-transparent text-sm font-semibold text-navy-800 placeholder:font-normal placeholder:text-slate-400 outline-none"
            />
          </Field>

          <Field label="¿Cuándo?" icon={CalendarDays}>
            <input
              type="date"
              name="fecha"
              aria-label="Fecha"
              className="w-full cursor-pointer bg-transparent text-sm font-semibold text-navy-800 outline-none"
            />
          </Field>

          <Field label="Modalidad" icon={SlidersHorizontal}>
            <span className="relative block flex-1">
              <select name="modalidad" defaultValue="" className={selectClass} aria-label="Modalidad">
                {MODALITIES.map((item, index) => (
                  <option key={item} value={index === 0 ? '' : item} disabled={index === 0}>
                    {item}
                  </option>
                ))}
              </select>
              <Chevron />
            </span>
          </Field>

          <div className="p-2 sm:p-1.5 lg:self-center">
            <button type="submit" className="btn-primary h-full w-full rounded-xl px-7 py-3 sm:w-auto sm:rounded-full lg:py-3">
              {submitted ? 'Buscando…' : 'Buscar'}
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      <button
        type="button"
        className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-medium text-blue-100 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
      >
        <Navigation className="h-4 w-4 text-emerald-400" />
        Usar mi ubicación para ver profesionales cercanos
      </button>
    </div>
  );
}
