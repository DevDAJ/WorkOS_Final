// ponytail: 10 core roles to start, expand as needed
// ponytail: enum values are strings at runtime, types from generated path
export type RoleCategory = "FRONTEND" | "BACKEND" | "DEVOPS" | "FULLSTACK" | "DATA" | "ML" | "MOBILE" | "DESIGN" | "PM" | "QA" | "SRE" | "SECURITY" | "OTHER";
export type SeniorityLevel = "INTERN" | "FRESHGRAD" | "JUNIOR" | "MID" | "SENIOR" | "STAFF" | "PRINCIPAL";
export type EdgeCategory = "NEXT" | "STRETCH" | "LONG_TERM";

export interface RoleSeed {
  name: string;
  category: RoleCategory;
  seniority: SeniorityLevel;
  description: string;
  skills: { name: string; weight: number; isOptional: boolean; minYears: number }[];
}

export interface EdgeSeed {
  fromRole: string;
  toRole: string;
  category: EdgeCategory;
  requiredSkillScore: number;
}

export const roles: RoleSeed[] = [
  // Design roles
  {
    name: "Junior Product Designer",
    category: "DESIGN",
    seniority: "JUNIOR",
    description: "Creates UI mockups, prototypes, and visual assets under guidance.",
    skills: [
      { name: "Figma", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Prototyping", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Visual Design", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "User Research", weight: 0.6, isOptional: true, minYears: 0 },
      { name: "HTML", weight: 0.3, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Mid Product Designer",
    category: "DESIGN",
    seniority: "MID",
    description: "Leads design projects independently, builds design systems, conducts user research.",
    skills: [
      { name: "Figma", weight: 1, isOptional: false, minYears: 2 },
      { name: "Design Systems", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "Interaction Design", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "User Research", weight: 0.9, isOptional: false, minYears: 1 },
      { name: "Visual Design", weight: 0.8, isOptional: false, minYears: 2 },
      { name: "Prototyping", weight: 0.8, isOptional: false, minYears: 1.5 },
    ],
  },
  {
    name: "Senior Product Designer",
    category: "DESIGN",
    seniority: "SENIOR",
    description: "Drives product design vision, mentors designers, shapes design strategy.",
    skills: [
      { name: "Design Systems", weight: 1, isOptional: false, minYears: 3 },
      { name: "Leadership", weight: 1, isOptional: false, minYears: 2 },
      { name: "Interaction Design", weight: 1, isOptional: false, minYears: 3 },
      { name: "User Research", weight: 0.9, isOptional: false, minYears: 2 },
      { name: "UX Strategy", weight: 1, isOptional: false, minYears: 2 },
      { name: "Figma", weight: 0.8, isOptional: false, minYears: 3 },
    ],
  },
  {
    name: "Junior UI Designer",
    category: "DESIGN",
    seniority: "JUNIOR",
    description: "Creates UI mockups and prototypes under guidance.",
    skills: [
      { name: "Figma", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Visual Design", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Prototyping", weight: 0.8, isOptional: false, minYears: 0.5 },
      { name: "Photoshop", weight: 0.5, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Graphic Designer",
    category: "DESIGN",
    seniority: "MID",
    description: "Creates visual assets, branding materials, and marketing collateral.",
    skills: [
      { name: "Photoshop", weight: 1, isOptional: false, minYears: 2 },
      { name: "Illustrator", weight: 1, isOptional: false, minYears: 2 },
      { name: "Visual Design", weight: 1, isOptional: false, minYears: 2 },
      { name: "Typography", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "Figma", weight: 0.5, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Junior Frontend Developer",
    category: "FRONTEND",
    seniority: "JUNIOR",
    description: "Builds UI components with HTML, CSS, and JavaScript under guidance.",
    skills: [
      { name: "HTML", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "CSS", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "JavaScript", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Git", weight: 0.8, isOptional: false, minYears: 0 },
      { name: "React", weight: 0.5, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Mid Frontend Developer",
    category: "FRONTEND",
    seniority: "MID",
    description: "Builds complex UI features independently, reviews code, mentors juniors.",
    skills: [
      { name: "React", weight: 1, isOptional: false, minYears: 2 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 1 },
      { name: "CSS", weight: 0.8, isOptional: false, minYears: 2 },
      { name: "Testing", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "State Management", weight: 0.7, isOptional: false, minYears: 1 },
      { name: "REST APIs", weight: 0.6, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Senior Frontend Developer",
    category: "FRONTEND",
    seniority: "SENIOR",
    description: "Architects frontend systems, drives technical decisions, leads teams.",
    skills: [
      { name: "React", weight: 1, isOptional: false, minYears: 4 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 3 },
      { name: "System Design", weight: 1, isOptional: false, minYears: 1 },
      { name: "Performance", weight: 0.9, isOptional: false, minYears: 2 },
      { name: "CI/CD", weight: 0.6, isOptional: true, minYears: 0 },
      { name: "Leadership", weight: 0.7, isOptional: false, minYears: 1 },
    ],
  },
  {
    name: "Junior Backend Developer",
    category: "BACKEND",
    seniority: "JUNIOR",
    description: "Writes API endpoints and database queries under guidance.",
    skills: [
      { name: "JavaScript", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Node.js", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "SQL", weight: 1, isOptional: false, minYears: 0.5 },
      { name: "Git", weight: 0.8, isOptional: false, minYears: 0 },
      { name: "REST APIs", weight: 0.5, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Mid Backend Developer",
    category: "BACKEND",
    seniority: "MID",
    description: "Designs and builds APIs, manages databases, writes tests.",
    skills: [
      { name: "Node.js", weight: 1, isOptional: false, minYears: 2 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 1 },
      { name: "PostgreSQL", weight: 1, isOptional: false, minYears: 1 },
      { name: "Docker", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "Testing", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "CI/CD", weight: 0.6, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Senior Backend Developer",
    category: "BACKEND",
    seniority: "SENIOR",
    description: "Architects backend systems, designs data models, leads engineering initiatives.",
    skills: [
      { name: "Node.js", weight: 1, isOptional: false, minYears: 4 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 3 },
      { name: "System Design", weight: 1, isOptional: false, minYears: 2 },
      { name: "PostgreSQL", weight: 1, isOptional: false, minYears: 3 },
      { name: "AWS", weight: 0.8, isOptional: false, minYears: 2 },
      { name: "Leadership", weight: 0.7, isOptional: false, minYears: 1 },
    ],
  },
  {
    name: "Fullstack Developer",
    category: "FULLSTACK",
    seniority: "MID",
    description: "Builds features end-to-end across frontend and backend.",
    skills: [
      { name: "React", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "Node.js", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "TypeScript", weight: 1, isOptional: false, minYears: 1 },
      { name: "PostgreSQL", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "Docker", weight: 0.6, isOptional: true, minYears: 0 },
      { name: "CI/CD", weight: 0.5, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "DevOps Engineer",
    category: "DEVOPS",
    seniority: "MID",
    description: "Manages infrastructure, CI/CD, monitoring, and deployments.",
    skills: [
      { name: "Docker", weight: 1, isOptional: false, minYears: 2 },
      { name: "CI/CD", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "AWS", weight: 1, isOptional: false, minYears: 1.5 },
      { name: "Linux", weight: 1, isOptional: false, minYears: 1 },
      { name: "Kubernetes", weight: 0.8, isOptional: false, minYears: 1 },
      { name: "Terraform", weight: 0.7, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Data Engineer",
    category: "DATA",
    seniority: "MID",
    description: "Builds data pipelines, ETL processes, and data warehouses.",
    skills: [
      { name: "Python", weight: 1, isOptional: false, minYears: 2 },
      { name: "SQL", weight: 1, isOptional: false, minYears: 2 },
      { name: "PostgreSQL", weight: 0.8, isOptional: false, minYears: 1.5 },
      { name: "Docker", weight: 0.7, isOptional: false, minYears: 1 },
      { name: "AWS", weight: 0.6, isOptional: true, minYears: 0 },
    ],
  },
  {
    name: "Engineering Manager",
    category: "PM",
    seniority: "STAFF",
    description: "Leads engineering teams, manages projects, drives technical strategy.",
    skills: [
      { name: "Leadership", weight: 1, isOptional: false, minYears: 3 },
      { name: "System Design", weight: 0.9, isOptional: false, minYears: 2 },
      { name: "Project Management", weight: 1, isOptional: false, minYears: 2 },
      { name: "Code Review", weight: 0.7, isOptional: false, minYears: 2 },
      { name: "Agile", weight: 0.8, isOptional: false, minYears: 1 },
    ],
  },
];

export const edges: EdgeSeed[] = [
  // Design edges
  { fromRole: "Junior UI Designer", toRole: "Junior Product Designer", category: "NEXT", requiredSkillScore: 50 },
  { fromRole: "Junior UI Designer", toRole: "Mid Product Designer", category: "STRETCH", requiredSkillScore: 65 },
  { fromRole: "Graphic Designer", toRole: "Junior UI Designer", category: "STRETCH", requiredSkillScore: 40 },
  { fromRole: "Junior Product Designer", toRole: "Mid Product Designer", category: "NEXT", requiredSkillScore: 60 },
  { fromRole: "Mid Product Designer", toRole: "Senior Product Designer", category: "NEXT", requiredSkillScore: 65 },
  { fromRole: "Mid Product Designer", toRole: "Mid Frontend Developer", category: "STRETCH", requiredSkillScore: 30 },
  { fromRole: "Senior Product Designer", toRole: "Engineering Manager", category: "LONG_TERM", requiredSkillScore: 50 },
  { fromRole: "Junior UI Designer", toRole: "Junior Frontend Developer", category: "STRETCH", requiredSkillScore: 25 },
  // Existing tech edges
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
