# How to run Auto Test?

1. Install the dependencies 
```shell
npm install
```

2. Build the application
```shell
npm run build
```

3. Start the application
```shell
POSTMAN_API_KEY=<API_KEY> LOG_LEVEL=debug node dist/src/index.js --http
```

4. Run the auto test using the following command -
```shell
docker run -v "$(pwd)/build/reports/specmatic:/usr/src/app/build/reports/specmatic" \
  -v "$(pwd)/auto_test_dictionary.json:/usr/src/app/dictionary.json" \
  --network host \
  specmatic/specmatic mcp test \
  --url http://localhost:3000 \
  --bearer-token <API_KEY> \
  --dictionary-file dictionary.json \
  --skip-tools createCollectionResponse,createMock,createSpecFile,generateSpecFromCollection,getTaggedEntities,getCollection,updateSpecProperties,createCollectionRequest,generateCollection,getMock,getSpecCollections,publishMock,syncCollectionWithSpec,syncSpecWithCollection,createCollectionRequest
```

Note - The server has to be restarted for every test run.
