import express from 'express'
import * as _ from 'lodash'
import Plan from '../models/plan'
import { createSchema,  updateSchema } from '../schema/plan'
import { uuidv4 } from '@firebase/util'

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
  const result = await Plan.create({
    project_id: createData.data.project_id,
    name: createData.data.name,
    description: createData.data.description,
    progress: 0,
    start_date: createData.data.start_date,
    end_date: createData.data.end_date,
    task: createData.data.task,
    chat_id: req.body.task ? uuidv4() : null,
    folder_id: req.body.task ? uuidv4() : null,
  })
  if (result) {
    return res.status(200).send(result)
  } else {
    return res.status(400).send('Bad request')
  }
})

router.put('/edit', async (req, res) => {
  const updateData = updateSchema.safeParse(req.body)
  if (!updateData.success) {
    return res.status(400).send('Bad request')
  }
  const result = await Plan.findByIdAndUpdate(updateData.data._id, {
    name: updateData.data.name,
    description: updateData.data.description,
    progress: updateData.data.progress,
    start_date: updateData.data.start_date,
    end_date: updateData.data.end_date,
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
  }
  else {
    return res.status(400).send('Missing id')
  }
})

export default router
