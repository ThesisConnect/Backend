import express from 'express'
import Plan from '../models/plan'
import { createSchema, editSchema } from '../schema/plan'
import Chat, { IChat } from '../models/chat'
import Folder, { IFolder } from '../models/folder'
import Project, { IProject } from '../models/project'

const router = express.Router()
router.get('/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const plan = await Plan.findById(id).populate<{ project_id: IProject}>('project_id')
    if (plan) {
      return res.status(200).send(plan)
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

    const project = await Project.findById(createData.data.project_id)
    if (!project) {
      return res.status(404).send('Project not found')
    }

    let chat: IChat | null = null
    let folder: IFolder | null = null
    if (req.body.task) {
      chat = await Chat.create({})
      if (!chat) {
        return res.status(500).send('Failed to create chat')
      }

      const parent = await Folder.findOne({
        $and: [
          {parent: project.folder_id},
          {name: 'All task'}
        ]
      })

      if (!parent) {
        await Chat.findByIdAndDelete(chat._id)
        return res.status(404).send('Parent not found')
      }

      folder = await Folder.create({
        name: createData.data.name,
        shared: [
          ...project.advisors,
          ...project.co_advisors,
          ...project.advisee,
        ],
        parent: parent._id,
      })

      if (!folder) {
        return res.status(500).send('Failed to create folder')
      }

      await parent.updateOne({
        $addToSet: { child: folder._id }
      })
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
    }

    if (chat) {
      await Chat.findByIdAndDelete(chat._id)
    }
    if (folder) {
      const f = await Folder.findById(folder._id)
      await f?.deleteOne();

      const parent = await Folder.findOne({
        $and: [
          {parent: project.folder_id},
          {name: 'All task'}
        ]
      })

      if (parent) {
        await parent.updateOne({
          $pull: { child: folder._id }
        })
      }
    }

    return res.status(500).send('Failed to create plan')
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.put('/edit', async (req, res) => {
  try {
    const editData = editSchema.safeParse(req.body)    
    if (!editData.success) {
      return res.status(400).send('Body not match(Zod)')
    }
    const result = await Plan.findByIdAndUpdate(editData.data.id, {
      name: editData.data.name,
      description: editData.data.description,
      progress: editData.data.progress,
      start_date: editData.data.start_date,
      end_date: editData.data.end_date,
    })
    if (result) {
      return res.status(200).send(result)
    }
    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }
    const result = await Plan.findByIdAndDelete(id)
    if (result) {
      return res.status(200).send(result)
    }
    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router