import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferencesState {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing?: boolean;
  updatedAt?: string;
}

const PREFS_KEY = 'lgpd_cookie_preferences';
const DRAFT_PREFIXES = ['mh_draft_', 'mh_form_state_'];

/**
 * Remove imediatamente todos os rascunhos de formulários armazenados
 * em localStorage e sessionStorage.
 */
export function purgeFunctionalDrafts(): void {
  if (typeof window === 'undefined') return;

  const cleanStorage = (storage: Storage) => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && DRAFT_PREFIXES.some((prefix) => key.startsWith(prefix))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => storage.removeItem(key));
    } catch {
      // Ignora erros de acesso ao storage em ambientes restritos
    }
  };

  cleanStorage(window.localStorage);
  cleanStorage(window.sessionStorage);
}

/**
 * Lê de forma síncrona se o consentimento funcional está ativo em `lgpd_cookie_preferences`.
 */
export function readFunctionalConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<CookiePreferencesState>;
    return Boolean(parsed.functional);
  } catch {
    return false;
  }
}

/**
 * Hook único que monitora `lgpd_cookie_preferences` e garante que rascunhos
 * só sejam gravados com consentimento funcional ativo — e apagados na revogação.
 */
export function useFunctionalConsent() {
  const [hasFunctionalConsent, setHasFunctionalConsent] = useState<boolean>(() =>
    readFunctionalConsent()
  );

  const syncConsent = useCallback(() => {
    const active = readFunctionalConsent();
    setHasFunctionalConsent(active);
    if (!active) {
      purgeFunctionalDrafts();
    }
  }, []);

  useEffect(() => {
    syncConsent();

    const handleCustomEvent = (event: Event) => {
      const detail = (event as CustomEvent<CookiePreferencesState | undefined>).detail;
      if (detail && typeof detail.functional === 'boolean') {
        setHasFunctionalConsent(detail.functional);
        if (!detail.functional) {
          purgeFunctionalDrafts();
        }
      } else {
        syncConsent();
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === PREFS_KEY || event.key === null) {
        syncConsent();
      }
    };

    window.addEventListener('cookie-preferences-updated', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('cookie-preferences-updated', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [syncConsent]);

  return {
    hasFunctionalConsent,
    purgeFunctionalDrafts,
  };
}
