import { z } from 'zod';

export const uuidParamSchema = z.string().uuid();

export function parseUuidParam(value: string): string | null {
  const parsed = uuidParamSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export const inquirySourceSchema = z.enum(['scout', 'contact']);

export function parseInquirySource(value: string): 'scout' | 'contact' | null {
  const parsed = inquirySourceSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
