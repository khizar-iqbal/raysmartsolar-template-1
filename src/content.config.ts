import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const learn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/learn' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** short label for cards, e.g. "Prices" */
    tag: z.string(),
    /** ISO date the content was written/last reviewed */
    updated: z.string(),
    /** minutes */
    readingTime: z.number(),
    /** photo key from src/assets/photos, e.g. "hw-macro" */
    cover: z.string(),
    /** ~160char answer to the money question, shown atop the article */
    tldr: z.string(),
  }),
});

export const collections = { learn };
