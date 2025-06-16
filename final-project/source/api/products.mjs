import { Router } from "express";
import { XMLBuilder } from "fast-xml-parser";
import ProductController from "../controllers/ProductController.mjs";
import { CreateProductInputValidator } from "../utils/validators/ProductValidators.mjs";

const router = Router();
const builder = new XMLBuilder();

router.post("/products", async (req, res) => {
  const payload = {
    name: req.body.productInput.name[0],
    price: Number(req.body.productInput.price[0]),
    description: req.body.productInput.description?.[0],
  };
  const input = await CreateProductInputValidator.parseAsync(payload).catch(
    (error) => {
      res.status(400).send("Bad Input");
      throw error;
    }
  );
  const response = await ProductController.upsert(
    input.name,
    input.price,
    input.description
  );
  console.log('daddy', response);
  res.status(201).send({ products: builder.build(response) });
});

router.put("/products/:id", async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send("Bad input");
  }
  const payload = {
    name: req.body.productInput.name[0],
    price: Number(req.body.productInput.price[0]),
    description: req.body.productInput.description?.[0],
  };
  const input = await CreateProductInputValidator.parseAsync(payload).catch(
    (error) => {
      res.status(400).send("Bad Input");
      throw error;
    }
  );
  const response = await ProductController.upsert(
    input.name,
    input.price,
    input.description,
    req.params.id
  );
  res.status(200).send(builder.build(response));
});

router.get("/products/:id", async (req, res) => {
  const response = await ProductController.findById(req.params.id);
  if (!response) return res.status(404).send("Not found");
  res.status(200).send(builder.build(response));
});

router.delete("/products/:id", async (req, res) => {
  const response = await ProductController.deleteById(req.params.id);
  if (!response) return res.status(404).send("Not found");
  res.status(200).send("Deleted");
});

router.get("/products", async (req, res) => {
  const q = req.query.q || "";
  const response = await ProductController.search(q);
  res.status(200).send(builder.build({ products: response }));
});

export default router;
