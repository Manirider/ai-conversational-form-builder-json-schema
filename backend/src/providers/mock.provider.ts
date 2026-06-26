import { ConversationMessage } from '../types';
import { BaseAIProvider } from './base.provider';
import { logger } from '../utils/logger';





const MOCK_SCHEMAS: Record<string, object> = {
  registration: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'User Registration Form',
    description: 'A form for registering new users',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Full Name',
        description: 'Enter your full name',
        minLength: 2,
        maxLength: 100,
      },
      email: {
        type: 'string',
        title: 'Email Address',
        description: 'Enter your email address',
        format: 'email',
      },
      password: {
        type: 'string',
        title: 'Password',
        description: 'Create a strong password',
        minLength: 8,
        maxLength: 128,
      },
    },
    required: ['name', 'email', 'password'],
  },
  contact: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Contact Form',
    description: 'A form for contacting support',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Your Name',
        description: 'Enter your full name',
        minLength: 1,
      },
      email: {
        type: 'string',
        title: 'Email',
        description: 'Your email address',
        format: 'email',
      },
      subject: {
        type: 'string',
        title: 'Subject',
        description: 'Message subject',
        enum: ['General Inquiry', 'Support', 'Feedback', 'Bug Report'],
      },
      message: {
        type: 'string',
        title: 'Message',
        description: 'Your message',
        minLength: 10,
        maxLength: 2000,
      },
      priority: {
        type: 'string',
        title: 'Priority',
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
      },
    },
    required: ['name', 'email', 'subject', 'message'],
  },
  survey: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Customer Satisfaction Survey',
    description: 'A survey to gather customer feedback',
    type: 'object',
    properties: {
      rating: {
        type: 'integer',
        title: 'Overall Rating',
        description: 'Rate your experience from 1 to 5',
        minimum: 1,
        maximum: 5,
      },
      recommend: {
        type: 'boolean',
        title: 'Would you recommend us?',
        description: 'Would you recommend our service to others?',
        default: false,
      },
      feedback: {
        type: 'string',
        title: 'Additional Feedback',
        description: 'Share any additional thoughts',
        maxLength: 1000,
      },
      category: {
        type: 'string',
        title: 'Feedback Category',
        enum: ['Product', 'Service', 'Support', 'Pricing', 'Other'],
      },
    },
    required: ['rating', 'recommend'],
  },
  default: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Dynamic Form',
    description: 'An AI-generated form',
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        title: 'First Name',
        description: 'Enter your first name',
        minLength: 1,
      },
      lastName: {
        type: 'string',
        title: 'Last Name',
        description: 'Enter your last name',
        minLength: 1,
      },
      email: {
        type: 'string',
        title: 'Email',
        description: 'Enter your email address',
        format: 'email',
      },
      phone: {
        type: 'string',
        title: 'Phone Number',
        description: 'Enter your phone number',
        pattern: '^\\+?[0-9\\s\\-]+$',
      },
      notes: {
        type: 'string',
        title: 'Additional Notes',
        description: 'Any additional information',
        maxLength: 500,
      },
    },
    required: ['firstName', 'lastName', 'email'],
  },
};




const PHONE_ADDITION = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'User Registration Form',
  description: 'A form for registering new users',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      description: 'Enter your full name',
      minLength: 2,
      maxLength: 100,
    },
    email: {
      type: 'string',
      title: 'Email Address',
      description: 'Enter your email address',
      format: 'email',
    },
    password: {
      type: 'string',
      title: 'Password',
      description: 'Create a strong password',
      minLength: 8,
      maxLength: 128,
    },
    phone: {
      type: 'string',
      title: 'Phone Number',
      description: 'Enter your phone number with country code',
      pattern: '^\\+?[0-9\\s\\-]+$',
    },
  },
  required: ['name', 'email', 'password', 'phone'],
};




const AMBIGUOUS_PATTERNS = [
  /book(ing)?\s+(a\s+)?meeting\s+room/i,
  /make\s+a\s+form$/i,
  /create\s+a\s+form$/i,
  /build\s+something/i,
  /I\s+need\s+a\s+form/i,
];





export class MockProvider extends BaseAIProvider {
  readonly name = 'mock';
  private shouldFail = false;




  setFailure(fail: boolean): void {
    this.shouldFail = fail;
  }

  async generateSchema(
    messages: ConversationMessage[],
    _systemPrompt: string,
  ): Promise<string> {

    await new Promise((resolve) => setTimeout(resolve, 300));

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user')?.content?.toLowerCase() || '';


    if (this.shouldFail) {
      logger.debug('Mock provider: simulating failure');
      return '{ invalid json response !!!';
    }


    if (AMBIGUOUS_PATTERNS.some((p) => p.test(lastUserMessage))) {
      const clarification = {
        status: 'clarification_needed',
        questions: [
          'How many participants should the form support?',
          'Do you need recurring booking options?',
          'Should the form include equipment/resource selection (e.g., projector, whiteboard)?',
          'Is there a specific time slot format you prefer (e.g., hourly, 30-minute blocks)?',
          'Do you need approval workflow integration?',
        ],
      };
      return JSON.stringify(clarification);
    }



    const hasConversationHistory = messages.length >= 2;
    const hasPriorContext = messages.some(
      (m) => m.role === 'assistant' || (m.role === 'user' && m !== messages[messages.length - 1]),
    );
    if (
      lastUserMessage.includes('phone') &&
      (hasConversationHistory || hasPriorContext)
    ) {
      return JSON.stringify(PHONE_ADDITION);
    }


    if (lastUserMessage.includes('registration') || lastUserMessage.includes('register') || lastUserMessage.includes('sign up') || lastUserMessage.includes('signup')) {
      return JSON.stringify(MOCK_SCHEMAS.registration);
    }

    if (lastUserMessage.includes('contact') || lastUserMessage.includes('support')) {
      return JSON.stringify(MOCK_SCHEMAS.contact);
    }

    if (lastUserMessage.includes('survey') || lastUserMessage.includes('feedback')) {
      return JSON.stringify(MOCK_SCHEMAS.survey);
    }


    return JSON.stringify(MOCK_SCHEMAS.default);
  }
}
