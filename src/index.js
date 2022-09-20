import express from "express";
import cors from "cors";
import { router } from "./routes";
import { port } from "./variables";

const app = express();

app.use(cors())
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

app.listen(port, () => console.log(`Zoom app listening at PORT: ${port}`));
