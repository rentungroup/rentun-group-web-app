import { createContext, useContext, useState, useEffect } from 'react';
import { fetchConfig } from '../utils/db';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await fetchConfig();
      setConfig(data);
    } catch (err) {
      console.error("Error fetching config:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0B2035', color: 'white' }}>
        <div style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: '1rem', opacity: 0.8 }}>Cargando información...</p>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error cargando la aplicación.</div>;
  }

  return (
    <ConfigContext.Provider value={{ config, setConfig, reloadConfig: loadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
