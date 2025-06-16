import { Router } from "express";
import { XMLBuilder } from "fast-xml-parser";
import OrderController from "../controllers/OrderController.mjs";
import { OrderInput } from "../utils/validators/OrderValidators.mjs";

const router = Router();
const builder = new XMLBuilder();

router.post("/orders", async (req, res) => {
  try {
    // Extract payload fields as arrays (like customers/products)
    const orderInput = req.body.orderInput;
    console.log(orderInput);
    const payload = {
      customerId: orderInput.customerId[0],
      lineItems: (orderInput.lineItems?.[0]?.lineItem || []).map((item) => ({
        productId: item.productId[0],
        quantity: Number(item.quantity[0]),
      })),
    };
    console.log(payload);
    const input = await OrderInput.parseAsync(payload).catch((error) => {
      console.error(error);
      res.status(400).send(builder.build({ error: "Bad Input" }));
      return null;
    });
    if (!input) return;
    const response = await OrderController.submit(input);
    res.status(201).send(builder.build(response));
  } catch (err) {
    console.log(err);
    res.status(400).send(builder.build({ error: err.message }));
  }
});

router.put("/orders/:id", async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send(builder.build({ error: "Bad input" }));
  }
  try {
    const orderInput = req.body.orderInput;
    const payload = {
      customerId: orderInput.customerId[0],
      orderedAt: orderInput.orderedAt ? orderInput.orderedAt[0] : undefined,
      lineItems: (orderInput.lineItems?.lineItem || []).map((item) => ({
        productId: item.productId[0],
        quantity: Number(item.quantity[0]),
      })),
    };
    const input = await OrderInput.parseAsync(payload).catch((error) => {
      res.status(400).send(builder.build({ error: "Bad Input" }));
      return null;
    });
    if (!input) return;
    const response = await OrderController.update(req.params.id, input);
    if (!response)
      return res.status(404).send(builder.build({ error: "Not found" }));
    res.status(200).send(builder.build(response));
  } catch (err) {
    res.status(400).send(builder.build({ error: err.message }));
  }
});

router.get("/orders/:id", async (req, res) => {
  const response = await OrderController.get(req.params.id);
  if (!response)
    return res.status(404).send(builder.build({ error: "Not found" }));
  res.status(200).send(builder.build(response));
});

router.delete("/orders/:id", async (req, res) => {
  const response = await OrderController.delete(req.params.id);
  if (!response)
    return res.status(404).send(builder.build({ error: "Not found" }));
  res.status(200).send(builder.build({ message: "Order deleted" }));
});

router.get("/orders", async (req, res) => {
  const { from, to } = req.query;
  const response = await OrderController.list({ from, to });
  res.status(200).send(builder.build({ orders: response }));
});

export default router;
