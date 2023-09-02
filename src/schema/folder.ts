import { z } from 'zod'

export const createSchema = z.object({
  name: z.string(),
})

export type createSchema = z.infer<typeof createSchema>
