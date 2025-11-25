const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'maoelana',
    };

    // Act & Assert
    expect(() => new ThreadDetail(payload))
      .toThrow('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      date: 123,
      username: 'maoelana',
      comments: [],
    };

    // Act & Assert
    expect(() => new ThreadDetail(payload))
      .toThrow('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'maoelana',
      comments: [
        { id: 'comment-123', username: 'ajik', date: '2021-08-08T07:22:33.555Z', content: 'sebuah comment' },
      ],
    };

    // Act
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toEqual(payload.comments);
  });
});
