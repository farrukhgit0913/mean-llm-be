import { retrieveContext } from './rag.service.js';

function buildContext(
  chunks: {
    content: string;
    filename: string;
  }[]
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

  const chunks =
    await retrieveContext(question, 5);

  const context =
    buildContext(chunks);

  const prompt = `
You are a helpful AI assistant.

Answer the user's question using the provided
knowledge base context.

Rules:
1. Prefer the provided context.
2. Do not invent information.
3. If the answer is not contained in the context,
   clearly say that you don't know based on the
   available documents.
4. Keep the answer concise but useful.

KNOWLEDGE BASE:

${context}

USER QUESTION:

${question}
`;

  return {
    prompt,
    sources: chunks
  };
}