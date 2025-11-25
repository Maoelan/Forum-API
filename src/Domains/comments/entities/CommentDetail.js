const ReplyDetail = require('../../replies/entities/ReplyDetail');

class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, isDelete, replies } = payload;
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.replies = replies.map((reply) => (reply instanceof ReplyDetail ? reply : new ReplyDetail(reply)));
  }

  _verifyPayload({ id, username, date, content, isDelete, replies }) {
    if (!id || !username || !date || typeof content === 'undefined' || typeof isDelete === 'undefined' || !Array.isArray(replies)) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = CommentDetail;
