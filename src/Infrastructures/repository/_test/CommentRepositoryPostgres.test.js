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
  const fakeIdGenerator = () => '1';

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
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });

      const newComment = new NewComment({ content: 'Wow, the owl watching silently...' });
      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await repo.addComment('user-1', 'thread-1', newComment);

      const comment = await CommentsTableTestHelper.findCommentById('comment-1');
      expect(comment).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({ id: 'comment-1', content: newComment.content, owner: 'user-1' }),
      );
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw NotFoundError if comment does not exist', async () => {
      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await expect(repo.verifyCommentOwner('comment-404', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if comment is not owned by user', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'ajik' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1', content: 'Wow...', owner: 'user-1', threadId: 'thread-1',
      });

      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await expect(repo.verifyCommentOwner('comment-1', 'user-2')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw error if comment is owned by user', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1', content: 'Wow...', owner: 'user-1', threadId: 'thread-1',
      });

      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await expect(repo.verifyCommentOwner('comment-1', 'user-1')).resolves.not.toThrow();
    });
  });

  describe('checkCommentExists', () => {
    it('should throw NotFoundError if comment not exist in thread', async () => {
      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await expect(repo.checkCommentExists('comment-404', 'thread-1')).rejects.toThrow(NotFoundError);
    });

    it('should not throw error if comment exists in thread', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1', content: 'Wow...', owner: 'user-1', threadId: 'thread-1',
      });

      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await expect(repo.checkCommentExists('comment-1', 'thread-1')).resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should soft delete the comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1', content: 'Wow...', owner: 'user-1', threadId: 'thread-1',
      });

      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await repo.deleteComment('comment-1');

      const comment = await CommentsTableTestHelper.findCommentById('comment-1');
      expect(comment[0].is_delete).toBe(true);
    });
  });

  describe('getCommentByThreadId', () => {
    it('should return ordered comment with username and deletion flag', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'maoelana' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'ajik' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });

      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        owner: 'user-2',
        threadId: 'thread-1',
        content: 'first comment',
        date: '2021-08-08T07:22:33.555Z',
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        owner: 'user-1',
        threadId: 'thread-1',
        content: 'second comment',
        date: '2021-08-08T07:26:21.338Z',
        isDelete: true,
      });
      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const comments = await repo.getCommentByThreadId('thread-1');

      expect(comments).toHaveLength(2);
      expect(comments[0]).toMatchObject({
        id: 'comment-1',
        username: 'ajik',
        content: 'first comment',
        is_delete: false,
      });
      expect(comments[0].date).toBeInstanceOf(Date);
      expect(comments[1]).toMatchObject({
        id: 'comment-2',
        username: 'maoelana',
        content: 'second comment',
        is_delete: true,
      });
      expect(comments[1].date).toBeInstanceOf(Date);
    });
  });
});
