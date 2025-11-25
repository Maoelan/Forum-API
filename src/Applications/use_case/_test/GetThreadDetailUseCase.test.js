const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');

const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate getting thread detail with comments and replies correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThread = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'maoelana',
    };

    const mockComments = [
      { id: 'comment-123', username: 'ajik', date: '2021-08-08T07:22:33.555Z', content: 'sebuah comment', is_delete: false },
      { id: 'comment-456', username: 'maoelana', date: '2021-08-08T07:26:21.338Z', content: 'rahasia', is_delete: true },
    ];

    const mockReplies = [
      { id: 'reply-1', comment_id: 'comment-123', username: 'dicoding', date: '2021-08-08T08:00:00.000Z', content: 'balasan 1', is_delete: false },
      { id: 'reply-2', comment_id: 'comment-123', username: 'john', date: '2021-08-08T09:00:00.000Z', content: 'balasan 2', is_delete: true },
    ];

    const mockThreadRepository = new (require('../../../Domains/threads/ThreadRepository'))();
    const mockCommentRepository = new (require('../../../Domains/comments/CommentRepository'))();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(mockThread);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(mockComments);
    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue(mockReplies);

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const thread = await useCase.execute(threadId);

    // Assert
    expect(thread).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'maoelana',
      comments: [
        new CommentDetail({
          id: 'comment-123',
          username: 'ajik',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          isDelete: false,
          replies: [
            new ReplyDetail({ id: 'reply-1', content: 'balasan 1', date: '2021-08-08T08:00:00.000Z', username: 'dicoding', isDelete: false }),
            new ReplyDetail({ id: 'reply-2', content: 'balasan 2', date: '2021-08-08T09:00:00.000Z', username: 'john', isDelete: true }),
          ],
        }),
        new CommentDetail({
          id: 'comment-456',
          username: 'maoelana',
          date: '2021-08-08T07:26:21.338Z',
          content: 'rahasia',
          isDelete: true,
          replies: [],
        }),
      ],
    }));

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith(['comment-123', 'comment-456']);
  });
});
