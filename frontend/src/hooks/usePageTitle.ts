import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_URL } from '../config';

const DEFAULT_TITLE = `${SITE_NAME} — Find Your Research Opportunity`;
const DEFAULT_DESCRIPTION =
  'Labyro is the marketplace where university students find research positions and labs find their next great researcher. Verified listings, structured applications, one pipeline.';

/** Create the tag if it is missing, then set its attribute — never duplicates. */
function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertMetaByName(name: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

interface PageMeta {
  /** Route title; omit for the site default. Rendered as "<title> — Labyro". */
  title?: string;
  /** Route meta description; omit for the site default. */
  description?: string;
}

/**
 * Sets per-route <head> metadata for the current route:
 *   - document.title ("Opportunities — Labyro"; omit for the site default)
 *   - <link rel="canonical"> pointing at THIS route's production URL
 *     (SITE_URL + pathname) — not the SPA shell's hardcoded homepage
 *   - <meta name="description"> for this route (falls back to the site default)
 *
 * SPA-only: crawlers that don't run JS still see the static title/description
 * from index.html. og:title/og:image stay static there because social crawlers
 * don't run JS — per-route OG needs prerendering (see index.html).
 */
export function usePageMeta({ title, description }: PageMeta = {}): void {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    upsertLink('canonical', `${SITE_URL}${pathname}`);
    upsertMetaByName('description', description ?? DEFAULT_DESCRIPTION);
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, pathname]);
}

/**
 * Back-compat wrapper: existing `usePageTitle('...')` call sites keep their
 * exact title behavior and now also get a correct per-route canonical link and
 * the default description. Prefer usePageMeta directly when a route also wants
 * its own description.
 */
export function usePageTitle(title?: string): void {
  usePageMeta({ title });
}
