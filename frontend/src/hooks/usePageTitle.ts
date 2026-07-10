import { useEffect } from 'react';
import { SITE_NAME } from '../config';

const DEFAULT_TITLE = `${SITE_NAME} — Find Your Research Opportunity`;

/**
 * Sets the document title for the current route ("Opportunities — Labyro").
 * Pass nothing to restore the site default. SPA-only: crawlers that don't run
 * JS still see the static title from index.html.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
