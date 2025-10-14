'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { QuotePlan } from '@/lib/types';
import { INSURERS, formatCurrency } from '@/lib/constants';

interface PlanCardWithSumInsuredProps {
  plans: QuotePlan[];
  insurer: string;
  onCompareToggle: (plan: QuotePlan, checked: boolean) => void;
  onBuyNow: (plan: QuotePlan) => void;
  isInComparison: (planId: number) => boolean;
  selectedPlansCount: number;
  maxComparisonPlans: number;
}

export default function PlanCardWithSumInsured({
  plans,
  insurer,
  onCompareToggle,
  onBuyNow,
  isInComparison,
  selectedPlansCount,
  maxComparisonPlans
}: PlanCardWithSumInsuredProps) {
  const [selectedSumInsured, setSelectedSumInsured] = useState<string>('');

  // Group plans by base plan name (assuming plans with same planName are variations of same plan)
  const planGroups = useMemo(() => {
    const groups: { [key: string]: QuotePlan[] } = {};
    
    // Debug: Log the first plan structure
    if (plans.length > 0) {
      console.log('Plan data structure:', plans[0]);
      console.log('Plan planData:', plans[0].planData);
    }
    
    plans.forEach(plan => {
      // Use internalName as the primary grouping key, fallback to displayName
      const planKey = plan.planData.internalName || plan.planData.displayName || plan.planData.planName || `plan-${plan.planId}`;
      if (!groups[planKey]) {
        groups[planKey] = [];
      }
      groups[planKey].push(plan);
    });

    // Sort each group by sum insured (only if sumInsured exists)
    Object.keys(groups).forEach(planKey => {
      groups[planKey].sort((a, b) => {
        const aSum = a.planData?.sumInsured || 0;
        const bSum = b.planData?.sumInsured || 0;
        return aSum - bSum;
      });
    });

    return groups;
  }, [plans]);

  // Get available sum insured options for the first plan group
  const availableSumInsuredOptions = useMemo(() => {
    const firstPlanGroup = Object.values(planGroups)[0];
    if (!firstPlanGroup) return [];
    
    return firstPlanGroup
      .filter(plan => plan.planData?.sumInsured != null)
      .map(plan => ({
        value: plan.planData.sumInsured.toString(),
        label: `${(plan.planData.sumInsured / 100000).toFixed(1)} Lakhs`
      }));
  }, [planGroups]);

  // Set default selected sum insured to the first available option
  React.useEffect(() => {
    if (availableSumInsuredOptions.length > 0 && !selectedSumInsured) {
      setSelectedSumInsured(availableSumInsuredOptions[0].value);
    }
  }, [availableSumInsuredOptions, selectedSumInsured]);

  // Get the currently selected plan based on selected sum insured
  const selectedPlan = useMemo(() => {
    if (!selectedSumInsured) return null;
    
    // Find plan with matching sum insured from any group
    for (const group of Object.values(planGroups)) {
      const plan = group.find(p => p.planData?.sumInsured?.toString() === selectedSumInsured);
      if (plan) return plan;
    }
    return null;
  }, [selectedSumInsured, planGroups]);

  const insurerInfo = INSURERS[insurer as keyof typeof INSURERS];

  // If no sum insured options available, fall back to simple plan display
  if (availableSumInsuredOptions.length === 0) {
    // Render each plan as a separate card without dropdown
    return (
      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.planId} className="hover:shadow-xl transition-all duration-300 border-l-4 overflow-hidden" 
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
                            ? `${(plan.planData.sumInsured / 100000).toFixed(1)} Lakhs Cover`
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
        ))}
      </div>
    );
  }

  // If we have multiple plan groups, render each as a separate card
  if (Object.keys(planGroups).length > 1) {
    return (
      <div className="space-y-4">
        {Object.entries(planGroups).map(([planKey, planGroup]) => {
          const filteredPlanGroup = planGroup.filter(plan => plan.planData?.sumInsured != null);
          
          if (filteredPlanGroup.length === 0) return null;

          return (
            <PlanCardWithSumInsured
              key={planKey}
              plans={filteredPlanGroup}
              insurer={insurer}
              onCompareToggle={onCompareToggle}
              onBuyNow={onBuyNow}
              isInComparison={isInComparison}
              selectedPlansCount={selectedPlansCount}
              maxComparisonPlans={maxComparisonPlans}
            />
          );
        })}
      </div>
    );
  }

  // Single plan group - show dropdown
  if (!selectedPlan) {
    return null;
  }

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
                      {selectedPlan.planData.displayName || selectedPlan.planData.planName || 'Plan Name'}
                    </h4>
                    <p className="text-xs text-muted-foreground">{insurerInfo?.name || insurer}</p>
                  </div>
                </div>
                
                {/* Sum Insured Dropdown */}
                <div className="mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Sum Insured:</span>
                    <Select value={selectedSumInsured} onValueChange={setSelectedSumInsured}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSumInsuredOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {selectedPlan.planData?.sumInsured 
                      ? `${(selectedPlan.planData.sumInsured / 100000).toFixed(1)} Lakhs Cover`
                      : 'Cover Details'
                    }
                  </Badge>
                  <Badge variant="outline">1 Year</Badge>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-3xl font-bold mb-1" style={{ color: insurerInfo?.color }}>
                  {formatCurrency(selectedPlan.payingAmount)}
                </div>
                <p className="text-sm text-muted-foreground">per year</p>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {selectedPlan.planData.coverages
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
                    id={`compare-${selectedPlan.planId}`}
                    checked={isInComparison(selectedPlan.planId)}
                    onCheckedChange={(checked) => onCompareToggle(selectedPlan, checked as boolean)}
                    disabled={!isInComparison(selectedPlan.planId) && selectedPlansCount >= maxComparisonPlans}
                  />
                  <label
                    htmlFor={`compare-${selectedPlan.planId}`}
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
                onClick={() => onBuyNow(selectedPlan)}
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
}
