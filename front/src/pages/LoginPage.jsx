import { useState } from 'react';
import { LogIn, Mail, Stethoscope } from 'lucide-react';
import { Field, Input } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/Router';
import Logo from '../components/Logo';

const GOOGLE_ICON = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

const FACEBOOK_ICON = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
  </svg>
);

export default function LoginPage() {
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
      const redirect = query.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else if (user.roles.includes('healthcare_professional') && !user.roles.includes('patient')) {
        navigate('/profesional/dashboard');
      } else {
        navigate('/cliente/dashboard');
      }
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
          <div className="card p-6 sm:p-8">
            <h1 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Iniciar sesión</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Ingresá con tu cuenta para gestionar tus consultas.</p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/registrarse')}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-bold text-navy-800 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  {GOOGLE_ICON} Continuar con Google
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/registrarse')}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-bold text-navy-800 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  {FACEBOOK_ICON} Continuar con Facebook
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('email')?.focus()}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-bold text-navy-800 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  <Mail className="h-4 w-4 text-slate-500" /> Continuar con Email
                </button>
              </div>

              <div className="flex items-center gap-3" role="separator" aria-label="o">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">o</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <Field label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field label="Contraseña" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-60">
                <LogIn className="h-4 w-4" /> {submitting ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm font-medium text-slate-500">
              ¿No tenés cuenta?{' '}
              <button type="button" onClick={() => navigate('/registrarse')} className="font-bold text-action hover:underline">
                Registrate
              </button>
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => navigate('/profesional/login')}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-action transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
              >
                <Stethoscope className="h-4 w-4" /> Soy personal de salud
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 px-4 py-3 text-xs font-medium leading-relaxed text-action">
              <strong>Demo:</strong> usá <code>maria.lopez@gmail.com</code> / <code>enfermerosya123</code> para el portal de paciente, o <code>maria.gonzalez@enfermerosya.com</code> / <code>enfermerosya123</code> para el de profesional.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
