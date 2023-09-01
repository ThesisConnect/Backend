import { Document, Model, model, Schema } from "mongoose";
import { uuidv4 } from "@firebase/util";

export interface IPlan {
    _id: string;
    project_id: string;
    name: string;
    description: string;
    progress: number;
    start_date: Date;
    end_date: Date;
    task: boolean;
    chat_id?: string;
    folder_id?: string;
}

interface IPlanDocument extends IPlan, Document {
    _id: string;
}

type IPlanModel = Model<IPlanDocument>;
const planSchema = new Schema<IPlanDocument, IPlanDocument>({
    _id: {
        type: String,
        default: uuidv4(),
    },
    project_id: {
        type: String,
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
    },
    folder_id: {
        type: String,
    },
});

export default model<IPlanDocument, IPlanModel>("Plan", planSchema);
