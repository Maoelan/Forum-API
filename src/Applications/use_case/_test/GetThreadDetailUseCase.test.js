const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskertasikan langkah demi langkah dengan benar.
   */
  it('should orchestrate getting thread detail correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThread = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'maoelana',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'ajik',
        date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'maoelana',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'rahasia',
        is_delete: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue(mockThread);
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue(mockComments);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const thread = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(thread).toStrictEqual(new ThreadDetail({
      id: threadId,
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
        }),
        new CommentDetail({
          id: 'comment-456',
          username: 'maoelana',
          date: '2021-08-08T07:26:21.338Z',
          content: 'rahasia',
          isDelete: true,
        }),
      ],
    }));

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
  });
});
