export const PROJECT_TYPES = [
  'full-stack-web',
  'backend-api-systems',
  'ai-data-pipeline',
  'technical-consulting',
  'other',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABELS: Readonly<Record<ProjectType, string>> = {
  'full-stack-web': 'Full-Stack Web Application',
  'backend-api-systems': 'Backend & API Architecture',
  'ai-data-pipeline': 'AI / Data Pipeline Integration',
  'technical-consulting': 'Technical Consulting & Audit',
  other: 'Other Enquiry',
};

export type ContactFieldName = 'name' | 'email' | 'projectType' | 'message';

export interface ContactSubmissionInput {
  name: string;
  email: string;
  projectType?: ProjectType;
  message: string;
  /** Optional honeypot field that must remain empty for legitimate visitors. */
  website?: string;
}

export interface ContactSubmissionInsert {
  name: string;
  email: string;
  project_type: ProjectType | null;
  message: string;
}

export interface ContactSubmissionRecord {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  message: string;
  created_at: string;
}

export type ContactSubmissionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      errorMessage: string;
      fieldErrors?: Partial<Record<ContactFieldName, string>>;
    };
