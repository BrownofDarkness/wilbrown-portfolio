export type SkillCategory = "mobile" | "backend" | "infra" | "tools";

export type Skill = {
  id: string;
  label: string;
  category: SkillCategory;
  /** Devicon icon name (https://devicon.dev). Used unless `simpleicons` is set. */
  icon?: string;
  /** Devicon variant (default: "original") — only applies to devicon icons. */
  variant?: string;
  /**
   * Simple Icons slug fallback (https://simpleicons.org). Used for techs
   * Devicon doesn't ship (VMware, HAProxy, n8n…). Rendered in the brand
   * cyan so the fallback nodes read as a unified "highlight" family
   * among the multi-color Devicon nodes.
   */
  simpleicons?: string;
  /**
   * Local SVG path under /public, e.g. "/icons/zabbix.svg". Last resort
   * when neither Devicon nor Simple Icons cover the tech. Color is baked
   * into the SVG itself.
   */
  localIcon?: string;
  /** Position in 100x100 viewBox (constellation layout). */
  x: number;
  y: number;
};

export type Connection = [from: string, to: string];

/*
 * 32 core skills laid out as a constellation. Positions are hand-tuned
 * inside a 0-100 normalized viewBox. Clusters group by category; a few
 * cross-links tell the actual story without spaghetti-ing the SVG.
 */
export const SKILLS: Skill[] = [
  // ── Mobile (upper-left)
  { id: "flutter", label: "Flutter", category: "mobile", icon: "flutter", x: 8, y: 30 },
  { id: "dart", label: "Dart", category: "mobile", icon: "dart", x: 18, y: 14 },

  // ── Backend languages (upper-center)
  { id: "c", label: "C", category: "backend", icon: "c", x: 16, y: 22 },
  { id: "java", label: "Java", category: "backend", icon: "java", x: 28, y: 24 },
  { id: "python", label: "Python", category: "backend", icon: "python", x: 36, y: 10 },
  { id: "django", label: "Django", category: "backend", icon: "django", variant: "plain", x: 46, y: 22 },
  { id: "spring", label: "Spring", category: "backend", icon: "spring", x: 56, y: 10 },
  { id: "laravel", label: "Laravel", category: "backend", icon: "laravel", x: 38, y: 36 },

  // ── Databases (top-right cluster)
  { id: "postgresql", label: "PostgreSQL", category: "backend", icon: "postgresql", x: 66, y: 12 },
  { id: "mongodb", label: "MongoDB", category: "backend", icon: "mongodb", x: 78, y: 8 },
  { id: "mysql", label: "MySQL", category: "backend", icon: "mysql", x: 92, y: 18 },
  { id: "redis", label: "Redis", category: "backend", icon: "redis", x: 72, y: 24 },

  // ── Observability pipeline (right-mid) — Zabbix→Kafka→Logstash→Elastic→Kibana
  { id: "kafka", label: "Kafka", category: "backend", icon: "apachekafka", x: 58, y: 38 },
  { id: "logstash", label: "Logstash", category: "backend", icon: "logstash", x: 70, y: 44 },
  { id: "elasticsearch", label: "Elastic", category: "backend", icon: "elasticsearch", x: 84, y: 36 },
  { id: "kibana", label: "Kibana", category: "backend", icon: "kibana", x: 94, y: 44 },
  { id: "zabbix", label: "Zabbix", category: "backend", localIcon: "/icons/zabbix.svg", x: 82, y: 52 },

  // ── Infra (center-bottom)
  { id: "linux", label: "Linux", category: "infra", icon: "linux", x: 46, y: 54 },
  { id: "nginx", label: "Nginx", category: "infra", icon: "nginx", x: 30, y: 60 },
  { id: "haproxy", label: "HAProxy", category: "infra", localIcon: "/icons/haproxy.svg", x: 20, y: 70 },
  { id: "docker", label: "Docker", category: "infra", icon: "docker", x: 56, y: 66 },
  { id: "aws", label: "AWS", category: "infra", icon: "amazonwebservices", variant: "plain-wordmark", x: 68, y: 62 },
  { id: "vmware", label: "VMware", category: "infra", simpleicons: "vmware", x: 78, y: 64 },

  // ── Tools (bottom — staggered y for breathing room)
  { id: "git", label: "Git", category: "tools", icon: "git", x: 6, y: 84 },
  { id: "github", label: "GitHub", category: "tools", icon: "github", x: 16, y: 92 },
  { id: "gitlab", label: "GitLab", category: "tools", icon: "gitlab", x: 26, y: 84 },
  { id: "vscode", label: "VS Code", category: "tools", icon: "vscode", x: 36, y: 92 },
  { id: "intellij", label: "IntelliJ", category: "tools", icon: "intellij", x: 48, y: 84 },
  { id: "pycharm", label: "PyCharm", category: "tools", icon: "pycharm", x: 58, y: 92 },
  { id: "phpstorm", label: "PhpStorm", category: "tools", icon: "phpstorm", x: 68, y: 84 },
  { id: "androidstudio", label: "Android Studio", category: "tools", icon: "androidstudio", x: 80, y: 92 },
  { id: "n8n", label: "n8n", category: "tools", simpleicons: "n8n", x: 92, y: 84 },
];

/*
 * Connections: keep ONLY the visually short + narratively meaningful pairs.
 * Long cross-screen lines (e.g. flutter→python, androidstudio→flutter) were
 * removed in favor of cluster-local cohesion. The observability pipeline
 * stays as one explicit horizontal-ish chain because it IS the story.
 */
export const CONNECTIONS: Connection[] = [
  // Mobile
  ["flutter", "dart"],

  // Educational chain — C/SDL2 (Yaknema 2021) → Python (Django REST)
  ["c", "python"],

  // Python web stack
  ["python", "django"],
  ["django", "postgresql"],

  // Java backend stack
  ["java", "spring"],
  ["spring", "mysql"],

  // PHP backend
  ["laravel", "mysql"],

  // Caching
  ["python", "redis"],

  // Document DB
  ["django", "mongodb"],

  // Observability pipeline — the IBAASS story
  ["zabbix", "kafka"],
  ["kafka", "logstash"],
  ["logstash", "elasticsearch"],
  ["elasticsearch", "kibana"],

  // Infra mesh
  ["linux", "nginx"],
  ["linux", "docker"],
  ["linux", "vmware"],
  ["nginx", "aws"],
  ["nginx", "haproxy"],

  // Self-hosted automation
  ["n8n", "docker"],

  // Tools — git family
  ["git", "github"],
  ["git", "gitlab"],

  // JetBrains family
  ["intellij", "pycharm"],
  ["intellij", "phpstorm"],
  ["intellij", "androidstudio"],
];

/**
 * Resolve the icon URL for a skill. Three-tier resolution:
 *   1. localIcon — public-served SVG, color baked in
 *   2. simpleicons — CDN with brand cyan tint
 *   3. devicon — multi-color default
 * The cyan tint on simpleicons + local SVGs ties fallback icons together
 * as a coherent secondary family alongside the multi-color Devicon nodes.
 */
export function deviconUrl(skill: Skill): string {
  if (skill.localIcon) return skill.localIcon;
  if (skill.simpleicons) {
    return `https://cdn.simpleicons.org/${skill.simpleicons}/00A29A`;
  }
  const variant = skill.variant ?? "original";
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skill.icon}/${skill.icon}-${variant}.svg`;
}
