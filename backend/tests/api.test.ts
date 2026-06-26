import request from 'supertest';
import app from '../src/app';
import { conversationStore } from '../src/storage/memory.store';


beforeEach(() => {
  conversationStore.clear();
});

describe('Health Check', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

        expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('provider');
  });
});

describe('POST /api/form/generate', () => {
  it('returns 400 for missing prompt', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for empty prompt', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({ prompt: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('generates a registration form schema', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({ prompt: 'Create a user registration form with name, email, and password' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('conversationId');
    expect(res.body).toHaveProperty('version', 1);
    expect(res.body).toHaveProperty('schema');
    expect(res.body.schema).toHaveProperty('$schema', 'http://json-schema.org/draft-07/schema#');
    expect(res.body.schema).toHaveProperty('type', 'object');
    expect(res.body.schema).toHaveProperty('properties');
    expect(res.body.schema.properties).toHaveProperty('name');
    expect(res.body.schema.properties).toHaveProperty('email');
    expect(res.body.schema.properties).toHaveProperty('password');
  });

  it('returns clarification for ambiguous prompt', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({ prompt: 'Make a form for booking a meeting room' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'clarification_needed');
    expect(res.body).toHaveProperty('conversationId');
    expect(res.body).toHaveProperty('questions');
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions.length).toBeGreaterThan(0);
  });

  it('supports multi-turn conversation with schema evolution', async () => {

    const res1 = await request(app)
      .post('/api/form/generate')
      .send({ prompt: 'Create a user registration form with name, email, and password' });

    expect(res1.status).toBe(200);
    expect(res1.body.status).toBe('success');
    const conversationId = res1.body.conversationId;
    const v1Properties = Object.keys(res1.body.schema.properties);


    const res2 = await request(app)
      .post('/api/form/generate')
      .send({
        prompt: 'Add a phone number field',
        conversationId,
      });

    expect(res2.status).toBe(200);
    expect(res2.body.status).toBe('success');
    expect(res2.body.version).toBe(2);
    expect(res2.body.schema.properties).toHaveProperty('phone');


    if (res2.body.diff) {
      expect(res2.body.diff).toHaveProperty('changes');
      expect(res2.body.diff).toHaveProperty('fromVersion', 1);
      expect(res2.body.diff).toHaveProperty('toVersion', 2);
    }
  });

  it('returns 404 for invalid conversationId', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({
        prompt: 'Test prompt',
        conversationId: '00000000-0000-0000-0000-000000000000',
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 when mock_llm_failure is set', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({
        prompt: 'Create a simple form',
        mock_llm_failure: true,
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('Failed to generate valid schema');
  });

  it('generates a contact form schema', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({ prompt: 'Build a contact form' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.schema.properties).toHaveProperty('email');
    expect(res.body.schema.properties).toHaveProperty('message');
  });

  it('generates a survey schema', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({ prompt: 'Create a customer feedback survey' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.schema.properties).toHaveProperty('rating');
  });
});

describe('Schema Validation', () => {
  it('generated schemas always have required Draft-07 fields', async () => {
    const res = await request(app)
      .post('/api/form/generate')
      .send({ prompt: 'Create a signup form with email and password' });

    expect(res.status).toBe(200);
    const schema = res.body.schema;


    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
    expect(typeof schema.properties).toBe('object');


    for (const [key, prop] of Object.entries(schema.properties as Record<string, any>)) {
      expect(prop).toHaveProperty('type');
    }
  });
});

describe('Conversations History & Submissions API', () => {
  it('performs CRUD and submits data on conversations', async () => {

    const genRes = await request(app)
      .post('/api/form/generate')
      .send({ prompt: 'Create contact form' });
    expect(genRes.status).toBe(200);
    const convId = genRes.body.conversationId;


    const listRes = await request(app).get('/api/form/conversations');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.some((c: any) => c.id === convId)).toBe(true);


    const detailRes = await request(app).get(`/api/form/conversations/${convId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.conversationId).toBe(convId);


    const submitRes = await request(app)
      .post(`/api/form/conversations/${convId}/submissions`)
      .send({ name: 'John Doe', email: 'john@example.com' });
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.status).toBe('success');
    expect(submitRes.body.submission.data).toEqual({ name: 'John Doe', email: 'john@example.com' });


    const subListRes = await request(app).get(`/api/form/conversations/${convId}/submissions`);
    expect(subListRes.status).toBe(200);
    expect(subListRes.body).toHaveLength(1);
    expect(subListRes.body[0].data).toEqual({ name: 'John Doe', email: 'john@example.com' });


    const deleteRes = await request(app).delete(`/api/form/conversations/${convId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.status).toBe('success');


    const checkRes = await request(app).get(`/api/form/conversations/${convId}`);
    expect(checkRes.status).toBe(404);

    const delete404 = await request(app).delete(`/api/form/conversations/${convId}`);
    expect(delete404.status).toBe(404);

    const submit404 = await request(app)
      .post(`/api/form/conversations/${convId}/submissions`)
      .send({});
    expect(submit404.status).toBe(404);

    const subList404 = await request(app).get(`/api/form/conversations/${convId}/submissions`);
    expect(subList404.status).toBe(404);
  });
});

