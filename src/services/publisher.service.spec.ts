import { PublishingService } from './publisher.service';
import Queue from '../interfaces/queue.interface';
import { StreetsService } from './streets.service';
import * as _ from 'lodash';

jest.mock('lodash', () => ({
    chunk: jest.fn(),
}));

describe('PublishingService', () => {
    let queueMock: jest.Mocked<Queue>;
    let streetsServiceMock: jest.Mocked<StreetsService>;
    const city = 'Tel Aviv Jaffa';

    beforeEach(() => {
        queueMock = {
            consumeFromQueue: jest.fn(),
            publishToQueue: jest.fn(),
        };

        streetsServiceMock = {
            getStreetsInCity: jest.fn(),
            getStreetInfoById: jest.fn(),
        } as unknown as jest.Mocked<StreetsService>;

        // Default env vars
        process.env.PUBLISHING_BULK_SIZE = '2';
        process.env.API_CALL_BULK_SIZE = '3';
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should publish street data in chunks and stop when no more data', async () => {
        streetsServiceMock.getStreetsInCity
            .mockResolvedValueOnce({
                streets: [{ streetId: 1 }, { streetId: 2 }, { streetId: 3 }],
                hasMore: false,
                nextOffset: 3,
            });

        (streetsServiceMock.getStreetInfoById as jest.Mock).mockResolvedValue([
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
            { id: 3, name: 'C' },
        ]);

        const mockChunks = [[1, 2], [3]];
        ( _.chunk as jest.Mock).mockReturnValue(mockChunks);

        await PublishingService.publish(city, queueMock, streetsServiceMock);

        expect(streetsServiceMock.getStreetsInCity).toHaveBeenCalledWith(city, 0, 3);
        expect(streetsServiceMock.getStreetInfoById).toHaveBeenCalledWith([1, 2]);
        expect(streetsServiceMock.getStreetInfoById).toHaveBeenCalledWith([3]);
        expect(queueMock.publishToQueue).toHaveBeenCalledTimes(2);
    });

    it('should exit if getStreetsInCity returns empty streets', async () => {
        streetsServiceMock.getStreetsInCity.mockResolvedValue({
            streets: [],
            hasMore: false,
            nextOffset: 0,
        });

        await PublishingService.publish(city, queueMock, streetsServiceMock);

        expect(queueMock.publishToQueue).not.toHaveBeenCalled();
        expect(streetsServiceMock.getStreetInfoById).not.toHaveBeenCalled();
    });

    it('should handle errors during getStreetInfoById gracefully', async () => {
        streetsServiceMock.getStreetsInCity.mockResolvedValueOnce({
            streets: [{ streetId: 1 }],
            hasMore: false,
            nextOffset: 1,
        });

        ( _.chunk as jest.Mock ).mockReturnValue([[1]]);

        streetsServiceMock.getStreetInfoById.mockRejectedValueOnce(
            new Error('API failure')
        );

        await PublishingService.publish(city, queueMock, streetsServiceMock);

        expect(streetsServiceMock.getStreetInfoById).toHaveBeenCalledWith([1]);
        expect(queueMock.publishToQueue).not.toHaveBeenCalled();
    });

    it('should handle multiple bulks using offset and hasMore', async () => {
        streetsServiceMock.getStreetsInCity
            .mockResolvedValueOnce({
                streets: [{ streetId: 1 }, { streetId: 2 }],
                hasMore: true,
                nextOffset: 2,
            })
            .mockResolvedValueOnce({
                streets: [{ streetId: 3 }],
                hasMore: false,
                nextOffset: 3,
            });

        streetsServiceMock.getStreetInfoById.mockImplementation(async (ids: number[]) =>
            ids.map((id, i) => ({
                streetId: id,
                region_code: 100 + i,
                region_name: `Region ${i}`,
                city_code: 200 + i,
                city_name: `City ${i}`,
                street_code: 300 + i,
                street_name: `Street ${id}`,
                street_name_status: 'ACTIVE',
                official_code: 400 + i,
            }))
        );

        ( _.chunk as jest.Mock ).mockImplementation((list, size) => {
            const chunks = [];
            for (let i = 0; i < list.length; i += size) {
                chunks.push(list.slice(i, i + size));
            }
            return chunks;
        });

        await PublishingService.publish(city, queueMock, streetsServiceMock);

        expect(streetsServiceMock.getStreetsInCity).toHaveBeenCalledTimes(2);
        expect(queueMock.publishToQueue).toHaveBeenCalledTimes(2);
    });

    it('should handle unexpected top-level error', async () => {
        streetsServiceMock.getStreetsInCity.mockRejectedValue(new Error('Fatal'));

        await expect(PublishingService.publish(city, queueMock, streetsServiceMock)).resolves.not.toThrow();

        expect(streetsServiceMock.getStreetsInCity).toHaveBeenCalled();
    });
});
