import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quizRouter from "./quiz";
import standingsRouter from "./standings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quizRouter);
router.use(standingsRouter);

export default router;
