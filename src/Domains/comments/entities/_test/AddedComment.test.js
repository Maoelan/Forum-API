const AddedComment = require('../AddedComment');

describe('a AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrow('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('shoud throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };

    expect(() => new AddedComment(payload)).toThrow('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Wow, the owl watching silently in the moonlight is so eerie and mysterious!',
    };

    // Action
    const { content } = new AddedComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
