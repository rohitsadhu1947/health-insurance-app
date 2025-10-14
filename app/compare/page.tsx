"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  X, 
  ArrowRight,
  Shield,
  Minus
} from "lucide-react";
import { useHealthInsuranceStore } from "@/lib/store";
import { formatCurrency, formatNumber, INSURERS } from "@/lib/constants";
import { toast } from "sonner";

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
  const { selectedPlans, removeFromCompare, selectPlan } = useHealthInsuranceStore();

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
          <p className="text-muted-foreground">
            Side-by-side comparison of {selectedPlans.length} selected plans
          </p>
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
                    {selectedPlans.map((plan) => (
                      <th key={plan.planId} className="px-6 py-4">
                        <Card className="p-6 text-center min-w-[280px]">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Shield 
                                className="h-5 w-5" 
                                style={{ color: INSURERS[plan.planData.companyInternalName as keyof typeof INSURERS]?.color }} 
                              />
                              <span className="text-sm font-medium">
                                {INSURERS[plan.planData.companyInternalName as keyof typeof INSURERS]?.name}
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
                          
                          <h4 className="text-lg font-bold mb-3">{plan.planData.displayName}</h4>
                          
                          <div className="text-3xl font-bold text-primary mb-1">
                            {formatCurrency(plan.payingAmount)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">per year</p>
                          
                          <Button 
                            className="w-full gradient-blue text-white"
                            onClick={() => handleBuyNow(plan)}
                          >
                            Buy Now <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Card>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Premium Row */}
                  <tr className="bg-blue-50/50">
                    <td className="sticky left-0 z-10 bg-blue-50/50 px-6 py-4 font-semibold">
                      Annual Premium
                    </td>
                    {selectedPlans.map((plan) => (
                      <td key={plan.planId} className="px-6 py-4 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(plan.payingAmount)}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Sum Insured Row */}
                  <tr>
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 font-semibold">
                      Sum Insured
                    </td>
                    {selectedPlans.map((plan) => (
                      <td key={plan.planId} className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="text-base">
                          {formatNumber(parseInt(plan.planData.coverages[0]?.sumInsured || "0"))}
                        </Badge>
                      </td>
                    ))}
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
                    {selectedPlans.map((plan) => (
                      <td key={plan.planId} className="px-6 py-4">
                        <div className="space-y-2">
                          {plan.planData.coverages[0]?.coveragesValue.slice(0, 5).map((addon, idx) => (
                            <div key={idx} className="flex items-center justify-center space-x-2 text-sm">
                              {addon.available ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <span className="text-left">{addon.displayName}</span>
                                </>
                              ) : (
                                <>
                                  <Minus className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                  <span className="text-muted-foreground text-left">{addon.displayName}</span>
                                </>
                              )}
                            </div>
                          ))}
                          {plan.planData.coverages[0]?.coveragesValue.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{plan.planData.coverages[0]?.coveragesValue.length - 5} more features
                            </p>
                          )}
                        </div>
                      </td>
                    ))}
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

