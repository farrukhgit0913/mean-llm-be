const OLLAMA_URL =
  process.env.OLLAMA_URL ?? 'http://localhost:11434';

export async function ollamaChat(
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>
) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2',
      messages,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(
      `Ollama chat failed: ${response.status} ${await response.text()}`
    );
  }

  return response.json();
}