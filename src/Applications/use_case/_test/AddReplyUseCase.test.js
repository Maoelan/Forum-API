const AddReplyUseCase = require('../AddReplyUseCase');
const NewReply = require('../../../Domains/replies/entities/NewReply');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'ini balasan dari user',
    };
    const ownerId = 'user-123';

    const expectedAddedReply = {
      id: 'reply-123',
      content: payload.content,
      owner: ownerId,
    };

    /** create mock repositories */
    const mockThreadRepository = {
      verifyThreadExists: jest.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      checkCommentExists: jest.fn().mockResolvedValue(),
    };
    const mockReplyRepository = {
      addReply: jest.fn().mockResolvedValue(expectedAddedReply),
    };

    /** create use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const result = await addReplyUseCase.execute(ownerId, payload);

    // Assert
    // memastikan NewReply dibuat
    expect(result).toEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyThreadExists)
      .toHaveBeenCalledWith(payload.threadId);
    expect(mockCommentRepository.checkCommentExists)
      .toHaveBeenCalledWith(payload.commentId, payload.threadId);
    expect(mockReplyRepository.addReply)
      .toHaveBeenCalledWith(ownerId, payload.commentId, new NewReply({ content: payload.content }));
  });
});
