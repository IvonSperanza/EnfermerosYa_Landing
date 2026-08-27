import { METRICS, TRUST_ITEMS } from '../data/content';

export default function TrustMetrics() {
  return (
    <section id="confianza" className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="section-title">Tu tranquilidad, nuestra prioridad</h2>
        <p className="section-subtitle mx-auto">
          Trabajamos con estándares profesionales para que cada atención sea segura,
          transparente y confiable.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {TRUST_ITEMS.map(({ icon: Icon, title, description }, index) => (
          <article
            key={`${title}-${index}`}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-bold text-navy-800">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14 rounded-2xl bg-gradient-to-r from-action to-action-dark px-6 py-8 shadow-card sm:px-10 lg:px-14">
        <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {METRICS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{value}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-blue-100">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
