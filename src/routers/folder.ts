import express from "express";
import * as _ from "lodash";
import Folder, { IFolder } from "../models/folder";
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
    const result = await Folder.create({
      name: createData.data.name,
    });
    if (result) {
      return res.status(200).send(result);
    }
    return res.status(400).send("Bad request");
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
    const result = await Folder.findByIdAndDelete(id);
    if (result) {
      return res.status(200).send(result);
    }
    return res.status(404).send("Not found");
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
