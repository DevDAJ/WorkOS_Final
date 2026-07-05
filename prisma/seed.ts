import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedUsers } from "./seed-users";
import { seedJobs } from "../src/features/jobs/seed";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.careerRole.findFirst();
  if (existing) {
    console.log("Roles already seeded, skipping.");
  } else {
    await seedRoles();
  }

  const jobExists = await prisma.job.findFirst();
  if (jobExists) {
    console.log("Jobs already seeded, skipping.");
  } else {
    for (const job of seedJobs) {
      await prisma.job.create({ data: job });
    }
    console.log(`Seeded ${seedJobs.length} jobs.`);
  }

  await seedUsers(prisma);
}

async function seedRoles() {

  const roles = [
    // Design roles
    { name: "Junior Product Designer", category: "DESIGN" as const, seniority: "JUNIOR" as const, description: "Creates UI mockups, prototypes, and visual assets under guidance." },
    { name: "Mid Product Designer", category: "DESIGN" as const, seniority: "MID" as const, description: "Leads design projects independently, builds design systems, conducts user research." },
    { name: "Senior Product Designer", category: "DESIGN" as const, seniority: "SENIOR" as const, description: "Drives product design vision, mentors designers, shapes design strategy." },
    { name: "Junior UI Designer", category: "DESIGN" as const, seniority: "JUNIOR" as const, description: "Creates UI mockups and prototypes under guidance." },
    { name: "Graphic Designer", category: "DESIGN" as const, seniority: "MID" as const, description: "Creates visual assets, branding materials, and marketing collateral." },
    // Tech roles
    { name: "Junior Frontend Developer", category: "FRONTEND" as const, seniority: "JUNIOR" as const, description: "Builds UI components with HTML, CSS, and JavaScript under guidance." },
    { name: "Mid Frontend Developer", category: "FRONTEND" as const, seniority: "MID" as const, description: "Builds complex UI features independently, reviews code, mentors juniors." },
    { name: "Senior Frontend Developer", category: "FRONTEND" as const, seniority: "SENIOR" as const, description: "Architects frontend systems, drives technical decisions." },
    { name: "Junior Backend Developer", category: "BACKEND" as const, seniority: "JUNIOR" as const, description: "Writes API endpoints and database queries under guidance." },
    { name: "Mid Backend Developer", category: "BACKEND" as const, seniority: "MID" as const, description: "Designs and builds APIs, manages databases." },
    { name: "Senior Backend Developer", category: "BACKEND" as const, seniority: "SENIOR" as const, description: "Architects backend systems, designs data models." },
    { name: "Fullstack Developer", category: "FULLSTACK" as const, seniority: "MID" as const, description: "Builds features end-to-end across frontend and backend." },
    { name: "DevOps Engineer", category: "DEVOPS" as const, seniority: "MID" as const, description: "Manages infrastructure, CI/CD, monitoring." },
    { name: "Data Engineer", category: "DATA" as const, seniority: "MID" as const, description: "Builds data pipelines, ETL processes." },
    { name: "Engineering Manager", category: "PM" as const, seniority: "STAFF" as const, description: "Leads engineering teams, manages projects." },
  ];

  const skillDefs: Record<string, { name: string; weight: number; isOptional: boolean; minYears: number }[]> = {
    "Junior Product Designer": [
      { name: "Figma", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Prototyping", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Visual Design", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "User Research", weight: 0.6, isOptional: true, minYears: 0 },
      { name: "HTML", weight: 0.3, isOptional: true, minYears: 0 },
    ],
    "Mid Product Designer": [
      { name: "Figma", weight: 1, isOptional: false, minYears: 2 },
      { name: "Design Systems", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "Interaction Design", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "User Research", weight: 0.9, isOptional: false, minYears: 1 },
      { name: "Visual Design", weight: 0.8, isOptional: false, minYears: 2 },
      { name: "Prototyping", weight: 0.8, isOptional: false, minYears: 1.5 },
    ],
    "Senior Product Designer": [
      { name: "Design Systems", weight: 1, isOptional: false, minYears: 3 },
      { name: "Leadership", weight: 1, isOptional: false, minYears: 2 },
      { name: "Interaction Design", weight: 1, isOptional: false, minYears: 3 },
      { name: "User Research", weight: 0.9, isOptional: false, minYears: 2 },
      { name: "UX Strategy", weight: 1, isOptional: false, minYears: 2 },
      { name: "Figma", weight: 0.8, isOptional: false, minYears: 3 },
    ],
    "Junior UI Designer": [
      { name: "Figma", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Visual Design", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Prototyping", weight: 0.8, isOptional: false, minYears: 0.5 },
      { name: "Photoshop", weight: 0.5, isOptional: true, minYears: 0 },
    ],
    "Graphic Designer": [
      { name: "Photoshop", weight: 1, isOptional: false, minYears: 2 },
      { name: "Illustrator", weight: 1, isOptional: false, minYears: 2 },
      { name: "Visual Design", weight: 1, isOptional: false, minYears: 2 },
      { name: "Typography", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "Figma", weight: 0.5, isOptional: true, minYears: 0 },
    ],
    "Junior Frontend Developer": [
      { name: "HTML", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "CSS", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "JavaScript", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Git", weight: 0.8, isOptional: false, minYears: 0 },
      { name: "React", weight: 0.5, isOptional: true, minYears: 0 },
    ],
    "Mid Frontend Developer": [
      { name: "React", weight: 1, isOptional: false, minYears: 2 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 1 },
      { name: "CSS", weight: 0.8, isOptional: false, minYears: 2 },
      { name: "Testing", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "State Management", weight: 0.7, isOptional: false, minYears: 1 },
      { name: "REST APIs", weight: 0.6, isOptional: true, minYears: 0 },
    ],
    "Senior Frontend Developer": [
      { name: "React", weight: 1, isOptional: false, minYears: 4 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 3 },
      { name: "System Design", weight: 1, isOptional: false, minYears: 1 },
      { name: "Performance", weight: 0.9, isOptional: false, minYears: 2 },
      { name: "CI/CD", weight: 0.6, isOptional: true, minYears: 0 },
      { name: "Leadership", weight: 0.7, isOptional: false, minYears: 1 },
    ],
    "Junior Backend Developer": [
      { name: "JavaScript", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Node.js", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "SQL", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Git", weight: 0.8, isOptional: false, minYears: 0 },
      { name: "REST APIs", weight: 0.5, isOptional: true, minYears: 0 },
    ],
    "Mid Backend Developer": [
      { name: "Node.js", weight: 1, isOptional: false, minYears: 2 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 1 },
      { name: "PostgreSQL", weight: 1, isOptional: false, minYears: 1 },
      { name: "Docker", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "Testing", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "CI/CD", weight: 0.6, isOptional: true, minYears: 0 },
    ],
    "Senior Backend Developer": [
      { name: "Node.js", weight: 1, isOptional: false, minYears: 4 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 3 },
      { name: "System Design", weight: 1, isOptional: false, minYears: 2 },
      { name: "PostgreSQL", weight: 1, isOptional: false, minYears: 3 },
      { name: "AWS", weight: 0.8, isOptional: false, minYears: 2 },
      { name: "Leadership", weight: 0.7, isOptional: false, minYears: 1 },
    ],
    "Fullstack Developer": [
      { name: "React", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "Node.js", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 1 },
      { name: "PostgreSQL", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "Docker", weight: 0.6, isOptional: true, minYears: 0 },
      { name: "CI/CD", weight: 0.5, isOptional: true, minYears: 0 },
    ],
    "DevOps Engineer": [
      { name: "Docker", weight: 1, isOptional: false, minYears: 2 },
      { name: "CI/CD", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "AWS", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "Linux", weight: 1, isOptional: false, minYears: 1 },
      { name: "Kubernetes", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "Terraform", weight: 0.7, isOptional: true, minYears: 0 },
    ],
    "Data Engineer": [
      { name: "Python", weight: 1, isOptional: false, minYears: 2 },
      { name: "SQL", weight: 1, isOptional: false, minYears: 2 },
      { name: "PostgreSQL", weight: 0.8, isOptional: false, minYears: 1.5 },
      { name: "Docker", weight: 0.7, isOptional: false, minYears: 1 },
      { name: "AWS", weight: 0.6, isOptional: true, minYears: 0 },
    ],
    "Engineering Manager": [
      { name: "Leadership", weight: 1, isOptional: false, minYears: 3 },
      { name: "System Design", weight: 0.9, isOptional: false, minYears: 2 },
      { name: "Project Management", weight: 1, isOptional: false, minYears: 2 },
      { name: "Code Review", weight: 0.7, isOptional: false, minYears: 2 },
      { name: "Agile", weight: 0.8, isOptional: false, minYears: 1 },
    ],
  };

  const edges: { fromRole: string; toRole: string; category: "NEXT" | "STRETCH" | "LONG_TERM"; requiredSkillScore: number }[] = [
    // Design edges
    { fromRole: "Junior UI Designer", toRole: "Junior Product Designer", category: "NEXT", requiredSkillScore: 50 },
    { fromRole: "Junior UI Designer", toRole: "Mid Product Designer", category: "STRETCH", requiredSkillScore: 65 },
    { fromRole: "Graphic Designer", toRole: "Junior UI Designer", category: "STRETCH", requiredSkillScore: 40 },
    { fromRole: "Junior Product Designer", toRole: "Mid Product Designer", category: "NEXT", requiredSkillScore: 60 },
    { fromRole: "Mid Product Designer", toRole: "Senior Product Designer", category: "NEXT", requiredSkillScore: 65 },
    { fromRole: "Mid Product Designer", toRole: "Mid Frontend Developer", category: "STRETCH", requiredSkillScore: 30 },
    { fromRole: "Senior Product Designer", toRole: "Engineering Manager", category: "LONG_TERM", requiredSkillScore: 50 },
    { fromRole: "Junior UI Designer", toRole: "Junior Frontend Developer", category: "STRETCH", requiredSkillScore: 25 },
    // Tech edges
    { fromRole: "Junior Frontend Developer", toRole: "Mid Frontend Developer", category: "NEXT", requiredSkillScore: 60 },
    { fromRole: "Mid Frontend Developer", toRole: "Senior Frontend Developer", category: "NEXT", requiredSkillScore: 65 },
    { fromRole: "Mid Frontend Developer", toRole: "Fullstack Developer", category: "STRETCH", requiredSkillScore: 50 },
    { fromRole: "Senior Frontend Developer", toRole: "Engineering Manager", category: "LONG_TERM", requiredSkillScore: 60 },
    { fromRole: "Junior Backend Developer", toRole: "Mid Backend Developer", category: "NEXT", requiredSkillScore: 60 },
    { fromRole: "Mid Backend Developer", toRole: "Senior Backend Developer", category: "NEXT", requiredSkillScore: 65 },
    { fromRole: "Mid Backend Developer", toRole: "Fullstack Developer", category: "STRETCH", requiredSkillScore: 50 },
    { fromRole: "Mid Backend Developer", toRole: "DevOps Engineer", category: "STRETCH", requiredSkillScore: 40 },
    { fromRole: "Mid Backend Developer", toRole: "Data Engineer", category: "STRETCH", requiredSkillScore: 40 },
    { fromRole: "Senior Backend Developer", toRole: "Engineering Manager", category: "LONG_TERM", requiredSkillScore: 60 },
    { fromRole: "Fullstack Developer", toRole: "Senior Frontend Developer", category: "STRETCH", requiredSkillScore: 50 },
    { fromRole: "Fullstack Developer", toRole: "Senior Backend Developer", category: "STRETCH", requiredSkillScore: 50 },
    { fromRole: "Fullstack Developer", toRole: "Engineering Manager", category: "LONG_TERM", requiredSkillScore: 50 },
    { fromRole: "DevOps Engineer", toRole: "Engineering Manager", category: "LONG_TERM", requiredSkillScore: 50 },
    { fromRole: "Data Engineer", toRole: "Senior Backend Developer", category: "STRETCH", requiredSkillScore: 45 },
    { fromRole: "Junior Frontend Developer", toRole: "Junior Backend Developer", category: "STRETCH", requiredSkillScore: 30 },
    { fromRole: "Junior Backend Developer", toRole: "Junior Frontend Developer", category: "STRETCH", requiredSkillScore: 30 },
    { fromRole: "Junior Frontend Developer", toRole: "Fullstack Developer", category: "LONG_TERM", requiredSkillScore: 40 },
    { fromRole: "Junior Backend Developer", toRole: "Fullstack Developer", category: "LONG_TERM", requiredSkillScore: 40 },
  ];

  const roleMap = new Map<string, string>();

  for (const r of roles) {
    const created = await prisma.careerRole.create({
      data: {
        name: r.name,
        category: r.category,
        seniority: r.seniority,
        description: r.description,
        requirements: {
          create: (skillDefs[r.name] || []).map((s) => ({
            skillName: s.name,
            weight: s.weight,
            isOptional: s.isOptional,
            minYears: s.minYears,
          })),
        },
      },
    });
    roleMap.set(r.name, created.id);
  }

  for (const e of edges) {
    const fromId = roleMap.get(e.fromRole);
    const toId = roleMap.get(e.toRole);
    if (fromId && toId) {
      await prisma.careerPathEdge.create({
        data: { fromRoleId: fromId, toRoleId: toId, category: e.category, requiredSkillScore: e.requiredSkillScore },
      });
    }
  }

  console.log(`Seeded ${roles.length} roles and ${edges.length} edges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
