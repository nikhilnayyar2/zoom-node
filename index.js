import express from "express";
import { router } from "./src/routes";
import { port } from "./src/variables";

const app = express();

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

app.listen(port, () => console.log(`Zoom app listening at PORT: ${port}`));
