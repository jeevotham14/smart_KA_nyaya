import { useState } from 'react';
import { Bot, Languages, Scale, SendHorizontal, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getApiError, legalApi } from '../services/api.js';



export default function AssistantChat() {
  const { t } = useTranslation();
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

  const chooseCategory = (item) => {
    setCategory(item.title);
    setQuery(item.prompt);
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!query.trim() || loading) return;
    const userText = query;
    setLoading(true);
    setError('');
    setMessages((current) => [...current, { role: 'user', text: userText }]);
    try {
      const result = await legalApi.askAssistant({ query: userText, language, category });
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: result.answer,
          steps: result.steps,
        },
      ]);
      setQuery('');
    } catch (apiError) {
      setError(getApiError(apiError));
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: t('chat.errorMsg'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-navy-900 p-5 text-white">
        <div className="grid gap-4 md:grid-cols-[1fr_190px]">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-legalGold text-navy-900">
              <Bot className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-serif text-2xl font-bold">{t('chat.title')}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-200">{t('chat.subtitle')}</p>
            </div>
          </div>
          <label>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <Languages className="h-4 w-4" aria-hidden="true" />
              {t('chat.language')}
            </span>
            <select
              className="mt-2 w-full rounded-sm border border-white/20 bg-white px-3 py-2 text-sm text-navy-900"
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
        <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
          <p className="text-sm font-bold text-navy-900">{t('chat.suggestedCategories')}</p>
          <div className="mt-3 grid gap-2">
            {legalCategories.map((item) => (
              <button
                className={`rounded-sm border px-3 py-3 text-left transition ${
                  category === item.title ? 'border-legalGold bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-legalGold'
                }`}
                key={item.title}
                onClick={() => chooseCategory(item)}
                type="button"
              >
                <span className="block text-sm font-bold text-navy-900">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{item.examples}</span>
              </button>
            ))}
          </div>
        </aside>
        <div>
          <div className="max-h-[560px] min-h-[420px] space-y-4 overflow-y-auto bg-white p-5">
            {messages.map((message, index) => (
              <article className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`} key={`${message.role}-${index}`}>
                {message.role === 'assistant' ? (
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-navy-50 text-navy-800">
                    <Scale className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
                <div
                  className={`max-w-2xl rounded-md border p-4 text-sm leading-6 ${
                    message.role === 'user' ? 'border-navy-800 bg-navy-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <p>{message.text}</p>
                  {message.steps ? (
                    <ul className="mt-3 grid gap-2">
                      {message.steps.map((step) => (
                        <li className="border-l-2 border-legalGold pl-3" key={step}>{step}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {message.role === 'user' ? (
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-legalGold text-navy-900">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </article>
            ))}
            {loading ? <p className="rounded-sm bg-navy-50 p-3 text-sm font-semibold text-navy-900">{t('chat.loading')}</p> : null}
            {error ? <p className="rounded-sm bg-red-50 p-3 text-sm font-semibold text-alertRed">{error}</p> : null}
          </div>
          <form className="border-t border-slate-200 bg-slate-50 p-4" onSubmit={submit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="min-h-12 flex-1 rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20"
                placeholder={t('chat.placeholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-sm bg-navy-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={loading} type="submit">
                <SendHorizontal className="h-4 w-4" aria-hidden="true" />
                {loading ? t('chat.asking') : t('chat.ask')}
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{t('disclaimer')}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
