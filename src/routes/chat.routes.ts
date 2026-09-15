import {
  Router,
  Request,
  Response
} from 'express';

import { z } from 'zod';

import {
  buildRagPrompt
} from '../services/chat.service.js';

const router = Router();

const OLLAMA_URL =
  process.env.OLLAMA_URL ?? 'http://localhost:11434';

const OLLAMA_CHAT_MODEL =
  process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2';

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

      const response = await fetch(
        `${OLLAMA_URL}/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: OLLAMA_CHAT_MODEL,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            stream: true
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          `Ollama chat failed: ${response.status} ${await response.text()}`
        );
      }

      if (!response.body) {
        throw new Error(
          'Ollama did not return a response body'
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = '';

      while (true) {
        const {
          done,
          value
        } = await reader.read();

        if (done) break;

        buffer += decoder.decode(
          value,
          { stream: true }
        );

        const lines =
          buffer.split('\n');

        buffer =
          lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data =
              JSON.parse(line);

            const token =
              data.message?.content;

            if (token) {
              res.write(
                `data: ${JSON.stringify({
                  type: 'token',
                  value: token
                })}\n\n`
              );
            }
          } catch (error) {
            console.error(
              'Failed to parse Ollama response:',
              line
            );
          }
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