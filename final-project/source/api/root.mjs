import { Router } from "express";
import customers from "./customers.mjs";
import products from "./products.mjs";
import orders from "./orders.mjs";

const router = Router();

router.use(customers);
router.use(products);
router.use(orders);

export default router;
