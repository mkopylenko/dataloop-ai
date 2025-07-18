import * as amqp from 'amqplib';
import RabbitMq from './rabbit-mq';

jest.mock('amqplib');

describe('RabbitMq', () => {
    let rabbitMq: RabbitMq;
    let mockChannel: any;
    let mockConn: any;

    const mockQueue = 'testQueue';
    const mockStreets = [{ name: 'Street 1' }, { name: 'Street 2' }];
    const mockMsg = {
        content: Buffer.from('{"name": "Street 1"}'),
    };

    beforeEach(() => {
        process.env.QUEUE_URL = 'amqp://test';
        process.env.QUEUE_NAME = mockQueue;

        mockChannel = {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(),
            consume: jest.fn(),
            ack: jest.fn(),
            close: jest.fn(),
        };

        mockConn = {
            createChannel: jest.fn().mockResolvedValue(mockChannel),
            close: jest.fn(),
        };

        (amqp.connect as jest.Mock).mockResolvedValue(mockConn);

        rabbitMq = new RabbitMq();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('publishToQueue', () => {
        it('should publish streets to the queue and close connections', async () => {
            await rabbitMq.publishToQueue(mockStreets);

            expect(amqp.connect).toHaveBeenCalledWith('amqp://test');
            expect(mockConn.createChannel).toHaveBeenCalled();
            expect(mockChannel.assertQueue).toHaveBeenCalledWith(mockQueue, { durable: false });
            expect(mockChannel.sendToQueue).toHaveBeenCalledWith(mockQueue, Buffer.from(JSON.stringify(mockStreets)));
            expect(mockChannel.close).toHaveBeenCalled();
            expect(mockConn.close).toHaveBeenCalled();
        });

        it('should handle error in publishing gracefully', async () => {
            mockChannel.sendToQueue.mockImplementation(() => { throw new Error('Send error'); });

            await rabbitMq.publishToQueue(mockStreets);

            expect(mockChannel.close).toHaveBeenCalled();
            expect(mockConn.close).toHaveBeenCalled();
        });
    });

    describe('consumeFromQueue', () => {
        it('should consume message and acknowledge', async () => {
            mockChannel.consume.mockImplementation((_q, cb) => cb(mockMsg));

            const result = await rabbitMq.consumeFromQueue();

            expect(mockChannel.consume).toHaveBeenCalledWith(mockQueue, expect.any(Function));
            expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
            expect(result).toBe(mockMsg.content.toString());
            expect(mockChannel.close).toHaveBeenCalled();
            expect(mockConn.close).toHaveBeenCalled();
        });

        it('should return empty string if message is null', async () => {
            mockChannel.consume.mockImplementation((_q, cb) => cb(null));

            const result = await rabbitMq.consumeFromQueue();

            expect(result).toBe('');
        });

        it('should handle error during consumption gracefully', async () => {
            mockChannel.consume.mockImplementation(() => { throw new Error('Consume error'); });

            const result = await rabbitMq.consumeFromQueue();

            expect(result).toBe('');
        });
    });
});
