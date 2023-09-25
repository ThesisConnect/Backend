import express from 'express'
import Summary from '../models/summary'
import { createSchema, editSchema } from '../schema/summary'

const router = express.Router()

/**
 * @swagger
 * /summary/{id}:
 *   get:
 *     tags:
 *       - Summary
 *     summary: Fetch data by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the summary
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

    const summary = await Summary.findById(id)
    if (summary) {
      return res.status(200).send(summary)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /summary/create:
 *   put:
 *     tags:
 *       - Summary
 *     summary: Create a new summary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: string
 *                 description: ID of the project
 *               plan_id:
 *                 type: string
 *                 description: ID of the plan
 *               reciever_id:
 *                 type: string
 *                 description: ID of the user
 *               sender_id:
 *                 type: string
 *                 description: ID of the user
 *               comment:
 *                 type: string
 *                 description: Comment of the summary
 *               file_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the file
 *               chat_id:
 *                 type: string
 *                 description: ID of the chat
 *               status:
 *                 type: string
 *                 description: Status of the summary
 *                 enum: [pending, pendingwithreject, approved, rejected, completed]
 *               progress:
 *                 type: number
 *                 description: Progress of the summary
 *             required: [project_id, plan_id, reciever_id, sender_id, comment, file_id, chat_id, status, progress]
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

    const result = await Summary.create({
      project_id: createData.data.project_id,
      plan_id: createData.data.plan_id,
      reciever_id: createData.data.reciever_id,
      sender_id: createData.data.sender_id,
      comment: createData.data.comment,
      files: createData.data.files,
      chat_id: createData.data.chat_id,
      status: createData.data.status,
      progress: createData.data.progress,
    })

    if (result) {
      return res.status(200).send(result)
    }

    return res.status(500).send('Failed to create summary')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /summary/edit:
 *   put:
 *     tags:
 *       - Summary
 *     summary: Edit summary data
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the summary
 *               comment:
 *                 type: string
 *                 description: Comment of the summary
 *               status:
 *                 type: string
 *                 description: Status of the plan
 *                 enum: [pending, pendingwithreject, approved, rejected, completed]
 *               progress:
 *                 type: number
 *                 description: Progress of the summary
 *             required: [id, status, progress]
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
      return res.status(400).send('Body not match(Zod)')
    }

    const result = await Summary.findByIdAndUpdate(editData.data.id, {
      comment: editData.data.comment,
      status: editData.data.status,
      progress: editData.data.progress,
      files: editData.data.files,
    })

    if (result) {
      return res.status(200).send(result)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
