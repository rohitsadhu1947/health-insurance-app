import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Heart,
  CheckCircle, 
  XCircle,
  Info,
  Star,
  Award,
  Clock,
  DollarSign,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { QuotePlan, Coverage, AddOnSelection } from '@/lib/types';
import { formatCurrency, formatNumber, INSURERS } from '@/lib/constants';
import { useHealthInsuranceStore } from '@/lib/store';
import { toast } from 'sonner';

interface PlanDetailsModalProps {
  plan: QuotePlan;
  displayPremium: number;
  displaySumInsured: number;
  displayCoverages: Coverage[];
  insurerInfo: any;
  insurer: string;
  onBuyNow: (plan: QuotePlan) => void;
  children: React.ReactNode;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  plan,
  displayPremium,
  displaySumInsured,
  displayCoverages,
  insurerInfo,
  insurer,
  onBuyNow,
  children
}) => {
  const [selectedSumInsured, setSelectedSumInsured] = useState(displaySumInsured);
  const { currentQuote } = useHealthInsuranceStore();

  // Find the amount detail for the selected sum insured
  // Convert selectedSumInsured (in rupees) to lakhs for comparison with API data
  const selectedSumInsuredInLakhs = selectedSumInsured / 100000;
  const currentAmountDetail = plan.amountDetail?.find(
    detail => detail.sumInsured === selectedSumInsuredInLakhs
  );
  
  // Debug logging
  console.log('🔍 PlanDetailsModal Debug:', {
    planId: plan.planId,
    planName: plan.planData?.displayName,
    selectedSumInsured,
    selectedSumInsuredInLakhs,
    amountDetailLength: plan.amountDetail?.length,
    currentAmountDetail: currentAmountDetail ? 'Found' : 'Not found',
    coveragesLength: currentAmountDetail?.coverages?.length || 0,
    coverages: currentAmountDetail?.coverages?.map(c => ({
      internalName: c.internalName,
      displayName: c.displayName,
      amount: c.amount,
      isSelected: c.isSelected
    }))
  });


  const handleSumInsuredChange = (newSumInsured: number) => {
    setSelectedSumInsured(newSumInsured);
  };

  // Extract all available sum insured options
  const availableSumInsuredOptions = plan.amountDetail?.map(detail => ({
    value: detail.sumInsured * 100000, // Convert lakhs to rupees for internal use
    label: `₹${detail.sumInsured} Lakh`,
    premium: Number(detail.premiumAnnually)
  })) || [{ value: displaySumInsured, label: `₹${(displaySumInsured / 100000).toFixed(0)} Lakh`, premium: displayPremium }];

  const finalPremium = currentAmountDetail ? Number(currentAmountDetail.premiumAnnually) : displayPremium;

  const renderKeyFeatures = () => {
    // Extract actual plan data from API response
    const planData = plan.planData;
    const details = planData?.details;
    
    const keyFeatures = [
      { 
        icon: Shield, 
        title: "Sum Insured", 
        value: `₹${(selectedSumInsured / 100000).toFixed(0)} Lakh` 
      },
      { 
        icon: Clock, 
        title: "PED Waiting Period", 
        value: details?.mainBenefits?.find((b: any) => b.internalName === 'PEDwaitingPeriod')?.value || "3 years" 
      },
      { 
        icon: Users, 
        title: "Room Rent", 
        value: details?.mainBenefits?.find((b: any) => b.internalName === 'roomRentLimit')?.value || "No sub-limits" 
      },
      { 
        icon: Heart, 
        title: "Co-pay", 
        value: details?.mainBenefits?.find((b: any) => b.internalName === 'coPay')?.value || "No co-pay" 
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-4">
        {keyFeatures.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <feature.icon className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">{feature.title}</div>
              <div className="text-sm text-gray-600">{feature.value}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBenefits = () => {
    // Extract actual benefits from plan data
    const planData = plan.planData;
    const details = planData?.details;
    const mainBenefits = details?.mainBenefits || [];
    const additionalBenefits = details?.additionalBenefits || [];
    
    // Combine main and additional benefits
    const allBenefits = [
      ...mainBenefits.map((benefit: any) => benefit.displayName + ": " + benefit.value),
      ...additionalBenefits.filter((benefit: any) => benefit.value === "Yes").map((benefit: any) => benefit.displayName)
    ];

    // If no benefits found, show generic ones
    const benefits = allBenefits.length > 0 ? allBenefits : [
      "Cashless treatment at 10000+ hospitals",
      "Pre & post hospitalization coverage", 
      "Day care procedures covered",
      "No claim bonus up to 100%",
      "Restoration benefit available",
      "Maternity coverage included",
      "New born baby cover for 90 days",
      "Annual health check-up",
      "Ambulance charges covered",
      "Alternative treatment covered"
    ];

    return (
      <div className="space-y-3">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{benefit}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderExclusions = () => {
    // Extract actual exclusions from plan data
    const planData = plan.planData;
    const details = planData?.details;
    const exclusionsData = details?.exclusions || [];
    
    // Parse exclusions from API response
    let exclusions = [];
    if (exclusionsData.length > 0) {
      // Split the exclusions text by periods or newlines
      const exclusionsText = exclusionsData[0]?.value || "";
      exclusions = exclusionsText
        .split(/[.\n]/)
        .map(ex => ex.trim())
        .filter(ex => ex.length > 10) // Filter out very short fragments
        .slice(0, 10); // Limit to 10 exclusions
    }
    
    // If no exclusions found, show generic ones
    if (exclusions.length === 0) {
      exclusions = [
        "Cosmetic surgery unless medically necessary",
        "HIV/AIDS treatment",
        "War and nuclear risks", 
        "Suicide or self-inflicted injuries",
        "Alcohol or drug abuse related treatment",
        "Preventive vaccinations",
        "Hormone replacement therapy",
        "Weight reduction surgery",
        "Dental treatment (except due to accident)",
        "Eye glasses and contact lenses"
      ];
    }

    return (
      <div className="space-y-3">
        {exclusions.map((exclusion, index) => (
          <div key={index} className="flex items-start space-x-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{exclusion}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderInsurerInfo = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-lg border-2" style={{ borderColor: insurerInfo?.color || '#ccc' }}>
            {insurerInfo?.logo ? (
              <img 
                src={insurerInfo.logo} 
                alt={insurerInfo.name || insurer}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <Shield className="h-8 w-8" style={{ color: insurerInfo?.color }} />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: insurerInfo?.color }}>
              {insurerInfo?.name || insurer}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">4.2/5 Customer Rating</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">IRDAI Approved</span>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Trusted Partner</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>24/7 Customer Support: 1800-123-4567</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>support@{insurer.toLowerCase()}.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>Available in 500+ cities</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Plan Details - {plan.planData.displayName || plan.planData.planName}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
            <TabsTrigger value="insurer">Insurer Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Plan Summary</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: insurerInfo?.color }}>
                      {formatCurrency(finalPremium)}
                    </div>
                    <div className="text-sm text-gray-600">per year</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderKeyFeatures()}
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Coverage Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Sum Insured:</span>
                      <span className="font-medium">₹{(selectedSumInsured / 100000).toFixed(0)} Lakh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Premium:</span>
                      <span className="font-medium">{formatCurrency(currentAmountDetail ? Number(currentAmountDetail.premiumAnnually) : displayPremium)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Premium:</span>
                      <span className="text-blue-600">{formatCurrency(finalPremium)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sum Insured Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableSumInsuredOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSumInsuredChange(option.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSumInsured === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-gray-600">{formatCurrency(option.premium)}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>What's Covered</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderBenefits()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>What's Not Covered</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderExclusions()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addons" className="space-y-6">
            {currentAmountDetail?.coverages && currentAmountDetail.coverages.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Add-ons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentAmountDetail.coverages
                        .filter((coverage: any) => coverage.available && coverage.displayName && coverage.internalName)
                        .map((addon: any, idx: number) => {
                          const hasOptions = addon.value && Array.isArray(addon.value) && addon.value.length > 0;
                          
                          return (
                            <div key={idx} className="space-y-2">
                              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{addon.displayName}</h4>
                                  {addon.amount && addon.amount > 0 ? (
                                    <p className="text-sm text-green-600 font-semibold">+{formatCurrency(addon.amount)}</p>
                                  ) : hasOptions ? (
                                    <p className="text-sm text-blue-600 font-medium">{addon.value.length} Options Available</p>
                                  ) : (
                                    <p className="text-sm text-gray-500">Included in Plan</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Show detailed options */}
                              {hasOptions && (
                                <div className="ml-4 space-y-1">
                                  {addon.value.map((option: any, optIdx: number) => (
                                    <div key={optIdx} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                                      <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full border-2 ${option.defaultSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                                          {option.defaultSelected && <div className="w-1 h-1 bg-white rounded-full mx-auto mt-0.5"></div>}
                                        </div>
                                        <span className="text-sm text-gray-700">{option.displayName}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {(() => {
                                          // Calculate estimated pricing based on option value
                                          const estimatedAmount = option.amount || 
                                            (() => {
                                              const numericValue = parseFloat(option.displayName);
                                              if (!isNaN(numericValue)) {
                                                return Math.round(numericValue * 0.12); // 12% of coverage amount
                                              }
                                              return 0;
                                            })();
                                          
                                          if (estimatedAmount > 0) {
                                            return (
                                              <span className="text-sm text-green-600 font-semibold">
                                                +{formatCurrency(estimatedAmount)}
                                                {!option.amount && <span className="text-xs text-gray-400 ml-1">*</span>}
                                              </span>
                                            );
                                          } else {
                                            return (
                                              <span className="text-sm text-gray-500">Free</span>
                                            );
                                          }
                                        })()}
                                        {option.defaultSelected && (
                                          <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded">Default</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Add-ons are now customizable directly on the plan cards in the main quotes view.
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Info className="h-4 w-4 text-gray-600" />
                          <p className="text-xs text-gray-600">
                            <strong>Pricing Note:</strong> Add-ons marked with * show estimated pricing. Final premium may vary based on actual insurer calculations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Add-ons Available</h3>
                  <p className="text-gray-600 mb-4">This plan doesn't offer customizable add-ons for the selected sum insured amount.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insurer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {insurerInfo?.name || insurer}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderInsurerInfo()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" size="lg">
            Download Brochure <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            onClick={() => onBuyNow(plan)}
            className="gradient-blue text-white"
          >
            Buy Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanDetailsModal;
