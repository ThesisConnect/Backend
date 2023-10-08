import { z } from 'zod'

export const createSchema = z.object({
  name: z.string(),
  parent: z.string(),
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

export const moveSchema = z.object({
  source: z.string(),
  old_parent: z.string(),
  destination: z.string(),
  source_type: z.enum(['file', 'folder']),
})

export type createSchema = z.infer<typeof createSchema>
export type editSchema = z.infer<typeof editSchema>
export type addFileSchema = z.infer<typeof addFileSchema>
