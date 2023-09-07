import express from 'express'
import * as _ from 'lodash'
import Folder from '../models/folder'
import { createSchema, editSchema } from '../schema/folder'
import User from '../models/user'
import File from '../models/file'

const router = express.Router()

router.get('/data/:id', async (req, res) => {
  if (req.params.id) {
    const folder = await Folder.findById(req.params.id)
    if (!folder) {
      res.status(400).send({ found: false })
      return
    }
    const data = {
      id: folder._id,
      name: folder.name,
      parent: folder.parent,
      child: folder.child,
      files: await Promise.all(
        folder.files.map(async (id) => {
          const file = await File.findById(id)
          if (!file) {
            return
          }
          return {
            id: file._id,
            name: file.name,
            url: file.url,
            size: file.size,
            type: file.fileType,
            memo: file.memo,
          }
        }),
      ),
      shared: await Promise.all(
        folder.shared.map(async (id) => {
          const user = await User.findById(id)
          if (!user) {
            return
          }
          return {
            id: user._id,
            name: user.name,
            surname: user.surname,
            avatar: user.avatar,
          }
        }),
      ),
      date_modified: folder.updatedAt,
    }
    return res.status(200).send(data)
  }
})

router.post('/create', async (req, res) => {
  const uid = req.user?.uid
  if (!uid) {
    return res.status(400).send('Bad request')
  }
  const createData = createSchema.safeParse(req.body)
  if (!createData.success) {
    return res.status(400).send('Body not match')
  }
  const result = await Folder.create({
    name: createData.data.name,
    shared: [uid],
  })
  if (result) {
    return res.status(200).send(result)
  }
  return res.status(400).send('Bad request')
})

router.put('/edit', async (req, res) => {
  const editData = editSchema.safeParse(req.body)
  if (!editData.success) {
    return res.status(400).send('Body not match')
  }
  const result = await Folder.findByIdAndUpdate(editData.data.id, {
    name: editData.data.name,
    shared: editData.data.shared,
  })
  if (result) {
    return res.status(200).send(result)
  }
  return res.status(400).send('Bad request')
})

router.delete('/delete/:id', async (req, res) => {
  if (req.params.id) {
    const result = await Folder.findByIdAndDelete(req.params.id)
    if (result) {
      return res.status(200).send(result)
    }
    return res.status(400).send('Bad request')
  }
})

export default router
