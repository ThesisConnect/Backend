import express from 'express'
import * as _ from 'lodash'
import Folder from '../models/folder'
import { createSchema, editSchema } from '../schema/folder'

const router = express.Router()

router.get('/data/:id', async (req, res) => {
  if (req.params.id) {
    const folder = await Folder.findById(req.params.id)
    if (!folder) {
      res.status(400).send({ found: false })
      return
    }
    const sentData = { ...folder.toObject(), found: true }
    return res.status(200).send(_.omit(sentData, ['_id', '__v']))
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
