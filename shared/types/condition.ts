export enum ConditionStatus {
  OPEN = 'OPEN',
  SATISFIED = 'SATISFIED',
  WAIVED = 'WAIVED',
}

export enum ConditionParty {
  BROKER = 'BROKER',
  BORROWER = 'BORROWER',
  TITLE = 'TITLE',
}

export interface Condition {
  id: string;
  loanId: string;
  createdBy: string;
  type: string;
  description: string;
  status: ConditionStatus;
  responsibleParty: ConditionParty;
  dueDate?: string;
  linkedDocId?: string;
  satisfiedBy?: string;
  satisfiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum CtcStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  APPROVED = 'APPROVED',
}

export interface ClosingChecklist {
  id: string;
  loanId: string;
  appraisalReceived: CtcStatus;
  titleCommitment: CtcStatus;
  insuranceBinder: CtcStatus;
  floodCert: CtcStatus;
  survey: CtcStatus;
  loanDocsSigned: CtcStatus;
  wireConfirmed: CtcStatus;
  recordingConfirmed: CtcStatus;
  customItems: ClosingChecklistCustomItem[];
  updatedAt: string;
}

export interface ClosingChecklistCustomItem {
  id: string;
  item: string;
  status: CtcStatus;
  linkedDocId?: string;
}
