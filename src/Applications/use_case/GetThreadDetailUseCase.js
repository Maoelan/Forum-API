const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const commentsRaw = await this._commentRepository.getCommentsByThreadId(threadId);
    const commentIds = commentsRaw.map((comment) => comment.id);
    const repliesRaw = await this._replyRepository.getRepliesByCommentIds(commentIds);

    const repliesGrouped = repliesRaw.reduce((acc, reply) => {
      if (!acc[reply.comment_id]) acc[reply.comment_id] = [];
      acc[reply.comment_id].push(new ReplyDetail({
        id: reply.id,
        content: reply.content,
        date: reply.date,
        username: reply.username,
        isDelete: Boolean(reply.is_delete),
      }));
      return acc;
    }, {});

    const comments = commentsRaw.map((comment) => new CommentDetail({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      isDelete: Boolean(comment.is_delete),
      replies: repliesGrouped[comment.id] || [],
    }));

    return new ThreadDetail({ ...thread, comments });
  }
}

module.exports = GetThreadDetailUseCase;
