import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
	schema: z.object({
		company: z.string(),
		role: z.string(),
		dateStart: z.date(),
		dateEnd: z.date().optional(),
		isCurrent: z.boolean().default(false),
		summary: z.string(),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		techStack: z.array(z.string()),
		link: z.string().url().optional(),
		github: z.string().url().optional(),
		year: z.number().int(),
	}),
});

export const collections = {
	work,
	projects,
};
