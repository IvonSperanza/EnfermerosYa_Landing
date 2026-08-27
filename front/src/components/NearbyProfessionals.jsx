import { ArrowRight, BadgeCheck, CalendarClock, MapPin, Star } from 'lucide-react';
import { PROFESSIONALS } from '../data/content';
import { cn } from '../lib/utils';

const AVATAR_TONES = [
  'from-action to-blue-400',
  'from-emerald-500 to-teal-400',
  'from-violet-500 to-purple-400',
];

export default function NearbyProfessionals() {
  return (
    <section id="profesionales" className="bg-slate-50 py-16 lg:py-24">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">Profesionales cerca tuyo</h2>
            <p className="section-subtitle">
              Disponibles hoy, con matrícula verificada y calificaciones reales de otros
              pacientes.
            </p>
          </div>
          <a
            href="#servicios"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-action transition-all hover:gap-2.5"
          >
            Ver todos los profesionales
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {PROFESSIONALS.map((pro, index) => (
            <article
              key={pro.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span
                    className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-white',
                      AVATAR_TONES[index % AVATAR_TONES.length]
                    )}
                    aria-hidden="true"
                  >
                    {pro.initials}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-1.5 text-base font-bold text-navy-800">
                      {pro.name}
                      <BadgeCheck className="h-5 w-5 shrink-0 text-action" aria-label="Perfil verificado" />
                    </h3>
                    <p className="text-sm font-medium text-slate-600">{pro.specialty}</p>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Matrícula {pro.license}
                    </p>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                  <MapPin className="h-3 w-3" />
                  {pro.distance}
                </span>
              </div>

              <div className="my-5 flex items-center justify-between border-y border-slate-100 py-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <strong className="font-bold text-navy-800">{pro.rating}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
                  <CalendarClock className="h-4 w-4 text-action" />
                  Próximo turno:
                  <strong className="font-bold text-navy-800">{pro.nextSlot}</strong>
                </span>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <button type="button" className="btn-secondary px-3 py-2.5 text-sm">
                  Ver perfil
                </button>
                <button type="button" className="btn-primary px-3 py-2.5 text-sm">
                  Reservar turno
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
