import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const companyIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "companyId must be kebab-case")

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
        url: z.string().url(),
      })
    ),
  }),
})

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: z.object({
    companyId: companyIdSchema,
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.coerce.date().optional(),
    isCurrent: z.boolean().default(false),
    highlights: z.array(z.string().min(1)).optional(),
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
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z
    .object({
      companyId: companyIdSchema,
      title: z.string(),
      techStack: z.array(z.string()),
      dateStart: z.coerce.date(),
      priority: z.number(),
    })
    .strict(),
})

const skills = defineCollection({
  loader: glob({ pattern: "skills.json", base: "./src/content/skills" }),
  schema: z.object({
    categories: z.array(
      z.object({
        name: z.string(),
        items: z.array(z.string()),
      })
    ),
  }),
})

export const collections = {
  basics,
  work,
  education,
  certificates,
  awards,
  projects,
  skills,
}
