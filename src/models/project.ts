import {Document, Model, model, Schema} from "mongoose";
import {uuidv4} from "@firebase/util";

export interface IStatus {
  id: number;
  name: string;
  order: number;
}

export interface IProject {
  _id: string;
  name: string;
  progress: number;
  status: IStatus;
  advisors: string[];
  advisee: string[];
  chat_id: string
}

interface IProjectDocument extends IProject, Document {
  _id: string;
}

type IProjectModel = Model<IProjectDocument>;
const projectSchema = new Schema<IProjectDocument, IProjectDocument>(
  {
    _id: {
      type: String,
      default: uuidv4(),
    },
    name: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    status: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      order: {
        type: Number,
        required: true,
      },
    },
    advisors: {
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
    }
  }
)

export default model<IProjectDocument, IProjectModel>('Project', projectSchema);