import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("Demo1234!", 10);

  await prisma.user.upsert({
    where: { email: "ic1@demo.org" },
    update: {},
    create: { email: "ic1@demo.org", passwordHash: password, role: "IC_MEMBER" },
  });

  await prisma.user.upsert({
    where: { email: "responder1@demo.org" },
    update: {},
    create: { email: "responder1@demo.org", passwordHash: password, role: "RESPONDER" },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.org" },
    update: {},
    create: { email: "admin@demo.org", passwordHash: password, role: "ADMIN" },
  });

  console.log("Seeded 3 demo users. Password for all: Demo1234!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });