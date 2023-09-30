import express from 'express'
import Project from '../models/project'
import { createSchema, editSchema } from '../schema/project'
import Chat from '../models/chat'
import Folder from '../models/folder'
import user, { IUser } from '../models/user'
import firebaseAdmin from '../Authentication/FirebaseAdmin/admin'

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

    const project = await Project.findById(id).populate<{
      advisors: IUser[]
      co_advisors: IUser[]
      advisee: IUser[]
    }>('advisors co_advisors advisee')
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

    const project = await Project.findById(req.params.id).populate<{
      advisors: IUser[]
      co_advisors: IUser[]
      advisee: IUser[]
    }>('advisors co_advisors advisee')
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
 *                   description: email of the user
 *               co_advisors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: email of the user
 *               advisee:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: email of the user
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

    let cache: Map<string, any> = new Map()
    const getUIDs = async function (emails: string[]) {
      return (
        await Promise.all(
          emails.map(async (email) => {
            try {
              const u = await firebaseAdmin.auth().getUserByEmail(email)
              if (!u) {
                return
              }

              const us = await user.findById(u.uid)
              if (!us) {
                return
              }

              cache.set(us._id, {
                ...us.toObject(),
                email: u.email,
              })
              return us._id
            } catch (error) {
              return
            }
          }),
        )
      ).filter((id) => id !== undefined)
    }

    const advisors = await getUIDs(createData.data.advisors)
    if (advisors.length == 0) {
      return res.status(404).send('Invalid advisors')
    }

    const co_advisors = await getUIDs(createData.data.co_advisors)
    const advisee = await getUIDs(createData.data.advisee)

    const root_folder = await Folder.create({
      name: createData.data.name,
      shared: [...advisors, ...co_advisors, ...advisee],
    })
    if (!root_folder) {
      return res.status(500).send('Failed to create folder')
    }

    let general_folder = ''
    let child: string[] = []
    for (const folder_name of ['All task', 'General', 'Literature review']) {
      const child_folder = await Folder.create({
        name: folder_name,
        shared: [...advisors, ...co_advisors, ...advisee],
        parent: root_folder,
      })
      if (!child_folder) {
        for (const child_id of child) {
          const folder = await Folder.findById(child_id)
          await folder?.deleteOne()
        }
        return res.status(500).send('Failed to create folder')
      }
      if (folder_name == 'General') {
        general_folder = child_folder._id
      }
      child.push(child_folder._id)
    }

    const users_id =  await getUIDs(createData.data.advisee)

    for (let user_id of users_id) {
      const child_folder = await Folder.create({
        name: 'Private',
        shared: [ user_id ],
        parent: root_folder,
      })
      if (!child_folder) {
        for (const child_id of child) {
          const folder = await Folder.findById(child_id)
          await folder?.deleteOne()
        }
        return res.status(500).send('Internal server error')
      }
      child.push(child_folder._id)
    }

    if (general_folder == '') {
      for (const child_id of child) {
        const folder = await Folder.findById(child_id)
        await folder?.deleteOne()
      }
      return res.status(500).send('Internal server error')
    }

    const chat = await Chat.create({
      folder_id: general_folder,
    })
    if (!chat) {
      child.push(root_folder._id)
      for (const child_id of child) {
        const folder = await Folder.findById(child_id)
        await folder?.deleteOne()
      }
      return res.status(500).send('Failed to create chat')
    }

    await root_folder.updateOne({
      $addToSet: { child: child },
    })

    const result = await Project.create({
      name: createData.data.name,
      advisors: advisors,
      co_advisors: co_advisors,
      advisee: advisee,
      chat_id: chat._id,
      folder_id: root_folder._id,
    })
    if (result) {
      const data = {
        ...result.toObject(),
        advisors: result.advisors.map((id) => cache.get(id)),
        co_advisors: result.co_advisors.map((id) => cache.get(id)),
        advisee: result.advisee.map((id) => cache.get(id)),
      }
      return res.status(200).send(data)
    }

    await Chat.findByIdAndDelete(chat._id)
    const folder = await Folder.findById(root_folder._id)
    await folder?.deleteOne()

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
    let cache: Map<string, any> = new Map()
    const getUIDs = async function (emails: string[]) {
      return (
        await Promise.all(
          emails.map(async (email) => {
            try {
              const u = await firebaseAdmin.auth().getUserByEmail(email)
              if (!u) {
                return 
              }

              const us = await user.findById(u.uid)
              if (!us) {
                return
              }

              cache.set(us._id, {
                ...us.toObject(),
                email: u.email,
              })
              return us._id
            } catch (error) {
              return
            }
          }),
        )
      ).filter((id) => id !== undefined)
    }

    const editData = editSchema.safeParse(req.body)
    if (!editData.success) {
      return res.status(400).send('Schema not match')
    }

    const advisors = await getUIDs(editData.data.advisors)
    if (advisors.length == 0) {
      return res.status(404).send('Invalid advisors')
    }

    const co_advisors = await getUIDs(editData.data.co_advisors)
    const advisee = await getUIDs(editData.data.advisee)
    const project = await Project.findById(editData.data.id)

    for (let user_id of editData.data.advisee) {
      if (!project?.advisee.includes(user_id)) {
        const child_folder = await Folder.create({
          name: 'Private',
          shared: getUIDs([user_id]),
          parent: project?.folder_id,
        })
        if (!child_folder) {
          return res.status(500).send('Internal server error')
        }
      }
    }

    const result = await Project.findByIdAndUpdate(editData.data.id, {
      name: editData.data.name,
      progress: editData.data.progress,
      status: editData.data.status,
      advisors: advisors,
      co_advisors: co_advisors,
      advisee: advisee,
    })

    if (result) {
      const data = {
        ...result.toObject(),
        advisors: result.advisors.map((id) => cache.get(id)),
        co_advisors: result.co_advisors.map((id) => cache.get(id)),
        advisee: result.advisee.map((id) => cache.get(id)),
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
