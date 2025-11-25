const AddedReply = require('../AddedReply');

describe('AddedReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'sebuah balasan' };

    // Act & Assert
    expect(() => new AddedReply(payload))
      .toThrow('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = { id: 123, content: true, owner: {} };

    // Act & Assert
    expect(() => new AddedReply(payload))
      .toThrow('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply object correctly', () => {
    // Arrange
    const payload = { id: 'reply-123', content: 'ini balasan', owner: 'user-123' };

    // Act
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
