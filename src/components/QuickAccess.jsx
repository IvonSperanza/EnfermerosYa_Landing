import { ArrowRight } from 'lucide-react';
import { QUICK_ACCESS } from '../data/content';

export default function QuickAccess() {
  return (
    <section className="container-page pb-4 pt-16 lg:pt-20" aria-label="Accesos rápidos">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACCESS.map(({ icon: Icon, title, description, href, iconClass }) => (
          <a
            key={title}
            href={href}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:border-action/40 hover:shadow-lg"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}>
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-bold text-navy-800">{title}</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-action transition-all group-hover:gap-2.5">
              Ver más
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
