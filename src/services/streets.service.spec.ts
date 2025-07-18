import axios from 'axios';
import { StreetsService, Street } from './streets.service';
import { cities, enlishNameByCity } from '../cities/cities';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StreetsService', () => {
    let service: StreetsService;

    beforeEach(() => {
        service = new StreetsService();
        jest.resetAllMocks();
    });

    describe('getStreetsInCity', () => {
        it('should return street IDs, hasMore flag, and nextOffset', async () => {
            const city = 'Tel Aviv Jaffa';
            const offset = 0;
            const limit = 2;

            const mockApiResponse = {
                data: {
                    result: {
                        records: [
                            { _id: 101 },
                            { _id: 102 },
                        ],
                        total: 5,
                    },
                },
            };

            mockedAxios.post.mockResolvedValue(mockApiResponse);

            const result = await service.getStreetsInCity(city, offset, limit);

            expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
                resource_id: expect.any(String),
                filters: { city_name: cities[city] },
                limit,
                offset,
            });

            expect(result).toEqual({
                streets: [{ streetId: 101 }, { streetId: 102 }],
                hasMore: true,
                nextOffset: 2,
            });
        });

        it('should handle empty records', async () => {
            const city = 'Tel Aviv Jaffa';

            mockedAxios.post.mockResolvedValue({
                data: { result: { records: [], total: 0 } },
            });

            const result = await service.getStreetsInCity(city);

            expect(result).toEqual({
                streets: [],
                hasMore: false,
                nextOffset: 1000,
            });
        });
    });

    describe('getStreetInfoById', () => {
        it('should return detailed street info for given IDs', async () => {
            const mockApiResponse = {
                data: {
                    result: {
                        records: [
                            {
                                _id: 101,
                                region_code: 1,
                                region_name: ' Central ',
                                city_code: 10,
                                city_name: 'Tel Aviv',
                                street_code: 999,
                                street_name: ' Allenby ',
                                street_name_status: ' Active ',
                                official_code: 5000,
                            },
                        ],
                    },
                },
            };

            mockedAxios.post.mockResolvedValue(mockApiResponse);

            const result = await service.getStreetInfoById([101]);

            expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
                resource_id: expect.any(String),
                filters: { _id: [101] },
            });

            expect(result).toEqual([
                {
                    streetId: 101,
                    region_code: 1,
                    region_name: 'Central',
                    city_code: 10,
                    city_name: enlishNameByCity['Tel Aviv'] || 'Tel Aviv',
                    street_code: 999,
                    street_name: 'Allenby',
                    street_name_status: 'Active',
                    official_code: 5000,
                },
            ]);
        });

        it('should throw an error if no records are returned', async () => {
            mockedAxios.post.mockResolvedValue({
                data: {
                    result: {
                        records: [],
                    },
                },
            });

            await expect(service.getStreetInfoById([123, 456])).rejects.toThrow(
                'No streets found for ids: 123, 456'
            );
        });
    });
});
