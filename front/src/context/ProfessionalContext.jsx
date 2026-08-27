import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { E_CONSULT_CONFIG } from '../data/availability';

const STORAGE_KEY = 'ey_pro_state_v1';

function readPersisted() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    return null;
  }
  return null;
}

const ProfessionalContext = createContext(null);

export function ProfessionalProvider({ children }) {
  const [availabilityStatus, setAvailabilityStatus] = useState('online');
  const [acceptsEConsults, setAcceptsEConsults] = useState(E_CONSULT_CONFIG.enabled);

  useEffect(() => {
    const persisted = readPersisted();
    if (!persisted) return;
    if (persisted.availabilityStatus) setAvailabilityStatus(persisted.availabilityStatus);
    if (typeof persisted.acceptsEConsults === 'boolean') setAcceptsEConsults(persisted.acceptsEConsults);
  }, []);

  const persist = useCallback((patch) => {
    try {
      const current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
    } catch {
      return;
    }
  }, []);

  const updateStatus = useCallback(
    (status) => {
      setAvailabilityStatus(status);
      persist({ availabilityStatus: status });
    },
    [persist],
  );

  const toggleEConsults = useCallback(
    (enabled) => {
      setAcceptsEConsults(enabled);
      persist({ acceptsEConsults: enabled });
    },
    [persist],
  );

  const value = useMemo(
    () => ({ availabilityStatus, updateStatus, acceptsEConsults, toggleEConsults }),
    [availabilityStatus, updateStatus, acceptsEConsults, toggleEConsults],
  );

  return <ProfessionalContext.Provider value={value}>{children}</ProfessionalContext.Provider>;
}

export function useProfessional() {
  const context = useContext(ProfessionalContext);
  if (!context) {
    throw new Error('useProfessional debe usarse dentro de <ProfessionalProvider>');
  }
  return context;
}
