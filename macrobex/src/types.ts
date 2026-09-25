export type UserRole = 
  | 'USER' 
  | 'SUPPORT_AGENT' 
  | 'FINANCIAL_REVIEWER' 
  | 'KYC_REVIEWER' 
  | 'SUPER_ADMIN';

export type AccountStatus = 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED';

export type VerificationStatus = 
  | 'NOT_SUBMITTED' 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'RESUBMISSION_REQUIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  verificationStatus: VerificationStatus;
  isRestricted: boolean;
  restrictionReason?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
}

export type AccountType = 'main' | 'demo';

export interface WalletAccount {
  ledgerBalance: number;
  reservedBalance: number;
  availableBalance: number; // Strictly computed: ledger - reserved
}

export interface Wallets {
  main: WalletAccount;
  demo: WalletAccount;
}

export interface WalletReservation {
  id: string;
  userId: string;
  accountType: AccountType;
  amount: number;
  entityType: 'WITHDRAWAL' | 'TRADE';
  entityId: string;
  description: string;
  createdAt: string;
  status: 'ACTIVE' | 'RELEASED';
}

export type LedgerEntryType = 
  | 'DEPOSIT' 
  | 'WITHDRAWAL' 
  | 'TRADE_PROFIT' 
  | 'TRADE_LOSS' 
  | 'ADJUSTMENT';

export interface LedgerEntry {
  id: string;
  userId: string;
  accountType: AccountType;
  type: LedgerEntryType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId: string;
  timestamp: string;
}

export type AssetCategory = 'CRYPTO' | 'COMMODITY' | 'FOREX';
export type AssetStatus = 'OPEN' | 'HALTED';

export interface PricePoint {
  time: string;
  price: number;
}

export interface Asset {
  id?: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  currentPrice: number;
  price?: number;
  previousPrice: number;
  change24h: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  status: AssetStatus;
  haltReason?: string;
  history: PricePoint[];
  isFavorite?: boolean;
  lastUpdated: string;
}

export type FeedStatus = 'LIVE' | 'DELAYED' | 'STALE' | 'OFFLINE';

export interface Trade {
  id: string;
  userId: string;
  accountType: AccountType;
  assetSymbol: string;
  direction: 'BUY' | 'SELL';
  amount: number; // in BDT
  entryPrice: number; // asset unit price in USD/USDT/BDT
  entryTime: string;
  closingPrice?: number;
  closingTime?: string;
  reservedAmount: number; // matches trade amount in BDT
  status: 'ACTIVE' | 'CLOSED';
  realizedPnL?: number;
  pnlPercent?: number;
}

export type DepositStatus = 'PENDING' | 'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
export type EvidenceQuality = 'Clear' | 'Unclear' | 'Altered' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  accountType: AccountType;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  paymentDate: string;
  simulatedEvidenceUrl?: string;
  evidenceQuality: EvidenceQuality;
  evidenceAmount?: number;
  note?: string;
  status: DepositStatus;
  riskFlags: string[];
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  idempotencyKey?: string;
  // Compatibility aliases
  referenceNumber?: string;
  senderAccount?: string;
  method?: string;
  createdAt?: string;
  proofUrl?: string;
}

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  accountType: AccountType;
  amount: number;
  method: string;
  destination: string;
  note?: string;
  status: WithdrawalStatus;
  reservationId: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  // Compatibility aliases
  destinationAccount?: string;
  rejectionReason?: string;
}

export interface VerificationSubmission {
  id: string;
  userId: string;
  userName: string;
  fullName: string;
  dob: string;
  documentType: 'NID' | 'PASSPORT' | 'DRIVING_LICENSE';
  documentNumber: string;
  address: string;
  frontDocUrl: string;
  backDocUrl?: string;
  submissionDate: string;
  status: VerificationStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  // Compatibility aliases
  submittedAt?: string;
  frontImage?: string;
  selfieImage?: string;
}

export type TicketCategory = 'ACCOUNT' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRADING' | 'VERIFICATION' | 'OTHER';
export type TicketStatus = 'OPEN' | 'IN_REVIEW' | 'WAITING_FOR_USER' | 'RESOLVED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: TicketCategory;
  subject: string;
  description: string;
  linkedEntity?: {
    type: 'TRADE' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSACTION' | 'VERIFICATION';
    id: string;
  };
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  linkTab?: string;
  linkEntityId?: string;
  read: boolean;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  eventType: string;
  entityType: 'WALLET' | 'TRADE' | 'DEPOSIT' | 'WITHDRAWAL' | 'KYC' | 'TICKET' | 'USER' | 'ASSET' | 'FEED' | 'SCENARIO';
  entityId: string;
  previousState?: any;
  newState?: any;
  reason: string;
  result: 'SUCCESS' | 'BLOCKED' | 'FAILED';
  idempotencyKey?: string;
  // Compatibility aliases
  action?: string;
  operatorName?: string;
  operatorRole?: UserRole;
  beforeState?: any;
  afterState?: any;
}

export interface SystemStatus {
  feedStatus: FeedStatus;
  lastFeedUpdate: string;
  paused: boolean;
  manualStatusOverride?: boolean;
  feedLatencyMs: number;
}

export interface ProcessedEvent {
  key: string;
  timestamp: string;
  actorId: string;
  action: string;
  result: string;
  entityId: string;
}

export interface SimulationState {
  version: string;
  users: User[];
  currentUserId: string;
  wallets: Record<string, Wallets>; // userId -> Wallets
  reservations: WalletReservation[];
  ledgerEntries: LedgerEntry[];
  assets: Asset[];
  trades: Trade[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  verifications: VerificationSubmission[];
  tickets: SupportTicket[];
  notifications: Notification[];
  auditLogs: AuditEvent[];
  systemStatus: SystemStatus;
  processedEventKeys: Record<string, ProcessedEvent>;
  lastResetAt: string;
}
