Proxy DB: pscale connect food-organizer initial-setup --port 3309
Branch DB: pscale branch create food-organizer <BRANCH_NAME>
Prisma Push: npx prisma db push

DB local connection string: mysql://root@127.0.0.1:3309/food-organizer
