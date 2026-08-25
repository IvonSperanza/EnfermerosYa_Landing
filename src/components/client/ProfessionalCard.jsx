import { BadgeCheck, MapPin } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { Link } from '../../router/Router';
import { formatCurrency } from '../../lib/format';
import { cn } from '../../lib/utils';
import { CLIENT_PROFESSIONAL_STATUS, MODALITIES } from '../../lib/status';
import RatingStars from './RatingStars';

const MODALITY_LABELS = Object.fromEntries(Object.entries(MODALITIES).map(([key, value]) => [key, value.label]));

export default function ProfessionalCard({ professional, reason, compactActions = false }) {
  const statusConfig = CLIENT_PROFESSIONAL_STATUS[professional.status] || CLIENT_PROFESSIONAL_STATUS.offline;
  const fullName = `${professional.firstName} ${professional.lastName}`;

  return (
    <article className="card flex flex-col p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start gap-3.5">
        <Avatar name={fullName} size="lg" onlineStatus={professional.availableNow ? 'online' : undefined} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="truncate text-base font-extrabold text-navy-800">{fullName}</h3>
            {professional.verificationStatus === 'verified' && (
              <span title="Matrícula verificada por EnfermerosYa">
                <BadgeCheck className="h-4 w-4 shrink-0 text-action" aria-label="Verificado" />
              </span>
            )}
          </div>
          <p className="truncate text-sm font-semibold text-slate-600">{professional.headline}</p>
          <p className="mt-0.5 inline-flex items-center gap-1 truncate text-xs font-medium text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" /> {professional.zone}
          </p>
        </div>
        <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold ring-1 ring-slate-200')}>
          <span className={cn('h-2 w-2 rounded-full', statusConfig.dotClass)} aria-hidden="true" />
          {statusConfig.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <RatingStars rating={professional.rating} reviewsCount={professional.reviewsCount} />
        <p className="text-sm font-extrabold text-navy-800">
          Desde {formatCurrency(professional.priceFrom)}
          <span className="ml-1 text-xs font-medium text-slate-400">/ consulta</span>
        </p>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Modalidades de atención">
        {professional.modalities.map((modality) => (
          <li key={modality}>
            <Badge variant={MODALITIES[modality]?.badge || 'neutral'}>{MODALITY_LABELS[modality] || modality}</Badge>
          </li>
        ))}
        {professional.acceptsOnline && (
          <li>
            <Badge variant="success" dot>E-consulta disponible</Badge>
          </li>
        )}
      </ul>

      {reason && (
        <p className="mt-3 rounded-xl bg-blue-50/70 px-3 py-2 text-xs font-bold text-action">✦ {reason}</p>
      )}

      <div className={cn('mt-auto grid gap-2 pt-4', compactActions ? 'grid-cols-2' : 'sm:grid-cols-2')}>
        <Link to={`/cliente/profesionales/${professional.id}`} className="btn-secondary py-2.5 text-xs">
          Ver perfil
        </Link>
        {professional.acceptsOnline && !compactActions ? (
          <Link to={`/cliente/reservar?profesional=${professional.id}`} className="btn-primary py-2.5 text-xs">
            Reservar
          </Link>
        ) : (
          <Link to={`/cliente/reservar?profesional=${professional.id}`} className="btn-primary py-2.5 text-xs">
            Reservar
          </Link>
        )}
      </div>
    </article>
  );
}
