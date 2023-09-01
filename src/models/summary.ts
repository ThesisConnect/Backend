import { Document, Model, model, Schema } from 'mongoose'
import { uuidv4 } from '@firebase/util'

export interface ISummary {
  _id: string
  project_id: string
  plan_id: string
  reciever_id: string
  sender_id: string
  comment: string
  progress: number
  file_id: string[]
}

interface ISummaryDocument extends ISummary, Document {
  _id: string
}

type ISummaryModel = Model<ISummaryDocument>
const summarySchema = new Schema<ISummaryDocument, ISummaryDocument>({
  _id: {
    type: String,
    default: uuidv4(),
  },
  project_id: {
    type: String,
    required: true,
  },
  plan_id: {
    type: String,
    required: true,
  },
  reciever_id: {
    type: String,
    required: true,
  },
  sender_id: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
  file_id: {
    type: [String],
    required: true,
  },
})

export default model<ISummaryDocument, ISummaryModel>('Summary', summarySchema)
