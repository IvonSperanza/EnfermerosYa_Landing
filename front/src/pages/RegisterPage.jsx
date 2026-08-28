import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Field, Input } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/Router';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    try {
      await register({ email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim(), role: 'patient' });
      navigate('/cliente/dashboard');
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
            <h1 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Crear cuenta</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Registrate para reservar consultas y gestionar tus turnos.</p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" htmlFor="firstName">
                  <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="María" autoComplete="given-name" required />
                </Field>
                <Field label="Apellido" htmlFor="lastName">
                  <Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="López" autoComplete="family-name" required />
                </Field>
              </div>
              <Field label="Email" htmlFor="email">
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" autoComplete="email" required />
              </Field>
              <Field label="Contraseña" htmlFor="password" hint="Mínimo 6 caracteres.">
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" required />
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-60">
                <UserPlus className="h-4 w-4" /> {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm font-medium text-slate-500">
              ¿Ya tenés cuenta?{' '}
              <button type="button" onClick={() => navigate('/ingresar')} className="font-bold text-action hover:underline">
                Iniciá sesión
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
