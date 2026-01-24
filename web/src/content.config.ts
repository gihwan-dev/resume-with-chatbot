import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const basics = defineCollection({
  loader: glob({ pattern: "profile.json", base: "./src/content/basics" }),
  schema: z.object({
    name: z.string(),
    label: z.string(),
    email: z.string(),
    url: z.string().url().optional(),
    summary: z.string(),
    profiles: z.array(
      z.object({
        network: z.string(),
        username: z.string(),
        url: z.string().url(),
      })
    ),
  }),
})

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.coerce.date().optional(),
    isCurrent: z.boolean().default(false),
    location: z.string().optional(),
    summary: z.string(),
  }),
})

const education = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/education" }),
  schema: z.object({
    institution: z.string(),
    area: z.string(),
    studyType: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.coerce.date().optional(),
    score: z.string().optional(),
  }),
})

const certificates = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/certificates" }),
  schema: z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.coerce.date(),
  }),
})

const awards = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/awards" }),
  schema: z.object({
    title: z.string(),
    issuer: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    company: z.string().optional(), // Link to work history
    description: z.string(),
    techStack: z.array(z.string()),
    link: z.string().url().optional(),
    github: z.string().url().optional(),
    dateStart: z.coerce.date(),
    dateEnd: z.coerce.date().optional(),
  }),
})

export const collections = {
  basics,
  work,
  education,
  certificates,
  awards,
  projects,
}
