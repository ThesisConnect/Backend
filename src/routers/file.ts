import express from 'express'
import File from '../models/file'
import { createSchema, editSchema } from '../schema/file'
import Folder from '../models/folder'

const router = express.Router()

/**
 * @swagger
 * /file/{id}:
 *   get:
 *     tags:
 *       - File
 *     summary: Fetch data by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the file
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

    const file = await File.findById(id)
    if (file) {
      return res.status(200).send(file)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /file/create:
 *   post:
 *     tags:
 *       - File
 *     summary: Create a new file
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the file
 *               url:
 *                 type: string
 *                 description: URL of the file
 *               size:
 *                 type: number
 *                 description: Size of the file
 *               type:
 *                 type: string
 *                 description: Type of the file
 *               memo:
 *                 type: string
 *                 description: Memo of the file
 *             required: [name, url, size, type]
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

    const result = await File.create({
      name: createData.data.name,
      url: createData.data.url,
      size: createData.data.size,
      file_type: createData.data.file_type,
      memo: createData.data.memo,
    })

    if (result) {
      if (createData.data.folder_id) {
        const folder = await Folder.findById(createData.data.folder_id)
        if (folder) {
          await folder.updateOne({
            $addToSet: { files: result._id },
          })
        }
      }
      return res.status(200).send(result)
    }

    return res.status(500).send('Failed to create file')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /file/edit:
 *   put:
 *     tags:
 *       - File
 *     summary: Edit file data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the file
 *               name:
 *                 type: string
 *                 description: New name of the file
 *               memo:
 *                 type: string
 *                 description: New memo of the file
 *             required: [id]
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
      return res.status(400).send('Body not match')
    }

    const result = await File.findByIdAndUpdate(editData.data.id, {
      name: editData.data.name,
      memo: editData.data.memo,
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
 * /file/delete/{id}:
 *   delete:
 *     tags:
 *       - File
 *     summary: Delete file by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the file
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

    const result = await File.findByIdAndDelete(id)
    if (result) {
      return res.status(200).send(result)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
