import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quizRouter from "./quiz";
import standingsRouter from "./standings";
import predictRouter from "./predict";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quizRouter);
router.use(standingsRouter);
router.use(predictRouter);

export default router;
