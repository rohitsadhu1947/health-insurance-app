"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Heart,
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Star,
  Award,
  Plus,
  Minus
} from "lucide-react";
import { useHealthInsuranceStore } from "@/lib/store";
import { formatCurrency, formatNumber, INSURERS } from "@/lib/constants";
import { QuotePlan } from "@/lib/types";
import { toast } from "sonner";
import PlanCardWithSumInsured from "@/components/PlanCardWithSumInsured";

export default function QuotesPage() {
  const router = useRouter();
  const { currentQuote, selectedPlans, addToCompare, removeFromCompare, selectPlan } = useHealthInsuranceStore();
  
  const [sortBy, setSortBy] = useState("premium-low");
  const [filterInsurer, setFilterInsurer] = useState("all");
  const [filteredPlans, setFilteredPlans] = useState<QuotePlan[]>([]);
  const [selectedSumInsured, setSelectedSumInsured] = useState('500000'); // Default to 5L
  const [isDataLoading, setIsDataLoading] = useState(false);


  useEffect(() => {
    if (!currentQuote) {
      router.push("/");
      return;
    }

    setIsDataLoading(true);

    // If no quotes, just set empty array (we'll show error message in UI)
    if (!currentQuote.quotePlans || currentQuote.quotePlans.length === 0) {
      setFilteredPlans([]);
      setIsDataLoading(false);
      return;
    }

            // Apply filters and sorting
            let plans = [...currentQuote.quotePlans];
            
            // Debug: Log ALL plans from API before any filtering
            console.log('📊 RAW PLANS FROM API:', {
              totalPlans: plans.length,
              plansByInsurer: plans.reduce((acc: any, p) => {
                const insurer = p.planData?.companyInternalName || 'UNKNOWN';
                if (!acc[insurer]) acc[insurer] = [];
                acc[insurer].push({
                  planId: p.planId,
                  planName: p.planData?.displayName,
                  hasAmountDetail: !!(p.amountDetail && p.amountDetail.length > 0),
                  amountDetailCount: p.amountDetail?.length || 0
                });
                return acc;
              }, {})
            });

            // Filter by insurer
            if (filterInsurer !== "all") {
              console.log(`🔍 Filtering by insurer: ${filterInsurer}`);
              plans = plans.filter(p => p.planData.companyInternalName === filterInsurer);
              console.log(`After insurer filter: ${plans.length} plans remaining`);
            }

            // Don't filter by sum insured - show all plans!
            // The PlanCardWithSumInsured component will handle displaying the correct premium
            // for the selected sum insured, or show the closest available option
            
            console.log('📊 All Plans (No Sum Insured Filtering):', {
              totalPlans: plans.length,
              selectedSumInsured,
              plansByInsurer: plans.reduce((acc: any, p) => {
                const insurer = p.planData?.companyInternalName || 'UNKNOWN';
                if (!acc[insurer]) acc[insurer] = 0;
                acc[insurer]++;
                return acc;
              }, {})
            });

    // Sort
    switch (sortBy) {
      case "premium-low":
        plans.sort((a, b) => a.payingAmount - b.payingAmount);
        break;
      case "premium-high":
        plans.sort((a, b) => b.payingAmount - a.payingAmount);
        break;
      case "insurer":
        plans.sort((a, b) => a.planData.companyInternalName.localeCompare(b.planData.companyInternalName));
        break;
    }

    // Add a small delay to prevent UI jumping
    const timeoutId = setTimeout(() => {
      setFilteredPlans(plans);
      setIsDataLoading(false);
    }, 100);

    // Cleanup timeout on unmount or dependency change
    return () => clearTimeout(timeoutId);
  }, [currentQuote?.id, currentQuote?.quotePlans?.length, sortBy, filterInsurer, router]); // More specific dependencies

  const handleCompareToggle = (plan: QuotePlan, checked: boolean) => {
    if (checked) {
      if (selectedPlans.length >= 3) {
        toast.error("You can compare maximum 3 plans");
        return;
      }
      addToCompare(plan);
      toast.success("Added to comparison");
    } else {
      removeFromCompare(plan.planId);
      toast.info("Removed from comparison");
    }
  };

  const handleBuyNow = (plan: QuotePlan) => {
    selectPlan(plan);
    toast.success("Plan selected! Proceeding to CKYC verification...");
    router.push("/ckyc");
  };

  const isInComparison = (planId: number) => {
    return selectedPlans.some(p => p.planId === planId);
  };

  // Group plans by insurer with better fallback handling
  const plansByInsurer = filteredPlans.reduce((acc, plan) => {
    // Try multiple possible insurer name fields with fallbacks
    const insurer = plan.planData?.companyInternalName || 
                   plan.planData?.displayName || 
                   'Unknown Insurer';
    
    if (!acc[insurer]) acc[insurer] = [];
    acc[insurer].push(plan);
    return acc;
  }, {} as Record<string, QuotePlan[]>);

  // Get unique insurers from ALL plans (not filtered), so pills always show all options
  const uniqueInsurers = [...new Set(currentQuote?.quotePlans?.map(p => 
    p.planData?.companyInternalName || 
    p.planData?.displayName || 
    'Unknown Insurer'
  ) || [])].filter(Boolean);
  
  // Debug: Log insurer information
  console.log('🔍 Insurer Debug Info:', {
    filteredPlansCount: filteredPlans.length,
    uniqueInsurers,
    samplePlan: filteredPlans[0] ? {
      companyInternalName: filteredPlans[0].planData?.companyInternalName,
      displayName: filteredPlans[0].planData?.displayName
    } : null
  });

  // Extract all available sum insured options from amountDetail arrays with better edge case handling
  const availableSumInsuredOptions = React.useMemo(() => {
    const sumInsuredSet = new Set<number>();
    
    // Early return if no quote or plans
    if (!currentQuote?.quotePlans || currentQuote.quotePlans.length === 0) {
      return [{
        value: '500000',
        label: '₹5 Lakh',
        isAvailable: true
      }];
    }
    
    // Debug: Log the current quote structure (only once)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debugging Quote Structure:', currentQuote);
    }
    
    currentQuote.quotePlans.forEach((plan, planIndex) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📋 Plan ${planIndex + 1}:`, {
          planId: plan.planId,
          planName: plan.planData?.displayName,
          payingAmount: plan.payingAmount,
          amountDetail: plan.amountDetail,
          planDataSumInsured: plan.planData?.sumInsured
        });
      }
      
      // Handle plans with amountDetail array
      if (plan.amountDetail && Array.isArray(plan.amountDetail) && plan.amountDetail.length > 0) {
        plan.amountDetail.forEach((detail, detailIndex) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`  📊 AmountDetail ${detailIndex + 1}:`, detail);
          }
          if (detail && typeof detail.sumInsured === 'number' && detail.sumInsured > 0) {
            // API returns sumInsured in lakhs, convert to rupees for consistency
            const sumInsuredInRupees = detail.sumInsured >= 100000 ? detail.sumInsured : detail.sumInsured * 100000;
            sumInsuredSet.add(sumInsuredInRupees);
          }
        });
      } 
      // Fallback to planData.sumInsured if amountDetail is missing or empty
      else if (plan.planData?.sumInsured && typeof plan.planData.sumInsured === 'number' && plan.planData.sumInsured > 0) {
        // API returns sumInsured in lakhs, convert to rupees for consistency
        const sumInsuredInRupees = plan.planData.sumInsured >= 100000 ? plan.planData.sumInsured : plan.planData.sumInsured * 100000;
        sumInsuredSet.add(sumInsuredInRupees);
      }
      // Last resort: use payingAmount to infer sum insured (convert lakhs to actual value)
      else if (plan.payingAmount && typeof plan.payingAmount === 'number') {
        // This is a fallback - we'll use a reasonable default
        sumInsuredSet.add(500000); // Default to 5L
      }
    });
    
    // If no sum insured options found, provide defaults
    if (sumInsuredSet.size === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ No sum insured options found, using defaults');
      }
      sumInsuredSet.add(500000);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('💰 Final sum insured options:', Array.from(sumInsuredSet));
    }
    
    return Array.from(sumInsuredSet)
      .sort((a, b) => a - b)
      .map(sumInsured => {
        // Fix the formatting - ensure we're working with proper lakh values
        const lakhValue = sumInsured >= 100000 ? (sumInsured / 100000) : sumInsured;
        return {
          value: sumInsured.toString(),
          label: `₹${lakhValue} Lakh`,
          isAvailable: true
        };
      });
  }, [currentQuote?.quotePlans?.length, currentQuote?.id]); // More specific dependencies

  const handleSumInsuredChange = useCallback((newSumInsured: string) => {
    const newSumInsuredNumber = parseInt(newSumInsured);
    
    // Validate that the selected sum insured is available
    const isAvailable = availableSumInsuredOptions.some(option => 
      parseInt(option.value) === newSumInsuredNumber
    );
    
    if (!isAvailable) {
      toast.error('Selected sum insured amount is not available');
      return;
    }
    
    // Update the selected sum insured
    setSelectedSumInsured(newSumInsured);
    
    // Show success message with additional context
    const selectedOption = availableSumInsuredOptions.find(option => 
      parseInt(option.value) === newSumInsuredNumber
    );
    
    const lakhValue = newSumInsuredNumber >= 100000 ? (newSumInsuredNumber / 100000) : newSumInsuredNumber;
    toast.success(
      `Updated to ${selectedOption?.label || `₹${lakhValue} Lakh`} coverage`
    );
    
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Sum insured changed:', {
        from: selectedSumInsured,
        to: newSumInsured,
        toNumber: newSumInsuredNumber,
        availableOptions: availableSumInsuredOptions
      });
    }
  }, [availableSumInsuredOptions, selectedSumInsured]);

  // Remove the early return - we want to show mock data when no currentQuote

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Find Your Perfect Health Plan
              </h1>
              <p className="text-base text-gray-600 mb-3">
                Compare <span className="font-bold text-blue-600">{filteredPlans.length} premium plans</span> from <span className="font-bold text-blue-600">{uniqueInsurers.length}</span> trusted insurers
              </p>
              {/* Insurer Pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {uniqueInsurers.map((ins) => {
                  // Count plans from ALL plans (not filtered), so count is always accurate
                  const planCount = currentQuote?.quotePlans?.filter(p => 
                    (p.planData?.companyInternalName || p.planData?.displayName || 'Unknown Insurer') === ins
                  ).length || 0;
                  
                  return (
                    <button
                      key={ins}
                      onClick={() => setFilterInsurer(filterInsurer === ins ? "all" : ins)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg transition-all duration-300 hover:scale-105 ${
                        filterInsurer === ins 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-blue-200' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300'
                      }`}
                    >
                      {INSURERS[ins as keyof typeof INSURERS]?.logo && (
                        <img 
                          src={INSURERS[ins as keyof typeof INSURERS].logo} 
                          alt={ins}
                          className="h-4 w-4 object-contain"
                        />
                      )}
                      <span className="text-xs font-semibold">
                        {(() => {
                          const fullName = INSURERS[ins as keyof typeof INSURERS]?.name || ins;
                          // Clean up insurer names - remove "Health Insurance" and other suffixes
                          return fullName
                            .replace(/ Health Insurance$/i, '')
                            .replace(/ Insurance$/i, '')
                            .replace(/ General$/i, '')
                            .replace(/ Life$/i, '');
                        })()}
                      </span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {planCount}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPlans.length > 0 && (
              <Button 
                size="lg" 
                onClick={() => router.push("/compare")}
                className="gradient-blue text-white"
              >
                Compare {selectedPlans.length} Plans <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Filters:</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium-low">Premium: Low to High</SelectItem>
                      <SelectItem value="premium-high">Premium: High to Low</SelectItem>
                      <SelectItem value="insurer">Insurer Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Insurer:</span>
                  <Select value={filterInsurer} onValueChange={setFilterInsurer}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Insurers</SelectItem>
                      {uniqueInsurers.map(insurer => (
                        <SelectItem key={insurer} value={insurer}>
                          {INSURERS[insurer as keyof typeof INSURERS]?.name || insurer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Sum Insured:</span>
                  <Select 
                    value={selectedSumInsured} 
                    onValueChange={handleSumInsuredChange}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSumInsuredOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            {option.isAvailable && (
                              <span className="text-xs text-green-600 ml-2">✓</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto">
                  <Badge variant="outline" className="text-sm">
                    {selectedPlans.length}/3 selected for comparison
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isDataLoading && (
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Plans...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the latest quotes</p>
          </Card>
        )}

        {/* Plans List */}
        <div className={`space-y-6 transition-opacity duration-300 min-h-[400px] ${isDataLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {!isDataLoading && filteredPlans.length === 0 && currentQuote?.companyErrorMessage && (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-inner">
                    <AlertCircle className="h-10 w-10 text-amber-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">No Quotes Available Right Now</h3>
                    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">{currentQuote.companyErrorMessage.message}</p>
                    
                    {currentQuote.companyErrorMessage.company && currentQuote.companyErrorMessage.company.length > 0 && (
                      <div className="space-y-4 pt-4">
                        <p className="text-sm font-medium text-gray-700">Insurers contacted:</p>
                        <div className="flex flex-wrap justify-center gap-4">
                          {currentQuote.companyErrorMessage.company.map((comp: any) => (
                            <div key={comp.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                              <img src={comp.logo} alt={comp.displayName} className="h-8 w-auto object-contain" />
                              <span className="text-sm font-semibold text-gray-700">{comp.displayName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 space-y-3">
                    <Button 
                      onClick={() => router.push("/")} 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Try Different Details
                    </Button>
                    <p className="text-xs text-gray-500">
                      💡 Tip: Try a different pincode, age, or family combination
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Display all plans as individual cards without insurer grouping */}
          <div className="grid gap-6">
            {filteredPlans.map((plan) => {
              // Get insurer name for this plan
              const insurer = plan.planData?.companyInternalName || 
                             plan.planData?.displayName || 
                             'Unknown Insurer';
              
              // Debug logging for each plan
              if (process.env.NODE_ENV === 'development') {
                console.log('📋 Rendering plan card:', {
                  planId: plan.planId,
                  planName: plan.planData?.displayName,
                  selectedSumInsured,
                  hasAmountDetail: plan.amountDetail && plan.amountDetail.length > 0
                });
              }
              
              return (
                <PlanCardWithSumInsured
                  key={`${plan.planId}-${selectedSumInsured}`} // Force re-render when sum insured changes
                  plans={[plan]} // Pass single plan as array
                  insurer={insurer}
                  selectedSumInsured={selectedSumInsured}
                  onCompareToggle={handleCompareToggle}
                  onBuyNow={handleBuyNow}
                  isInComparison={isInComparison}
                  selectedPlansCount={selectedPlans.length}
                  maxComparisonPlans={3}
                />
              );
            })}
          </div>
        </div>

        {filteredPlans.length === 0 && (
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No plans found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            <Button variant="outline" onClick={() => { setSortBy("premium-low"); setFilterInsurer("all"); }}>
              Reset Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

