import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, CheckCircle2, Send } from 'lucide-react';
import { CHAT_SCRIPT } from '../data/content';
import { cn } from '../lib/utils';

function TypingBubble() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm" aria-label="Escribiendo…">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function ChatMockup() {
  const [visibleCount, setVisibleCount] = useState(1);
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    let timerId;

    if (typing) {
      timerId = setTimeout(() => {
        setTyping(false);
        setVisibleCount((value) => (value >= CHAT_SCRIPT.length ? value : value + 1));
      }, 1300);
    } else if (visibleCount >= CHAT_SCRIPT.length) {
      timerId = setTimeout(() => {
        setVisibleCount(1);
        setTyping(true);
      }, 4000);
    } else {
      timerId = setTimeout(() => setTyping(true), 1700);
    }

    return () => clearTimeout(timerId);
  }, [typing, visibleCount]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleCount, typing]);

  const visibleMessages = CHAT_SCRIPT.slice(0, visibleCount);

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-action/40 via-blue-400/20 to-emerald-400/30 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white shadow-float">
        <div className="flex items-center gap-3 bg-navy-800 px-5 py-4">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-action to-blue-400 text-sm font-bold text-white">
            LG
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy-800 bg-emerald-500" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-sm font-bold text-white">
              Lic. Laura Gómez
              <BadgeCheck className="h-4 w-4 shrink-0 text-sky-300" />
            </p>
            <p className="text-xs font-medium text-blue-200">En línea · responde al instante</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            E-consulta
          </span>
        </div>

        <div ref={bodyRef} className="h-72 space-y-3 overflow-y-auto bg-slate-100 p-4">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hoy · Consulta segura y privada
          </p>
          {visibleMessages.map((message, index) => (
            <div
              key={`${visibleCount}-${index}`}
              className={cn(
                'animate-fade-up max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                message.from === 'user'
                  ? 'ml-auto rounded-br-md bg-action text-white'
                  : 'rounded-bl-md bg-white text-navy-800'
              )}
            >
              {message.text}
            </div>
          ))}
          {typing ? <TypingBubble /> : null}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-3">
          <input
            type="text"
            placeholder="Escribí tu mensaje…"
            readOnly
            onFocus={(event) => event.target.blur()}
            className="w-full cursor-default rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-500 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action text-white"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EConsultBanner() {
  return (
    <section id="econsultas" className="relative overflow-hidden bg-navy-800 py-16 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-action/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-2">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100">
            E-consultas 24hs
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Consultá con un profesional sin salir de casa.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-blue-100/90 sm:text-lg">
            Chateá con enfermeros y profesionales de la salud matriculados cuando lo necesites:
            despejá dudas, recibí indicaciones y hacé seguimiento de tu tratamiento.
          </p>

          <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
            {['Disponible las 24hs', 'Profesionales matriculados', 'Seguimiento por chat', 'Atención personalizada'].map(
              (benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm font-semibold text-white">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  {benefit}
                </li>
              )
            )}
          </ul>

          <button type="button" className="btn-primary mt-9 bg-white px-7 text-action hover:bg-blue-50 focus-visible:ring-offset-navy-800">
            Solicitar e-consulta
          </button>
        </div>

        <ChatMockup />
      </div>
    </section>
  );
}
