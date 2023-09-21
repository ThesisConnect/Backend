import express, { Request, Response } from 'express'
import User from '../../models/user'
import _ from 'lodash'
import ms from 'ms'
import firebaseAdmin from '../../Authentication/FirebaseAdmin/admin'
import isDev from '../../utils/isDev'
const register = async (req: Request, res: Response) => {
  // console.log(req.body);
  const idToken = req.body.idToken
  // const csrfToken = req.body.csrfToken.toString();
  // if (csrfToken !== req.cookies.csrfToken) {
  //     res.status(401).send('UNAUTHORIZED REQUEST!');
  //     return;
  //   }
  const expiresIn = ms('2d')
  try {
    const sessionCookie = await firebaseAdmin
      .auth()
      .createSessionCookie(idToken, { expiresIn })
    let options: object = { maxAge: expiresIn, httpOnly: true, secure: false }
    if (!isDev) {
      options = {
        ...options,
        secure: true,
        sameSite: 'none',
        domain: 'railway.app',
      }
    }
    res.cookie('session', sessionCookie, options)
    const decodedIdToken = await firebaseAdmin.auth().verifyIdToken(idToken)
    const { uid, email } = decodedIdToken
    const user = await User.findById(uid)
    if (user) {
      throw new Error('User already exists!')
    }
    const newUser = new User({
      _id: uid,
      name: req.body.name,
      surname: req.body.surname,
      username: req.body.username,
      avatar: req.body.avatar,
      role: req.body.role,
    })
    await newUser.save()
    const sentData = { ...newUser.toObject(), email, isAuthenticated: false }
    return res.status(200).send(_.omit(sentData, ['_id', '__v']))
  } catch (error) {
    let message = {
      codeError: error,
      message: 'UNAUTHORIZED REQUEST!',
    }
    res.status(401).send(message)
  }
}
export default register
