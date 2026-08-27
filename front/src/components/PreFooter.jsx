import { TRUST_SEALS } from '../data/content';

export default function PreFooter() {
  return (
    <section className="container-page pb-16 lg:pb-24" aria-label="Llamado final a la acción">
      <div className="relative overflow-hidden rounded-3xl bg-navy-800 px-6 py-14 text-center shadow-card sm:px-10 lg:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-action/25 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Encontrá la atención que necesitás.
          </h2>
          <p className="mt-4 text-base text-blue-100 sm:text-lg">
            Miles de pacientes ya reservan sus turnos de forma simple y segura.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#profesionales" className="btn-primary w-full px-7 sm:w-auto">
              Buscar profesional
            </a>
            <a
              href="#econsultas"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 sm:w-auto"
            >
              Probar e-consulta
            </a>
          </div>
        </div>

        <ul className="relative mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-5 border-t border-white/10 pt-8 sm:flex-row sm:gap-10">
          {TRUST_SEALS.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2.5 text-sm font-medium text-blue-100">
              <Icon className="h-5 w-5 shrink-0 text-emerald-400" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
