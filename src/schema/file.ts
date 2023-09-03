import { z } from 'zod'

export const createSchema = z.object({
  name: z.string(),
  url: z.string(),
  size: z.number(),
  type: z.string(),
  memo: z.string().optional(),
})

export type createSchema = z.infer<typeof createSchema>
