const CommentDetail = require('../CommentDetail');
const ReplyDetail = require('../../../replies/entities/ReplyDetail');

describe('CommentDetail entity', () => {
  it('should create CommentDetail correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'maoelana',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah komentar',
      isDelete: false,
      replies: [],
    };

    // Act
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual([]);
  });

  it('should replace content when isDelete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'maoelana',
      date: '2021-08-08T07:22:33.555Z',
      content: 'rahasia',
      isDelete: true,
      replies: [],
    };

    // Act
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
  });

  it('should map replies into plain objects from plain objects', () => {
  // Arrange
    const payload = {
      id: 'comment-1',
      username: 'user',
      date: 'date',
      content: 'content',
      isDelete: false,
      replies: [
        { id: 'reply-1', username: 'replier', date: 'date', content: 'reply content', isDelete: false },
      ],
    };

    // Act
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.replies[0]).toEqual(payload.replies[0]);
    expect(commentDetail.replies[0].id).toEqual('reply-1');
  });

  it('should keep replies unchanged if already plain objects', () => {
  // Arrange
    const reply = { id: 'reply-123', username: 'user', date: '2021', content: 'reply here', isDelete: false };

    const payload = {
      id: 'comment-123',
      username: 'user',
      date: '2021',
      content: 'comment',
      isDelete: false,
      replies: [reply],
    };

    // Act
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.replies[0]).toStrictEqual(reply);
  });

  it('should allow empty replies array', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user',
      date: '2021',
      content: 'comment',
      isDelete: false,
      replies: [],
    };

    // Act
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.replies).toEqual([]);
  });

  it('should throw error when required property missing', () => {
    // Arrange & Act & Assert
    expect(() => new CommentDetail({
      id: 'comment-123',
      username: 'maoelana',
      date: '2021',
      content: 'ada',
      isDelete: false,
      // replies missing
    })).toThrow('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when replies is not an array', () => {
    // Arrange & Act & Assert
    expect(() => new CommentDetail({
      id: 'comment-123',
      username: 'maoelana',
      date: '2021',
      content: 'ada',
      isDelete: false,
      replies: 'wrong-type',
    })).toThrow('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when content is undefined', () => {
    // Arrange & Act & Assert
    expect(() => new CommentDetail({
      id: 'comment-123',
      username: 'user',
      date: '2021',
      isDelete: false,
      replies: [],
    })).toThrow('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
