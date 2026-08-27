import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, IdCard, MapPin, PhoneCall, Save, ShieldCheck } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { Field, Input } from '../../components/ui/Form';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';
import { clientProfileService } from '../../services/clientApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';

const EMPTY_FORM = {
  phone: '',
  email: '',
  street: '',
  city: '',
  province: '',
  zipCode: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
};

function profileToForm(profile) {
  return {
    phone: profile.phone || '',
    email: profile.email || '',
    street: profile.street || '',
    city: profile.city || '',
    province: profile.province || '',
    zipCode: profile.zipCode || '',
    emergencyName: profile.emergencyContact?.name || '',
    emergencyRelationship: profile.emergencyContact?.relationship || '',
    emergencyPhone: profile.emergencyContact?.phone || '',
  };
}

export default function ProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    clientProfileService
      .get()
      .then((data) => {
        setProfile(data);
        setForm(profileToForm(data));
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const dirty = useMemo(() => profile && JSON.stringify(form) !== JSON.stringify(profileToForm(profile)), [profile, form]);

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const updated = await clientProfileService.update({
        phone: form.phone.trim(),
        email: form.email.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        zipCode: form.zipCode.trim(),
        emergencyContact: {
          name: form.emergencyName.trim(),
          relationship: form.emergencyRelationship.trim(),
          phone: form.emergencyPhone.trim(),
        },
      });
      setProfile(updated);
      setForm(profileToForm(updated));
      toast.success('Tus datos fueron actualizados.');
    } catch {
      toast.error('No pudimos guardar los cambios. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !error) return <PageLoader />;
  if (error || !profile) return <ErrorState description="No pudimos cargar tu perfil." onRetry={load} />;

  const age = (() => {
    const birth = new Date(profile.birthDate);
    const now = new Date();
    let value = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) value -= 1;
    return value;
  })();

  return (
    <div className="animate-fade-up space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Mi perfil</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Tus datos personales y de contacto para las consultas.</p>
      </header>

      <section className="card flex flex-wrap items-center gap-4 p-5 sm:p-6" aria-label="Resumen del perfil">
        <Avatar name={`${profile.firstName} ${profile.lastName}`} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-extrabold text-navy-800">{profile.firstName} {profile.lastName}</h3>
            <Badge variant="success" dot>Cuenta activa</Badge>
          </div>
          <p className="mt-0.5 text-sm font-medium text-slate-500">{age} años · Paciente desde 2024</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Identidad verificada
        </span>
      </section>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <section aria-labelledby="identidad-title" className="card p-5">
            <h3 id="identidad-title" className="flex items-center gap-2 text-sm font-extrabold text-navy-800">
              <IdCard className="h-4 w-4 text-slate-400" aria-hidden="true" /> Datos de identidad
            </h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[['Nombre', `${profile.firstName} ${profile.lastName}`], ['DNI', profile.dni], ['Fecha de nacimiento', formatDate(profile.birthDate)], ['Obra social', profile.healthInsurance]].map(([term, value]) => (
                <div key={term} className="flex items-center justify-between gap-3">
                  <dt className="text-xs font-semibold text-slate-400">{term}</dt>
                  <dd className="truncate text-xs font-bold capitalize text-navy-800">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-action">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Estos datos son verificables y solo pueden modificarse con soporte.
            </p>
          </section>

          <section aria-labelledby="privacidad-title" className="card p-5">
            <h3 id="privacidad-title" className="flex items-center gap-2 text-sm font-extrabold text-navy-800">
              <PhoneCall className="h-4 w-4 text-slate-400" aria-hidden="true" /> ¿Quién ve estos datos?
            </h3>
            <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-xs font-medium leading-relaxed text-slate-500">
              <li>Tus profesionales tratantes ven lo necesario para la consulta.</li>
              <li>Tu contacto de emergencia se usa solo ante urgencias.</li>
              <li>Nunca compartimos tus datos con terceros sin tu permiso.</li>
            </ul>
          </section>
        </aside>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <section aria-labelledby="contacto-title" className="card p-5 sm:p-6">
            <h3 id="contacto-title" className="text-base font-extrabold text-navy-800">Datos de contacto</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Teléfono" htmlFor="telefono">
                <Input id="telefono" type="tel" value={form.phone} onChange={setField('phone')} placeholder="+54 9 11 …" autoComplete="tel" required />
              </Field>
              <Field label="Email" htmlFor="email">
                <Input id="email" type="email" value={form.email} onChange={setField('email')} placeholder="tu@email.com" autoComplete="email" required />
              </Field>
            </div>
          </section>

          <section aria-labelledby="direccion-title" className="card p-5 sm:p-6">
            <h3 id="direccion-title" className="flex items-center gap-2 text-base font-extrabold text-navy-800">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" /> Dirección para consultas a domicilio
            </h3>
            <div className="mt-4 grid gap-4">
              <Field label="Calle y número" htmlFor="calle">
                <Input id="calle" value={form.street} onChange={setField('street')} placeholder="Virrey del Pino 2380, 3º A" autoComplete="street-address" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Ciudad" htmlFor="ciudad">
                  <Input id="ciudad" value={form.city} onChange={setField('city')} placeholder="CABA" autoComplete="address-level2" />
                </Field>
                <Field label="Provincia" htmlFor="provincia">
                  <Input id="provincia" value={form.province} onChange={setField('province')} placeholder="Buenos Aires" autoComplete="address-level1" />
                </Field>
                <Field label="Código postal" htmlFor="cp">
                  <Input id="cp" value={form.zipCode} onChange={setField('zipCode')} placeholder="C1426" autoComplete="postal-code" />
                </Field>
              </div>
            </div>
          </section>

          <section aria-labelledby="emergencia-title" className="card p-5 sm:p-6">
            <h3 id="emergencia-title" className="text-base font-extrabold text-navy-800">Contacto de emergencia</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">Lo usamos únicamente si surge una urgencia durante una consulta.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Nombre" htmlFor="emergencia-nombre">
                <Input id="emergencia-nombre" value={form.emergencyName} onChange={setField('emergencyName')} placeholder="Jorge López" />
              </Field>
              <Field label="Vínculo" htmlFor="emergencia-vinculo">
                <Input id="emergencia-vinculo" value={form.emergencyRelationship} onChange={setField('emergencyRelationship')} placeholder="Hijo/a" />
              </Field>
              <Field label="Teléfono" htmlFor="emergencia-telefono">
                <Input id="emergencia-telefono" type="tel" value={form.emergencyPhone} onChange={setField('emergencyPhone')} placeholder="+54 9 11 …" />
              </Field>
            </div>
          </section>

          <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
            {!dirty && !saving && <p className="text-xs font-semibold text-slate-400 sm:mr-auto">Todos los cambios guardados.</p>}
            <button
              type="button"
              onClick={() => profile && setForm(profileToForm(profile))}
              disabled={!dirty || saving}
              className="btn-secondary justify-center py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              Descartar cambios
            </button>
            <button type="submit" disabled={!dirty || saving} className="btn-primary justify-center py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">
              <Save className="h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
