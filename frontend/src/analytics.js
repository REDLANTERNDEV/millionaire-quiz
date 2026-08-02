// Optional page analytics. Nothing is loaded unless whoever deploys the app
// opts in by setting VITE_ANALYTICS_PROVIDER (plus that provider's vars) in
// frontend/.env, so forks and local runs stay tracker-free by default.

function loadUmami() {
  const src = import.meta.env.VITE_UMAMI_SRC;
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = src;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
}

function loadGoogleAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

export function initAnalytics() {
  const provider = import.meta.env.VITE_ANALYTICS_PROVIDER;

  if (provider === 'umami') {
    loadUmami();
  } else if (provider === 'google') {
    loadGoogleAnalytics();
  }
}
