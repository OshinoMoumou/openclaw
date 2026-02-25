/**
 * Chunk Feishu markdown text with code block awareness.
 * When a chunk boundary falls inside a code block, automatically
 * closes and reopens the code fence to prevent rendering issues.
 */
export function chunkFeishuMarkdown(text: string, limit: number): string[] {
  if (!text) return [];
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let currentChunk = "";
  let inCodeBlock = false;
  let codeBlockLang = "";

  const lines = text.split("\n");
  for (const line of lines) {
    const isCodeFence = line.trim().startsWith("```");
    const addedLen = currentChunk.length === 0 ? line.length : line.length + 1;

    // If adding this line exceeds the limit and we have content
    if (currentChunk.length + addedLen > limit && currentChunk.length > 0) {
      if (inCodeBlock) {
        // Close code block at chunk boundary
        chunks.push(currentChunk + "\n```");
        currentChunk = "```" + codeBlockLang + "\n" + line;
      } else {
        chunks.push(currentChunk);
        currentChunk = line;
      }
    } else {
      currentChunk += (currentChunk.length === 0 ? "" : "\n") + line;
    }

    // Update code block state AFTER processing the line
    if (isCodeFence) {
      if (inCodeBlock) {
        inCodeBlock = false;
        codeBlockLang = "";
      } else {
        inCodeBlock = true;
        const match = line.match(/^```([a-zA-Z0-9_+-]*)/);
        codeBlockLang = match ? match[1] : "";
      }
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}
