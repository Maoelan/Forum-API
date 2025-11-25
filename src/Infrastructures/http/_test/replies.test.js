/* istanbul ignore file */
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('Replies endpoint', () => {
  let accessToken;
  let threadId;
  let commentId;
  let replyId;

  beforeAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();

    const server = await createServer(container);

    // buat user
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

    // dapatkan access token
    accessToken = await ServerTestHelper.getAccessToken({ server, username: 'dicoding' });

    // buat thread
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    threadId = 'thread-123';

    // buat comment
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId,
      owner: 'user-123',
    });
    commentId = 'comment-123';
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should create a new reply and respond with 201', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: { content: 'Ini balasan komentar' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      replyId = responseJson.data.addedReply.id;

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toHaveProperty('id');
      expect(responseJson.data.addedReply).toHaveProperty('content', 'Ini balasan komentar');
      expect(responseJson.data.addedReply).toHaveProperty('owner', 'user-123');
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should delete the reply and respond with success', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // pastikan reply benar-benar terhapus
      const replies = await RepliesTableTestHelper.findReplyById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toBe(true);
    });
  });
});
