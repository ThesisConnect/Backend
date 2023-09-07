import express from 'express'
import * as _ from 'lodash'
import File from '../models/file'
import Folder from '../models/folder'
import { createSchema, editSchema } from '../schema/file'

const router = express.Router()
//extra
router.post('/data/list', async (req, res) => {
  try {
    const folderAndFileID: string[] | undefined = req.body.folderAndFileID
    if (folderAndFileID) {
      const folder = await Folder.find({ _id: { $in: folderAndFileID } })
      const files = await File.find({ _id: { $in: folderAndFileID } })
      const data = [...folder, ...files]
      if (folder || files) {
        return res.status(200).send(data)
      }
      return res.status(400).send('Not found')
    }
  } catch (err) {
    console.log(err)
    return res.status(400).send('Bad request')
  }
})

export default router