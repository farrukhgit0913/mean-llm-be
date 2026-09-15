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

const upload = multer({
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

      console.log(
        '[DOCUMENT] Upload received:',
        req.file.originalname
      );

      const text =
        req.file.buffer.toString('utf-8');

      console.log(
        '[DOCUMENT] Text length:',
        text.length
      );

      const result =
        await ingestDocument(
          req.file.originalname,
          text
        );

      console.log(
        '[DOCUMENT] Ingestion successful:',
        result
      );

      res.json(result);

    } catch (error) {
      console.error(
        '[DOCUMENT] Ingestion failed:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      res.status(500).json({
        message: 'Document ingestion failed',
        error: message
      });
    }
  }
);

export default router;