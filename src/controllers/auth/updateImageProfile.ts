import express, { Request, Response } from 'express'
import User from '../../models/user'
import _ from 'lodash'
import { generateSignedUrl } from '../services/generateSignedUrl';
import deleteFile from '../services/deleteFile';


const updateImageProfileUrl =async (req: Request, res: Response) => {
    try {
        const url = await generateSignedUrl("imageProfile",'my_profile');
        if(req.body.oldpath){
            const oldpath = req.body.oldpath;
            const oldDirectory = oldpath.split("/")[3];
            const oldFileName = oldpath.split("/")[4];
            await deleteFile(oldDirectory,oldFileName);
        }
        res.json({ url });
      } catch (error) {
        res.status(500).send('Error generating signed URL.');
      }

}
export default updateImageProfileUrl

