const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  let pool;
  let idGenerator;
  let replyRepo;

  beforeEach(() => {
    pool = { query: jest.fn() };
    idGenerator = jest.fn().mockReturnValue('123');
    replyRepo = new ReplyRepositoryPostgres(pool, idGenerator);
  });

  describe('addReply', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const ownerId = 'user-1';
      const commentId = 'comment-1';
      const newReply = { content: 'sebuah reply' };
      const expectedReply = { id: 'reply-123', content: 'sebuah reply', owner: ownerId };

      pool.query.mockResolvedValue({ rows: [expectedReply] });

      // Act
      const result = await replyRepo.addReply(ownerId, commentId, newReply);

      // Assert
      expect(result).toStrictEqual(new AddedReply(expectedReply));
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
        values: expect.arrayContaining([expectedReply.id, newReply.content, ownerId, commentId, expect.any(String)]),
      }));
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError when reply not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await expect(replyRepo.verifyReplyOwner('reply-1', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when owner mismatch', async () => {
      pool.query.mockResolvedValue({ rows: [{ owner: 'user-2' }] });
      await expect(replyRepo.verifyReplyOwner('reply-1', 'user-1')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw error when owner matches', async () => {
      pool.query.mockResolvedValue({ rows: [{ owner: 'user-1' }] });
      await expect(replyRepo.verifyReplyOwner('reply-1', 'user-1')).resolves.not.toThrow();
    });
  });

  describe('checkReplyExists', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await expect(replyRepo.checkReplyExists('reply-1', 'comment-1')).rejects.toThrow(NotFoundError);
    });

    it('should not throw error when reply exists', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 'reply-1' }] });
      await expect(replyRepo.checkReplyExists('reply-1', 'comment-1')).resolves.not.toThrow();
    });
  });

  describe('deleteReply', () => {
    it('should run delete query correctly', async () => {
      pool.query.mockResolvedValue({});
      await replyRepo.deleteReply('reply-1');
      expect(pool.query).toHaveBeenCalledWith({
        text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
        values: ['reply-1'],
      });
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should return empty array when commentIds is empty', async () => {
      const result = await replyRepo.getRepliesByCommentIds([]);
      expect(result).toEqual([]);
    });

    it('should return replies correctly', async () => {
      // Arrange
      const commentIds = ['comment-1', 'comment-2'];
      const rawReplies = [
        {
          id: 'reply-1',
          content: 'reply 1',
          date: new Date('2023-01-01T00:00:00.000Z'),
          username: 'user1',
          comment_id: 'comment-1',
          is_delete: false,
        },
      ];
      pool.query.mockResolvedValue({ rows: rawReplies });

      // Act
      const result = await replyRepo.getRepliesByCommentIds(commentIds);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'reply-1',
        content: 'reply 1',
        username: 'user1',
        comment_id: 'comment-1',
        is_delete: false,
        date: '2023-01-01T00:00:00.000Z',
      });
      expect(pool.query).toHaveBeenCalledWith(expect.objectContaining({
        values: [commentIds],
      }));
    });
  });
});
