import { prisma } from "$lib/server";
import type { PersonalInfo, Education, WorkExperience, Project, Skill } from "$generated/prisma/client";

interface CVData {
  name: string;
  email: string;
  personalInfo: PersonalInfo | null;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
}

function scoreRelevance(item: { bulletPoints?: string[]; description?: string | null; technologies?: string[]; skillsDemonstrated?: string[] }, jobSkills: string[]): number {
  const text = [
    ...(item.description?.toLowerCase() || ""),
    ...(item.bulletPoints || []).join(" ").toLowerCase(),
    ...(item.technologies || []).join(" ").toLowerCase(),
    ...(item.skillsDemonstrated || []).join(" ").toLowerCase(),
  ].join(" ");
  return jobSkills.reduce((score, skill) => score + (text.includes(skill.toLowerCase()) ? 1 : 0), 0);
}

function getStyle(jobCategory: string): "professional" | "creative" {
  return jobCategory === "DESIGN" ? "creative" : "professional";
}

const COMMON_RESET = `@page { margin: 0; size: letter; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-size: 10pt; line-height: 1.45; color: #1e293b; background: #fff; padding: 48px 52px; }
h1, h2, h3, h4, p, ul { margin: 0; padding: 0; }
ul { list-style: none; padding: 0; }
li { padding: 0; margin: 0; }`;

const PROFESSIONAL_CSS = `${COMMON_RESET}
body { font-family: 'Times New Roman', Georgia, serif; }
.header { margin-bottom: 22px; }
.header h1 { font-size: 20pt; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.header .title { font-size: 11pt; color: #475569; margin-bottom: 6px; }
.header .contact { font-size: 9.5pt; color: #64748b; }
.header .contact span { margin-right: 12px; }
.hr { border: none; border-top: 1px solid #cbd5e1; margin-bottom: 16px; }
.section { margin-bottom: 18px; }
.section h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 10px; }
.entry { margin-bottom: 14px; }
.entry-header { margin-bottom: 1px; }
.entry-header .title-row { font-weight: 700; font-size: 10.5pt; color: #0f172a; }
.entry-header .date { font-size: 9pt; color: #64748b; font-weight: 400; }
.entry .sub { font-size: 9.5pt; color: #475569; }
.entry p { font-size: 9.5pt; color: #475569; margin-top: 2px; }
.entry ul { margin-top: 2px; }
.entry ul li { font-size: 9.5pt; color: #475569; padding-left: 14px; text-indent: -14px; margin-left: 14px; }
.skills-list { margin-top: 2px; }
.skills-list span { font-size: 9.5pt; color: #334155; }
.summary { font-size: 9.5pt; color: #475569; margin-bottom: 14px; }
.project-tech { font-size: 9pt; color: #64748b; margin-top: 1px; }`;

function professionalTemplate(cv: CVData, jobTitle: string, company: string, jobSkills: string[]): string {
  const p = cv.personalInfo;
  const sortedWork = [...cv.workExperience].sort((a, b) => scoreRelevance(b, jobSkills) - scoreRelevance(a, jobSkills));
  const sortedProjects = [...cv.projects].sort((a, b) => scoreRelevance(b, jobSkills) - scoreRelevance(a, jobSkills));
  const relevantSkills = cv.skills.filter(s => jobSkills.some(js => s.name.toLowerCase() === js.toLowerCase()));

  return `<html><head><meta charset="UTF-8"><style>${PROFESSIONAL_CSS}</style></head><body>
<div class="header">
  <h1>${esc(cv.name)}</h1>
  <div class="title">${esc(p?.title || jobTitle + " at " + company)}</div>
  <div class="contact">
    ${cv.email ? `<span>${esc(cv.email)}</span>` : ""}${p?.phone ? `<span>${esc(p.phone)}</span>` : ""}${p?.location ? `<span>${esc(p.location)}</span>` : ""}${p?.website ? `<span>${esc(p.website)}</span>` : ""}
  </div>
</div>
<hr class="hr">

${p?.summary ? `<p class="summary">${esc(p.summary)}</p>` : ""}

${sortedWork.length ? `<div class="section"><h2>Experience</h2>${sortedWork.map(w => `<div class="entry">
  <div class="entry-header">
    <div class="title-row">${esc(w.role)} — ${esc(w.company)}${w.location ? `, ${esc(w.location)}` : ""}</div>
    <div class="date">${fmtDate(w.startDate)} \u2013 ${w.current ? "Present" : fmtDate(w.endDate)}</div>
  </div>
  ${w.description ? `<p>${esc(w.description)}</p>` : ""}
  ${w.bulletPoints?.length ? `<ul>${w.bulletPoints.map(b => `<li>\u2022 ${esc(b)}</li>`).join("")}</ul>` : ""}
</div>`).join("")}</div>` : ""}

${sortedProjects.length ? `<div class="section"><h2>Projects</h2>${sortedProjects.map(proj => `<div class="entry">
  <div class="entry-header">
    <div class="title-row">${esc(proj.title)}${proj.duration ? ` <span class="date">(${esc(proj.duration)})</span>` : ""}</div>
    ${proj.role ? `<div class="sub">${esc(proj.role)}</div>` : ""}
  </div>
  ${proj.description ? `<p>${esc(proj.description)}</p>` : ""}
  ${proj.technologies?.length ? `<div class="project-tech">Technologies: ${proj.technologies.map(t => esc(t)).join(", ")}</div>` : ""}
  ${proj.responsibilities?.length ? `<ul>${proj.responsibilities.map(r => `<li>\u2022 ${esc(r)}</li>`).join("")}</ul>` : ""}
</div>`).join("")}</div>` : ""}

${cv.education.length ? `<div class="section"><h2>Education</h2>${cv.education.map(e => `<div class="entry">
  <div class="entry-header">
    <div class="title-row">${esc(e.degree)} in ${esc(e.field)}</div>
    <div class="date">${fmtDate(e.startDate)} \u2013 ${e.endDate ? fmtDate(e.endDate) : "Present"}</div>
  </div>
  <div class="sub">${esc(e.institution)}${e.gpa ? ` \u2014 GPA: ${e.gpa.toFixed(2)}` : ""}</div>
</div>`).join("")}</div>` : ""}

${relevantSkills.length ? `<div class="section"><h2>Skills</h2><div class="skills-list">${relevantSkills.map(s => `<span>${esc(s.name)}</span>`).join(", ")}</div></div>` : ""}
</body></html>`;
}

const CREATIVE_CSS = `${COMMON_RESET}
body { font-family: Arial, 'Helvetica Neue', sans-serif; }
.header-bar { background: #1e1b4b; margin: -48px -52px 24px -52px; padding: 36px 52px 28px; color: #fff; }
.header-bar h1 { font-size: 22pt; font-weight: 700; margin-bottom: 2px; }
.header-bar .title { font-size: 11pt; color: #a5b4fc; margin-bottom: 6px; }
.header-bar .contact { font-size: 9pt; color: #c7d2fe; }
.header-bar .contact span { margin-right: 16px; }
.section { margin-bottom: 18px; }
.section h2 { font-size: 11pt; font-weight: 700; color: #4338ca; border-bottom: 1.5px solid #e0e7ff; padding-bottom: 3px; margin-bottom: 10px; }
.entry { margin-bottom: 14px; }
.entry-header { margin-bottom: 1px; }
.entry-header .title-row { font-weight: 700; font-size: 10.5pt; color: #0f172a; }
.entry-header .date { font-size: 9pt; color: #6366f1; font-weight: 500; }
.entry .sub { font-size: 9.5pt; color: #475569; }
.entry p { font-size: 9.5pt; color: #475569; margin-top: 2px; }
.entry ul { margin-top: 2px; }
.entry ul li { font-size: 9.5pt; color: #475569; padding-left: 14px; text-indent: -14px; margin-left: 14px; }
.skills-list { margin-top: 2px; }
.skills-list span { display: inline-block; background: #eef2ff; color: #4338ca; padding: 1px 10px; border-radius: 3px; font-size: 9pt; margin: 1px 2px; }
.summary { font-size: 9.5pt; color: #475569; margin-bottom: 14px; }
.project-tech { font-size: 9pt; color: #6366f1; margin-top: 1px; }`;

function creativeTemplate(cv: CVData, jobTitle: string, company: string, jobSkills: string[]): string {
  const p = cv.personalInfo;
  const sortedWork = [...cv.workExperience].sort((a, b) => scoreRelevance(b, jobSkills) - scoreRelevance(a, jobSkills));
  const sortedProjects = [...cv.projects].sort((a, b) => scoreRelevance(b, jobSkills) - scoreRelevance(a, jobSkills));
  const relevantSkills = cv.skills.filter(s => jobSkills.some(js => s.name.toLowerCase() === js.toLowerCase()));

  return `<html><head><meta charset="UTF-8"><style>${CREATIVE_CSS}</style></head><body>
<div class="header-bar">
  <h1>${esc(cv.name)}</h1>
  <div class="title">${esc(p?.title || jobTitle)}</div>
  <div class="contact">
    ${cv.email ? `<span>${esc(cv.email)}</span>` : ""}${p?.phone ? `<span>${esc(p.phone)}</span>` : ""}${p?.location ? `<span>${esc(p.location)}</span>` : ""}${p?.website ? `<span>${esc(p.website)}</span>` : ""}
  </div>
</div>

${p?.summary ? `<p class="summary">${esc(p.summary)}</p>` : ""}

${relevantSkills.length ? `<div class="section"><h2>Skills</h2><div class="skills-list">${relevantSkills.map(s => `<span>${esc(s.name)}</span>`).join("")}</div></div>` : ""}

${sortedWork.length ? `<div class="section"><h2>Experience</h2>${sortedWork.map(w => `<div class="entry">
  <div class="entry-header">
    <div class="title-row">${esc(w.role)} — ${esc(w.company)}${w.location ? `, ${esc(w.location)}` : ""}</div>
    <div class="date">${fmtDate(w.startDate)} \u2013 ${w.current ? "Present" : fmtDate(w.endDate)}</div>
  </div>
  ${w.description ? `<p>${esc(w.description)}</p>` : ""}
  ${w.bulletPoints?.length ? `<ul>${w.bulletPoints.map(b => `<li>\u2022 ${esc(b)}</li>`).join("")}</ul>` : ""}
</div>`).join("")}</div>` : ""}

${sortedProjects.length ? `<div class="section"><h2>Projects</h2>${sortedProjects.map(proj => `<div class="entry">
  <div class="entry-header">
    <div class="title-row">${esc(proj.title)}${proj.duration ? ` <span class="date">(${esc(proj.duration)})</span>` : ""}</div>
    ${proj.role ? `<div class="sub">${esc(proj.role)}</div>` : ""}
  </div>
  ${proj.description ? `<p>${esc(proj.description)}</p>` : ""}
  ${proj.technologies?.length ? `<div class="project-tech">Technologies: ${proj.technologies.map(t => esc(t)).join(", ")}</div>` : ""}
  ${proj.responsibilities?.length ? `<ul>${proj.responsibilities.map(r => `<li>\u2022 ${esc(r)}</li>`).join("")}</ul>` : ""}
</div>`).join("")}</div>` : ""}

${cv.education.length ? `<div class="section"><h2>Education</h2>${cv.education.map(e => `<div class="entry">
  <div class="entry-header">
    <div class="title-row">${esc(e.degree)} in ${esc(e.field)}</div>
    <div class="date">${fmtDate(e.startDate)} \u2013 ${e.endDate ? fmtDate(e.endDate) : "Present"}</div>
  </div>
  <div class="sub">${esc(e.institution)}${e.gpa ? ` \u2014 GPA: ${e.gpa.toFixed(2)}` : ""}</div>
</div>`).join("")}</div>` : ""}
</body></html>`;
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s.replace(/[&<>"']/g, c => map[c] || c);
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export async function generateResumeHtml(userId: string, jobId: string): Promise<{ html: string; style: string } | null> {
  const [job, user] = await Promise.all([
    prisma.job.findUnique({ where: { id: jobId } }),
    prisma.user.findUnique({ where: { id: userId }, include: { personalInfo: true } }),
  ]);

  if (!job || !user) return null;
  const personalInfo = user.personalInfo;

  const [education, workExperience, projects, skills] = await Promise.all([
    prisma.education.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
    prisma.workExperience.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
    prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.skill.findMany({ where: { userId } }),
  ]);

  const cvData: CVData = { name: user.name || "", email: user.email || "", personalInfo, education, workExperience, projects, skills };
  const style = getStyle(job.category);
  const html = style === "professional"
    ? professionalTemplate(cvData, job.title, job.company, job.skills)
    : creativeTemplate(cvData, job.title, job.company, job.skills);

  return { html, style };
}
