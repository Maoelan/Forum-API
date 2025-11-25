const ReplyDetail = require('../ReplyDetail');

describe('ReplyDetail entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'balasan', date: '2024-01-01', isDelete: false };

    // Act & Assert
    expect(() => new ReplyDetail(payload))
      .toThrow('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = { id: 123, content: 'balasan', date: '2024-01-01', username: 'maoelana', isDelete: false };

    // Act & Assert
    expect(() => new ReplyDetail(payload))
      .toThrow('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when isDelete is not boolean', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'balasan', date: '2024-01-01', username: 'maoelana', isDelete: 'false' };

    // Act & Assert
    expect(() => new ReplyDetail(payload))
      .toThrow('REPLY_DETAIL.IS_DELETE_NOT_BOOLEAN');
  });

  it('should create ReplyDetail object correctly when isDelete is false', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'ini balasan asli', date: '2024-01-01', username: 'maoelana', isDelete: false };

    // Act
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.content).toEqual(payload.content);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.username).toEqual(payload.username);
  });

  it('should replace content with placeholder when isDelete is true', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'ini balasan yang dihapus', date: '2024-01-01', username: 'maoelana', isDelete: true };

    // Act
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail.content).toEqual('**balasan telah dihapus**');
  });
});
