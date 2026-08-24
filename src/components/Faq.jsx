import { useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { FAQS } from '../data/content';
import { cn } from '../lib/utils';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => setOpenIndex((current) => (current === index ? null : index));

  return (
    <section id="faq" className="container-page py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="section-title">Preguntas frecuentes</h2>
          <p className="section-subtitle">
            Todo lo que necesitás saber antes de tu primer turno. Si no encontrás tu respuesta,
            nuestro equipo está disponible para ayudarte.
          </p>

          <a
            href="#econsultas"
            className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-navy-800 transition-colors hover:border-action hover:text-action"
          >
            <MessageCircle className="h-4 w-4 text-action" />
            Contactar a soporte
          </a>
        </div>

        <div className="flex flex-col gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={cn(
                  'rounded-2xl border bg-white transition-colors',
                  isOpen ? 'border-action/40 shadow-card' : 'border-slate-200'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-bold text-navy-800">{faq.question}</span>
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300',
                      isOpen
                        ? 'rotate-45 border-action bg-action text-white'
                        : 'border-slate-300 text-slate-500'
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>

                <div
                  id={`faq-panel-${index}`}
                  className={cn(
                    'grid transition-all duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-relaxed text-slate-500">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
