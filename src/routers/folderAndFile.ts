import express from 'express'
import * as _ from 'lodash'
import File, { IFile } from '../models/file'
import Folder from '../models/folder'
import { createSchema, editSchema } from '../schema/file'
import { IFolder } from '../models/folder'

const router = express.Router()
//extra
router.get('/data/:folderId', async (req, res) => {
  try {
    const folderID: string = req.params.folderId
    const folder = await Folder.findById(folderID).populate<{files: IFile[], child: IFolder[]}>("files child")
    if (folder) {
      let {child, files} = folder
      child = child.map((child) => {
        return{
          ...child,
          type: "folder"
        }
      })
      files = files.map((file) => {
        return{
          ...file,
          type: "file"
        }
      })
      return res.status(200).send([...child, ...files])
  }

    return res.status(400).send("Folder not found")
  } catch (err) {
    console.log(err)
    return res.status(400).send('Bad request')
  }
})

export default router