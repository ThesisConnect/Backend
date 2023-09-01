import express from 'express';
import test from './test';
import user from "./user";
import project from "./project";
import plan from "./plan";
const router = express.Router();

router.use('/test', test);
router.use('/user', user);
router.use('/project', project);
router.use('/plan', plan);

export default router;
