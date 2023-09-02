import express from 'express'
import * as _ from 'lodash'
import Project from '../models/project'
import { createSchema, editSchema } from '../schema/project'
import { uuidv4 } from '@firebase/util'

const router = express.Router()
router.get('/data/:id', async (req, res) => {
  if (req.params.id) {
    const project = await Project.findById(req.params.id)
    if (!project) {
      res.status(200).send({ found: false })
      return
    }
    const sentData = { ...project.toObject(), found: true }
    return res.status(200).send(_.omit(sentData, ['_id', '__v']))
  }
})

router.get('/users/:id', async (req, res) => {
  if (req.params.id) {
    const project = await Project.findById(req.params.id)
    if (!project) {
      res.status(200).send({ users: [] })
      return
    }
    const sentData = { advisors: project.advisors, co_advisors: project.co_advisors, advisee: project.advisee }
    return res.status(200).send(sentData)
  }
})

router.post('/create', async (req, res) => {
  const createData = createSchema.safeParse(req.body)
  if (!createData.success) {
    return res.status(400).send('Bad request')
  }
  const result = await Project.create({
    name: createData.data.name,
    advisors: createData.data.advisors,
    co_advisors: createData.data.co_advisors,
    advisee: createData.data.advisee,
    chat_id: uuidv4(),
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
  const result = await Project.findByIdAndUpdate(editData.data._id, {
    name: editData.data.name,
    advisors: editData.data.advisors,
    co_advisors: editData.data.co_advisors,
    advisee: editData.data.advisee,
  })
  if (result) {
    return res.status(200).send(result)
  } else {
    return res.status(400).send('Bad request')
  }
})

router.delete('/delete/:id', async (req, res) => {
  const result = await Project.findByIdAndDelete(req.params.id)
  if (result) {
    return res.status(200).send(result)
  } else {
    return res.status(400).send('Bad request')
  }
})

export default router