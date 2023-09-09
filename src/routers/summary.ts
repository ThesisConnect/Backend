import express from 'express'
import * as _ from 'lodash'
import Summary from '../models/summary'
import { createSchema } from '../schema/summary'

const router = express.Router()

router.get('/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const summary = await Summary.findById(id)
    if (summary) {
      return res.status(200).send(summary)
    }

    return res.status(404).send('Not found')
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

    const result = await Summary.create({
      project_id: createData.data.project_id,
      plan_id: createData.data.plan_id,
      reciever_id: createData.data.reciever_id,
      sender_id: createData.data.sender_id,
      comment: createData.data.comment,
      file_id: createData.data.file_id,
      chat_id: createData.data.chat_id,
      progress: createData.data.progress,
    })

    if (result) {
      return res.status(200).send(result)
    }

    return res.status(500).send('Failed to create summary')
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
