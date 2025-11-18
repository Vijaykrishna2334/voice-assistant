import { Router } from 'express';
import { conversationService } from '../services/conversation.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user!.id;

    const conversation = await conversationService.createConversation(userId, title);
    res.status(201).json(conversation);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/conversations
 * Get all user conversations
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const conversations = await conversationService.getUserConversations(userId);
    res.json(conversations);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/conversations/:id
 * Get a specific conversation
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const conversation = await conversationService.getConversation(id, userId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/conversations/message
 * Send a message and get AI response
 */
router.post('/message', async (req, res) => {
  try {
    const { message, conversationId, documentIds } = req.body;
    const userId = req.user!.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await conversationService.processMessage(
      userId,
      message,
      conversationId,
      documentIds
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await conversationService.deleteConversation(id, userId);
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
