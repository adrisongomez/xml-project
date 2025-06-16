import { Router } from "express";
import customers from './customers.mjs'

const router = Router();

router.use(customers);

export default router;
