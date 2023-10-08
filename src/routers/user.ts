import express from 'express'
import User, { IUser } from '../models/user'
import Project from '../models/project'
import firebaseAdmin from '../Authentication/FirebaseAdmin/admin'


const router = express.Router()

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Fetch data by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
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

    const user = await User.findById(id)
    if (user) {
      return res.status(200).send(user)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/email/:email', async (req, res) => {
  try {
    const u = await firebaseAdmin.auth().getUserByEmail(req.params.email)
    if (!u) {
      return res.status(404).send('Firebase Not found')
    }
    const user = await User.findById(u.uid)
    if (!user) {
      return res.status(404).send('Database Not found')
    }
    return res.status(200).send(user)
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /user/project/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Fetch projects by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
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
router.get('/project/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const projects = await Project.find({
      $or: [
        { advisors: { $in: req.params.id } },
        { co_advisors: { $in: req.params.id } },
        { advisee: { $in: req.params.id } },
      ],
    })

    if (projects) {
      const data = projects.map((project) => {
        return project?._id
      })
      return res.status(200).send(data)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /user/:
 *   get:
 *     tags:
 *       - User
 *     summary: Fetch all data
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
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
    if (users) {
      return res.status(200).json(users)
    } else {
      return res.status(404).json({ message: 'No users found' })
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
