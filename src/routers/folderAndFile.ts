import express from 'express'
import * as _ from 'lodash'
import File, { IFile } from '../models/file'
import Folder from '../models/folder'
import { createSchema, editSchema } from '../schema/file'
import { moveSchema } from '../schema/folder'
import { IFolder } from '../models/folder'

const router = express.Router()
//extra
router.get('/data/:folderId', async (req, res) => {
  try {
    const folderID: string = req.params.folderId
    const folder = await Folder.findById(folderID).populate<{
      files: IFile[]
      child: IFolder[]
    }>('files child')
    if (folder) {
      let { child, files } = folder
      child = child.map((child) => {
        return {
          ...child,
          type: 'folder',
        }
      })
      files = files.map((file) => {
        return {
          ...file,
          type: 'file',
        }
      })
      return res.status(200).send([...child, ...files])
    }

    return res.status(400).send('Folder not found')
  } catch (err) {
    console.log(err)
    return res.status(400).send('Bad request')
  }
})

router.put('/move', async (req, res) => {
  try {
    const moveData = moveSchema.safeParse(req.body)
    if (!moveData.success) {
      return res.status(400).send('Body not match')
    }

    if (moveData.data.source_type === 'file') {
      const result_1 = await Folder.findByIdAndUpdate(
        moveData.data.old_parent,
        {
          $pull: { files: moveData.data.source },
        },
      )
      const result_2 = await Folder.findByIdAndUpdate(
        moveData.data.destination,
        {
          $addToSet: { files: moveData.data.source },
        },
      )
      if (result_1 && result_2) {
        return res.status(200).send('OK')
      }
      return res.status(404).send('Not found')
    } else if (moveData.data.source_type === 'folder') {
      const result_1 = await Folder.findByIdAndUpdate(moveData.data.source, {
        parent: moveData.data.destination,
      })
      const result_2 = await Folder.findByIdAndUpdate(
        moveData.data.old_parent,
        {
          $pull: { child: moveData.data.source },
        },
      )
      const result_3 = await Folder.findByIdAndUpdate(
        moveData.data.destination,
        {
          $addToSet: { child: moveData.data.source },
        },
      )
      if (result_1 && result_2 && result_3) {
        return res.status(200).send('OK')
      }
      return res.status(404).send('Not found')
    } else {
      return res.status(400).send('Bad request')
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
