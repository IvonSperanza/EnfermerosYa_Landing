import { Plus, Trash2 } from 'lucide-react';
import { WEEKDAY_LABELS } from '../../data/availability';
import { cn } from '../../lib/utils';

function RangeRow({ range, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={range.start}
        onChange={(event) => onChange({ ...range, start: event.target.value })}
        className="form-input px-2.5 py-1.5 text-xs"
        aria-label="Hora inicio"
      />
      <span className="text-xs font-bold text-slate-400">—</span>
      <input
        type="time"
        value={range.end}
        onChange={(event) => onChange({ ...range, end: event.target.value })}
        className={cn('form-input px-2.5 py-1.5 text-xs', range.end <= range.start && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
        aria-label="Hora fin"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
        aria-label="Eliminar horario"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function DayRangesEditor({ weekly, onChange, addLabel = 'Agregar horario' }) {
  const updateDay = (day, ranges) => onChange({ ...weekly, [day]: ranges });

  return (
    <div className="divide-y divide-slate-100">
      {Object.keys(WEEKDAY_LABELS).map((dayKey) => {
        const ranges = weekly[dayKey] || [];
        const enabled = ranges.length > 0;
        return (
          <div key={dayKey} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex w-full items-center justify-between gap-3 sm:w-40 sm:shrink-0">
              <span className={cn('text-sm font-bold', enabled ? 'text-navy-800' : 'text-slate-400')}>
                {WEEKDAY_LABELS[dayKey]}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`Alternar ${WEEKDAY_LABELS[dayKey]}`}
                onClick={() => updateDay(dayKey, enabled ? [] : [{ start: '08:00', end: '12:00' }])}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2',
                  enabled ? 'bg-action' : 'bg-slate-300',
                )}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                    enabled ? 'translate-x-[22px]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              {enabled ? (
                <>
                  {ranges.map((range, index) => (
                    <RangeRow
                      key={`${dayKey}-${index}-${range.start}`}
                      range={range}
                      canRemove={ranges.length > 1}
                      onChange={(next) => {
                        const copy = [...ranges];
                        copy[index] = next;
                        updateDay(dayKey, copy);
                      }}
                      onRemove={() => updateDay(dayKey, ranges.filter((_, i) => i !== index))}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const last = ranges[ranges.length - 1];
                      updateDay(dayKey, [...ranges, { start: last ? last.end : '16:00', end: last ? `${String(Math.min(21, Number(last.end.slice(0, 2)) + 4)).padStart(2, '0')}:00` : '20:00' }]);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-action transition-colors hover:bg-blue-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {addLabel}
                  </button>
                </>
              ) : (
                <p className="py-1 text-sm font-medium text-slate-400">No disponible</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
