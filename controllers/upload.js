import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import File from "../models/file.js";

dotenv.config(); // Load environment variables

// Initialize S3 client
// Set up multer to use this storage config

// File upload controller
export const uploadFileController = async (req, res) => {
    console.log("here")
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Capture custom name (if provided)
    const customName = req.body.customName || req.file.originalname;
    console.log(customName)
    // Read the file and upload to S3
    const fileStream = fs.createReadStream(req.file.path); // Path of the temporary file

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, // Your S3 bucket name
      Key: `uploads/${Date.now()}-${req.file.originalname}`, // S3 object key (path and filename)
      Body: fileStream,
    };

    // Upload the file to S3
    const command = new PutObjectCommand(uploadParams);
    const data = await s3Client.send(command);

    // After successful upload, get the file URL from S3 response
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${uploadParams.Key}`;

    // Generate a unique ID for the file
    const fileId = Date.now().toString(); // Or use a more robust ID like UUID

    // Save file metadata to MongoDB
    const file = new File({
      filename: customName,
      S3url: s3Url,
      id: fileId, // Generated ID
    });

    // Save the file metadata to MongoDB
    await file.save();

    // Respond with the file URL
    res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: s3Url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: error.message });
  }
};
