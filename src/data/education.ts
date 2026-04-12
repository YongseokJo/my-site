export interface EducationEntry {
  period: string;
  title: string;
  institution: string;
  type: "position" | "education" | "award";
}

export const educationEntries: EducationEntry[] = [
  {
    period: "2023 - Present",
    title: "Postdoctoral Fellow",
    institution: "SkAI Institute, University of Chicago",
    type: "position",
  },
  {
    period: "2018 - 2023",
    title: "Ph.D. in Astronomy",
    institution: "Columbia University",
    type: "education",
  },
  {
    period: "2014 - 2018",
    title: "B.S. in Physics & Astronomy",
    institution: "Seoul National University",
    type: "education",
  },
];
