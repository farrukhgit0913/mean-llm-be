import {
  Router,
  Request,
  Response
} from 'express';

import multer from 'multer';

import {
  ingestDocument
} from '../services/document.service.js';

const router = Router();

const upload =
  multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: 10 * 1024 * 1024
    }
  });

router.post(
  '/upload',
  upload.single('file'),

  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (!req.file) {
        res.status(400).json({
          message: 'File is required'
        });

        return;
      }

      const text =
        req.file.buffer.toString('utf-8');

      const result =
        await ingestDocument(
          req.file.originalname,
          text
        );

      res.json(result);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: 'Document ingestion failed'
      });
    }
  }
);

export default router;