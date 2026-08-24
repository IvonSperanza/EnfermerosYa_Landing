import { useMemo, useRef, useState } from 'react';
import {
  BadgeCheck, Camera, Clock, Eye, FileCheck2, FileWarning, Home as HomeIcon,
  Lock, Mail, MapPin, MessageSquare, Plus, Save, ShieldCheck, Star, Upload, X,
} from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Switch from '../../components/ui/Switch';
import Tabs from '../../components/ui/Tabs';
import { Input, Select, Textarea } from '../../components/ui/Form';
import { VerificationBadge } from '../../components/professional/StatusBadges';
import { useToast } from '../../context/ToastContext';
import { profileService } from '../../services/mockApi';
import { VERIFICATION_DOCS, professionalFullName } from '../../data/professional';
import { formatCurrency, formatDate } from '../../lib/format';
import { cn } from '../../lib/utils';

const TABS = [
  { id: 'personal', label: 'Datos personales' },
  { id: 'profesional', label: 'Datos profesionales' },
  { id: 'verificacion', label: 'Verificación', icon: ShieldCheck },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'publico', label: 'Perfil público' },
];

const ATTENTION_MODES = [
  { id: 'inOffice', label: 'Atiendo en mi consultorio', icon: HomeIcon },
  { id: 'acceptsHomeVisits', label: 'Atiendo a domicilio', icon: MapPin },
  { id: 'acceptsOnline', label: 'Realizo e-consultas', icon: MessageSquare },
];

const VERIFICATION_BANNERS = {
  verified: {
    className: 'bg-emerald-50 ring-1 ring-emerald-100',
    icon: ShieldCheck,
    iconClass: 'text-emerald-600 bg-white',
    title: 'Tu identidad y matrícula fueron verificadas correctamente.',
    description: 'Los pacientes ven el sello de verificado en tu perfil, lo que aumenta la confianza y las reservas.',
  },
};

export default function ProfilePage({ profile }) {
  const toast = useToast();
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState(profile);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingPro, setSavingPro] = useState(false);
  const [docs, setDocs] = useState(VERIFICATION_DOCS);
  const [serviceInput, setServiceInput] = useState('');
  const avatarInputRef = useRef(null);
  const docInputsRef = useRef({});
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);

  const completeness = useMemo(() => {
    const checks = [
      Boolean(form.firstName && form.lastName),
      Boolean(form.dni),
      Boolean(form.phone),
      Boolean(form.email),
      Boolean(form.description),
      Boolean(form.licenseNumber),
      form.experienceYears > 0,
      form.services.length > 0,
      Boolean(form.address.street),
      form.verificationStatus === 'verified',
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const savePersonal = async () => {
    setSavingPersonal(true);
    await profileService.updateProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      dni: form.dni,
      birthDate: form.birthDate,
      phone: form.phone,
      email: form.email,
      avatar: avatarPreview,
    });
    setSavingPersonal(false);
    toast.success('Datos personales actualizados');
  };

  const saveProfessional = async () => {
    setSavingPro(true);
    await profileService.updateProfile({
      specialty: form.specialty,
      licenseNumber: form.licenseNumber,
      licenseProvince: form.licenseProvince,
      experienceYears: Number(form.experienceYears),
      description: form.description,
      services: form.services,
      acceptsInOffice: form.acceptsInOffice,
      acceptsHomeVisits: form.acceptsHomeVisits,
      acceptsOnline: form.acceptsOnline,
    });
    setSavingPro(false);
    toast.success('Datos profesionales actualizados');
  };

  const handleAvatarChange = (event) => {
    const [file] = event.target.files;
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    event.target.value = '';
    toast.success('Foto de perfil actualizada');
  };

  const addService = () => {
    const name = serviceInput.trim();
    if (!name) return;
    if (form.services.some((service) => service.name.toLowerCase() === name.toLowerCase())) {
      toast.info('Ese servicio ya está cargado.');
      return;
    }
    setForm((current) => ({
      ...current,
      services: [...current.services, { id: `srv-${Date.now()}`, name, price: 12000, durationMinutes: 30 }],
    }));
    setServiceInput('');
    toast.success('Servicio agregado');
  };

  const removeService = (id) => {
    setForm((current) => ({ ...current, services: current.services.filter((service) => service.id !== id) }));
  };

  const handleVerificationUpload = async (docId, kind) => {
    await profileService.updateVerificationDoc(docId, { status: 'pending', uploadedAt: new Date().toISOString().slice(0, 10) });
    setDocs((current) =>
      current.map((doc) => (doc.id === docId ? { ...doc, status: 'pending', uploadedAt: new Date().toISOString().slice(0, 10), fileName: `${kind.toLowerCase().replace(/\s/g, '-')}-nuevo.pdf` } : doc)),
    );
    toast.success('Documento enviado a revisión');
  };

  const banner = VERIFICATION_BANNERS[form.verificationStatus];

  return (
    <div className="animate-fade-up space-y-6">
      <header className="card flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => avatarInputRef.current?.click()} className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-action" aria-label="Cambiar foto de perfil">
            <Avatar name={professionalFullName(form)} src={avatarPreview} size="xl" />
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-action text-white shadow-md transition-transform group-hover:scale-105">
              <Camera className="h-4 w-4" />
            </span>
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} tabIndex={-1} aria-hidden="true" />
          <div>
            <h2 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">
              Dra. María González
              {form.verificationStatus === 'verified' && (
                <BadgeCheck className="h-6 w-6 text-action" aria-label="Perfil verificado" />
              )}
            </h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Médica Clínica · {form.licenseNumber} · {form.rating} ★ ({form.reviewsCount} reseñas)
            </p>
          </div>
        </div>

        <div className="lg:ml-auto lg:w-64">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">PERFIL COMPLETO</span>
            <span className={completeness >= 80 ? 'text-emerald-600' : 'text-amber-600'}>{completeness}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-full rounded-full transition-all duration-500', completeness >= 80 ? 'bg-emerald-500' : 'bg-amber-400')}
              style={{ width: `${completeness}%` }}
              role="progressbar"
              aria-valuenow={completeness}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Completitud del perfil"
            />
          </div>
        </div>
      </header>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'personal' && (
        <section className="card max-w-3xl p-5 sm:p-6">
          <h3 className="text-base font-extrabold text-navy-800">Datos personales</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="form-label">Nombre</span><Input value={form.firstName} onChange={updateField('firstName')} /></label>
            <label className="block"><span className="form-label">Apellido</span><Input value={form.lastName} onChange={updateField('lastName')} /></label>
            <label className="block"><span className="form-label">DNI</span><Input value={form.dni} onChange={updateField('dni')} /></label>
            <label className="block"><span className="form-label">Fecha de nacimiento</span><Input type="date" value={form.birthDate} onChange={updateField('birthDate')} /></label>
            <label className="block"><span className="form-label">Teléfono</span><Input type="tel" value={form.phone} onChange={updateField('phone')} /></label>
            <label className="block"><span className="form-label">Email</span><Input type="email" value={form.email} onChange={updateField('email')} /></label>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <button type="button" onClick={savePersonal} disabled={savingPersonal} className="btn-primary">
              <Save className="h-4 w-4" /> {savingPersonal ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </section>
      )}

      {tab === 'profesional' && (
        <section className="grid max-w-5xl gap-6 lg:grid-cols-2">
          <div className="card p-5 sm:p-6">
            <h3 className="text-base font-extrabold text-navy-800">Datos profesionales</h3>
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="form-label">Profesión</span>
                  <Select value={form.profession} onChange={updateField('profession')}>
                    <option value="medico">Médico/a</option>
                    <option value="enfermero">Enfermero/a</option>
                  </Select>
                </label>
                <label className="block"><span className="form-label">Especialidad</span><Input value={form.specialty} onChange={updateField('specialty')} /></label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="form-label">Matrícula</span><Input value={form.licenseNumber} onChange={updateField('licenseNumber')} hint="Se muestra verificada en tu perfil público" /></label>
                <label className="block">
                  <span className="form-label">Provincia</span>
                  <Select value={form.licenseProvince} onChange={updateField('licenseProvince')}>
                    {['CABA', 'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán'].map((province) => (
                      <option key={province}>{province}</option>
                    ))}
                  </Select>
                </label>
              </div>
              <label className="block"><span className="form-label">Años de experiencia</span><Input type="number" min="0" max="60" value={form.experienceYears} onChange={updateField('experienceYears')} /></label>
              <label className="block">
                <span className="form-label">Descripción</span>
                <Textarea rows={4} maxLength={400} value={form.description} onChange={updateField('description')} />
                <span className="mt-1 block text-right text-[11px] font-semibold text-slate-400">{form.description.length}/400</span>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-5 sm:p-6">
              <h3 className="text-base font-extrabold text-navy-800">Servicios</h3>
              <p className="mt-1 text-xs font-medium text-slate-400">Los servicios que ofrecés con su precio estimado.</p>
              <ul className="mt-4 space-y-2">
                {form.services.map((service) => (
                  <li key={service.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <FileCheck2 className="h-4 w-4 shrink-0 text-action" />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-navy-800">{service.name}</span>
                    <span className="shrink-0 text-xs font-bold text-slate-500">{formatCurrency(service.price)}</span>
                    <button type="button" onClick={() => removeService(service.id)} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500" aria-label={`Quitar ${service.name}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Input
                  value={serviceInput}
                  onChange={(event) => setServiceInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addService())}
                  placeholder="Nuevo servicio…"
                  aria-label="Nuevo servicio"
                />
                <button type="button" onClick={addService} className="btn-secondary shrink-0 px-3" aria-label="Agregar servicio">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <h3 className="text-base font-extrabold text-navy-800">Modalidades de atención</h3>
              <div className="mt-4 space-y-3.5">
                {ATTENTION_MODES.map((mode) => (
                  <Switch
                    key={mode.id}
                    checked={Boolean(form[mode.id])}
                    label={mode.label}
                    onChange={(checked) => setForm((current) => ({ ...current, [mode.id]: checked }))}
                  />
                ))}
              </div>
              <button type="button" onClick={saveProfessional} disabled={savingPro} className="btn-primary mt-6 w-full">
                <Save className="h-4 w-4" /> {savingPro ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </section>
      )}

      {tab === 'verificacion' && (
        <section className="max-w-4xl space-y-6">
          {banner && (
            <div className={cn('flex items-start gap-4 rounded-2xl p-5', banner.className)}>
              <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-card', banner.iconClass)}>
                <banner.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-navy-800">{banner.title}</h3>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">{banner.description}</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {docs.map((doc) => (
              <article key={doc.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-action">
                    <FileCheck2 className="h-5 w-5" />
                  </span>
                  <VerificationBadge status={doc.status} />
                </div>
                <h4 className="mt-3 text-sm font-extrabold text-navy-800">{doc.kind}</h4>
                <p className="mt-0.5 truncate text-xs font-medium text-slate-400" title={doc.fileName}>
                  {doc.fileName}
                </p>
                <p className="mt-1 text-xs font-semibold capitalize text-slate-400">Subido el {formatDate(`${doc.uploadedAt}T12:00:00`)}</p>
                <input
                  ref={(element) => { docInputsRef.current[doc.id] = element; }}
                  type="file"
                  className="hidden"
                  onChange={() => handleVerificationUpload(doc.id, doc.kind)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <button type="button" onClick={() => docInputsRef.current[doc.id]?.click()} className="btn-secondary mt-4 w-full py-2 text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  {doc.status === 'verified' ? 'Reemplazar documento' : 'Volver a enviar'}
                </button>
              </article>
            ))}

            <article className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center transition-colors hover:border-action hover:bg-blue-50/40">
              <FileWarning className="h-6 w-6 text-slate-300" />
              <h4 className="mt-2 text-sm font-bold text-slate-500">Certificaciones adicionales</h4>
              <p className="mt-1 text-xs font-medium text-slate-400">Sumá cursos o especialidades para destacar.</p>
            </article>
          </div>

          <div className="flex gap-3 rounded-2xl bg-blue-50/70 p-4">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-action" />
            <p className="text-xs font-medium leading-relaxed text-navy-800">
              Tu documentación es privada y solo la revisa nuestro equipo de verificación. Nunca se muestra a los pacientes.
            </p>
          </div>
        </section>
      )}

      {tab === 'ubicacion' && <LocationTab form={form} setForm={setForm} onSave={async () => {
        await profileService.updateProfile({ address: form.address, showApproximateLocation: form.showApproximateLocation });
        toast.success('Ubicación actualizada');
      }} />}

      {tab === 'publico' && <PublicProfilePreview profile={form} />}
    </div>
  );
}

function LocationTab({ form, setForm, onSave }) {
  const toast = useToast();
  const [pin, setPin] = useState({ x: 58, y: 42 });

  const address = form.address;
  const setAddressField = (field) => (event) =>
    setForm((current) => ({ ...current, address: { ...current.address, [field]: event.target.value } }));

  const handleMapClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPin({ x, y });
    toast.info('Ubicación aproximada actualizada.');
  };

  return (
    <section className="grid max-w-6xl gap-6 lg:grid-cols-2">
      <div className="card p-5 sm:p-6">
        <h3 className="text-base font-extrabold text-navy-800">Domicilio profesional</h3>
        <p className="mt-1 text-xs font-medium text-slate-400">Esta dirección nunca se muestra públicamente.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="form-label">Dirección</span><Input value={address.street} onChange={setAddressField('street')} /></label>
          <label className="block"><span className="form-label">Altura</span><Input value={address.number} onChange={setAddressField('number')} /></label>
          <label className="block"><span className="form-label">Piso</span><Input value={address.floor} onChange={setAddressField('floor')} /></label>
          <label className="block"><span className="form-label">Departamento</span><Input value={address.apartment} onChange={setAddressField('apartment')} /></label>
          <label className="block"><span className="form-label">Ciudad</span><Input value={address.city} onChange={setAddressField('city')} /></label>
          <label className="block"><span className="form-label">Provincia</span><Input value={address.province} onChange={setAddressField('province')} /></label>
          <label className="block"><span className="form-label">Código postal</span><Input value={address.zipCode} onChange={setAddressField('zipCode')} /></label>
        </div>

        <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5">
          <Switch
            checked={form.showApproximateLocation}
            label="Mostrar ubicación aproximada a pacientes"
            description="Solo se comparte la zona (ej.: Belgrano, CABA). La dirección exacta queda protegida."
            onChange={(checked) => setForm((current) => ({ ...current, showApproximateLocation: checked }))}
          />
        </div>

        <button type="button" onClick={onSave} className="btn-primary mt-6 w-full sm:w-auto">
          <Save className="h-4 w-4" /> Guardar cambios
        </button>
      </div>

      <div className="space-y-6">
        <div className="card overflow-hidden">
          <div
            role="application"
            aria-label="Mapa: hacé clic para mover el pin de tu ubicación"
            tabIndex={0}
            onClick={handleMapClick}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 5 : 1;
              if (event.key === 'ArrowLeft') setPin((current) => ({ ...current, x: Math.max(2, current.x - step) }));
              if (event.key === 'ArrowRight') setPin((current) => ({ ...current, x: Math.min(98, current.x + step) }));
              if (event.key === 'ArrowUp') setPin((current) => ({ ...current, y: Math.max(4, current.y - step) }));
              if (event.key === 'ArrowDown') setPin((current) => ({ ...current, y: Math.min(96, current.y + step) }));
            }}
            className="relative aspect-video cursor-crosshair bg-[#e8eef5]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.9) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.9) 2px, transparent 2px), linear-gradient(rgba(203,213,225,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(203,213,225,.35) 1px, transparent 1px)',
              backgroundSize: '120px 90px, 160px 110px, 24px 24px, 28px 28px',
            }}
          >
            <div aria-hidden="true" className="absolute left-[-4%] top-[46%] h-7 w-[112%] rotate-[-14deg] bg-white/85 shadow-inner" />
            <div aria-hidden="true" className="absolute left-[38%] top-[-4%] h-[112%] w-6 rotate-[9deg] bg-white/75" />
            <div aria-hidden="true" className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-card">
              Zona aproximada
            </div>
            <div
              className="absolute -translate-x-1/2 -translate-y-full transition-all duration-200"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <span className="relative flex flex-col items-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-action text-white shadow-float ring-4 ring-white">
                  <MapPin className="h-5 w-5" />
                </span>
                <span aria-hidden="true" className="-mt-1 h-2.5 w-2.5 rotate-45 bg-action ring-2 ring-white" />
              </span>
            </div>
          </div>
          <footer className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-xs font-semibold capitalize text-slate-500">
              <Mail className="mr-1 inline h-3.5 w-3.5 text-action" />
              Zona visible: <strong className="font-extrabold text-navy-800">{address.zoneLabel}</strong>
            </p>
            <Badge variant="success">Protegida</Badge>
          </footer>
        </div>
      </div>
    </section>
  );
}

function PublicProfilePreview({ profile }) {
  const fullName = `Dra. ${profile.firstName} ${profile.lastName}`;

  return (
    <section className="max-w-4xl space-y-5">
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50/70 p-4">
        <Eye className="mt-0.5 h-5 w-5 shrink-0 text-action" />
        <p className="text-xs font-semibold leading-relaxed text-navy-800">
          Así ve tu perfil un paciente antes de reservar una consulta. Podés previsualizarlo cuando quieras desde acá.
        </p>
      </div>

      <article className="card overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-navy-800 via-navy-700 to-action/70" aria-hidden="true" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end justify-between gap-3">
            <Avatar name={profile.firstName + ' ' + profile.lastName} size="xl" className="ring-4 ring-white" onlineStatus="online" />
            <span className="mb-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              {profile.rating} · {profile.reviewsCount} reseñas
            </span>
          </div>

          <h3 className="mt-3 flex items-center gap-1.5 text-lg font-extrabold text-navy-800">
            {fullName}
            <BadgeCheck className="h-5 w-5 text-action" aria-label="Verificado" />
          </h3>
          <p className="text-sm font-semibold text-slate-500">
            Médica Clínica · {profile.specialty}
          </p>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            Matrícula {profile.licenseNumber} · Verificada
          </p>

          <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">{profile.description}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {profile.services.map((service) => (
              <span key={service.id} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-navy-800">
                {service.name} · {formatCurrency(service.price)}
              </span>
            ))}
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-action" />
              <dt className="sr-only">Horarios</dt>
              <dd className="font-medium text-slate-600">Lunes, miércoles y viernes · 08:00 a 12:00</dd>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <dt className="sr-only">Modalidades</dt>
              <dd className="flex flex-wrap gap-1.5">
                {profile.acceptsInOffice && <Badge variant="blue">Consultorio</Badge>}
                {profile.acceptsHomeVisits && <Badge variant="violet">A domicilio</Badge>}
                {profile.acceptsOnline && <Badge variant="info" dot>Disponible para e-consulta</Badge>}
              </dd>
            </div>
            {profile.showApproximateLocation && (
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-action" />
                <dt className="sr-only">Zona</dt>
                <dd className="font-medium text-slate-600">{profile.address.zoneLabel} · ubicación aproximada</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" className="btn-primary">Solicitar consulta</button>
            <button type="button" className="btn-secondary">
              <MessageSquare className="h-4 w-4" /> Enviar mensaje
            </button>
          </div>
        </div>
      </article>

      <div className="card p-5">
        <h4 className="flex items-center gap-2 text-sm font-extrabold text-navy-800">
          <Lock className="h-4 w-4 text-action" /> Datos que nunca se muestran públicamente
        </h4>
        <ul className="mt-3 flex flex-wrap gap-2">
          {['DNI', 'Dirección exacta', 'Teléfono personal', 'Documentación privada'].map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
              <Lock className="h-3 w-3" /> {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
