import { z } from "zod";

export const personalInfoSchema = z.object({
  headline: z.string().max(200).optional(),
  summary: z.string().max(5000).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  field: z.string().min(1).max(200),
  startDate: z.string(),
  endDate: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  description: z.string().max(5000).optional(),
});

export const workExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().max(5000).optional(),
  bulletPoints: z.array(z.string()).optional(),
});
