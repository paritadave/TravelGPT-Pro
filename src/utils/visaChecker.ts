export interface VisaCheckResult {
  destination: string;
  passportCountry: string;
  isVisaRequired: boolean; // true if mandatory advance visa needed
  statusType: 'Visa Free' | 'eTA Required' | 'Visa on Arrival' | 'e-Visa Required' | 'Visa Required in Advance';
  statusHeading: string;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    icon: string;
  };
  allowedStay: string;
  passportValidityRequired: string;
  requiredDocuments: string[];
  safetyRating: string;
  advisoryLevel: string;
  keyTips: string[];
  scamAlerts: string[];
  explanation: string;
}

export const POPULAR_PASSPORTS = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'India',
  'Japan',
  'Brazil',
  'Mexico',
  'South Korea',
  'United Arab Emirates',
  'South Africa',
  'Singapore',
  'Italy',
  'Spain',
];

export const POPULAR_DESTINATIONS = [
  'Japan',
  'France',
  'Italy',
  'Indonesia (Bali)',
  'Thailand',
  'United States',
  'United Kingdom',
  'Spain',
  'Germany',
  'Mexico',
  'India',
  'Greece',
  'Switzerland',
  'Egypt',
  'United Arab Emirates (Dubai)',
  'Singapore',
  'Australia',
  'Vietnam',
  'Brazil',
  'Canada',
  'Turkey',
  'South Korea',
  'Iceland',
];

// Normalize country names for matching
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function checkVisaRequirement(passport: string, destination: string): VisaCheckResult {
  const p = normalize(passport);
  const d = normalize(destination);

  // Western / Strong Passport Group (US, UK, CA, AU, DE, FR, JP, KR, SG, ES, IT)
  const isStrongPassport = ['unitedstates', 'us', 'usa', 'unitedkingdom', 'uk', 'canada', 'australia', 'germany', 'france', 'japan', 'southkorea', 'singapore', 'italy', 'spain'].some(c => p.includes(c));

  // 1. JAPAN
  if (d.includes('japan') || d.includes('tokyo') || d.includes('kyoto') || d.includes('osaka')) {
    if (isStrongPassport) {
      return {
        destination: 'Japan',
        passportCountry: passport,
        isVisaRequired: false,
        statusType: 'Visa Free',
        statusHeading: '✅ Visa Not Required (Visa Free Entry)',
        badgeStyle: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', icon: '✅' },
        allowedStay: 'Up to 90 Days (Tourist)',
        passportValidityRequired: 'Valid for duration of stay',
        requiredDocuments: ['Valid Passport', 'Return Flight Ticket', 'Visit Japan Web Digital QR Code'],
        safetyRating: '4.9 / 5.0 (Extremely Safe)',
        advisoryLevel: 'Level 1: Exercise Normal Precautions',
        keyTips: ['Complete Visit Japan Web immigration form before flight', 'Tipping is not accepted in Japan', 'Carry cash for small traditional eateries'],
        scamAlerts: ['Avoid unofficial street promoters in Tokyo nightlife districts'],
        explanation: `${passport} passport holders can travel to Japan for tourism without a visa for up to 90 days.`,
      };
    } else {
      return {
        destination: 'Japan',
        passportCountry: passport,
        isVisaRequired: true,
        statusType: 'e-Visa Required',
        statusHeading: '⚠️ Japan Tourist e-Visa / Advance Visa Required',
        badgeStyle: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', icon: '⚠️' },
        allowedStay: 'Up to 90 Days upon approval',
        passportValidityRequired: 'Minimum 6 months validity',
        requiredDocuments: ['Passport Copy', 'Flight Itinerary', 'Hotel Bookings', 'Bank Proof of Funds'],
        safetyRating: '4.9 / 5.0 (Extremely Safe)',
        advisoryLevel: 'Level 1: Exercise Normal Precautions',
        keyTips: ['Apply for single-entry Japan tourist e-Visa at least 2-3 weeks prior to travel', 'Ensure bank statement shows sufficient balance'],
        scamAlerts: ['Use official JAPAN eVISA website ONLY to avoid third-party agency surcharges'],
        explanation: `${passport} passport holders require an approved Japan Tourist e-Visa or embassy visa prior to departure.`,
      };
    }
  }

  // 2. FRANCE / SCHENGEN (Italy, Spain, Germany, Greece, Switzerland)
  if (d.includes('france') || d.includes('paris') || d.includes('italy') || d.includes('rome') || d.includes('spain') || d.includes('barcelona') || d.includes('germany') || d.includes('greece') || d.includes('switzerland')) {
    const destName = d.includes('france') || d.includes('paris') ? 'France' : d.includes('italy') ? 'Italy' : d.includes('spain') ? 'Spain' : d.includes('germany') ? 'Germany' : 'Schengen Area';
    if (isStrongPassport) {
      return {
        destination: destName,
        passportCountry: passport,
        isVisaRequired: false,
        statusType: 'eTA Required',
        statusHeading: '✅ Visa Free Entry (ETIAS eTA Registration Required)',
        badgeStyle: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40', icon: '🛂' },
        allowedStay: '90 Days within any 180-Day Period',
        passportValidityRequired: '3 months beyond intended departure date',
        requiredDocuments: ['Valid Passport', 'ETIAS eTA Travel Authorization', 'Travel Insurance Covering €30,000+'],
        safetyRating: '4.6 / 5.0 (Safe)',
        advisoryLevel: 'Level 1: Exercise Normal Precautions',
        keyTips: ['Register for ETIAS electronic approval online before flight', 'Beware of pickpockets at crowded tourist monuments'],
        scamAlerts: ['Watch out for petition ring scams near major monuments like Eiffel Tower or Colosseum'],
        explanation: `${passport} passport holders do not need a Schengen visa, but must obtain ETIAS travel clearance online.`,
      };
    } else {
      return {
        destination: destName,
        passportCountry: passport,
        isVisaRequired: true,
        statusType: 'Visa Required in Advance',
        statusHeading: '❌ Schengen Visa Required in Advance',
        badgeStyle: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', icon: '❌' },
        allowedStay: 'Up to 90 Days (Schengen Type C)',
        passportValidityRequired: '6 months minimum validity',
        requiredDocuments: ['Schengen Visa Sticker in Passport', 'Schengen Travel Insurance (€30k coverage)', 'Confirmed Flights & Hotel Vouchers', '3-6 Months Bank Statements'],
        safetyRating: '4.6 / 5.0 (Safe)',
        advisoryLevel: 'Level 1: Exercise Normal Precautions',
        keyTips: ['Book your VFS / TLS Schengen visa appointment at least 4-8 weeks in advance', 'Ensure travel insurance covers medical repatriation'],
        scamAlerts: ['Beware of fake visa appointment seller websites charging unauthorized fees'],
        explanation: `${passport} passport holders MUST obtain a Schengen Tourist Visa (Type C) prior to traveling to ${destName}.`,
      };
    }
  }

  // 3. INDONESIA (BALI)
  if (d.includes('indonesia') || d.includes('bali')) {
    return {
      destination: 'Indonesia (Bali)',
      passportCountry: passport,
      isVisaRequired: false,
      statusType: 'Visa on Arrival',
      statusHeading: '✈️ Visa on Arrival (VOA) / e-VOA Available',
      badgeStyle: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40', icon: '✈️' },
      allowedStay: '30 Days (Extendable by 30 days)',
      passportValidityRequired: '6 months minimum validity from entry',
      requiredDocuments: ['Valid Passport', 'Return Ticket', 'Indonesia e-Customs Declaration QR', 'Tourist Levy Payment ($10 USD)'],
      safetyRating: '4.7 / 5.0 (Safe)',
      advisoryLevel: 'Level 1: Exercise Normal Precautions',
      keyTips: ['Pay e-VOA online beforehand to skip long queues at Denpasar Airport', 'Pay the Bali Tourist Levy online at LoveBali portal'],
      scamAlerts: ['Beware of unofficial money changers offering unrealistically high exchange rates'],
      explanation: `${passport} passport holders can obtain an e-VOA online or pay $35 USD upon arrival at Denpasar Bali airport.`,
    };
  }

  // 4. THAILAND
  if (d.includes('thailand') || d.includes('bangkok') || d.includes('phuket')) {
    return {
      destination: 'Thailand',
      passportCountry: passport,
      isVisaRequired: false,
      statusType: 'Visa Free',
      statusHeading: '✅ Visa Free Entry (60 Days Tourist Waiver)',
      badgeStyle: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', icon: '✅' },
      allowedStay: 'Up to 60 Days',
      passportValidityRequired: '6 months minimum validity',
      requiredDocuments: ['Valid Passport', 'Proof of Onward Travel', 'Proof of Sufficient Funds (10,000 THB)'],
      safetyRating: '4.7 / 5.0 (Safe)',
      advisoryLevel: 'Level 1: Exercise Normal Precautions',
      keyTips: ['Thailand offers 60-day visa exemption for over 93 nationalities', 'Use Grab app for transparent taxi pricing'],
      scamAlerts: ['Ignore tuk-tuk drivers saying "The Grand Palace is closed today"'],
      explanation: `${passport} passport holders qualify for Thailand\'s 60-day visa-free tourist exemption.`,
    };
  }

  // 5. UNITED STATES
  if (d.includes('unitedstates') || d.includes('usa') || d.includes('newyork') || d.includes('losangeles')) {
    if (['unitedkingdom', 'uk', 'canada', 'australia', 'germany', 'france', 'japan', 'southkorea', 'singapore', 'italy', 'spain'].some(c => p.includes(c))) {
      return {
        destination: 'United States',
        passportCountry: passport,
        isVisaRequired: false,
        statusType: 'eTA Required',
        statusHeading: '✅ Visa Waiver Program (ESTA eTA Required)',
        badgeStyle: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40', icon: '🛂' },
        allowedStay: 'Up to 90 Days',
        passportValidityRequired: 'Valid for duration of stay',
        requiredDocuments: ['Approved ESTA Travel Authorization', 'e-Passport with embedded chip', 'Return Flight Ticket'],
        safetyRating: '4.5 / 5.0 (Safe)',
        advisoryLevel: 'Level 1: Exercise Normal Precautions',
        keyTips: ['Apply for ESTA at least 72 hours prior to flight on official dhs.gov website', 'Fee is $21 USD'],
        scamAlerts: ['Use ONLY the official official esta.cbp.dhs.gov website to avoid $100+ scam agency fees'],
        explanation: `${passport} passport holders are eligible for ESTA under the US Visa Waiver Program.`,
      };
    } else {
      return {
        destination: 'United States',
        passportCountry: passport,
        isVisaRequired: true,
        statusType: 'Visa Required in Advance',
        statusHeading: '❌ US B1/B2 Tourist Visa Required',
        badgeStyle: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', icon: '❌' },
        allowedStay: 'Up to 6 Months per entry',
        passportValidityRequired: '6 months minimum validity',
        requiredDocuments: ['Valid Passport with US B1/B2 Visa Stamp', 'Form DS-160 Confirmation Page', 'Interview Appointment Notice'],
        safetyRating: '4.5 / 5.0 (Safe)',
        advisoryLevel: 'Level 1: Exercise Normal Precautions',
        keyTips: ['Schedule consular interview appointment months in advance due to wait times', 'Carry strong proof of ties to home country'],
        scamAlerts: ['Do not pay third-party companies promising guaranteed visa appointment slots'],
        explanation: `${passport} passport holders MUST hold an approved US B1/B2 Tourist Visa stamp prior to departure.`,
      };
    }
  }

  // 6. INDIA
  if (d.includes('india') || d.includes('delhi') || d.includes('mumbai')) {
    return {
      destination: 'India',
      passportCountry: passport,
      isVisaRequired: true,
      statusType: 'e-Visa Required',
      statusHeading: '⚠️ Indian Tourist e-Visa Required in Advance',
      badgeStyle: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', icon: '⚠️' },
      allowedStay: '30 Days, 1 Year, or 5 Years (Multiple Entry)',
      passportValidityRequired: '6 months minimum validity with 2 blank pages',
      requiredDocuments: ['Approved Indian e-Visa Email ETA PDF', 'Passport Copy', 'Recent White Background Photo'],
      safetyRating: '4.4 / 5.0 (Exercise Normal Caution)',
      advisoryLevel: 'Level 2: Exercise Increased Caution',
      keyTips: ['Apply for Indian e-Tourist Visa at indianvisaonline.gov.in at least 4 days before travel', 'Print hard copy of e-Visa ETA PDF to present at airline check-in'],
      scamAlerts: ['ONLY use official government site ending in .gov.in to avoid overpriced broker sites'],
      explanation: `${passport} passport holders must apply for an Indian Tourist e-Visa online prior to traveling.`,
    };
  }

  // DEFAULT / FALLBACK MATCHER
  if (isStrongPassport) {
    return {
      destination,
      passportCountry: passport,
      isVisaRequired: false,
      statusType: 'Visa Free',
      statusHeading: '✅ Visa Free / eTA Entry Likely Available',
      badgeStyle: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', icon: '✅' },
      allowedStay: 'Up to 30 - 90 Days',
      passportValidityRequired: '6 months minimum validity required',
      requiredDocuments: ['Valid Passport', 'Return Ticket', 'Hotel Booking Confirmation'],
      safetyRating: '4.7 / 5.0 (Safe)',
      advisoryLevel: 'Level 1: Exercise Normal Precautions',
      keyTips: ['Ensure passport has at least 2 blank visa pages', 'Verify electronic travel declaration requirements'],
      scamAlerts: ['Always check official government immigration portals before departure'],
      explanation: `${passport} passport holders typically enjoy visa-free or eTA entry privileges for short-term tourism to ${destination}.`,
    };
  } else {
    return {
      destination,
      passportCountry: passport,
      isVisaRequired: true,
      statusType: 'e-Visa Required',
      statusHeading: '⚠️ Tourist Visa or e-Visa Required in Advance',
      badgeStyle: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', icon: '⚠️' },
      allowedStay: 'Up to 30 Days',
      passportValidityRequired: '6 months minimum validity',
      requiredDocuments: ['Valid Passport', 'Approved e-Visa / Embassy Visa', 'Return Flight Ticket', 'Proof of Funds'],
      safetyRating: '4.5 / 5.0',
      advisoryLevel: 'Level 1: Exercise Normal Precautions',
      keyTips: ['Check embassy or e-Visa requirements at least 3-4 weeks prior to departure', 'Ensure passport validity extends 6 months past return date'],
      scamAlerts: ['Apply exclusively through official government embassy portals'],
      explanation: `${passport} passport holders are generally required to obtain a Tourist Visa or e-Visa prior to entry into ${destination}.`,
    };
  }
}
