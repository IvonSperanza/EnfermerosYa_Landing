import { ArrowRight } from 'lucide-react';
import { EQUIPMENT } from '../data/content';
import { cn } from '../lib/utils';

export default function EquipmentRental() {
  return (
    <section id="equipamiento" className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="section-title">Alquiler de equipamiento de salud</h2>
        <p className="section-subtitle mx-auto">
          Equipamiento médico en perfectas condiciones, alquilado por día o por semana y con
          entrega a domicilio.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
        {EQUIPMENT.map(({ id, icon: Icon, name, priceDay, priceWeek, available }) => (
          <article
            key={id}
            className={cn(
              'group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg',
              !available && 'opacity-95'
            )}
          >
            <div className="relative flex h-40 items-center justify-center bg-slate-100">
              <Icon className="h-16 w-16 text-slate-300 transition-colors group-hover:text-slate-400" strokeWidth={1.4} />
              <span
                className={cn(
                  'absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
                  available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    available ? 'bg-emerald-500' : 'bg-slate-500'
                  )}
                />
                {available ? 'Disponible' : 'Sin stock'}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-base font-bold text-navy-800">{name}</h3>
              <p className="mt-2 text-sm">
                <strong className="text-lg font-extrabold text-navy-800">{priceDay}</strong>
                <span className="font-medium text-slate-400"> /día</span>
              </p>
              <p className="text-sm font-medium text-slate-500">{priceWeek} /semana</p>

              <button type="button" className="btn-secondary mt-5 w-full px-3 py-2.5 text-sm">
                Ver producto
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
