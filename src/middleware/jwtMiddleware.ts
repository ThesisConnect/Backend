import express, { NextFunction, Request, Response } from 'express';
import admin from '../Authentication/FirebaseAdmin/admin';

const jwtMiddleware = async(req:Request, res:Response, next:NextFunction) => {
    const token = req.cookies.session || '';
    // console.log(token)
    try {
        // console.log("decode")
        const decoded = await admin.auth().verifySessionCookie(token, true);
        // console.log(decoded)
        if (!decoded) throw new Error('Validation failed!');
        req.user = {
            uid:decoded.uid,
            email:decoded.email!
        }
        next();
    }
    catch (error) {
      res.status(200).send({ isAuthenticated: false });
    }
  };

export default jwtMiddleware;