import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { messagesApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';
import { timeAgo } from '../../utils';

interface MessageThreadProps {
  applicationId: string;
  /** Display name of the other party ("Milan Markovits" / "Dr. Ada Prof") */
  otherName: string;
}

/**
 * Private per-application conversation between the professor and the applicant.
 * Polls every 15s — good enough for an application back-and-forth without websockets.
 */
export default function MessageThread({ applicationId, otherName }: MessageThreadProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', applicationId],
    queryFn: () => messagesApi.list(applicationId),
    refetchInterval: 15000,
  });

  // Scroll to the newest message when one arrives
  useEffect(() => {
    if (messages.length !== lastCount.current) {
      lastCount.current = messages.length;
      bottomRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => messagesApi.send(applicationId, body),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: ['messages', applicationId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Message failed to send'),
  });

  const send = () => {
    const body = draft.trim();
    if (body && !sendMutation.isPending) sendMutation.mutate(body);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-8 w-8 rounded-lg bg-primary-50 ring-1 ring-primary-600/10 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight">Messages</h3>
          <p className="text-xs text-gray-500">Private conversation with {otherName}</p>
        </div>
      </div>

      <div className="mt-4 max-h-80 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="py-6 flex justify-center"><Spinner className="h-5 w-5" /></div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No messages yet — start the conversation. Everything stays on Labyro.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  mine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-line leading-relaxed break-words">{m.body}</p>
                  <p className={`text-[11px] mt-1 ${mine ? 'text-primary-100/80' : 'text-gray-400'}`}>
                    {mine ? 'You' : otherName} · {timeAgo(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          className="input resize-none flex-1"
          placeholder={`Message ${otherName}…`}
          aria-label={`Message ${otherName}`}
        />
        <button
          onClick={send}
          disabled={!draft.trim() || sendMutation.isPending}
          className="btn-primary shrink-0 gap-1.5"
          aria-label="Send message"
        >
          {sendMutation.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">Enter to send · Shift+Enter for a new line</p>
    </div>
  );
}
