import express from 'express'
import * as _ from 'lodash'
import File from '../models/file'
import Folder from '../models/folder'
import { createSchema, editSchema } from '../schema/file'

const router = express.Router()
//extra
router.get('/data/:folderId', async (req, res) => {
  try {
    const folderID: string = req.params.folderId
    const folder = await Folder.findById(folderID).populate("files child")
    if (folder) {
      const {child, files} = folder
      return res.status(200).send([...child, ...files])
    }
    return res.status(400).send("Folder not found")
  } catch (err) {
    console.log(err)
    return res.status(400).send('Bad request')
  }
})

export default router