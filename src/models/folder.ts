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
    parent: string
    child: string[]
    files: string[]
    shared: string[]
    creatAt: string
    updateAt: string
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
            required: true,
        },
        child: {
            type: [String],
            required: true,
        },
        files: {
            type: [String],
            required: true,
        },
        shared: {
            type: [String],
            required: true,
        },
        creatAt: {
            type: String,
            required: true,
        },
        updateAt: {
            type: String,
            required: true,
        }
    },
    { timestamps: true },
  )
  
  export default model<IFolderDocument, IFolderModel>('Folder', folderSchema)
  