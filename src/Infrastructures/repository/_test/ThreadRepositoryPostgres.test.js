const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const fakeIdGenerator = () => '123';
      const threadRepo = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const newThread = new NewThread({ title: 'sebuah title', body: 'sebuah body' });

      // Act
      const addedThread = await threadRepo.addThread(userId, newThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: newThread.title,
        owner: userId,
      }));
    });
  });

  describe('verifyThreadExists', () => {
    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepo = new ThreadRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(threadRepo.verifyThreadExists('thread-123'))
        .resolves.not.toThrow(new NotFoundError('Thread tidak ditemukan'));
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepo = new ThreadRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(threadRepo.verifyThreadExists('thread-xyz'))
        .rejects.toThrow(new NotFoundError('Thread tidak ditemukan'));
    });
  });

  describe('getThreadById', () => {
    it('should return thread detail correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'maoelana' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah title',
        body: 'sebuah body',
        owner: 'user-123',
      });
      const threadRepo = new ThreadRepositoryPostgres(pool, {});

      // Act
      const thread = await threadRepo.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual(expect.objectContaining({
        id: 'thread-123',
        title: 'sebuah title',
        body: 'sebuah body',
        username: 'maoelana',
        date: thread.date,
      }));
    });

    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepo = new ThreadRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(threadRepo.getThreadById('thread-xyz')).rejects.toThrow(NotFoundError);
    });
  });
});
