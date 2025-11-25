const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const commentsRaw = await this._commentRepository.getCommentsByThreadId(threadId);

    const comments = commentsRaw.map((comment) => new CommentDetail({
      id: comment.id,
      username: comment.username,
      date: new Date(comment.date).toISOString(),
      content: comment.content,
      isDelete: comment.is_delete,
    }));

    return new ThreadDetail({
      ...thread,
      date: new Date(thread.date).toISOString(),
      comments,
    });
  }
}

module.exports = GetThreadDetailUseCase;
