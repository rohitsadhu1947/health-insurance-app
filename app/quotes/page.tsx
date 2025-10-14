"use client";

import { useEffect, useState } from "react";
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


  useEffect(() => {
    if (!currentQuote) {
      router.push("/");
      return;
    }

    // If no quotes, just set empty array (we'll show error message in UI)
    if (!currentQuote.quotePlans || currentQuote.quotePlans.length === 0) {
      setFilteredPlans([]);
      return;
    }

    // Apply filters and sorting
    let plans = [...currentQuote.quotePlans];

    // Filter by insurer
    if (filterInsurer !== "all") {
      plans = plans.filter(p => p.planData.companyInternalName === filterInsurer);
    }

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

    setFilteredPlans(plans);
  }, [currentQuote, sortBy, filterInsurer, router]);

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

  // Group plans by insurer
  const plansByInsurer = filteredPlans.reduce((acc, plan) => {
    const insurer = plan.planData.companyInternalName;
    if (!acc[insurer]) acc[insurer] = [];
    acc[insurer].push(plan);
    return acc;
  }, {} as Record<string, QuotePlan[]>);

  const uniqueInsurers = [...new Set(filteredPlans.map(p => p.planData.companyInternalName))].filter(Boolean);

  // Remove the early return - we want to show mock data when no currentQuote

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Available Plans for You
              </h1>
              <p className="text-muted-foreground mb-3">
                Found <span className="font-semibold text-primary">{filteredPlans.length} plans</span> from <span className="font-semibold text-primary">{uniqueInsurers.length}</span> insurer{uniqueInsurers.length > 1 ? 's' : ''}
              </p>
              {/* Insurer Pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {uniqueInsurers.map((ins) => (
                  <div 
                    key={ins}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 shadow-sm"
                    style={{ borderColor: INSURERS[ins as keyof typeof INSURERS]?.color || '#ccc' }}
                  >
                    {INSURERS[ins as keyof typeof INSURERS]?.logo && (
                      <img 
                        src={INSURERS[ins as keyof typeof INSURERS].logo} 
                        alt={ins}
                        className="h-4 w-4 object-contain"
                      />
                    )}
                    <span className="text-xs font-semibold" style={{ color: INSURERS[ins as keyof typeof INSURERS]?.color }}>
                      {INSURERS[ins as keyof typeof INSURERS]?.name || ins}
                    </span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {plansByInsurer[ins]?.length}
                    </Badge>
                  </div>
                ))}
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

                <div className="ml-auto">
                  <Badge variant="outline" className="text-sm">
                    {selectedPlans.length}/3 selected for comparison
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans List */}
        <div className="space-y-6">
          {filteredPlans.length === 0 && currentQuote?.companyErrorMessage && (
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
          
          {Object.entries(plansByInsurer).map(([insurer, plans]) => (
            <div key={insurer} className="space-y-4">
              {/* Insurer Header */}
              <Card className="border-2 bg-gradient-to-r from-white to-gray-50 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-lg border-2" style={{ borderColor: INSURERS[insurer as keyof typeof INSURERS]?.color || '#ccc' }}>
                        {INSURERS[insurer as keyof typeof INSURERS]?.logo ? (
                          <img 
                            src={INSURERS[insurer as keyof typeof INSURERS].logo} 
                            alt={INSURERS[insurer as keyof typeof INSURERS]?.name || insurer}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <Shield className="h-8 w-8" style={{ color: INSURERS[insurer as keyof typeof INSURERS]?.color }} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{ color: INSURERS[insurer as keyof typeof INSURERS]?.color }}>
                          {INSURERS[insurer as keyof typeof INSURERS]?.name || insurer}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-semibold text-primary">{plans.length}</span> plan{plans.length > 1 ? 's' : ''} available • 
                          Starting from <span className="font-semibold text-green-600">{formatCurrency(Math.min(...plans.map(p => p.payingAmount)))}</span>/year
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm px-4 py-2" style={{ borderColor: INSURERS[insurer as keyof typeof INSURERS]?.color, color: INSURERS[insurer as keyof typeof INSURERS]?.color }}>
                      ✓ Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <PlanCardWithSumInsured
                  plans={plans}
                  insurer={insurer}
                  onCompareToggle={handleCompareToggle}
                  onBuyNow={handleBuyNow}
                  isInComparison={isInComparison}
                  selectedPlansCount={selectedPlans.length}
                  maxComparisonPlans={3}
                />
              </div>
            </div>
          ))}
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

