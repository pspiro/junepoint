export enum LoanStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  CONDITIONALLY_APPROVED = 'CONDITIONALLY_APPROVED',
  APPROVED = 'APPROVED',
  IN_CLOSING = 'IN_CLOSING',
  CLOSED = 'CLOSED',
  ON_MARKET = 'ON_MARKET',
  SOLD = 'SOLD',
  SUSPENDED = 'SUSPENDED',
  DECLINED = 'DECLINED',
}

export enum LoanProgram {
  BRIDGE = 'BRIDGE',
  DSCR = 'DSCR',
  FIX_FLIP = 'FIX_FLIP',
  LONG_TERM_RENTAL = 'LONG_TERM_RENTAL',
  CONSTRUCTION = 'CONSTRUCTION',
  COMMERCIAL = 'COMMERCIAL',
}

export enum CreditDecision {
  APPROVED = 'APPROVED',
  CONDITIONALLY_APPROVED = 'CONDITIONALLY_APPROVED',
  DECLINED = 'DECLINED',
  SUSPENDED = 'SUSPENDED',
}

export interface Loan {
  id: string;
  loanNumber: string;
  brokerId: string;
  borrowerId?: string;
  assignedUwId?: string;
  program: LoanProgram;
  status: LoanStatus;
  loanAmount: number;
  purpose?: string;
  ltv?: number;
  termMonths?: number;
  interestRate?: number;

  // Property
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyType?: string;
  propertyValue?: number;
  occupancyType?: string;
  floodZone?: string;

  // DSCR-specific
  monthlyRent?: number;
  dscr?: number;

  // AI scores
  aiCompletenessScore?: number;
  aiRiskScore?: number;
  aiRecommendation?: string;

  // Human decision
  creditDecision?: CreditDecision;
  creditMemo?: string;
  decidedBy?: string;
  decidedAt?: string;
  aiOverrideReason?: string;

  // Closing
  fundedAt?: string;
  wireAmount?: number;
  wireDate?: string;
  wireReference?: string;
  recordingNumber?: string;
  recordingDate?: string;

  createdAt: string;
  updatedAt: string;
}

export interface LoanEvent {
  id: string;
  loanId: string;
  actorId?: string;
  actorType: 'USER' | 'AI_AGENT' | 'SYSTEM';
  eventType: string;
  fromStatus?: LoanStatus;
  toStatus?: LoanStatus;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface BorrowerProfile {
  id: string;
  loanId: string;
  userId: string;

  // Identity
  ssnLast4?: string;
  dateOfBirth?: string;
  citizenship?: string;

  // Address
  currentAddress?: string;
  currentCity?: string;
  currentState?: string;
  currentZip?: string;
  yearsAtAddress?: number;

  // Employment
  employerName?: string;
  employmentType?: string;
  yearsEmployed?: number;
  annualIncome?: number;

  // Financials
  liquidAssets?: number;
  totalLiabilities?: number;
  monthlyExpenses?: number;

  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}
