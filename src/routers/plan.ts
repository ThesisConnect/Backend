import express from 'express'
import Plan from '../models/plan'
import { createSchema, editSchema } from '../schema/plan'
import Chat, { IChat } from '../models/chat'
import Folder, { IFolder } from '../models/folder'
import Project from '../models/project'

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
    return res.status(400).send('Body not match')
  }
  const project = await Project.findById(createData.data.project_id)
  if (!project) {
    return res.status(400).send('Project not found')
  }
  let chat: IChat | null = null
  let folder: IFolder | null = null
  if (req.body.task) {
    chat = await Chat.create({})
    if (!chat) {
      return res.status(500).send('Internal server error')
    }
    folder = await Folder.create({
      name: createData.data.name,
      shared: [...project.advisors, ...project.co_advisors, ...project.advisee],
    })
    if (!folder) {
      return res.status(500).send('Internal server error')
    }
  }
  const result = await Plan.create({
    project_id: createData.data.project_id,
    name: createData.data.name,
    description: createData.data.description,
    start_date: createData.data.start_date,
    end_date: createData.data.end_date,
    task: createData.data.task,
    chat_id: req.body.task ? chat?._id : null,
    folder_id: req.body.task ? folder?._id : null,
  })
  if (result) {
    return res.status(200).send(result)
  } else {
    return res.status(400).send('Create failed')
  }
})

router.put('/edit', async (req, res) => {
  const editData = editSchema.safeParse(req.body)
  if (!editData.success) {
    return res.status(400).send('Body not match')
  }
  const result = await Plan.findByIdAndUpdate(editData.data.id, {
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

/*
Test case
GET: http://localhost:8080/plan/data/aef27580-b6c8-4697-ba10-995f2e85e7d3
CREATE: http://localhost:8080/plan/create
{
  "project_id": "55e99b38-b79e-4f18-803b-91329049188f",
  "name": "Princess Elle",
  "description": "Kai maidee AMD",
  "start_date": "09/09/2023",
  "end_date": "12/09/2023",
  "task": false
}
EDIT: http://localhost:8080/plan/edit
{
  "_id": "53384bb5-ea62-45f5-90c4-a2aa28e5839a",
  "progress": 99,
  "start_date": "09/09/2023",
  "end_date": "12/09/2023",
  "task": false
}
DELETE: http://localhost:8080/plan/delete/
*/
