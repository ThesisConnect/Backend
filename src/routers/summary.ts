import express from 'express'
import * as _ from 'lodash'
import Summary from '../models/summary'
import { createSchema } from '../schema/summary'

const router = express.Router()

router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send('Bad request')
    }
    const summary = await Summary.findById(req.params.id)
    if (!summary) {
      return res.status(404).send('Summary not found')
    }
    const sentData = { ...summary.toObject(), found: true }
    return res.status(200).send(_.omit(sentData, ['_id', '__v']))
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
    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router

/*
Test case
GET: http://localhost:8080/summary/data/55e99b38-b79e-4f18-803b-91329049188f
CREATE: http://localhost:8080/summary/create
{
   "project_id": "1",
   "plan_id": "2",
   "reciever_id": "4",
   "sender_id": "5",
   "comment": "jj",
   "file_id": ["a", "q"],
   "progress": 99
}
*/
