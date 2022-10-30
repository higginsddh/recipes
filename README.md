Proxy DB: pscale connect food-organizer initial-setup --port 3309
Branch DB: pscale branch create food-organizer <BRANCH_NAME>
Prisma Push: npx prisma db push

DB local connection string: mysql://root@127.0.0.1:3309/food-organizer

Helpful links:
https://docs.microsoft.com/en-us/javascript/api/overview/azure/cosmos-readme
https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions#build-and-deploy
https://docs.microsoft.com/en-us/azure/static-web-apps/add-api

Azure Search: https://docs.microsoft.com/en-us/azure/search/search-howto-index-cosmosdb

TypeScript mono: https://stackoverflow.com/questions/60896829/monorepo-with-rootdirs-produces-unwanted-sudirectories-such-as-src-in-outdi

yarn start-server starts the API proxy
first need to build files into /dist folder

HotReload: https://techcommunity.microsoft.com/t5/apps-on-azure-blog/introducing-the-azure-static-web-apps-cli/ba-p/2257581

Commands:
api: npm run watch
frontend: npm start
frontend: npm run start-server

Issues With Approach:

- Debugging API TypeScript files can be a pain. Line numbers don't match.
- Issues with SWA
  - "yarn build" doesn't fail GitHub Workflow

Tech Debt:

- Fix ordering logic. Seems to be race-condition can affect ordering.
- Tests (vitest challenges: need to import "it", etc; test suite empty)
- Shared models between server and client
- Set CORS properties on blob storage
- Add alert for blob storage usage
- Delete removed files
- File name collision
- Don't process already existing files with OCR
- Move OCR text to separate object

Plan:

- Combine ingredients when adding recipes
- Shopping List
  - Sort by category
- Weekly Planner
  - Add recipes
  - Add restaurants
  - Generate shopping list
- Integrate Restaurants
  - Combine reviews + to try
