import express from 'express'
import * as _ from 'lodash'
import Project from '../models/project'
import { createSchema, editSchema } from '../schema/project'
import { uuidv4 } from '@firebase/util'
import Chat from '../models/chat'
import Folder from '../models/folder'
import User, { IUser } from "../models/user"

const router = express.Router()
router.get('/:id', async (req, res) => {
  try {
    if (req.params.id) {
      const project = await Project.findById(req.params.id).populate<{ advisors: IUser[], co_advisors: IUser[], advisee: IUser[]}>("advisors co_advisors advisee")
      if (!project) {
        res.status(200).send({ found: false })
        return
      }
      return res.status(200).send(project)
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    if (req.params.id) {
      const project = await Project.findById(req.params.id).populate<{ advisors: IUser[], co_advisors: IUser[], advisee: IUser[]}>("advisors co_advisors advisee")
      if (!project) {
        res.status(200).send({ users: [] })
        return
      }
      const sentData = {
        advisors: project.advisors,
        co_advisors: project.co_advisors,
        advisee: project.advisee,
      }
      return res.status(200).send(sentData)
    }
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
    const chat = await Chat.create({})
    if (!chat) {
      return res.status(500).send('Internal server error')
    }
    const root_folder = await Folder.create({
      name: createData.data.name,
      shared: [
        ...createData.data.advisors,
        ...createData.data.co_advisors,
        ...createData.data.advisee,
      ],
    })
    if (!root_folder) {
      return res.status(500).send('Internal server error')
    }

    const child_name: string[] = ["All task", "General", "Literature review"]
    for (let folder_name of child_name) {
      const child_folder = await Folder.create({
        name: folder_name,
        shared: [
          ...createData.data.advisors,
          ...createData.data.co_advisors,
          ...createData.data.advisee,
        ],
        parent: root_folder
      })
      if (!child_folder) {
        return res.status(500).send('Internal server error')
      }
    }

    for (let user_id of createData.data.advisee) {
      const child_folder = await Folder.create({
        name: "Private",
        shared: [
          user_id
        ],
        parent: root_folder
      })
      if (!child_folder) {
        return res.status(500).send('Internal server error')
      }
    }

    const result = await Project.create({
      name: createData.data.name,
      advisors: createData.data.advisors,
      co_advisors: createData.data.co_advisors,
      advisee: createData.data.advisee,
      chat_id: chat._id,
      folder_id: root_folder._id,
    })
    if (result) {
      return res.status(200).send(result)
    } else {
      return res.status(400).send('Bad request')
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.put('/edit', async (req, res) => {
  try {
    const editData = editSchema.safeParse(req.body)
    if (!editData.success) {
      return res.status(400).send('Bad request')
    }
    const result = await Project.findByIdAndUpdate(editData.data.id, {
      name: editData.data.name,
      advisors: editData.data.advisors,
      co_advisors: editData.data.co_advisors,
      advisee: editData.data.advisee,
    })
    if (result) {
      return res.status(200).send('OK')
    } else {
      return res.status(400).send('Bad request')
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.delete('/delete/:id', async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id)
    if (result) {
      return res.status(200).send('OK')
    } else {
      return res.status(400).send('Bad request')
    }
  } catch (error) {
    return res.status(500).send(error)
  }
  
})

export default router

/*
Test case
GET: http://localhost:8080/project/data/55e99b38-b79e-4f18-803b-91329049188f
CREATE: http://localhost:8080/project/create
{
  "name": "Princess Elle",
  "advisors": ["a", "b"],
  "co_advisors": ["a", "b"],
  "advisee": ["a", "b"]
}
EDIT: http://localhost:8080/project/edit
{
  "_id": "80eb258d-2db8-4694-b0b5-08590767727b",
  "advisors": ["c"],
  "co_advisors": ["a", "b"],
  "advisee": ["a", "b"]
}
DELETE: http://localhost:8080/project/delete/
*/
