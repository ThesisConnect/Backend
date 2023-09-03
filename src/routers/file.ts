import express from 'express'
import * as _ from 'lodash'
import File from '../models/file'
import { createSchema } from '../schema/file'

const router = express.Router()

router.get('/data/:id', async (req, res) => {
  if (req.params.id) {
    const file = await File.findById(req.params.id)
    if (!file) {
      res.status(400).send({ found: false })
      return
    }
    const sentData = { ...file.toObject(), found: true }
    return res.status(200).send(_.omit(sentData, ['_id', '__v']))
  }
})

router.post('/create', async (req, res) => {
  const createData = createSchema.safeParse(req.body)
  if (!createData.success) {
    return res.status(400).send('Body not match')
  }
  // TODO: Upload createData.data.data to firebase and get url
  const result = await File.create({
    name: createData.data.name,
    url: 'https://firebasestorage.google',
    size: 1,
    type: 'pdf',
    memo: createData.data.memo,
  })
  if (result) {
    return res.status(200).send(result)
  } else {
    return res.status(400).send('Bad request')
  }
})

export default router
