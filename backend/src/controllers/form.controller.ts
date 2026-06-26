import { Request, Response } from 'express';
import { z } from 'zod';
import { generateForm } from '../services/form.service';
import { asyncHandler } from '../middlewares/errorHandler';
import { conversationStore } from '../storage/memory.store';
import { logger } from '../utils/logger';




const generateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(5000, 'Prompt too long'),
  conversationId: z.string().uuid().optional(),
  mock_llm_failure: z.boolean().optional(),
});





export const handleGenerateForm = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {

    const validation = generateRequestSchema.safeParse(req.body);

    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ');
      logger.warn('Invalid request body', { errors });
      res.status(400).json({ error: `Invalid request: ${errors}` });
      return;
    }

    const { prompt, conversationId, mock_llm_failure } = validation.data;

    logger.info('Generating form', {
      conversationId: conversationId || 'new',
      promptLength: prompt.length,
    });


    const result = await generateForm({
      prompt,
      conversationId,
      mock_llm_failure,
    });


    const statusCode = result.status === 'clarification_needed' ? 200 : 200;
    res.status(statusCode).json(result);
  },
);





export const handleGetConversations = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const list = conversationStore.getAll();
    const response = list.map((c) => {
      const schema = conversationStore.getCurrentSchema(c.conversationId);
      return {
        id: c.conversationId,
        title: schema?.title || 'Untitled Form',
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
        version: c.currentVersion,
        messageCount: c.messages.length,
      };
    });
    res.status(200).json(response);
  },
);





export const handleGetConversation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const conversation = conversationStore.get(id);
    if (!conversation) {
      res.status(404).json({ error: `Conversation ${id} not found` });
      return;
    }
    res.status(200).json(conversation);
  },
);





export const handleDeleteConversation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const deleted = conversationStore.delete(id);
    if (!deleted) {
      res.status(404).json({ error: `Conversation ${id} not found` });
      return;
    }
    res.status(200).json({ status: 'success', message: 'Conversation deleted' });
  },
);





export const handleSubmitForm = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const conversation = conversationStore.get(id);
    if (!conversation) {
      res.status(404).json({ error: `Conversation ${id} not found` });
      return;
    }
    const submission = conversationStore.addSubmission(id, req.body);
    res.status(200).json({ status: 'success', submission });
  },
);





export const handleGetSubmissions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const conversation = conversationStore.get(id);
    if (!conversation) {
      res.status(404).json({ error: `Conversation ${id} not found` });
      return;
    }
    const submissions = conversationStore.getSubmissions(id);
    res.status(200).json(submissions);
  },
);
