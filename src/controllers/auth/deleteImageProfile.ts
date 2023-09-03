import express, { Request, Response } from 'express'
import User from '../../models/user'
import _ from 'lodash'

const deleteImageProfileUrl =async (req: Request, res: Response) => {
  console.log("deleteImageProfileUrl",req.body)
  try{
    const { uid, email } = req.user!
    const user = await User.findById(uid)
    if (!user) {
      throw new Error('User not found!')
    }
    user.avatar = undefined
    await user.save()
    return res.status(200).send({message: 'Delete image profile success!'})
  } catch (error) {
    console.log(error)
    const message = {
      codeError: error,
      message: 'UNAUTHORIZED REQUEST!',
    }
    res.status(401).send(message)
  }
}
export default deleteImageProfileUrl
