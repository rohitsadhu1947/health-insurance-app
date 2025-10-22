"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  X, 
  ArrowRight,
  Shield,
  Minus,
  Plus,
  Star,
  Eye,
  Info
} from "lucide-react";
import { useHealthInsuranceStore } from "@/lib/store";
import { formatCurrency, formatNumber, INSURERS } from "@/lib/constants";
import { toast } from "sonner";
import PlanDetailsModal from "@/components/PlanDetailsModal";

const COMPARISON_FEATURES = [
  "Premium Amount",
  "Sum Insured",
  "Company Name",
  "Room Rent Limit",
  "Pre-existing Disease Cover",
  "Co-payment",
  "No Claim Bonus",
  "Restoration Benefit",
  "Day Care Procedures",
  "Pre-hospitalization",
  "Post-hospitalization",
  "Ambulance Charges",
];

export default function ComparePage() {
  const router = useRouter();
  const { selectedPlans, removeFromCompare, selectPlan, getAddOnSelection } = useHealthInsuranceStore();
  const [selectedSumInsured, setSelectedSumInsured] = useState('500000');

  if (selectedPlans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No plans to compare</h3>
            <p className="text-muted-foreground mb-6">Please select plans from the quotes page to compare</p>
            <Button onClick={() => router.push("/quotes")}>
              Go to Quotes
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Extract available sum insured options
  const availableSumInsuredOptions = useMemo(() => {
    const sumInsuredSet = new Set<number>();
    
    selectedPlans.forEach(plan => {
      if (plan.amountDetail && Array.isArray(plan.amountDetail) && plan.amountDetail.length > 0) {
        plan.amountDetail.forEach(detail => {
          if (detail && typeof detail.sumInsured === 'number' && detail.sumInsured > 0) {
            sumInsuredSet.add(detail.sumInsured);
          }
        });
      } else if (plan.planData?.sumInsured && typeof plan.planData.sumInsured === 'number' && plan.planData.sumInsured > 0) {
        sumInsuredSet.add(plan.planData.sumInsured);
      } else {
        sumInsuredSet.add(500000); // Default fallback
      }
    });
    
    return Array.from(sumInsuredSet)
      .sort((a, b) => a - b)
      .map(sumInsured => ({
        value: sumInsured.toString(),
        label: `₹${(sumInsured / 100000)} Lakh`
      }));
  }, [selectedPlans]);

  // Get plan data for selected sum insured
  const getPlanDataForSumInsured = (plan: any) => {
    if (plan.amountDetail && Array.isArray(plan.amountDetail)) {
      const matchingDetail = plan.amountDetail.find(
        detail => detail.sumInsured.toString() === selectedSumInsured
      );
      if (matchingDetail) {
        return {
          premium: Number(matchingDetail.premiumAnnually),
          sumInsured: matchingDetail.sumInsured,
          coverages: matchingDetail.coverages || []
        };
      }
    }
    
    // Fallback to default plan data
    return {
      premium: plan.payingAmount,
      sumInsured: parseInt(selectedSumInsured),
      coverages: plan.planData?.coverages || []
    };
  };

  const handleBuyNow = (plan: any) => {
    selectPlan(plan);
    toast.success("Plan selected! Proceeding to CKYC verification...");
    router.push("/ckyc");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Compare Health Insurance Plans</h1>
          <p className="text-muted-foreground mb-6">
            Side-by-side comparison of {selectedPlans.length} selected plans
          </p>
          
          {/* Sum Insured Selector */}
          {availableSumInsuredOptions.length > 1 && (
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Compare for:</span>
              <Select value={selectedSumInsured} onValueChange={setSelectedSumInsured}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSumInsuredOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white px-6 py-4 text-left">
                      <div className="font-semibold">Features</div>
                    </th>
                    {selectedPlans.map((plan) => {
                      const planData = getPlanDataForSumInsured(plan);
                      const insurerInfo = INSURERS[plan.planData.companyInternalName as keyof typeof INSURERS];
                      const addOnSelection = getAddOnSelection(plan.planId);
                      const totalAddOnAmount = addOnSelection?.totalAddOnAmount || 0;
                      const finalPremium = planData.premium + totalAddOnAmount;
                      
                      return (
                        <th key={plan.planId} className="px-6 py-4">
                          <Card className="p-6 text-center min-w-[300px] hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border"
                                     style={{ borderColor: insurerInfo?.color }}>
                                  {insurerInfo?.logo ? (
                                    <img 
                                      src={insurerInfo.logo} 
                                      alt={insurerInfo.name}
                                      className="h-6 w-6 object-contain"
                                    />
                                  ) : (
                                    <Shield 
                                      className="h-5 w-5" 
                                      style={{ color: insurerInfo?.color }} 
                                    />
                                  )}
                                </div>
                                <span className="text-sm font-medium">
                                  {insurerInfo?.name || plan.planData.companyInternalName}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  removeFromCompare(plan.planId);
                                  toast.info("Plan removed from comparison");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <h4 className="text-lg font-bold mb-2">{plan.planData.displayName}</h4>
                            <div className="flex items-center justify-center space-x-1 mb-3">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-500">4.2/5</span>
                            </div>
                            
                            <div className="mb-3">
                              <div className="text-3xl font-bold mb-1" style={{ color: insurerInfo?.color }}>
                                {formatCurrency(finalPremium)}
                              </div>
                              <p className="text-sm text-muted-foreground">per year</p>
                              {totalAddOnAmount > 0 && (
                                <div className="text-xs text-green-600 mt-1">
                                  +{formatCurrency(totalAddOnAmount)} add-ons
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <PlanDetailsModal
                                plan={plan}
                                displayPremium={planData.premium}
                                displaySumInsured={planData.sumInsured}
                                displayCoverages={planData.coverages}
                                insurerInfo={insurerInfo}
                                insurer={plan.planData.companyInternalName}
                                onBuyNow={handleBuyNow}
                              >
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </PlanDetailsModal>
                              
                              <Button 
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                onClick={() => handleBuyNow(plan)}
                              >
                                Buy Now <ArrowRight className="ml-1 h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Premium Row */}
                  <tr className="bg-blue-50/50">
                    <td className="sticky left-0 z-10 bg-blue-50/50 px-6 py-4 font-semibold">
                      Annual Premium
                    </td>
                    {selectedPlans.map((plan) => {
                      const planData = getPlanDataForSumInsured(plan);
                      const addOnSelection = getAddOnSelection(plan.planId);
                      const finalPremium = planData.premium + (addOnSelection?.totalAddOnAmount || 0);
                      
                      return (
                        <td key={plan.planId} className="px-6 py-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(finalPremium)}
                          </div>
                          {addOnSelection && addOnSelection.totalAddOnAmount > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              Base: {formatCurrency(planData.premium)} + {formatCurrency(addOnSelection.totalAddOnAmount)} add-ons
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Sum Insured Row */}
                  <tr>
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 font-semibold">
                      Sum Insured
                    </td>
                    {selectedPlans.map((plan) => {
                      const planData = getPlanDataForSumInsured(plan);
                      return (
                        <td key={plan.planId} className="px-6 py-4 text-center">
                          <Badge variant="secondary" className="text-base">
                            {formatNumber(planData.sumInsured)}
                          </Badge>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Company Row */}
                  <tr className="bg-gray-50">
                    <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-semibold">
                      Insurance Company
                    </td>
                    {selectedPlans.map((plan) => (
                      <td key={plan.planId} className="px-6 py-4 text-center">
                        {INSURERS[plan.planData.companyInternalName as keyof typeof INSURERS]?.name || plan.planData.companyInternalName}
                      </td>
                    ))}
                  </tr>

                  {/* Coverage Features */}
                  <tr>
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 font-semibold">
                      Available Add-ons
                    </td>
                    {selectedPlans.map((plan) => {
                      const planData = getPlanDataForSumInsured(plan);
                      const addOnSelection = getAddOnSelection(plan.planId);
                      
                      return (
                        <td key={plan.planId} className="px-6 py-4">
                          <div className="space-y-2">
                            {planData.coverages.slice(0, 5).map((addon: any, idx: number) => {
                              const isSelected = addOnSelection?.selectedAddOns[addon.internalName]?.isSelected || addon.isSelected;
                              return (
                                <div key={idx} className="flex items-center justify-center space-x-2 text-sm">
                                  {addon.available ? (
                                    <>
                                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-green-500' : 'text-gray-400'}`} />
                                      <span className={`text-left ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                        {addon.displayName}
                                      </span>
                                      {addon.amount > 0 && isSelected && (
                                        <span className="text-xs text-green-600 ml-auto">
                                          +{formatCurrency(addon.amount)}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <Minus className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                      <span className="text-muted-foreground text-left">{addon.displayName}</span>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                            {planData.coverages.length > 5 && (
                              <p className="text-xs text-muted-foreground">
                                +{planData.coverages.length - 5} more add-ons available
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Room Rent */}
                  <tr className="bg-gray-50">
                    <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-semibold">
                      Room Rent Limit
                    </td>
                    {selectedPlans.map((plan) => {
                      const roomRent = plan.planData.coverages[0]?.coveragesValue.find(
                        c => c.displayName.toLowerCase().includes('room')
                      );
                      return (
                        <td key={plan.planId} className="px-6 py-4 text-center">
                          {roomRent ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">As per plan</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Tenure */}
                  <tr>
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 font-semibold">
                      Policy Tenure
                    </td>
                    {selectedPlans.map((plan) => (
                      <td key={plan.planId} className="px-6 py-4 text-center">
                        <Badge variant="outline">1 Year</Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/quotes")}>
            ← Back to Quotes
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Select a plan above to continue with purchase
          </div>
        </div>
      </div>
    </div>
  );
}

