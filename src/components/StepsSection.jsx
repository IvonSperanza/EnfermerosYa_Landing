import { STEPS } from '../data/content';

export default function StepsSection() {
  return (
    <section id="pasos" className="bg-slate-50 py-16 lg:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Todo en pocos pasos</h2>
          <p className="section-subtitle mx-auto">
            Reservar tu turno toma menos de dos minutos, desde cualquier dispositivo.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
              <article
                key={number}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-action/40 hover:shadow-lg"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-5 text-7xl font-extrabold tracking-tighter text-slate-100 select-none"
                >
                  {number}
                </span>

                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-action/10 text-action">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-action">
                    Paso {number}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-navy-800">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
                </div>
              </article>
          ))}
        </div>
      </div>
    </section>
  );
}
