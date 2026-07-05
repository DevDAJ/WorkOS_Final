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

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  role: z.string().max(200).optional(),
  teamSize: z.number().int().positive().optional(),
  duration: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
  repoUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  technologies: z.array(z.string()).optional(),
  skillsDemonstrated: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  featuresBuilt: z.array(z.string()).optional(),
  challenges: z.string().max(5000).optional(),
  lessonsLearned: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
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
