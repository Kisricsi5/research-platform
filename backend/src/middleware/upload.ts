import multer from 'multer';
import multerS3 from 'multer-s3';
import { Request } from 'express';
import { s3Client, S3_BUCKET } from '../config/s3';
import { env } from '../config/env';

const maxSize = env.upload.maxSizeMb * 1024 * 1024;

function pdfFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
}

function imageFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
}

export const uploadCV = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      cb(null, `cvs/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
    },
  }),
  fileFilter: pdfFilter,
  limits: { fileSize: maxSize },
});

export const uploadAvatar = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      cb(null, `avatars/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
