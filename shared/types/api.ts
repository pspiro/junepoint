import { User, UserRole } from './user';
import { Loan, LoanProgram, LoanStatus, CreditDecision, BorrowerProfile } from './loan';
import { Document } from './document';
import { Condition, ConditionParty, ConditionStatus, ClosingChecklist } from './condition';
import { Notification } from './notification';
import { AIAnalysis, AIAnalysisType } from './ai';

export type { User, Loan, Document, Condition, ClosingChecklist, Notification, AIAnalysis, BorrowerProfile };

// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface MagicLinkRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// ---- Users ----
export interface InviteBorrowerRequest {
  email: string;
  firstName: string;
  lastName: string;
  loanId: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
}

// ---- Loans ----
export interface CreateLoanRequest {
  program: LoanProgram;
  loanAmount: number;
  purpose?: string;
  propertyAddress?: string;
  propertyType?: string;
  propertyValue?: number;
  borrowerId?: string;
}

export interface UpdateLoanRequest {
  program?: LoanProgram;
  loanAmount?: number;
  purpose?: string;
  ltv?: number;
  termMonths?: number;
  interestRate?: number;
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyType?: string;
  propertyValue?: number;
  occupancyType?: string;
  floodZone?: string;
  monthlyRent?: number;
  dscr?: number;
  borrowerId?: string;
}

export interface LoansListResponse {
  loans: Loan[];
  total: number;
}

export interface LoanEventRequest {
  transition: string;
  note?: string;
}

export interface AssignLoanRequest {
  underwriterId: string;
}

// ---- Documents ----
export interface PresignedUrlRequest {
  loanId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  documentId: string;
  key: string;
}

export interface ConfirmUploadRequest {
  documentId: string;
}

export interface UpdateDocumentRequest {
  docType?: string;
  status?: 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
}

export interface DocumentsListResponse {
  documents: Document[];
  total: number;
}

// ---- Underwriting ----
export interface UnderwritingResponse {
  aiAnalyses: AIAnalysis[];
  conditions: Condition[];
  decision?: {
    outcome: CreditDecision;
    creditMemo: string;
    decidedBy: string;
    decidedAt: string;
  };
}

export interface CreditDecisionRequest {
  outcome: CreditDecision;
  creditMemo: string;
  conditionIds: string[];
  aiOverrideReason?: string;
}

export interface AddConditionRequest {
  type: string;
  description: string;
  responsibleParty: ConditionParty;
  dueDate?: string;
}

export interface UpdateConditionRequest {
  status?: ConditionStatus;
  linkedDocId?: string;
}

// ---- Closing ----
export interface FundLoanRequest {
  wireAmount: number;
  wireDate: string;
  wireReference: string;
}

export interface UpdateCtcRequest {
  item: string;
  status: 'PENDING' | 'RECEIVED' | 'APPROVED';
  linkedDocId?: string;
}

// ---- Investor ----
export interface InvestorListing {
  id: string;
  loanId: string;
  program: LoanProgram;
  amount: number;
  ltv: number;
  yield: number;
  aiSummary?: string;
  matchScore?: number;
  daysOnMarket: number;
  askingPrice: number;
  listedAt: string;
}

export interface MarketplaceListResponse {
  listings: InvestorListing[];
  total: number;
}

export interface SubmitBidRequest {
  bidAmount: number;
  terms?: string;
}

export interface InvestorBid {
  id: string;
  listingId: string;
  investorId: string;
  bidAmount: number;
  terms?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
}

export interface InvestorCriteria {
  id: string;
  investorId: string;
  programs?: LoanProgram[];
  minAmount?: number;
  maxAmount?: number;
  maxLtv?: number;
  minYield?: number;
  states?: string[];
}

export interface UpdateInvestorCriteriaRequest {
  programs?: LoanProgram[];
  minAmount?: number;
  maxAmount?: number;
  maxLtv?: number;
  minYield?: number;
  states?: string[];
}

export interface PortfolioSummary {
  totalDeployed: number;
  interestEarned: number;
  activeCount: number;
}

// ---- Messages ----
export interface Message {
  id: string;
  loanId: string;
  body: string;
  sender: {
    id: string;
    firstName: string;
    role: string;
  };
  sentAt: string;
  readAt?: string;
}

export interface SendMessageRequest {
  body: string;
}

export interface MessagesListResponse {
  messages: Message[];
}

// ---- Notifications ----
export interface NotificationsListResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ---- AI ----
export interface AIChatRequest {
  message: string;
  loanId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AIChatResponse {
  reply: string;
  citations?: string[];
}

export interface TriggerAnalysisRequest {
  analysisType: AIAnalysisType;
}

export interface TriggerAnalysisResponse {
  jobId: string;
  queued: boolean;
}

// ---- Generic ----
export interface OkResponse {
  ok: boolean;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}
