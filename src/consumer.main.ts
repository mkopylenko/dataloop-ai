import { ConsumerService } from './services/consumer.service';
import MongoDb from './3rd-parties/mongo-db';
import RabbitMq from './3rd-parties/rabbit-mq';

async function bootstrap(): Promise<void> {
    const queue = new RabbitMq();
    const database = new MongoDb();
    const consumerService = new ConsumerService();

    const shutdown = async () => {
        console.log('Shutting down gracefully...');
        consumerService.stop(); // Stop loop
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    try {
        await consumerService.consumeAndSaveToDatabase(queue, database, true);
    } catch (error) {
        console.error('An error occurred in ConsumerService:', error);
        await shutdown();
    }
}

bootstrap();
