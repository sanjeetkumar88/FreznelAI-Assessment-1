import { z } from 'zod';

export const taskQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['name', 'cpu', 'memory']).default('cpu'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;
