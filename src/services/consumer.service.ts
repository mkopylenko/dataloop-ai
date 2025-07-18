import Queue from '../interfaces/queue.interface';
import Database from '../interfaces/database.interface';

export class ConsumerService {
    private keepRunning: boolean = true;

    stop() {
        this.keepRunning = false;
    }

    async consumeAndSaveToDatabase(queue: Queue, database: Database, isRunInLoop: boolean) {
        this.keepRunning = true;

        while (this.keepRunning) {
            let streetsData: string;

            try {
                streetsData = await queue.consumeFromQueue();
            } catch (error) {
                console.error('Error consuming from queue:', error);
                continue;
            }

            if (!streetsData || streetsData === '') {
                console.log('No more data in the queue.');
                continue;
            }

            let streetsJson: any;
            try {
                streetsJson = JSON.parse(streetsData);
            } catch (error) {
                console.error('Failed to parse streets data:', error);
                continue;
            }

            try {
                console.log(`Saving streets to database: ${streetsJson.length} streets`);
                await database.saveStreets(streetsJson);
            } catch (error) {
                console.error('Failed to save streets to database:', error);
            }

            if (!isRunInLoop) {
                this.keepRunning = false;
            }
        }
    }
}
