const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
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
    await CommentsTableTestHelper.cleanTable();
  });

  it('should response 201 and persisted comment', async () => {
    const payloadUser = { username: 'maoelana', password: 'secret', fullname: 'Maulana Muhammad' };
    await server.inject({ method: 'POST', url: '/users', payload: payloadUser });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username: payloadUser.username, password: payloadUser.password },
    });
    const { accessToken } = JSON.parse(responseAuth.payload).data;

    const payloadThread = { title: 'thread title', body: 'thread body' };
    const responseThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: payloadThread,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { id: threadId } = JSON.parse(responseThread.payload).data.addedThread;

    const payloadComment = { content: 'this is a comment' };

    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: payloadComment,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(201);
    expect(responseJson.status).toBe('success');
    expect(responseJson.data.addedComment).toHaveProperty('id');
    expect(responseJson.data.addedComment.content).toBe(payloadComment.content);

    const comments = await CommentsTableTestHelper.findCommentById(responseJson.data.addedComment.id);
    expect(comments).toHaveLength(1);
  });

  it('should response 400 when payload not contain needed property', async () => {
    const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'maoelana' });
    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments',
      payload: {},
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(400);
    expect(responseJson.status).toBe('fail');
    expect(responseJson.message).toBe('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
  });

  it('should response 400 when payload not meet data type specification', async () => {
    const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'maoelana' });
    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments',
      payload: { content: 123 },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(400);
    expect(responseJson.status).toBe('fail');
    expect(responseJson.message).toBe('komentar harus berupa string');
  });

  it('should response 401 when no authorization header', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments',
      payload: { content: 'hello' },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(401);
    expect(responseJson.message).toBeDefined();
    expect(responseJson.message).toMatch(/Missing authentication|Invalid token/);
  });

  it('should response 404 when thread not found', async () => {
    const accessToken = await ServerTestHelper.getAccessToken({ server, username: 'maoelana' });
    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-999/comments',
      payload: { content: 'hello' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(404);
    expect(responseJson.status).toBe('fail');
    expect(responseJson.message).toBe('Thread tidak ditemukan');
  });
});
