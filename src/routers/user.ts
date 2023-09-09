import express from 'express'
import User from '../models/user'
import * as _ from 'lodash'
import Project from '../models/project'

const router = express.Router()
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
