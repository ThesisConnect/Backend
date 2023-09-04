import express, { Request, Response } from 'express'
import User from '../../models/user'
import _ from 'lodash'
import firebaseAdmin from '../../Authentication/FirebaseAdmin/admin'
const updateProfile = async (req: Request, res: Response) => {
  // console.log(req.body);
  const idToken = req.body.idToken
  // const csrfToken = req.body.csrfToken.toString();
  // if (csrfToken !== req.cookies.csrfToken) {
  //     res.status(401).send('UNAUTHORIZED REQUEST!');
  //     return;
  //   }
  try {
    const { uid, email } = req.user!
    const user = await User.findById(uid)
    if (!user) {
      throw new Error('User not found!')
    }
    user.name = req.body.name || user.name
    user.surname = req.body.surname || user.surname
    user.username = req.body.username || user.username
    user.avatar = req.body.avatar
    await user.save()
    const sentData = {
      ...user.toObject(),
      email,
      isAuthenticated: true,
    }
    if (req.body.newpassword) {
      await firebaseAdmin.auth().updateUser(uid, {
        password: req.body.newpassword,
      })
    }
    return res.status(200).send(_.omit(sentData, ['_id', '__v']))
  } catch (error) {
    console.log(error)
    const message = {
      codeError: error,
      message: 'UNAUTHORIZED REQUEST!',
    }
    res.status(401).send(message)
  }
}
export default updateProfile
