import React, { useEffect, useRef, useState } from 'react';
import { Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';

interface ProjectAssistantProps {
  context: {
    activeSection: string;
    studentCount: number;
    courseCatalog: { title: string; semesterFee: number }[];
    averageAttendance: number;
    outstandingBalanceINR: number;
  };
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  'What can I do in the Courses module?',
  'How are semester fees shown?',
  'What does the attendance dashboard track?'
];

export const ProjectAssistant: React.FC<ProjectAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Vanakkam! I can help with this ERP dashboard, its modules, demo data, and INR course fees. What would you like to know?'
    }
  ]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isOpen, isLoading, messages]);

  const sendMessage = async (messageText: string) => {
    const content = messageText.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setDraft('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/project-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.slice(-10).map(({ role, content: message }) => ({ role, content: message })),
          context
        })
      });
      const result = await response.json() as { reply?: string; error?: string };
      if (!response.ok) {
        throw new Error(result.error || 'The assistant could not answer. Please try again.');
      }
      if (typeof result.reply !== 'string' || !result.reply.trim()) {
        throw new Error('The assistant returned an empty reply. Please try again.');
      }

      setMessages(current => [...current, {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.reply!.trim()
      }]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reach the project assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="no-print fixed bottom-20 right-4 sm:right-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <section
          aria-label="ERP project assistant"
          className="assistant-panel-enter flex h-[min(620px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-slate-950 px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">KRCE ERP Assistant</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Project help · INR · Tamil Nadu
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-slate-900 text-white'
                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="space-y-2 pt-1">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Suggested questions
                  </p>
                  {suggestedQuestions.map(question => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void sendMessage(question)}
                      disabled={isLoading}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:border-cyan-300 hover:bg-cyan-50 hover:text-slate-900 disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-500">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin text-cyan-600" />
                    Checking the project details…
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {errorMessage && (
              <div role="alert" className="mx-3 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={event => {
                event.preventDefault();
                void sendMessage(draft);
              }}
              className="border-t border-slate-200 bg-white p-3"
            >
              <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
                <textarea
                  value={draft}
                  onChange={event => setDraft(event.target.value.slice(0, 1500))}
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(draft);
                    }
                  }}
                  placeholder="Ask about this ERP project…"
                  aria-label="Message the ERP assistant"
                  rows={1}
                  maxLength={1500}
                  className="max-h-24 min-h-9 flex-1 resize-y bg-transparent px-1 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isLoading}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 px-1 text-[10px] leading-relaxed text-slate-400">
                Chat text and an anonymous project summary go to OpenRouter. Don’t include student personal details or credentials.
              </p>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close ERP project assistant' : 'Open ERP project assistant'}
        className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {isOpen ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4 text-cyan-300" />}
        <span>{isOpen ? 'Close assistant' : 'Ask ERP AI'}</span>
        {!isOpen && <Sparkles className="h-3.5 w-3.5 text-amber-300 transition-transform group-hover:rotate-12" />}
      </button>
    </div>
  );
};
