import bcrpt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import User from "../models/user.js"
import dotenv from "dotenv";


dotenv.config();
const secret = process.env.SECRET;

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) return res.status(404).json({ message: "User doesn't exist" });
    const isPasswordCorrect = await bcrpt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, secret, { expiresIn: "1h" });

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    if (error.message === "User doesn't exist") {
      return res.status(404).json({ message: "User doesn't exist" });
    } else if (error.message === "Invalid credentials") {
      return res.status(400).json({ message: "Invalid credentials" });
    } else {
      return res.status(500).json({ message: "Something went wrong" });
    }

  }
}

export const signup = async (req, res) => {
  const { email, password, confirmPassword, name,year,grad,post } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match" });
    const hashedPassword = await bcrpt.hash(password, 12);
    const result = await User.create({ email, password: hashedPassword, name:name,year:year,grad:grad, post:post })
    const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1h" });
    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });

  }
}

export const profile = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, email, year, grad, _id,post } = await User.findById(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json({ name, email,year, grad,post, _id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

