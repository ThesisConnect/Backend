import express from 'express';
import test from './test';
import user from "./user";
import project from "./project";
import summary from "./summary";
const router = express.Router();

router.use('/test', test);
router.use('/user', user);
router.use('/project', project);
router.use('/summary', summary);

export default router;
