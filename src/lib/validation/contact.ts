import { z } from 'zod';
import { SAFE_SUBMISSION_ERROR_MESSAGES } from '../security/errors';
import {
  PROJECT_TYPES,
  type ContactFieldName,
  type ContactSubmissionInput,
  type ContactSubmissionInsert,
  type ProjectType,
} from '../../types/contact';

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Please enter your full name (at least 2 characters).' })
    .max(120, { message: 'Name must be 120 characters or fewer.' }),
  email: z
    .string()
    .trim()
    .min(5, { message: 'Please enter a valid email address (at least 5 characters).' })
    .max(254, { message: 'Email address must be 254 characters or fewer.' })
    .email({ message: 'Please enter a valid email address (for example, name@domain.com).' })
    .refine((val) => EMAIL_PATTERN.test(val), {
      message: 'Please enter a valid email address (for example, name@domain.com).',
    }),
  projectType: z
    .enum(PROJECT_TYPES, {
      message: 'Please select a valid project category.',
    })
    .optional(),
  message: z
    .string()
    .trim()
    .min(20, { message: 'Please share a few more project details (at least 20 characters).' })
    .max(4000, { message: 'Project details must be 4,000 characters or fewer.' }),
  website: z.string().optional(),
});

export type ContactValidationResult =
  | {
      success: true;
      data: ContactSubmissionInsert;
    }
  | {
      success: false;
      fieldErrors: Partial<Record<ContactFieldName, string>>;
      errorMessage: string;
    };

function isContactFieldName(key: PropertyKey): key is ContactFieldName {
  return key === 'name' || key === 'email' || key === 'projectType' || key === 'message';
}

/**
 * Validates and normalizes untrusted contact form input for both UX feedback
 * and database boundary enforcement.
 */
export function validateContactInput(input: ContactSubmissionInput): ContactValidationResult {
  const normalizedProjectType: ProjectType | undefined =
    typeof input.projectType === 'string' && input.projectType.trim() === ''
      ? undefined
      : input.projectType;

  const parsed = contactSubmissionSchema.safeParse({
    name: input.name,
    email: input.email,
    projectType: normalizedProjectType,
    message: input.message,
    website: input.website,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactFieldName, string>> = {};

    for (const issue of parsed.error.issues) {
      const pathKey = issue.path[0];
      if (pathKey !== undefined && isContactFieldName(pathKey) && !fieldErrors[pathKey]) {
        fieldErrors[pathKey] = issue.message;
      }
    }

    return {
      success: false,
      fieldErrors,
      errorMessage: SAFE_SUBMISSION_ERROR_MESSAGES.validation,
    };
  }

  return {
    success: true,
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      project_type: parsed.data.projectType ?? null,
      message: parsed.data.message,
    },
  };
}
