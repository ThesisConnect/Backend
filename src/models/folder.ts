import {
  Document,
  Model,
  model,
  Schema,
  SchemaTimestampsConfig,
} from 'mongoose'
import { uuidv4 } from '@firebase/util'

export interface IFolder {
  _id: string
  name: string
  parent?: string
  child: string[]
  files: string[]
  shared: string[]
}

interface IFolderDocument extends IFolder, Document, SchemaTimestampsConfig {
  _id: string
}

type IFolderModel = Model<IFolderDocument>
const folderSchema = new Schema<IFolderDocument, IFolderDocument>(
  {
    _id: {
      type: String,
      default: uuidv4(),
    },
    name: {
      type: String,
      required: true,
    },
    parent: {
      type: String,
      default: null,
      required: true,
    },
    child: {
      type: [String],
      default: [],
    },
    files: {
      type: [String],
      default: [],
    },
    shared: {
      type: [String],
    },
  },
  { timestamps: true },
)

export default model<IFolderDocument, IFolderModel>('Folder', folderSchema)
