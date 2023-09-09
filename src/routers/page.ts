import express from 'express'
import Project from '../models/project'
import User from '../models/user'
import Summary from '../models/summary'
import Plan from '../models/plan'
import folder from '../models/folder'

const router = express.Router()
router.get('/main', async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/summary/:id', async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/plan/:id', async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/gantt/:id', async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/file/:id', async (req, res) => {
  try {
    if (req.params.id) {
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
      const folders = await folder.find(
        { shared: { $in: req.params.id } },
        { parent: null },
      )
      const data = await Promise.all(
        folders.map(async (folder) => {
          return {
            id: folder._id,
            name: folder.name,
            child: folder.child,
            share: await getUsers(folder.shared),
            date_modified: folder.updatedAt,
          }
        }),
      )
      return res.status(200).send(data)
    }
    return res.status(400).send('Bad request')
  } catch (error) {
    return res.status(500).send(error)
  }
})
/*
{
  "parent_id":1,
  "directory": [
    {
      "folder":{
        "id":1,
        "name":"test",
        "child":"test_child",
        "share":[
          {
              "id": "4a693fc0-e0e7-401d-9e27-761a9053e503",
              "avatar": "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
              "name": "John Doe"
          }
        ],
      }
      ]
    }
  ]
}
*/
export default router
