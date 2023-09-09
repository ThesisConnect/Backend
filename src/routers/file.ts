import express from 'express'
import * as _ from 'lodash'
import File from '../models/file'
import { createSchema, editSchema } from '../schema/file'

const router = express.Router()

router.get('/data/:id', async (req, res) => {
  try {
    if (req.params.id) {
      const file = await File.findById(req.params.id)
      if (!file) {
        res.status(400).send({ found: false })
        return
      }
      const sentData = { ...file.toObject(), found: true }
      return res.status(200).send(_.omit(sentData, ['_id', '__v']))
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.post('/create', async (req, res) => {
  try {
    const createData = createSchema.safeParse(req.body)
    if (!createData.success) {
      return res.status(400).send('Body not match')
    }
    const result = await File.create({
      name: createData.data.name,
      url: createData.data.url,
      size: createData.data.size,
      type: createData.data.type,
      memo: createData.data.memo,
    })
    if (result) {
      return res.status(200).send(result)
    }
    return res.status(400).send('Bad request')
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.put('/edit', async (req, res) => {
  try {    
    const editData = editSchema.safeParse(req.body)
    if (!editData.success) {
      return res.status(400).send('Body not match')
    }
    const result = await File.findByIdAndUpdate(editData.data.id, {
      name: editData.data.name,
      memo: editData.data.memo,
    })
    if (result) {
      return res.status(200).send(result)
    }
    return res.status(400).send('Bad request')
  } catch (error) {
    return res.status(500).send(error)
  }  
})

router.delete('/delete/:id', async (req, res) => {
  try {  
    if (req.params.id) {
      const result = await File.findByIdAndDelete(req.params.id)
      if (!result) {
        return res.status(200).send(result)
      }
      return res.status(400).send('Bad request')
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
