import { useState, useRef, useEffect } from 'react';
import { Bot, Languages, Scale, SendHorizontal, UserRound, Mic, MicOff, Volume2, Loader2, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiError, legalApi } from '../services/api.js';

function formatInlineStyles(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-navy-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function RenderFormattedMessage({ text }) {
  if (!text) return null;

  const cleaned = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(?:b|strong|i|em|p|div|span|ul|ol|li|small)>/gi, '')
    .trim();

  const lines = cleaned.split('\n');

  return (
    <div className="space-y-2.5">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-0.5" />;
        }

        if (line === '---' || line === '___' || line === '***') {
          return <hr key={idx} className="my-3 border-slate-200 dark:border-slate-700" />;
        }

        if (line.startsWith('|') && line.endsWith('|')) {
          const cells = line
            .split('|')
            .map((c) => c.trim())
            .filter((c) => c.length > 0 && !c.match(/^[\-:]+$/));
          if (cells.length === 0) return null;
          if (cells.length === 1) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-legalGold font-bold">•</span>
                <span className="flex-1">{formatInlineStyles(cells[0])}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-legalGold font-bold">•</span>
              <span className="flex-1">
                <strong className="font-semibold text-navy-950 dark:text-white">{cells[0]}</strong>: {formatInlineStyles(cells.slice(1).join(' — '))}
              </span>
            </div>
          );
        }

        if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
          const content = line.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-legalGold font-bold select-none">•</span>
              <span className="flex-1">{formatInlineStyles(content)}</span>
            </div>
          );
        }

        const numberMatch = line.match(/^(\d+[\.\)]|\b(?:Step|Section|Point)\s+\d+[:\.]?)\s*(.*)$/i);
        if (numberMatch) {
          return (
            <div key={idx} className="mt-2 flex items-start gap-2 font-medium">
              <span className="font-bold text-legalGold select-none">{numberMatch[1]}</span>
              <span className="flex-1">{formatInlineStyles(numberMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {formatInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function AssistantChat() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const legalCategories = [
    { title: t('categories.familyLaw'), prompt: t('categories.familyLawPrompt'), examples: t('categories.familyLawEx') },
    { title: t('categories.property'), prompt: t('categories.propertyPrompt'), examples: t('categories.propertyEx') },
    { title: t('categories.labour'), prompt: t('categories.labourPrompt'), examples: t('categories.labourEx') },
    { title: t('categories.consumer'), prompt: t('categories.consumerPrompt'), examples: t('categories.consumerEx') },
    { title: t('categories.criminal'), prompt: t('categories.criminalPrompt'), examples: t('categories.criminalEx') },
    { title: t('categories.womenSafety'), prompt: t('categories.womenSafetyPrompt'), examples: t('categories.womenSafetyEx') },
  ];

  const [category, setCategory] = useState(t('categories.familyLaw'));
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: t('chat.greeting'),
      steps: [t('chat.step1'), t('chat.step2'), t('chat.step3')],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Audio Recording (Sarvam ASR) State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, transcribing]);

  const chooseCategory = (item) => {
    setCategory(item.title);
    setQuery(item.prompt);
    setError('');
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        clearInterval(recordingTimerRef.current);
        setRecordingSecs(0);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setTranscribing(true);
        try {
          const langCode = language === 'Kannada' || language === 'Kannada + English' ? 'kn-IN' : 'en-IN';
          const res = await legalApi.speechToText(audioBlob, langCode);
          if (res.transcript) {
            setQuery(res.transcript);
            // Auto submit speech query
            handleSendQuery(res.transcript);
          }
        } catch (err) {
          console.error('ASR error', err);
          setError('Speech recognition failed. Please try typing your message.');
        } finally {
          setTranscribing(false);
          // Stop media tracks
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSecs(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSecs((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied', err);
      setError('Microphone permission required for voice input.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const playTTS = async (text) => {
    try {
      const res = await legalApi.textToSpeech({ text, language });
      if (res.audio_base64) {
        const audio = new Audio('data:audio/wav;base64,' + res.audio_base64);
        audio.play();
      }
    } catch (err) {
      console.error('TTS playback error', err);
    }
  };

  const handleSendQuery = async (textToSend) => {
    const userText = textToSend || query;
    if (!userText.trim() || loading) return;
    setLoading(true);
    setError('');
    const newUserMsg = { role: 'user', text: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setQuery('');

    try {
      const history = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

      const result = await legalApi.askAssistant({ query: userText, language, history });
      const assistantMsg = {
        role: 'assistant',
        text: result.answer,
        provider: result.provider,
        model: result.model,
        category: result.category,
        urgency: result.urgency,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      // Auto-trigger TTS response
      playTTS(result.answer);
    } catch (apiError) {
      setError(getApiError(apiError));
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: t('chat.errorMsg') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    handleSendQuery();
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 shadow-xl">
      <div className="border-b border-white/10 bg-navy-900 p-5 text-white">
        <div className="grid gap-4 md:grid-cols-[1fr_190px]">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-legalGold text-navy-950 font-bold">
              <Bot className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-serif text-2xl font-bold">{t('chat.title')}</h3>
              <p className="mt-1 text-xs text-slate-300">{t('chat.subtitle')}</p>
            </div>
          </div>
          <label>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-white">
              <Languages className="h-4 w-4" aria-hidden="true" />
              {t('chat.language')}
            </span>
            <select
              className="mt-1.5 w-full rounded-xl border border-white/20 bg-navy-950 px-3 py-2 text-xs text-white"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="English">{t('chat.english')}</option>
              <option value="Kannada">{t('chat.kannada')}</option>
              <option value="Kannada + English">{t('chat.kannadaEnglish')}</option>
            </select>
          </label>
        </div>
      </div>
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-900/50 p-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">{t('chat.suggestedCategories')}</p>
          <div className="mt-3 grid gap-2">
            {legalCategories.map((item) => (
              <button
                className={`rounded-xl border px-3.5 py-3 text-left transition-all ${
                  category === item.title ? 'border-legalGold bg-white dark:bg-navy-900 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-navy-950/50 hover:border-legalGold'
                }`}
                key={item.title}
                onClick={() => chooseCategory(item)}
                type="button"
              >
                <span className="block text-xs font-bold text-navy-900 dark:text-white">{item.title}</span>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500 dark:text-slate-400">{item.examples}</span>
              </button>
            ))}
          </div>
        </aside>

        <div>
          <div className="max-h-[560px] min-h-[420px] space-y-4 overflow-y-auto bg-white dark:bg-navy-950 p-5">
            {messages.map((message, index) => (
              <article className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`} key={`${message.role}-${index}`}>
                {message.role === 'assistant' ? (
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-legalGold/10 text-legalGold border border-legalGold/30">
                    <Scale className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
                <div
                  className={`max-w-2xl rounded-2xl border p-4 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'border-navy-800 bg-navy-800 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {message.role === 'assistant' && message.urgency === 'high' && (
                    <a href="tel:112" className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-extrabold text-white hover:bg-red-700 transition-colors shadow">
                      <Phone className="h-3.5 w-3.5 animate-bounce" /> Emergency Support — Call 112
                    </a>
                  )}
                  <RenderFormattedMessage text={message.text} />
                  

                  {message.role === 'assistant' && message.provider && (
                    <p className="mt-2 text-[11px] text-slate-400">Router: {message.provider} ({message.model})</p>
                  )}
                  {message.steps ? (
                    <ul className="mt-3 grid gap-2 text-xs">
                      {message.steps.map((step) => (
                        <li className="border-l-2 border-legalGold pl-3" key={step}>{step}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {message.role === 'user' ? (
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-legalGold text-navy-950 font-bold">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </article>
            ))}
            {loading ? (
              <div className="flex items-center gap-2 rounded-xl bg-navy-50 dark:bg-navy-900 p-3 text-xs font-bold text-navy-900 dark:text-white">
                <Loader2 className="h-4 w-4 animate-spin text-legalGold" />
                <span>{t('chat.loading')}</span>
              </div>
            ) : null}
            {transcribing ? (
              <div className="flex items-center gap-2 rounded-xl bg-legalGold/10 p-3 text-xs font-bold text-legalGold">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isKn ? 'Sarvam AI ಧ್ವನಿಯನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸುತ್ತಿದೆ...' : 'Sarvam AI is transcribing your speech...'}</span>
              </div>
            ) : null}
            {error ? <p className="rounded-xl bg-red-50 dark:bg-red-900/30 p-3 text-xs font-semibold text-alertRed dark:text-red-400">{error}</p> : null}
            <div ref={messagesEndRef} />
          </div>

          <form className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900 p-4" onSubmit={submit}>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-navy-900 dark:text-white outline-none focus:border-legalGold"
                placeholder={isRecording ? (isKn ? 'ಮಾತನಾಡಿ, ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ...' : 'Speaking... (recording audio)') : t('chat.placeholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />


              <button className="premium-btn premium-btn-gold text-xs px-5 py-3 flex items-center gap-2 disabled:opacity-60" disabled={loading || transcribing} type="submit">
                <SendHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>{loading ? t('chat.asking') : t('chat.ask')}</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{t('disclaimer')}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
