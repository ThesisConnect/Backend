import express from "express";
import * as _ from "lodash";
import Folder, { IFolder } from "../models/folder";
import { createSchema, editSchema } from "../schema/folder";
import User, { IUser } from "../models/user";
import File, { IFile } from "../models/file";
import { uuidv4 } from "@firebase/util";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    if (req.params.id) {
      const folder = await Folder.findById(req.params.id).populate<{ parent: IFolder, child: IFolder[], files: IFile[], shared: IUser[] }>("parent child files shared");
      if (!folder) {
        res.status(400).send({ found: false });
        return;
      }
      return res.status(200).send(folder);
    }
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
      shared: [uuidv4()]
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
    return res.status(400).send("Bad request");
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    if (req.params.id) {
      const folder = await Folder.findById(req.params.id)
      const result = await folder?.deleteOne();
      if (result) {
        return res.status(200).send(result);
      }
      return res.status(400).send("Bad request");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
