import express from 'express'
import Summary from '../models/summary'
import { createSchema } from '../schema/summary'

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
 *   post:
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
 *               progress:
 *                 type: number
 *                 description: Progress of the plan
 *             required: [project_id, plan_id, reciever_id, sender_id, comment, file_id, chat_id, progress]
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

export default router
