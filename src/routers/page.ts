import express from 'express'
import Project from '../models/project'
import { IUser, IUserDocument } from '../models/user'
import Summary from '../models/summary'
import Plan, { IPlan } from '../models/plan'
import folder from '../models/folder'
import { IFile } from '../models/file'
import firebaseAdmin from '../Authentication/FirebaseAdmin/admin'

const router = express.Router()

/**
 * @swagger
 * /page/main:
 *   get:
 *     tags:
 *       - Page
 *     summary: Fetch main page data
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
router.get('/main', async (req, res) => {
  try {
    const uid = req.user?.uid
    if (!uid) {
      return res.status(400).send('Bad request')
    }

    let projects = await Project.find({
      $or: [
        { advisors: { $in: uid } },
        { co_advisors: { $in: uid } },
        { advisee: { $in: uid } },
      ],
    }).populate<{ advisors: IUser[]; co_advisors: IUser[]; advisee: IUser[] }>(
      'advisors co_advisors advisee',
    )

    const getFirebaseUser = async (user: any) => {
      try {
        const firebaseUser = await firebaseAdmin.auth().getUser(user._id)
        if (firebaseUser) {
          user._doc.email = firebaseUser.email
        }
      } catch (error) {
        console.log('fail')
        console.error('Error fetching Firebase user:', error)
      }
    }

    projects = await Promise.all(
      projects.map(async (project) => {
        const allUsers = [
          ...project.advisors,
          ...project.co_advisors,
          ...project.advisee,
        ]
        await Promise.all(allUsers.map(getFirebaseUser))
        return project
      }),
    )

    return res.status(200).send(projects)
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /page/summary/{id}:
 *   get:
 *     tags:
 *       - Page
 *     summary: Fetch summary page data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project
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
router.get('/summary/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const summaries = await Summary.find({ project_id: id }).populate<{
      sender_id: IUser
      reciever_id: IUser
      plan_id: IPlan
      files: IFile
    }>('sender_id reciever_id plan_id files')

    return res.status(200).send(summaries)
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /page/plan/{id}:
 *   get:
 *     tags:
 *       - Page
 *     summary: Fetch plan page data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project
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
router.get('/plan/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const plans = await Plan.find({
      project_id: id,
    })

    return res.status(200).send(plans)
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /page/gantt/{id}:
 *   get:
 *     tags:
 *       - Page
 *     summary: Fetch gantt page data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project
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
router.get('/gantt/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const plans = await Plan.find({
      project_id: id,
      task: true,
    })

    return res.status(200).send(plans)
  } catch (error) {
    return res.status(500).send(error)
  }
})

/**
 * @swagger
 * /page/file/{id}:
 *   get:
 *     tags:
 *       - Page
 *     summary: Fetch file page data
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
router.get('/file/:id', async (req, res) => {
  try {
    const id = req.params?.id
    if (!id) {
      return res.status(400).send('Bad request')
    }

    const folders = await folder
      .find({
        $and: [{ shared: { $in: req.params.id } }, { parent: null }],
      })
      .populate<{ shared: IUser[] }>('shared')

    return res.status(200).send(folders)
  } catch (error) {
    return res.status(500).send(error)
  }
})

export default router
