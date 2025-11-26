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

  it('should convert date to ISO string when date is Date object', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'balasan', date: new Date('2024-01-01'), username: 'maoelana', isDelete: false };

    // Act
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail.date).toEqual(payload.date.toISOString());
  });

  it('should throw error if content is not string when isDelete is false', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 123, date: '2024-01-01', username: 'maoelana', isDelete: false };

    // Act & Assert
    expect(() => new ReplyDetail(payload))
      .toThrow('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if username is not string', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'balasan', date: '2024-01-01', username: 123, isDelete: false };

    // Act & Assert
    expect(() => new ReplyDetail(payload))
      .toThrow('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when date is not string or Date object', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'balasan', date: 123, username: 'maoelana', isDelete: false };
    expect(() => new ReplyDetail(payload))
      .toThrow('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when id is empty string', () => {
    // Arrange
    const payload = { id: '', content: 'balasan', date: '2024-01-01', username: 'maoelana', isDelete: false };

    // Act & Assert
    expect(() => new ReplyDetail(payload))
      .toThrow('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when username is empty string', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'balasan', date: '2024-01-01', username: '', isDelete: false };

    // Act & Assert
    expect(() => new ReplyDetail(payload))
      .toThrow('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
