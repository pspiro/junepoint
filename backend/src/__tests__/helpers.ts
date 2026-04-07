import jwt from 'jsonwebtoken';

export const JWT_SECRET = 'test-secret';

export function makeToken(userId: string, role: string, email = `${role.toLowerCase()}@test.com`): string {
  return jwt.sign({ sub: userId, email, role }, JWT_SECRET, { expiresIn: 3600 });
}

export function authHeader(userId: string, role: string): Record<string, string> {
  return { Authorization: `Bearer ${makeToken(userId, role)}` };
}

const m = (fn: unknown) => fn as jest.Mock;
export { m };

export const mockBroker = {
  id: 'broker-1',
  email: 'broker@test.com',
  firstName: 'Bob',
  lastName: 'Broker',
  role: 'BROKER',
  isActive: true,
  passwordHash: '$2b$12$placeholder',
  companyName: 'Broker Co',
  phone: '555-1234',
  cognitoSub: null,
  mfaEnabled: false,
  lastLoginAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@test.com',
  firstName: 'Alice',
  lastName: 'Admin',
  role: 'ADMIN',
  isActive: true,
  passwordHash: '$2b$12$placeholder',
  cognitoSub: null,
  mfaEnabled: true,
  lastLoginAt: null,
  companyName: null,
  phone: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockUnderwriter = {
  id: 'uw-1',
  email: 'uw@test.com',
  firstName: 'Uma',
  lastName: 'Underwriter',
  role: 'UNDERWRITER',
  isActive: true,
  passwordHash: '$2b$12$placeholder',
  cognitoSub: null,
  mfaEnabled: true,
  lastLoginAt: null,
  companyName: null,
  phone: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockLoan = {
  id: 'loan-1',
  loanNumber: 'CF-2025-00001',
  brokerId: 'broker-1',
  borrowerId: null,
  assignedUwId: null,
  status: 'DRAFT',
  program: 'BRIDGE',
  loanAmount: 500000,
  purpose: 'Purchase',
  propertyAddress: '123 Main St',
  propertyCity: 'Austin',
  propertyState: 'TX',
  propertyZip: '78701',
  propertyType: 'SFR',
  propertyValue: 625000,
  ltv: null,
  interestRate: null,
  monthlyRent: null,
  dscr: null,
  creditDecision: null,
  creditMemo: null,
  decidedBy: null,
  decidedAt: null,
  aiOverrideReason: null,
  aiCompletenessScore: null,
  aiRiskScore: null,
  aiRecommendation: null,
  aiInsights: null,
  wireAmount: null,
  wireDate: null,
  wireReference: null,
  fundedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockDocument = {
  id: 'doc-1',
  loanId: 'loan-1',
  uploadedBy: 'broker-1',
  fileName: 'bank_statement.pdf',
  s3Key: 'loans/loan-1/doc-1/bank_statement.pdf',
  s3Bucket: 'test-bucket',
  contentType: 'application/pdf',
  fileSize: 102400,
  status: 'ACCEPTED',
  docType: 'Bank Statement',
  aiClassification: 'Bank Statement',
  aiConfidence: 0.87,
  rejectionReason: null,
  replacesDocId: null,
  processedAt: new Date('2025-01-01'),
  uploadedAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
