import { addDays } from '../lib/format';

function ago(hours) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

export const INITIAL_CLIENT_CONVERSATIONS = [
  {
    id: 'cconv-001',
    professionalId: 'pro-001',
    professionalOnline: true,
    unread: 2,
    messages: [
      { id: 'cm-101', from: 'pro', text: '¡Hola María! Vi que reservaste para el miércoles a las 15:30. ¿Seguimos con el control de la presión?', sentAt: ago(26) },
      { id: 'cm-102', from: 'me', text: 'Hola, doctora. Sí, el miércoles perfecto. Le aviso que vengo con los análisis listos.', sentAt: ago(25) },
      { id: 'cm-103', from: 'pro', text: 'Excelente. Traé también la caja de Enalapril así revisamos las dosis. ¡Nos vemos!', sentAt: ago(5) },
    ],
  },
  {
    id: 'cconv-002',
    professionalId: 'pro-002',
    professionalOnline: true,
    unread: 1,
    messages: [
      { id: 'cm-201', from: 'me', text: 'Buenas tardes, Diego. Quería coordinar el control de signos vitales del viernes en mi domicilio.', sentAt: ago(48) },
      { id: 'cm-202', from: 'pro', text: 'Hola María, dale. Te confirmo entre 9 y 9:30 hs. ¿La dirección sigue siendo Virrey del Pino 2380?', sentAt: ago(47) },
      { id: 'cm-203', from: 'me', text: 'Correcto, piso 3 A. Toco timbre López.', sentAt: ago(46) },
      { id: 'cm-204', from: 'pro', text: 'Perfecto, quedamos así. Cualquier cambio me avisás por acá.', sentAt: ago(2) },
    ],
  },
  {
    id: 'cconv-003',
    professionalId: 'pro-005',
    professionalOnline: false,
    unread: 0,
    messages: [
      { id: 'cm-301', from: 'pro', text: 'María, subí el informe de tu consulta al historial. Cualquier duda sobre la crema indicada, escribime.', sentAt: ago(24 * 20) },
      { id: 'cm-302', from: 'me', text: 'Gracias, doctora. Ya lo descargué. La mancha se ve mucho mejor.', sentAt: ago(24 * 19) },
      { id: 'cm-303', from: 'pro', text: 'Me alegro. Nos vemos en el control anual.', sentAt: ago(24 * 19 - 2) },
    ],
  },
  {
    id: 'cconv-004',
    professionalId: 'pro-007',
    professionalOnline: false,
    unread: 0,
    messages: [
      { id: 'cm-401', from: 'me', text: 'Buenas noches, doctora. Consultaba si puedo tomar la pastilla para dormir junto con el Enalapril.', sentAt: ago(24 * 9) },
      { id: 'cm-402', from: 'pro', text: 'Hola María. No hay interacción relevante, pero idealmente dejá dos horas entre ambos. Igual lo vemos en la próxima consulta.', sentAt: ago(24 * 9 - 1) },
    ],
  },
];

export const AUTO_REPLIES = [
  'Perfecto, quedo a la espera. Cualquier novedad me escribís.',
  'Gracias por el dato, María. Lo tengo en cuenta para tu próxima consulta.',
  'Dale, lo reviso y te confirmo por acá mismo.',
  'Anotado. Si necesitás reprogramar avisame con anticipación, por favor.',
];
