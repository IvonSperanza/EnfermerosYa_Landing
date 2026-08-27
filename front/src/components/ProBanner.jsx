import { BadgeCheck, CheckCircle2, MapPin, Star } from 'lucide-react';
import { PRO_BENEFITS } from '../data/content';

export default function ProBanner() {
  return (
    <section id="para-profesionales" className="container-page pb-16 lg:pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-700 to-action/80 px-6 py-12 shadow-card sm:px-10 lg:px-14 lg:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        </div>

        <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative mx-auto w-full max-w-xs">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur">
              <span className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-white/25 to-white/5 text-3xl font-extrabold text-white">
                MR
              </span>
              <p className="mt-4 text-center text-lg font-bold text-white">Dr. Martín Ríos</p>
              <p className="text-center text-sm font-medium uppercase tracking-wide text-blue-100">
                Kinesiólogo · M.P. 51.204
              </p>

              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-bold text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  4.9 · 132 reseñas
                </span>
                <BadgeCheck className="h-5 w-5 text-sky-200" aria-label="Verificado" />
              </div>
            </div>

            <div className="absolute -bottom-5 -right-2 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-float sm:flex">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-navy-800">Nuevo pedido cerca tuyo</p>
                <p className="text-[11px] font-medium text-slate-500">Palermo · hace 2 min</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              ¿Sos profesional de la salud?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
              Sumate a la comunidad de EnfermerosYa y conseguí nuevos pacientes en tu zona,
              gestionando tus turnos y cobros desde un solo panel.
            </p>

            <ul className="mt-7 grid gap-3.5 sm:grid-cols-2">
              {PRO_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm font-semibold text-white">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  {benefit}
                </li>
              ))}
            </ul>

            <button type="button" className="btn-primary mt-9 bg-emerald-500 px-7 hover:bg-emerald-600 focus-visible:ring-emerald-500">
              Quiero registrarme
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
