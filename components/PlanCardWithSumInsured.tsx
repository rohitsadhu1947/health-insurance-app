import React, { useState, useMemo, useEffect } from 'react';
import { QuotePlan } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { formatCurrency, INSURERS } from '@/lib/constants';

interface PlanCardWithSumInsuredProps {
  plans: QuotePlan[];
  insurer: string;
  onCompareToggle: (plan: QuotePlan, checked: boolean) => void;
  onBuyNow: (plan: QuotePlan) => void;
  isInComparison: (planId: number) => boolean;
  selectedPlansCount: number;
  maxComparisonPlans: number;
}

const PlanCardWithSumInsured: React.FC<PlanCardWithSumInsuredProps> = ({
  plans,
  insurer,
  onCompareToggle,
  onBuyNow,
  isInComparison,
  selectedPlansCount,
  maxComparisonPlans
}) => {
  const insurerInfo = INSURERS[insurer as keyof typeof INSURERS];

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        // Check if this plan has amountDetail with multiple sum insured options
        const hasMultipleSumInsured = plan.amountDetail && plan.amountDetail.length > 1;
        
        if (hasMultipleSumInsured) {
          // Render plan with sum insured dropdown
          return (
            <PlanCardWithDropdown
              key={plan.planId}
              plan={plan}
              insurerInfo={insurerInfo}
              insurer={insurer}
              onCompareToggle={onCompareToggle}
              onBuyNow={onBuyNow}
              isInComparison={isInComparison}
              selectedPlansCount={selectedPlansCount}
              maxComparisonPlans={maxComparisonPlans}
            />
          );
        } else {
          // Render simple plan card
          return (
            <SimplePlanCard
              key={plan.planId}
              plan={plan}
              insurerInfo={insurerInfo}
              insurer={insurer}
              onCompareToggle={onCompareToggle}
              onBuyNow={onBuyNow}
              isInComparison={isInComparison}
              selectedPlansCount={selectedPlansCount}
              maxComparisonPlans={maxComparisonPlans}
            />
          );
        }
      })}
    </div>
  );
};

// Component for plans WITH sum insured dropdown (using amountDetail)
const PlanCardWithDropdown: React.FC<{
  plan: QuotePlan;
  insurerInfo: any;
  insurer: string;
  onCompareToggle: (plan: QuotePlan, checked: boolean) => void;
  onBuyNow: (plan: QuotePlan) => void;
  isInComparison: (planId: number) => boolean;
  selectedPlansCount: number;
  maxComparisonPlans: number;
}> = ({ plan, insurerInfo, insurer, onCompareToggle, onBuyNow, isInComparison, selectedPlansCount, maxComparisonPlans }) => {
  const [selectedSumInsuredIndex, setSelectedSumInsuredIndex] = useState(0);

  const sumInsuredOptions = useMemo(() => {
    if (!plan.amountDetail || plan.amountDetail.length === 0) return [];
    
    // Debug: Log the amountDetail structure to understand what makes entries different
    console.log('🔍 AmountDetail for plan:', plan.planData?.displayName, plan.amountDetail);
    console.log('🔍 Original plan.payingAmount:', plan.payingAmount);
    
    // Check if the premiums in amountDetail make sense (not too high)
    const hasValidPremiums = plan.amountDetail.some(detail => {
      const premium = typeof detail.premiumAnnually === 'string' ? parseFloat(detail.premiumAnnually) : detail.premiumAnnually;
      const sumInsured = detail.sumInsured;
      // Premium should be reasonable (less than 10% of sum insured)
      return premium && premium < (sumInsured * 0.1);
    });
    
    // If premiums don't make sense, don't use amountDetail
    if (!hasValidPremiums) {
      console.log('⚠️ Invalid premiums in amountDetail, falling back to original plan data');
      return [];
    }
    
    // Show ALL variations instead of deduplicating
    // Each entry might be a different plan type/variation for the same sum insured
    return plan.amountDetail.map((detail, index) => {
      const premium = typeof detail.premiumAnnually === 'string' ? parseFloat(detail.premiumAnnually) : detail.premiumAnnually;
      
      // Create a unique label that shows the difference
      let label = `₹${(detail.sumInsured / 10).toFixed(0)} Lakh${detail.sumInsured >= 100 ? ' (₹1 Cr)' : ''}`;
      
      // Add plan variation indicator if there are multiple entries for same sum insured
      const sameSumInsuredCount = plan.amountDetail.filter(d => d.sumInsured === detail.sumInsured).length;
      if (sameSumInsuredCount > 1) {
        const variationIndex = plan.amountDetail.filter(d => d.sumInsured === detail.sumInsured).indexOf(detail) + 1;
        label += ` - Plan ${variationIndex}`;
      }
      
      return {
        index,
        value: `${detail.sumInsured}_${index}`, // Make value unique
        label,
        premium,
        originalIndex: index
      };
    }).sort((a, b) => {
      // Sort by sum insured first, then by premium
      const aSum = parseInt(a.value.split('_')[0]);
      const bSum = parseInt(b.value.split('_')[0]);
      if (aSum !== bSum) return aSum - bSum;
      return a.premium - b.premium;
    });
  }, [plan.amountDetail, plan.payingAmount]);

  const selectedOption = sumInsuredOptions[selectedSumInsuredIndex];
  const selectedDetail = plan.amountDetail?.[selectedOption?.originalIndex || 0];
  const selectedPremium = selectedDetail?.premiumAnnually || plan.payingAmount;
  
  // Fallback: If no amountDetail options, use original plan data
  const shouldShowOriginalPlan = sumInsuredOptions.length === 0;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 overflow-hidden" 
          style={{ borderLeftColor: insurerInfo?.color || '#ccc' }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 border flex-shrink-0">
                    {insurerInfo?.logo ? (
                      <img 
                        src={insurerInfo.logo} 
                        alt={insurerInfo.name || insurer}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <Shield className="h-6 w-6" style={{ color: insurerInfo?.color }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-1">
                      {plan.planData.displayName || plan.planData.planName || 'Plan Name'}
                    </h4>
                    <p className="text-xs text-muted-foreground">{insurerInfo?.name || insurer}</p>
                  </div>
                </div>
                
                {/* Sum Insured Dropdown - only show if we have valid amountDetail options */}
                {!shouldShowOriginalPlan && sumInsuredOptions.length > 1 && (
                  <div className="mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">Sum Insured:</span>
                      <Select 
                        value={selectedSumInsuredIndex.toString()} 
                        onValueChange={(value) => setSelectedSumInsuredIndex(parseInt(value))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sumInsuredOptions.map((option, index) => (
                            <SelectItem key={option.value} value={index.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-gray-500">₹{option.premium?.toLocaleString()}/year</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {shouldShowOriginalPlan 
                      ? `₹${(plan.planData?.sumInsured || 0) / 100000} Lakh Cover`
                      : (selectedDetail?.sumInsured 
                          ? `₹${(selectedDetail.sumInsured / 10).toFixed(0)} Lakh Cover`
                          : 'Cover Details'
                        )
                    }
                  </Badge>
                  <Badge variant="outline">1 Year</Badge>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-3xl font-bold mb-1" style={{ color: insurerInfo?.color }}>
                  {formatCurrency(shouldShowOriginalPlan ? plan.payingAmount : (typeof selectedPremium === 'string' ? parseFloat(selectedPremium) : selectedPremium))}
                </div>
                <p className="text-sm text-muted-foreground">per year</p>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {selectedDetail?.coverages
                ?.filter(c => c.isSelected && c.displayName)
                .slice(0, 4)
                .map((coverage, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{coverage.displayName}</span>
                  </div>
                ))}
              {(!selectedDetail?.coverages || selectedDetail.coverages.length === 0) && 
                plan.planData.coverages
                  ?.filter(c => c.isSelected && c.displayName)
                  .slice(0, 4)
                  .map((coverage, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{coverage.displayName}</span>
                    </div>
                  ))
              }
            </div>

            <Separator className="my-4" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`compare-${plan.planId}`}
                    checked={isInComparison(plan.planId)}
                    onCheckedChange={(checked) => onCompareToggle(plan, checked as boolean)}
                    disabled={!isInComparison(plan.planId) && selectedPlansCount >= maxComparisonPlans}
                  />
                  <label
                    htmlFor={`compare-${plan.planId}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Add to Compare
                  </label>
                </div>

                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>

              <Button 
                size="lg" 
                onClick={() => onBuyNow(plan)}
                className="gradient-blue text-white"
              >
                Buy Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for simple plans WITHOUT sum insured dropdown
const SimplePlanCard: React.FC<{
  plan: QuotePlan;
  insurerInfo: any;
  insurer: string;
  onCompareToggle: (plan: QuotePlan, checked: boolean) => void;
  onBuyNow: (plan: QuotePlan) => void;
  isInComparison: (planId: number) => boolean;
  selectedPlansCount: number;
  maxComparisonPlans: number;
}> = ({ plan, insurerInfo, insurer, onCompareToggle, onBuyNow, isInComparison, selectedPlansCount, maxComparisonPlans }) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 overflow-hidden" 
          style={{ borderLeftColor: insurerInfo?.color || '#ccc' }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 border flex-shrink-0">
                    {insurerInfo?.logo ? (
                      <img 
                        src={insurerInfo.logo} 
                        alt={insurerInfo.name || insurer}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <Shield className="h-6 w-6" style={{ color: insurerInfo?.color }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-1">
                      {plan.planData.displayName || plan.planData.planName || 'Plan Name'}
                    </h4>
                    <p className="text-xs text-muted-foreground">{insurerInfo?.name || insurer}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {plan.planData?.sumInsured 
                      ? `₹${(plan.planData.sumInsured / 10).toFixed(0)} Lakh Cover`
                      : 'Cover Details'
                    }
                  </Badge>
                  <Badge variant="outline">1 Year</Badge>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-3xl font-bold mb-1" style={{ color: insurerInfo?.color }}>
                  {formatCurrency(plan.payingAmount)}
                </div>
                <p className="text-sm text-muted-foreground">per year</p>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {plan.planData.coverages
                ?.filter(c => c.isSelected && c.displayName)
                .slice(0, 4)
                .map((coverage, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{coverage.displayName}</span>
                  </div>
                ))}
            </div>

            <Separator className="my-4" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`compare-${plan.planId}`}
                    checked={isInComparison(plan.planId)}
                    onCheckedChange={(checked) => onCompareToggle(plan, checked as boolean)}
                    disabled={!isInComparison(plan.planId) && selectedPlansCount >= maxComparisonPlans}
                  />
                  <label
                    htmlFor={`compare-${plan.planId}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Add to Compare
                  </label>
                </div>

                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>

              <Button 
                size="lg" 
                onClick={() => onBuyNow(plan)}
                className="gradient-blue text-white"
              >
                Buy Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCardWithSumInsured;
