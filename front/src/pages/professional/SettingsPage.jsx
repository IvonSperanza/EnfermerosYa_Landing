import { useState } from 'react';
import { KeyRound, Laptop, LogOut, Save, ShieldCheck, Smartphone } from 'lucide-react';
import Switch from '../../components/ui/Switch';
import Tabs from '../../components/ui/Tabs';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Input, Select } from '../../components/ui/Form';
import { useToast } from '../../context/ToastContext';
import { useProfessional } from '../../context/ProfessionalContext';
import { Link } from '../../router/Router';

const TABS = [
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'notificaciones', label: 'Notificaciones' },
  { id: 'privacidad', label: 'Privacidad' },
  { id: 'econsultas', label: 'E-consultas' },
];

const INITIAL_NOTIFICATIONS = {
  newAppointments: true,
  messages: true,
  reminders: true,
  payments: true,
  cancellations: false,
};

const INITIAL_PRIVACY = {
  publicProfile: true,
  showPhone: false,
  showEmail: false,
  showLocation: true,
};

export default function SettingsPage() {
  const toast = useToast();
  const { acceptsEConsults, toggleEConsults } = useProfessional();
  const [tab, setTab] = useState('cuenta');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [privacy, setPrivacy] = useState(INITIAL_PRIVACY);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveNotifications = () => {
    toast.success('Preferencias de notificaciones guardadas');
  };

  const handleSavePrivacy = () => {
    toast.success('Configuración de privacidad guardada');
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (formData.get('new') !== formData.get('confirm')) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (String(formData.get('new')).length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setSavingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSavingPassword(false);
    event.currentTarget.reset();
    toast.success('Contraseña actualizada correctamente');
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800">Configuración</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Gestioná tu cuenta, notificaciones y privacidad.</p>
      </header>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'cuenta' && (
        <section className="grid max-w-5xl gap-6 lg:grid-cols-2">
          <div className="card p-5 sm:p-6">
            <h3 className="text-base font-extrabold text-navy-800">Datos de la cuenta</h3>
            <div className="mt-5 space-y-4">
              <label className="block"><span className="form-label">Email</span><Input type="email" defaultValue="maria.gonzalez@enfermerosya.com" /></label>
              <label className="block"><span className="form-label">Teléfono</span><Input type="tel" defaultValue="+54 9 11 4588-2210" /></label>
              <button
                type="button"
                onClick={() => toast.success('Datos de contacto actualizados')}
                className="btn-secondary w-full sm:w-auto"
              >
                Actualizar datos de contacto
              </button>
            </div>

            <h3 className="mt-8 border-t border-slate-100 pt-6 text-base font-extrabold text-navy-800">Seguridad</h3>
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4" aria-label="Cambiar contraseña">
              <label className="block"><span className="form-label">Contraseña actual</span><Input name="current" type="password" required autoComplete="current-password" placeholder="••••••••" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="form-label">Nueva contraseña</span><Input name="new" type="password" required minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" /></label>
                <label className="block"><span className="form-label">Repetir contraseña</span><Input name="confirm" type="password" required minLength={8} autoComplete="new-password" placeholder="Repetí la nueva" /></label>
              </div>
              <button type="submit" disabled={savingPassword} className="btn-primary w-full sm:w-auto">
                <KeyRound className="h-4 w-4" /> {savingPassword ? 'Actualizando…' : 'Cambiar contraseña'}
              </button>
            </form>
          </div>

          <div className="card h-fit p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-navy-800">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Sesiones activas
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { icon: Smartphone, device: 'iPhone 14 · Buenos Aires', time: 'Sesión actual', current: true },
                { icon: Laptop, device: 'MacBook Pro · Chrome', time: 'Hace 2 horas', current: false },
              ].map((session) => (
                <li key={session.device} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-card">
                    <session.icon className="h-4 w-4 text-action" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-800">{session.device}</p>
                    <p className="text-xs font-medium text-slate-400">{session.time}</p>
                  </div>
                  {!session.current && (
                    <button type="button" onClick={() => toast.info('Sesión cerrada en ese dispositivo.')} className="text-xs font-bold text-red-500 hover:text-red-600">
                      Cerrar
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setSessionsOpen(true)} className="btn-secondary mt-5 w-full py-2.5 text-xs">
              <LogOut className="h-3.5 w-3.5" /> Cerrar todas las demás sesiones
            </button>
          </div>
        </section>
      )}

      {tab === 'notificaciones' && (
        <section className="card max-w-2xl p-5 sm:p-6">
          <h3 className="text-base font-extrabold text-navy-800">Notificaciones</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Elegí qué novedades querés recibir por email y notificación push.</p>
          <div className="mt-5 divide-y divide-slate-100">
            {[
              ['newAppointments', 'Nuevas consultas', 'Cuando un paciente reserve o solicite un turno'],
              ['messages', 'Mensajes', 'Cuando recibas un mensaje nuevo de un paciente'],
              ['reminders', 'Recordatorios', 'Recordatorios de tus próximas consultas del día'],
              ['payments', 'Pagos', 'Confirmaciones de pagos recibidos y pendientes'],
              ['cancellations', 'Cancelaciones', 'Cuando un paciente cancele una consulta'],
            ].map(([key, label, description]) => (
              <div key={key} className="py-4 first:pt-0 last:pb-0">
                <Switch
                  checked={notifications[key]}
                  label={label}
                  description={description}
                  onChange={(checked) => setNotifications((current) => ({ ...current, [key]: checked }))}
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={handleSaveNotifications} className="btn-primary mt-6 w-full sm:w-auto">
            <Save className="h-4 w-4" /> Guardar preferencias
          </button>
        </section>
      )}

      {tab === 'privacidad' && (
        <section className="card max-w-2xl p-5 sm:p-6">
          <h3 className="text-base font-extrabold text-navy-800">Privacidad</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Controlá qué información ve un paciente en tu perfil público.</p>
          <div className="mt-5 divide-y divide-slate-100">
            {[
              ['publicProfile', 'Perfil público', 'Tu perfil aparece en los resultados de búsqueda de pacientes'],
              ['showPhone', 'Mostrar teléfono', 'Los pacientes podrán ver tu número de contacto'],
              ['showEmail', 'Mostrar email', 'Los pacientes podrán ver tu dirección de email'],
              ['showLocation', 'Mostrar ubicación aproximada', 'Se comparte solo tu zona (ej.: Belgrano, CABA)'],
            ].map(([key, label, description]) => (
              <div key={key} className="py-4 first:pt-0 last:pb-0">
                <Switch
                  checked={privacy[key]}
                  label={label}
                  description={description}
                  onChange={(checked) => setPrivacy((current) => ({ ...current, [key]: checked }))}
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={handleSavePrivacy} className="btn-primary mt-6 w-full sm:w-auto">
            <Save className="h-4 w-4" /> Guardar privacidad
          </button>
        </section>
      )}

      {tab === 'econsultas' && (
        <section className="max-w-2xl space-y-6">
          <div className="card p-5 sm:p-6">
            <h3 className="text-base font-extrabold text-navy-800">E-consultas</h3>
            <div className="mt-5 divide-y divide-slate-100">
              <div className="py-4 first:pt-0">
                <Switch
                  checked={acceptsEConsults}
                  label="Activar e-consultas"
                  description="Aparecé como disponible para consultas por chat en tu horario configurado."
                  onChange={(checked) => {
                    toggleEConsults(checked);
                    toast.success(checked ? 'E-consultas activadas' : 'E-consultas desactivadas');
                  }}
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="form-label">Precio por consulta</span>
                <Select defaultValue="6000">
                  <option value="4000">$4.000</option>
                  <option value="6000">$6.000</option>
                  <option value="8000">$8.000</option>
                </Select>
              </label>
              <label className="block">
                <span className="form-label">Duración</span>
                <Select defaultValue="20">
                  <option value="15">15 minutos</option>
                  <option value="20">20 minutos</option>
                  <option value="30">30 minutos</option>
                </Select>
              </label>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-2xl bg-violet-50 p-5">
            <div>
              <h3 className="text-sm font-extrabold text-navy-800">Disponibilidad exclusiva</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                Configurá los días y franjas horarias exclusivas para e-consultas desde su sección dedicada.
              </p>
            </div>
            <Link to="/profesional/e-consultas" className="btn-primary shrink-0 px-4 py-2.5 text-xs">
              Ir a E-consultas
            </Link>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
        onConfirm={() => toast.success('Se cerraron las sesiones en otros dispositivos.')}
        title="Cerrar sesiones"
        message="¿Querés cerrar la sesión en todos los dispositivos excepto el actual?"
        confirmLabel="Cerrar sesiones"
        destructive={false}
      />
    </div>
  );
}
