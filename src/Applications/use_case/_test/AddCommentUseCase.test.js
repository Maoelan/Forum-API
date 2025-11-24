const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrate adding comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-1',
      content: 'Wow, the owl watching silently in the moonlight is so eerie and mysterious!',
    };
    const ownerId = 'maoelana';

    const mockAddedComment = new AddedComment({
      id: 'comment-1',
      content: useCasePayload.content,
      owner: ownerId,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockResolvedValue();

    mockCommentRepository.addComment = jest.fn()
      .mockResolvedValue(mockAddedComment);

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(ownerId, useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(ownerId, useCasePayload.threadId, new NewComment({ content: useCasePayload.content }));
  });
});
