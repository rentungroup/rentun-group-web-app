import { createContext, useContext, useState, useEffect } from 'react';
import { fetchConfig, DEFAULTS } from '../utils/db';

const ConfigContext = createContext(null);
const CACHE_KEY = 'rentun_cached_config_v1';

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULTS, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Error reading cached config:", e);
    }
    return DEFAULTS;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    try {
      setIsSyncing(true);
      const data = await fetchConfig();
      if (data) {
        setConfig(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {}
      }
      return data;
    } catch (err) {
      console.error("Error fetching config:", err);
      setError(err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => { loadConfig(); }, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => { loadConfig(); }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ConfigContext.Provider value={{ config: config || DEFAULTS, setConfig, reloadConfig: loadConfig, isSyncing }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
