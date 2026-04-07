import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CapitalFlow database...\n');

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  const [adminHash, brokerHash, broker2Hash, uwHash, titleHash, investorHash] = await Promise.all([
    hash('Admin123!'), hash('Broker123!'), hash('Broker2!'), hash('UW123!'), hash('Title123!'), hash('Investor123!')
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@capitalflow.io' },
    create: { email: 'admin@capitalflow.io', passwordHash: adminHash, firstName: 'Alex', lastName: 'Admin', role: 'ADMIN', companyName: 'CapitalFlow', mfaEnabled: true },
    update: {},
  });

  const broker = await prisma.user.upsert({
    where: { email: 'broker@example.com' },
    create: { email: 'broker@example.com', passwordHash: brokerHash, firstName: 'Brian', lastName: 'Broker', role: 'BROKER', companyName: 'Premier Mortgage Group', phone: '555-100-2000' },
    update: {},
  });

  const broker2 = await prisma.user.upsert({
    where: { email: 'broker2@example.com' },
    create: { email: 'broker2@example.com', passwordHash: broker2Hash, firstName: 'Sarah', lastName: 'Sterling', role: 'BROKER', companyName: 'Sterling Capital Lending' },
    update: {},
  });

  const borrower1 = await prisma.user.upsert({
    where: { email: 'borrower@example.com' },
    create: { email: 'borrower@example.com', firstName: 'Robert', lastName: 'Borrower', role: 'BORROWER' },
    update: {},
  });

  const borrower2 = await prisma.user.upsert({
    where: { email: 'borrower2@example.com' },
    create: { email: 'borrower2@example.com', firstName: 'Jennifer', lastName: 'Chen', role: 'BORROWER' },
    update: {},
  });

  const uw = await prisma.user.upsert({
    where: { email: 'uw@capitalflow.io' },
    create: { email: 'uw@capitalflow.io', passwordHash: uwHash, firstName: 'Uma', lastName: 'Underwriter', role: 'UNDERWRITER', mfaEnabled: true },
    update: {},
  });

  const title = await prisma.user.upsert({
    where: { email: 'title@capitalflow.io' },
    create: { email: 'title@capitalflow.io', passwordHash: titleHash, firstName: 'Tyler', lastName: 'Title', role: 'TITLE', mfaEnabled: true },
    update: {},
  });

  const investor = await prisma.user.upsert({
    where: { email: 'investor@example.com' },
    create: { email: 'investor@example.com', passwordHash: investorHash, firstName: 'Ivan', lastName: 'Investor', role: 'INVESTOR', companyName: 'Atlas Capital Partners' },
    update: {},
  });

  console.log('✅ Users created');

  await prisma.investorCriteria.upsert({
    where: { investorId: investor.id },
    create: { investorId: investor.id, programs: ['DSCR', 'BRIDGE', 'FIX_FLIP'], minAmount: 500000, maxAmount: 5000000, maxLtv: 75, minYield: 0.08, states: ['CA', 'TX', 'FL', 'NY', 'AZ'] },
    update: {},
  });

  // Loan 1: IN_REVIEW — DSCR, Miami FL
  let loan1 = await prisma.loan.findFirst({ where: { loanNumber: 'CF-2025-00001' } });
  if (!loan1) {
    loan1 = await prisma.loan.create({
      data: {
        loanNumber: 'CF-2025-00001',
        brokerId: broker.id, borrowerId: borrower1.id, assignedUwId: uw.id,
        program: 'DSCR', status: 'IN_REVIEW',
        loanAmount: 1250000, purpose: 'Purchase — income-producing residential',
        ltv: 70.5, termMonths: 360, interestRate: 0.0875,
        propertyAddress: '4521 Oceanview Drive', propertyCity: 'Miami', propertyState: 'FL', propertyZip: '33101',
        propertyType: 'Single Family', propertyValue: 1775000, occupancyType: 'Investment', floodZone: 'AE',
        monthlyRent: 9500, dscr: 1.24,
        aiCompletenessScore: 85, aiRiskScore: 74, aiRecommendation: 'MANUAL_REVIEW',
      },
    });
  }

  // Loan 2: SUBMITTED — Fix & Flip, Austin TX
  let loan2 = await prisma.loan.findFirst({ where: { loanNumber: 'CF-2025-00002' } });
  if (!loan2) {
    loan2 = await prisma.loan.create({
      data: {
        loanNumber: 'CF-2025-00002',
        brokerId: broker.id, borrowerId: borrower2.id,
        program: 'FIX_FLIP', status: 'SUBMITTED',
        loanAmount: 750000, purpose: 'Acquisition + Renovation',
        ltv: 68.2, termMonths: 12, interestRate: 0.1125,
        propertyAddress: '891 Maple Street', propertyCity: 'Austin', propertyState: 'TX', propertyZip: '78701',
        propertyType: 'Single Family', propertyValue: 1100000, occupancyType: 'Investment',
        aiCompletenessScore: 72, aiRecommendation: 'MANUAL_REVIEW',
      },
    });
  }

  // Loan 3: DRAFT — Bridge, Phoenix AZ
  let loan3 = await prisma.loan.findFirst({ where: { loanNumber: 'CF-2025-00003' } });
  if (!loan3) {
    loan3 = await prisma.loan.create({
      data: {
        loanNumber: 'CF-2025-00003',
        brokerId: broker2.id,
        program: 'BRIDGE', status: 'DRAFT',
        loanAmount: 2000000, purpose: 'Bridge financing for commercial acquisition',
        propertyAddress: '1200 Commerce Blvd', propertyCity: 'Phoenix', propertyState: 'AZ', propertyZip: '85001',
        propertyType: 'Commercial', propertyValue: 2800000,
      },
    });
  }

  // Loan 4: CONDITIONALLY_APPROVED — Long-Term Rental, Atlanta GA
  let loan4 = await prisma.loan.findFirst({ where: { loanNumber: 'CF-2025-00004' } });
  if (!loan4) {
    loan4 = await prisma.loan.create({
      data: {
        loanNumber: 'CF-2025-00004',
        brokerId: broker.id, borrowerId: borrower1.id, assignedUwId: uw.id,
        program: 'LONG_TERM_RENTAL', status: 'CONDITIONALLY_APPROVED',
        loanAmount: 950000, ltv: 65.0, termMonths: 360, interestRate: 0.0825,
        propertyAddress: '333 Lakeview Court', propertyCity: 'Atlanta', propertyState: 'GA', propertyZip: '30301',
        propertyType: 'Multifamily', propertyValue: 1461538, occupancyType: 'Investment',
        monthlyRent: 6200, dscr: 1.31,
        aiCompletenessScore: 92, aiRiskScore: 81, aiRecommendation: 'APPROVE',
        creditDecision: 'CONDITIONALLY_APPROVED',
        creditMemo: 'Loan approved subject to conditions. Strong DSCR and LTV. Borrower profile solid.',
        decidedBy: uw.id, decidedAt: new Date('2025-03-15'),
      },
    });
  }

  // Loan 5: ON_MARKET — DSCR, Los Angeles CA (for investor marketplace)
  let loan5 = await prisma.loan.findFirst({ where: { loanNumber: 'CF-2025-00005' } });
  if (!loan5) {
    loan5 = await prisma.loan.create({
      data: {
        loanNumber: 'CF-2025-00005',
        brokerId: broker2.id,
        program: 'DSCR', status: 'ON_MARKET',
        loanAmount: 1800000, ltv: 67.0, termMonths: 360, interestRate: 0.0900,
        propertyAddress: '750 Pacific Coast Highway', propertyCity: 'Los Angeles', propertyState: 'CA', propertyZip: '90210',
        propertyType: 'Multifamily', propertyValue: 2686567, occupancyType: 'Investment',
        monthlyRent: 16500, dscr: 1.38,
        aiCompletenessScore: 97, aiRiskScore: 86, aiRecommendation: 'APPROVE',
        creditDecision: 'APPROVED',
        creditMemo: 'Excellent loan profile. Strong DSCR, prime market.',
        decidedBy: uw.id, decidedAt: new Date('2025-02-10'),
        fundedAt: new Date('2025-03-01'),
        wireAmount: 1800000, wireDate: new Date('2025-03-01'), wireReference: 'WIRE-2025-0301-001',
      },
    });
  }

  console.log('✅ Loans created');

  // Borrower profile
  await prisma.borrowerProfile.upsert({
    where: { loanId_userId: { loanId: loan1.id, userId: borrower1.id } },
    create: {
      loanId: loan1.id, userId: borrower1.id,
      ssnLast4: '1234', dateOfBirth: new Date('1982-06-15'), citizenship: 'US Citizen',
      currentAddress: '100 Main St', currentCity: 'Miami', currentState: 'FL', currentZip: '33101', yearsAtAddress: 8,
      employerName: 'Self-Employed / Real Estate Holdings LLC', employmentType: 'Self-Employed', yearsEmployed: 12,
      annualIncome: 285000, liquidAssets: 450000, totalLiabilities: 620000, monthlyExpenses: 8500,
      profileComplete: true,
    },
    update: {},
  });

  // Conditions
  const condCount = await prisma.condition.count({ where: { loanId: loan1.id } });
  if (condCount === 0) {
    await prisma.condition.createMany({
      data: [
        { loanId: loan1.id, createdBy: uw.id, type: 'Income Verification', description: 'Provide 2 most recent pay stubs or 2 years signed tax returns', status: 'OPEN', responsibleParty: 'BORROWER', dueDate: new Date('2025-04-30') },
        { loanId: loan1.id, createdBy: uw.id, type: 'Bank Statement', description: 'Provide 3 months most recent bank statements for all accounts', status: 'SATISFIED', responsibleParty: 'BORROWER', satisfiedBy: borrower1.id, satisfiedAt: new Date('2025-03-20') },
        { loanId: loan1.id, createdBy: uw.id, type: 'Appraisal', description: 'Independent appraisal from approved vendor required', status: 'OPEN', responsibleParty: 'BROKER', dueDate: new Date('2025-05-01') },
        { loanId: loan4.id, createdBy: uw.id, type: 'Insurance Binder', description: 'Provide insurance binder showing adequate coverage', status: 'OPEN', responsibleParty: 'BROKER' },
        { loanId: loan4.id, createdBy: uw.id, type: 'Entity Documents', description: 'LLC operating agreement and articles of organization', status: 'OPEN', responsibleParty: 'BORROWER' },
      ],
    });
  }

  // AI analysis
  const aiCount = await prisma.aIAnalysis.count({ where: { loanId: loan1.id } });
  if (aiCount === 0) {
    await prisma.aIAnalysis.create({
      data: {
        loanId: loan1.id,
        analysisType: 'UNDERWRITING', modelId: 'claude-sonnet-4-20250514',
        inputSnapshot: { loanId: loan1.id },
        outputRaw: 'Comprehensive underwriting analysis completed. LTV within acceptable parameters at 70.5%. DSCR of 1.24 slightly below preferred 1.25 threshold.',
        scores: { ltv: 76, dscr: 68, credit: 82, property: 79, borrower: 74, composite: 74 },
        recommendation: 'MANUAL_REVIEW',
        reasoning: 'DSCR marginally below preferred threshold. Strong property fundamentals in Miami market.',
        tokensUsed: 2847, latencyMs: 4231,
      },
    });
  }

  // Messages
  const msgCount = await prisma.message.count({ where: { loanId: loan1.id } });
  if (msgCount === 0) {
    await prisma.message.createMany({
      data: [
        { loanId: loan1.id, senderId: broker.id, body: 'Hi Uma, I just submitted loan CF-2025-00001. The borrower is very strong — self-employed RE investor with 12+ years track record.', sentAt: new Date('2025-03-10T09:00:00Z') },
        { loanId: loan1.id, senderId: uw.id, body: 'Thanks Brian. The DSCR comes in at 1.24 — we prefer 1.25 minimum. Can you get 2 years tax returns to strengthen the income picture?', sentAt: new Date('2025-03-11T14:30:00Z') },
        { loanId: loan1.id, senderId: broker.id, body: 'Absolutely — reaching out to borrower now. The property has a long-term tenant at $9,500/month with 18 months remaining on lease.', sentAt: new Date('2025-03-11T15:45:00Z') },
      ],
    });
  }

  // Notifications
  const notifCount = await prisma.notification.count({ where: { userId: broker.id } });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: broker.id, loanId: loan1.id, type: 'LOAN_STATUS_CHANGE', title: 'Loan CF-2025-00001 assigned to underwriter', isRead: false },
        { userId: broker.id, loanId: loan1.id, type: 'NEW_MESSAGE', title: 'New message from Uma Underwriter', body: 'Thanks Brian. The DSCR comes in at 1.24...', isRead: false },
        { userId: broker.id, loanId: loan4.id, type: 'CONDITION_ADDED', title: 'New conditions on CF-2025-00004', isRead: true },
        { userId: uw.id, loanId: loan2.id, type: 'LOAN_ASSIGNED', title: 'New loan in queue: CF-2025-00002', isRead: false },
      ],
    });
  }

  // Investor listing
  const listing = await prisma.investorListing.findUnique({ where: { loanId: loan5.id } });
  if (!listing) {
    await prisma.investorListing.create({
      data: {
        loanId: loan5.id, askingPrice: 1800000, yield: 0.09,
        aiSummary: 'Prime Los Angeles multifamily DSCR loan. Strong borrower with 1.38x DSCR. Property in high-demand rental market. Loan performing as expected.',
        listedAt: new Date('2025-03-15'),
      },
    });
  }

  // Loan events
  const eventCount = await prisma.loanEvent.count({ where: { loanId: loan1.id } });
  if (eventCount === 0) {
    await prisma.loanEvent.createMany({
      data: [
        { loanId: loan1.id, actorId: broker.id, actorType: 'USER', eventType: 'LOAN_CREATED', toStatus: 'DRAFT', createdAt: new Date('2025-03-01T10:00:00Z') },
        { loanId: loan1.id, actorId: broker.id, actorType: 'USER', eventType: 'STATUS_CHANGE', fromStatus: 'DRAFT', toStatus: 'SUBMITTED', createdAt: new Date('2025-03-05T11:00:00Z') },
        { loanId: loan1.id, actorType: 'AI_AGENT', eventType: 'COMPLETENESS_CHECK_COMPLETE', payload: { score: 85 }, createdAt: new Date('2025-03-05T11:05:00Z') },
        { loanId: loan1.id, actorId: admin.id, actorType: 'USER', eventType: 'LOAN_ASSIGNED', payload: { underwriterId: uw.id }, createdAt: new Date('2025-03-06T09:00:00Z') },
        { loanId: loan1.id, actorId: uw.id, actorType: 'USER', eventType: 'STATUS_CHANGE', fromStatus: 'SUBMITTED', toStatus: 'IN_REVIEW', createdAt: new Date('2025-03-06T09:30:00Z') },
      ],
    });
  }

  // Platform config
  for (const [key, value] of Object.entries({
    ai_underwriting_enabled: 'true', investor_marketplace_enabled: 'true',
    email_intake_enabled: 'true', property_research_agent_enabled: 'false', investor_matching_agent_enabled: 'false',
  })) {
    await prisma.platformConfig.upsert({ where: { key }, create: { key, value }, update: {} });
  }

  console.log('✅ All seed data created');
  console.log('\n' + '='.repeat(50));
  console.log('TEST CREDENTIALS');
  console.log('='.repeat(50));
  console.log('ADMIN:       admin@capitalflow.io  / Admin123!');
  console.log('BROKER:      broker@example.com    / Broker123!');
  console.log('BROKER 2:    broker2@example.com   / Broker2!');
  console.log('UNDERWRITER: uw@capitalflow.io     / UW123!');
  console.log('TITLE:       title@capitalflow.io  / Title123!');
  console.log('INVESTOR:    investor@example.com  / Investor123!');
  console.log('='.repeat(50));
  console.log('\nBORROWER magic link (no password — token-based):');
  const magicToken = require('jsonwebtoken').sign(
    { sub: (await prisma.user.findUnique({ where: { email: 'borrower@example.com' } }))!.id, type: 'magic' },
    process.env.JWT_SECRET || 'local-dev-secret-not-for-production',
    { expiresIn: '30d' }
  );
  console.log(`http://localhost:5173/magic/${magicToken}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
