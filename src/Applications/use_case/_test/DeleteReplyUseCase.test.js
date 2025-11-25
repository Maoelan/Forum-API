const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const payload = { threadId: 'thread-123', commentId: 'comment-123', replyId: 'reply-123' };
    const ownerId = 'user-123';

    const mockThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue() };
    const mockCommentRepository = { checkCommentExists: jest.fn().mockResolvedValue() };
    const mockReplyRepository = {
      checkReplyExists: jest.fn().mockResolvedValue(),
      verifyReplyOwner: jest.fn().mockResolvedValue(),
      deleteReply: jest.fn().mockResolvedValue(),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    await deleteReplyUseCase.execute(ownerId, payload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(mockCommentRepository.checkCommentExists).toHaveBeenCalledWith(payload.commentId, payload.threadId);
    expect(mockReplyRepository.checkReplyExists).toHaveBeenCalledWith(payload.replyId, payload.commentId);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(payload.replyId, ownerId);
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(payload.replyId);
  });
});
