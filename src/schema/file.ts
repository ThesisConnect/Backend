import { z } from 'zod'

export const createSchema = z.object({
  name: z.string(),
  data: z.string(),
  memo: z.string().optional(),
})

export type createSchema = z.infer<typeof createSchema>
