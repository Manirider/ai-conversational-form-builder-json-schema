





const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};




export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}




const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<<\s*SYS\s*>>/i,
  /\bDAN\b.*\bmode\b/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+(if\s+)?you/i,
  /you\s+are\s+now\s+/i,
  /forget\s+(all\s+)?(previous|your)\s+(instructions|rules|constraints)/i,
];





export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}





export function sanitizeInput(input: string, maxLength = 5000): string {
  if (typeof input !== 'string') {
    return '';
  }


  let sanitized = input.trim().slice(0, maxLength);


  sanitized = sanitized.replace(/\0/g, '');


  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}





export function sanitizePromptInput(input: string): {
  sanitized: string;
  injectionDetected: boolean;
} {
  const sanitized = sanitizeInput(input);
  const injectionDetected = detectPromptInjection(sanitized);

  return { sanitized, injectionDetected };
}
