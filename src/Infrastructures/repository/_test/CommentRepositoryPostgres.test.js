const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  const fakeIdGenerator = () => '1'; // stub!

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });

      const newComment = new NewComment({
        content: 'Wow, the owl watching silently in the moonlight is so eerie and mysterious!',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment,
        'thread-1',
        'user-1',
      );

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-1');
      expect(comment).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-1',
          content: newComment.content,
          owner: 'user-1',
        }),
      );
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw NotFoundError if comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-404', 'user-1'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if comment is not owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'ajik' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'Wow, the owl watching silently in the moonlight is so eerie and mysterious!',
        owner: 'user-1',
        threadId: 'thread-1',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-1', 'user-2'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw error if comment is owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'Wow, the owl watching silently in the moonlight is so eerie and mysterious!',
        owner: 'user-1',
        threadId: 'thread-1',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-1', 'user-1'))
        .resolves.not.toThrow();
    });
  });

  describe('checkCommentExists', () => {
    it('should throw NotFoundError if comment not exist in thread', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.checkCommentExists('comment-404', 'thread-1'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw error if comment exists in thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'Wow, the owl watching silently in the moonlight is so eerie and mysterious!',
        owner: 'user-1',
        threadId: 'thread-1',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.checkCommentExists('comment-1', 'thread-1'))
        .resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should soft delete the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'Wow, the owl watching silently in the moonlight is so eerie and mysterious!',
        owner: 'user-1',
        threadId: 'thread-1',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.deleteComment('comment-1');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-1');
      expect(comment[0].is_delete).toBe(true);
    });
  });
});
