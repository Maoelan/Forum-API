const pool = require('../../database/postgres/pool.js');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper.js');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper.js');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper.js');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js');
const ServerTestHelper = require('../../../../tests/ServerTestHelper.js');
const container = require('../../container.js');
const createServer = require('../createServer.js');

describe('/threads/{threadId}/comments endpoint', () => {
  let mockServer;

  beforeAll(async () => {
    mockServer = await createServer(container);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persist comment', async () => {
      // Arrange
      const payloadUser = { username: 'maoelana', password: 'secret', fullname: 'Maulana Muhammad' };
      await mockServer.inject({ method: 'POST', url: '/users', payload: payloadUser });

      const authResponse = await mockServer.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: payloadUser.username, password: payloadUser.password },
      });
      const mockAccessToken = JSON.parse(authResponse.payload).data.accessToken;

      const payloadThread = { title: 'sebuah thread', body: 'sebuah body' };
      const threadResponse = await mockServer.inject({
        method: 'POST',
        url: '/threads',
        payload: payloadThread,
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });
      const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      const payloadComment = { content: 'this is a comment' };

      // Act
      const response = await mockServer.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: payloadComment,
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedComment).toHaveProperty('id');
      expect(responseJson.data.addedComment.content).toBe(payloadComment.content);

      const comments = await CommentsTableTestHelper.findCommentById(responseJson.data.addedComment.id);
      expect(comments).toHaveLength(1);
    });

    it('should respond 400 when payload missing required property', async () => {
      // Arrange
      const mockAccessToken = await ServerTestHelper.getAccessToken({ server: mockServer, username: 'maoelana' });

      // Act
      const response = await mockServer.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {},
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 400 when payload data type invalid', async () => {
      // Arrange
      const mockAccessToken = await ServerTestHelper.getAccessToken({ server: mockServer, username: 'maoelana' });

      // Act
      const response = await mockServer.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: { content: 123 },
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('komentar harus berupa string');
    });

    it('should respond 401 when no authorization header', async () => {
      // Act
      const response = await mockServer.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: { content: 'hello' },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toMatch(/Missing authentication|Invalid token/);
    });

    it('should respond 404 when thread not found', async () => {
      // Arrange
      const mockAccessToken = await ServerTestHelper.getAccessToken({ server: mockServer, username: 'maoelana' });

      // Act
      const response = await mockServer.inject({
        method: 'POST',
        url: '/threads/thread-999/comments',
        payload: { content: 'hello' },
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('Thread tidak ditemukan');
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 200 when owner deletes comment', async () => {
      // Arrange
      const payloadUser = { username: 'deleter', password: 'secret', fullname: 'Delete Owner' };
      await mockServer.inject({ method: 'POST', url: '/users', payload: payloadUser });
      const authResponse = await mockServer.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: payloadUser.username, password: payloadUser.password },
      });
      const mockAccessToken = JSON.parse(authResponse.payload).data.accessToken;

      const threadResponse = await mockServer.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'sebuah thread', body: 'sebuah body' },
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });
      const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      const commentResponse = await mockServer.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'comment to delete' },
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });
      const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

      // Act
      const response = await mockServer.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');

      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments[0].is_delete).toBe(true);
    });

    it('should respond 403 when user is not the owner', async () => {
      // Arrange
      const ownerToken = await ServerTestHelper.getAccessToken({ server: mockServer, username: 'ownerUser' });
      const intruderToken = await ServerTestHelper.getAccessToken({ server: mockServer, username: 'otherUser' });

      const threadResponse = await mockServer.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'sebuah thread', body: 'sebuah body' },
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      const commentResponse = await mockServer.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'owned comment' },
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

      // Act
      const response = await mockServer.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${intruderToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(403);
      expect(responseJson.status).toBe('fail');
    });

    it('should respond 404 when comment not found', async () => {
      // Arrange
      const mockAccessToken = await ServerTestHelper.getAccessToken({ server: mockServer, username: 'tester' });
      const threadResponse = await mockServer.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'sebuah thread', body: 'sebuah body' },
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });
      const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      // Act
      const response = await mockServer.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-unknown`,
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
    });
  });
});
