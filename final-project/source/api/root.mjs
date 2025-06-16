import { Router } from "express";
import customers from "./customers.mjs";
import products from "./products.mjs";

const router = Router();

router.use(customers);
router.use(products);

export default router;
