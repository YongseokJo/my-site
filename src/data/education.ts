export interface EducationEntry {
  period: string;
  title: string;
  institution: string;
  type: "position" | "education" | "award";
}

export const educationEntries: EducationEntry[] = [
  {
    period: "2025 - Present",
    title: "Postdoctoral Fellow",
    institution: "SkAI Institute/CIERA",
    type: "position",
  },
  {
    period: "2022 - 2025",
    title: "Postdoctoral Fellow",
    institution: "Flatiron Institute/Columbia University",
    type: "position",
  },
  {
    period: "2018 - 2022",
    title: "Ph.D. candidate in Astrophysics",
    institution: "Seoul National University",
    type: "education",
  },
  {
    period: "2014 - 2018",
    title: "Ph.D. candidate in Condensed Matter Physics",
    institution: "Seoul National University",
    type: "education",
  },
];
