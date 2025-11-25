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
  let mockServer;
  let mockAccessToken;
  let threadId;
  let commentId;
  let replyId;

  beforeAll(async () => {
    // Clean table sebelum test
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();

    // Buat server
    mockServer = await createServer(container);

    // Arrange: buat user
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

    // Arrange: dapatkan access token
    mockAccessToken = await ServerTestHelper.getAccessToken({ server: mockServer, username: 'dicoding' });

    // Arrange: buat thread
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    threadId = 'thread-123';

    // Arrange: buat comment
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId,
      owner: 'user-123',
    });
    commentId = 'comment-123';
  });

  afterAll(async () => {
    // Clean table setelah test
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should create a new reply and respond with 201', async () => {
      // Arrange
      const payloadReply = { content: 'Ini balasan komentar' };

      // Act
      const response = await mockServer.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: payloadReply,
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      replyId = responseJson.data.addedReply.id;

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toHaveProperty('id');
      expect(responseJson.data.addedReply).toHaveProperty('content', payloadReply.content);
      expect(responseJson.data.addedReply).toHaveProperty('owner', 'user-123');
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should delete the reply and respond with success', async () => {
      // Act
      const response = await mockServer.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Assert: pastikan reply benar-benar terhapus
      const replies = await RepliesTableTestHelper.findReplyById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toBe(true);
    });
  });
});
