import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json" with { type: "json" };
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import profileRoute from "./routes/profileRoute.js";
import faceDetectionRoute from "./routes/faceDetectionRoute.js";
import passwordResetRoute from "./routes/passwordResetRoute.js";
import changeEmailRoute from "./routes/changeEmailRoute.js";
import changePasswordRoute from "./routes/changePasswordRoute.js";
import deleteUserRoute from "./routes/deleteUserRoute.js";

dotenv.config();

const app = express();
app.set("trust proxy", true);
const port = process.env.PORT;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/profiles", profileRoute);
app.use("/analytics", faceDetectionRoute);
app.use("/forgot-password", passwordResetRoute);
app.use("/change-email", changeEmailRoute);
app.use("/change-password", changePasswordRoute);
app.use("/delete-user", deleteUserRoute);
app.use("/uploads", express.static("uploads"));

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
