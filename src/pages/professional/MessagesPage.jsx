import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Paperclip, Search, SendHorizontal, X } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { EmptyState, PageLoader, ErrorState } from '../../components/ui/Feedback';
import { messagesService, patientsService } from '../../services/mockApi';
import { chatTimestamp, formatTime, isSameDay } from '../../lib/format';
import { useRouter } from '../../router/Router';
import useMediaQuery from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';

const ATTACHMENT_PLACEHOLDER = '(Adjunté un archivo)';

function lastMessageAt(conversation) {
  const last = conversation.messages[conversation.messages.length - 1];
  return new Date(last?.sentAt || 0).getTime();
}

export default function MessagesPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { query } = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([messagesService.listConversations(), patientsService.list()])
      .then(([conversationList, patientList]) => {
        const sorted = [...conversationList].sort((a, b) => lastMessageAt(b) - lastMessageAt(a));
        setConversations(sorted);
        setPatientsMap(Object.fromEntries(patientList.map((patient) => [patient.id, patient])));
        const initial = query.get('c');
        if (initial && sorted.some((conversation) => conversation.id === initial)) {
          openConversation(initial, sorted);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openConversation = (id, source = conversations) => {
    setActiveId(id);
    setDraft('');
    setAttachment(null);
    messagesService.markRead(id);
    const base = source.length ? source : conversations;
    setConversations(base.map((conversation) => (conversation.id === id ? { ...conversation, unread: 0 } : conversation)));
  };

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || null;

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [activeId, activeConversation?.messages.length]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conversation) => {
      const patient = patientsMap[conversation.patientId];
      return `${patient?.firstName} ${patient?.lastName}`.toLowerCase().includes(term);
    });
  }, [conversations, search, patientsMap]);

  const handleSend = async () => {
    const text = draft.trim();
    if ((!text && !attachment) || !activeId || sending) return;
    setSending(true);
    const displayText = text || ATTACHMENT_PLACEHOLDER;
    const attachmentPayload = attachment ? { name: attachment.name } : null;
    setDraft('');
    setAttachment(null);

    await messagesService.send(activeId, displayText, attachmentPayload);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                { id: `local-${Date.now()}`, from: 'pro', text: displayText, sentAt: new Date().toISOString(), attachment: attachmentPayload },
              ],
            }
          : conversation,
      ),
    );
    setSending(false);

    const reply = await messagesService.receiveAutoReply(activeId);
    if (reply) {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === reply.conversationId
            ? { ...conversation, messages: [...conversation.messages, reply] }
            : conversation,
        ),
      );
    }
  };

  const handleAttach = (event) => {
    const [file] = event.target.files;
    if (file) setAttachment(file);
    event.target.value = '';
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState description="No pudimos cargar tus conversaciones." onRetry={load} />;

  const composerProps = {
    fileRef,
    draft,
    onDraftChange: setDraft,
    attachment,
    onAttach: handleAttach,
    onRemoveAttachment: () => setAttachment(null),
    onSend: handleSend,
    sending,
  };

  if (!isDesktop && activeConversation) {
    return (
      <div className="animate-fade-up fixed inset-0 z-[60] flex flex-col bg-white">
        <ChatHeader patient={patientsMap[activeConversation.patientId]} online={activeConversation.patientOnline} onBack={() => setActiveId(null)} showBack />
        <MessageBubbles messages={activeConversation.messages} scrollRef={scrollRef} />
        <Composer {...composerProps} />
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className="animate-fade-up space-y-4">
        <header>
          <h2 className="text-xl font-extrabold tracking-tight text-navy-800">Mensajes</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">Tus conversaciones con pacientes.</p>
        </header>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar conversación…"
            aria-label="Buscar conversación"
            className="form-input pl-10"
          />
        </div>
        <div className="card overflow-hidden">
          <ConversationList items={filtered} patientsMap={patientsMap} onSelect={(id) => openConversation(id)} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="card md:grid md:h-[calc(100vh-11rem)] md:grid-cols-[340px_1fr] md:overflow-hidden">
        <aside aria-label="Lista de conversaciones" className="flex min-h-0 flex-col border-b border-slate-100 md:border-b-0 md:border-r">
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-base font-extrabold text-navy-800">Mensajes</h2>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar…"
                aria-label="Buscar conversación"
                className="form-input py-2 pl-10 text-sm"
              />
            </div>
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <ConversationList items={filtered} patientsMap={patientsMap} activeId={activeId} onSelect={(id) => openConversation(id)} />
          </div>
        </aside>

        <section aria-label="Conversación" className="flex min-w-0 flex-col md:min-h-0">
          {activeConversation ? (
            <>
              <ChatHeader patient={patientsMap[activeConversation.patientId]} online={activeConversation.patientOnline} />
              <MessageBubbles messages={activeConversation.messages} scrollRef={scrollRef} />
              <Composer {...composerProps} />
            </>
          ) : (
            <EmptyState
              icon={SendHorizontal}
              title="Elegí una conversación"
              description="Seleccioná un paciente de la lista para ver el historial y enviarle mensajes."
              className="m-6 flex-1"
            />
          )}
        </section>
      </div>
    </div>
  );
}

function ConversationList({ items, patientsMap, activeId, onSelect }) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm font-medium text-slate-400">
        No encontramos conversaciones con ese nombre.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((conversation) => {
        const patient = patientsMap[conversation.patientId];
        const last = conversation.messages[conversation.messages.length - 1];
        const name = patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente';
        const unread = typeof conversation.unread === 'number' ? conversation.unread : conversation.unread ? 1 : 0;
        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              aria-current={activeId === conversation.id ? 'true' : undefined}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action',
                activeId === conversation.id ? 'bg-blue-50/70' : 'hover:bg-slate-50',
              )}
            >
              <Avatar name={name} size="md" onlineStatus={conversation.patientOnline ? 'online' : 'offline'} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-navy-800">{name}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-400">{last ? chatTimestamp(last.sentAt) : ''}</span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className={cn('truncate text-xs', unread > 0 ? 'font-bold text-navy-800' : 'font-medium text-slate-500')}>
                    {last?.from === 'pro' ? 'Vos: ' : ''}
                    {last?.text || 'Sin mensajes'}
                  </span>
                  {unread > 0 && (
                    <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-action px-1.5 text-[10px] font-extrabold text-white">
                      {unread}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ChatHeader({ patient, online, onBack, showBack }) {
  const name = patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente';
  return (
    <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
      {showBack && (
        <button type="button" onClick={onBack} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100" aria-label="Volver a conversaciones">
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <Avatar name={name} size="sm" onlineStatus={online ? 'online' : 'offline'} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-navy-800">{name}</p>
        <p className={cn('text-xs font-medium', online ? 'text-emerald-600' : 'text-slate-400')}>
          {online ? 'En línea' : 'Desconectado'}
        </p>
      </div>
    </header>
  );
}

function MessageBubbles({ messages, scrollRef }) {
  return (
    <div ref={scrollRef} className="scroll-area flex-1 space-y-1 overflow-y-auto px-4 py-4" role="log" aria-label="Historial de mensajes">
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const showDay = !previous || !isSameDay(previous.sentAt, message.sentAt);
        const mine = message.from === 'pro';
        const isPlaceholder = message.text === ATTACHMENT_PLACEHOLDER;
        return (
          <div key={message.id}>
            {showDay && (
              <p className="my-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {isSameDay(message.sentAt, new Date()) ? 'Hoy' : chatTimestamp(message.sentAt)}
              </p>
            )}
            <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[78%]', mine && 'items-end')}>
                {message.attachment && (
                  <div
                    className={cn(
                      'mb-1 inline-flex max-w-full items-center gap-2 rounded-xl px-3.5 py-2',
                      mine ? 'bg-action/90 text-white' : 'bg-slate-200 text-navy-800',
                    )}
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate text-xs font-bold">{message.attachment.name}</span>
                  </div>
                )}
                {!isPlaceholder && (
                  <div
                    className={cn(
                      'w-fit max-w-full whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm',
                      mine ? 'rounded-br-md bg-action text-white' : 'rounded-bl-md bg-slate-100 text-navy-800',
                    )}
                  >
                    {message.text}
                  </div>
                )}
                <p className={cn('mt-1 pb-1 text-[10px] font-semibold text-slate-400', mine ? 'text-right' : 'text-left')}>
                  {formatTime(message.sentAt)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Composer({ fileRef, draft, onDraftChange, attachment, onAttach, onRemoveAttachment, onSend, sending }) {
  const canSend = !sending && (Boolean(draft.trim()) || Boolean(attachment));

  return (
    <footer className="border-t border-slate-100 p-3">
      {attachment && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-action ring-1 ring-blue-100">
          <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="max-w-[180px] truncate">{attachment.name}</span>
          <button type="button" onClick={onRemoveAttachment} className="rounded-full p-0.5 transition-colors hover:bg-blue-100" aria-label={`Quitar adjunto ${attachment.name}`}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
        className="flex items-end gap-2"
      >
        <input ref={fileRef} type="file" className="hidden" onChange={onAttach} tabIndex={-1} aria-hidden="true" />
        <button type="button" onClick={() => fileRef.current?.click()} className="toolbar-btn shrink-0" aria-label="Adjuntar archivo">
          <Paperclip className="h-4 w-4" />
        </button>
        <textarea
          rows={1}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="Escribí un mensaje..."
          aria-label="Escribí un mensaje"
          className="form-input max-h-32 min-h-[42px] resize-none py-2.5"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="btn-primary shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Enviar mensaje"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </footer>
  );
}
