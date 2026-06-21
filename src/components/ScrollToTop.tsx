import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reset the window scroll to the top whenever the route (pathname) changes —
 * single-page navigation otherwise keeps the previous page's scroll position,
 * landing you partway down the new page.
 *
 * Keyed on pathname only, so search-param updates (catalog filters, ?id=,
 * ?ids=) and in-page #anchor links (the skip-link) are NOT disrupted.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
