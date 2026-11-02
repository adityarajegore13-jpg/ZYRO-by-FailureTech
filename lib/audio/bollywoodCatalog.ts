/**
 * ZYRO by FailureTech — Bollywood Audio Catalog & Desi Vault
 * Strongly typed audio catalog for curated Bollywood and Desi local selections.
 */

import { Track, TRACK_CATALOG } from './catalog';

export type BollywoodFilterCategory =
  | 'All'
  | 'Bollywood'
  | 'Punjabi'
  | 'Marathi'
  | 'Singles'
  | 'Videos';

export interface BollywoodTrack extends Track {
  era?: string;
  vibeTag?: string;
}

export const BOLLYWOOD_CATALOG: BollywoodTrack[] = TRACK_CATALOG;

export function filterBollywoodCatalog(category: BollywoodFilterCategory): BollywoodTrack[] {
  switch (category) {
    case 'Bollywood':
      return BOLLYWOOD_CATALOG.filter((t) => t.category === 'Bollywood' || t.crate === 'Bollywood');
    case 'Punjabi':
      return BOLLYWOOD_CATALOG.filter((t) => t.category === 'Punjabi' || t.crate === 'Moosetape');
    case 'Marathi':
      return BOLLYWOOD_CATALOG.filter((t) => t.category === 'Marathi' || t.crate === 'Sambata');
    case 'Singles':
      return BOLLYWOOD_CATALOG.filter((t) => t.category === 'Singles' || t.crate === 'Singles');
    case 'Videos':
      return BOLLYWOOD_CATALOG.filter((t) => t.isVideo);
    case 'All':
    default:
      return BOLLYWOOD_CATALOG;
  }
}
