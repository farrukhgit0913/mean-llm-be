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
  process.env.OLLAMA_URL ??
  'http://localhost:11434';


const OLLAMA_CHAT_MODEL =
  process.env.OLLAMA_CHAT_MODEL ??
  'llama3.2';


const chatSchema = z.object({

  message:
    z.string().min(1),

  conversationId:
    z.string().optional()

});


function sendEvent(
  res: Response,
  type: string,
  value?: unknown
): void {

  res.write(
    `data: ${JSON.stringify({
      type,
      ...(value !== undefined
        ? { value }
        : {})
    })}\n\n`
  );

}


router.post(
  '/stream',
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        message
      } =
        chatSchema.parse(
          req.body
        );


      /*
       * ----------------------------------------
       * SSE HEADERS
       * ----------------------------------------
       */

      res.setHeader(
        'Content-Type',
        'text/event-stream'
      );

      res.setHeader(
        'Cache-Control',
        'no-cache, no-transform'
      );

      res.setHeader(
        'Connection',
        'keep-alive'
      );

      res.setHeader(
        'X-Accel-Buffering',
        'no'
      );


      res.flushHeaders();


      /*
       * ----------------------------------------
       * DEMO STATUS
       * ----------------------------------------
       */

      sendEvent(
        res,
        'status',
        'Starting RAG pipeline...'
      );


      /*
       * ----------------------------------------
       * RAG
       * ----------------------------------------
       */

      const {
        prompt,
        sources
      } =
        await buildRagPrompt(
          message,
          status => {

            sendEvent(
              res,
              'status',
              status
            );

          }
        );


      /*
       * ----------------------------------------
       * LLM
       * ----------------------------------------
       */

      sendEvent(
        res,
        'status',
        `Sending request to ${OLLAMA_CHAT_MODEL}...`
      );


      const response =
        await fetch(
          `${OLLAMA_URL}/api/chat`,
          {

            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              model:
                OLLAMA_CHAT_MODEL,

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
          `Ollama chat failed: ` +
          `${response.status} ` +
          `${await response.text()}`
        );

      }


      if (!response.body) {

        throw new Error(
          'Ollama did not return a response body'
        );

      }


      /*
       * ----------------------------------------
       * START GENERATION
       * ----------------------------------------
       */

      sendEvent(
        res,
        'status',
        `Llama 3.2 is generating the answer...`
      );


      const reader =
        response.body.getReader();


      const decoder =
        new TextDecoder();


      let buffer = '';


      /*
       * ----------------------------------------
       * STREAM OLLAMA RESPONSE
       * ----------------------------------------
       */

      while (true) {

        const {
          done,
          value
        } =
          await reader.read();


        if (done) {
          break;
        }


        buffer +=
          decoder.decode(
            value,
            {
              stream: true
            }
          );


        const lines =
          buffer.split('\n');


        buffer =
          lines.pop() ??
          '';


        for (
          const line of lines
        ) {

          if (
            !line.trim()
          ) {
            continue;
          }


          try {

            const data =
              JSON.parse(line);


            const token =
              data.message?.content;


            if (token) {

              sendEvent(
                res,
                'token',
                token
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


      /*
       * ----------------------------------------
       * SOURCES
       * ----------------------------------------
       */

      res.write(
        `data: ${JSON.stringify({
          type: 'sources',
          sources
        })}\n\n`
      );


      /*
       * ----------------------------------------
       * COMPLETE
       * ----------------------------------------
       */

      sendEvent(
        res,
        'status',
        'Answer generated successfully'
      );


      sendEvent(
        res,
        'done'
      );


      res.end();


    } catch (error) {

      console.error(
        'Chat error:',
        error
      );


      if (
        !res.headersSent
      ) {

        res.status(500).json({

          message:
            'Chat failed'

        });

        return;

      }


      sendEvent(
        res,
        'error',
        'Chat failed'
      );


      res.end();

    }

  }
);


export default router;