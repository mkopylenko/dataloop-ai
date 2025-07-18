import { ConsumerService } from './consumer.service';
import Queue from '../interfaces/queue.interface';
import Database from '../interfaces/database.interface';

describe('ConsumerService', () => {
    let queueMock: jest.Mocked<Queue>;
    let dbMock: jest.Mocked<Database>;
    let consumerService: ConsumerService;

    beforeEach(() => {
        queueMock = {
            consumeFromQueue: jest.fn(),
            publishToQueue: jest.fn(),
        };

        dbMock = {
            saveStreets: jest.fn(),
        };

        consumerService = new ConsumerService();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should consume from queue and save to database once when not in loop', async () => {
        const mockData = JSON.stringify([{ name: 'Main St' }]);
        queueMock.consumeFromQueue.mockResolvedValue(mockData);

        await consumerService.consumeAndSaveToDatabase(queueMock, dbMock);

        expect(queueMock.consumeFromQueue).toHaveBeenCalledTimes(1);
        expect(dbMock.saveStreets).toHaveBeenCalledWith(JSON.parse(mockData));
    });

    it('should skip saving when queue returns empty string', async () => {
        queueMock.consumeFromQueue.mockResolvedValue('');

        await consumerService.consumeAndSaveToDatabase(queueMock, dbMock);

        expect(queueMock.consumeFromQueue).toHaveBeenCalled();
        expect(dbMock.saveStreets).not.toHaveBeenCalled();
    });

    it('should catch JSON parsing error', async () => {
        queueMock.consumeFromQueue.mockResolvedValue('invalid-json');

        await consumerService.consumeAndSaveToDatabase(queueMock, dbMock);

        expect(queueMock.consumeFromQueue).toHaveBeenCalled();
        expect(dbMock.saveStreets).not.toHaveBeenCalled();
    });

    it('should catch error from queue', async () => {
        const mockData = JSON.stringify([{ name: 'Street A' }]);

        queueMock.consumeFromQueue
            .mockRejectedValueOnce(new Error('Queue error'))
            .mockResolvedValueOnce(mockData);

        await consumerService.consumeAndSaveToDatabase(queueMock, dbMock);

        expect(queueMock.consumeFromQueue).toHaveBeenCalledTimes(1);
        expect(dbMock.saveStreets).not.toHaveBeenCalled();
    });

    it('should catch error from database', async () => {
        const mockData = JSON.stringify([{ name: 'Street A' }]);

        queueMock.consumeFromQueue.mockResolvedValue(mockData);
        dbMock.saveStreets.mockRejectedValue(new Error('DB error'));

        await consumerService.consumeAndSaveToDatabase(queueMock, dbMock);

        expect(queueMock.consumeFromQueue).toHaveBeenCalledTimes(1);
        expect(dbMock.saveStreets).toHaveBeenCalledTimes(1);
    });

    it('should respect stop() and break loop', async () => {
        const mockData = JSON.stringify([{ name: 'Street A' }]);

        // Infinite loop stub (will be broken via stop())
        queueMock.consumeFromQueue.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockData), 100)));

        const promise = consumerService.consumeAndSaveToDatabase(queueMock, dbMock, true);

        setTimeout(() => consumerService.stop(), 200);

        await promise;

        expect(queueMock.consumeFromQueue).toHaveBeenCalled();
    });
});
