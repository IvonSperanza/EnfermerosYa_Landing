import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Paperclip, Search, SendHorizontal } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { Link } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { clientMessagesService } from '../../services/clientApi';
import useMediaQuery from '../../hooks/useMediaQuery';
import useProfessionalLookup from './useProfessionalLookup';
import { chatTimestamp, formatTime, isSameDay } from '../../lib/format';
import { cn } from '../../lib/utils';

export default function ClientMessagesPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const professionals = useProfessionalLookup();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);

  const load = () => {
    setLoading(true);
    setError(false);
    clientMessagesService
      .listConversations()
      .then((items) => {
        const sorted = [...items].sort(
          (a, b) =>
            new Date(b.messages[b.messages.length - 1]?.sentAt || 0) -
            new Date(a.messages[a.messages.length - 1]?.sentAt || 0),
        );
        setConversations(sorted);
        if (sorted.length > 0 && window.innerWidth >= 768) {
          openConversation(sorted[0].id, sorted, true);
        }
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const openConversation = (id, source = conversations) => {
    setActiveId(id);
    setDraft('');
    clientMessagesService.markRead(id);
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
      const professional = professionals[conversation.professionalId];
      return professional && `${professional.firstName} ${professional.lastName}`.toLowerCase().includes(term);
    });
  }, [conversations, search, professionals]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    setDraft('');
    await clientMessagesService.send(activeId, text);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeId
          ? { ...conversation, messages: [...conversation.messages, { id: `local-${Date.now()}`, from: 'me', text, sentAt: new Date().toISOString(), attachment: null }] }
          : conversation,
      ),
    );
    setSending(false);
    const reply = await clientMessagesService.receiveAutoReply(activeId);
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

  if (loading && !error) return <PageLoader />;
  if (error) return <ErrorState description="No pudimos cargar tus conversaciones." onRetry={load} />;

  if (!isDesktop && activeConversation) {
    return (
      <div className="animate-fade-up fixed inset-0 z-[60] flex flex-col bg-white">
        <ChatHeader professional={professionals[activeConversation.professionalId]} online={activeConversation.professionalOnline} onBack={() => setActiveId(null)} showBack />
        <MessageBubbles messages={activeConversation.messages} scrollRef={scrollRef} />
        <Composer draft={draft} onDraftChange={setDraft} onSend={handleSend} sending={sending} />
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className="animate-fade-up space-y-4">
        <header>
          <h2 className="text-xl font-extrabold tracking-tight text-navy-800">Mensajes</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">Tus conversaciones con profesionales.</p>
        </header>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar conversación…" aria-label="Buscar conversación" className="form-input pl-10" />
        </div>
        <div className="card overflow-hidden">
          <ConversationList items={filtered} professionals={professionals} onSelect={(id) => openConversation(id)} />
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
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar…" aria-label="Buscar conversación" className="form-input py-2 pl-10 text-sm" />
            </div>
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <ConversationList items={filtered} professionals={professionals} activeId={activeId} onSelect={(id) => openConversation(id)} />
          </div>
        </aside>

        <section aria-label="Conversación" className="flex min-w-0 flex-col md:min-h-0">
          {activeConversation ? (
            <>
              <ChatHeader professional={professionals[activeConversation.professionalId]} online={activeConversation.professionalOnline} />
              <MessageBubbles messages={activeConversation.messages} scrollRef={scrollRef} />
              <Composer draft={draft} onDraftChange={setDraft} onSend={handleSend} sending={sending} />
            </>
          ) : (
            <EmptyState
              icon={SendHorizontal}
              title="Elegí una conversación"
              description="Seleccioná un profesional de la lista para ver el historial y escribirle."
              className="m-6 flex-1"
            />
          )}
        </section>
      </div>
    </div>
  );
}

function ConversationList({ items, professionals, activeId, onSelect }) {
  if (items.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Sin conversaciones"
          description="Cuando escribas a un profesional o reserves una consulta, la conversación aparece acá."
          action={<Link to="/cliente/profesionales" className="btn-primary py-2.5 text-xs">Buscar profesional</Link>}
        />
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((conversation) => {
        const professional = professionals[conversation.professionalId];
        const last = conversation.messages[conversation.messages.length - 1];
        const name = professional ? `${professional.firstName} ${professional.lastName}` : 'Profesional';
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
              <Avatar name={name} size="md" onlineStatus={conversation.professionalOnline ? 'online' : 'offline'} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-navy-800">{name}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-400">{last ? chatTimestamp(last.sentAt) : ''}</span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className={cn('truncate text-xs', unread > 0 ? 'font-bold text-navy-800' : 'font-medium text-slate-500')}>
                    {last?.from === 'me' ? 'Vos: ' : ''}
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

function ChatHeader({ professional, online, onBack, showBack }) {
  const name = professional ? `${professional.firstName} ${professional.lastName}` : 'Profesional';
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
        <p className="text-xs font-semibold text-slate-500">{professional?.headline}</p>
        <p className={cn('text-[11px] font-bold', online ? 'text-emerald-600' : 'text-slate-400')}>{online ? 'En línea' : 'Desconectado'}</p>
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
        const mine = message.from === 'me';
        return (
          <div key={message.id}>
            {showDay && (
              <p className="my-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {isSameDay(message.sentAt, new Date()) ? 'Hoy' : chatTimestamp(message.sentAt)}
              </p>
            )}
            <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className="max-w-[78%]">
                <div
                  className={cn(
                    'w-fit max-w-full whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm',
                    mine ? 'rounded-br-md bg-action text-white' : 'rounded-bl-md bg-slate-100 text-navy-800',
                  )}
                >
                  {message.text}
                </div>
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

function Composer({ draft, onDraftChange, onSend, sending }) {
  const canSend = !sending && Boolean(draft.trim());
  return (
    <footer className="border-t border-slate-100 p-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
        className="flex items-end gap-2"
      >
        <button type="button" onClick={() => onDraftChange(`${draft}${draft ? '\n' : ''}(Adjunto un archivo)`)} className="toolbar-btn shrink-0" aria-label="Adjuntar archivo">
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
        <button type="submit" disabled={!canSend} className="btn-primary shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Enviar mensaje">
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </footer>
  );
}
