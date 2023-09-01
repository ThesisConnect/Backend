import express from 'express';
import test from './test';
import user from "./user";
import project from "./project";
const router = express.Router();

router.use('/test', test);
router.use('/user', user);
router.use('/project', project);

export default router;
