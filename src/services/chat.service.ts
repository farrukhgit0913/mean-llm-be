import { retrieveContext } from './rag.service.js';

interface RagChunk {
  content: string;
  filename: string;
  score: number;
}


const RAG_SCORE_THRESHOLD = 0.70;


function buildContext(
  chunks: RagChunk[]
): string {

  return chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}: ${chunk.filename}]\n` +
        chunk.content
    )
    .join('\n\n');

}


export async function buildRagPrompt(
  question: string
) {

  /*
   * Search MongoDB for relevant knowledge.
   */
  const chunks =
    await retrieveContext(
      question,
      5
    );


  console.log(
    'RAG results:',
    chunks.map(chunk => ({
      filename: chunk.filename,
      score: chunk.score
    }))
  );


  /*
   * Only use chunks above the
   * similarity threshold.
   */
  const relevantChunks =
    chunks.filter(
      chunk =>
        chunk.score >=
        RAG_SCORE_THRESHOLD
    );


  /*
   * ------------------------------------------------
   * CASE 1:
   * Relevant information found in MongoDB.
   * ------------------------------------------------
   */
  if (
    relevantChunks.length > 0
  ) {

    const context =
      buildContext(
        relevantChunks
      );


    const prompt = `
You are a helpful AI assistant.

You have access to a knowledge base.

Use the knowledge base context below
when answering the user's question.

Rules:

1. Prefer the knowledge base when it
   contains relevant information.

2. Do not contradict the knowledge base.

3. If the knowledge base only partially
   answers the question, you may use your
   general knowledge to complete the answer.

4. Do not claim that general knowledge
   came from the knowledge base.

5. Give a clear and useful answer.

KNOWLEDGE BASE:
${context}

USER QUESTION:
${question}
`;


    return {
      prompt,
      sources: relevantChunks
    };

  }


  /*
   * ------------------------------------------------
   * CASE 2:
   * No relevant information found.
   *
   * Let the LLM answer using its own
   * general knowledge.
   * ------------------------------------------------
   */

  const prompt = `
You are a helpful AI assistant.

No sufficiently relevant information was
found in the application's knowledge base.

Answer the user's question using your
general knowledge.

Do not pretend that the answer came from
the knowledge base.

Give a clear and useful answer.

USER QUESTION:
${question}
`;


  return {
    prompt,
    sources: []
  };

}