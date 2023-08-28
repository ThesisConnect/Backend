import express, { NextFunction, Request, Response } from 'express';

import admin from 'firebase-admin';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import jwtMiddleware from '../middleware/jwtMiddleware';
const router = express.Router();

router.get('/auth-status', jwtMiddleware, (req:Request, res:Response) => {
    if (req.user) {
      res.status(200).send({ isAuthenticated: true });
    } else {
      res.status(200).send({ isAuthenticated: false });
    }
  });

router.get('/login',async (req:Request, res:Response) => {
   const token = req.body.token ;
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const userData = await admin.auth().verifyIdToken(token);
        const uid = userData.uid;
        const userRecord = await User.findById(uid);
        
        if (!userRecord) {
            return res.status(401).send('Not found');
        }
        const customToken = jwt.sign({ uid }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        res.cookie('token', customToken, { httpOnly: true });
        return res.status(200).send({...userRecord.toObject(),"email":userData.email});
    } catch (err) {
        return res.status(401).send('Unauthorized');
    }

});

router.get('/register',async (req:Request, res:Response) => {
    const idToken = req.body.token;
    try {
      const userData = await admin.auth().verifyIdToken(idToken);
      const uid = userData.uid;
  
      // Check if user already exists
      let user = await User.findById(uid);
  
      if (!user) {
        // Create a new user if not exists
        user = new User({
            _id: uid,
            name: req.body.name,
            surname: req.body.surname,
            username: req.body.username,
            avatar: req.body.avatar,
        });
        await user.save();
      }
      // Generate JWT token and save in httpOnly cookie
      const jwtToken = jwt.sign({ uid }, process.env.JWT_SECRET!, { expiresIn: '1d' });
      res.cookie('token', jwtToken, { httpOnly: true });
      const data ={...user.toObject(),email:userData.email,message:"Registration successful"}
      res.status(200).send(data);
    } catch (error) {
      res.status(403).send({ message: 'Invalid Firebase token' });
    }

})

router.get('/logout', (req:Request, res:Response) => {
    res.clearCookie('token');
    res.status(200).send({ message: 'Logout successful' });
});




export default router;
