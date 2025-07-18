import { StreetsService } from './streets.service';
import Queue from '../interfaces/queue.interface';
import { cities, city, enlishNameByCity } from '../cities/cities';
import * as _ from 'lodash';

export class PublishingService {
    static async publish(city: city, queue: Queue, streetsService: StreetsService) {
        try {
            const streetsData = await streetsService.getStreetsInCity(city);
            console.log(streetsData);

            const bulkSize = Number(process.env.PUBLISHING_BULK_SIZE) || 50;
            const chunks = _.chunk(streetsData.streets, bulkSize);

            await Promise.all(
                chunks.map(async (chunk, index) => {
                    try {
                        const streetIds = chunk.map(item => item.streetId);
                        const streetsInfo = await streetsService.getStreetInfoById(streetIds);
                        queue.publishToQueue(streetsInfo);
                        console.log(`Chunk ${index + 1} published successfully.`);
                    } catch (err) {
                        console.error(`Error processing chunk ${index + 1}:`, err);
                    }
                })
            );
        } catch (err) {
            console.error('Failed to publish streets for city:', city, err);
        }
    }
}

