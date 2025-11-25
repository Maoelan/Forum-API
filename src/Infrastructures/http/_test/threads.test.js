const pool = require('../../database/postgres/pool.js');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper.js');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper.js');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper.js');
const ServerTestHelper = require('../../../../tests/ServerTestHelper.js');
const container = require('../../container.js');
const createServer = require('../createServer.js');

describe('/threads endpoint', () => {
  let server;

  beforeAll(async () => {
    server = await createServer(container);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  it('should respond 201 and persist thread', async () => {
    // Arrange
    const payloadUser = { username: 'maoelana', password: 'secret', fullname: 'Maulana Muhammad' };
    await server.inject({ method: 'POST', url: '/users', payload: payloadUser });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username: payloadUser.username, password: payloadUser.password },
    });
    const { accessToken } = JSON.parse(responseAuth.payload).data;

    const payloadThread = { title: 'sebuah thread', body: 'sebuah body' };

    // Act
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: payloadThread,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(201);
    expect(responseJson.status).toBe('success');
    expect(responseJson.data.addedThread).toHaveProperty('id');
    expect(responseJson.data.addedThread.title).toBe(payloadThread.title);

    const threads = await ThreadsTableTestHelper.findThreadById(responseJson.data.addedThread.id);
    expect(threads).toHaveLength(1);
  });

  it('should respond 400 when payload missing needed property', async () => {
    // Arrange
    const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'maoelana' });

    // Act
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'sebuah title' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(400);
    expect(responseJson.status).toBe('fail');
    expect(responseJson.message).toBe('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
  });

  it('should respond 400 when payload not meet data type specification', async () => {
    // Arrange
    const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'maoelana' });

    // Act
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 123, body: {} },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(400);
    expect(responseJson.status).toBe('fail');
    expect(responseJson.message).toBe('tidak dapat membuat thread baru karena tipe data tidak sesuai');
  });

  it('should respond 401 when no authorization header', async () => {
    // Act
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'sebuah title', body: 'sebuah body' },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(401);
    expect(responseJson.message).toBeDefined();
    expect(responseJson.message).toMatch(/Missing authentication|Invalid token/);
  });

  describe('GET /threads/{threadId}', () => {
    it('should respond 200 and return thread details with comments', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'maoelana' });
      const createThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'sebuah thread', body: 'sebuah body thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const threadId = JSON.parse(createThreadResponse.payload).data.addedThread.id;

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Act
      const response = await server.inject({ method: 'GET', url: `/threads/${threadId}` });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.thread).toMatchObject({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        username: 'maoelana',
      });
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].content).toBe('sebuah comment');
    });

    it('should respond 200 and mask deleted comment content', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'zahra' });
      const createThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'another thread', body: 'another body' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const threadId = JSON.parse(createThreadResponse.payload).data.addedThread.id;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'akan dihapus' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Act
      const response = await server.inject({ method: 'GET', url: `/threads/${threadId}` });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.data.thread.comments[0].content).toBe('**komentar telah dihapus**');
    });

    it('should respond 404 when thread not found', async () => {
      // Act
      const response = await server.inject({ method: 'GET', url: '/threads/thread-xyz' });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
    });
  });
});
