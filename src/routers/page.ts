import express from 'express'
import Project from '../models/project'
import User from '../models/user'
import Summary from '../models/summary'
import Plan from '../models/plan'

const router = express.Router()
router.get('/main', async (req, res) => {
  const uid = req.user?.uid
  if (!uid) {
    return res.status(400).send('Bad request')
  }
  const getUsers = function (users: string[]) {
    return Promise.all(
      users.map(async (id) => {
        const user = await User.findById(id)
        if (user) {
          return {
            id: user._id,
            name: user.name,
            surname: user.surname,
            avatar: user.avatar,
          }
        }
      }),
    )
  }
  const projects = await Project.find({
    $or: [
      { advisors: { $in: uid } },
      { co_advisors: { $in: uid } },
      { advisee: { $in: uid } },
    ],
  })
  const data = await Promise.all(
    projects.map(async (project) => {
      return {
        id: project._id,
        name: project.name,
        progress: project.progress,
        status: project.status,
        advisors: await getUsers(project.advisors),
        co_advisors: await getUsers(project.co_advisors),
        advisee: await getUsers(project.advisee),
        chat_id: project.chat_id,
      }
    }),
  )
  return res.status(200).send(data)
})

router.get('/summary/:id', async (req, res) => {
  if (req.params.id) {
    const getUser = async function (id: string) {
      const user = await User.findById(id)
      if (user) {
        return {
          id: user._id,
          name: user.name,
          surname: user.surname,
          avatar: user.avatar,
        }
      }
    }
    const summaries = await Summary.find({
      project_id: req.params.id,
    })
    const data = await Promise.all(
      summaries.map(async (summary) => {
        const plan = await Plan.findById(summary.plan_id)
        if (plan) {
          return {
            id: summary._id,
            task: plan.name,
            reciever: await getUser(summary.reciever_id),
            sender: await getUser(summary.sender_id),
            comment: summary.comment,
            progress: summary.progress,
            files: summary.file_id,
            chat_id: plan.chat_id,
            updated_at: summary.createdAt,
          }
        }
      }),
    )
    return res.status(200).send(data)
  }
  return res.status(400).send('Bad request')
})

router.get('/plan/:id', async (req, res) => {
  if (req.params.id) {
    const plans = await Plan.find({
      project_id: req.params.id,
    })
    const data = await Promise.all(
      plans.map(async (plan) => {
        return {
          id: plan._id,
          name: plan.name,
          progress: plan.progress,
          start_date: plan.start_date,
          end_date: plan.end_date,
          task: plan.task,
          description: plan.description,
        }
      }),
    )
    return res.status(200).send(data)
  }
  return res.status(400).send('Bad request')
})

router.get('/gantt/:id', async (req, res) => {
  if (req.params.id) {
    const plans = await Plan.find({
      project_id: req.params.id,
      task: true,
    })
    const data = await Promise.all(
      plans.map(async (plan) => {
        return {
          id: plan._id,
          chat_id: plan.chat_id,
          name: plan.name,
          progress: plan.progress,
          start_date: plan.start_date,
          end_date: plan.end_date,
          description: plan.description,
        }
      }),
    )
    return res.status(200).send(data)
  }
  return res.status(400).send('Bad request')
})

export default router
