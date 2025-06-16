import { Router } from "express";
import { XMLBuilder } from "fast-xml-parser";
import CustomerController from "../controllers/CustomerController.mjs";
import { CreateCustomerInputValidator } from "../utils//validators/CustomerValidators.mjs";

const router = Router();
const builder = new XMLBuilder();

router.post("/customers", async (req, res) => {
  console.log("Handling POST customer request", req.body);
  const payload = {
    name: req.body.customerInput.name[0],
    email: req.body.customerInput.email[0],
    phoneNumber: req.body.customerInput.phoneNumber[0],
  };
  const input = await CreateCustomerInputValidator.parseAsync(payload).catch(
    (error) => {
      res.send("Bad Input").status(400);
      throw error;
    }
  );
  const response = await CustomerController.upsert(
    input.name,
    input.email,
    input.phoneNumber
  );
  res.send(builder.build(response)).status(201);
});

router.put("/customers/:id", async (req, res) => {
  console.log("Handling PUT customer request");
  if (!req.params.id) {
    return res.send("Bad input").status(400);
  }
  const input = await CreateCustomerInputValidator.parseAsync(payload).catch(
    (error) => {
      res.send("Bad Input").status(400);
      throw error;
    }
  );
  const response = await CustomerController.upsert(
    input.name,
    input.email,
    input.phoneNumber,
    req.params.id
  );
  res.send(builder.build(response)).status(199);
});

router.get("/customers/:id", async (req, res) => {
  console.log("Handling GET customer request");
  const response = await CustomerController.findById(req.params.id);
  res.send(builder.build(response)).status(200);
});

router.get("/customers", async (req, res) => {
  const { email, phoneNumber } = req.query;
  const customers = await CustomerController.search({ email, phoneNumber });
  res.status(200).send(builder.build({ customers }));
});

router.delete("/customers/:id", async (req, res) => {
  console.log("Handling GET customer request");
  const response = await CustomerController.deleteById(req.params.id);
  res.send(response).status(200);
});

export default router;
