import {
  Document,
  Model,
  model,
  Schema,
  SchemaTimestampsConfig,
} from 'mongoose'
import { uuidv4 } from '@firebase/util'
import Chat from '../models/chat'
import Folder from '../models/folder'

export interface IPlan {
  _id: string
  project_id: string
  name: string
  description: string
  progress: number
  start_date: Date
  end_date: Date
  task: boolean
  chat_id?: string
  folder_id?: string
  archived: boolean
}

interface IPlanDocument extends IPlan, Document, SchemaTimestampsConfig {
  _id: string
}

type IPlanModel = Model<IPlanDocument>
const planSchema = new Schema<IPlanDocument, IPlanDocument>(
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
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    task: {
      type: Boolean,
      required: true,
    },
    chat_id: {
      type: String,
      ref: 'Chat',
    },
    folder_id: {
      type: String,
      ref: 'Folder',
    },
    archived: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
)

planSchema.pre("deleteOne", {document: true}, async function(next) {
  try {
    const chat = await Chat.findById(this.chat_id)
    if (chat) {
      await chat.deleteOne()
    }
    const folder = await Folder.findById(this.folder_id)
    if (folder) {
      await folder.deleteOne()
    }
    next()
  } catch (error) {
    console.log(error)
  }
});

export default model<IPlanDocument, IPlanModel>('Plan', planSchema)
