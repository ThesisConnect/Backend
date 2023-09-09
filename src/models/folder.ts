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
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: true,
    },
    parent: {
      type: String,
      ref: 'Folder',
      default: null,
    },
    child: {
      type: [String],
      ref: 'Folder',
      default: [],
    },
    files: {
      type: [String],
      ref: 'File',
      default: [],
    },
    shared: {
      type: [String],
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

export default model<IFolderDocument, IFolderModel>('Folder', folderSchema)
