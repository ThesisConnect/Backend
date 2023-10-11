import { z } from 'zod'

export const createSchema = z.object({
  project_id: z.string(),
  plan_id: z.string(),
  reciever_id: z.string(),
  sender_id: z.string(),
  comment: z.string(),
  files: z.array(z.string()),
  chat_id: z.string(),
  status: z.enum(['pending', 'approve', 'reject', 'completed']),
  progress: z.number(),
})

export const editSchema = z.object({
  project_id: z.string(),
  id: z.string(),
  comment: z.string().optional(),
  status: z.enum(['pending', 'approve', 'reject', 'completed']),
  progress: z.number(),
  files: z.array(z.string()).optional(),
})

export type createSchema = z.infer<typeof createSchema>
export type editSchema = z.infer<typeof editSchema>
