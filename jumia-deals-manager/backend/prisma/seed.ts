/**
 * Seed script — populates the database with realistic test data.
 * Run: npm run db:seed
 */

import { PrismaClient, CampaignStatus, VendorStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@jumia.com" },
    update: {},
    create: {
      name: "Jumia Admin",
      email: "admin@jumia.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // ── Vendor companies ───────────────────────────────────────────────────────
  const vendor1 = await prisma.vendor.upsert({
    where: { id: "v1-seed-id-0000-0000-000000000001" },
    update: {},
    create: {
      id: "v1-seed-id-0000-0000-000000000001",
      companyName: "Samsung Electronics Egypt",
      contactEmail: "deals@samsung-eg.com",
      status: VendorStatus.ACTIVE,
      accountManagerId: admin.id,
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { id: "v2-seed-id-0000-0000-000000000002" },
    update: {},
    create: {
      id: "v2-seed-id-0000-0000-000000000002",
      companyName: "Philips Home Appliances",
      contactEmail: "campaigns@philips-eg.com",
      status: VendorStatus.ACTIVE,
      accountManagerId: admin.id,
    },
  });
  console.log(`  ✓ Vendors: ${vendor1.companyName}, ${vendor2.companyName}`);

  // ── Vendor users ───────────────────────────────────────────────────────────
  const vendorPassword = await bcrypt.hash("Vendor@1234", 12);
  await prisma.user.upsert({
    where: { email: "deals@samsung-eg.com" },
    update: {},
    create: {
      name: "Samsung Deals Manager",
      email: "deals@samsung-eg.com",
      passwordHash: vendorPassword,
      role: Role.VENDOR,
      vendorId: vendor1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "campaigns@philips-eg.com" },
    update: {},
    create: {
      name: "Philips Campaign Manager",
      email: "campaigns@philips-eg.com",
      passwordHash: vendorPassword,
      role: Role.VENDOR,
      vendorId: vendor2.id,
    },
  });
  console.log("  ✓ Vendor users created");

  // ── Products ───────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        sku: "SAM-S24-BLK",
        name: "Samsung Galaxy S24 Black",
        category: "Mobile",
        brand: "Samsung",
        livePrice: 25999,
        bestPrice: 23999,
        vendorId: vendor1.id,
      },
      {
        sku: "SAM-TV55-Q80",
        name: "Samsung 55\" QLED TV Q80C",
        category: "TVs",
        brand: "Samsung",
        livePrice: 35000,
        bestPrice: 32000,
        vendorId: vendor1.id,
      },
      {
        sku: "SAM-TAB-A9",
        name: "Samsung Galaxy Tab A9+",
        category: "Tablets",
        brand: "Samsung",
        livePrice: 12500,
        bestPrice: 11000,
        vendorId: vendor1.id,
      },
      {
        sku: "PHL-AC-3500",
        name: "Philips 3500 BTU Air Cooler",
        category: "Home Appliances",
        brand: "Philips",
        livePrice: 4200,
        bestPrice: 3800,
        vendorId: vendor2.id,
      },
      {
        sku: "PHL-BLND-HR",
        name: "Philips HR Blender 700W",
        category: "Kitchen Appliances",
        brand: "Philips",
        livePrice: 1800,
        bestPrice: 1500,
        vendorId: vendor2.id,
      },
    ],
  });
  console.log("  ✓ Products seeded");

  // ── Campaign ───────────────────────────────────────────────────────────────
  await prisma.campaign.upsert({
    where: { id: "c1-seed-id-0000-0000-000000000001" },
    update: {},
    create: {
      id: "c1-seed-id-0000-0000-000000000001",
      title: "Ramadan Mega Sale 2025",
      description: "Annual Ramadan campaign — best deals across all categories.",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-04-05"),
      status: CampaignStatus.ACTIVE,
      eligibleCategories: [],   // All categories eligible
      eligibleBrands: [],       // All brands eligible
    },
  });
  console.log("  ✓ Campaign seeded");

  console.log("✅ Seed complete.");
  console.log("   Admin login:  admin@jumia.com / Admin@1234");
  console.log("   Vendor login: deals@samsung-eg.com / Vendor@1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
