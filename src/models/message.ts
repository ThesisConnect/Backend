import {
  Document,
  Model,
  model,
  Schema,
  SchemaTimestampsConfig,
} from 'mongoose'
import { uuidv4 } from '@firebase/util'

export interface IMessage {
  _id: string
  chat_id: string
  user_id: string
  content: string
  type: 'text' | 'file'
}

interface IMessageDocument extends IMessage, Document, SchemaTimestampsConfig {
  _id: string
}
const messageSchema = new Schema<IMessageDocument, IMessageDocument>({
  _id: {
    type: String,
    required: true,
  },
  chat_id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
})

export default model<IMessageDocument>('Message', messageSchema)
