import { useState } from 'react';
import { Stethoscope, LogIn, ArrowLeft } from 'lucide-react';
import { Field, Input } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/Router';
import Logo from '../components/Logo';

export default function ProfessionalLoginPage() {
  const { login } = useAuth();
  const { navigate, query } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (!user.roles.includes('healthcare_professional')) {
        setError('Esta cuenta no es de personal de salud.');
        return;
      }
      const redirect = query.get('redirect');
      navigate(redirect || '/profesional/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="container-page flex items-center justify-between py-3">
          <Logo />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate('/ingresar')}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-action"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
          </button>

          <div className="card p-6 sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-action">
              <Stethoscope className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Portal de personal de salud</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Ingresá con tu cuenta profesional para gestionar tu agenda, pacientes y pagos.</p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Email" htmlFor="pro-email">
                <Input
                  id="pro-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@enfermerosya.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field label="Contraseña" htmlFor="pro-password">
                <Input
                  id="pro-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-60">
                <LogIn className="h-4 w-4" /> {submitting ? 'Ingresando…' : 'Ingresar al portal'}
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-blue-50 px-4 py-3 text-xs font-medium leading-relaxed text-action">
              <strong>Demo:</strong> usá <code>maria.gonzalez@enfermerosya.com</code> / <code>enfermerosya123</code>.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
