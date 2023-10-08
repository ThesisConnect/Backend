import express from 'express'
import Folder, { IFolder, IFolderDocument } from '../models/folder'
import { addFileSchema, createSchema, editSchema } from '../schema/folder'
import { IUser } from '../models/user'
import { IFile } from '../models/file'

const router = express.Router()

/**
 * @swagger
 * /folder/{id}:
 *   get:
 *     tags:
 *       - Folder
 *     summary: Fetch data by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the folder
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
    const uid = req.user?.uid
    if (!uid) {
      return res.status(400).send('Bad request')
    }

    const id = req.params.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const folder = await Folder.findById(id).populate<{
      parent: IFolder
      child: IFolder[]
      files: IFile[]
      shared: IUser[]
    }>([
      {
        path: 'parent',
        match: { shared: { $in: uid } },
      },
      {
        path: 'child',
        match: { shared: { $in: uid } },
      },
      {
        path: 'files',
      },
      {
        path: 'shared',
      },
   ])
    if (folder) {
      return res.status(200).send(folder)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /folder/create:
 *   post:
 *     tags:
 *       - Folder
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
 *                 description: Name of the file
 *               parent:
 *                 type: string
 *                 description: ID of the parent folder
 *             required: [name]
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

    const parentFolder = await Folder.findById(createData.data.parent)
    if (!parentFolder) {
      return res.status(404).send('Parent not found')
    }

    const result = await Folder.create({
      name: createData.data.name,
      parent: createData.data.parent,
      shared: parentFolder.shared,
    })

    if (result) {
      await parentFolder.updateOne({
        $addToSet: { child: result._id },
      })

      return res.status(200).send(result)
    }

    return res.status(500).send('Failed to create folder')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /folder/edit:
 *   put:
 *     tags:
 *       - Folder
 *     summary: Edit folder data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the folder
 *               name:
 *                 type: string
 *                 description: New name of the folder
 *               shared:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the user
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

    const folder = await Folder.findById(editData.data.id)
    if (!folder) {
      return res.status(404).send('Not found')
    }
    const result = await folder.updateOne({
      name: editData.data.name,
      shared: editData.data.shared,
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
 * /folder/addFile:
 *   put:
 *     tags:
 *       - Folder
 *     summary: Add file to folder
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the folder
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID of the file
 *             required: [id, files]
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
router.put('/addFile', async (req, res) => {
  try {
    const addFileData = addFileSchema.safeParse(req.body)
    if (!addFileData.success) {
      return res.status(400).send('Body not match')
    }

    const result = await Folder.findByIdAndUpdate(addFileData.data.id, {
      $addToSet: { files: addFileData.data.files },
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
 * /folder/delete/{id}:
 *   delete:
 *     tags:
 *       - Folder
 *     summary: Delete folder by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the folder
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

    const folder = await Folder.findById(id)
    const result = await folder?.deleteOne()
    console.log(result)
    if (result) {
      return res.status(200).send(result)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
