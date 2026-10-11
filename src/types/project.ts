export interface ProjectTeammate {
  name: string;
  githubHandle?: string;
  githubUrl?: string;
  role: string;
}

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  summary: string;
  problem: string;
  role: string;
  teammates?: readonly ProjectTeammate[];
  organization?: string;
  process: readonly string[];
  solution: string;
  outcomes: readonly string[];
  technologies: readonly string[];
  coverImage: string;
  gallery: readonly string[];
  altText: string;
  liveUrl?: string;
  repositoryUrl?: string;
  referenceUrl?: string;
  publishedAt: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}
