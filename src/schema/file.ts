import { z } from 'zod'

export const createSchema = z.object({
  folder_id: z.string(),
  files: z.array(z.object({
    _id: z.string(),
    name: z.string(),
    url: z.string(),
    size: z.number(),
    file_type: z.string(),
    memo: z.string().optional(),
  })),
})

export const editSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  memo: z.string().optional(),
})

export type createSchema = z.infer<typeof createSchema>
export type editSchema = z.infer<typeof editSchema>
