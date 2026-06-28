import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    setVisible(false);
    setPromptEvent(null);
  };

  if (!visible || !promptEvent) return null;

  return (
    <div className="pwa-install-prompt">
      <div>
        <p className="pwa-title">Add WealthFlow to your home screen</p>
        <p className="pwa-copy">Install the app for faster access, offline support, and a native app-like experience.</p>
      </div>
      <div className="pwa-actions">
        <button className="glass-button primary" onClick={handleInstall}>
          Add to Home Screen
        </button>
        <button className="glass-button secondary" onClick={() => setVisible(false)}>
          Maybe later
        </button>
      </div>
    </div>
  );
};
