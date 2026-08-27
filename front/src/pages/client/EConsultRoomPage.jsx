import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Mic, MicOff, Paperclip, SendHorizontal, Video, VideoOff } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Link, useRouter } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { catalogService, clientMessagesService } from '../../services/clientApi';
import { useToast } from '../../context/ToastContext';
import useProfessionalLookup from './useProfessionalLookup';
import { formatTime } from '../../lib/format';
import { cn } from '../../lib/utils';

export default function EConsultRoomPage({ professionalId }) {
  const toast = useToast();
  const { navigate } = useRouter();
  const professionals = useProfessionalLookup();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [professional, setProfessional] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [endingOpen, setEndingOpen] = useState(false);
  const scrollRef = useRef(null);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([catalogService.getProfessional(professionalId), clientMessagesService.listConversations()])
      .then(([professionalData, conversations]) => {
        if (!professionalData.acceptsOnline) throw new Error('Sin e-consulta');
        setProfessional(professionalData);
        const conversation = conversations.find((item) => item.professionalId === professionalId) || null;
        if (conversation) {
          setConversationId(conversation.id);
          setMessages(conversation.messages);
          clientMessagesService.markRead(conversation.id);
        }
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, [professionalId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !conversationId) return;
    setDraft('');
    await clientMessagesService.send(conversationId, text);
    setMessages((current) => [...current, { id: `local-${Date.now()}`, from: 'me', text, sentAt: new Date().toISOString(), attachment: null }]);
    const reply = await clientMessagesService.receiveAutoReply(conversationId);
    if (reply) {
      setMessages((current) => [...current, reply]);
    }
  };

  const patientBasics = useMemo(
    () => [
      ['Nombre', 'María López'],
      ['DNI', '12.789.456'],
      ['Cobertura', 'OSDE 210'],
      ['Teléfono', '+54 9 11 6325-8847'],
    ],
    [],
  );

  if (loading && !error) return <PageLoader />;
  if (error || !professional) return <ErrorState description="No pudimos iniciar la consulta online." onRetry={load} />;

  const fullName = `${professional.firstName} ${professional.lastName}`;

  const handleEnd = () => {
    setEndingOpen(false);
    toast.success('La e-consulta fue finalizada. El resumen queda disponible en tu historial.');
    navigate('/cliente/historial');
  };

  return (
    <div className="animate-fade-up space-y-4">
      <Link to="/cliente/e-consultas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-action">
        <ArrowLeft className="h-4 w-4" /> E-consultas
      </Link>

      <header className="card flex flex-wrap items-center gap-3 p-4">
        <Avatar name={fullName} size="lg" onlineStatus="online" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-extrabold text-navy-800">{fullName}</h2>
            <Badge variant="success" dot>En línea</Badge>
          </div>
          <p className="text-xs font-semibold text-slate-500">{professional.headline}</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button type="button" onClick={() => setEndingOpen(true)} className="btn-primary flex-1 py-2.5 text-xs">Finalizar consulta</button>
          <Link to="/cliente/mensajes" className="btn-secondary flex-1 justify-center py-2.5 text-xs">Enviar mensaje</Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section aria-label="Videollamada" className="card relative overflow-hidden bg-navy-900 p-6">
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-center sm:min-h-[340px]">
              <Avatar name={fullName} size="xl" />
              <p className="mt-3 text-base font-extrabold text-white">{fullName}</p>
              <p className="text-xs font-semibold text-blue-300">{professional.headline}</p>
              {!camOn && (
                <span className="mt-4 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-slate-300">
                  Tu cámara está apagada — la videollamada se activará al iniciar la integración
                </span>
              )}
              <p className="mt-3 max-w-xs text-[11px] font-medium leading-relaxed text-slate-400">
                Interfaz preparada para integrar el proveedor de video. El chat ya funciona.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setMicOn((current) => !current)}
                aria-pressed={!micOn}
                aria-label={micOn ? 'Silenciar micrófono' : 'Activar micrófono'}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
                  micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/80 text-white hover:bg-red-500',
                )}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => setCamOn((current) => !current)}
                aria-pressed={!camOn}
                aria-label={camOn ? 'Apagar cámara' : 'Encender cámara'}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
                  camOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/80 text-white hover:bg-red-500',
                )}
              >
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            </div>
          </section>

          <section aria-label="Chat de la consulta" className="card flex flex-col overflow-hidden">
            <header className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-extrabold text-navy-800">Chat de la consulta</h3>
            </header>
            {messages.length === 0 ? (
              <EmptyState
                icon={SendHorizontal}
                title="Todavía no hay mensajes"
                description={`Escribile a ${professional.firstName} para arrancar la e-consulta.`}
                className="m-4 border-none bg-transparent"
              />
            ) : (
              <div ref={scrollRef} className="scroll-area max-h-72 flex-1 space-y-1 overflow-y-auto px-4 py-4" role="log" aria-label="Mensajes de la e-consulta">
                {messages.map((message) => (
                  <div key={message.id} className="contents">
                    <div className={cn('flex', message.from === 'me' ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'w-fit max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm',
                          message.from === 'me' ? 'rounded-br-md bg-action text-white' : 'rounded-bl-md bg-slate-100 text-navy-800',
                        )}
                      >
                        {message.text}
                      </div>
                    </div>
                    <p className={cn('pb-1 text-[10px] font-semibold text-slate-400', message.from === 'me' ? 'text-right' : 'text-left')}>
                      {formatTime(message.sentAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2 border-t border-slate-100 p-3"
            >
              <textarea
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribí un mensaje..."
                aria-label="Escribí un mensaje"
                className="form-input max-h-32 min-h-[42px] resize-none py-2.5"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="btn-primary shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Enviar mensaje"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section aria-labelledby="datos-paciente-title" className="card p-5">
            <h3 id="datos-paciente-title" className="text-sm font-extrabold text-navy-800">Tus datos para esta consulta</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              {patientBasics.map(([term, value]) => (
                <div key={term} className="flex items-center justify-between gap-3">
                  <dt className="font-semibold text-slate-500">{term}</dt>
                  <dd className="truncate font-bold text-navy-800">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-action">
              Solo {professional.firstName} ve estos datos durante la consulta.
            </p>
          </section>

          <section className="card p-5">
            <h3 className="text-sm font-extrabold text-navy-800">Cómo funciona</h3>
            <ol className="mt-2.5 list-decimal space-y-1.5 pl-4 text-xs font-medium leading-relaxed text-slate-500">
              <li>Escribí tu consulta en el chat.</li>
              <li>El profesional te responde en el momento.</li>
              <li>Al finalizar, el resumen queda en tu historial.</li>
            </ol>
            <Paperclip className="mt-3 h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
            <p className="text-[11px] font-medium text-slate-400">Podrás adjuntar estudios cuando se active la integración de archivos.</p>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={endingOpen}
        onClose={() => setEndingOpen(false)}
        onConfirm={handleEnd}
        title="Finalizar consulta"
        message="¿Querés finalizar esta e-consulta? Vas a poder verla en tu historial."
        confirmLabel="Sí, finalizar"
        cancelLabel="Seguir en la consulta"
        destructive={false}
      />
    </div>
  );
}
