import { useState, useEffect } from 'react';

export function useDraftManager(storageKey, defaultDraft) {
  const [draft, setDraft] = useState(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : defaultDraft;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return defaultDraft;
    }
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // If the default draft changes, update the draft if it's the default
    // We avoid resetting custom edits by checking if it still equals the previous default
    // But since this can be tricky, we'll expose a clear setDraft method.
  }, [defaultDraft]);

  const saveDraft = (newDraft) => {
    try {
      const draftToSave = newDraft || draft;
      setDraft(draftToSave);
      window.localStorage.setItem(storageKey, JSON.stringify(draftToSave));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  };

  return { draft, setDraft, saveDraft, saved };
}

// Optionally, a wrapper component
export default function DraftManager({ children, storageKey, defaultDraft }) {
  const draftState = useDraftManager(storageKey, defaultDraft);
  return children(draftState);
}
