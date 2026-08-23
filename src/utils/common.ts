export const trimText = (
  text: string = "",
  charCount: number = 100,
): string => {
  const cleanText = text.replace(/\s*\n\s*/g, " ").trim();

  if (cleanText.length <= charCount) {
    return cleanText;
  }

  return `${cleanText.slice(0, charCount).trim()}...`;
};

export const generateTitle = (content: string): string => {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return "";
  }

  // Get the first non-empty line
  const firstLine =
    trimmedContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? "";

  // Get the first sentence from the first line
  const sentenceMatch = firstLine.match(/^.*?[.!?](?:\s|$)/);

  if (sentenceMatch) {
    return sentenceMatch[0].trim();
  }

  // No sentence punctuation → use the first line
  return firstLine;
};
