export type UserRole =
  | "SUPER_ADMIN"
  | "GOVERNMENT_OFFICER"
  | "VERIFICATION_OFFICER"
  | "DATA_ENTRY_OPERATOR"
  | "CITIZEN";

export type VerificationStatus =
  | "PENDING"
  | "PROCESSING"
  | "IN_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "ISSUES";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Permission {
  name: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  permissions: string[];
  lastLogin?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  status: "UPLOADED" | "PROCESSING" | "EXTRACTED" | "VALIDATED" | "VERIFIED" | "REJECTED";
  verificationStatus: VerificationStatus;
  metadata: Record<string, string | number | null>;
  previewUrl?: string;
  rawText?: string;
  confidence?: number;
  pageCount?: number;
  recordId?: string;
}

export interface ExtractionField {
  field: string;
  value: string | null;
  confidence: number;
  source_page: number;
  status: "verified" | "review" | "missing";
}

export interface ValidationResult {
  ruleId: string;
  field: string;
  severity: Severity;
  description: string;
  expectedValue: string;
  detectedValue: string;
  status: "PASS" | "WARN" | "FAIL";
}

export interface LandRecord {
  id: string;
  propertyId: string;
  surveyNumber: string;
  gatNumber: string;
  ownerName: string;
  coOwnerNames: string[];
  fatherName: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  area: number;
  landType: string;
  landUse: string;
  ownershipType: string;
  mutationNumber: string;
  documentNumber: string;
  registrationDate: string;
  lastUpdated: string;
  address: string;
  latitude: number;
  longitude: number;
  verificationStatus: VerificationStatus;
  documentType: string;
  extractedFields: ExtractionField[];
  validationResults: ValidationResult[];
  comments?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  recordId?: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
  oldValue?: string;
  newValue?: string;
}

export interface SystemSettings {
  autoOcrEnabled: boolean;
  strictValidation: boolean;
  maxAreaThreshold: number;
  allowedDocumentTypes: string[];
  departmentName: string;
  stateName: string;
}

export interface AppData {
  users: User[];
  documents: DocumentRecord[];
  landRecords: LandRecord[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  settings?: SystemSettings;
}

export interface AuthenticationResult {
  user: User;
  token: string;
}

export interface SearchFilters {
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  landType?: string;
  verificationStatus?: VerificationStatus;
  dateRange?: string;
  documentType?: string;
  query?: string;
}
