import express, { NextFunction, Request, Response } from 'express';
import admin from './FirebaseAdmin/admin';
import User from '../models/user';
import jwtMiddleware from '../middleware/jwtMiddleware';
import ms from 'ms';
import { log } from 'console';
import * as _ from 'lodash';
const router = express.Router();

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
        const options = { maxAge: expiresIn, httpOnly: true, secure: false };
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
        const options = { maxAge: expiresIn, httpOnly: true, secure: false };
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
        res.status(401).send(error || 'UNAUTHORIZED REQUEST!');
    }
})

router.get('/logout', (req:Request, res:Response) => {
    // console.log("logout  route")
    res.clearCookie('session');
    res.status(200).send({ message: 'Logout successful' });
});




export default router;
