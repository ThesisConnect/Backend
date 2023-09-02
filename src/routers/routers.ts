import express from 'express'
import test from './test'
import user from './user'
import project from './project'
import plan from './plan'
import summary from './summary'
import page from './page'
import folder from './folder'
import file from './file'
const router = express.Router()

router.use('/test', test)
router.use('/user', user)
router.use('/project', project)
router.use('/plan', plan)
router.use('/summary', summary)
router.use('/folder', folder)
router.use('/file', file)
router.use('/page', page)

export default router
