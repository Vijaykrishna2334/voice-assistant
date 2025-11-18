import { PrismaClient } from '@prisma/client';
import { openaiService } from './openai.service';
import { documentService } from './document.service';
import { AIMessage } from '../types';

const prisma = new PrismaClient();

export class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(userId: string, title?: string) {
    return await prisma.conversation.create({
      data: {
        userId,
        title: title || 'New Conversation',
      },
    });
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string, userId: string) {
    return await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  /**
   * Process a user message and generate AI response
   */
  async processMessage(
    userId: string,
    message: string,
    conversationId?: string,
    documentIds?: string[]
  ) {
    try {
      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await this.getConversation(conversationId, userId);
        if (!conversation) {
          throw new Error('Conversation not found');
        }
      } else {
        conversation = await this.createConversation(userId);
      }

      // Save user message
      const userMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: message,
          documentIds: documentIds || [],
        },
      });

      // Build conversation history
      const history: AIMessage[] = conversation.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Add current message
      history.push({
        role: 'user',
        content: message,
      });

      // Get document context if provided
      let documentContext: string[] = [];
      if (documentIds && documentIds.length > 0) {
        const documents = await prisma.document.findMany({
          where: {
            id: { in: documentIds },
            userId,
          },
        });

        documentContext = documents
          .map(doc => doc.extractedText)
          .filter(text => text !== null) as string[];
      }

      // Generate AI response
      const { response, emotion, avatarState } = await openaiService.generateResponse(
        history,
        documentContext
      );

      // Save AI message
      const assistantMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: response,
          emotion,
          avatarState,
          documentIds: documentIds || [],
        },
      });

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      // Update context summary periodically (every 5 messages)
      if (conversation.messages.length % 5 === 0) {
        await this.updateConversationContext(conversation.id, history);
      }

      return {
        conversationId: conversation.id,
        messageId: assistantMessage.id,
        response: assistantMessage.content,
        emotion: assistantMessage.emotion,
        avatarState: assistantMessage.avatarState,
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Update conversation context for better long-term memory
   */
  private async updateConversationContext(conversationId: string, messages: AIMessage[]) {
    try {
      const summary = await openaiService.summarizeConversation(messages);

      await prisma.conversationContext.upsert({
        where: { conversationId },
        create: {
          conversationId,
          summary,
        },
        update: {
          summary,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating conversation context:', error);
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    });
  }
}

export const conversationService = new ConversationService();
