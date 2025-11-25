const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoke abstract behavior addReply', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & Assert
    await expect(replyRepository.addReply('owner-123', 'comment-123', {}))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior verifyReplyOwner', async () => {
    const replyRepository = new ReplyRepository();

    await expect(replyRepository.verifyReplyOwner('reply-123', 'owner-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior checkReplyExists', async () => {
    const replyRepository = new ReplyRepository();

    await expect(replyRepository.checkReplyExists('reply-123', 'comment-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior deleteReply', async () => {
    const replyRepository = new ReplyRepository();

    await expect(replyRepository.deleteReply('reply-123'))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract behavior getRepliesByCommentIds', async () => {
    const replyRepository = new ReplyRepository();

    await expect(replyRepository.getRepliesByCommentIds(['comment-123']))
      .rejects
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
