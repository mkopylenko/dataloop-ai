RabbitMq and MongoDb were used in my solution.
docker-compose.yml was changed accordingly.
2 services implemented called PublishingService and ConsumerService.
I made some changes to StreetsService: getStreetInfoById method can request street info by multiple ids,
methods were made not static in order to provide testability. Also, I added paging support for API calls.
StreetServiceMock service was created for testing purposes (end-to-end test).
PUBLISHING_BULK_SIZE environment variable was added to configure bulk size 
for inserting items by bulks into the queue.
API_CALL_BULK_SIZE environment variable was added to configure page size for street API call
Running the solution. cd to the root folder
1) Clone the repository: 'git clone https://github.com/mkopylenko/dataloop-ai.git' 
2) Checkout 'master' branch: git checkout master
3) Run docker-compose up
4) Run npm install
5) Run 'npm run consume' to start the consumer service (it will run it in loop mode waiting for new items in queue in loop)
6) Run 'npm run publish -- <SOME CITY NAME>' in order to request, process and publish city streets to queue
7) Unit tests can be run using 'npm run test'
8) End-to-end test can be run as 'npm run e2e-test'. During the test, mock data will be 'requested' using StreetServiceMock, 
    it will be inserted into queue and mongoDb. After that, monogoDb assertion will be performed. 
    During the test the ComsumerService will be run in 'no loop' mode for testing purposes.