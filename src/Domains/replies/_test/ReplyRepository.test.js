const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoking abstract behavior addReply', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();

    // Act & Assert
    await expect(mockReplyRepository.addReply('owner-123', 'comment-123', {}))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract behavior verifyReplyOwner', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();

    // Act & Assert
    await expect(mockReplyRepository.verifyReplyOwner('reply-123', 'owner-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract behavior checkReplyExists', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();

    // Act & Assert
    await expect(mockReplyRepository.checkReplyExists('reply-123', 'comment-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract behavior deleteReply', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();

    // Act & Assert
    await expect(mockReplyRepository.deleteReply('reply-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract behavior getRepliesByCommentIds', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();

    // Act & Assert
    await expect(mockReplyRepository.getRepliesByCommentIds(['comment-123']))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
