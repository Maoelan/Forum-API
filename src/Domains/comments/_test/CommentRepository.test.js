const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoking abstract behavior', async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();

    // Act & Assert
    await expect(mockCommentRepository.addComment('owner-1', 'thread-1', {}))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(mockCommentRepository.verifyCommentOwner('comment-1', 'owner-1'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(mockCommentRepository.checkCommentExists('comment-1', 'thread-1'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(mockCommentRepository.deleteComment('comment-1'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(mockCommentRepository.getCommentsByThreadId('thread-1'))
      .rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
