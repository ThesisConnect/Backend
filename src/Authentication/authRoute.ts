import express, { Request, Response } from 'express'
import admin from './FirebaseAdmin/admin'
import User from '../models/user'
import jwtMiddleware from '../middleware/jwtMiddleware'
import ms from 'ms'
import * as _ from 'lodash'

import checkAuth from '../controllers/auth/checkAuth'
import login from '../controllers/auth/login'
import register from '../controllers/auth/register'
import updateProfile from '../controllers/auth/updateProfile'
import logout from '../controllers/auth/logout'
import updateImageProfileUrl from '../controllers/auth/updateImageProfile'
const router = express.Router()

router.get('/checkAuth', jwtMiddleware, checkAuth)

router.post('/login', login)

router.post('/register', register)

router.post('/update/profile', jwtMiddleware, updateProfile)
router.get('/update/profileImage', jwtMiddleware, updateImageProfileUrl)
router.delete(
  '/update/deleteProfileImage',
  jwtMiddleware,
  updateImageProfileUrl,
)

router.get('/logout', logout)

export default router
// router.post("/forgot/password", async (req:Request, res:Response) => {
//     const email = req.body.email;
//     try {
//         const link = await admin.auth().generatePasswordResetLink(email);

//         const uid = (await admin.auth().getUserByEmail(email)).uid;
//         const user = await User.findById(uid);

//         const html = generateEmailContent(user?.username||"cat",link)
//         sendEmail("Reset password",html,email)
//         return res.status(200).send({message:"Send email successfully"});
//     } catch (error: any) {
//         console.log(error?.errorInfo)
//         const message ={
//             codeError: <string>error?.errorInfo.code.split("/")[1],
//             message: 'UNAUTHORIZED REQUEST!'
//         }
//         res.status(401).send(message);
//     }
//   }
// )
