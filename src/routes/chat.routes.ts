import {
  Router,
  Request,
  Response
} from 'express';

import { z } from 'zod';

import { openai } from '../services/openai.service.js';
import { env } from '../config/env.js';
import {
  buildRagPrompt
} from '../services/chat.service.js';

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional()
});

router.post(
  '/stream',
  async (req: Request, res: Response) => {

    try {

      const {
        message
      } = chatSchema.parse(req.body);

      const {
        prompt,
        sources
      } = await buildRagPrompt(message);

      res.setHeader(
        'Content-Type',
        'text/event-stream'
      );

      res.setHeader(
        'Cache-Control',
        'no-cache'
      );

      res.setHeader(
        'Connection',
        'keep-alive'
      );

      res.flushHeaders();

      const stream =
        await openai.responses.create({
          model: env.openaiChatModel,

          input: prompt,

          stream: true
        });

      for await (
        const event of stream
      ) {

        if (
          event.type ===
          'response.output_text.delta'
        ) {

          res.write(
            `data: ${JSON.stringify({
              type: 'token',
              value: event.delta
            })}\n\n`
          );
        }
      }

      res.write(
        `data: ${JSON.stringify({
          type: 'sources',
          sources
        })}\n\n`
      );

      res.write(
        `data: ${JSON.stringify({
          type: 'done'
        })}\n\n`
      );

      res.end();

    } catch (error) {

      console.error(error);

      if (!res.headersSent) {
        res.status(500).json({
          message: 'Chat failed'
        });
        return;
      }

      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: 'Chat failed'
        })}\n\n`
      );

      res.end();
    }
  }
);

export default router;