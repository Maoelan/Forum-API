const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskertasikan langkah demi langkah dengan benar.
   */
  it('should orchestrate adding comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Wow, the owl watching silently in the moonlight is so eerie and mysterious!',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-1',
      content: useCasePayload.content,
      owner: 'maoelana',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute('maoelana', 'thread-1', useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      'maoelana',
      'thread-1',
      new NewComment({ content: useCasePayload.content }),
    );
  });
});
