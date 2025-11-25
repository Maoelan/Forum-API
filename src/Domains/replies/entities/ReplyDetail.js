class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, isDelete,
    } = payload;

    this.id = id;
    this.content = isDelete ? '**balasan telah dihapus**' : content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload({ id, content, date, username, isDelete }) {
    if (!id || !date || !username || typeof isDelete === 'undefined') {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || (content !== null && typeof content !== 'string')
    || typeof date !== 'string'
    || typeof username !== 'string') {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (typeof isDelete !== 'boolean') {
      throw new Error('REPLY_DETAIL.IS_DELETE_NOT_BOOLEAN');
    }
  }
}

module.exports = ReplyDetail;
