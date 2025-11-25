const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrate adding comment correctly', async () => {
    // Arrange
    const useCasePayload = { threadId: 'thread-123', content: 'sebuah content' };
    const ownerId = 'user-123';

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: ownerId,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
    mockCommentRepository.addComment = jest.fn().mockResolvedValue(mockAddedComment);

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedComment = await addCommentUseCase.execute(ownerId, useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockThreadRepository.verifyThreadExists)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment)
      .toHaveBeenCalledWith(ownerId, useCasePayload.threadId, new NewComment({ content: useCasePayload.content }));
  });
});
