import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const publications = defineCollection({
  loader: file("src/data/publications.yaml"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number(),
    date: z.string(),
    role: z.enum(["first-author", "co-author"]),
    links: z.object({
      arxiv: z.string().default(""),
      doi: z.string().default(""),
      ads: z.string().default(""),
      pdf: z.string().default(""),
    }),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { publications, pages };
