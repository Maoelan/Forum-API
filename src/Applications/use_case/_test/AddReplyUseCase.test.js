const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrate adding reply correctly', async () => {
    // Arrange
    const payload = { threadId: 'thread-123', commentId: 'comment-123', content: 'ini balasan dari user' };
    const ownerId = 'user-123';

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: payload.content,
      owner: ownerId,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentExists = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(mockAddedReply));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const addedReply = await addReplyUseCase.execute(ownerId, payload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: payload.content,
      owner: ownerId,
    }));

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(mockCommentRepository.checkCommentExists)
      .toHaveBeenCalledWith(payload.commentId, payload.threadId);
    expect(mockReplyRepository.addReply)
      .toHaveBeenCalledWith(ownerId, payload.commentId, new NewReply({ content: payload.content }));
  });
});
