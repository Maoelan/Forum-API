const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postReplyHandler(request, h) {
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(ownerId, {
      threadId,
      commentId,
      content: request.payload.content,
    });

    const response = h.response({
      status: 'success',
      data: { addedReply },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute(ownerId, { threadId, commentId, replyId });

    return { status: 'success' };
  }
}

module.exports = RepliesHandler;
