import express, { Request, Response } from 'express'

import _ from 'lodash'
import isDev from '../../utils/isDev'
const logout =(req: Request, res: Response) => {
    let options: object = {
      httpOnly: true,
      secure: false,
    }
  
    if (!isDev) {
      options = {
        ...options,
        secure: true,
        sameSite: 'none',
      }
    }
    // console.log("logout  route")
    res.clearCookie('session', options)
    res.status(200).send({ message: 'Logout successful' })
  }
export default logout

