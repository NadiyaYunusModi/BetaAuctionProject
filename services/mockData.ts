
import { User, UserRole, Auction, AuctionStatus, PaymentProcessStatus } from '../types';

export const MOCK_PUBLIC_USER: User = {
  id: 'guest',
  name: 'Visitor',
  email: 'guest@auctionbaba.com',
  role: UserRole.PUBLIC,
  isKycVerified: false,
  state: 'Maharashtra',
  district: 'Mumbai City',
  city: 'Mumbai',
  biddingStates: [],
  viewingStates: ["Maharashtra", "Karnataka", "Delhi", "Gujarat", "Tamil Nadu"],
  registrationExpiry: '',
  isBlocked: false,
  activityHistory: []
};

export const MOCK_ADMIN: User = {
  id: 'admin01',
  password: 'admin',
  name: 'Sandeep Khurana',
  email: 'admin@auctionbaba.com',
  role: UserRole.ADMIN,
  isKycVerified: true,
  state: 'Delhi',
  district: 'Central Delhi',
  city: 'New Delhi',
  biddingStates: [],
  viewingStates: [],
  registrationExpiry: '2099-12-31T23:59:59Z',
  isBlocked: false,
  activityHistory: [
    { id: 'act1', type: 'LOGIN', description: 'Admin session started', timestamp: new Date().toISOString() }
  ]
};

const STATES = ["Maharashtra", "Karnataka", "Delhi", "Gujarat", "Tamil Nadu", "Telangana", "West Bengal", "Uttar Pradesh", "Rajasthan", "Haryana"];
const CITIES = ["Mumbai", "Bangalore", "New Delhi", "Ahmedabad", "Chennai", "Hyderabad", "Kolkata", "Lucknow", "Jaipur", "Gurugram"];

// Generate 50 Bidders
export const MOCK_BIDDERS: User[] = Array.from({ length: 50 }).map((_, i) => {
  const turnover = i * 150000; // Diverse turnovers
  const threeMonthTurnover = turnover * 3;
  const id = `bidder${(i + 1).toString().padStart(2, '0')}`;
  
  return {
    id,
    password: 'pass',
    name: `User ${i + 1} (${turnover > 1000000 ? 'Elite' : 'Standard'})`,
    email: `${id}@auctionbaba.com`,
    role: UserRole.BIDDER,
    isKycVerified: i % 5 !== 0,
    state: STATES[i % STATES.length],
    district: CITIES[i % CITIES.length],
    city: CITIES[i % CITIES.length],
    biddingStates: [STATES[i % STATES.length]], // Initial states
    viewingStates: [STATES[i % STATES.length], STATES[(i + 1) % STATES.length]],
    registrationExpiry: '2026-12-31T23:59:59Z',
    isBlocked: i === 49, // One blocked user for testing
    activityHistory: [],
    monthlyTurnover: turnover,
    threeMonthTurnover: threeMonthTurnover
  };
});

const BANKS = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Bank", "BOB", "PNB", "Canara Bank", "Union Bank", "IDFC First"];

const VEHICLE_DATA = [
  { make: "Mahindra", model: "Thar 4x4", fuel: "Diesel", img: "https://images.unsplash.com/photo-1662031665243-706788480749?auto=format&fit=crop&q=80&w=1200" },
  { make: "Tata", model: "Safari Dark", fuel: "Diesel", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200" },
  { make: "Maruti", model: "Swift ZXi", fuel: "Petrol", img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=1200" },
  { make: "Hyundai", model: "Creta SX", fuel: "Petrol", img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200" },
  { make: "Toyota", model: "Fortuner", fuel: "Diesel", img: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1200" },
  { make: "Mahindra", model: "XUV700", fuel: "Petrol", img: "https://images.unsplash.com/photo-1619913010647-681392811394?auto=format&fit=crop&q=80&w=1200" },
  { make: "Tata", model: "Nexon EV", fuel: "Electric", img: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&q=80&w=1200" },
  { make: "MG", model: "Hector", fuel: "Petrol", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200" },
  { make: "Kia", model: "Seltos", fuel: "Diesel", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200" },
  { make: "Skoda", model: "Slavia", fuel: "Petrol", img: "https://images.unsplash.com/photo-1606148300553-6a9787b4698b?auto=format&fit=crop&q=80&w=1200" }
];

export const MOCK_AUCTIONS: Auction[] = Array.from({ length: 40 }).map((_, i) => {
  const v = VEHICLE_DATA[i % VEHICLE_DATA.length];
  const isLive = i < 15;
  const isUpcoming = i >= 15 && i < 30;
  const isClosed = i >= 30;
  
  let status = AuctionStatus.LIVE;
  if (isUpcoming) status = AuctionStatus.UPCOMING;
  if (isClosed) status = AuctionStatus.CLOSED;

  const startTimeOffset = isLive ? -3600000 : (isUpcoming ? 86400000 : -604800000);
  const endTimeOffset = isLive ? 7200000 : (isUpcoming ? 93600000 : -432000000);

  return {
    id: `BANK-REPO-2024-${100 + i}`,
    vehicleId: `V-ASSET-${500 + i}`,
    vehicle: {
      id: `V-ASSET-${500 + i}`,
      make: v.make,
      model: v.model,
      year: 2018 + (i % 6),
      vin: `IN${Math.random().toString(36).substring(7).toUpperCase()}99X`,
      fuelType: v.fuel,
      kms: 12000 + (i * 4800),
      state: STATES[i % STATES.length],
      bankName: BANKS[i % BANKS.length],
      images: [v.img],
      isAccidental: i % 10 === 0,
      rcAvailable: i % 7 !== 0,
    },
    startTime: new Date(Date.now() + startTimeOffset).toISOString(),
    endTime: new Date(Date.now() + endTimeOffset).toISOString(),
    basePrice: 450000 + (i * 20000),
    currentBid: 450000 + (i * 20000) + (isLive ? 65000 : (isClosed ? 180000 : 0)),
    bidIncrement: 5000,
    status,
    winnerId: isClosed ? MOCK_BIDDERS[i % 50].id : undefined,
    bidsCount: isLive ? 8 + i : (isClosed ? 25 : 0)
  };
});
