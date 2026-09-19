import { NavItem } from "./types";

export const BRAND_CONFIG = {
  name: "DIXITH",
  fullName: "Dixith Kumar",
  title: "AI Search Strategist",
  tagline: "SEARCH FORWARD",
  philosophy: "Research first. Build second. Measure always.",
  principles: [
    "Evidence over opinions",
    "Research over assumptions",
    "Results over noise",
    "Long-term visibility over short-term ranking tactics",
    "Clear thinking over marketing hype",
    "Human expertise combined with emerging search technology",
  ],
  socials: {
    linkedIn: "https://linkedin.com",
    whatsApp: "https://wa.me/",
    gitHub: "https://github.com",
  },
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Research", href: "#research" },
  { label: "AI Search Lab", href: "#search-lab", badge: "ACTIVE" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "About", href: "#about" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "Research", href: "#research" },
  { label: "AI Search Lab", href: "#search-lab" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Latest Insights", href: "#insights" },
  { label: "About", href: "#about" },
  { label: "Connect", href: "#connect" },
];
