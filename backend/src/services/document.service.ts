import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export class DocumentService {
  /**
   * Extract text from uploaded document
   */
  async extractText(filePath: string, fileType: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);

      switch (fileType) {
        case 'application/pdf':
          return await this.extractFromPDF(buffer);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDOCX(buffer);

        case 'text/plain':
          return buffer.toString('utf-8');

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  /**
   * Extract text from PDF
   */
  private async extractFromPDF(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }

  /**
   * Extract text from DOCX
   */
  private async extractFromDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  /**
   * Clean and prepare text for AI processing
   */
  sanitizeText(text: string): string {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, ' ').trim();

    // Remove special characters that might interfere with prompts
    cleaned = cleaned.replace(/[^\w\s.,!?;:()\-'"]/g, '');

    // Limit length for context window
    const maxLength = 50000; // ~12k tokens
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength) + '... [truncated]';
    }

    return cleaned;
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}

export const documentService = new DocumentService();
