import { z } from "zod";

export const personalInfoSchema = z.object({
  headline: z.string().max(200).optional(),
  summary: z.string().max(5000).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  date: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().max(5000).optional(),
});

export const awardSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  issuer: z.string().max(200).optional(),
  date: z.string().optional(),
  description: z.string().max(5000).optional(),
});

export const languageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "NATIVE"]),
});

export const referenceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  relationship: z.string().max(200).optional(),
});

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1).max(100),
  url: z.string().url(),
});
