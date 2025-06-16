import express from "express";
import bodyParser from "body-parser";
import bodyParserXml from "body-parser-xml";
import dotenv from "dotenv";
import root from "./api/root.mjs";
import morgan from "morgan";
bodyParserXml(bodyParser);

dotenv.config({
  override: true,
});

const app = express();
const port = 3000;

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.xml());

app.get("/api/checkhealth", (req, res) => {
  res.send("Hello World");
});

app.use("/api/", root);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
