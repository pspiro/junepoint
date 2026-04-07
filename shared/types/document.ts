export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface Document {
  id: string;
  loanId: string;
  uploadedBy: string;
  fileName: string;
  s3Key: string;
  s3Bucket: string;
  contentType?: string;
  fileSize?: number;
  docType?: string;
  aiClassification?: string;
  aiConfidence?: number;
  status: DocumentStatus;
  rejectionReason?: string;
  version: number;
  replacesDocId?: string;
  contentText?: string;
  uploadedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
}
