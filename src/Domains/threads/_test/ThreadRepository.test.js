const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
  it('should throw error when invoking abstract behaviors', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();

    // Act & Assert
    await expect(mockThreadRepository.addThread('user-1', {}))
      .rejects
      .toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(mockThreadRepository.getThreadById('thread-1'))
      .rejects
      .toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(mockThreadRepository.verifyThreadExists('thread-1'))
      .rejects
      .toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
