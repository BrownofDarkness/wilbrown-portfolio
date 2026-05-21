export type SkillCategory = "mobile" | "backend" | "infra" | "tools";

export type Skill = {
  id: string;
  label: string;
  category: SkillCategory;
  /** Devicon icon name (https://devicon.dev) */
  icon: string;
  /** Devicon variant (default: "original") */
  variant?: string;
  /** Position in 100x100 viewBox (constellation layout). */
  x: number;
  y: number;
};

export type Connection = [from: string, to: string];

/*
 * 20 core skills laid out as a constellation. Positions are hand-tuned
 * inside a 0-100 normalized viewBox; clusters group by category but a
 * few cross-links tell the actual story (mobile → backend → DB, infra
 * runs everything, observability watches).
 */
export const SKILLS: Skill[] = [
  // ── Mobile (upper-left)
  { id: "flutter", label: "Flutter", category: "mobile", icon: "flutter", x: 12, y: 28 },
  { id: "dart", label: "Dart", category: "mobile", icon: "dart", x: 22, y: 14 },

  // ── Backend (upper-center)
  { id: "python", label: "Python", category: "backend", icon: "python", x: 38, y: 24 },
  { id: "django", label: "Django", category: "backend", icon: "django", variant: "plain", x: 50, y: 12 },
  { id: "spring", label: "Spring", category: "backend", icon: "spring", x: 62, y: 22 },
  { id: "laravel", label: "Laravel", category: "backend", icon: "laravel", x: 48, y: 34 },

  // ── Data / observability (right)
  { id: "postgresql", label: "PostgreSQL", category: "backend", icon: "postgresql", x: 74, y: 14 },
  { id: "mysql", label: "MySQL", category: "backend", icon: "mysql", x: 86, y: 26 },
  { id: "redis", label: "Redis", category: "backend", icon: "redis", x: 78, y: 38 },
  { id: "elasticsearch", label: "Elastic", category: "backend", icon: "elasticsearch", x: 90, y: 50 },
  { id: "kafka", label: "Kafka", category: "backend", icon: "apachekafka", x: 70, y: 44 },

  // ── Infra (center-bottom)
  { id: "linux", label: "Linux", category: "infra", icon: "linux", x: 50, y: 55 },
  { id: "nginx", label: "Nginx", category: "infra", icon: "nginx", x: 36, y: 64 },
  { id: "docker", label: "Docker", category: "infra", icon: "docker", x: 58, y: 68 },
  { id: "aws", label: "AWS", category: "infra", icon: "amazonwebservices", variant: "plain-wordmark", x: 66, y: 58 },

  // ── Tools (bottom — staggered y for breathing room)
  { id: "git", label: "Git", category: "tools", icon: "git", x: 8, y: 80 },
  { id: "github", label: "GitHub", category: "tools", icon: "github", x: 20, y: 88 },
  { id: "gitlab", label: "GitLab", category: "tools", icon: "gitlab", x: 32, y: 80 },
  { id: "vscode", label: "VS Code", category: "tools", icon: "vscode", x: 44, y: 88 },
  { id: "intellij", label: "IntelliJ", category: "tools", icon: "intellij", x: 56, y: 80 },
  { id: "pycharm", label: "PyCharm", category: "tools", icon: "pycharm", x: 68, y: 88 },
  { id: "phpstorm", label: "PhpStorm", category: "tools", icon: "phpstorm", x: 80, y: 80 },
  { id: "androidstudio", label: "Android Studio", category: "tools", icon: "androidstudio", x: 92, y: 88 },
];

export const CONNECTIONS: Connection[] = [
  // Mobile chain
  ["flutter", "dart"],
  // Backend stack
  ["python", "django"],
  ["django", "postgresql"],
  ["spring", "mysql"],
  ["laravel", "mysql"],
  ["python", "redis"],
  // Observability pipeline (the IBAASS story)
  ["python", "kafka"],
  ["kafka", "elasticsearch"],
  // Infra mesh
  ["linux", "nginx"],
  ["linux", "docker"],
  ["linux", "aws"],
  ["nginx", "aws"],
  // Tools cluster — git family
  ["git", "github"],
  ["git", "gitlab"],
  // JetBrains family
  ["intellij", "pycharm"],
  ["intellij", "phpstorm"],
  ["intellij", "androidstudio"],
  // IDE → language ties (the actual day-to-day pairings)
  ["pycharm", "python"],
  ["phpstorm", "laravel"],
  ["androidstudio", "flutter"],
  ["vscode", "python"],
  // Cross-links: mobile/backend/infra integration
  ["flutter", "python"],
  ["django", "nginx"],
];

export function deviconUrl(skill: Skill): string {
  const variant = skill.variant ?? "original";
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skill.icon}/${skill.icon}-${variant}.svg`;
}
