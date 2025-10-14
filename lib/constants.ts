// Insurer logos and branding
export const INSURERS: Record<string, { name: string; logo: string; color: string }> = {
  CARE: {
    name: 'Care Health Insurance',
    logo: 'https://d31gd4xu0lbu1j.cloudfront.net/companyLogos/4_religare.jpg',
    color: '#2563EB', // Professional blue
  },
  CIGNA: {
    name: 'Cigna TTK',
    logo: '/insurers/cigna.png',
    color: '#7C3AED', // Purple
  },
  DIGIT: {
    name: 'Digit Insurance',
    logo: 'https://d31gd4xu0lbu1j.cloudfront.net/companyLogos/12_godigit.jpg',
    color: '#F97316', // Bright orange
  },
  HDFC: {
    name: 'HDFC ERGO',
    logo: '/insurers/hdfc.png',
    color: '#0284C7', // Sky blue
  },
  NIVA_BUPA: {
    name: 'Niva Bupa Health Insurance',
    logo: 'https://d31gd4xu0lbu1j.cloudfront.net/companyLogos/36_NIVA.png',
    color: '#059669', // Emerald green
  },
  'NIVA BUPA': {
    name: 'Niva Bupa Health Insurance',
    logo: 'https://d31gd4xu0lbu1j.cloudfront.net/companyLogos/36_NIVA.png',
    color: '#059669', // Emerald green
  },
  RELIGARE: {
    name: 'Religare Health Insurance',
    logo: 'https://d31gd4xu0lbu1j.cloudfront.net/companyLogos/4_religare.jpg',
    color: '#7C2D12', // Brown/maroon
  },
  RELIANCE: {
    name: 'Reliance Health Insurance',
    logo: 'https://d31gd4xu0lbu1j.cloudfront.net/companyLogos/2_reliance.jpg',
    color: '#DC2626', // Red
  },
  ICICI_LOMBARD: {
    name: 'ICICI Lombard',
    logo: 'https://d31gd4xu0lbu1j.cloudfront.net/companyLogos/15_ICIC_LOMBARD.png',
    color: '#EA580C', // Deep orange
  },
  'ICICI LOMBARD': {
    name: 'ICICI Lombard',
    logo: 'https://d31gd4xu0lbu1j.cloudfront.net/companyLogos/15_ICIC_LOMBARD.png',
    color: '#EA580C', // Deep orange
  },
};

// Family member options
export const FAMILY_MEMBERS = [
  { id: 'self', label: 'Self', icon: '👤' },
  { id: 'spouse', label: 'Spouse', icon: '💑' },
  { id: 'father', label: 'Father', icon: '👨' },
  { id: 'mother', label: 'Mother', icon: '👩' },
  { id: 'son', label: 'Son', icon: '👦' },
  { id: 'daughter', label: 'Daughter', icon: '👧' },
];

// Sum Insured options
export const SUM_INSURED_OPTIONS = [
  { value: '300000', label: '₹3 Lakh' },
  { value: '500000', label: '₹5 Lakh' },
  { value: '1000000', label: '₹10 Lakh' },
  { value: '1500000', label: '₹15 Lakh' },
  { value: '2000000', label: '₹20 Lakh' },
  { value: '2500000', label: '₹25 Lakh' },
  { value: '5000000', label: '₹50 Lakh' },
  { value: '10000000', label: '₹1 Crore' },
];

// Tenure options
export const TENURE_OPTIONS = [
  { value: '1_year', label: '1 Year' },
  { value: '2_year', label: '2 Years' },
  { value: '3_year', label: '3 Years' },
];

// Features for comparison
export const FEATURES_FOR_COMPARISON = [
  'Premium Amount',
  'Sum Insured',
  'Room Rent Limit',
  'Pre-existing Disease Cover',
  'Waiting Period',
  'Co-payment',
  'Sub-limits',
  'No Claim Bonus',
  'Restoration Benefit',
  'Day Care Procedures',
  'Pre-hospitalization',
  'Post-hospitalization',
  'Ambulance Charges',
  'Health Check-up',
  'Maternity Cover',
  'New Born Baby Cover',
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return formatCurrency(num);
};

