import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json" with { type: "json" };
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import profileRoute from "./routes/profileRoute.js";

dotenv.config();

const app = express();
app.set("trust proxy", true);
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/profiles", profileRoute);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_req, res) => {
  res.send("Welcome to the Digital Twin API!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Penulisan Salah!");
});

app.listen(port, () => {
  console.log(`Server berjalan pada http://0.0.0.0:${port}`);
});
