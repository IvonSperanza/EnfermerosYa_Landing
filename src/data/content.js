import {
  Activity,
  Bandage,
  CalendarClock,
  ClipboardCheck,
  Clock,
  CreditCard,
  Dumbbell,
  Facebook,
  FileCheck,
  FileText,
  FlaskConical,
  Headphones,
  Home,
  Instagram,
  Linkedin,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Twitter,
  UserCheck,
} from 'lucide-react';

export const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Buscar profesionales', href: '#profesionales' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'E-consultas', href: '#econsultas' },
  { label: 'Para profesionales', href: '#para-profesionales' },
  { label: 'Preguntas frecuentes', href: '#faq' },
];

export const QUICK_ACCESS = [
  {
    icon: Search,
    title: 'Buscar profesional',
    description: 'Encontrá enfermeros, kinesiólogos y más cerca de tu hogar.',
    href: '#profesionales',
    iconClass: 'bg-blue-50 text-action',
  },
  {
    icon: Stethoscope,
    title: 'Servicios de salud',
    description: 'Curaciones, inyectables, controles y atención a domicilio.',
    href: '#servicios',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: MessageCircle,
    title: 'E-consulta',
    description: 'Resolvé tus dudas por chat con profesionales las 24hs.',
    href: '#econsultas',
    iconClass: 'bg-violet-50 text-violet-600',
  },
];

export const NEEDS = [
  {
    icon: Home,
    title: 'Enfermería a domicilio',
    price: 'Desde $4.500',
  },
  {
    icon: Activity,
    title: 'Toma de presión',
    price: 'Desde $2.000',
  },
  {
    icon: Bandage,
    title: 'Curaciones',
    price: 'Desde $3.500',
  },
  {
    icon: Syringe,
    title: 'Inyectables',
    price: 'Desde $2.800',
  },
  {
    icon: Clock,
    title: 'Enfermero por hora',
    price: 'Desde $6.000/h',
  },
  {
    icon: Dumbbell,
    title: 'Kinesiología',
    price: 'Desde $5.500',
  },
  {
    icon: FlaskConical,
    title: 'Prácticas de laboratorio',
    price: 'Desde $4.200',
  },
  {
    icon: ClipboardCheck,
    title: 'Controles de salud',
    price: 'Desde $3.000',
  },
  {
    icon: MoreHorizontal,
    title: 'Otros servicios',
    price: 'A convenir',
  },
];

export const PROFESSIONALS = [
  {
    id: 1,
    name: 'Laura Gómez',
    initials: 'LG',
    specialty: 'Enfermera profesional',
    license: 'M.N. 78.451',
    distance: '1.2 km',
    rating: '4.9',
    nextSlot: 'Hoy · 15:30',
  },
  {
    id: 2,
    name: 'Carlos Pérez',
    initials: 'CP',
    specialty: 'Kinesiólogo fisiatra',
    license: 'M.P. 42.108',
    distance: '2.5 km',
    rating: '4.8',
    nextSlot: 'Mañana · 09:00',
  },
  {
    id: 3,
    name: 'María Fernández',
    initials: 'MF',
    specialty: 'Enfermera gerontológica',
    license: 'M.N. 65.320',
    distance: '3.1 km',
    rating: '5.0',
    nextSlot: 'Hoy · 18:45',
  },
];

export const E_CONSULT_BENEFITS = [
  'Disponible las 24hs',
  'Profesionales matriculados',
  'Seguimiento por chat',
  'Atención personalizada',
];

export const CHAT_SCRIPT = [
  { from: 'user', text: 'Hola, ¿me pueden atender ahora?' },
  { from: 'pro', text: '¡Hola Martín! Claro, contame qué te pasa.' },
  { from: 'user', text: 'Tengo dolor lumbar desde hace tres días.' },
  { from: 'pro', text: 'Te recomiendo aplicar frío local y evitar esfuerzos. ¿Tenés fiebre?' },
  { from: 'user', text: 'No, solo el dolor.' },
  { from: 'pro', text: 'Perfecto. Te dejo las indicaciones y seguimos en contacto por acá.' },
];

export const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Buscá',
    description: 'Filtrá por especialidad, zona, fecha y modalidad de atención.',
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Elegí',
    description: 'Compará perfiles verificados, precios y calificaciones reales.',
  },
  {
    number: '03',
    icon: CalendarClock,
    title: 'Reservá',
    description: 'Elegí el horario que mejor te quede y confirmá al instante.',
  },
  {
    number: '04',
    icon: CreditCard,
    title: 'Pagá',
    description: 'Pagá online con Mercado Pago, de forma 100% segura.',
  },
];

export const TRUST_ITEMS = [
  {
    icon: FileCheck,
    title: 'Matriculados',
    description: 'Todos los profesionales cuentan con matrícula activa y verificada.',
  },
  {
    icon: ShieldCheck,
    title: 'Verificados',
    description: 'Validamos identidad, títulos y antecedentes de cada perfil.',
  },
  {
    icon: Lock,
    title: 'Pagos seguros',
    description: 'Tus pagos quedan protegidos mediante Mercado Pago.',
  },
  {
    icon: FileText,
    title: 'Información clara',
    description: 'Precios transparentes desde el primer momento, sin costos ocultos.',
  },
  {
    icon: Headphones,
    title: 'Atención personalizada',
    description: 'Soporte real los 7 días de la semana para ayudarte en lo que necesites.',
  },
  {
    icon: ShieldCheck,
    title: 'Protección de datos',
    description: 'Tu información personal viaja cifrada y nunca se comparte.',
  },
];

export const METRICS = [
  { value: '+1.200', label: 'Profesionales' },
  { value: '+8.500', label: 'Turnos realizados' },
  { value: '4.9', label: 'Calificación promedio' },
  { value: '24/7', label: 'Disponibilidad' },
];

export const PRO_BENEFITS = [
  'Recibí pedidos de trabajo cerca tuyo',
  'Definí tus horarios y zona de cobertura',
  'Cobrá de forma segura y sin demoras',
  'Hacé crecer tu reputación con reseñas reales',
];

export const FAQS = [
  {
    question: '¿Cómo reservo un turno con un profesional?',
    answer:
      'Buscá el servicio que necesitás, filtrá por zona y fecha, elegí el profesional que prefieras y hacé clic en "Reservar turno". Vas a recibir la confirmación al instante en tu email y podrás seguir todo desde tu cuenta.',
  },
  {
    question: '¿Los profesionales están matriculados y verificados?',
    answer:
      'Sí. Antes de publicar un perfil validamos la matrícula activa, los títulos y la identidad de cada profesional. Además, los pacientes dejan reseñas verificadas después de cada turno.',
  },
  {
    question: '¿Cómo funcionan las e-consultas?',
    answer:
      'Las e-consultas son consultas por chat con profesionales matriculados, disponibles las 24 horas. Escribí tu consulta, adjuntá estudios si lo necesitás y recibí una respuesta con indicaciones y seguimiento.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Trabajamos con Mercado Pago: tarjetas de crédito y débito, dinero en cuenta y transferencias. El pago se retiene de forma segura y se libera al profesional una vez completada la atención.',
  },
  {
    question: '¿En qué ciudades tienen cobertura?',
    answer:
      'Operamos en las principales ciudades de Argentina, con cobertura creciente de barrios y zonas de gran Buenos Aires. Podés activar "Usar mi ubicación" para ver los profesionales disponibles cerca tuyo.',
  },
];

export const TRUST_SEALS = [
  { icon: Lock, label: 'Pago seguro con Mercado Pago' },
  { icon: ShieldCheck, label: 'Profesionales verificados' },
  { icon: MapPin, label: 'Cobertura en Argentina' },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Plataforma',
    links: ['Buscar profesionales', 'Servicios de salud', 'E-consultas'],
  },
  {
    title: 'Profesionales',
    links: ['Quiero registrarme', 'Centro de profesionales', 'Tarifas y comisiones', 'Recursos útiles'],
  },
  {
    title: 'Soporte',
    links: ['Preguntas frecuentes', 'Centro de ayuda', 'Contacto', 'WhatsApp'],
  },
  {
    title: 'Legal',
    links: ['Términos y condiciones', 'Política de privacidad', 'Política de cookies', 'Acuerdo de profesional'],
  },
];

export const SOCIAL_LINKS = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
];
