const CommentDetail = require('../CommentDetail');

describe('CommentDetail entity', () => {
  it('should create CommentDetail correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'maoelana',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah komentar',
      isDelete: false,
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.content).toEqual(payload.content);
  });

  it('should replace content when isDelete true', () => {
    const payload = {
      id: 'comment-123',
      username: 'maoelana',
      date: '2021-08-08T07:22:33.555Z',
      content: 'rahasia',
      isDelete: true,
    };

    const commentDetail = new CommentDetail(payload);
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
  });

  it('should throw error when required property not provided', () => {
    expect(() => new CommentDetail({
      id: 'comment-123',
      username: 'maoelana',
      date: '2021-08-08T07:22:33.555Z',
      isDelete: false,
    })).toThrow('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when data type not string/boolean', () => {
    expect(() => new CommentDetail({
      id: 'comment-123',
      username: 'maoelana',
      date: {},
      content: 'abc',
      isDelete: 'yes',
    })).toThrow('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
