import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export const PwaUpdatePrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const sw = registerSW({
      onNeedRefresh: () => setNeedRefresh(true),
      onOfflineReady: () => setOfflineReady(true),
    });
    setUpdateSW(() => sw);
  }, []);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="pwa-install-prompt" role="status">
      <div>
        <p className="pwa-title">A new version is ready</p>
        <p className="pwa-copy">
          {needRefresh
            ? 'Refresh to load the latest updates on this device.'
            : 'The app is ready to use offline.'}
        </p>
      </div>
      <div className="pwa-actions">
        {needRefresh ? (
          <button className="glass-button primary" onClick={() => updateSW?.(true)}>
            Refresh now
          </button>
        ) : null}
        <button className="glass-button secondary" onClick={() => { setNeedRefresh(false); setOfflineReady(false); }}>
          Later
        </button>
      </div>
    </div>
  );
};
