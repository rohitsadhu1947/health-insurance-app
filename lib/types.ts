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

export interface QuotePlan {
  companyId: number;
  planId: number;
  payingAmount: number;
  planData: {
    internalName: string;
    displayName: string;
    planName: string;
    companyInternalName: string;
    sumInsured: number;
    coverages: Coverage[];
  };
}

export interface Coverage {
  sumInsured: string;
  coveragesValue: AddOn[];
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
  birthDate: string;
  fullName: string;
  gender: string;
  idNumber: string;
  idType: string;
  quotePlanId: number;
  salesChannelId: string;
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

