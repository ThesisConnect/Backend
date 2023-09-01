import express from 'express'
import * as _ from 'lodash'
import Plan from '../models/plan'
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
  const result = await Plan.create({
    project_id: req.body.project_id,
    name: req.body.name,
    description: req.body.description,
    progress: 0,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    task: req.body.task,
    chat_id: req.body.task ? uuidv4() : null,
    folder_id: req.body.task ? uuidv4() : null,
  })
  if (result) {
    return res.status(200).send(result)
  } else {
    return res.status(400).send('Bad request')
  }
})

export default router
