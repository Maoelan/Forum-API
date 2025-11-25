const CommentDetail = require('../CommentDetail');
const ReplyDetail = require('../../../replies/entities/ReplyDetail');

describe('CommentDetail entity', () => {
  it('should create CommentDetail correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'maoelana',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah komentar',
      isDelete: false,
      replies: [],
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual([]);
  });

  it('should replace content when isDelete true', () => {
    const payload = {
      id: 'comment-123',
      username: 'maoelana',
      date: '2021-08-08T07:22:33.555Z',
      content: 'rahasia',
      isDelete: true,
      replies: [],
    };

    const commentDetail = new CommentDetail(payload);
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
  });

  it('should map replies into ReplyDetail instances when given plain object', () => {
    const payload = {
      id: 'comment-1',
      username: 'user',
      date: 'date',
      content: 'content',
      isDelete: false,
      replies: [
        {
          id: 'reply-1',
          username: 'replier',
          date: 'date',
          content: 'reply content',
          isDelete: false,
        },
      ],
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail.replies[0]).toBeInstanceOf(ReplyDetail);
    expect(commentDetail.replies[0].id).toEqual('reply-1');
  });

  it('should keep replies unchanged when already instance of ReplyDetail', () => {
    const reply = new ReplyDetail({
      id: 'reply-123',
      username: 'user',
      date: '2021',
      content: 'reply here',
      isDelete: false,
    });

    const payload = {
      id: 'comment-123',
      username: 'user',
      date: '2021',
      content: 'comment',
      isDelete: false,
      replies: [reply],
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail.replies[0]).toBe(reply);
  });

  it('should allow empty replies array', () => {
    const payload = {
      id: 'comment-123',
      username: 'user',
      date: '2021',
      content: 'comment',
      isDelete: false,
      replies: [],
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail.replies).toEqual([]);
  });

  it('should throw error when required property missing', () => {
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
    expect(() => new CommentDetail({
      id: 'comment-123',
      username: 'user',
      date: '2021',
      isDelete: false,
      replies: [],
    })).toThrow('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
