import { create } from 'zustand';
import { Quote, QuotePlan, CKYCResponse } from './types';

interface HealthInsuranceStore {
  // Authentication
  isAuthenticated: boolean;
  authToken: string | null;
  setAuthToken: (token: string) => void;

  // Quote Data
  currentQuote: Quote | null;
  setCurrentQuote: (quote: Quote) => void;
  
  // Selected Plans
  selectedPlans: QuotePlan[];
  addToCompare: (plan: QuotePlan) => void;
  removeFromCompare: (planId: number) => void;
  clearComparison: () => void;
  
  // Selected Plan for Purchase
  selectedPlan: QuotePlan | null;
  selectPlan: (plan: QuotePlan) => void;
  
  // CKYC Data
  ckycData: CKYCResponse | null;
  setCkycData: (data: CKYCResponse) => void;
  
  // Proposal
  proposalId: number | null;
  setProposalId: (id: number) => void;
  
  // User Data
  userFormData: any;
  setUserFormData: (data: any) => void;
  
  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

export const useHealthInsuranceStore = create<HealthInsuranceStore>((set) => ({
  // Authentication
  isAuthenticated: false,
  authToken: null,
  setAuthToken: (token) => set({ authToken: token, isAuthenticated: true }),

  // Quote Data
  currentQuote: null,
  setCurrentQuote: (quote) => set({ currentQuote: quote }),

  // Selected Plans
  selectedPlans: [],
  addToCompare: (plan) =>
    set((state) => {
      if (state.selectedPlans.length >= 3) {
        return state; // Max 3 plans for comparison
      }
      if (state.selectedPlans.some((p) => p.planId === plan.planId)) {
        return state; // Already added
      }
      return { selectedPlans: [...state.selectedPlans, plan] };
    }),
  removeFromCompare: (planId) =>
    set((state) => ({
      selectedPlans: state.selectedPlans.filter((p) => p.planId !== planId),
    })),
  clearComparison: () => set({ selectedPlans: [] }),

  // Selected Plan for Purchase
  selectedPlan: null,
  selectPlan: (plan) => set({ selectedPlan: plan }),

  // CKYC Data
  ckycData: null,
  setCkycData: (data) => set({ ckycData: data }),

  // Proposal
  proposalId: null,
  setProposalId: (id) => set({ proposalId: id }),

  // User Data
  userFormData: {},
  setUserFormData: (data) => set({ userFormData: data }),

  // Loading States
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Reset
  reset: () =>
    set({
      currentQuote: null,
      selectedPlans: [],
      selectedPlan: null,
      ckycData: null,
      proposalId: null,
      userFormData: {},
      isLoading: false,
    }),
}));

