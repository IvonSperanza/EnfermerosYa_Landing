import { ArrowRight } from 'lucide-react';
import { NEEDS } from '../data/content';

export default function NeedsGrid() {
  return (
    <section id="servicios" className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="section-title">¿Qué necesitás?</h2>
        <p className="section-subtitle mx-auto">
          Elegí el servicio que estás buscando y compará profesionales verificados cerca tuyo,
          con precios claros desde el primer momento.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {NEEDS.map(({ icon: Icon, title, price }) => (
          <article
            key={title}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-action/40 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-action transition-colors group-hover:bg-action group-hover:text-white">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-base font-bold text-navy-800">{title}</h3>
                <p className="mt-1 text-sm font-semibold text-emerald-600">{price}</p>
              </div>
            </div>

            <a
              href="#profesionales"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:border-action hover:bg-action hover:text-white"
            >
              Buscar profesionales
              <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
