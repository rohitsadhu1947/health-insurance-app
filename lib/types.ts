// Core Types for Health Insurance Application

export interface AuthResponse {
  isVerified: boolean;
  accessToken: string;
}

export interface QuoteField {
  id: string;
  value: string | number | boolean;
  parentProperty: string;
}

export interface AmountDetail {
  gst: string | number;
  sumInsured: number;
  basePremium: string | number;
  premiumMonthly: string | number;
  premiumAnnually: string | number;
  coverages?: Coverage[];
  // Enhanced to handle all API response variations
  payingAmount?: number;
}

export interface QuotePlan {
  companyId: number;
  planId: number;
  payingAmount: number;
  amountDetail?: AmountDetail[];
  planData: {
    internalName: string;
    displayName: string;
    planName: string;
    companyInternalName: string;
    sumInsured: number;
    coverages: Coverage[];
  };
}

// Base add-on option interface
export interface AddOnOption {
  label?: string;
  displayName: string;
  internalName: string;
  defaultSelected: boolean;
  value?: any;
}

// Enhanced coverage/add-on interface
export interface Coverage {
  sumInsured?: string;
  coveragesValue?: AddOn[];
  // Also support direct coverage format from API
  internalName?: string;
  displayName?: string;
  value?: any;
  amount?: number | null;
  available?: boolean;
  isSelected?: boolean;
  readOnly?: boolean;
  defaultSelected?: boolean;
  // Enhanced fields for better add-on handling
  defaultMsg?: string;
  events?: AddOnEvent[];
}

// Add-on event for handling dependencies between add-ons
export interface AddOnEvent {
  type: 'select' | 'unselect';
  actions: AddOnAction[];
}

export interface AddOnAction {
  enableList?: string[];
  disableList?: string[];
}

export interface AddOn {
  internalName: string;
  displayName: string;
  value: any;
  amount: number | null;
  available: boolean;
  isSelected: boolean;
  readOnly: boolean;
  defaultSelected: boolean;
  // Enhanced fields
  defaultMsg?: string;
  events?: AddOnEvent[];
}

// Coverage with variants (for complex add-ons with sub-options)
export interface CoverageWithVariants extends Coverage {
  value?: AddOnOption[] | AddOnOption[][];
  hasVariants?: boolean;
  selectedVariant?: AddOnOption;
}

export interface Quote {
  id: number;
  product: string;
  fieldData: QuoteField[];
  filterData: QuoteField[];
  quotePlans: QuotePlan[];
  createdAt: string;
  companyErrorMessage?: {
    company: Array<{
      id: number;
      logo: string;
      displayName: string;
    }>;
    message: string;
  };
  planErrorMessage?: {
    message: string;
    refreshCount: number;
  };
  status?: string;
}

export interface PincodeInfo {
  isInputValid: boolean;
  message: string;
  variables: {
    state: string;
    city: string;
    district: string;
  };
}

export interface CKYCRequest {
  dob: string; // DD-MM-YYYY
  fullName: string; // Uppercase
  gender: 'M' | 'F' | 'O';
  document: {
    type: string; // e.g., PAN, AADHAAR
    number: string;
  };
  quotePlanId: number;
  quoteId?: number | string;
  salesChannelId: number;
}

export interface CKYCResponse {
  error: any;
  response: {
    requestId: number;
    applicationNumber: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface ProposalField {
  title: string;
  value: string;
  enabled: boolean;
  fieldId: string;
  visible: boolean;
  fieldType: string;
  validations?: any[];
}

export interface ProposalPage {
  icon: string;
  title: string;
  fields: ProposalField[];
}

export interface OTPRequest {
  phoneNumber: string;
}

export interface OTPVerifyRequest {
  otp: string;
  phoneNumber: string;
}

export interface OTPResponse {
  status: string;
  message: string;
  data: {
    status: string;
    notificationId: number;
    module: string;
    provider: string;
  };
}

export interface Proposal {
  id: number;
  product: string;
  status: string;
  paymentData: {
    modes: PaymentMode[];
  };
}

export interface PaymentMode {
  details: any;
  selected: string;
  displayName: string;
  internalName: string;
}

export interface PaymentRequest {
  proposalId: string;
  paymentData: {
    modes: PaymentMode[];
  };
  leadId?: string;
}

export interface PaymentResponse {
  invoiceDetails: any;
  status: string;
  paymentData: {
    modes: PaymentMode[];
  };
}

// Form data interfaces
export interface QuoteFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  pincode: string;
  self: boolean;
  selfAge: number;
  spouse: boolean;
  spouseAge?: number;
  father: boolean;
  fatherAge?: number;
  mother: boolean;
  motherAge?: number;
  son: number;
  sonAges?: number[];
  daughter: number;
  daughterAges?: number[];
}

export interface Insurer {
  name: string;
  displayName: string;
  products: QuotePlan[];
}

// Add-on selection state for dynamic premium calculation
export interface AddOnSelection {
  planId: number;
  sumInsured: number;
  selectedAddOns: Record<string, {
    isSelected: boolean;
    selectedVariant?: AddOnOption;
    amount: number;
  }>;
  totalAddOnAmount: number;
  basePremium: number;
  totalPremium: number;
}

// Enhanced quote plan with add-on management
export interface EnhancedQuotePlan extends QuotePlan {
  selectedAddOns?: AddOnSelection;
  availableSumInsuredOptions?: number[];
}

// CKYC Verification Types
export interface CKYCRequest {
  dob: string;
  fullName: string;
  gender: 'M' | 'F' | 'O';
  document: {
    type: string;
    number: string;
  };
  quotePlanId: number;
  quoteId?: number | string;
  salesChannelId: number;
}

export interface CKYCResponse {
  error: any; // Error object from API
  response: {
    requestId?: number;
    applicationNumber?: string;
    title?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    gender?: string;
    birthDate?: string;
    address1?: string;
    address2?: string;
    address3?: string;
    city?: string;
    state?: string;
    pincode?: string;
    message?: string;
    status?: 'verified' | 'already_processed' | 'failed';
    // HDFC format fields
    data?: {
      kyc_id?: string;
      ckycNumber?: string;
      iskycVerified?: number;
      status?: string;
    };
    // Digit format fields
    status?: string;
    // Niva Bupa format fields
    Status?: string;
    CkycMsg?: string;
  };
}

