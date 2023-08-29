import express, { NextFunction, Request, Response } from 'express';
import admin from '../Authentication/FirebaseAdmin/admin';
const jwtMiddleware = async(req:Request, res:Response, next:NextFunction) => {
    const token = req.cookies.session || '';
    try {
        const decoded = admin.auth().verifySessionCookie(token, true);
        if (!decoded) throw new Error('Validation failed!');
        const user =await admin.auth().verifyIdToken(token);
        req.user = {
            uid:user.uid,
            email:user.email!
        }
        console.log(user.uid);
        next();
    }
    catch (error) {
        res.redirect('http://localhost:3000/login');
    }
  };

export default jwtMiddleware;