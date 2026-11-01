import { useSyncExternalStore } from 'react';

// Minimal client-side router: the app only has two routes, so a full
// routing library isn't worth its dependency footprint.

const subscribe = (callback) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};

const getPathname = () => window.location.pathname;

export const usePathname = () => useSyncExternalStore(subscribe, getPathname);

export const navigate = (to) => {
  if (to === window.location.pathname) return;
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
