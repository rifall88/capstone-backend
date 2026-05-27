import { registerUserAdmin, findEmail } from "../src/models/userModel.js";
import { createProfile } from "../src/models/profileModel.js";
import pool from "../src/databases/dbConfig.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  try {
    const email = process.env.MAIL_USER;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await registerUserAdmin({
      id: userId,
      username: "admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    await createProfile({
      id: uuidv4(),
      user_id: userId,
      full_name: "Super Admin",
    });

    console.log("Successfully created admin user");
  } catch (error) {
    console.error("Failed to create admin user: ", error.message);
  } finally {
    await pool.end();
  }
}

main();
