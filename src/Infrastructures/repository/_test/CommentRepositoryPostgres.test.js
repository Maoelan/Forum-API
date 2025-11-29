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
  const fakeIdGenerator = () => '123';
  let repo;

  beforeEach(() => {
    repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
  });

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
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const newComment = new NewComment({ content: 'sebuah content' });

      // Act
      const addedComment = await repo.addComment('user-123', 'thread-123', newComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({ id: 'comment-123', content: newComment.content, owner: 'user-123' }),
      );
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw NotFoundError if comment does not exist', async () => {
      // Arrange & Act & Assert
      await expect(repo.verifyCommentOwner('comment-404', 'user-123')).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if comment is not owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'maoelana' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'ajik' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Act & Assert
      await expect(repo.verifyCommentOwner('comment-123', 'user-456')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw error if comment is owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Act & Assert
      await expect(repo.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('checkCommentExists', () => {
    it('should throw NotFoundError if comment not exist in thread', async () => {
      // Arrange & Act & Assert
      await expect(repo.checkCommentExists('comment-404', 'thread-123')).rejects.toThrow(NotFoundError);
    });

    it('should not throw error if comment exists in thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Act & Assert
      await expect(repo.checkCommentExists('comment-123', 'thread-123')).resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should soft delete the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Act
      await repo.deleteComment('comment-123');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment[0].is_delete).toBe(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return ordered comments with username and deletion flag', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'maoelana' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'ajik' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const firstCommentDate = new Date('2021-08-08T07:22:33.555Z');
      const secondCommentDate = new Date('2021-08-08T07:26:21.338Z');

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-456',
        threadId: 'thread-123',
        content: 'first comment',
        date: firstCommentDate.toISOString(),
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'second comment',
        date: secondCommentDate.toISOString(),
        isDelete: true,
      });

      // Act
      const comments = await repo.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0]).toMatchObject({
        id: 'comment-123',
        username: 'ajik',
        content: 'first comment',
        is_delete: false,
      });
      expect(comments[0].date.toISOString()).toEqual(firstCommentDate.toISOString());

      expect(comments[1]).toMatchObject({
        id: 'comment-2',
        username: 'maoelana',
        content: 'second comment',
        is_delete: true,
      });
      expect(comments[1].date.toISOString()).toEqual(secondCommentDate.toISOString());
    });
  });
});
