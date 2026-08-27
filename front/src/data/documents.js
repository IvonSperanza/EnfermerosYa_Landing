import { addDays } from '../lib/format';

export const INITIAL_DOCUMENTS = [
  { id: 'doc-001', patientId: 'pat-006', kind: 'informe', title: 'Perfil lipídico — Laboratorio Central', uploadedAt: addDays(new Date(), -20).toISOString(), status: 'verified', size: '412 KB' },
  { id: 'doc-002', patientId: 'pat-006', kind: 'indicacion', title: 'Indicación de metformina 850mg', uploadedAt: addDays(new Date(), -21).toISOString(), status: 'verified', size: '180 KB' },
  { id: 'doc-003', patientId: 'pat-001', kind: 'estudio', title: 'Electrocardiograma de control', uploadedAt: addDays(new Date(), -60).toISOString(), status: 'verified', size: '1,2 MB' },
  { id: 'doc-004', patientId: 'pat-001', kind: 'receta', title: 'Receta losartán 50mg (crónica)', uploadedAt: addDays(new Date(), -14).toISOString(), status: 'verified', size: '165 KB' },
  { id: 'doc-005', patientId: 'pat-003', kind: 'estudio', title: 'Radiografía de rodilla derecha', uploadedAt: addDays(new Date(), -90).toISOString(), status: 'verified', size: '2,8 MB' },
  { id: 'doc-006', patientId: 'pat-004', kind: 'indicacion', title: 'Plan de ejercicios progresivo', uploadedAt: addDays(new Date(), -3).toISOString(), status: 'pending', size: '220 KB' },
];
