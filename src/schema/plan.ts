import { z } from 'zod'

export const createSchema = z.object({
  project_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  task: z.boolean(),
})

export const editSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  progress: z.number(),
  start_date: z.string(),
  end_date: z.string(),
})

export type createSchema = z.infer<typeof createSchema>
export type editSchema = z.infer<typeof editSchema>
