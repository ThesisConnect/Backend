import {
  Document,
  Model,
  model,
  Schema,
  SchemaTimestampsConfig,
} from 'mongoose'
import { uuidv4 } from '@firebase/util'
import File from '../models/file'

export interface ISummary {
  _id: string
  project_id: string
  plan_id: string
  reciever_id: string
  sender_id: string
  comment: string
  progress: number
  files: string[]
  chat_id: string
}

interface ISummaryDocument extends ISummary, Document, SchemaTimestampsConfig {
  _id: string
}

type ISummaryModel = Model<ISummaryDocument>
const summarySchema = new Schema<ISummaryDocument, ISummaryDocument>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    project_id: {
      type: String,
      ref: 'Project',
      required: true,
    },
    plan_id: {
      type: String,
      ref: 'Plan',
      required: true,
    },
    reciever_id: {
      type: String,
      ref: 'User',
      required: true,
    },
    sender_id: {
      type: String,
      ref: 'User',
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
    files: {
      type: [String],
      ref: 'File',
      required: true,
    },
    chat_id: {
      type: String,
      ref: 'Chat',
      required: true,
    },
  },
  { timestamps: true },
)

summarySchema.pre('deleteOne', { document: true }, async function (next) {
  for (let file_id of this.files) {
    File.findByIdAndDelete(file_id)
  }
})

export default model<ISummaryDocument, ISummaryModel>('Summary', summarySchema)
