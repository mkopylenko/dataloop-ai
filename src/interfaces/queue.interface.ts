interface Queue {

    publishToQueue(streets: any): void;
    consumeFromQueue():Promise<string>
}

export default Queue;