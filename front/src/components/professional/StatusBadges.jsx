import Badge from '../ui/Badge';
import {
  APPOINTMENT_STATUS,
  DOCUMENT_KINDS,
  MODALITIES,
  PAYMENT_STATUS,
  VERIFICATION_STATUS,
} from '../../lib/status';

export function AppointmentStatusBadge({ status }) {
  const config = APPOINTMENT_STATUS[status] || APPOINTMENT_STATUS.pendiente;
  return <Badge variant={config.badge}>{config.label}</Badge>;
}

export function ModalityBadge({ modality }) {
  const config = MODALITIES[modality] || MODALITIES.presencial;
  return <Badge variant={config.badge}>{config.label}</Badge>;
}

export function PaymentStatusBadge({ status }) {
  const config = PAYMENT_STATUS[status] || PAYMENT_STATUS.pendiente;
  return <Badge variant={config.badge}>{config.label}</Badge>;
}

export function VerificationBadge({ status }) {
  const config = VERIFICATION_STATUS[status] || VERIFICATION_STATUS.pending;
  return (
    <Badge variant={config.badge} dot>
      {config.label}
    </Badge>
  );
}

export function DocumentKindBadge({ kind }) {
  const config = DOCUMENT_KINDS[kind] || DOCUMENT_KINDS.informe;
  return <Badge variant={config.badge}>{config.label}</Badge>;
}
