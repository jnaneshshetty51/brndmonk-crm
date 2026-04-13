import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { DEFAULT_ROLES } from "../lib/permissions";

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // Seed default roles
  for (const role of DEFAULT_ROLES) {
    const p = role.permissions as unknown as import("@prisma/client").Prisma.InputJsonValue;
    await prisma.systemRole.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName, permissions: p, isSystem: role.isSystem },
      create: { ...role, permissions: p },
    });
    console.log(`✅ Role upserted: ${role.displayName}`);
  }

  // Seed admin user
  const existing = await prisma.user.findUnique({ where: { email: "admin@brndmonk.com" } });
  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: { email: "admin@brndmonk.com", password: hashed, name: "Admin", role: "admin" },
    });
    console.log("✅ Admin user created: admin@brndmonk.com / admin123");
  } else {
    console.log("ℹ️  Admin user already exists");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
