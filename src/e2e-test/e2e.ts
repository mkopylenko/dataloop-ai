import RabbitMq from "../3rd-parties/rabbit-mq";
import {PublishingService} from '../services/publisher.service';
import { cities, city, enlishNameByCity } from '../cities/cities';
import { StreetsServiceMock } from "./street-service.mock";
import {ConsumerService} from '../services/consumer.service';
import MongoDb from "../3rd-parties/mongo-db";
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

async function main() {
    const mongodb = new MongoDb();
    await mongodb.deleteDataByField('streetId', 1);
    await mongodb.deleteDataByField('streetId', 2);


    await PublishingService.publish('Itamar', new RabbitMq(), new StreetsServiceMock());
    const consumerService = new ConsumerService();
    await consumerService.consumeAndSaveToDatabase(new RabbitMq(), mongodb, false);
    const data1 = await mongodb.selectDataByField('streetId', 1);
    if (data1[0].streetId ==1 && data1[0].city_name=='qwerty')
    {
        console.log('Test 1 passed');
    }
    else
    {
        console.log('Test 1 failed');
    }
    const data2 = await mongodb.selectDataByField('streetId', 2);
    if (data2[0].streetId ==2 && data2[0].city_name=='qwerty')
    {
        console.log('Test 2 passed');
    }
    else
    {
        console.log('Test 2 failed');
    }
}

main().catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
});

function isCity(cityName: string): cityName is city {
    return cityName in cities;
}