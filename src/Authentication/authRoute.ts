import express, { NextFunction, Request, Response } from 'express';
import admin from './FirebaseAdmin/admin';
import User from '../models/user';
import jwtMiddleware from '../middleware/jwtMiddleware';
const router = express.Router();

router.get('/auth-status', jwtMiddleware, async (req:Request, res:Response) => {
    if (req.user) {
      const { uid ,email} = req.user;
      const user = await User.findById(uid);
      if (!user) {
            res.status(200).send({ isAuthenticated: false });
            return;
       }
      res.status(200).send({...user.toObject(),email,isAuthenticated: true });
    } else {
      res.status(200).send({ isAuthenticated: false });
    }
  });

router.post('/login',async (req:Request, res:Response) => {
    const idToken = req.body.idToken.toString();
    // const csrfToken = req.body.csrfToken.toString();
    // if (csrfToken !== req.cookies.csrfToken) {
    //     res.status(401).send('UNAUTHORIZED REQUEST!');
    //     return;
    //   }
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

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
        return res.status(200).send({...user.toObject(),email,isAuthenticated: true});
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
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
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
        return res.status(200).send({...newUser.toObject(),email,isAuthenticated: true });
    } catch (error) {
        res.status(401).send(error || 'UNAUTHORIZED REQUEST!');
    }
})

router.get('/logout', (req:Request, res:Response) => {
    res.clearCookie('token');
    res.status(200).send({ message: 'Logout successful' });
});




export default router;
