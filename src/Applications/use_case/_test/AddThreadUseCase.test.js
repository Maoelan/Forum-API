// AddThreadUseCase.test.js
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrate adding thread correctly', async () => {
    // Arrange
    const useCasePayload = { title: 'sebuah title', body: 'sebuah body' };
    const ownerId = 'maoelana';

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: ownerId,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockAddedThread));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedThread = await addThreadUseCase.execute(ownerId, useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: ownerId,
    }));

    expect(mockThreadRepository.addThread)
      .toHaveBeenCalledWith(ownerId, new NewThread({ title: useCasePayload.title, body: useCasePayload.body }));
  });
});
