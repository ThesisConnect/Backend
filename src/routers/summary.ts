import express from 'express'
import * as _ from 'lodash'
import Summary from '../models/summary'
import { createSchema } from '../schema/summary'

const router = express.Router()

router.get('/data/:id', async (req, res) => {
  if (req.params.id) {
    const summary = await Summary.findById(req.params.id)
    if (!summary) {
      res.status(400).send({ found: false })
      return
    }
    const sentData = { ...summary.toObject(), found: true }
    return res.status(200).send(_.omit(sentData, ['_id', '__v']))
  }
})

router.post('/create', async (req, res) => {
  const createData = createSchema.safeParse(req.body)
  if (!createData.success) {
    return res.status(400).send('Bad request')
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
  } else {
    return res.status(400).send('Bad request')
  }
})

export default router
