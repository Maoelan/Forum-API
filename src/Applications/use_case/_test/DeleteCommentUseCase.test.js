const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  /**
     * Menguji apakah use case mampu mengoskertasikan langkah demi langkah dengan benar.
     */
  it('should orchestrating the delete comment correctly', async () => {
    // Arrange
    const ownerId = 'user-123';
    const useCasePayload = {
      threadId: 'thread-456',
      commentId: 'comment-789',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockResolvedValue();
    mockCommentRepository.checkCommentExists = jest.fn()
      .mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockResolvedValue();
    mockCommentRepository.deleteComment = jest.fn()
      .mockResolvedValue();

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(ownerId, useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkCommentExists).toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(useCasePayload.commentId, ownerId);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(useCasePayload.commentId);
  });
});
