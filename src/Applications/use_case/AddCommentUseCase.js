const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, useCasePayload) {
    const { threadId, content } = useCasePayload;
    const newComment = new NewComment({ content });
    await this._threadRepository.verifyThreadExists(threadId);
    return this._commentRepository.addComment(ownerId, threadId, newComment);
  }
}

module.exports = AddCommentUseCase;
