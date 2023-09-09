import express from 'express'
import Project from '../models/project'
import { createSchema, editSchema } from '../schema/project'
import Chat from '../models/chat'
import Folder from '../models/folder'
import { IUser } from "../models/user"

const router = express.Router()

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     tags:
 *       - Project
 *     summary: Fetch data by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const project = await Project.findById(id).populate<{ advisors: IUser[], co_advisors: IUser[], advisee: IUser[]}>("advisors co_advisors advisee")
    if (project) {
      return res.status(200).send(project)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /project/users/{id}:
 *   get:
 *     tags:
 *       - Project
 *     summary: Fetch users by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/users/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const project = await Project.findById(req.params.id).populate<{ advisors: IUser[], co_advisors: IUser[], advisee: IUser[]}>("advisors co_advisors advisee")
    if (project) {
      const data = {
        advisors: project.advisors,
        co_advisors: project.co_advisors,
        advisee: project.advisee,
      }
      return res.status(200).send(data)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /project/create:
 *   post:
 *     tags:
 *       - Project
 *     summary: Create a new folder
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the project
 *               advisors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the user
 *               co_advisors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the user
 *               advisee:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the user
 *             required: [name, advisors, co_advisors, advisee]
 *     responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.post('/create', async (req, res) => {
  try {
    const createData = createSchema.safeParse(req.body)
    if (!createData.success) {
      return res.status(400).send('Body not match')
    }

    const chat = await Chat.create({})
    if (!chat) {
      return res.status(500).send('Failed to create chat')
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
      return res.status(500).send('Failed to create folder')
    }

    let child : string[] = []
    for (const folder_name of ["All task", "General", "Literature review"]) {
      const child_folder = await Folder.create({
        name: folder_name,
        shared: [
          ...createData.data.advisors,
          ...createData.data.co_advisors,
          ...createData.data.advisee,
        ],
        parent: root_folder
      })
      root_folder.child.push(child_folder._id)
      if (!child_folder) {
        for (const child_id of child) {
          const folder = await Folder.findById(child_id)
          await folder?.deleteOne();
        }
        return res.status(500).send('Failed to create folder')
      }
      child.push(child_folder._id)
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
        for (const child_id of child) {
          const folder = await Folder.findById(child_id)
          await folder?.deleteOne();
        }
        return res.status(500).send('Internal server error')
      }
      child.push(child_folder._id)
    }

    await root_folder.updateOne({
      $addToSet: { child: child }
    })

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
    }

    await Chat.findByIdAndDelete(chat._id)
    const folder = await Folder.findById(root_folder._id)
    await folder?.deleteOne();

    return res.status(500).send('Failed to create project')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /project/edit:
 *   put:
 *     tags:
 *       - Project
 *     summary: Edit project data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the project
 *               name:
 *                 type: string
 *                 description: New name of the project
 *               advisors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the user
 *               co_advisors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the user
 *               advisee:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the user
 *             required: [id, advisors, co_advisors, advisee]
 *     responses:
 *       200:
 *         description: Edited
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
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
      return res.status(200).send(result)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /project/delete/{id}:
 *   delete:
 *     tags:
 *       - Project
 *     summary: Delete project by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const project = await Project.findById(id)
    const result = await project?.deleteOne()
    if (result) {
      return res.status(200).send(result)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router