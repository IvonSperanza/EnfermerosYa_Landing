import { useEffect, useState } from 'react';
import { ArrowRight, Baby, Bandage, Brain, Heart, Home, PersonStanding, Sparkles, Stethoscope } from 'lucide-react';
import { Link } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { catalogService } from '../../services/clientApi';

const SPECIALTY_ICONS = {
  'clinica-medica': Stethoscope,
  'enfermeria-general': Bandage,
  pediatria: Baby,
  cardiologia: Heart,
  dermatologia: Sparkles,
  geriatria: PersonStanding,
  'salud-mental': Brain,
  'cuidados-domiciliarios': Home,
};

const SPECIALTY_TONES = {
  'clinica-medica': 'bg-blue-50 text-action',
  'enfermeria-general': 'bg-emerald-50 text-emerald-600',
  pediatria: 'bg-violet-50 text-violet-600',
  cardiologia: 'bg-red-50 text-red-500',
  dermatologia: 'bg-amber-50 text-amber-600',
  geriatria: 'bg-sky-50 text-sky-600',
  'salud-mental': 'bg-indigo-50 text-indigo-600',
  'cuidados-domiciliarios': 'bg-teal-50 text-teal-600',
};

export default function SpecialtiesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  const load = () => {
    setLoading(true);
    setError(false);
    catalogService
      .listSpecialties()
      .then((items) => {
        setSpecialties(items);
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="animate-fade-up space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Especialidades</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Explorá por área de salud y encontrá al profesional indicado.</p>
      </header>

      {specialties.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No hay especialidades disponibles por ahora" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {specialties.map((specialty) => {
            const Icon = SPECIALTY_ICONS[specialty.id] || Stethoscope;
            return (
              <li key={specialty.id}>
                <Link
                  to={`/cliente/profesionales?especialidad=${specialty.id}`}
                  className="card group flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${SPECIALTY_TONES[specialty.id] || 'bg-blue-50 text-action'}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-3.5 text-base font-extrabold text-navy-800">{specialty.name}</h3>
                  <p className="mt-1 flex-1 text-xs font-medium leading-relaxed text-slate-500">{specialty.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      {specialty.professionalsCount} {specialty.professionalsCount === 1 ? 'profesional' : 'profesionales'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-action transition-transform group-hover:translate-x-0.5">
                      Ver profesionales
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
