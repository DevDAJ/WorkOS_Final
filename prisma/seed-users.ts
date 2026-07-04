import { createHash } from "node:crypto";
import type { PrismaClient } from "../src/generated/prisma/client";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("base64url");
}

interface SeedUser {
  email: string;
  password: string;
  name: string;
  personalInfo: { headline: string; summary: string; location: string; title: string };
  education: { institution: string; degree: string; field: string; startYear: number; endYear: number; gpa?: number }[];
  workExperience: {
    company: string; role: string; location: string;
    startYear: number; endYear: number | null; current: boolean;
    bulletPoints: string[];
  }[];
  skills: { name: string; years: number; category: string; relatedSkills: string[] }[];
  projects: {
    title: string; description: string; technologies: string[];
    skillsDemonstrated: string[]; responsibilities: string[];
  }[];
}

const users: SeedUser[] = [
  {
    email: "aisyah@demo.com",
    password: "password123",
    name: "Aisyah binti Ahmad",
    personalInfo: { headline: "Fresh Computer Science Graduate", summary: "Recent CS graduate from Universiti Malaya with foundation in web development and databases. Eager to start my career in tech.", location: "Kuala Lumpur, Malaysia", title: "Fresh Graduate" },
    education: [
      { institution: "Universiti Malaya", degree: "Bachelor of Computer Science", field: "Computer Science", startYear: 2022, endYear: 2026, gpa: 3.4 },
    ],
    workExperience: [],
    skills: [
      { name: "HTML", years: 0.5, category: "LANGUAGE", relatedSkills: ["CSS", "JavaScript"] },
      { name: "CSS", years: 0.5, category: "LANGUAGE", relatedSkills: ["HTML"] },
      { name: "JavaScript", years: 0.5, category: "LANGUAGE", relatedSkills: ["HTML", "CSS"] },
      { name: "Python", years: 1, category: "LANGUAGE", relatedSkills: ["SQL"] },
      { name: "SQL", years: 0.5, category: "DATABASE", relatedSkills: ["Python"] },
      { name: "Git", years: 0.5, category: "TOOL", relatedSkills: [] },
    ],
    projects: [
      { title: "Final Year Project: Cafe Ordering System", description: "Built a web-based cafe ordering system with React frontend and Python backend as part of final year project.", technologies: ["React", "Python", "Flask", "PostgreSQL"], skillsDemonstrated: ["HTML", "CSS", "JavaScript", "Python", "SQL"], responsibilities: ["Full-stack development", "Database design", "UI implementation"] },
      { title: "Personal Portfolio Website", description: "Designed and built a responsive portfolio site to showcase university projects.", technologies: ["HTML", "CSS", "JavaScript", "GitHub Pages"], skillsDemonstrated: ["HTML", "CSS", "JavaScript", "Git"], responsibilities: ["Design", "Development", "Deployment"] },
    ],
  },
  {
    email: "benny@demo.com",
    password: "password123",
    name: "Benny Lim Wei Ming",
    personalInfo: { headline: "Junior UI/UX Designer | Figma, Prototyping", summary: "Junior designer with 1.5 years of experience at Grab Malaysia. Passionate about creating intuitive user experiences.", location: "Petaling Jaya, Selangor, Malaysia", title: "Junior UI/UX Designer" },
    education: [
      { institution: "Taylor's University", degree: "Diploma in Graphic Design", field: "Graphic Design", startYear: 2019, endYear: 2022 },
    ],
    workExperience: [
      { company: "Grab Malaysia", role: "Junior UI/UX Designer", location: "Petaling Jaya, Selangor", startYear: 2024, endYear: null, current: true, bulletPoints: [
        "Designed UI mockups for GrabFood merchant dashboard used by 10K+ merchants",
        "Created interactive prototypes in Figma for user testing sessions",
        "Collaborated with product managers and engineers to refine design specs",
        "Built and maintained a shared component library reducing design-to-dev handoff time",
      ]},
    ],
    skills: [
      { name: "Figma", years: 1.5, category: "TOOL", relatedSkills: ["Prototyping", "Design Systems"] },
      { name: "Prototyping", years: 1.5, category: "OTHER", relatedSkills: ["Figma", "User Research"] },
      { name: "User Research", years: 1, category: "OTHER", relatedSkills: ["Prototyping"] },
      { name: "Visual Design", years: 1.5, category: "OTHER", relatedSkills: ["Figma"] },
      { name: "Photoshop", years: 2, category: "TOOL", relatedSkills: ["Visual Design"] },
      { name: "Illustrator", years: 1, category: "TOOL", relatedSkills: ["Visual Design"] },
    ],
    projects: [
      { title: "GrabFood Merchant Dashboard Redesign", description: "Redesigned the merchant onboarding flow, reducing drop-off by 25% through improved UX.", technologies: ["Figma", "Illustrator"], skillsDemonstrated: ["Figma", "Prototyping", "User Research", "Visual Design"], responsibilities: ["User research", "Wireframing", "Prototyping", "Design handoff"] },
      { title: "Design System Components", description: "Created reusable design system components in Figma for the GrabFood team.", technologies: ["Figma"], skillsDemonstrated: ["Figma", "Visual Design", "Design Systems"], responsibilities: ["Component design", "Documentation", "Team collaboration"] },
    ],
  },
  {
    email: "carmen@demo.com",
    password: "password123",
    name: "Carmen Tan Li Mei",
    personalInfo: { headline: "Mid Product Designer | Design Systems, User Research", summary: "Product designer with 3 years of experience designing for e-commerce and fintech products in Malaysia.", location: "Kuala Lumpur, Malaysia", title: "Product Designer" },
    education: [
      { institution: "Monash University Malaysia", degree: "Bachelor of Interaction Design", field: "Interaction Design", startYear: 2018, endYear: 2021, gpa: 3.6 },
    ],
    workExperience: [
      { company: "Carsome", role: "Product Designer", location: "Kuala Lumpur", startYear: 2023, endYear: null, current: true, bulletPoints: [
        "Led the redesign of the car listing detail page, improving user engagement by 30%",
        "Built a comprehensive design system used across 3 product squads",
        "Conducted user research sessions with 50+ car buyers and sellers",
        "Collaborated with engineers to ensure pixel-perfect implementation of designs",
      ]},
      { company: "PolicyStreet", role: "Junior Product Designer", location: "Kuala Lumpur", startYear: 2021, endYear: 2023, current: false, bulletPoints: [
        "Designed onboarding flows for insurance comparison platform",
        "Created wireframes and interactive prototypes for new product features",
        "Assisted in user testing sessions and synthesized research findings",
      ]},
    ],
    skills: [
      { name: "Figma", years: 3, category: "TOOL", relatedSkills: ["Design Systems", "Prototyping"] },
      { name: "Design Systems", years: 2, category: "OTHER", relatedSkills: ["Figma", "Interaction Design"] },
      { name: "Interaction Design", years: 3, category: "OTHER", relatedSkills: ["Prototyping", "User Research"] },
      { name: "User Research", years: 2, category: "OTHER", relatedSkills: ["Interaction Design"] },
      { name: "Visual Design", years: 3, category: "OTHER", relatedSkills: ["Figma"] },
      { name: "Prototyping", years: 3, category: "OTHER", relatedSkills: ["Figma", "Interaction Design"] },
    ],
    projects: [
      { title: "Carsome Design System", description: "Built a scalable design system with 40+ reusable components, improving cross-team consistency.", technologies: ["Figma", "Storybook"], skillsDemonstrated: ["Figma", "Design Systems", "Visual Design", "Interaction Design"], responsibilities: ["System architecture", "Component design", "Documentation", "Cross-team alignment"] },
      { title: "Insurance Comparison UX Research", description: "Conducted user research study with 30 participants to improve the insurance comparison experience.", technologies: ["Figma", "Miro", "Notion"], skillsDemonstrated: ["User Research", "Prototyping", "Interaction Design"], responsibilities: ["Research planning", "User interviews", "Synthesis", "Design recommendations"] },
    ],
  },
  {
    email: "dinesh@demo.com",
    password: "password123",
    name: "Dinesh Kumar a/l Rajan",
    personalInfo: { headline: "Junior Software Engineer | React, Python, SQL", summary: "Junior engineer at Shopee Malaysia with 1.5 years of experience building web applications.", location: "Johor Bahru, Johor, Malaysia", title: "Junior Software Engineer" },
    education: [
      { institution: "Asia Pacific University (APU)", degree: "Bachelor of Software Engineering", field: "Software Engineering", startYear: 2019, endYear: 2023, gpa: 3.5 },
    ],
    workExperience: [
      { company: "Shopee Malaysia", role: "Junior Software Engineer", location: "Johor Bahru, Johor", startYear: 2024, endYear: null, current: true, bulletPoints: [
        "Built and maintained React-based seller dashboard components used by 5K+ sellers",
        "Implemented REST API endpoints for order management features",
        "Wrote unit and integration tests achieving 85% code coverage",
        "Participated in agile ceremonies and contributed to sprint planning",
      ]},
    ],
    skills: [
      { name: "React", years: 1.5, category: "FRAMEWORK", relatedSkills: ["JavaScript", "TypeScript", "CSS"] },
      { name: "JavaScript", years: 1.5, category: "LANGUAGE", relatedSkills: ["React", "HTML", "CSS"] },
      { name: "TypeScript", years: 1, category: "LANGUAGE", relatedSkills: ["React", "JavaScript"] },
      { name: "Python", years: 1.5, category: "LANGUAGE", relatedSkills: ["SQL"] },
      { name: "SQL", years: 1, category: "DATABASE", relatedSkills: ["Python"] },
      { name: "Git", years: 1.5, category: "TOOL", relatedSkills: ["CI/CD"] },
      { name: "Node.js", years: 1, category: "FRAMEWORK", relatedSkills: ["JavaScript", "TypeScript", "REST APIs"] },
      { name: "CSS", years: 1.5, category: "LANGUAGE", relatedSkills: ["React", "HTML"] },
    ],
    projects: [
      { title: "Seller Order Management Portal", description: "Developed order management interface for Shopee sellers with real-time status updates.", technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"], skillsDemonstrated: ["React", "TypeScript", "JavaScript", "Node.js", "SQL"], responsibilities: ["Frontend development", "API integration", "Testing"] },
      { title: "Personal Expense Tracker", description: "Built a web app for tracking personal expenses with budget alerts and visual reports.", technologies: ["React", "Python", "Flask", "SQLite"], skillsDemonstrated: ["React", "Python", "SQL", "CSS"], responsibilities: ["Full-stack development", "UI design", "Database schema"] },
    ],
  },
  {
    email: "elena@demo.com",
    password: "password123",
    name: "Elena Wong Sook Ying",
    personalInfo: { headline: "Mid Fullstack Developer | React, Node.js, TypeScript", summary: "Fullstack developer with 4 years of experience building scalable web applications at Malaysian tech companies.", location: "Cyberjaya, Selangor, Malaysia", title: "Fullstack Developer" },
    education: [
      { institution: "Universiti Sains Malaysia (USM)", degree: "Bachelor of Computer Science", field: "Computer Science", startYear: 2017, endYear: 2021, gpa: 3.7 },
    ],
    workExperience: [
      { company: "Aerodyne Group", role: "Fullstack Developer", location: "Cyberjaya, Selangor", startYear: 2023, endYear: null, current: true, bulletPoints: [
        "Built drone fleet management dashboard serving 200+ enterprise clients across SEA",
        "Designed and implemented real-time telemetry visualization using WebSockets and D3.js",
        "Migrated legacy PHP backend to Node.js/TypeScript, reducing response times by 60%",
        "Mentored 2 junior developers through code reviews and pair programming",
      ]},
      { company: "StoreHub", role: "Software Developer", location: "Petaling Jaya, Selangor", startYear: 2021, endYear: 2023, current: false, bulletPoints: [
        "Developed POS system features using React and Node.js for 3K+ retail clients",
        "Built RESTful APIs for inventory management and payment integration",
        "Optimized database queries resulting in 40% improvement in report generation speed",
        "Wrote comprehensive documentation and integration tests for the API layer",
      ]},
    ],
    skills: [
      { name: "React", years: 4, category: "FRAMEWORK", relatedSkills: ["TypeScript", "JavaScript", "CSS"] },
      { name: "Node.js", years: 4, category: "FRAMEWORK", relatedSkills: ["TypeScript", "JavaScript", "REST APIs"] },
      { name: "TypeScript", years: 3, category: "LANGUAGE", relatedSkills: ["React", "Node.js"] },
      { name: "PostgreSQL", years: 3, category: "DATABASE", relatedSkills: ["SQL", "Node.js"] },
      { name: "Docker", years: 2, category: "TOOL", relatedSkills: ["CI/CD", "AWS"] },
      { name: "AWS", years: 2, category: "CLOUD", relatedSkills: ["Docker"] },
      { name: "Python", years: 2, category: "LANGUAGE", relatedSkills: ["PostgreSQL"] },
      { name: "CSS", years: 4, category: "LANGUAGE", relatedSkills: ["React", "HTML"] },
      { name: "Git", years: 4, category: "TOOL", relatedSkills: ["CI/CD"] },
      { name: "REST APIs", years: 4, category: "OTHER", relatedSkills: ["Node.js", "TypeScript"] },
      { name: "Testing", years: 2, category: "TOOL", relatedSkills: ["React", "Node.js"] },
      { name: "CI/CD", years: 2, category: "TOOL", relatedSkills: ["Docker", "Git"] },
    ],
    projects: [
      { title: "Drone Fleet Management Dashboard", description: "Real-time dashboard for monitoring drone fleets across SEA with live telemetry, mission planning, and reporting.", technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "WebSocket", "D3.js", "Docker"], skillsDemonstrated: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "CSS", "REST APIs"], responsibilities: ["Full-stack architecture", "Real-time data pipeline", "UI/UX implementation", "Deployment"] },
      { title: "POS System Modernization", description: "Led the migration of a legacy POS system to modern stack, improving performance and developer experience.", technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"], skillsDemonstrated: ["React", "Node.js", "TypeScript", "PostgreSQL", "CI/CD", "AWS"], responsibilities: ["Migration strategy", "Backend redesign", "Database optimization", "Team mentoring"] },
    ],
  },
];

function computeSimpleMatch(userSkills: string[], requiredSkills: { name: string; weight: number }[]): number {
  const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase()));
  let totalWeight = 0;
  let matchedWeight = 0;
  for (const rs of requiredSkills) {
    totalWeight += rs.weight;
    if (userSkillSet.has(rs.name.toLowerCase())) {
      matchedWeight += rs.weight;
    }
  }
  return totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
}

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const allRoles = await prisma.careerRole.findMany({ include: { requirements: true } });
  if (allRoles.length === 0) {
    console.log("No career roles found. Seed roles first.");
    return;
  }

  const existingUser = await prisma.user.findFirst({ where: { email: users[0].email } });
  if (existingUser) {
    console.log("Demo users already seeded, skipping.");
    return;
  }

  for (const u of users) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash: hashPassword(u.password),
        name: u.name,
        personalInfo: { create: u.personalInfo },
        education: { create: u.education.map((e) => ({
          institution: e.institution,
          degree: e.degree,
          field: e.field,
          startDate: new Date(e.startYear, 0, 1),
          endDate: new Date(e.endYear, 0, 1),
          gpa: e.gpa,
        }))},
        workExperience: { create: u.workExperience.map((w) => ({
          company: w.company,
          role: w.role,
          location: w.location,
          startDate: new Date(w.startYear, 0, 1),
          endDate: w.endYear ? new Date(w.endYear, 0, 1) : null,
          current: w.current,
          bulletPoints: w.bulletPoints,
        }))},
        projects: { create: u.projects.map((p) => ({
          title: p.title,
          description: p.description,
          technologies: p.technologies,
          skillsDemonstrated: p.skillsDemonstrated,
          responsibilities: p.responsibilities,
        }))},
        skills: { create: u.skills.map((s) => ({
          name: s.name,
          category: s.category as any,
          yearsOfExperience: s.years,
          confidenceScore: Math.min(1, s.years / 6),
          relatedSkills: s.relatedSkills,
        }))},
      },
    });

    const userSkills = u.skills.map((s) => s.name);
    const userExperiences = u.workExperience;

    for (const role of allRoles) {
      const requiredSkills = role.requirements.map((r: any) => ({ name: r.skillName, weight: r.weight }));
      const matchScore = computeSimpleMatch(userSkills, requiredSkills);

      const strengths = role.requirements
        .filter((r: any) => userSkills.some((us) => us.toLowerCase() === r.skillName.toLowerCase()))
        .map((r: any) => r.skillName);

      const linkedSkills = u.skills.filter((s) => strengths.some((st) => st.toLowerCase() === s.name.toLowerCase()));
      const partialMatches = u.projects
        .filter((p) => p.skillsDemonstrated.some((sd) => strengths.some((st) => st.toLowerCase() === sd.toLowerCase())))
        .map((p) => p.title);

      const evidenceStrength = linkedSkills.length > 0
        ? Math.round(linkedSkills.reduce((sum, s) => sum + Math.min(1, s.years / 4), 0) / linkedSkills.length * 25)
        : 0;
      const recencyScore = userExperiences.some((w) => w.current) ? 10 : 5;
      const projectDepth = linkedSkills.length > 0
        ? Math.round(linkedSkills.reduce((sum: number) => sum + Math.min(1, 1), 0) / linkedSkills.length * 20)
        : 0;
      const totalScore = Math.min(100, matchScore + evidenceStrength + recencyScore + projectDepth);

      await prisma.careerMatch.create({
        data: {
          userId: user.id,
          roleId: role.id,
          matchScore: totalScore,
          strengths,
          gaps: role.requirements
            .filter((r: any) => !userSkills.some((us) => us.toLowerCase() === r.skillName.toLowerCase()))
            .map((r: any) => r.skillName),
          partialMatches,
          breakdown: JSON.stringify({
            skillOverlap: { weight: 45, score: matchScore },
            evidenceStrength: { weight: 25, score: evidenceStrength },
            recency: { weight: 10, score: recencyScore },
            projectDepth: { weight: 20, score: projectDepth },
          }),
        },
      });
    }

    console.log(`Seeded user: ${u.name} (${u.email}) with ${u.skills.length} skills, ${u.projects.length} projects, ${allRoles.length} career matches`);
  }

  console.log(`Seeded ${users.length} demo users with full profiles and career matches.`);
}
