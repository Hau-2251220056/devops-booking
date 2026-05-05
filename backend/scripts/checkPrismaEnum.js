const { PrismaClient, Prisma } = require('@prisma/client');
const p = new PrismaClient();
console.log('Prisma Client version:', Prisma.prismaVersion.client);
const keys = Object.keys(Prisma).filter(k => /role/i.test(k));
console.log('Prisma keys matching /role/i:', keys);
if (Prisma.UserRole) {
    console.log('Prisma.UserRole:', Prisma.UserRole);
} else {
    console.log('Prisma.UserRole not defined on Prisma object.');
}
p.$disconnect();
