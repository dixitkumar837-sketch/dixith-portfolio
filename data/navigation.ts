import { NavItem } from "./types";
import { SITE_CONFIG } from "@/lib/site-config";

export const BRAND_CONFIG = {
  name: SITE_CONFIG.name,
  fullName: SITE_CONFIG.author.name,
  title: SITE_CONFIG.positioning,
  tagline: SITE_CONFIG.tagline,
  philosophy: SITE_CONFIG.philosophy,
  principles: SITE_CONFIG.principles,
  socials: {
    linkedIn: SITE_CONFIG.socials.linkedin,
    whatsApp: SITE_CONFIG.socials.whatsapp,
    gitHub: SITE_CONFIG.socials.github,
  },
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Research", href: "/#research" },
  { label: "AI Search Lab", href: "/#search-lab", badge: "ACTIVE" },
  { label: "Articles", href: "/articles" },
  { label: "Guides", href: "/guides" },
  { label: "Professional Experience", href: "/#experience" },
  { label: "About", href: "/about" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "Research", href: "/#research" },
  { label: "AI Search Lab", href: "/#search-lab" },
  { label: "Articles", href: "/articles" },
  { label: "Guides", href: "/guides" },
  { label: "Professional Experience", href: "/#experience" },
  { label: "About", href: "/about" },
  { label: "Search", href: "/search" },
  { label: "Connect", href: "/#connect" },
];
