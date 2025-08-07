
import request from 'supertest';
import app from '../app'; // Assuming your express app is exported from app.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Blog Comment API', () => {
  let token;
  let blogId;
  let userId;

  beforeEach(async () => {
    // Create a user and get a token
    const userResponse = await request(app)
      .post('/api/v1/user/register')
      .send({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
      });
    token = userResponse.body.data.accessToken;
    userId = userResponse.body.data.user._id;

    // Create a blog post
    const blogResponse = await request(app)
      .post('/api/v1/blog')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Blog',
        content: 'This is a test blog post.',
        author: userId,
      });
    blogId = blogResponse.body.data._id;
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe('POST /api/v1/comment/:blogId', () => {
    it('should create a new comment on a blog post', async () => {
      const response = await request(app)
        .post(`/api/v1/comment/${blogId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          comment: 'This is a test comment.',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.comment).toBe('This is a test comment.');
    });

    it('should return an error if the comment is empty', async () => {
      const response = await request(app)
        .post(`/api/v1/comment/${blogId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          comment: '',
        });

      expect(response.status).toBe(422);
    });

    it('should return an error if the blogId is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/comment/invalidBlogId')
        .set('Authorization', `Bearer ${token}`)
        .send({
          comment: 'This is a test comment.',
        });

      expect(response.status).toBe(422);
    });

    it('should return an error if the user is not authenticated', async () => {
      const response = await request(app)
        .post(`/api/v1/comment/${blogId}`)
        .send({
          comment: 'This is a test comment.',
        });

      expect(response.status).toBe(401);
    });
  });
});
