import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState, PageLoader, ErrorState } from '../../components/ui/Feedback';
import AppointmentDetail from '../../components/professional/AppointmentDetail';
import { appointmentsService, availabilityService, patientsService } from '../../services/mockApi';
import { APPOINTMENT_STATUS, APPOINTMENT_TYPES } from '../../lib/status';
import {
  addDays,
  formatFullDate,
  formatMonthYear,
  formatTime,
  isSameDay,
  startOfWeek,
  toDate,
  toTimeString,
} from '../../lib/format';
import useMediaQuery from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 22;
const HOUR_HEIGHT = 58;
const TIMELINE_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

const VIEWS = [
  { id: 'day', label: 'Día' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
];

const STATUS_BLOCK_STYLES = {
  confirmada: 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100',
  pendiente: 'border-amber-400 bg-amber-50 hover:bg-amber-100',
  cancelada: 'border-red-300 bg-red-50 opacity-70',
  'en-curso': 'border-sky-500 bg-sky-50 hover:bg-sky-100',
  finalizada: 'border-slate-300 bg-slate-100 opacity-80',
};

const STATUS_DOT_STYLES = {
  confirmada: 'bg-emerald-500',
  pendiente: 'bg-amber-400',
  cancelada: 'bg-red-300',
  'en-curso': 'bg-sky-500',
  finalizada: 'bg-slate-300',
};

function hoursBetween(startIso, durationMinutes) {
  const start = toDate(startIso);
  const minutesFromDayStart = (start.getHours() * 60 + start.getMinutes()) - DAY_START_HOUR * 60;
  return {
    top: Math.max(0, (minutesFromDayStart / 60) * HOUR_HEIGHT),
    height: Math.max(30, (durationMinutes / 60) * HOUR_HEIGHT),
  };
}

export default function AgendaPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [availability, setAvailability] = useState(null);
  const [view, setView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([appointmentsService.list(), patientsService.list(), availabilityService.get()])
      .then(([appointmentList, patientList, availabilityData]) => {
        setAppointments(appointmentList);
        setPatientsMap(Object.fromEntries(patientList.map((patient) => [patient.id, `${patient.firstName} ${patient.lastName}`])));
        setAvailability(availabilityData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const effectiveView = isDesktop ? view : view === 'day' ? 'mobile-day' : view === 'week' ? 'mobile-week' : 'mobile-month';

  const appointmentsByDay = useMemo(() => {
    const map = new Map();
    for (const appointment of appointments) {
      const key = toDateString(appointment.startsAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(appointment);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    }
    return map;
  }, [appointments]);

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId) || null;

  const handleCancelled = (id) => {
    setAppointments((current) => current.map((appointment) => (appointment.id === id ? { ...appointment, status: 'cancelada' } : appointment)));
  };

  const move = (direction) => {
    setSelectedDate((current) => {
      if (effectiveView === 'mobile-month') return addDays(current, direction * 30);
      if (view === 'month') return addDays(current, direction * 30);
      if (view === 'week') return addDays(current, direction * 7);
      return addDays(current, direction);
    });
  };

  const goToday = () => setSelectedDate(new Date());

  if (loading || !availability) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="animate-fade-up space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => move(-1)} className="toolbar-btn" aria-label="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={goToday} className="rounded-xl px-3 py-2 text-sm font-bold text-navy-800 transition-colors hover:bg-blue-50">
            Hoy
          </button>
          <button type="button" onClick={() => move(1)} className="toolbar-btn" aria-label="Siguiente">
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="ml-2 text-lg font-extrabold capitalize tracking-tight text-navy-800 sm:text-xl">
            {effectiveView.startsWith('mobile-month') || view === 'month'
              ? formatMonthYear(selectedDate)
              : view === 'day' || effectiveView === 'mobile-day'
                ? formatFullDate(selectedDate)
                : `${formatMonthYear(weekDays[0]).split(' de ')[0]} ${weekDays[0].getDate()} – ${weekDays[6].getDate()}`}
          </h2>
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <div role="tablist" aria-label="Vista del calendario" className="flex rounded-xl bg-slate-100 p-1">
            {VIEWS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={view === option.id}
                onClick={() => setView(option.id)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action sm:text-sm',
                  view === option.id ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500 hover:text-navy-800',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5" aria-label="Estados de las consultas">
        {Object.entries(APPOINTMENT_STATUS).map(([key, config]) => (
          <li key={key} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className={cn('h-2 w-2 rounded-full', STATUS_DOT_STYLES[key])} aria-hidden="true" />
            {config.label}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-blue-200" />
          Disponible
        </li>
        <li className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span aria-hidden="true" className="h-2 w-2 rounded-full striped-block" />
          Bloqueado
        </li>
      </ul>

      {(effectiveView === 'mobile-day' || effectiveView === 'mobile-week') && (
        <DayStrip days={weekDays} selectedDate={selectedDate} onSelect={setSelectedDate} counts={appointmentsByDay} />
      )}

      {!isDesktop ? (
        <>
          {effectiveView === 'mobile-week' ? (
            <div className="space-y-5">
              {weekDays.map((day) => (
                <section key={toDateString(day)}>
                  <h3 className={cn('mb-2 text-sm font-extrabold capitalize', isSameDay(day, new Date()) ? 'text-action' : 'text-navy-800')}>
                    {formatFullDate(day)}
                  </h3>
                  <AgendaList
                    items={appointmentsByDay.get(toDateString(day)) || []}
                    patientsMap={patientsMap}
                    onSelect={setSelectedAppointmentId}
                  />
                </section>
              ))}
            </div>
          ) : (
            <>
              {effectiveView === 'mobile-month' && (
                <MiniMonthGrid
                  monthAnchor={selectedDate}
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                  }}
                  indicators={appointmentsByDay}
                />
              )}
              <h3 className="text-sm font-extrabold capitalize text-navy-800">{formatFullDate(selectedDate)}</h3>
              <AgendaList items={appointmentsByDay.get(toDateString(selectedDate)) || []} patientsMap={patientsMap} onSelect={setSelectedAppointmentId} />
            </>
          )}
        </>
      ) : view === 'day' ? (
        <DayTimeline
          date={selectedDate}
          items={appointmentsByDay.get(toDateString(selectedDate)) || []}
          availability={availability}
          patientsMap={patientsMap}
          onSelect={setSelectedAppointmentId}
        />
      ) : view === 'week' ? (
        <WeekGrid
          days={weekDays}
          appointmentsByDay={appointmentsByDay}
          availability={availability}
          patientsMap={patientsMap}
          onSelect={setSelectedAppointmentId}
          onDayClick={setSelectedDate}
        />
      ) : (
        <MonthGrid
          anchor={selectedDate}
          selectedDate={selectedDate}
          onSelectDay={(date) => {
            setSelectedDate(date);
            setView('day');
          }}
          onSelectAppointment={setSelectedAppointmentId}
          appointmentsByDay={appointmentsByDay}
          patientsMap={patientsMap}
          availability={availability}
        />
      )}

      <AppointmentDetail appointment={selectedAppointment} onClose={() => setSelectedAppointmentId(null)} onCancelled={handleCancelled} />
    </div>
  );
}

function toDateString(value) {
  const date = toDate(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function DayStrip({ days, selectedDate, onSelect, counts }) {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Elegir día">
      {days.map((day) => {
        const active = isSameDay(day, selectedDate);
        const count = (counts.get(toDateString(day)) || []).filter((appointment) => appointment.status !== 'cancelada').length;
        return (
          <button
            key={toDateString(day)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(day)}
            className={cn(
              'flex min-w-[64px] shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
              active ? 'border-action bg-action text-white shadow-sm' : 'border-slate-200 bg-white text-navy-800 hover:border-action',
            )}
          >
            <span className={cn('text-[10px] font-bold uppercase tracking-wide', active ? 'text-blue-100' : 'text-slate-400')}>
              {new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(day).replace('.', '')}
            </span>
            <span className="text-lg font-extrabold leading-none">{day.getDate()}</span>
            <span className={cn('mt-0.5 h-1.5 w-1.5 rounded-full', active ? 'bg-white' : count > 0 ? 'bg-emerald-400' : 'bg-transparent')} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function AgendaList({ items, patientsMap, onSelect }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-sm font-medium text-slate-400">
        Sin consultas para este día
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((appointment) => (
        <li key={appointment.id}>
          <button
            type="button"
            onClick={() => onSelect(appointment.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border-l-4 px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
              STATUS_BLOCK_STYLES[appointment.status],
            )}
          >
            <span className="shrink-0 text-xs font-extrabold tabular-nums text-navy-800">
              {formatTime(appointment.startsAt)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-navy-800">{patientsMap[appointment.patientId] || 'Paciente'}</span>
              <span className="block truncate text-xs font-medium text-slate-500">
                {APPOINTMENT_TYPES[appointment.type]?.label} · {appointment.durationMinutes} min
              </span>
            </span>
            <AppointmentStatusLabel status={appointment.status} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function AppointmentStatusLabel({ status }) {
  const config = APPOINTMENT_STATUS[status];
  return (
    <span className={cn(
      'hidden shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold sm:inline-flex',
      status === 'confirmada' && 'bg-emerald-100 text-emerald-700',
      status === 'pendiente' && 'bg-amber-100 text-amber-700',
      status === 'cancelada' && 'bg-red-50 text-red-500',
      status === 'en-curso' && 'bg-sky-100 text-sky-700',
      status === 'finalizada' && 'bg-slate-200 text-slate-600',
    )}>
      {config?.label}
    </span>
  );
}

function MiniMonthGrid({ monthAnchor, selectedDate, onSelect, indicators }) {
  const firstOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const gridStart = startOfWeek(firstOfMonth);
  const cells = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));

  return (
    <div className="card p-4">
      <div className="grid grid-cols-7 gap-1 text-center">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label, index) => (
          <span key={`${label}-${index}`} className="pb-1 text-[10px] font-bold uppercase text-slate-400">{label}</span>
        ))}
        {cells.map((cell) => {
          const outside = cell.getMonth() !== monthAnchor.getMonth();
          const hasEvents = (indicators.get(toDateString(cell)) || []).some((appointment) => appointment.status !== 'cancelada');
          const isSelected = isSameDay(cell, selectedDate);
          return (
            <button
              key={toDateString(cell)}
              type="button"
              onClick={() => onSelect(cell)}
              className={cn(
                'relative mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
                outside ? 'text-slate-300' : 'text-navy-800',
                isSelected ? 'bg-action text-white' : !outside && 'hover:bg-blue-50',
              )}
            >
              {cell.getDate()}
              {hasEvents && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AvailabilityOverlay({ date, availability }) {
  const dayNumber = ((date.getDay() + 6) % 7) + 1;
  const dateStr = toDateString(date);
  const ranges = availability.weekly[String(dayNumber)] || [];
  const eRanges = availability.eConsultWeekly[String(dayNumber)] || [];
  const isBlocked = (availability.blockedDates || []).includes(dateStr)
    || (availability.leaves || []).some((leave) => dateStr >= leave.from && dateStr <= leave.to);

  return (
    <>
      {ranges.map((range, index) => (
        <div
          key={`av-${index}`}
          aria-hidden="true"
          className="absolute inset-x-1 rounded-md bg-action/[0.06] ring-1 ring-inset ring-action/15"
          style={{ top: rangeToPx(range.start), height: rangeToHeight(range.start, range.end) }}
        />
      ))}
      {eRanges.map((range, index) => (
        <div
          key={`ec-${index}`}
          aria-hidden="true"
          className="absolute inset-x-1 rounded-md border border-dashed border-violet-300/60 bg-violet-50/40"
          style={{ top: rangeToPx(range.start), height: rangeToHeight(range.start, range.end) }}
        />
      ))}
      {isBlocked && (
        <div aria-hidden="true" className="absolute inset-x-1 top-0 bottom-0 rounded-md striped-block" />
      )}
    </>
  );
}

function rangeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours - DAY_START_HOUR) * 60 + minutes;
}

function rangeToPx(time) {
  return Math.max(0, (rangeToMinutes(time) / 60) * HOUR_HEIGHT);
}

function rangeToHeight(start, end) {
  return Math.max(12, ((rangeToMinutes(end) - rangeToMinutes(start)) / 60) * HOUR_HEIGHT);
}

function EventBlock({ appointment, patientName, compact, onClick }) {
  const { top, height } = hoursBetween(appointment.startsAt, appointment.durationMinutes);
  const typeLabel = APPOINTMENT_TYPES[appointment.type]?.label || appointment.type;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ top, height }}
      className={cn(
        'absolute inset-x-1 overflow-hidden rounded-lg border-l-4 px-2 py-1 text-left shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
        STATUS_BLOCK_STYLES[appointment.status],
      )}
    >
      <span className="block truncate text-[11px] font-extrabold leading-tight text-navy-800">
        {formatTime(appointment.startsAt)} · {patientName}
      </span>
      {!compact && height >= 48 && (
        <span className="block truncate text-[10px] font-semibold leading-tight text-slate-600">
          {typeLabel} · {appointment.durationMinutes} min
        </span>
      )}
      {height >= 72 && (
        <span className="mt-0.5 block truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {APPOINTMENT_STATUS[appointment.status]?.label}
        </span>
      )}
    </button>
  );
}

function HourGutter() {
  return (
    <div className="w-12 shrink-0" aria-hidden="true">
      {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, index) => (
        <div key={index} style={{ height: HOUR_HEIGHT }} className="relative">
          <span className="absolute -top-2 right-2 text-[10px] font-bold tabular-nums text-slate-400">
            {String(DAY_START_HOUR + index).padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </div>
  );
}

function TimelineLines() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, index) => (
        <div key={index} style={{ top: index * HOUR_HEIGHT }} className="absolute inset-x-0 border-t border-slate-100" />
      ))}
    </div>
  );
}

function DayTimeline({ date, items, availability, patientsMap, onSelect }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
        <p className="text-sm font-extrabold capitalize text-navy-800">{formatFullDate(date)}</p>
        <span className="text-xs font-semibold text-slate-400">{items.length} consulta(s)</span>
      </div>
      <div className="scroll-area max-h-[70vh] overflow-y-auto p-4">
        <div className="flex" style={{ minHeight: TIMELINE_HEIGHT }}>
          <HourGutter />
          <div className="relative flex-1 pl-2">
            <TimelineLines />
            <AvailabilityOverlay date={date} availability={availability} />
            {items.map((appointment) => (
              <EventBlock
                key={appointment.id}
                appointment={appointment}
                patientName={patientsMap[appointment.patientId] || 'Paciente'}
                onClick={() => onSelect(appointment.id)}
              />
            ))}
            {items.length === 0 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                <EmptyState icon={CalendarDays} title="Día libre" description="No tenés consultas agendadas para esta fecha." className="mx-auto max-w-sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekGrid({ days, appointmentsByDay, availability, patientsMap, onSelect, onDayClick }) {
  return (
    <div className="card overflow-hidden">
      <div className="scroll-area max-h-[74vh] overflow-y-auto">
        <div className="min-w-[820px]">
          <div className="sticky top-0 z-10 grid grid-cols-[48px_repeat(7,1fr)] border-b border-slate-100 bg-white/95 backdrop-blur">
            <span aria-hidden="true" />
            {days.map((day) => {
              const today = isSameDay(day, new Date());
              return (
                <button
                  key={toDateString(day)}
                  type="button"
                  onClick={() => onDayClick(day)}
                  className="border-l border-slate-100 px-2 py-2.5 text-center transition-colors hover:bg-blue-50 focus:outline-none"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(day).replace('.', '')}
                  </span>
                  <span className={cn('mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold', today ? 'bg-action text-white' : 'text-navy-800')}>
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[48px_repeat(7,1fr)]">
            <HourGutter />
            {days.map((day) => {
              const items = appointmentsByDay.get(toDateString(day)) || [];
              return (
                <div key={toDateString(day)} className="relative border-l border-slate-100" style={{ height: TIMELINE_HEIGHT }}>
                  <TimelineLines />
                  <AvailabilityOverlay date={day} availability={availability} />
                  {items.map((appointment) => (
                    <EventBlock
                      key={appointment.id}
                      appointment={appointment}
                      patientName={patientsMap[appointment.patientId] || 'Paciente'}
                      compact
                      onClick={() => onSelect(appointment.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthGrid({ anchor, selectedDate, onSelectDay, onSelectAppointment, appointmentsByDay, patientsMap }) {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(firstOfMonth);
  const weeks = Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => addDays(gridStart, weekIndex * 7 + dayIndex)),
  );

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((label) => (
          <span key={label} className="px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
        ))}
      </div>
      <div className="grid grid-rows-6">
        {weeks.map((week) => (
          <div key={toDateString(week[0])} className="grid grid-cols-7 divide-x divide-slate-100 border-b border-slate-100 last:border-b-0">
            {week.map((day) => {
              const outside = day.getMonth() !== anchor.getMonth();
              const items = appointmentsByDay.get(toDateString(day)) || [];
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              return (
                <div
                  key={toDateString(day)}
                  className={cn(
                    'group relative min-h-[104px] cursor-pointer p-1.5 transition-colors',
                    outside && 'bg-slate-50/60',
                    isSelected && 'bg-blue-50/60 ring-1 ring-inset ring-action/30',
                  )}
                  onClick={() => onSelectDay(day)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelectDay(day)}
                  aria-label={`Ver día ${day.getDate()}`}
                >
                  <span className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    isToday ? 'bg-action text-white' : outside ? 'text-slate-300' : 'text-navy-800',
                  )}>
                    {day.getDate()}
                  </span>
                  <ul className="mt-1 space-y-1">
                    {items.slice(0, 3).map((appointment) => (
                      <li key={appointment.id}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectAppointment(appointment.id);
                          }}
                          className={cn(
                            'w-full truncate rounded-md border-l-2 px-1.5 py-0.5 text-left text-[10px] font-bold transition-colors',
                            STATUS_BLOCK_STYLES[appointment.status],
                          )}
                        >
                          {formatTime(appointment.startsAt)} {patientsMap[appointment.patientId]?.split(' ')[0]}
                        </button>
                      </li>
                    ))}
                    {items.length > 3 && (
                      <li className="px-1 text-[10px] font-bold text-action">+{items.length - 3} más</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
