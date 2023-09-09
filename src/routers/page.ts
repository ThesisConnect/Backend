import express from 'express'
import Project, {IProject} from '../models/project'
import User, {IUser} from '../models/user'
import Summary from '../models/summary'
import Plan, {IPlan} from '../models/plan'
import folder from '../models/folder'
import file, {IFile} from '../models/file'

const router = express.Router()
router.get('/main', async (req, res) => {
  try {
    const uid = req.user?.uid
    if (!uid) {
      return res.status(400).send('Bad request')
    }
    const projects = await Project.find({
      $or: [
        { advisors: { $in: uid } },
        { co_advisors: { $in: uid } },
        { advisee: { $in: uid } },
      ],
    }).populate <{ advisors: IUser[], co_advisors: IUser[], advisee: IUser[]}>('advisors co_advisors advisee')
    return res.status(200).send(projects)
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/summary/:id', async (req, res) => {
  try {
    if (req.params.id) {
      const summaries = await Summary.find({project_id: req.params.id,}).populate<{ sender_id: IUser, reciever_id: IUser, plan_id: IPlan, file_id: IFile}>('sender_id reciever_id plan_id file_id')
      return res.status(200).send(summaries)
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
      return res.status(200).send(plans)
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
      return res.status(200).send(plans)
    }
    return res.status(400).send('Bad request')
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/file/:id', async (req, res) => {
  try {
    console.log("file page start")
    if (req.params.id) {
      console.log("user func")
      const folders = await folder.find({
        $and: [
          {shared: { $in: req.params.id } },
          {parent: null },]
      }).populate<{ shared: IUser[]}>('shared')
      console.log("folder find")
      return res.status(200).send(folders)
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
