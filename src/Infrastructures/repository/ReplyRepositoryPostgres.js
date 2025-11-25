const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(ownerId, commentId, newReply) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator(16)}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies(id, content, owner, comment_id, date) VALUES($1,$2,$3,$4,$5) RETURNING id, content, owner',
      values: [id, content, ownerId, commentId, date],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async verifyReplyOwner(replyId, ownerId) {
    const query = { text: 'SELECT owner FROM replies WHERE id = $1', values: [replyId] };
    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('Balasan tidak ditemukan');
    if (result.rows[0].owner !== ownerId) throw new AuthorizationError('Anda bukan pemilik balasan ini');
  }

  async checkReplyExists(replyId, commentId) {
    const query = { text: 'SELECT id FROM replies WHERE id = $1 AND comment_id = $2', values: [replyId, commentId] };
    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('Balasan tidak ditemukan pada komentar ini');
  }

  async deleteReply(replyId) {
    await this._pool.query({ text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1', values: [replyId] });
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];

    const query = {
      text: `
        SELECT re.id, re.content, re.date, u.username, re.comment_id, re.is_delete
        FROM replies re
        JOIN users u ON u.id = re.owner
        WHERE re.comment_id = ANY($1::text[])
        ORDER BY re.date ASC
      `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows.map(row => ({ ...row, date: row.date.toISOString() }));
  }
}

module.exports = ReplyRepositoryPostgres;
