import { AuthorEntity } from "./types";
import { SITE_CONFIG } from "@/lib/site-config";

/**
 * Canonical Author Entity Registry for DIXITH
 * Single author model for E-E-A-T attribution and Schema.org Person linkage.
 */
export const CANONICAL_AUTHOR: AuthorEntity = {
  id: "AUT-001",
  name: SITE_CONFIG.author.name,
  role: SITE_CONFIG.author.jobTitle,
  tagline: SITE_CONFIG.tagline,
  url: SITE_CONFIG.author.url,
  sameAs: SITE_CONFIG.author.sameAs,
  bio: SITE_CONFIG.author.description,
};

export function getCanonicalAuthor(): AuthorEntity {
  return CANONICAL_AUTHOR;
}
