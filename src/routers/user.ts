import express from 'express'
import User from '../models/user'
import * as _ from 'lodash'
import Project from '../models/project'

const router = express.Router()
/**
 * @swagger
 * /user/{uid}:
 *   get:
 *     tags:
 *       - User
 *     summary: Fetch user data by uid
 *     parameters:
 *       - name: uid
 *         in: path
 *         required: true
 *         description: User ID
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
router.get('/:uid', async (req, res) => {
  try {
    const uid = req.params?.uid
    if (!uid) {
      return res.status(400).send('Bad request')
    }

    const user = await User.findById(uid)
    if (user) {
      return res.status(200).send(user)
    }

    return res.status(404).send('Not found')
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /user/project/{uid}:
 *   get:
 *     tags:
 *       - User
 *     summary: Fetch project by uid
 *     parameters:
 *       - name: uid
 *         in: path
 *         required: true
 *         description: User ID
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
router.get('/project/:uid', async (req, res) => {
  try {
    const uid = req.params?.uid
    if (!uid) {
      return res.status(400).send('Bad request')
    }

    const projects = await Project.find({
      $or: [
        { advisors: { $in: req.params.uid } },
        { co_advisors: { $in: req.params.uid } },
        { advisee: { $in: req.params.uid } },
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
 *     summary: Fetch all user data by uid
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
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
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
    if (users) {
      return res.status(200).json(users);
    } else {
      return res.status(404).json({ message: 'No users found' });
    }
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
