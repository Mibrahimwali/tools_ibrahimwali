/* First-party bootstrap. Measurement vendors load only after analytics consent. */
(function () {
  "use strict";
  if (window.miToolsAnalytics) return;
  var GA_ID = "G-PTMKFXTDC8";
  var CLARITY_ID = "z6v4zidf6c";
  var STORAGE_KEY = "mi-tools-consent-v1";
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  var loaded = false;
  var scheduled = false;
  var choice = null;
  var referrer = "";
  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (
      saved &&
      (saved.choice === "granted" || saved.choice === "denied") &&
      typeof saved.time === "number" &&
      saved.time <= Date.now() &&
      Date.now() - saved.time < MAX_AGE
    )
      choice = saved.choice;
  } catch (_) {
    /* Storage is optional. Keep an in-memory choice. */
  }
  try {
    if (document.referrer) {
      var ref = new URL(document.referrer);
      referrer = ref.origin + ref.pathname;
    }
  } catch (_) {
    /* Ignore malformed referrers. */
  }

  function updateConsent(value) {
    window.gtag("consent", "update", {
      analytics_storage: value,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
  function append(id, url) {
    if (document.getElementById(id)) return;
    var script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = url;
    document.head.appendChild(script);
  }
  function start() {
    scheduled = false;
    if (choice !== "granted" || loaded) return;
    loaded = true;
    window["ga-disable-" + GA_ID] = false;
    updateConsent("granted");
    window.gtag("js", new Date());
    // The document gets one automatic page view. There is no second React hit.
    window.gtag("config", GA_ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: location.hostname,
      cookie_prefix: "mi_tools",
      cookie_flags: "SameSite=Lax;Secure",
      page_location: location.origin + location.pathname,
      page_referrer: referrer,
    });
    append(
      "mi-tools-ga",
      "https://www.googletagmanager.com/gtag/js?id=" + GA_ID,
    );
    window.clarity =
      window.clarity ||
      function () {
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };
    window.clarity("consentv2", {
      analytics_Storage: "granted",
      ad_Storage: "denied",
    });
    append("mi-tools-clarity", "https://www.clarity.ms/tag/" + CLARITY_ID);
  }
  function schedule() {
    if (scheduled || loaded || choice !== "granted") return;
    scheduled = true;
    var idle = function () {
      if (typeof window.requestIdleCallback === "function")
        window.requestIdleCallback(start, { timeout: 1500 });
      else window.setTimeout(start, 100);
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
  }
  function clearCookies() {
    var names = document.cookie.split(";").map(function (c) {
      return c.trim().split("=")[0];
    });
    var host = location.hostname.split(".");
    names.forEach(function (name) {
      if (!/^(?:mi_tools|_mi_tools|_clck$|_clsk$)/.test(name)) return;
      var expiry = name + "=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = expiry;
      for (var i = 0; i < host.length - 1; i++) {
        document.cookie = expiry + "; domain=" + host.slice(i).join(".");
        document.cookie = expiry + "; domain=." + host.slice(i).join(".");
      }
    });
  }
  window.miToolsAnalytics = {
    getConsent: function () {
      return choice;
    },
    setConsent: function (value) {
      if (value !== "granted" && value !== "denied") return;
      choice = value;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ choice: value, time: Date.now() }),
        );
      } catch (_) {
        /* In-memory fallback. */
      }
      updateConsent(value);
      if (value === "granted") schedule();
      else {
        window["ga-disable-" + GA_ID] = true;
        if (window.clarity)
          window.clarity("consentv2", {
            analytics_Storage: "denied",
            ad_Storage: "denied",
          });
        clearCookies();
        // A removed script cannot undo an executed recorder. Start a fresh,
        // denied document when withdrawing consent from an already loaded one.
        if (loaded) {
          location.reload();
          return;
        }
      }
      window.dispatchEvent(new Event("mi-tools-consent-change"));
    },
    open: function () {
      window.dispatchEvent(new Event("mi-tools-consent-open"));
    },
  };
  window.dispatchEvent(new Event("mi-tools-consent-ready"));
  if (choice === "granted") schedule();
})();
