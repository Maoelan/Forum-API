const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(ownerId, payload) {
    const { threadId, commentId, content } = payload;
    const newReply = new NewReply({ content });

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.checkCommentExists(commentId, threadId);

    return this._replyRepository.addReply(ownerId, commentId, newReply);
  }
}

module.exports = AddReplyUseCase;
