import express, { Request, Response } from 'express'
import User from '../../models/user'
import _ from 'lodash'



const updateImageProfileUrl =async (req: Request, res: Response) => {
    console.log("updateImageProfileUrl",req.body)
    try {
        const { uid, email } = req.user!
        const user = await User.findById(uid)
        if (!user) {
          throw new Error('User not found!')
        }
        user.avatar = req.body.avatar
        await user.save()
        return res.status(200).send({avatar: user.avatar})
      } catch (error) {
        console.log(error)
        const message = {
          codeError: error,
          message: 'UNAUTHORIZED REQUEST!',
        }
        res.status(401).send(message)
      }
}
export default updateImageProfileUrl
