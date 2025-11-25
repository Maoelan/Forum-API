class ReplyRepository {
  async addReply() { throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async verifyReplyOwner() { throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async checkReplyExists() { throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async deleteReply() { throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async getRepliesByCommentIds() { throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
}

module.exports = ReplyRepository;
