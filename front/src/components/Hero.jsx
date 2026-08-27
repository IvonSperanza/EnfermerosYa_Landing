import { ShieldCheck } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Hero() {
  return (
    <section id="inicio" className="relative">
      <div className="relative overflow-hidden bg-navy-800 pb-40 pt-16 sm:pt-20 lg:pt-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-action/30 blur-3xl" />
          <div className="absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <svg
            className="absolute right-8 top-8 hidden h-40 w-40 text-white/10 lg:block"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M75 55c6-6 12-13 12-22A22 22 0 0 0 65 11c-7 0-12 2-18 8-6-6-11-8-18-8a22 22 0 0 0-22 22c0 9 6 16 12 22l28 28z" />
            <path d="M17 47h26l4-8 8 18 8-28 6 14h21" />
          </svg>
        </div>

        <div className="container-page relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Profesionales matriculados y verificados
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Encontrá el cuidado que necesitás,{' '}
            <span className="text-blue-300">cerca tuyo.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-blue-100/90 sm:text-lg">
            Conectamos pacientes con enfermeros, kinesiólogos y profesionales de la salud
            matriculados. Atención a domicilio y e-consultas, todo en un solo lugar.
          </p>
        </div>
      </div>

      <SearchBar />
    </section>
  );
}
