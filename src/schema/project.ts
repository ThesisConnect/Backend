import { z } from "zod";

export const createSchema = z.object({
    name: z.string(),
    advisors: z.array(z.string()),
    co_advisors: z.array(z.string()),
    advisee: z.array(z.string()),
  })

export const editSchema = z.object({
    _id: z.string(),
    name: z.string().optional(),
    advisors: z.array(z.string()),
    co_advisors: z.array(z.string()),
    advisee: z.array(z.string()),
  })

export type createSchema = z.infer<typeof createSchema>
export type editSchema = z.infer<typeof editSchema>

  
