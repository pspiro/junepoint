export const prisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  loan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  loanEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  condition: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  aIAnalysis: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  closingChecklist: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  notification: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
  investorListing: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  investorBid: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  investorCriteria: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  borrowerProfile: {
    upsert: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  document: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};
