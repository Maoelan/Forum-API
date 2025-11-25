const NewThread = require('../NewThread');

describe('NewThread entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = { id: 'thread-123', title: 'sebuah thread' };

    // Act & Assert
    expect(() => new NewThread(payload))
      .toThrow('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = { title: 123, body: true };

    // Act & Assert
    expect(() => new NewThread(payload))
      .toThrow('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread object correctly', () => {
    // Arrange
    const payload = { title: 'sebuah thread', body: 'sebuah body' };

    // Act
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
