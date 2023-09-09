import express from 'express'
import User from '../models/user'
import * as _ from 'lodash'
import Project from '../models/project'

const router = express.Router()
router.get('/data/:uid', async (req, res) => {
  try {
    if (req.params.uid) {
      const user = await User.findById(req.params.uid)
      if (!user) {
        return res.status(200).send({ found: false })
      }
      const sentData = { ...user.toObject(), found: true }
      return res.status(200).send(_.omit(sentData, ['_id', '__v']))
    }
    return res.status(400).send('Missing uid')
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/project/:uid', async (req, res) => {
  try {
    if (req.params.uid) {
      const projects = await Project.find({
        $or: [
          { advisors: { $in: req.params.uid } },
          { co_advisors: { $in: req.params.uid } },
          { advisee: { $in: req.params.uid } },
        ],
      })
      const sentData = projects.map((item) => {
        return item?._id
      })
      return res.status(200).send(sentData)
    }
  } catch (error) {
    return res.status(500).send(error)
  }  
})

export default router
