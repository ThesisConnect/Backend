import { z } from 'zod'

export const createSchema = z.object({
  name: z.string(),
})

export const editSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  shared: z.array(z.string()).optional(),
})

export type createSchema = z.infer<typeof createSchema>
export type editSchema = z.infer<typeof editSchema>
