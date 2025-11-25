class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(ownerId, payload) {
    const { threadId, commentId, replyId } = payload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.checkCommentExists(commentId, threadId);
    await this._replyRepository.checkReplyExists(replyId, commentId);
    await this._replyRepository.verifyReplyOwner(replyId, ownerId);
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
