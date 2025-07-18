import { StreetsService } from './streets.service';
import Queue from '../interfaces/queue.interface';
import { cities, city, enlishNameByCity } from '../cities/cities';
import * as _ from 'lodash';

export class PublishingService {
    static async publish(city: city, queue: Queue, streetsService: StreetsService) {
        try {
            const publishingBulkSize = Number(process.env.PUBLISHING_BULK_SIZE) || 2000;
            const apiCallBulkSize = Number(process.env.API_CALL_BULK_SIZE) || 1000;
            let offset = 0;
            let bulkCount = 1;

            while (true) {
                const { streets, hasMore, nextOffset } = await streetsService.getStreetsInCity(city, offset, apiCallBulkSize);

                if (streets.length === 0) {
                    console.log(`No streets returned for bulk ${bulkCount}. Exiting.`);
                    break;
                }

                console.log(`Processing bulk #${bulkCount} with ${streets.length} street IDs`);

                try {
                    const streetIds = streets.map(s => s.streetId);

                    const chunks = _.chunk(streetIds, publishingBulkSize);

                    await Promise.all(
                        chunks.map(async (ids, i) => {
                            try {
                                const streetsInfo = await streetsService.getStreetInfoById(ids);
                                queue.publishToQueue(streetsInfo);
                                console.log(`Published chunk ${bulkCount}.${i + 1}`);
                            } catch (err) {
                                console.error(`Failed to process chunk ${bulkCount}.${i + 1}:`, err);
                            }
                        })
                    );
                } catch (err) {
                    console.error(`Error processing bulk #${bulkCount}:`, err);
                }

                if (!hasMore) {
                    console.log(`All bulks processed for ${city}`);
                    break;
                }

                offset = nextOffset;
                bulkCount++;
            }
        } catch (err) {
            console.error(`Failed to publish streets for city ${city}:`, err);
        }
    }
}
