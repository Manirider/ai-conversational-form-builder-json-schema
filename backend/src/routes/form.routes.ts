import { Router } from 'express';
import {
  handleGenerateForm,
  handleGetConversations,
  handleGetConversation,
  handleDeleteConversation,
  handleSubmitForm,
  handleGetSubmissions,
} from '../controllers/form.controller';

const router = Router();





router.post('/generate', handleGenerateForm);





router.get('/conversations', handleGetConversations);





router.get('/conversations/:id', handleGetConversation);





router.delete('/conversations/:id', handleDeleteConversation);





router.post('/conversations/:id/submissions', handleSubmitForm);





router.get('/conversations/:id/submissions', handleGetSubmissions);

export default router;
