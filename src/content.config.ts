import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_NAMES } from './consts';
import { PROJECT_SLUGS } from './data/projects';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			// 글의 대표 분야 하나 (About 같은 고정 페이지는 생략 가능)
			category: z.enum(CATEGORY_NAMES).optional(),
			// 이 글이 속한 프로젝트와 그 안에서의 순서(1편, 2편)
			project: z.enum(PROJECT_SLUGS).optional(),
			part: z.number().int().positive().optional(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

export const collections = { blog };
