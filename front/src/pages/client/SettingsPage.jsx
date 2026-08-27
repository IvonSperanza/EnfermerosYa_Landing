import { useEffect, useState } from 'react';
import { Bell, KeyRound, Save, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import Switch from '../../components/ui/Switch';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Tabs from '../../components/ui/Tabs';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'ey_client_settings_v1';

const DEFAULT_SETTINGS = {
  notifications: {
    appointmentReminders: true,
    remindersSms: false,
    newMessages: true,
    eConsultReplies: true,
    promotions: false,
  },
  privacy: {
    shareNotesWithTreatingPros: true,
    showInsuranceInBooking: true,
    allowEmergencyContactUse: true,
  },
};

function readStoredSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const TABS = [
  { id: 'notificaciones', label: 'Notificaciones' },
  { id: 'privacidad', label: 'Privacidad' },
  { id: 'cuenta', label: 'Cuenta' },
];

export default function SettingsPage() {
  const toast = useToast();
  const { logout } = useAuth();
  const [tab, setTab] = useState('notificaciones');
  const [settings, setSettings] = useState(readStoredSettings);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleSave = (label) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success(`Preferencias de ${label} guardadas.`);
  };

  const handleDeleteAccount = () => {
    setDeleteOpen(false);
    toast.info('Tu solicitud de baja fue registrada. Te contactaremos para confirmarla.');
    logout();
    window.location.assign('/');
  };

  return (
    <div className="animate-fade-up space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Configuración</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Notificaciones, privacidad y preferencias de tu cuenta.</p>
      </header>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'notificaciones' && (
        <section className="card max-w-2xl p-5 sm:p-6" aria-label="Preferencias de notificaciones">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-navy-800">
            <Bell className="h-4 w-4 text-slate-400" aria-hidden="true" /> Notificaciones
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Elegí qué novedades querés recibir y por dónde.</p>
          <div className="mt-5 divide-y divide-slate-100">
            {[
              ['appointmentReminders', 'Recordatorios de consultas', 'Te avisamos antes de cada consulta agendada'],
              ['remindersSms', 'Recordatorios por SMS', 'Además del email, te enviamos un SMS el día previo'],
              ['newMessages', 'Mensajes nuevos', 'Cuando un profesional te escriba'],
              ['eConsultReplies', 'Respuestas de e-consulta', 'Cuando llegue la respuesta a tu consulta online'],
              ['promotions', 'Novedades y promociones', 'Ofertas y noticias de EnfermerosYa (poco frecuentes)'],
            ].map(([key, label, description]) => (
              <div key={key} className="py-4 first:pt-0 last:pb-0">
                <Switch
                  checked={settings.notifications[key]}
                  label={label}
                  description={description}
                  onChange={(checked) => setSettings((current) => ({ ...current, notifications: { ...current.notifications, [key]: checked } }))}
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => handleSave('notificaciones')} className="btn-primary mt-6 w-full sm:w-auto">
            <Save className="h-4 w-4" /> Guardar preferencias
          </button>
        </section>
      )}

      {tab === 'privacidad' && (
        <section className="card max-w-2xl p-5 sm:p-6" aria-label="Preferencias de privacidad">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-navy-800">
            <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden="true" /> Privacidad
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Controlá cómo se usa tu información durante las consultas.</p>
          <div className="mt-5 divide-y divide-slate-100">
            {[
              ['shareNotesWithTreatingPros', 'Compartir notas entre mis profesionales', 'Los profesionales que trates pueden ver notas clínicas de consultas anteriores'],
              ['showInsuranceInBooking', 'Mostrar obra social al reservar', 'El profesional ve tu cobertura al confirmar el turno'],
              ['allowEmergencyContactUse', 'Contacto de emergencia', 'Permitimos contactar a tu referencia ante urgencias en domicilio'],
            ].map(([key, label, description]) => (
              <div key={key} className="py-4 first:pt-0 last:pb-0">
                <Switch
                  checked={settings.privacy[key]}
                  label={label}
                  description={description}
                  onChange={(checked) => setSettings((current) => ({ ...current, privacy: { ...current.privacy, [key]: checked } }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold leading-relaxed text-action">
              Tus datos clínicos están cifrados y nunca se comparten con terceros sin tu consentimiento explícito.
            </p>
          </div>
          <button type="button" onClick={() => handleSave('privacidad')} className="btn-primary mt-6 w-full sm:w-auto">
            <Save className="h-4 w-4" /> Guardar privacidad
          </button>
        </section>
      )}

      {tab === 'cuenta' && (
        <section className="max-w-2xl space-y-4" aria-label="Opciones de cuenta">
          <div className="card p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-navy-800">
              <KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" /> Seguridad
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Cambiá tu contraseña periódicamente para mantener tu cuenta segura.</p>
            <button type="button" onClick={() => setPasswordOpen(true)} className="btn-secondary mt-4 w-full py-2.5 text-xs sm:w-auto">
              Cambiar contraseña
            </button>
          </div>

          <div className="card p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-navy-800">
              <Smartphone className="h-4 w-4 text-slate-400" aria-hidden="true" /> Dispositivos con sesión
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {[['iPhone de María · Buenos Aires', 'Sesión actual'], ['Chrome · Windows · CABA', 'Hace 3 días']].map(([device, meta]) => (
                <li key={device} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">
                  <span className="font-bold text-navy-800">{device}</span>
                  <span className="shrink-0 text-xs font-semibold text-slate-400">{meta}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-red-700">
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Zona de riesgo
            </h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-red-600/80">
              Al eliminar tu cuenta se borran tus datos personales y historial. Esta acción no se puede deshacer.
            </p>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="mt-4 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Eliminar mi cuenta
            </button>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onConfirm={() => {
          setPasswordOpen(false);
          toast.success('Te enviamos un email con el link para cambiar tu contraseña.');
        }}
        title="Cambiar contraseña"
        message="Te vamos a enviar un email con un enlace seguro para definir una nueva contraseña."
        confirmLabel="Enviar email"
        cancelLabel="Cancelar"
        destructive={false}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Eliminar cuenta"
        message="¿Seguro que querés eliminar tu cuenta? Perderás tu historial de consultas, documentos y reservas activas."
        confirmLabel="Sí, eliminar"
        destructive
      />
    </div>
  );
}
