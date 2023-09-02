import express from 'express'
import * as _ from 'lodash'
import Project from '../models/project'
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
    const sentData = { users: [...project.advisors, ...project.advisee] }
    return res.status(200).send(sentData)
  }
})

router.post('/create', async (req, res) => {
  const result = await Project.create({
    name: req.body.name,
    progress: 0,
    status: {
      id: 1,
      name: 'Proposal',
      order: 1,
    },
    advisors: req.body.advisors,
    co_advisors: req.body.co_advisors,
    advisee: req.body.advisee,
    chat_id: uuidv4(),
  })
  if (result) {
    return res.status(200).send(result)
  } else {
    return res.status(400).send('Bad request')
  }
})

router.put('/edit/:id', async (req, res) => {
  const result = await Project.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    advisors: req.body.advisors,
    co_advisors: req.body.co_advisors,
    advisee: req.body.advisee,
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
