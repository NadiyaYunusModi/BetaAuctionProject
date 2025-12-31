
export enum UserRole {
  ADMIN = 'ADMIN',
  BIDDER = 'BIDDER',
  PUBLIC = 'PUBLIC'
}

export enum AuctionStatus {
  UPCOMING = 'UPCOMING',
  LIVE = 'LIVE',
  CLOSED = 'CLOSED',
  STAGING = 'STAGING'
}

export enum PaymentProcessStatus {
  AWAITING_APPROVAL = 'AWAITING_APPROVAL', 
  OPEN_FOR_PAYMENT = 'OPEN_FOR_PAYMENT',   
  VERIFYING_PAYMENT = 'VERIFYING_PAYMENT', 
  PAYMENT_DONE = 'PAYMENT_DONE'            
}

export interface UserActivity {
  id: string;
  type: 'BID' | 'LOGIN' | 'KYC_SUBMIT' | 'WATCHLIST_ADD' | 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETE' | 'BID_SUBMITTED' | 'DECLARATION_UPDATE';
  description: string;
  timestamp: string;
  amount?: number;
  settlementAmount?: number;
  targetId?: string; 
  targetName?: string; 
  status?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
}

export interface User {
  id: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  isKycVerified: boolean;
  state: string;
  district: string;
  city: string;
  biddingStates: string[];
  viewingStates: string[];
  registrationExpiry: string;
  isBlocked: boolean;
  activityHistory: UserActivity[];
  monthlyTurnover?: number; 
  threeMonthTurnover?: number; // Scenario: > 20 Lakh in 3 months allows 4 states
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  fuelType: string;
  kms: number;
  state: string;
  images: string[];
  bankName?: string;
  isAccidental?: boolean;
  rcAvailable?: boolean;
}

export interface Auction {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  startTime: string;
  endTime: string;
  basePrice: number;
  currentBid: number;
  bidIncrement: number;
  status: AuctionStatus;
  winnerId?: string;
  bidsCount: number;
  paymentStatus?: PaymentProcessStatus;
  paymentReference?: string;
  isApprovalPending?: boolean;
  bidSubmission?: {
    userId: string;
    userName: string;
    bidAmount: number;
    settlementAmount: number;
  };
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}
