import { z } from 'zod'

export const createSchema = z.object({
  name: z.string(),
  parent: z.string().optional(),
})

export const editSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  shared: z.array(z.string()).optional(),
})

export const addFileSchema = z.object({
  id: z.string(),
  files: z.array(z.string()),
})

export type createSchema = z.infer<typeof createSchema>
export type editSchema = z.infer<typeof editSchema>
export type addFileSchema = z.infer<typeof addFileSchema>
