import { useEffect, useState } from "react";
type ConsentChoice = "granted" | "denied";
declare global {
  interface Window {
    miToolsAnalytics?: {
      getConsent: () => ConsentChoice | null;
      setConsent: (value: ConsentChoice) => void;
      open: () => void;
    };
  }
}
export function CookieSettings() {
  return (
    <button
      className="text-button"
      onClick={() => window.miToolsAnalytics?.open()}
    >
      Cookie settings
    </button>
  );
}
export default function AnalyticsConsent() {
  const [visible, setVisible] = useState(false),
    [current, setCurrent] = useState<ConsentChoice | null>(null);
  useEffect(() => {
    const sync = () => {
      const api = window.miToolsAnalytics;
      if (!api) return;
      const choice = api.getConsent();
      setCurrent(choice);
      setVisible(choice === null);
    };
    const open = () => {
      setCurrent(window.miToolsAnalytics?.getConsent() ?? null);
      setVisible(true);
    };
    sync();
    window.addEventListener("mi-tools-consent-ready", sync);
    window.addEventListener("mi-tools-consent-change", sync);
    window.addEventListener("mi-tools-consent-open", open);
    return () => {
      window.removeEventListener("mi-tools-consent-ready", sync);
      window.removeEventListener("mi-tools-consent-change", sync);
      window.removeEventListener("mi-tools-consent-open", open);
    };
  }, []);
  if (!visible) return null;
  return (
    <aside
      className="consent-banner"
      role="region"
      aria-labelledby="consent-title"
    >
      <div>
        <h2 id="consent-title">A choice about analytics.</h2>
        <p>
          Allow Google Analytics and Microsoft Clarity to help improve these
          tools. Measurement loads only with your permission. Tool workspaces
          are masked in recordings. <a href="/privacy">Privacy details</a>.
        </p>
        {current === "granted" && (
          <p className="consent-note">
            Rejecting now reloads this page to stop recording and clears any
            unsaved tool input.
          </p>
        )}
      </div>
      <div className="consent-actions">
        <button
          className="button secondary"
          onClick={() => window.miToolsAnalytics?.setConsent("denied")}
        >
          {current === "granted" ? "Reject & reload" : "Reject"}
        </button>
        <button
          className="button"
          onClick={() => window.miToolsAnalytics?.setConsent("granted")}
        >
          Accept analytics
        </button>
        {current !== null && (
          <button className="text-button" onClick={() => setVisible(false)}>
            Keep current choice
          </button>
        )}
      </div>
    </aside>
  );
}
