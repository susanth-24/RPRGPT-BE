import express from 'express';
import PdfModel from '../models/file.js'; // Assuming you have a model for PDFs
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import upload from '../multer/multer.js'; // Adjust multer for PDF
import s3Client from '../aws/s3bucket.js'; // Adjust the file extension if needed

const router = express.Router();

router.post('/create', upload.single('pdf'), async (req, res) => {
  try {
    const pdfName = req?.body?.fileName; // You should define this function to generate random names
    
    console.log(pdfName)
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: pdfName,
      Body: req.file.buffer,
      ContentType: 'application/pdf', // Content type for PDF files
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    // Assuming you have a model for PDFs (PdfModel)
    const createPdf = await PdfModel.create({
        filename: pdfName,
        S3url: fileUrl
    });

    res.status(200).send({ message: 'PDF uploaded successfully!', data: createPdf });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

export default router;
