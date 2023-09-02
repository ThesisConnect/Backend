import express from 'express'
import * as _ from 'lodash'
import Plan from '../models/plan'
import { createSchema, editSchema } from '../schema/plan'
import { uuidv4 } from '@firebase/util'
import Chat from '../models/chat'

const router = express.Router()
router.get('/data/:id', async (req, res) => {
  if (req.params.id) {
    const plan = await Plan.findById(req.params.id)
    if (!plan) {
      res.status(400).send({ found: false })
      return
    }
    const sentData = { ...plan.toObject(), found: true }
    return res.status(200).send(sentData)
  }
})

router.post('/create', async (req, res) => {
  const createData = createSchema.safeParse(req.body)
  if (!createData.success) {
    return res.status(400).send('Bad request')
  }
  const chat = await Chat.create({})
  if (!chat) {
    return res.status(500).send('Internal server error')
  }
  const result = await Plan.create({
    project_id: createData.data.project_id,
    name: createData.data.name,
    description: createData.data.description,
    start_date: createData.data.start_date,
    end_date: createData.data.end_date,
    task: createData.data.task,
    chat_id: req.body.task ? chat._id : null,
    folder_id: req.body.task ? uuidv4() : null,
  })
  if (result) {
    return res.status(200).send(result)
  } else {
    return res.status(400).send('Bad request')
  }
})

router.put('/edit', async (req, res) => {
  const editData = editSchema.safeParse(req.body)
  if (!editData.success) {
    return res.status(400).send('Bad request')
  }
  const result = await Plan.findByIdAndUpdate(editData.data._id, {
    name: editData.data.name,
    description: editData.data.description,
    progress: editData.data.progress,
    start_date: editData.data.start_date,
    end_date: editData.data.end_date,
  })
  if (result) {
    return res.status(200).send('OK')
  } else {
    return res.status(400).send('Data not found')
  }
})

router.delete('/delete/:id', async (req, res) => {
  if (req.params.id) {
    const result = await Plan.findByIdAndDelete(req.params.id)
    if (result) {
      return res.status(200).send('OK')
    } else {
      return res.status(400).send('Data not found')
    }
  } else {
    return res.status(400).send('Missing id')
  }
})

export default router

// GET: http://localhost:8080/plan/data/aef27580-b6c8-4697-ba10-995f2e85e7d3
// CREATE: http://localhost:8080/plan/create
// {
//   "project_id": "55e99b38-b79e-4f18-803b-91329049188f",
//   "name": "Princess Elle",
//   "description": "Kai maidee AMD",
//   "start_date": "09/09/2023",
//   "end_date": "12/09/2023",
//   "task": false
// }
//
