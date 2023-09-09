import {
  Document,
  Model,
  model,
  Schema,
  SchemaTimestampsConfig,
} from 'mongoose'
import { uuidv4 } from '@firebase/util'
import { IFileDocument } from './file'

export interface IFolder {
  _id: string
  name: string
  parent?: string
  child: string[] | IFolderDocument[]
  files: string[] | IFileDocument[]
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
      default: null,
      required: true,
    },
    child: [
      {
        type: String,
        ref: 'Folder',
      },
    ],
    files: [
      {
        type: String,
        ref: 'File',
      },
    ],
    shared: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
)

export default model<IFolderDocument, IFolderModel>('Folder', folderSchema)
