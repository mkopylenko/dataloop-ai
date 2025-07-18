import * as amqp from 'amqplib';
import Queue from '../interfaces/queue.interface';

class RabbitMq implements Queue
{

    readonly RABBITMQ_URL = process.env.QUEUE_URL?? 'amqp://guest:guest@localhost:5672';
    readonly RABBITMQ_QUEUE_NAME = process.env.QUEUE_NAME?? 'streetQueue';

    async publishToQueue(streets: any) {
        const { channel, queue, conn } = await this.prepareQueue();

        try{
            await channel.sendToQueue(queue, Buffer.from(JSON.stringify(streets)));

            console.log('Published to RabbitMQ:', streets);

        } catch (error) {
            console.error('Error publishing to RabbitMQ:', error);
        }
        finally{
            await channel.close()
            await conn.close()
        }
    }

    private async prepareQueue() {
        try{
            const conn = await amqp.connect(this.RABBITMQ_URL);
            const channel = await conn.createChannel();

            const queue = this.RABBITMQ_QUEUE_NAME;

            await channel.assertQueue(queue, {
                durable: false,
            });

            return { channel, queue, conn };
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            return null;
        }
    }

    async consumeFromQueue(): Promise<string> {
        const { channel, queue, conn } = await this.prepareQueue();
        try{

            console.log('Waiting for messages in %s', queue);

            const msg = await new Promise<amqp.ConsumeMessage | null>((resolve) => {
                channel.consume(queue, (msg) => resolve(msg));
            });

            if (msg !== null) {
                channel.ack(msg);
                return msg.content.toString();
            } else {
                return '';
            }
        }
        catch (error) {
            console.error('Error consuming from RabbitMQ:', error);
        }
        finally{
            await channel.close()
            await conn.close()

        }
        return '';
    }
}
export default RabbitMq;
