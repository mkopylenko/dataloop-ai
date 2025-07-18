import RabbitMq from "./3rd-parties/rabbit-mq";
import {PublishingService} from './services/publisher.service';
import { cities, city, enlishNameByCity } from './cities/cities';
import { StreetsService } from "./services/streets.service";
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

async function main() {

    // Publish streets data to RabbitMQ for a specific city
    const cityVal:any = process.argv[2];

    if (!cityVal) {
        console.error('Please provide a city as an argument.');
        process.exit(1);
    }
    if (!isCity(cityVal))
    {
        console.error('Wrong city.');
        process.exit(1);
    }

    console.log (cityVal);

    await PublishingService.publish(cityVal as city, new RabbitMq(), new StreetsService());

}

main().catch(error => {
    console.error('An error occurred in publisher:', error);
    process.exit(1);
});

function isCity(cityName: string): cityName is city {
    return cityName in cities;
}