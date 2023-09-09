import express from 'express'
import * as _ from 'lodash'
import File from '../models/file'
import { createSchema, editSchema } from '../schema/file'

const router = express.Router()

router.get('/:id', async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) {
      return res.status(400).send("Bad request");
    }
    const file = await File.findById(id)
    if (file) {
      return res.status(200).send(file)
    }
    return res.status(404).send("Not found")
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
    return res.status(500).send('Failed to create file')
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
    return res.status(404).send("Not found");
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) {
      return res.status(400).send("Bad request");
    }
    const result = await File.findByIdAndDelete(id)
    if (result) {
      return res.status(200).send(result)
    }
    return res.status(404).send("Not found");
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
