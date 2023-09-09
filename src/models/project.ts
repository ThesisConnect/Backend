import {
  Document,
  Model,
  model,
  Schema,
  SchemaTimestampsConfig,
} from 'mongoose'
import { uuidv4 } from '@firebase/util'

export interface IStatus {
  id: number
  name: string
  order: number
}

export interface IProject {
  _id: string
  name: string
  progress: number
  status: IStatus
  advisors: string[]
  co_advisors: string[]
  advisee: string[]
  chat_id: string
  folder_id: string
}

interface IProjectDocument extends IProject, Document, SchemaTimestampsConfig {
  _id: string
}

type IProjectModel = Model<IProjectDocument>
const projectSchema = new Schema<IProjectDocument, IProjectDocument>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      required: true,
    },
    status: {
      id: {
        type: Number,
        default: 1,
        required: true,
      },
      name: {
        type: String,
        default: 'Proposal',
        required: true,
      },
      order: {
        type: Number,
        default: 1,
        required: true,
      },
    },
    advisors: {
      type: [String],
      required: true,
    },
    co_advisors: {
      type: [String],
      required: true,
    },
    advisee: {
      type: [String],
      required: true,
    },
    chat_id: {
      type: String,
      required: true,
    },
    folder_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

export default model<IProjectDocument, IProjectModel>('Project', projectSchema)
