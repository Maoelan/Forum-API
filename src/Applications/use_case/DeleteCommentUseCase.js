class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(ownerId, { threadId, commentId }) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.checkCommentExists(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(commentId, ownerId);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
