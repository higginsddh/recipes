Proxy DB: pscale connect food-organizer initial-setup --port 3309
Branch DB: pscale branch create food-organizer <BRANCH_NAME>
Prisma Push: npx prisma db push

DB local connection string: mysql://root@127.0.0.1:3309/food-organizer

Helpful links:
https://docs.microsoft.com/en-us/javascript/api/overview/azure/cosmos-readme
https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions#build-and-deploy
https://docs.microsoft.com/en-us/azure/static-web-apps/add-api?tabs=vanilla-javascript
