const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskertasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah title',
      body: 'sebuah body',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'sebuah title',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use caase instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute('maoelana', useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: 'sebuah title',
      owner: 'user-123',
    }));

    expect(mockThreadRepository.addThread).toHaveBeenCalledWith('maoelana', new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    }));
  });
});
