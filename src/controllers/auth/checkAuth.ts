import express, { Request, Response } from 'express'
import User from '../../models/user'
import _ from 'lodash'
import firebaseAdmin from '../../Authentication/FirebaseAdmin/admin'
const checkAuth =async (req: Request, res: Response) => {
    if (req.user) {
      const { uid, email } = req.user
      const user = await User.findById(uid)
      if (!user) {
        res.status(200).send({ isAuthenticated: false })
        return
      }
      const customToken = await firebaseAdmin.auth().createCustomToken(uid)
      const sentData = { ...user.toObject(),customToken ,email, isAuthenticated: true }
      return res.status(200).send(_.omit(sentData, ['_id', '__v']))
    } else {
      res.status(200).send({ isAuthenticated: false })
    }
}
export default checkAuth
