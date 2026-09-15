const OLLAMA_URL =
  process.env.OLLAMA_URL ?? 'http://localhost:11434';

const EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text';

export async function createEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const response = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts
    })
  });

  if (!response.ok) {
    throw new Error(
      `Ollama embedding failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();

  return data.embeddings;
}