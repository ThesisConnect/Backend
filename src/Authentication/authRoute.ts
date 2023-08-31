import express, { NextFunction, Request, Response } from 'express';
import admin from './FirebaseAdmin/admin';
import User from '../models/user';
import jwtMiddleware from '../middleware/jwtMiddleware';
import ms from 'ms';
import * as _ from 'lodash';
const router = express.Router();
import isDev from '../utils/isDev';

router.get('/checkAuth', jwtMiddleware, async (req:Request, res:Response) => {
    
    if (req.user) {
      const { uid ,email} = req.user;
      const user = await User.findById(uid);
      if (!user) {
            res.status(200).send({ isAuthenticated: false });
            return;
       }
      const sentData ={...user.toObject(),email,isAuthenticated: true }
      return res.status(200).send(_.omit(sentData, ['_id','__v']));
    } else {
      res.status(200).send({ isAuthenticated: false });
    }
  });

router.post('/login',async (req:Request, res:Response) => {
    // console.log(req.body)
    const idToken = req.body.idToken;
    // const csrfToken = req.body.csrfToken.toString();
    // if (csrfToken !== req.cookies.csrfToken) {
    //     res.status(401).send('UNAUTHORIZED REQUEST!');
    //     return;
    //   }
    const expiresIn = ms('5d');

    try {
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn })
        const options = { maxAge: expiresIn, httpOnly: true, secure: isDev?false:true };
        res.cookie('session', sessionCookie, options);
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        const {uid ,email} = decodedIdToken;
        const user = await User.findById(uid);
        if (!user) {
            throw new Error('User not found!');
            }
        const sentData ={...user.toObject(),email,isAuthenticated: true }
        return  res.status(200).send(_.omit(sentData, ['_id','__v']));
    } catch (error) {
        res.status(401).send(error || 'UNAUTHORIZED REQUEST!');
    }
});

router.post('/register',async (req:Request, res:Response) => {
    // console.log(req.body);
    const idToken = req.body.idToken;
    // const csrfToken = req.body.csrfToken.toString();
    // if (csrfToken !== req.cookies.csrfToken) {
    //     res.status(401).send('UNAUTHORIZED REQUEST!');
    //     return;
    //   }
    const expiresIn = ms('5d');
    try {
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn })
        const options = { maxAge: expiresIn, httpOnly: true, secure: isDev?false:true };
        res.cookie('session', sessionCookie, options);
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        const {uid ,email} = decodedIdToken;
        const user = await User.findById(uid);
        if (user) {
            throw new Error('User already exists!');
            }
        const newUser = new User({
           _id:uid,
            name:req.body.name,
            surname:req.body.surname,
            username:req.body.username,
            avatar:req.body.avatar,
            role:req.body.role
        })
        await newUser.save()
        const sentData ={...newUser.toObject(),email,isAuthenticated: true }
        return res.status(200).send(_.omit(sentData, ['_id','__v']));
    } catch (error) {
        let message ={
            codeError: error,
            message: 'UNAUTHORIZED REQUEST!'
        }
        res.status(401).send(message);
    }
})
 
router.post('/update/profile',jwtMiddleware,async (req:Request, res:Response) => {
    // console.log(req.body);
    const idToken = req.body.idToken;
    // const csrfToken = req.body.csrfToken.toString();
    // if (csrfToken !== req.cookies.csrfToken) {
    //     res.status(401).send('UNAUTHORIZED REQUEST!');
    //     return;
    //   }
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        const {uid ,email} = decodedIdToken;
        const user = await User.findById(uid);
        if (!user) {
            throw new Error('User not found!');
            }
        user.name = req.body.name
        user.surname = req.body.surname
        user.username = req.body.username
        user.avatar = req.body.avatar
        await user.save()
        const sentData ={...user.toObject(),email,message:"Update profile successfully",isAuthenticated: true }
        return res.status(200).send(_.omit(sentData, ['_id','__v']));
    } catch (error) {
      console.log(error)
      res.status(401).send(error || 'UNAUTHORIZED REQUEST!');
    }
  }
)
router.post('/update/password',jwtMiddleware,async (req:Request, res:Response) => {
    // console.log(req.body);
    const idToken = req.body.idToken;
    // const csrfToken = req.body.csrfToken.toString();
    // if (csrfToken !== req.cookies.csrfToken) {
    //     res.status(401).send('UNAUTHORIZED REQUEST!');
    //     return;
    //   }
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        const {uid ,email} = decodedIdToken;
        await admin.auth().updateUser(uid, {
            password: req.body.password,
          });
        return res.status(200).send({message:"Update password successfully"});
    } catch (error) {
      console.log(error)
      const message ={
        codeError: error,
        message: 'UNAUTHORIZED REQUEST!'
      }
      res.status(401).send(message);
    }
  }
)
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
router.get('/logout', (req:Request, res:Response) => {
    // console.log("logout  route")
    res.clearCookie('session');
    res.status(200).send({ message: 'Logout successful' });
});





export default router;
