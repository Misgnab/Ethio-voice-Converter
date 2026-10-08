import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export interface DocumentParseResult {
  text: string;
  charCount: number;
  wordCount: number;
  format: 'pdf' | 'docx' | 'txt' | 'md';
}

/**
 * Extracts plain text from supported document file buffers.
 * Supported formats: PDF, DOCX, TXT, MD.
 * Never fakes or returns placeholder text.
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<DocumentParseResult> {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const maxBytes = 15 * 1024 * 1024; // 15MB limit

  if (buffer.length > maxBytes) {
    throw new Error('File exceeds the 15MB size limit.');
  }

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    try {
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      await parser.destroy();

      const text = (textResult?.text || '').trim();
      if (!text) {
        throw new Error('PDF contained no extractable textual characters (it may be a scanned image only).');
      }

      return {
        text,
        charCount: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        format: 'pdf'
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from PDF: ${err.message}`);
    }
  }

  if (
    ext === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value || '').trim();
      if (!text) {
        throw new Error('Word document contains no extractable text.');
      }
      return {
        text,
        charCount: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        format: 'docx'
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from DOCX: ${err.message}`);
    }
  }

  if (ext === 'txt' || ext === 'md' || mimeType?.startsWith('text/')) {
    try {
      const text = buffer.toString('utf-8').trim();
      if (!text) {
        throw new Error('Text document is empty.');
      }
      return {
        text,
        charCount: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        format: ext === 'md' ? 'md' : 'txt'
      };
    } catch (err: any) {
      throw new Error(`Failed to read text file: ${err.message}`);
    }
  }

  throw new Error(`Unsupported document format '.${ext}'. Please upload a PDF, Word (.docx), Plain Text (.txt), or Markdown (.md) document.`);
}
