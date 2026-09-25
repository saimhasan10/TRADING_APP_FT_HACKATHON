import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SimulationState,
  User,
  UserRole,
  AccountType,
  Asset,
  Trade,
  DepositRequest,
  WithdrawalRequest,
  VerificationSubmission,
  SupportTicket,
  Notification,
  AuditEvent,
  LedgerEntry,
  WalletReservation,
  FeedStatus,
  AssetStatus,
  VerificationStatus,
} from '../types';
import { createInitialSeedState, STORAGE_KEY } from '../mock/seedData';

interface SimulationContextType {
  state: SimulationState;
  currentUser: User;
  currentRole: UserRole;
  currentAccountMode: AccountType;
  setAccountMode: (mode: AccountType) => void;
  setCurrentUserById: (userId: string) => void;
  // Auth
  login: (email: string, role?: UserRole) => boolean;
  register: (name: string, email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  // User wallet operations
  submitDeposit: (data: { amount: number; paymentMethod: string; paymentReference: string; paymentDate: string; evidenceQuality: 'Clear' | 'Unclear' | 'Altered'; note?: string }) => { success: boolean; message: string };
  submitWithdrawal: (data: { amount: number; method: string; destination: string; note?: string }) => { success: boolean; message: string };
  submitKYC: (data: { fullName: string; dob: string; documentType: 'NID' | 'PASSPORT' | 'DRIVING_LICENSE'; documentNumber: string; address: string }) => { success: boolean; message: string };
  // Trading
  openTrade: (data: { assetSymbol: string; direction: 'BUY' | 'SELL'; amount: number }) => { success: boolean; message: string };
  closeTrade: (tradeId: string) => { success: boolean; message: string };
  // Support
  createTicket: (data: { category: any; subject: string; description: string; linkedEntity?: { type: any; id: string }; priority: any }) => { success: boolean; message: string; ticketId?: string };
  replyTicket: (ticketId: string, message: string) => { success: boolean; message: string };
  // Admin Operations (Protected)
  approveDeposit: (depositId: string, reviewerNotes: string, idempotencyKey?: string) => { success: boolean; message: string; blockedDuplicate?: boolean };
  rejectDeposit: (depositId: string, reviewerNotes: string) => { success: boolean; message: string };
  requestInfoDeposit: (depositId: string, reviewerNotes: string) => { success: boolean; message: string };
  approveWithdrawal: (withdrawalId: string, reviewerNotes: string) => { success: boolean; message: string };
  rejectWithdrawal: (withdrawalId: string, reviewerNotes: string) => { success: boolean; message: string };
  reviewKYC: (kycId: string, decision: 'VERIFIED' | 'REJECTED' | 'RESUBMISSION_REQUIRED', reviewerNotes: string) => { success: boolean; message: string };
  updateTicketStatus: (ticketId: string, status: any) => { success: boolean; message: string };
  toggleUserRestriction: (userId: string, reason: string) => { success: boolean; message: string };
  // Market Reliability & Feed Control
  toggleFeedPause: (reason?: string) => void;
  setFeedStatusOverride: (status: FeedStatus, reason?: string) => void;
  toggleAssetHalt: (symbol: string, reason: string) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Scenarios
  runScenarioLevel1: () => void;
  runScenarioLevel2: () => void;
  runScenarioLevel3: () => { success: boolean; incidentTimeline: any[] };
  resetDemoData: () => void;
  // AI query runner
  queryAI: (question: string) => Promise<{ answer: string; deterministicEvidence: any; isAiSynthesized: boolean; error?: string }>;
  // Toast notifications
  toasts: { id: string; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  // Navigation helper for tab selection
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  incidentModalOpen: boolean;
  setIncidentModalOpen: (open: boolean) => void;
  portalMode: 'user' | 'admin' | 'USER' | 'ADMIN';
  setPortalMode: (mode: any) => void;
  isSuperAdmin: boolean;
  isStaff: boolean;
  replyToTicket: (data: { ticketId: string; senderId?: string; senderName?: string; senderRole?: any; message: string }) => { success: boolean; message: string };
  updateUserRole: (userId: string, role: UserRole) => void;
  setFeedStatus: (status: FeedStatus) => void;
  setFeedLatency: (ms: number) => void;
  clearAllNotifications: () => void;
  triggerPriceSpike: (symbol: string, pct: number) => void;
  triggerScenario1: () => void;
  triggerScenario2: () => void;
  triggerScenario3: () => void;
  triggerScenario4: () => void;
  triggerScenario5: () => void;
  triggerScenario6: () => void;
  submitDepositRequest: (data: any) => any;
  submitWithdrawalRequest: (data: any) => any;
  submitVerification: (data: any) => any;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with versioned fallback
  const [state, setState] = useState<SimulationState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === 'v1.0.0' && Array.isArray(parsed.users)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage, initializing seed data:', e);
    }
    const initial = createInitialSeedState();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {}
    return initial;
  });

  const [currentAccountMode, setAccountMode] = useState<AccountType>('main');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('overview');
  const [portalMode, setPortalModeState] = useState<'user' | 'admin'>('user');
  const setPortalMode = useCallback((mode: any) => {
    if (typeof mode === 'string') {
      const lower = mode.toLowerCase();
      setPortalModeState(lower === 'admin' ? 'admin' : 'user');
    }
  }, []);
  const [incidentModalOpen, setIncidentModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }[]>([]);

  // Toast dispatch
  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  // Current User
  const currentUser = useMemo(() => {
    return state.users.find((u) => u.id === state.currentUserId) || state.users[0];
  }, [state.users, state.currentUserId]);

  const currentRole = currentUser.role;

  // Stale Market Auto-Detection & Price Ticker Interval (2.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const now = new Date();
        const nowIso = now.toISOString();
        const lastUpdatedDate = new Date(prev.systemStatus.lastFeedUpdate);
        const timeDiffMs = now.getTime() - lastUpdatedDate.getTime();

        // Check if market feed is paused or forced offline
        if (prev.systemStatus.paused || prev.systemStatus.manualStatusOverride) {
          // If not updated for > 10s and not already marked STALE/OFFLINE
          if (timeDiffMs > 10000 && prev.systemStatus.feedStatus === 'LIVE') {
            return {
              ...prev,
              systemStatus: {
                ...prev.systemStatus,
                feedStatus: 'STALE',
              },
            };
          }
          return prev;
        }

        // Live market feed fluctuation: ±0.05% to ±0.2%
        const updatedAssets = prev.assets.map((asset) => {
          if (asset.status === 'HALTED') return asset;

          const deltaPercent = (Math.random() * 0.003 - 0.0014); // controlled movement
          const newPriceRaw = asset.currentPrice * (1 + deltaPercent);
          // Format precision according to asset
          let newPrice = Number(newPriceRaw.toFixed(asset.category === 'FOREX' ? 4 : 2));
          if (asset.symbol === 'EUR/USD') newPrice = Number(newPriceRaw.toFixed(4));

          const change24h = Number((newPrice - asset.previousPrice).toFixed(4));
          const change24hPct = Number(((change24h / asset.previousPrice) * 100).toFixed(2));
          const high24h = Math.max(asset.high24h, newPrice);
          const low24h = Math.min(asset.low24h, newPrice);

          const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newHistory = [...asset.history, { time: timeLabel, price: newPrice }].slice(-20);

          return {
            ...asset,
            currentPrice: newPrice,
            change24h,
            change24hPct,
            high24h,
            low24h,
            history: newHistory,
            lastUpdated: nowIso,
          };
        });

        return {
          ...prev,
          assets: updatedAssets,
          systemStatus: {
            ...prev.systemStatus,
            feedStatus: 'LIVE',
            lastFeedUpdate: nowIso,
            feedLatencyMs: Math.floor(35 + Math.random() * 25),
          },
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Helpers
  const setCurrentUserById = useCallback((userId: string) => {
    setState((prev) => ({ ...prev, currentUserId: userId }));
    addToast('Account Switched', `Now acting as ${state.users.find((u) => u.id === userId)?.name || 'User'}`, 'info');
  }, [state.users, addToast]);

  const login = useCallback((email: string, _targetRole?: UserRole) => {
    const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      addToast('Login Failed', 'Invalid credentials. Use user@macrobex.demo or admin@macrobex.demo', 'error');
      return false;
    }
    setState((prev) => ({ ...prev, currentUserId: user.id }));
    addToast('Authenticated', `Welcome back, ${user.name}!`, 'success');
    return true;
  }, [state.users, addToast]);

  const register = useCallback((name: string, email: string, _password?: string) => {
    if (!name.trim() || !email.trim()) {
      return { success: false, error: 'All fields are required.' };
    }
    const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Duplicate email: an account already exists with this email address.' };
    }

    const newUserId = 'usr-' + Math.floor(1000 + Math.random() * 9000);
    const newUser: User = {
      id: newUserId,
      name: name.trim(),
      email: email.trim(),
      role: 'USER',
      status: 'ACTIVE',
      verificationStatus: 'NOT_SUBMITTED',
      isRestricted: false,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUserId: newUserId,
      wallets: {
        ...prev.wallets,
        [newUserId]: {
          main: { ledgerBalance: 0, reservedBalance: 0, availableBalance: 0 },
          demo: { ledgerBalance: 100000, reservedBalance: 0, availableBalance: 100000 },
        },
      },
      auditLogs: [
        {
          id: 'aud-' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          actorId: newUserId,
          actorName: newUser.name,
          actorRole: 'USER',
          eventType: 'USER_REGISTERED',
          entityType: 'USER',
          entityId: newUserId,
          reason: 'Synthetic user registration',
          result: 'SUCCESS',
        },
        ...prev.auditLogs,
      ],
      notifications: [
        {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: newUserId,
          title: 'Welcome to MacroBex',
          message: 'Your simulated account has been provisioned with BDT 100,000 Demo balance.',
          type: 'SUCCESS',
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev.notifications,
      ],
    }));

    addToast('Account Created', 'Registration successful! Main wallet: BDT 0, Demo wallet: BDT 100,000.', 'success');
    return { success: true };
  }, [state.users, addToast]);

  const logout = useCallback(() => {
    // Revert to demo user session
    setState((prev) => ({ ...prev, currentUserId: 'usr-1001' }));
    addToast('Logged Out', 'Returned to public / demo session', 'info');
  }, [addToast]);

  // Submit Deposit (User)
  const submitDeposit = useCallback((data: {
    amount: number;
    paymentMethod: string;
    paymentReference: string;
    paymentDate: string;
    evidenceQuality: 'Clear' | 'Unclear' | 'Altered';
    note?: string;
  }) => {
    if (currentUser.isRestricted) {
      addToast('Deposit Blocked', 'Restricted users cannot submit deposits.', 'error');
      return { success: false, message: 'Restricted users cannot submit deposits.' };
    }
    if (data.amount <= 0) {
      addToast('Invalid Amount', 'Deposit amount must be greater than zero.', 'error');
      return { success: false, message: 'Deposit amount must be positive.' };
    }

    const depId = 'DEP-' + Math.floor(2000 + Math.random() * 8000);
    const riskFlags: string[] = [];

    // Check duplicate reference in existing deposits
    const duplicateRef = state.deposits.find(
      (d) => d.paymentReference.trim().toUpperCase() === data.paymentReference.trim().toUpperCase()
    );
    if (duplicateRef) {
      riskFlags.push(`Duplicate reference ${data.paymentReference} detected (Already submitted in ${duplicateRef.id})`);
    }

    if (data.evidenceQuality === 'Unclear') {
      riskFlags.push('Unclear document readability (blurry or low-resolution receipt)');
    }

    const newDeposit: DepositRequest = {
      id: depId,
      userId: currentUser.id,
      userName: currentUser.name,
      accountType: currentAccountMode,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference.trim().toUpperCase(),
      paymentDate: data.paymentDate,
      evidenceQuality: data.evidenceQuality,
      evidenceAmount: data.evidenceQuality === 'Clear' ? data.amount : undefined,
      note: data.note,
      status: riskFlags.length > 0 ? 'REVIEW_REQUIRED' : 'PENDING',
      riskFlags,
      simulatedEvidenceUrl: `SIM_EVIDENCE_${depId}`,
    };

    const newAudit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'DEPOSIT_SUBMITTED',
      entityType: 'DEPOSIT',
      entityId: depId,
      newState: { amount: data.amount, reference: data.paymentReference, riskFlags },
      reason: 'User submitted simulated deposit evidence for administrative review',
      result: 'SUCCESS',
    };

    const newNotif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      title: 'Deposit In Review',
      message: `Deposit ${depId} for BDT ${data.amount.toLocaleString()} was submitted. Pending administrative review.`,
      type: 'INFO',
      linkTab: 'wallet',
      linkEntityId: depId,
      read: false,
      timestamp: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      deposits: [newDeposit, ...prev.deposits],
      auditLogs: [newAudit, ...prev.auditLogs],
      notifications: [newNotif, ...prev.notifications],
    }));

    addToast('Deposit Submitted', `Request ${depId} queued for review. Ledger balance is not credited until approved.`, 'info');
    return { success: true, message: 'Deposit submitted successfully.' };
  }, [currentUser, currentAccountMode, state.deposits, addToast]);

  // Submit Withdrawal (User)
  const submitWithdrawal = useCallback((data: {
    amount: number;
    method: string;
    destination: string;
    note?: string;
  }) => {
    if (currentUser.isRestricted) {
      addToast('Withdrawal Blocked', 'Restricted users cannot submit withdrawals.', 'error');
      return { success: false, message: 'Account is restricted.' };
    }
    if (data.amount <= 0) {
      addToast('Invalid Amount', 'Withdrawal amount must be greater than zero.', 'error');
      return { success: false, message: 'Invalid amount.' };
    }

    const userWallet = state.wallets[currentUser.id]?.[currentAccountMode] || {
      ledgerBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
    };

    if (data.amount > userWallet.availableBalance) {
      addToast('Insufficient Available Funds', `Available: BDT ${userWallet.availableBalance.toLocaleString()}, Requested: BDT ${data.amount.toLocaleString()}`, 'error');
      return { success: false, message: 'Amount exceeds available balance.' };
    }

    const wdId = 'WD-' + Math.floor(1000 + Math.random() * 9000);
    const resId = 'res-' + wdId.toLowerCase();
    const nowIso = new Date().toISOString();

    const reservation: WalletReservation = {
      id: resId,
      userId: currentUser.id,
      accountType: currentAccountMode,
      amount: data.amount,
      entityType: 'WITHDRAWAL',
      entityId: wdId,
      description: `Reservation for withdrawal ${wdId}`,
      createdAt: nowIso,
      status: 'ACTIVE',
    };

    const newWithdrawal: WithdrawalRequest = {
      id: wdId,
      userId: currentUser.id,
      userName: currentUser.name,
      accountType: currentAccountMode,
      amount: data.amount,
      method: data.method,
      destination: data.destination,
      note: data.note,
      status: 'PENDING',
      reservationId: resId,
      createdAt: nowIso,
    };

    // Calculate strictly: Available = Ledger - Reserved
    const newReserved = userWallet.reservedBalance + data.amount;
    const newAvailable = userWallet.ledgerBalance - newReserved;

    const newAudit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'WITHDRAWAL_SUBMITTED',
      entityType: 'WITHDRAWAL',
      entityId: wdId,
      previousState: { reserved: userWallet.reservedBalance, available: userWallet.availableBalance },
      newState: { reserved: newReserved, available: newAvailable, amount: data.amount },
      reason: `User submitted withdrawal ${wdId}; created matching reservation ${resId} for BDT ${data.amount}`,
      result: 'SUCCESS',
    };

    const newNotif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      title: 'Withdrawal Submitted',
      message: `Withdrawal ${wdId} for BDT ${data.amount.toLocaleString()} placed. BDT ${data.amount.toLocaleString()} is reserved.`,
      type: 'INFO',
      linkTab: 'wallet',
      linkEntityId: wdId,
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      wallets: {
        ...prev.wallets,
        [currentUser.id]: {
          ...prev.wallets[currentUser.id],
          [currentAccountMode]: {
            ledgerBalance: userWallet.ledgerBalance,
            reservedBalance: newReserved,
            availableBalance: newAvailable,
          },
        },
      },
      reservations: [reservation, ...prev.reservations],
      withdrawals: [newWithdrawal, ...prev.withdrawals],
      auditLogs: [newAudit, ...prev.auditLogs],
      notifications: [newNotif, ...prev.notifications],
    }));

    addToast('Withdrawal Placed', `BDT ${data.amount.toLocaleString()} reserved from available balance pending payout review.`, 'info');
    return { success: true, message: 'Withdrawal placed successfully.' };
  }, [currentUser, currentAccountMode, state.wallets, addToast]);

  // Submit KYC (User)
  const submitKYC = useCallback((data: {
    fullName: string;
    dob: string;
    documentType: 'NID' | 'PASSPORT' | 'DRIVING_LICENSE';
    documentNumber: string;
    address: string;
  }) => {
    const kycId = 'KYC-' + Math.floor(500 + Math.random() * 500);
    const nowIso = new Date().toISOString();

    const submission: VerificationSubmission = {
      id: kycId,
      userId: currentUser.id,
      userName: currentUser.name,
      fullName: data.fullName,
      dob: data.dob,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      address: data.address,
      frontDocUrl: `SIMULATED_DOC_FRONT_${kycId}`,
      backDocUrl: `SIMULATED_DOC_BACK_${kycId}`,
      submissionDate: nowIso,
      status: 'PENDING',
    };

    const newAudit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'KYC_SUBMITTED',
      entityType: 'KYC',
      entityId: kycId,
      newState: { documentType: data.documentType, documentNumber: data.documentNumber },
      reason: 'User submitted identity documents for compliance verification',
      result: 'SUCCESS',
    };

    setState((prev) => ({
      ...prev,
      verifications: [submission, ...prev.verifications.filter((v) => v.userId !== currentUser.id)],
      users: prev.users.map((u) => u.id === currentUser.id ? { ...u, verificationStatus: 'PENDING' } : u),
      auditLogs: [newAudit, ...prev.auditLogs],
      notifications: [
        {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: currentUser.id,
          title: 'Verification In Review',
          message: 'Your verification submission has been received and queued for review.',
          type: 'INFO',
          linkTab: 'verification',
          read: false,
          timestamp: nowIso,
        },
        ...prev.notifications,
      ],
    }));

    addToast('Verification Submitted', 'Identity documents uploaded for compliance review.', 'success');
    return { success: true, message: 'KYC submitted.' };
  }, [currentUser, addToast]);

  // Open Trade (User)
  const openTrade = useCallback((data: {
    assetSymbol: string;
    direction: 'BUY' | 'SELL';
    amount: number;
  }) => {
    if (currentUser.isRestricted) {
      addToast('Trade Blocked', 'Restricted users cannot open new trades.', 'error');
      return { success: false, message: 'Account is restricted.' };
    }

    // Reliability check: Market feed must be LIVE
    if (state.systemStatus.feedStatus !== 'LIVE') {
      addToast('Feed Stale/Offline', `Market feed is ${state.systemStatus.feedStatus}. All new trades are disabled.`, 'error');
      return { success: false, message: `Market feed is ${state.systemStatus.feedStatus}. New trades disabled.` };
    }

    const asset = state.assets.find((a) => a.symbol === data.assetSymbol);
    if (!asset) {
      return { success: false, message: 'Asset not found.' };
    }

    if (asset.status === 'HALTED') {
      addToast('Asset Halted', `${asset.symbol} is currently halted by administration. No new trades permitted.`, 'error');
      return { success: false, message: `${asset.symbol} is halted.` };
    }

    if (data.amount <= 0) {
      addToast('Invalid Amount', 'Trade amount must be greater than zero.', 'error');
      return { success: false, message: 'Trade amount must be positive.' };
    }

    const userWallet = state.wallets[currentUser.id]?.[currentAccountMode] || {
      ledgerBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
    };

    if (data.amount > userWallet.availableBalance) {
      addToast('Insufficient Available Funds', `Available: BDT ${userWallet.availableBalance.toLocaleString()}, Trade: BDT ${data.amount.toLocaleString()}`, 'error');
      return { success: false, message: 'Amount exceeds available balance.' };
    }

    const tradeId = 'TRD-' + Math.floor(1000 + Math.random() * 9000);
    const resId = 'res-' + tradeId.toLowerCase();
    const nowIso = new Date().toISOString();

    const reservation: WalletReservation = {
      id: resId,
      userId: currentUser.id,
      accountType: currentAccountMode,
      amount: data.amount,
      entityType: 'TRADE',
      entityId: tradeId,
      description: `Reservation for ${data.direction} ${data.assetSymbol} trade ${tradeId}`,
      createdAt: nowIso,
      status: 'ACTIVE',
    };

    const newTrade: Trade = {
      id: tradeId,
      userId: currentUser.id,
      accountType: currentAccountMode,
      assetSymbol: data.assetSymbol,
      direction: data.direction,
      amount: data.amount,
      entryPrice: asset.currentPrice,
      entryTime: nowIso,
      reservedAmount: data.amount,
      status: 'ACTIVE',
    };

    // Available Balance = Ledger - Reserved
    const newReserved = userWallet.reservedBalance + data.amount;
    const newAvailable = userWallet.ledgerBalance - newReserved;

    const newAudit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'TRADE_OPENED',
      entityType: 'TRADE',
      entityId: tradeId,
      newState: {
        asset: data.assetSymbol,
        direction: data.direction,
        amount: data.amount,
        entryPrice: asset.currentPrice,
      },
      reason: `Opened ${data.direction} position on ${data.assetSymbol} in ${currentAccountMode.toUpperCase()} account; reserved BDT ${data.amount}`,
      result: 'SUCCESS',
    };

    const newNotif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      title: 'Trade Executed',
      message: `${data.direction} ${data.assetSymbol} for BDT ${data.amount.toLocaleString()} at $${asset.currentPrice}. BDT ${data.amount.toLocaleString()} reserved.`,
      type: 'SUCCESS',
      linkTab: 'trading',
      linkEntityId: tradeId,
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      wallets: {
        ...prev.wallets,
        [currentUser.id]: {
          ...prev.wallets[currentUser.id],
          [currentAccountMode]: {
            ledgerBalance: userWallet.ledgerBalance,
            reservedBalance: newReserved,
            availableBalance: newAvailable,
          },
        },
      },
      reservations: [reservation, ...prev.reservations],
      trades: [newTrade, ...prev.trades],
      auditLogs: [newAudit, ...prev.auditLogs],
      notifications: [newNotif, ...prev.notifications],
    }));

    addToast('Trade Executed', `Opened ${data.direction} ${data.assetSymbol} for BDT ${data.amount.toLocaleString()}`, 'success');
    return { success: true, message: 'Trade opened successfully.' };
  }, [currentUser, currentAccountMode, state.systemStatus.feedStatus, state.assets, state.wallets, addToast]);

  // Close Trade (User)
  const closeTrade = useCallback((tradeId: string) => {
    const trade = state.trades.find((t) => t.id === tradeId);
    if (!trade || trade.status !== 'ACTIVE') {
      return { success: false, message: 'Active trade not found.' };
    }

    const asset = state.assets.find((a) => a.symbol === trade.assetSymbol);
    const currentPrice = asset ? asset.currentPrice : trade.entryPrice;
    const nowIso = new Date().toISOString();

    // Calculate Realized P/L strictly as mandated:
    // BUY:  amount * ((currentPrice - entryPrice) / entryPrice)
    // SELL: amount * ((entryPrice - currentPrice) / entryPrice)
    let pnl = 0;
    if (trade.direction === 'BUY') {
      pnl = trade.amount * ((currentPrice - trade.entryPrice) / trade.entryPrice);
    } else {
      pnl = trade.amount * ((trade.entryPrice - currentPrice) / trade.entryPrice);
    }
    pnl = Number(pnl.toFixed(2));
    const pnlPercent = Number(((pnl / trade.amount) * 100).toFixed(2));

    const userWallet = state.wallets[trade.userId]?.[trade.accountType] || {
      ledgerBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
    };

    // Close trade:
    // 1. Release reserved trade amount
    // 2. Apply realized P/L to ledger balance!
    const newReserved = Math.max(0, userWallet.reservedBalance - trade.reservedAmount);
    const newLedger = Number((userWallet.ledgerBalance + pnl).toFixed(2));
    const newAvailable = Number((newLedger - newReserved).toFixed(2));

    const ledgerEntry: LedgerEntry = {
      id: 'led-' + Math.random().toString(36).substring(2, 9),
      userId: trade.userId,
      accountType: trade.accountType,
      type: pnl >= 0 ? 'TRADE_PROFIT' : 'TRADE_LOSS',
      amount: Math.abs(pnl),
      balanceBefore: userWallet.ledgerBalance,
      balanceAfter: newLedger,
      description: `Realized ${pnl >= 0 ? 'Profit' : 'Loss'} from ${trade.direction} ${trade.assetSymbol} (Exit: $${currentPrice})`,
      referenceId: trade.id,
      timestamp: nowIso,
    };

    const auditEvent: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'TRADE_CLOSED',
      entityType: 'TRADE',
      entityId: trade.id,
      previousState: { status: 'ACTIVE', reservedAmount: trade.reservedAmount },
      newState: { status: 'CLOSED', closingPrice: currentPrice, realizedPnL: pnl, pnlPercent },
      reason: `Closed ${trade.direction} position on ${trade.assetSymbol}; realized P/L BDT ${pnl}`,
      result: 'SUCCESS',
    };

    const notif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: trade.userId,
      title: 'Trade Closed',
      message: `${trade.direction} ${trade.assetSymbol} closed with ${pnl >= 0 ? '+' : ''}BDT ${pnl.toLocaleString()} (${pnlPercent}%). Reservation released.`,
      type: pnl >= 0 ? 'SUCCESS' : 'WARNING',
      linkTab: 'portfolio',
      linkEntityId: trade.id,
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      trades: prev.trades.map((t) =>
        t.id === tradeId
          ? {
              ...t,
              status: 'CLOSED',
              closingPrice: currentPrice,
              closingTime: nowIso,
              realizedPnL: pnl,
              pnlPercent,
            }
          : t
      ),
      reservations: prev.reservations.map((r) =>
        r.entityId === tradeId ? { ...r, status: 'RELEASED' } : r
      ),
      wallets: {
        ...prev.wallets,
        [trade.userId]: {
          ...prev.wallets[trade.userId],
          [trade.accountType]: {
            ledgerBalance: newLedger,
            reservedBalance: newReserved,
            availableBalance: newAvailable,
          },
        },
      },
      ledgerEntries: [ledgerEntry, ...prev.ledgerEntries],
      auditLogs: [auditEvent, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    addToast('Position Closed', `Realized P/L: ${pnl >= 0 ? '+' : ''}BDT ${pnl.toLocaleString()}`, pnl >= 0 ? 'success' : 'warning');
    return { success: true, message: 'Position closed successfully.' };
  }, [currentUser, state.trades, state.assets, state.wallets, addToast]);

  // Create Support Ticket
  const createTicket = useCallback((data: {
    category: any;
    subject: string;
    description: string;
    linkedEntity?: { type: any; id: string };
    priority: any;
  }) => {
    const tktId = 'TKT-' + Math.floor(100 + Math.random() * 900);
    const nowIso = new Date().toISOString();

    const newTicket: SupportTicket = {
      id: tktId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      category: data.category,
      subject: data.subject,
      description: data.description,
      linkedEntity: data.linkedEntity,
      status: 'OPEN',
      priority: data.priority,
      createdAt: nowIso,
      updatedAt: nowIso,
      messages: [
        {
          id: 'msg-' + Math.random().toString(36).substring(2, 9),
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          message: data.description,
          timestamp: nowIso,
        },
      ],
    };

    const newAudit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'TICKET_CREATED',
      entityType: 'TICKET',
      entityId: tktId,
      newState: { subject: data.subject, category: data.category, linkedEntity: data.linkedEntity },
      reason: 'User opened support inquiry ticket',
      result: 'SUCCESS',
    };

    setState((prev) => ({
      ...prev,
      tickets: [newTicket, ...prev.tickets],
      auditLogs: [newAudit, ...prev.auditLogs],
      notifications: [
        {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: currentUser.id,
          title: 'Ticket Created',
          message: `Ticket ${tktId} (${data.subject}) created. An agent will respond shortly.`,
          type: 'INFO',
          linkTab: 'support',
          linkEntityId: tktId,
          read: false,
          timestamp: nowIso,
        },
        ...prev.notifications,
      ],
    }));

    addToast('Ticket Created', `Inquiry ${tktId} received.`, 'success');
    return { success: true, message: 'Ticket created.', ticketId: tktId };
  }, [currentUser, addToast]);

  const replyTicket = useCallback((ticketId: string, messageText: string) => {
    if (!messageText.trim()) return { success: false, message: 'Message cannot be empty.' };
    const nowIso = new Date().toISOString();

    const newMsg = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: messageText.trim(),
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: nowIso,
              status: currentUser.role === 'USER' ? 'IN_REVIEW' : 'WAITING_FOR_USER',
              messages: [...t.messages, newMsg],
            }
          : t
      ),
    }));

    addToast('Message Sent', 'Support thread updated.', 'info');
    return { success: true, message: 'Reply posted.' };
  }, [currentUser, addToast]);

  // Admin: Approve Deposit with Idempotency Protection
  const approveDeposit = useCallback((depositId: string, reviewerNotes: string, idempotencyKey?: string) => {
    // Permission check
    const allowedRoles: UserRole[] = ['FINANCIAL_REVIEWER', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(currentUser.role)) {
      addToast('Permission Denied', 'You do not have access to this administrative area.', 'error');
      return { success: false, message: 'Permission denied. You do not have access to this administrative area.' };
    }

    const key = idempotencyKey || `IDEMP-DEP-APP-${depositId}`;
    const nowIso = new Date().toISOString();

    // IDEMPOTENCY CHECK: Check if this event key has already been processed!
    if (state.processedEventKeys[key]) {
      const blockedAudit: AuditEvent = {
        id: 'aud-' + Math.random().toString(36).substring(2, 9),
        timestamp: nowIso,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        eventType: 'DEPOSIT_APPROVAL_DUPLICATE_BLOCKED',
        entityType: 'DEPOSIT',
        entityId: depositId,
        idempotencyKey: key,
        reason: 'Duplicate financial approval event blocked by idempotency filter',
        result: 'BLOCKED',
      };

      setState((prev) => ({
        ...prev,
        auditLogs: [blockedAudit, ...prev.auditLogs],
      }));

      addToast(
        'Duplicate Event Blocked',
        'Duplicate event blocked — balance was not credited again.',
        'warning'
      );
      return {
        success: false,
        message: 'Duplicate event blocked — balance was not credited again.',
        blockedDuplicate: true,
      };
    }

    const dep = state.deposits.find((d) => d.id === depositId);
    if (!dep) return { success: false, message: 'Deposit request not found.' };

    const userWallet = state.wallets[dep.userId]?.[dep.accountType] || {
      ledgerBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
    };

    // Credit ledger balance exactly once!
    const newLedger = userWallet.ledgerBalance + dep.amount;
    const newAvailable = newLedger - userWallet.reservedBalance;

    const ledgerEntry: LedgerEntry = {
      id: 'led-' + Math.random().toString(36).substring(2, 9),
      userId: dep.userId,
      accountType: dep.accountType,
      type: 'DEPOSIT',
      amount: dep.amount,
      balanceBefore: userWallet.ledgerBalance,
      balanceAfter: newLedger,
      description: `Deposit ${dep.id} approved (${dep.paymentMethod} Ref: ${dep.paymentReference})`,
      referenceId: dep.id,
      timestamp: nowIso,
    };

    const auditEvent: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'DEPOSIT_APPROVED',
      entityType: 'DEPOSIT',
      entityId: dep.id,
      idempotencyKey: key,
      previousState: { status: dep.status, ledger: userWallet.ledgerBalance },
      newState: { status: 'APPROVED', ledger: newLedger, available: newAvailable },
      reason: reviewerNotes || 'Financial reviewer verified settlement evidence',
      result: 'SUCCESS',
    };

    const notif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: dep.userId,
      title: 'Deposit Approved',
      message: `Deposit ${dep.id} for BDT ${dep.amount.toLocaleString()} was approved and credited to your ledger balance.`,
      type: 'SUCCESS',
      linkTab: 'wallet',
      linkEntityId: dep.id,
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      deposits: prev.deposits.map((d) =>
        d.id === depositId
          ? {
              ...d,
              status: 'APPROVED',
              reviewerNotes,
              reviewedBy: currentUser.name,
              reviewedAt: nowIso,
              idempotencyKey: key,
            }
          : d
      ),
      wallets: {
        ...prev.wallets,
        [dep.userId]: {
          ...prev.wallets[dep.userId],
          [dep.accountType]: {
            ledgerBalance: newLedger,
            reservedBalance: userWallet.reservedBalance,
            availableBalance: newAvailable,
          },
        },
      },
      ledgerEntries: [ledgerEntry, ...prev.ledgerEntries],
      auditLogs: [auditEvent, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
      processedEventKeys: {
        ...prev.processedEventKeys,
        [key]: {
          key,
          timestamp: nowIso,
          actorId: currentUser.id,
          action: 'DEPOSIT_APPROVAL',
          result: 'CREDITED_ONCE',
          entityId: depositId,
        },
      },
    }));

    addToast('Deposit Approved', `BDT ${dep.amount.toLocaleString()} credited to user wallet. Idempotency recorded.`, 'success');
    return { success: true, message: 'Deposit approved and balance credited exactly once.' };
  }, [currentUser, state.processedEventKeys, state.deposits, state.wallets, addToast]);

  // Admin: Reject Deposit
  const rejectDeposit = useCallback((depositId: string, reviewerNotes: string) => {
    const allowedRoles: UserRole[] = ['FINANCIAL_REVIEWER', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(currentUser.role)) {
      addToast('Permission Denied', 'You do not have access to this administrative area.', 'error');
      return { success: false, message: 'Permission denied.' };
    }

    const dep = state.deposits.find((d) => d.id === depositId);
    if (!dep) return { success: false, message: 'Deposit not found.' };

    const nowIso = new Date().toISOString();
    const audit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'DEPOSIT_REJECTED',
      entityType: 'DEPOSIT',
      entityId: dep.id,
      previousState: { status: dep.status },
      newState: { status: 'REJECTED' },
      reason: reviewerNotes,
      result: 'SUCCESS',
    };

    const notif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: dep.userId,
      title: 'Deposit Rejected',
      message: `Deposit ${dep.id} was rejected: ${reviewerNotes}`,
      type: 'ERROR',
      linkTab: 'wallet',
      linkEntityId: dep.id,
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      deposits: prev.deposits.map((d) =>
        d.id === depositId
          ? { ...d, status: 'REJECTED', reviewerNotes, reviewedBy: currentUser.name, reviewedAt: nowIso }
          : d
      ),
      auditLogs: [audit, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    addToast('Deposit Rejected', `Deposit ${depositId} marked as rejected.`, 'info');
    return { success: true, message: 'Deposit rejected.' };
  }, [currentUser, state.deposits, addToast]);

  // Admin: Request Info on Deposit
  const requestInfoDeposit = useCallback((depositId: string, reviewerNotes: string) => {
    const allowedRoles: UserRole[] = ['FINANCIAL_REVIEWER', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(currentUser.role)) {
      return { success: false, message: 'Permission denied.' };
    }
    const dep = state.deposits.find((d) => d.id === depositId);
    if (!dep) return { success: false, message: 'Deposit not found.' };

    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      deposits: prev.deposits.map((d) =>
        d.id === depositId
          ? { ...d, status: 'INFO_REQUESTED', reviewerNotes, reviewedBy: currentUser.name, reviewedAt: nowIso }
          : d
      ),
      notifications: [
        {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: dep.userId,
          title: 'Action Required: Deposit Evidence',
          message: `Additional information requested for ${dep.id}: ${reviewerNotes}`,
          type: 'WARNING',
          linkTab: 'wallet',
          linkEntityId: dep.id,
          read: false,
          timestamp: nowIso,
        },
        ...prev.notifications,
      ],
      auditLogs: [
        {
          id: 'aud-' + Math.random().toString(36).substring(2, 9),
          timestamp: nowIso,
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          eventType: 'DEPOSIT_INFO_REQUESTED',
          entityType: 'DEPOSIT',
          entityId: dep.id,
          reason: reviewerNotes,
          result: 'SUCCESS',
        },
        ...prev.auditLogs,
      ],
    }));

    addToast('Information Requested', `Requested additional evidence for ${depositId}.`, 'info');
    return { success: true, message: 'Information requested.' };
  }, [currentUser, state.deposits, addToast]);

  // Admin: Approve Withdrawal
  const approveWithdrawal = useCallback((withdrawalId: string, reviewerNotes: string) => {
    const allowedRoles: UserRole[] = ['FINANCIAL_REVIEWER', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(currentUser.role)) {
      addToast('Permission Denied', 'You do not have access to this administrative area.', 'error');
      return { success: false, message: 'Permission denied.' };
    }

    const wd = state.withdrawals.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== 'PENDING') {
      return { success: false, message: 'Pending withdrawal not found.' };
    }

    const userWallet = state.wallets[wd.userId]?.[wd.accountType] || {
      ledgerBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
    };

    // Approved withdrawal:
    // 1. Reduces ledger balance
    // 2. Releases matching reservation (reduces reserved balance)
    // 3. Available balance formula: Ledger - Reserved remains balanced!
    const newReserved = Math.max(0, userWallet.reservedBalance - wd.amount);
    const newLedger = Math.max(0, userWallet.ledgerBalance - wd.amount);
    const newAvailable = newLedger - newReserved;
    const nowIso = new Date().toISOString();

    const ledgerEntry: LedgerEntry = {
      id: 'led-' + Math.random().toString(36).substring(2, 9),
      userId: wd.userId,
      accountType: wd.accountType,
      type: 'WITHDRAWAL',
      amount: wd.amount,
      balanceBefore: userWallet.ledgerBalance,
      balanceAfter: newLedger,
      description: `Withdrawal ${wd.id} approved and dispatched to ${wd.destination} via ${wd.method}`,
      referenceId: wd.id,
      timestamp: nowIso,
    };

    const audit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'WITHDRAWAL_APPROVED',
      entityType: 'WITHDRAWAL',
      entityId: wd.id,
      previousState: { status: 'PENDING', ledger: userWallet.ledgerBalance, reserved: userWallet.reservedBalance },
      newState: { status: 'APPROVED', ledger: newLedger, reserved: newReserved },
      reason: reviewerNotes || 'Financial reviewer confirmed outbound transfer',
      result: 'SUCCESS',
    };

    const notif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: wd.userId,
      title: 'Withdrawal Processed',
      message: `Withdrawal ${wd.id} for BDT ${wd.amount.toLocaleString()} was approved and sent to ${wd.destination}.`,
      type: 'SUCCESS',
      linkTab: 'wallet',
      linkEntityId: wd.id,
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      withdrawals: prev.withdrawals.map((w) =>
        w.id === withdrawalId
          ? { ...w, status: 'APPROVED', reviewerNotes, reviewedBy: currentUser.name, reviewedAt: nowIso }
          : w
      ),
      reservations: prev.reservations.map((r) =>
        r.id === wd.reservationId || r.entityId === wd.id ? { ...r, status: 'RELEASED' } : r
      ),
      wallets: {
        ...prev.wallets,
        [wd.userId]: {
          ...prev.wallets[wd.userId],
          [wd.accountType]: {
            ledgerBalance: newLedger,
            reservedBalance: newReserved,
            availableBalance: newAvailable,
          },
        },
      },
      ledgerEntries: [ledgerEntry, ...prev.ledgerEntries],
      auditLogs: [audit, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    addToast('Withdrawal Approved', `BDT ${wd.amount.toLocaleString()} deducted from ledger. Reservation released.`, 'success');
    return { success: true, message: 'Withdrawal approved.' };
  }, [currentUser, state.withdrawals, state.wallets, addToast]);

  // Admin: Reject Withdrawal
  const rejectWithdrawal = useCallback((withdrawalId: string, reviewerNotes: string) => {
    const allowedRoles: UserRole[] = ['FINANCIAL_REVIEWER', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(currentUser.role)) {
      return { success: false, message: 'Permission denied.' };
    }

    const wd = state.withdrawals.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== 'PENDING') return { success: false, message: 'Pending withdrawal not found.' };

    const userWallet = state.wallets[wd.userId]?.[wd.accountType] || {
      ledgerBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
    };

    // Rejected withdrawal:
    // 1. Releases reservation (decreases reserved balance)
    // 2. Ledger balance remains UNCHANGED!
    // 3. Available balance increases back by wd.amount!
    const newReserved = Math.max(0, userWallet.reservedBalance - wd.amount);
    const newAvailable = userWallet.ledgerBalance - newReserved;
    const nowIso = new Date().toISOString();

    const audit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'WITHDRAWAL_REJECTED',
      entityType: 'WITHDRAWAL',
      entityId: wd.id,
      previousState: { status: 'PENDING', reserved: userWallet.reservedBalance, available: userWallet.availableBalance },
      newState: { status: 'REJECTED', reserved: newReserved, available: newAvailable },
      reason: reviewerNotes || 'Financial reviewer rejected withdrawal request',
      result: 'SUCCESS',
    };

    const notif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: wd.userId,
      title: 'Withdrawal Rejected',
      message: `Withdrawal ${wd.id} for BDT ${wd.amount.toLocaleString()} was rejected: ${reviewerNotes}. Reserved funds returned to available balance.`,
      type: 'WARNING',
      linkTab: 'wallet',
      linkEntityId: wd.id,
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      withdrawals: prev.withdrawals.map((w) =>
        w.id === withdrawalId
          ? { ...w, status: 'REJECTED', reviewerNotes, reviewedBy: currentUser.name, reviewedAt: nowIso }
          : w
      ),
      reservations: prev.reservations.map((r) =>
        r.id === wd.reservationId || r.entityId === wd.id ? { ...r, status: 'RELEASED' } : r
      ),
      wallets: {
        ...prev.wallets,
        [wd.userId]: {
          ...prev.wallets[wd.userId],
          [wd.accountType]: {
            ledgerBalance: userWallet.ledgerBalance,
            reservedBalance: newReserved,
            availableBalance: newAvailable,
          },
        },
      },
      auditLogs: [audit, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    addToast('Withdrawal Rejected', `Reservation released. BDT ${wd.amount.toLocaleString()} returned to available balance.`, 'info');
    return { success: true, message: 'Withdrawal rejected and reservation released.' };
  }, [currentUser, state.withdrawals, state.wallets, addToast]);

  // Admin: Review KYC
  const reviewKYC = useCallback((kycId: string, decision: 'VERIFIED' | 'REJECTED' | 'RESUBMISSION_REQUIRED', reviewerNotes: string) => {
    const allowedRoles: UserRole[] = ['KYC_REVIEWER', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(currentUser.role)) {
      addToast('Permission Denied', 'You do not have access to this administrative area.', 'error');
      return { success: false, message: 'Permission denied.' };
    }

    const kyc = state.verifications.find((v) => v.id === kycId);
    if (!kyc) return { success: false, message: 'KYC submission not found.' };

    const nowIso = new Date().toISOString();
    const audit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'KYC_DECISION',
      entityType: 'KYC',
      entityId: kyc.id,
      previousState: { status: kyc.status },
      newState: { status: decision },
      reason: reviewerNotes,
      result: 'SUCCESS',
    };

    const notif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: kyc.userId,
      title: `Verification Status: ${decision}`,
      message: `Your identity verification was updated to ${decision}. Notes: ${reviewerNotes}`,
      type: decision === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
      linkTab: 'verification',
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      verifications: prev.verifications.map((v) =>
        v.id === kycId
          ? { ...v, status: decision as VerificationStatus, reviewerNotes, reviewedBy: currentUser.name, reviewedAt: nowIso }
          : v
      ),
      users: prev.users.map((u) =>
        u.id === kyc.userId ? { ...u, verificationStatus: decision as VerificationStatus } : u
      ),
      auditLogs: [audit, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    addToast('KYC Decision Recorded', `Submission ${kycId} marked as ${decision}.`, 'success');
    return { success: true, message: 'KYC decision recorded.' };
  }, [currentUser, state.verifications, addToast]);

  // Admin: Update Ticket Status
  const updateTicketStatus = useCallback((ticketId: string, status: any) => {
    const allowedRoles: UserRole[] = ['SUPPORT_AGENT', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(currentUser.role)) {
      return { success: false, message: 'Permission denied.' };
    }

    const tkt = state.tickets.find((t) => t.id === ticketId);
    if (!tkt) return { success: false, message: 'Ticket not found.' };

    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId ? { ...t, status, updatedAt: nowIso } : t
      ),
      auditLogs: [
        {
          id: 'aud-' + Math.random().toString(36).substring(2, 9),
          timestamp: nowIso,
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          eventType: 'TICKET_STATUS_CHANGED',
          entityType: 'TICKET',
          entityId: ticketId,
          previousState: { status: tkt.status },
          newState: { status },
          reason: `Support agent updated ticket status to ${status}`,
          result: 'SUCCESS',
        },
        ...prev.auditLogs,
      ],
    }));

    addToast('Ticket Updated', `Status changed to ${status}`, 'info');
    return { success: true, message: 'Ticket updated.' };
  }, [currentUser, state.tickets, addToast]);

  // Admin: Toggle User Restriction (SUPER_ADMIN only)
  const toggleUserRestriction = useCallback((userId: string, reason: string) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      addToast('Permission Denied', 'Only Super Admin can restrict users.', 'error');
      return { success: false, message: 'Super Admin permission required.' };
    }

    const targetUser = state.users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, message: 'User not found.' };

    const newRestricted = !targetUser.isRestricted;
    const nowIso = new Date().toISOString();

    const audit: AuditEvent = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: nowIso,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: newRestricted ? 'USER_RESTRICTED' : 'USER_UNRESTRICTED',
      entityType: 'USER',
      entityId: userId,
      previousState: { isRestricted: targetUser.isRestricted },
      newState: { isRestricted: newRestricted, restrictionReason: reason },
      reason,
      result: 'SUCCESS',
    };

    const notif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId,
      title: newRestricted ? 'Account Activity Restricted' : 'Account Restriction Lifted',
      message: newRestricted
        ? `Your trading, deposit, and withdrawal privileges have been paused: ${reason}. You may still view records and contact support.`
        : 'Your account trading privileges have been restored.',
      type: newRestricted ? 'ERROR' : 'SUCCESS',
      linkTab: 'overview',
      read: false,
      timestamp: nowIso,
    };

    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              isRestricted: newRestricted,
              status: newRestricted ? 'RESTRICTED' : 'ACTIVE',
              restrictionReason: newRestricted ? reason : undefined,
            }
          : u
      ),
      auditLogs: [audit, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    addToast('User Restriction Updated', `${targetUser.name} is now ${newRestricted ? 'Restricted' : 'Active'}.`, 'warning');
    return { success: true, message: 'Restriction status updated.' };
  }, [currentUser, state.users, addToast]);

  // Market Reliability Controls (Admin)
  const toggleFeedPause = useCallback((reason: string = 'Administrative manual override') => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      addToast('Permission Denied', 'Super Admin access required.', 'error');
      return;
    }
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const willPause = !prev.systemStatus.paused;
      return {
        ...prev,
        systemStatus: {
          ...prev.systemStatus,
          paused: willPause,
          feedStatus: willPause ? 'DELAYED' : 'LIVE',
          lastFeedUpdate: nowIso,
        },
        auditLogs: [
          {
            id: 'aud-' + Math.random().toString(36).substring(2, 9),
            timestamp: nowIso,
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorRole: currentUser.role,
            eventType: willPause ? 'FEED_PAUSED' : 'FEED_RESUMED',
            entityType: 'FEED',
            entityId: 'GLOBAL_FEED',
            reason,
            result: 'SUCCESS',
          },
          ...prev.auditLogs,
        ],
      };
    });
    addToast('Feed Toggled', 'Global market feed update state changed.', 'info');
  }, [currentUser, addToast]);

  const setFeedStatusOverride = useCallback((status: FeedStatus, reason: string = 'Manual status override') => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      addToast('Permission Denied', 'Super Admin access required.', 'error');
      return;
    }
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      systemStatus: {
        ...prev.systemStatus,
        feedStatus: status,
        manualStatusOverride: status !== 'LIVE',
        lastFeedUpdate: nowIso,
      },
      auditLogs: [
        {
          id: 'aud-' + Math.random().toString(36).substring(2, 9),
          timestamp: nowIso,
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          eventType: 'FEED_STATUS_OVERRIDE',
          entityType: 'FEED',
          entityId: 'GLOBAL_FEED',
          newState: { feedStatus: status },
          reason,
          result: 'SUCCESS',
        },
        ...prev.auditLogs,
      ],
      notifications: status === 'STALE' || status === 'OFFLINE' ? [
        {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: 'usr-1001',
          title: `Market Feed Warning: ${status}`,
          message: `Market feed is now ${status}. All new trading submissions have been disabled to protect platform integrity.`,
          type: 'WARNING',
          linkTab: 'markets',
          read: false,
          timestamp: nowIso,
        },
        ...prev.notifications,
      ] : prev.notifications,
    }));
    addToast('Feed Status Updated', `Market status forced to ${status}`, 'info');
  }, [currentUser, addToast]);

  const toggleAssetHalt = useCallback((symbol: string, reason: string) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      addToast('Permission Denied', 'Super Admin access required.', 'error');
      return;
    }
    const asset = state.assets.find((a) => a.symbol === symbol);
    if (!asset) return;

    const willHalt = asset.status === 'OPEN';
    const nowIso = new Date().toISOString();

    setState((prev) => ({
      ...prev,
      assets: prev.assets.map((a) =>
        a.symbol === symbol
          ? {
              ...a,
              status: (willHalt ? 'HALTED' : 'OPEN') as AssetStatus,
              haltReason: willHalt ? reason : undefined,
            }
          : a
      ),
      auditLogs: [
        {
          id: 'aud-' + Math.random().toString(36).substring(2, 9),
          timestamp: nowIso,
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          eventType: willHalt ? 'ASSET_HALTED' : 'ASSET_REOPENED',
          entityType: 'ASSET',
          entityId: symbol,
          reason,
          result: 'SUCCESS',
        },
        ...prev.auditLogs,
      ],
      notifications: willHalt ? [
        {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: 'usr-1001',
          title: `Asset Trading Halted: ${symbol}`,
          message: `${symbol} trading was halted by administration. Reason: ${reason}`,
          type: 'WARNING',
          linkTab: 'markets',
          read: false,
          timestamp: nowIso,
        },
        ...prev.notifications,
      ] : prev.notifications,
    }));

    addToast(willHalt ? 'Asset Halted' : 'Asset Reopened', `${symbol} is now ${willHalt ? 'Halted' : 'Open'}.`, willHalt ? 'warning' : 'success');
  }, [currentUser, state.assets, addToast]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    addToast('All Caught Up', 'All notifications marked as read.', 'info');
  }, [addToast]);

  // SCENARIOS
  // Level 1: Balance Explanation
  const runScenarioLevel1 = useCallback(() => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const existingRes = prev.reservations.some((r) => r.id === 'res-wd-1007');
      const updatedReservations = existingRes
        ? prev.reservations.map((r) => r.id === 'res-wd-1007' ? { ...r, status: 'ACTIVE' as const, amount: 3000 } : r)
        : [
            {
              id: 'res-wd-1007',
              userId: 'usr-1001',
              accountType: 'main' as const,
              amount: 3000,
              entityType: 'WITHDRAWAL' as const,
              entityId: 'WD-1007',
              description: 'Pending withdrawal WD-1007 (bKash payout)',
              createdAt: nowIso,
              status: 'ACTIVE' as const,
            },
            ...prev.reservations,
          ];

      const existingWD = prev.withdrawals.some((w) => w.id === 'WD-1007');
      const updatedWithdrawals = existingWD
        ? prev.withdrawals.map((w) => w.id === 'WD-1007' ? { ...w, status: 'PENDING' as const, amount: 3000 } : w)
        : [
            {
              id: 'WD-1007',
              userId: 'usr-1001',
              userName: 'Rahim Ahmed',
              accountType: 'main' as const,
              amount: 3000,
              method: 'bKash Mobile Banking',
              destination: '01711-234567 (Personal)',
              note: 'Routine profit withdrawal to mobile wallet',
              status: 'PENDING' as const,
              reservationId: 'res-wd-1007',
              createdAt: nowIso,
            },
            ...prev.withdrawals,
          ];

      return {
        ...prev,
        currentUserId: 'usr-1001',
        wallets: {
          ...prev.wallets,
          'usr-1001': {
            ...prev.wallets['usr-1001'],
            main: {
              ledgerBalance: 10000,
              reservedBalance: 3000,
              availableBalance: 7000,
            },
          },
        },
        reservations: updatedReservations,
        withdrawals: updatedWithdrawals,
        auditLogs: [
          {
            id: 'aud-' + Math.random().toString(36).substring(2, 9),
            timestamp: nowIso,
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorRole: currentUser.role,
            eventType: 'SCENARIO_LEVEL_1_RUN',
            entityType: 'SCENARIO',
            entityId: 'LEVEL_1',
            newState: { ledger: 10000, reserved: 3000, available: 7000, wd: 'WD-1007' },
            reason: 'Scenario Level 1 executed: Main wallet restored to Ledger BDT 10k, Reserved BDT 3k, Available BDT 7k with WD-1007',
            result: 'SUCCESS',
          },
          ...prev.auditLogs,
        ],
      };
    });

    setActiveTab('ai');
    addToast('Scenario 1 Loaded', 'Restored Main wallet: Ledger BDT 10k, Reserved BDT 3k, Available BDT 7k with WD-1007.', 'success');
  }, [currentUser, addToast]);

  // Level 2: Duplicate Evidence
  const runScenarioLevel2 = useCallback(() => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const dep2001: DepositRequest = {
        id: 'DEP-2001',
        userId: 'usr-1001',
        userName: 'Rahim Ahmed',
        accountType: 'main',
        amount: 10000,
        paymentMethod: 'Bank Wire / EFT',
        paymentReference: 'TXN-458921',
        paymentDate: '2026-03-17T09:15:00Z',
        evidenceQuality: 'Unclear',
        evidenceAmount: undefined,
        note: 'Initial working capital deposit transferred via mobile banking agent',
        status: 'REVIEW_REQUIRED',
        riskFlags: [
          'Duplicate reference TXN-458921 detected (Shared with DEP-2002)',
          'Unclear document readability (blurry receipt image)',
          'Missing ownership confirmation (account name not visible on slip)',
        ],
        simulatedEvidenceUrl: 'SIM_RECEIPT_BLURRY_TXN458921',
      };

      const dep2002: DepositRequest = {
        id: 'DEP-2002',
        userId: 'usr-1002',
        userName: 'Nusrat Jahan',
        accountType: 'main',
        amount: 12000,
        paymentMethod: 'Bank Wire / EFT',
        paymentReference: 'TXN-458921',
        paymentDate: '2026-03-17T10:45:00Z',
        evidenceQuality: 'Clear',
        evidenceAmount: 8000,
        note: 'Deposit for new trading account',
        status: 'REVIEW_REQUIRED',
        riskFlags: [
          'Duplicate reference TXN-458921 detected (Shared with DEP-2001)',
          'BDT 4,000 amount mismatch (Claimed BDT 12,000 vs Slip BDT 8,000)',
          'Missing ownership confirmation (Depositor name does not match user account)',
        ],
        simulatedEvidenceUrl: 'SIM_RECEIPT_CLEAR_MISMATCH_8000',
      };

      return {
        ...prev,
        deposits: [
          dep2001,
          dep2002,
          ...prev.deposits.filter((d) => d.id !== 'DEP-2001' && d.id !== 'DEP-2002'),
        ],
        auditLogs: [
          {
            id: 'aud-' + Math.random().toString(36).substring(2, 9),
            timestamp: nowIso,
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorRole: currentUser.role,
            eventType: 'SCENARIO_LEVEL_2_RUN',
            entityType: 'SCENARIO',
            entityId: 'LEVEL_2',
            reason: 'Scenario Level 2 executed: Restored DEP-2001 and DEP-2002 duplicate evidence and mismatches',
            result: 'SUCCESS',
          },
          ...prev.auditLogs,
        ],
      };
    });

    setActiveAdminTab('deposits');
    addToast('Scenario 2 Loaded', 'DEP-2001 & DEP-2002 comparison workspace loaded with duplicate reference TXN-458921.', 'info');
  }, [currentUser, addToast]);

  // Level 3: Reliability Incident & Reconstruction
  const runScenarioLevel3 = useCallback(() => {
    const nowIso = new Date().toISOString();
    const idempKey = 'IDEMP-SCENARIO-3001';

    let incidentTimeline: any[] = [];

    setState((prev) => {
      // 1. Keep WD-1007 pending with reservation 3,000
      const initialLedger = prev.wallets['usr-1001']?.main?.ledgerBalance || 10000;
      const initialReserved = 3000;
      const initialAvailable = initialLedger - initialReserved;

      // 2. Deposit DEP-3001 for BDT 5,000
      const dep3001: DepositRequest = {
        id: 'DEP-3001',
        userId: 'usr-1001',
        userName: 'Rahim Ahmed',
        accountType: 'main',
        amount: 5000,
        paymentMethod: 'Instant EFT Settlement',
        paymentReference: 'TXN-INCIDENT-9988',
        paymentDate: nowIso,
        evidenceQuality: 'Clear',
        evidenceAmount: 5000,
        status: 'APPROVED',
        riskFlags: [],
        idempotencyKey: idempKey,
        reviewerNotes: 'Approved in incident test workflow',
        reviewedBy: 'Tariq Al-Amin',
        reviewedAt: nowIso,
      };

      // 3. First approval credits BDT 5,000 once
      const afterFirstLedger = initialLedger + 5000;
      const afterFirstAvailable = afterFirstLedger - initialReserved;

      // 4. Duplicate approval attempted with same key -> blocked!
      // Balances after duplicate MUST BE IDENTICAL to after first approval:
      const afterDuplicateLedger = afterFirstLedger;
      const afterDuplicateAvailable = afterFirstAvailable;

      const audWd: AuditEvent = {
        id: 'aud-sc3-1',
        timestamp: new Date(Date.now() - 40000).toISOString(),
        actorId: 'usr-1001',
        actorName: 'Rahim Ahmed',
        actorRole: 'USER',
        eventType: 'WITHDRAWAL_SUBMITTED',
        entityType: 'WITHDRAWAL',
        entityId: 'WD-1007',
        newState: { amount: 3000, reservation: 'res-wd-1007' },
        reason: 'Step 1: WD-1007 created reservation for BDT 3,000',
        result: 'SUCCESS',
      };

      const audDepApp: AuditEvent = {
        id: 'aud-sc3-2',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        actorId: 'usr-admin-1',
        actorName: 'Tariq Al-Amin',
        actorRole: 'SUPER_ADMIN',
        eventType: 'DEPOSIT_APPROVED',
        entityType: 'DEPOSIT',
        entityId: 'DEP-3001',
        idempotencyKey: idempKey,
        previousState: { ledger: initialLedger },
        newState: { ledger: afterFirstLedger, available: afterFirstAvailable },
        reason: 'Step 2: DEP-3001 approval received; BDT 5,000 credited once',
        result: 'SUCCESS',
      };

      const audDepDup: AuditEvent = {
        id: 'aud-sc3-3',
        timestamp: new Date(Date.now() - 25000).toISOString(),
        actorId: 'usr-admin-1',
        actorName: 'Tariq Al-Amin',
        actorRole: 'SUPER_ADMIN',
        eventType: 'DEPOSIT_APPROVAL_DUPLICATE_BLOCKED',
        entityType: 'DEPOSIT',
        entityId: 'DEP-3001',
        idempotencyKey: idempKey,
        previousState: { ledger: afterFirstLedger },
        newState: { ledger: afterDuplicateLedger },
        reason: 'Step 3: Duplicate approval received; duplicate blocked by idempotency engine',
        result: 'BLOCKED',
      };

      const audFeedStale: AuditEvent = {
        id: 'aud-sc3-4',
        timestamp: new Date(Date.now() - 15000).toISOString(),
        actorId: 'system',
        actorName: 'Reliability Monitor',
        actorRole: 'SUPER_ADMIN',
        eventType: 'FEED_STALE_ALERT',
        entityType: 'FEED',
        entityId: 'GLOBAL_FEED',
        newState: { feedStatus: 'STALE' },
        reason: 'Step 4: Market feed stopped > 10s; feed transitioned to STALE; new trades disabled',
        result: 'SUCCESS',
      };

      const audTicket: AuditEvent = {
        id: 'aud-sc3-5',
        timestamp: new Date(Date.now() - 5000).toISOString(),
        actorId: 'usr-1001',
        actorName: 'Rahim Ahmed',
        actorRole: 'USER',
        eventType: 'TICKET_CREATED',
        entityType: 'TICKET',
        entityId: 'TKT-3009',
        reason: 'Step 5: User opened balance ticket regarding trade restriction and available balance',
        result: 'SUCCESS',
      };

      const incidentTicket: SupportTicket = {
        id: 'TKT-3009',
        userId: 'usr-1001',
        userName: 'Rahim Ahmed',
        userEmail: 'user@macrobex.demo',
        category: 'TRADING',
        subject: 'Cannot trade and balance question during market pause',
        description: 'I noticed my deposit was credited but new trades are blocked with feed stale error. Also please confirm my reserved balance.',
        status: 'OPEN',
        priority: 'CRITICAL',
        createdAt: nowIso,
        updatedAt: nowIso,
        messages: [
          {
            id: 'msg-sc3',
            senderId: 'usr-1001',
            senderName: 'Rahim Ahmed',
            senderRole: 'USER',
            message: 'I cannot submit any orders on BTC/USDT. Feed says STALE. Please check platform health and confirm my BDT 5,000 deposit credit.',
            timestamp: nowIso,
          },
        ],
      };

      incidentTimeline = [
        { step: 1, title: 'WD-1007 Reserved BDT 3,000', detail: 'Created active reservation res-wd-1007, reducing available balance without changing ledger balance.', timestamp: audWd.timestamp, entityId: 'WD-1007' },
        { step: 2, title: 'DEP-3001 Approval Received', detail: `Deposit DEP-3001 for BDT 5,000 approved with idempotency key ${idempKey}.`, timestamp: audDepApp.timestamp, entityId: 'DEP-3001' },
        { step: 3, title: 'BDT 5,000 Credited Once', detail: `Ledger balance increased from BDT ${initialLedger.toLocaleString()} to BDT ${afterFirstLedger.toLocaleString()}. Available: BDT ${afterFirstAvailable.toLocaleString()}.`, timestamp: audDepApp.timestamp, entityId: 'usr-1001' },
        { step: 4, title: 'Duplicate Approval Received', detail: `Network/client retried identical approval request with key ${idempKey}.`, timestamp: audDepDup.timestamp, entityId: 'DEP-3001' },
        { step: 5, title: 'Duplicate Blocked (Zero Double Credit)', detail: `Idempotency engine intercepted duplicate. Ledger balance remained BDT ${afterDuplicateLedger.toLocaleString()} (identical to first credit).`, timestamp: audDepDup.timestamp, entityId: idempKey },
        { step: 6, title: 'Market Feed Stopped', detail: 'Market pricing ticker paused for test isolation.', timestamp: audFeedStale.timestamp, entityId: 'GLOBAL_FEED' },
        { step: 7, title: 'Feed Changed to STALE', detail: 'Heartbeat timeout triggered STALE status after > 10 seconds of no ticker updates.', timestamp: audFeedStale.timestamp, entityId: 'GLOBAL_FEED' },
        { step: 8, title: 'New Trades Disabled', detail: 'Safety interlock blocked all new BUY/SELL orders while keeping positions viewable.', timestamp: audFeedStale.timestamp, entityId: 'GLOBAL_FEED' },
        { step: 9, title: 'User Opened Balance Ticket', detail: 'Ticket TKT-3009 logged by Rahim Ahmed inquiring about trade block and deposit.', timestamp: audTicket.timestamp, entityId: 'TKT-3009' },
        { step: 10, title: 'Admin Reconstructed Incident', detail: 'Full chronological audit trail and balance verification compiled in Incident Reconstruction.', timestamp: nowIso, entityId: 'INCIDENT_3' },
      ];

      return {
        ...prev,
        wallets: {
          ...prev.wallets,
          'usr-1001': {
            ...prev.wallets['usr-1001'],
            main: {
              ledgerBalance: afterDuplicateLedger,
              reservedBalance: initialReserved,
              availableBalance: afterDuplicateAvailable,
            },
          },
        },
        deposits: [dep3001, ...prev.deposits.filter((d) => d.id !== 'DEP-3001')],
        tickets: [incidentTicket, ...prev.tickets.filter((t) => t.id !== 'TKT-3009')],
        systemStatus: {
          ...prev.systemStatus,
          paused: true,
          feedStatus: 'STALE',
          manualStatusOverride: true,
          lastFeedUpdate: new Date(Date.now() - 15000).toISOString(),
        },
        processedEventKeys: {
          ...prev.processedEventKeys,
          [idempKey]: {
            key: idempKey,
            timestamp: audDepApp.timestamp,
            actorId: 'usr-admin-1',
            action: 'DEPOSIT_APPROVAL',
            result: 'CREDITED_ONCE',
            entityId: 'DEP-3001',
          },
        },
        auditLogs: [audTicket, audFeedStale, audDepDup, audDepApp, audWd, ...prev.auditLogs],
      };
    });

    setIncidentModalOpen(true);
    addToast('Scenario 3 Incident Reconstructed', 'Duplicate blocked, feed marked STALE, and timeline compiled.', 'warning');
    return { success: true, incidentTimeline };
  }, [addToast]);

  // Reset Demo Data
  const resetDemoData = useCallback(() => {
    const fresh = createInitialSeedState();
    setState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
    setAccountMode('main');
    setActiveTab('overview');
    setActiveAdminTab('overview');
    addToast('Demo Data Reset', 'All simulated users, wallets, trades, and logs restored to initial clean seed state.', 'success');
  }, [addToast]);

  // AI Assistant Query Engine (Deterministic + Optional Gemini)
  const queryAI = useCallback(async (question: string) => {
    const qLower = question.toLowerCase();
    const userWallet = state.wallets['usr-1001']?.main || { ledgerBalance: 10000, reservedBalance: 3000, availableBalance: 7000 };
    const wd1007 = state.withdrawals.find((w) => w.id === 'WD-1007');
    const dep2001 = state.deposits.find((d) => d.id === 'DEP-2001');
    const dep2002 = state.deposits.find((d) => d.id === 'DEP-2002');
    const user = state.users.find((u) => u.id === state.currentUserId) || currentUser;

    let deterministicAnswer = '';
    let evidenceContext: any = {
      user: { id: user.id, name: user.name, role: user.role, isRestricted: user.isRestricted },
      currentAccount: currentAccountMode,
      mainWallet: userWallet,
      feedStatus: state.systemStatus.feedStatus,
    };

    if (qLower.includes('balance') || qLower.includes('3,000') || qLower.includes('3000') || qLower.includes('lower') || qLower.includes('where is')) {
      evidenceContext.linkedWithdrawal = wd1007;
      deterministicAnswer = `### Evidence-Based Balance Explanation:
- **Ledger Balance:** BDT ${userWallet.ledgerBalance.toLocaleString()} (Total settled capital owned by your account).
- **Reserved Balance:** BDT ${userWallet.reservedBalance.toLocaleString()} (Currently locked for pending commitments).
- **Available Balance:** BDT ${userWallet.availableBalance.toLocaleString()} (Ledger BDT ${userWallet.ledgerBalance.toLocaleString()} minus Reserved BDT ${userWallet.reservedBalance.toLocaleString()}).

**Where is your BDT 3,000?**
Your BDT 3,000 is safely locked in **active reservation \`${wd1007?.reservationId || 'res-wd-1007'}\`**, linked directly to pending withdrawal **\`WD-1007\`** (Requested via ${wd1007?.method || 'bKash'} to \`${wd1007?.destination || '01711-234567'}\`).

Under MacroBex wallet accounting rules:
1. When you request a withdrawal, your available balance decreases immediately so you do not accidentally trade with funds destined for payout.
2. Your ledger balance is NOT reduced until the financial compliance reviewer formally approves and settles the payout.
3. If the withdrawal is approved, the BDT 3,000 ledger balance is deducted. If rejected, the BDT 3,000 reservation is immediately released back to your available balance.`;
    } else if (qLower.includes('wd-1007') || qLower.includes('withdrawal')) {
      evidenceContext.withdrawal = wd1007;
      deterministicAnswer = `### Status of Withdrawal WD-1007:
- **Status:** \`${wd1007?.status || 'PENDING'}\`
- **Amount:** BDT ${wd1007?.amount.toLocaleString() || '3,000'}
- **Destination:** ${wd1007?.destination || '01711-234567'} (${wd1007?.method || 'bKash Mobile Banking'})
- **Matching Reservation ID:** \`${wd1007?.reservationId || 'res-wd-1007'}\`
- **Audit Verification:** Active reservation is verified in the system state. No funds have been lost or removed from your ledger balance. Payout is in queue for review by Financial Reviewer.`;
    } else if (qLower.includes('trade') || qLower.includes('why can’t') || qLower.includes("can't trade")) {
      const isFeedOk = state.systemStatus.feedStatus === 'LIVE';
      const isRestricted = user.isRestricted;
      const hasFunds = userWallet.availableBalance > 0;

      deterministicAnswer = `### Trading Availability Audit:
1. **User Restriction:** ${isRestricted ? '❌ RESTRICTED (' + (user.restrictionReason || 'Administrative hold') + ')' : '✅ Active (Not restricted)'}
2. **Global Feed Status:** ${isFeedOk ? '✅ LIVE' : `❌ ${state.systemStatus.feedStatus} (New trade submissions are blocked by safe stale-market protection)`}
3. **Available Balance:** ${hasFunds ? `✅ BDT ${userWallet.availableBalance.toLocaleString()} available` : '❌ BDT 0 available'}
4. **Asset Status:** All OPEN assets are tradable when feed is LIVE. Any HALTED asset requires administrator reopening.`;
    } else if (qLower.includes('duplicate') || qLower.includes('dep-2001') || qLower.includes('dep-2002') || qLower.includes('review')) {
      evidenceContext.dep2001 = dep2001;
      evidenceContext.dep2002 = dep2002;
      deterministicAnswer = `### Deposit Review Analysis (DEP-2001 & DEP-2002):
The compliance engine has detected critical risk flags requiring manual administrative review:
1. **Duplicate Payment Reference:** Reference \`TXN-458921\` was submitted by two different users (\`DEP-2001\` for Rahim Ahmed and \`DEP-2002\` for Nusrat Jahan).
2. **DEP-2001 Evidence Issue:** Document quality is marked \`Unclear\` (low resolution/unreadable transaction receipt).
3. **DEP-2002 Amount Mismatch:** User claimed BDT 12,000, but the provided clear slip only shows BDT 8,000 (BDT 4,000 discrepancy).
4. **Missing Ownership:** Depositor identity does not match verified account names. Neither deposit may be approved until physical bank settlement is reconciled!`;
    } else if (qLower.includes('reconstruct') || qLower.includes('incident')) {
      deterministicAnswer = `### Incident Chronology & Reconstruction:
1. **WD-1007 Reservation:** Created active reservation for BDT 3,000.
2. **DEP-3001 First Approval:** Credited BDT 5,000 once with idempotency key.
3. **Duplicate Event Blocked:** Second identical approval blocked by idempotency engine; ledger balance was not credited again!
4. **Reliability Heartbeat Stall:** Market feed paused > 10 seconds, transitioning feed to STALE.
5. **Trading Safety Lock:** New trade orders disabled across all assets.
6. **Ticket Logged:** Support ticket created regarding balance and feed pause.
7. **Incident Verified:** Idempotency integrity confirmed; zero double-credit occurred.`;
    } else {
      deterministicAnswer = `### MacroBex System State Summary:
- **Active User:** ${user.name} (${user.role})
- **Account Mode:** ${currentAccountMode.toUpperCase()}
- **Ledger Balance:** BDT ${userWallet.ledgerBalance.toLocaleString()}
- **Reserved Balance:** BDT ${userWallet.reservedBalance.toLocaleString()}
- **Available Balance:** BDT ${userWallet.availableBalance.toLocaleString()}
- **Global Market Feed:** ${state.systemStatus.feedStatus}
- **Active Trades:** ${state.trades.filter((t) => t.status === 'ACTIVE').length} positions
- **Pending Review Items:** ${state.deposits.filter((d) => d.status === 'REVIEW_REQUIRED' || d.status === 'PENDING').length} deposits, ${state.withdrawals.filter((w) => w.status === 'PENDING').length} withdrawals.`;
    }

    // Try optional Gemini synthesis server-side
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            ...evidenceContext,
            deterministicAnswer,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.ok && json.text) {
          return {
            answer: json.text,
            deterministicEvidence: evidenceContext,
            isAiSynthesized: true,
          };
        }
      }
    } catch (e) {
      console.info('Server-side Gemini call bypassed or unavailable, using deterministic evidence engine.');
    }

    // Return deterministic evidence engine
    return {
      answer: deterministicAnswer,
      deterministicEvidence: evidenceContext,
      isAiSynthesized: false,
    };
  }, [state, currentUser, currentAccountMode]);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isStaff = ['SUPER_ADMIN', 'FINANCIAL_REVIEWER', 'KYC_REVIEWER', 'SUPPORT_AGENT'].includes(currentUser.role);

  const setFeedLatency = useCallback((ms: number) => {
    setState(prev => ({
      ...prev,
      systemStatus: {
        ...prev.systemStatus,
        feedLatencyMs: ms,
      }
    }));
  }, []);

  const setFeedStatus = useCallback((status: FeedStatus) => {
    setFeedStatusOverride(status);
  }, [setFeedStatusOverride]);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
    }));
  }, []);

  const updateUserRole = useCallback((userId: string, role: UserRole) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, role } : u),
    }));
    addToast('Role Updated', `User ${userId} role changed to ${role}`, 'info');
  }, [addToast]);

  const triggerPriceSpike = useCallback((symbol: string, pct: number) => {
    setState(prev => ({
      ...prev,
      assets: prev.assets.map(a => {
        if (a.symbol === symbol) {
          const newPrice = Number((a.currentPrice * (1 + pct / 100)).toFixed(2));
          return {
            ...a,
            currentPrice: newPrice,
            change24hPct: Number((a.change24hPct + pct).toFixed(2)),
          };
        }
        return a;
      })
    }));
    addToast('Simulated Price Shock', `${symbol} shifted by ${pct}%`, 'warning');
  }, [addToast]);

  const replyToTicket = useCallback((data: { ticketId: string; senderId?: string; senderName?: string; senderRole?: any; message: string }) => {
    return replyTicket(data.ticketId, data.message);
  }, [replyTicket]);

  const triggerScenario1 = useCallback(() => {
    runScenarioLevel1();
  }, [runScenarioLevel1]);

  const triggerScenario2 = useCallback(() => {
    runScenarioLevel2();
  }, [runScenarioLevel2]);

  const triggerScenario3 = useCallback(() => {
    setFeedStatusOverride('STALE', 'Manual scenario test: market feed paused');
    addToast('Scenario 3 Armed', 'Market feed marked STALE. New trade orders disabled.', 'warning');
  }, [setFeedStatusOverride, addToast]);

  const triggerScenario4 = useCallback(() => {
    setState(prev => ({
      ...prev,
      verifications: prev.verifications.map(v => 
        v.userId === 'user-1' || v.userId === 'usr-1001'
          ? { ...v, status: 'RESUBMISSION_REQUIRED', reviewerNotes: 'Uploaded document is unclear/blurry. Please re-upload a clear copy.' }
          : v
      ),
      users: prev.users.map(u => 
        u.id === 'user-1' || u.id === 'usr-1001'
          ? { ...u, verificationStatus: 'RESUBMISSION_REQUIRED' }
          : u
      )
    }));
    addToast('Scenario 4 Armed', 'Demo user KYC marked RESUBMISSION_REQUIRED.', 'info');
  }, [addToast]);

  const triggerScenario5 = useCallback(() => {
    toggleAssetHalt('BTC/USDT', 'Scenario 5: Volatility circuit breaker triggered');
    addToast('Scenario 5 Armed', 'BTC/USDT trading status toggled.', 'warning');
  }, [toggleAssetHalt, addToast]);

  const triggerScenario6 = useCallback(() => {
    const target = state.users.find(u => u.id === 'user-1' || u.id === 'usr-1001');
    if (target) {
      toggleUserRestriction(target.id, 'Scenario 6: Compliance trade freeze');
      addToast('Scenario 6 Armed', `User restriction toggled for ${target.name}`, 'warning');
    }
  }, [state.users, toggleUserRestriction, addToast]);

  const submitDepositRequest = submitDeposit;
  const submitWithdrawalRequest = submitWithdrawal;
  const submitVerification = useCallback((data: any) => {
    return submitKYC(data);
  }, [submitKYC]);

  return (
    <SimulationContext.Provider
      value={{
        state,
        currentUser,
        currentRole,
        currentAccountMode,
        setAccountMode,
        setCurrentUserById,
        login,
        register,
        logout,
        submitDeposit,
        submitWithdrawal,
        submitKYC,
        openTrade,
        closeTrade,
        createTicket,
        replyTicket,
        approveDeposit,
        rejectDeposit,
        requestInfoDeposit,
        approveWithdrawal,
        rejectWithdrawal,
        reviewKYC,
        updateTicketStatus,
        toggleUserRestriction,
        toggleFeedPause,
        setFeedStatusOverride,
        toggleAssetHalt,
        markNotificationRead,
        markAllNotificationsRead,
        runScenarioLevel1,
        runScenarioLevel2,
        runScenarioLevel3,
        resetDemoData,
        queryAI,
        toasts,
        addToast,
        removeToast,
        activeTab,
        setActiveTab,
        activeAdminTab,
        setActiveAdminTab,
        incidentModalOpen,
        setIncidentModalOpen,
        portalMode,
        setPortalMode,
        isSuperAdmin,
        isStaff,
        replyToTicket,
        updateUserRole,
        setFeedStatus,
        setFeedLatency,
        clearAllNotifications,
        triggerPriceSpike,
        triggerScenario1,
        triggerScenario2,
        triggerScenario3,
        triggerScenario4,
        triggerScenario5,
        triggerScenario6,
        submitDepositRequest,
        submitWithdrawalRequest,
        submitVerification,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
