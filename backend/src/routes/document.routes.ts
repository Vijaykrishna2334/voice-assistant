import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { documentService } from '../services/document.service';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/documents/upload
 * Upload a document
 */
router.post('/upload', uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user!.id;
    const { originalname, mimetype, size, path: filePath } = req.file;

    // Extract text from document
    const extractedText = await documentService.extractText(filePath, mimetype);
    const sanitizedText = documentService.sanitizeText(extractedText);

    // Save document metadata
    const document = await prisma.document.create({
      data: {
        userId,
        filename: originalname,
        fileType: mimetype,
        fileSize: size,
        filePath,
        extractedText: sanitizedText,
      },
    });

    res.status(201).json({
      documentId: document.id,
      filename: document.filename,
      extractedText: sanitizedText.substring(0, 500) + '...', // Preview
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/documents
 * Get all user documents
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        filename: true,
        fileType: true,
        fileSize: true,
        uploadedAt: true,
      },
    });

    res.json(documents);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/documents/:id
 * Get a specific document
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error: any) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from disk
    await documentService.deleteFile(document.filePath);

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
