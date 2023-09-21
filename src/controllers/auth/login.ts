import express, { Request, Response } from 'express'
import User from '../../models/user'
import _ from 'lodash'
import ms from 'ms'
import admin from '../../Authentication/FirebaseAdmin/admin'
import isDev from '../../utils/isDev'
const login = async (req: Request, res: Response) => {
  // console.log(req.body)
  const idToken = req.body.idToken
  // const csrfToken = req.body.csrfToken.toString();
  // if (csrfToken !== req.cookies.csrfToken) {
  //     res.status(401).send('UNAUTHORIZED REQUEST!');
  //     return;
  //   }
  if (!idToken) {
    return res.status(400).send('ID token is missing');
  }
  const expiresIn = ms('2d')

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedIdToken;

    // Check if user exists in your database
    const user = await User.findById(uid);
    if (!user) {
      return res.status(404).send('User not found in the database');
    }
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    let options: any = { maxAge: expiresIn, httpOnly: true, secure: false };
    if (!isDev) {
      options = {
        ...options,
        secure: true,
        sameSite: 'none',
        domain: 'railway.app',
      };
    }
    
    res.cookie('session', sessionCookie, options);
    const sentData = { ...user.toObject(), email, isAuthenticated: true }
    return res.status(200).send(_.omit(sentData, ['_id', '__v']))
  } catch (error) {
    res.status(401).send(error || 'UNAUTHORIZED REQUEST!')
  }
}
export default login
