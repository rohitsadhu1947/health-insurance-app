import { apiClient } from './client';
import {
  AuthResponse,
  Quote,
  QuoteField,
  PincodeInfo,
  CKYCRequest,
  CKYCResponse,
  OTPRequest,
  OTPResponse,
  OTPVerifyRequest,
  Proposal,
  PaymentRequest,
  PaymentResponse,
} from '../types';

// Authentication
export const login = async (): Promise<string> => {
  const token = await apiClient.authenticate();
  if (!token) {
    throw new Error('Authentication failed');
  }
  return token;
};

// Quote Form Fields
export const getQuoteFormFields = async (product: string = 'HEALTH', isRenewal: boolean = false) => {
  const client = apiClient.getClient();
  const response = await client.get(`/v3/preQuote/quoteFields`, {
    params: { product, leadId: 'undefined', isRenewal }
  });
  return response.data;
};

// Pincode Verification
export const verifyPincode = async (pincode: string): Promise<{ pincode: PincodeInfo }> => {
  const client = apiClient.getClient();
  const response = await client.get(`/v3/preProposal/pincodeInfo`, {
    params: { pincode }
  });
  return response.data;
};

// Create Quote
export const createQuote = async (fieldData: QuoteField[], leadId?: string): Promise<Quote> => {
  const client = apiClient.getClient();
  const response = await client.post(`/v3/getQuote/HEALTH`, {
    fieldData,
    leadId: leadId || 'undefined'
  });
  return response.data;
};

// Get Quote (for polling)
export const getQuote = async (quoteId: number): Promise<Quote> => {
  const client = apiClient.getClient();
  const response = await client.get(`/v3/getQuote/HEALTH/${quoteId}`);
  return response.data;
};

// Poll for quote updates
export const pollForQuotes = async (
  quoteId: number, 
  onUpdate: (quote: Quote) => void,
  maxAttempts = 20,
  interval = 3000
): Promise<Quote> => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++;
        const quote = await getQuote(quoteId);
        
        // Call the update callback with latest data
        onUpdate(quote);
        
        // Continue polling if we haven't reached max attempts
        // This allows slower insurers to respond even if we already have some quotes
        if (attempts >= maxAttempts) {
          resolve(quote);
        } else {
          // Continue polling to get quotes from more insurers
          setTimeout(poll, interval);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    // Start polling
    poll();
  });
};

// Get Quote Filters
export const getQuoteFilters = async (quoteId: number) => {
  const client = apiClient.getClient();
  const response = await client.get(`/v3/preQuote/quoteFilters`, {
    params: { quoteId }
  });
  return response.data;
};

// Update Quote with Add-ons
export const updateQuoteWithAddons = async (
  quoteId: number,
  quotePlanId: number,
  planId: number,
  fieldData: QuoteField[],
  coverages: any[]
): Promise<Quote> => {
  const client = apiClient.getClient();
  const response = await client.post(`/v3/getQuote/HEALTH`, {
    id: quoteId,
    quotePlanId,
    planId,
    fieldData,
    coverages
  });
  return response.data;
};

// Helper function to format add-on selections for API
export const formatAddOnSelectionsForAPI = (addOnSelections: Record<string, {
  isSelected: boolean;
  selectedVariant?: any;
  amount: number;
}>): any[] => {
  return Object.entries(addOnSelections).map(([internalName, selection]) => {
    const baseCoverage = {
      internalName,
      isSelected: selection.isSelected,
      amount: selection.amount
    };

    // Add variant information if present
    if (selection.selectedVariant) {
      return {
        ...baseCoverage,
        value: [selection.selectedVariant]
      };
    }

    return baseCoverage;
  });
};

// CKYC Verification
export const verifyCKYC = async (insurer: string, data: any): Promise<CKYCResponse> => {
  const client = apiClient.getClient();
  
  console.log('🔐 verifyCKYC called with:', {
    insurer,
    endpoint: `/v3/proposal/ckyc/${insurer}/verifyCkyc`,
    dataKeys: Object.keys(data),
    quotePlanId: data.quotePlanId,
    salesChannelId: data.salesChannelId
  });
  
  try {
    const response = await client.post(`/v3/proposal/ckyc/${insurer}/verifyCkyc`, data);
    console.log('✅ CKYC Success:', response.data);
    return response.data;
  } catch (err: any) {
    console.error('❌ CKYC Error Full Details:', {
      message: err?.message,
      response: err?.response?.data,
      status: err?.response?.status,
      statusText: err?.response?.statusText
    });
    
    const serverMsg = err?.response?.data?.message || err?.message;
    
    // Check if this is a "already processed" success case
    if (serverMsg && serverMsg.includes('payment for this policy has already been successfully processed')) {
      // Return a success response for already processed cases
      return {
        error: null,
        response: {
          requestId: 0,
          applicationNumber: 'ALREADY_PROCESSED',
          title: '',
          firstName: '',
          middleName: '',
          lastName: '',
          gender: '',
          birthDate: '',
          address1: '',
          address2: '',
          address3: '',
          city: '',
          state: '',
          pincode: ''
        }
      } as CKYCResponse;
    }
    
    throw new Error(serverMsg || 'CKYC verification failed');
  }
};

// Get S3 Presigned URL
export const getS3PresignedUrl = async (contentType: string, filename: string, id: string) => {
  const client = apiClient.getClient();
  const response = await client.post(`/v3/utilities/getS3PresignedURL`, {
    contentType,
    filename,
    id
  });
  return response.data;
};

// Upload KYC Documents
export const uploadKycDocuments = async (insurer: string, data: any) => {
  const client = apiClient.getClient();
  const response = await client.post(`/v3/proposal/ckyc/${insurer}/uploadKycDocs`, data);
  return response.data;
};

// Get Proposal Fields
export const getProposalFields = async (
  quoteId: number,
  quotePlanId: number,
  sumInsured: number,
  step: number = 0,
  isPortabilityCase: boolean = false,
  preFillForm: boolean = true
) => {
  const client = apiClient.getClient();
  const response = await client.get(`/v3/preProposal/proposalFields`, {
    params: {
      product: 'HEALTH',
      quoteId,
      quotePlanId,
      sumInsured,
      step,
      isPortabilityCase,
      preFillForm
    }
  });
  return response.data;
};

// Send Proposal OTP
export const sendProposalOTP = async (quotePlanId: number, data: OTPRequest): Promise<OTPResponse> => {
  const client = apiClient.getClient();
  const response = await client.post(`/v3/proposal/sendProposalOTP/${quotePlanId}/Send`, data);
  return response.data;
};

// Verify OTP
export const verifyOTP = async (quotePlanId: number, data: OTPVerifyRequest): Promise<OTPResponse> => {
  const client = apiClient.getClient();
  const response = await client.post(`/v3/proposal/sendProposalOTP/${quotePlanId}/Verify`, data);
  return response.data;
};

// Create Proposal
export const createProposal = async (
  quotePlanId: number,
  fields: any[],
  salesChannelUserId: string,
  leadId?: string
): Promise<Proposal> => {
  const client = apiClient.getClient();
  const response = await client.post(`/v3/proposal/HEALTH/create`, {
    quotePlanId,
    fields,
    salesChannelUserId,
    leadId: leadId || null
  });
  return response.data;
};

// Payment
export const processPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  const client = apiClient.getClient();
  const response = await client.post(`/v3/proposal/HEALTH/payment`, data);
  return response.data;
};

