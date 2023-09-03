import express, { Request, Response } from 'express'
import User from '../../models/user'
import _ from 'lodash'
import { generateSignedUrl } from '../services/generateSignedUrl';
import deleteFile from '../services/deleteFile';


const deleteImageProfileUrl =async (req: Request, res: Response) => {
    try {
        const oldpath = req.body.oldpath;
        const oldDirectory = oldpath.split("/")[3];
        const oldFileName = oldpath.split("/")[4];
        await deleteFile(oldDirectory,oldFileName);
      } catch (error) {
        res.status(500).send({message:error});
      }

}
export default deleteImageProfileUrl
