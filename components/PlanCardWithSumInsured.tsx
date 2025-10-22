import React, { useState } from 'react';
import { QuotePlan } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CheckCircle, ArrowRight, Shield, Star, Info, Plus, Eye, Calendar, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { formatCurrency, INSURERS } from '@/lib/constants';
import PlanDetailsModal from './PlanDetailsModal';

interface PlanCardWithSumInsuredProps {
  plans: QuotePlan[];
  insurer: string;
  selectedSumInsured: string; // The sum insured selected from parent dropdown
  onCompareToggle: (plan: QuotePlan, checked: boolean) => void;
  onBuyNow: (plan: QuotePlan) => void;
  isInComparison: (planId: number) => boolean;
  selectedPlansCount: number;
  maxComparisonPlans: number;
}

const PlanCardWithSumInsured: React.FC<PlanCardWithSumInsuredProps> = ({
  plans,
  insurer,
  selectedSumInsured,
  onCompareToggle,
  onBuyNow,
  isInComparison,
  selectedPlansCount,
  maxComparisonPlans
}) => {
  const insurerInfo = INSURERS[insurer as keyof typeof INSURERS];
  const [planAddOnStates, setPlanAddOnStates] = useState<Record<number, { showAddOns: boolean; selectedAddOns: Record<string, boolean> }>>({});

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        // Check if this plan has amountDetail with multiple sum insured options
        const hasAmountDetail = plan.amountDetail && plan.amountDetail.length > 0;
        
        // Find the matching sum insured detail from amountDetail array
        let displayPremium = plan.payingAmount;
        let displaySumInsured = plan.planData?.sumInsured || 0;
        let displayCoverages = plan.planData?.coverages || [];
        
        // Get plan name with fallbacks
        const planName = plan.planData?.displayName || 
                        plan.planData?.planName || 
                        plan.planData?.internalName || 
                        'Health Plan';
        
        // Get available add-ons for current sum insured
        // Show all available add-ons regardless of amount (some have null amount but are still available)
        const availableAddOns = displayCoverages?.filter((coverage: any) => 
          coverage.available && coverage.displayName && coverage.internalName
        ) || [];
        
        // Get current plan state
        const currentPlanState = planAddOnStates[plan.planId] || { showAddOns: false, selectedAddOns: {} };
        
        // Calculate total add-on amount including selected options
        const totalAddOnAmount = availableAddOns.reduce((sum: number, addon: any) => {
          // Ensure selectedAddOns exists and has the addon
          if (!currentPlanState.selectedAddOns || !currentPlanState.selectedAddOns[addon.internalName]) {
            return sum;
          }
          
          // If add-on has direct amount, use it
          if (addon.amount && addon.amount > 0) {
            return sum + addon.amount;
          }
          
          // If add-on has options, calculate based on selected option
          if (addon.value && Array.isArray(addon.value) && addon.value.length > 0) {
            // For now, use the default selected option or first option
            const selectedOption = addon.value.find((opt: any) => opt.defaultSelected) || addon.value[0];
            
            // Calculate estimated pricing if not provided
            const optionAmount = selectedOption.amount || 
              (() => {
                const numericValue = parseFloat(selectedOption.displayName);
                if (!isNaN(numericValue)) {
                  return Math.round(numericValue * 0.12); // 12% of coverage amount
                }
                return 0;
              })();
            
            return sum + optionAmount;
          }
          
          return sum;
        }, 0);
        
        const finalPremium = displayPremium + totalAddOnAmount;
        
        let isExactMatch = false;
        
        if (hasAmountDetail) {
          // Convert selectedSumInsured (in rupees) to lakhs for comparison
          const selectedInLakhs = parseInt(selectedSumInsured) / 100000;
          
          // First try to find exact match
          const matchingDetail = plan.amountDetail.find(
            detail => Math.abs(detail.sumInsured - selectedInLakhs) < 0.01
          );
          
          if (matchingDetail) {
            // Exact match found
            isExactMatch = true;
            displayPremium = Number(matchingDetail.premiumAnnually) || plan.payingAmount;
            displaySumInsured = matchingDetail.sumInsured >= 100000 ? matchingDetail.sumInsured : matchingDetail.sumInsured * 100000;
            displayCoverages = matchingDetail.coverages || plan.planData?.coverages || [];
          } else {
            // No exact match - find the closest available option (prefer higher coverage)
            const sortedDetails = [...plan.amountDetail].sort((a, b) => a.sumInsured - b.sumInsured);
            
            // Find the closest option that's >= selected (if available), otherwise pick the closest smaller one
            const closestDetail = sortedDetails.find(d => d.sumInsured >= selectedInLakhs) || sortedDetails[sortedDetails.length - 1];
            
            if (closestDetail) {
              displayPremium = Number(closestDetail.premiumAnnually) || plan.payingAmount;
              displaySumInsured = closestDetail.sumInsured >= 100000 ? closestDetail.sumInsured : closestDetail.sumInsured * 100000;
              displayCoverages = closestDetail.coverages || plan.planData?.coverages || [];
              
              console.log('📊 Using closest available sum insured:', {
                planName: plan.planData?.displayName,
                requestedLakhs: selectedInLakhs,
                usingLakhs: closestDetail.sumInsured,
                premium: displayPremium
              });
            }
          }
        }
        
        return (
          <SimplePlanCard
            key={plan.planId}
            plan={plan}
            displayPremium={displayPremium}
            displaySumInsured={displaySumInsured}
            displayCoverages={displayCoverages}
            insurerInfo={insurerInfo}
            insurer={insurer}
            onCompareToggle={onCompareToggle}
            onBuyNow={onBuyNow}
            isInComparison={isInComparison}
            selectedPlansCount={selectedPlansCount}
            maxComparisonPlans={maxComparisonPlans}
            availableAddOns={availableAddOns}
            finalPremium={finalPremium}
            totalAddOnAmount={totalAddOnAmount}
            currentPlanState={currentPlanState}
            setPlanAddOnStates={setPlanAddOnStates}
            isExactMatch={isExactMatch}
            selectedSumInsured={selectedSumInsured}
          />
        );
      })}
    </div>
  );
};

// Component for rendering plan cards with selected sum insured
const SimplePlanCard: React.FC<{
  plan: QuotePlan;
  displayPremium: number;
  displaySumInsured: number;
  displayCoverages: any[];
  insurerInfo: any;
  insurer: string;
  onCompareToggle: (plan: QuotePlan, checked: boolean) => void;
  onBuyNow: (plan: QuotePlan) => void;
  isInComparison: (planId: number) => boolean;
  selectedPlansCount: number;
  maxComparisonPlans: number;
  availableAddOns: any[];
  finalPremium: number;
  totalAddOnAmount: number;
  currentPlanState: { showAddOns: boolean; selectedAddOns: Record<string, boolean> };
  setPlanAddOnStates: React.Dispatch<React.SetStateAction<Record<number, { showAddOns: boolean; selectedAddOns: Record<string, boolean> }>>>;
  isExactMatch: boolean;
  selectedSumInsured: string;
}> = ({ 
  plan, 
  displayPremium, 
  displaySumInsured, 
  displayCoverages, 
  insurerInfo, 
  insurer, 
  onCompareToggle, 
  onBuyNow, 
  isInComparison, 
  selectedPlansCount, 
  maxComparisonPlans,
  availableAddOns,
  finalPremium,
  totalAddOnAmount,
  currentPlanState,
  setPlanAddOnStates,
  isExactMatch,
  selectedSumInsured
}) => {
  
  // Use the passed props
  const { showAddOns, selectedAddOns } = currentPlanState;
  const hasMultipleSumInsuredOptions = plan.amountDetail && plan.amountDetail.length > 1;
  const hasAddOns = availableAddOns.length > 0;
  
  // Add-on toggle handlers
  const toggleAddOns = () => {
    setPlanAddOnStates(prev => ({
      ...prev,
      [plan.planId]: {
        ...prev[plan.planId],
        showAddOns: !showAddOns
      }
    }));
  };
  
  const toggleAddOn = (internalName: string) => {
    setPlanAddOnStates(prev => ({
      ...prev,
      [plan.planId]: {
        ...prev[plan.planId],
        selectedAddOns: {
          ...prev[plan.planId]?.selectedAddOns,
          [internalName]: !(selectedAddOns && selectedAddOns[internalName])
        }
      }
    }));
  };

  return (
    <Card className="relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group border-0 shadow-lg hover:-translate-y-1">
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Trust indicator badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full text-xs font-medium">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span>Trusted</span>
        </div>
      </div>
      
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-md border border-blue-100 flex-shrink-0">
                    {insurerInfo?.logo ? (
                      <img 
                        src={insurerInfo.logo} 
                        alt={insurerInfo.name || insurer}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <Shield className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-0.5">
                          {(() => {
                            const fullName = insurerInfo?.name || insurer || 'Insurance Provider';
                            return fullName
                              .replace(/ Health Insurance$/i, '')
                              .replace(/ Insurance$/i, '')
                              .replace(/ General$/i, '')
                              .replace(/ Life$/i, '');
                          })()}
                    </h4>
                        <h5 className="text-lg font-bold text-gray-900 mb-1">
                          {plan.planData?.displayName || plan.planData?.planName || plan.planData?.internalName || 'Health Plan'}
                        </h5>
                        
                        {/* Compact rating and features */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-0.5 rounded-md">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-semibold text-yellow-700">4.2</span>
                            <span className="text-xs text-gray-400">(2.1k)</span>
                          </div>
                          {hasMultipleSumInsuredOptions && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors cursor-pointer flex items-center space-x-1">
                                  <Plus className="h-3 w-3" />
                                  <span className="font-medium">{plan.amountDetail.length} Options</span>
                                  <Info className="h-3 w-3" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3" align="start">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Available Sum Insured Options:</h4>
                                  <div className="grid gap-1.5">
                                    {plan.amountDetail.map((detail, idx) => {
                                      const isCurrentlyShown = Math.abs(detail.sumInsured - (displaySumInsured >= 100000 ? displaySumInsured / 100000 : displaySumInsured)) < 0.01;
                                      return (
                                        <div 
                                          key={idx} 
                                          className={`flex items-center justify-between p-2 rounded-md text-xs ${
                                            isCurrentlyShown ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex items-center space-x-2">
                                            {isCurrentlyShown && <CheckCircle className="h-3 w-3 text-blue-600" />}
                                            <span className="font-medium text-gray-700">
                                              ₹{detail.sumInsured}L Cover
                                            </span>
                                          </div>
                                          <span className="font-semibold text-gray-900">
                                            {formatCurrency(detail.premiumAnnually)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-2 pt-2 border-t">
                                    Click on a sum insured option above to see its details
                                  </p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                        {/* Compact coverage badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <div className="flex items-center space-x-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            <Shield className="h-3 w-3 text-blue-600" />
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-blue-800">
                                {displaySumInsured > 0 ? `₹${displaySumInsured >= 100000 ? (displaySumInsured / 100000).toFixed(0) : displaySumInsured}L Cover` : 'Coverage'}
                              </span>
                              {!isExactMatch && displaySumInsured > 0 && (
                                <span className="text-[10px] text-orange-600 font-medium">
                                  Closest to ₹{parseInt(selectedSumInsured) / 100000}L
                                </span>
                              )}
                            </div>
                          </div>
                  <div className="flex items-center space-x-1.5 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                    <Calendar className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-800">1Y</span>
                  </div>
                          {selectedAddOns && Object.keys(selectedAddOns).filter(key => selectedAddOns[key]).length > 0 && (
                            <div className="flex items-center space-x-1.5 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                              <Plus className="h-3 w-3 text-purple-600" />
                              <span className="text-xs font-semibold text-purple-800">
                                {Object.keys(selectedAddOns).filter(key => selectedAddOns[key]).length} Add-on{Object.keys(selectedAddOns).filter(key => selectedAddOns[key]).length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                </div>
              </div>

              {/* Compact pricing section */}
              <div className="text-right ml-4">
                <div className="text-2xl font-bold mb-0.5 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {formatCurrency(finalPremium)}
                </div>
                <p className="text-xs text-gray-500">per year</p>
                {totalAddOnAmount > 0 && (
                  <div className="text-xs text-green-600 font-semibold">
                    +{formatCurrency(totalAddOnAmount)} add-ons
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  ₹{Math.round(finalPremium/12)}/mo
                </div>
              </div>
            </div>

            {/* Add-ons Section */}
            {availableAddOns.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 mb-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-xs font-semibold text-gray-700 flex items-center">
                    <Plus className="h-3 w-3 text-blue-500 mr-1" />
                    Add-ons ({availableAddOns.length} available)
                  </h6>
                  <button
                    onClick={toggleAddOns}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <span>{showAddOns ? 'Hide' : 'Show'} Add-ons</span>
                    {showAddOns ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
                
                {showAddOns && (
                  <div className="space-y-2">
                    {availableAddOns.slice(0, 5).map((addon: any, idx: number) => {
                      const hasOptions = addon.value && Array.isArray(addon.value) && addon.value.length > 0;
                      const isSelected = selectedAddOns && selectedAddOns[addon.internalName] || false;
                      
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center space-x-2 p-2 bg-white/70 rounded-md border border-white/50">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleAddOn(addon.internalName)}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div className="flex-1">
                              <span className="text-xs text-gray-700 font-medium">{addon.displayName}</span>
                              {addon.amount && addon.amount > 0 ? (
                                <span className="text-xs text-green-600 font-semibold ml-2">
                                  +{formatCurrency(addon.amount)}
                                </span>
                              ) : hasOptions ? (
                                <span className="text-xs text-blue-600 font-semibold ml-2">
                                  {addon.value.length} Options
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500 font-medium ml-2">
                                  Included
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Show options when add-on is selected and has variants */}
                          {isSelected && hasOptions && (
                            <div className="ml-6 space-y-1">
                              <div className="text-xs text-gray-500 mb-1">Choose option:</div>
                              {addon.value.map((option: any, optIdx: number) => {
                                const isDefault = option.defaultSelected;
                                const optionKey = `${addon.internalName}_${option.internalName}`;
                                
                                return (
                                  <div key={optIdx} className="flex items-center space-x-2 p-1.5 bg-blue-50/50 rounded border border-blue-100 hover:bg-blue-50 cursor-pointer transition-colors">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3 h-3 rounded-full border-2 ${isDefault ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                                        {isDefault && <div className="w-1 h-1 bg-white rounded-full mx-auto mt-0.5"></div>}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-xs text-gray-600">{option.displayName}</span>
                                      {(() => {
                                        // Calculate estimated pricing based on option value
                                        const estimatedAmount = option.amount || 
                                          (() => {
                                            // For numeric options, estimate pricing
                                            const numericValue = parseFloat(option.displayName);
                                            if (!isNaN(numericValue)) {
                                              // Estimate: 10-15% of the coverage amount as premium
                                              return Math.round(numericValue * 0.12);
                                            }
                                            return 0;
                                          })();
                                        
                                        if (estimatedAmount > 0) {
                                          return (
                                            <span className="text-xs text-green-600 font-semibold ml-2">
                                              +{formatCurrency(estimatedAmount)}
                                              {!option.amount && <span className="text-xs text-gray-400">*</span>}
                                            </span>
                                          );
                                        } else {
                                          return (
                                            <span className="text-xs text-gray-500 ml-2">Free</span>
                                          );
                                        }
                                      })()}
                                    </div>
                                    {isDefault && (
                                      <span className="text-xs text-blue-600 font-medium">Selected</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {availableAddOns.length > 5 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{availableAddOns.length - 5} more add-ons available in details
                      </div>
                    )}
                    
                    {/* Pricing note */}
                    <div className="text-xs text-gray-400 text-center py-1 border-t border-gray-100 mt-2">
                      * Estimated pricing - final premium may vary
                    </div>
                  </div>
                )}
                
                {selectedAddOns && Object.keys(selectedAddOns).filter(key => selectedAddOns[key]).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                      Selected add-ons: +{formatCurrency(totalAddOnAmount)}
                    </div>
                  </div>
                )}
            </div>
            )}

            {/* Compact Action Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                  <Checkbox
                    id={`compare-${plan.planId}`}
                    checked={isInComparison(plan.planId)}
                    onCheckedChange={(checked) => onCompareToggle(plan, checked as boolean)}
                    disabled={!isInComparison(plan.planId) && selectedPlansCount >= maxComparisonPlans}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor={`compare-${plan.planId}`}
                      className="text-xs text-gray-700 font-medium cursor-pointer"
                    >
                      Compare
                    </label>
                  </div>

                  <PlanDetailsModal
                    plan={plan}
                    displayPremium={finalPremium}
                    displaySumInsured={displaySumInsured}
                    displayCoverages={displayCoverages}
                    insurerInfo={insurerInfo}
                    insurer={insurer}
                    onBuyNow={onBuyNow}
                  >
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 border-gray-300 text-gray-700 text-xs px-2 py-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </PlanDetailsModal>
                </div>

                {/* Compact CTA Button */}
                <div className="text-right">
                  <Button
                    size="sm"
                    onClick={() => {
                      // Update the plan with the final premium including add-ons
                      const planWithAddOns = {
                        ...plan,
                        payingAmount: finalPremium,
                        selectedAddOns: selectedAddOns,
                        totalAddOnAmount: totalAddOnAmount
                      };
                      onBuyNow(planWithAddOns);
                    }}
                    className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold hover:scale-105"
                  >
                    <Shield className="mr-1 h-4 w-4" />
                    Buy Now
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Secure • Instant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCardWithSumInsured;
