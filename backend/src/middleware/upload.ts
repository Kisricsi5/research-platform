import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { Request } from 'express';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(env.upload.dir, 'cvs');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cv-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(env.upload.dir, 'avatars');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

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

const maxSize = (env.upload.maxSizeMb) * 1024 * 1024;

export const uploadCV = multer({ storage: cvStorage, fileFilter: pdfFilter, limits: { fileSize: maxSize } });
export const uploadAvatar = multer({ storage: avatarStorage, fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } });
