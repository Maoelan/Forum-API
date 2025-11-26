const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  let replyRepo;

  beforeEach(async () => {
    // Arrange: bersihkan tabel dan inisialisasi repo
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    replyRepo = new ReplyRepositoryPostgres(pool, () => '123');
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const newReply = new NewReply({ content: 'sebuah reply' });

      // Act
      const addedReply = await replyRepo.addReply('user-123', 'comment-123', newReply);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'sebuah reply',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError if reply does not exist', async () => {
      // Arrange, Act & Assert
      await expect(replyRepo.verifyReplyOwner('reply-404', 'user-123')).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if reply is not owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'user-456' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      // Act & Assert
      await expect(replyRepo.verifyReplyOwner('reply-123', 'user-456')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw error if reply is owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      // Act & Assert
      await expect(replyRepo.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('checkReplyExists', () => {
    it('should throw NotFoundError if reply does not exist in comment', async () => {
      // Arrange, Act & Assert
      await expect(replyRepo.checkReplyExists('reply-404', 'comment-123')).rejects.toThrow(NotFoundError);
    });

    it('should not throw error if reply exists in comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      // Act & Assert
      await expect(replyRepo.checkReplyExists('reply-123', 'comment-123')).resolves.not.toThrow();
    });
  });

  describe('deleteReply', () => {
    it('should soft delete the reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      // Act
      await replyRepo.deleteReply('reply-123');

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply[0].is_delete).toBe(true);
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should return empty array when commentIds is empty', async () => {
      // Arrange & Act
      const result = await replyRepo.getRepliesByCommentIds([]);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return replies correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'user-456' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-2', threadId: 'thread-123', owner: 'user-456' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'reply 1',
      });

      const commentIds = ['comment-123', 'comment-2'];

      // Act
      const replies = await replyRepo.getRepliesByCommentIds(commentIds);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toMatchObject({
        id: 'reply-123',
        content: 'reply 1',
        comment_id: 'comment-123',
        is_delete: false,
      });
    });
  });
});
