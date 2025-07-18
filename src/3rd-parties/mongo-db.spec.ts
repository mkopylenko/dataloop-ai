// __tests__/mongo-db.test.ts

import mongoose from 'mongoose';
import MongoDb from './mongo-db';

jest.mock('mongoose');

describe('MongoDb', () => {
    let mongoDb: MongoDb;
    let mockBulkWrite: jest.Mock;

    const mockModel = {
        bulkWrite: jest.fn()
    };

    beforeEach(() => {
        // Setup mocks manually for compatibility with Jest 28
        (mongoose.model as unknown as jest.Mock).mockReturnValue(mockModel);
        (mongoose.connect as unknown as jest.Mock).mockResolvedValue(Promise.resolve());
        (mongoose.disconnect as unknown as jest.Mock).mockResolvedValue(Promise.resolve());

        mongoDb = new MongoDb();
        mockBulkWrite = mockModel.bulkWrite as jest.Mock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should connect, upsert data, and disconnect', async () => {
        const streets = [
            {
                region_name: 'North',
                city_code: 123,
                city_name: 'Haifa',
                street_code: 456,
                street_name: 'Herzl',
                street_name_status: 'Active',
                official_code: 789,
                streetId: 1
            }
        ];

        await mongoDb.saveStreets(streets as any);

        expect(mongoose.connect).toHaveBeenCalled();
        expect(mockBulkWrite).toHaveBeenCalledWith([
            {
                updateOne: {
                    filter: { streetId: 1 },
                    update: { $set: streets[0] },
                    upsert: true
                }
            }
        ]);
        expect(mongoose.disconnect).toHaveBeenCalled();
    });

    it('should handle bulkWrite error and still disconnect', async () => {
        const error = new Error('DB error');
        mockBulkWrite.mockRejectedValue(error);

        const streets = [
            {
                region_name: 'Center',
                city_code: 456,
                city_name: 'Tel Aviv',
                street_code: 123,
                street_name: 'Dizengoff',
                street_name_status: 'Active',
                official_code: 321,
                streetId: 2
            }
        ];

        await mongoDb.saveStreets(streets as any);

        expect(mockBulkWrite).toHaveBeenCalled();
        expect(mongoose.disconnect).toHaveBeenCalled();
    });
});
