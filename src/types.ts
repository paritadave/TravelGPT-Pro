export type AgentType =
  | 'Coordinator'
  | 'Planner'
  | 'Flight'
  | 'Hotel'
  | 'Restaurant'
  | 'Budget'
  | 'Weather'
  | 'Navigation'
  | 'Packing'
  | 'Visa'
  | 'Memory';

export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'transit'
  | 'accommodation'
  | 'relaxation'
  | 'adventure';

export interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  category: ActivityCategory;
  cost: number;
  rating?: number;
  notes?: string;
  coordinates?: { lat: number; lng: number };
  photoUrl?: string;
  completed?: boolean;
}

export interface DayItinerary {
  dayNumber: number;
  date: string;
  theme: string;
  dailyBudgetSpent: number;
  weatherForecast: string;
  activities: Activity[];
}

export interface FlightOption {
  id: string;
  airline: string;
  logo: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  co2Emissions: string;
  aiScore: number;
  tags: string[];
  bookingUrl: string;
}

export interface HotelOption {
  id: string;
  name: string;
  stars: number;
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  currency: string;
  location: string;
  neighborhood: string;
  image: string;
  amenities: string[];
  aiMatchScore: number;
  distanceToCenter: string;
  bookingUrl: string;
}

export interface Expense {
  id: string;
  category: 'flights' | 'accommodation' | 'food' | 'activities' | 'transit' | 'shopping' | 'other';
  title: string;
  amount: number;
  currency: string;
  date: string;
  agentVerified?: boolean;
}

export interface PackingItem {
  id: string;
  name: string;
  packed: boolean;
  essential: boolean;
  category: string;
}

export interface PackingCategory {
  category: string;
  items: PackingItem[];
}

export interface AgentMessage {
  id: string;
  agentType: AgentType;
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
  cardData?: any;
}

export interface Persona {
  id: string;
  name: string;
  tag: string;
  description: string;
  budgetLevel: '$' | '$$' | '$$$' | '$$$$';
  pace: 'Relaxed' | 'Balanced' | 'Fast / Intensive';
  priorities: string[];
  avatar: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  location: string;
  mood: string;
  photoUrl?: string;
  tags: string[];
}

export interface VisaInfo {
  passportCountry: string;
  destination: string;
  status: 'Visa Free' | 'e-Visa Required' | 'Visa on Arrival' | 'Visa Required';
  allowedStay: string;
  passportValidityRequired: string;
  requiredDocuments: string[];
  safetyRating: string;
  advisoryLevel: string;
  keyTips: string[];
  scamAlerts: string[];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startingCity: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  budget: number;
  currency: string;
  travelerPersona: string;
  status: 'upcoming' | 'active' | 'completed' | 'draft';
  coverImage: string;
  days: DayItinerary[];
  flights: FlightOption[];
  hotels: HotelOption[];
  packingCategories: PackingCategory[];
  expenses: Expense[];
  visaInfo?: VisaInfo;
  journalEntries: JournalEntry[];
}
