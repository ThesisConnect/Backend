import express from "express";
import * as _ from "lodash";
import Folder, { IFolder, IFolderDocument } from "../models/folder";
import { addFileSchema, createSchema, editSchema } from "../schema/folder";
import User, { IUser } from "../models/user";
import File, { IFile } from "../models/file";
import { uuidv4 } from "@firebase/util";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) {
      return res.status(400).send("Bad request");
    }
    const folder = await Folder.findById(id).populate<{ parent: IFolder, child: IFolder[], files: IFile[], shared: IUser[] }>("parent child files shared");
    if (folder) {
      return res.status(200).send(folder);
    }
    return res.status(404).send("Not found");
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/create", async (req, res) => {
  try {
    const createData = createSchema.safeParse(req.body);
    if (!createData.success) {
      return res.status(400).send("Body not match");
    }
    let parentFolder: IFolderDocument | null = null
    const parent = createData.data.parent
    if (parent) {
      parentFolder = await Folder.findById(parent)
      if (!parentFolder) {
        return res.status(404).send("Parent not found");
      }
    }
    const result = await Folder.create({
      name: createData.data.name,
      parent: createData.data.parent,
    });
    if (result) {
      if (parentFolder) {
        await parentFolder.updateOne({
          $addToSet: { child: result._id }
        })
      }
      return res.status(200).send(result);
    }
    return res.status(500).send('Failed to create folder')
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.put("/edit", async (req, res) => {
  try {
    const editData = editSchema.safeParse(req.body);
    if (!editData.success) {
      return res.status(400).send("Body not match");
    }
    const result = await Folder.findByIdAndUpdate(editData.data.id, {
      name: editData.data.name,
      shared: editData.data.shared
    });
    if (result) {
      return res.status(200).send(result);
    }
    return res.status(404).send("Not found");
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.put("/addFile", async (req, res) => {
  try {
    const addFileData = addFileSchema.safeParse(req.body);
    if (!addFileData.success) {
      return res.status(400).send("Body not match");
    }
    const result = await Folder.findByIdAndUpdate(addFileData.data.id, {
      $addToSet: { files: addFileData.data.files }
    });
    if (result) {
      return res.status(200).send(result);
    }
    return res.status(404).send("Not found");
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) {
      return res.status(400).send("Bad request");
    }
    const folder = await Folder.findById(id)
    const result = await folder?.deleteOne();
    if (result) {
      return res.status(200).send(result);
    }
    return res.status(404).send("Not found");
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
