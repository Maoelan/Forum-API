const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = { title: 'sebuah title', body: 'sebuah body' };
    const mockAddedThread = new AddedThread({ id: 'thread-123', title: 'sebuah title', owner: 'user-123' });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn().mockResolvedValue(mockAddedThread);

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Act
    const addedThread = await addThreadUseCase.execute('maoelana', useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(mockAddedThread);
    expect(mockThreadRepository.addThread)
      .toHaveBeenCalledWith('maoelana', new NewThread({ title: useCasePayload.title, body: useCasePayload.body }));
  });
});
