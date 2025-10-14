"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Shield,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
  Lock
} from "lucide-react";
import { useHealthInsuranceStore } from "@/lib/store";
import { processPayment } from "@/lib/api/services";
import { formatCurrency, formatNumber, INSURERS } from "@/lib/constants";
import { toast } from "sonner";

const PAYMENT_MODES = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, Rupay" },
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
  { id: "netbanking", label: "Net Banking", icon: Building2, desc: "All major banks supported" },
];

export default function PaymentPage() {
  const router = useRouter();
  const { selectedPlan, proposalId, setIsLoading } = useHealthInsuranceStore();
  
  const [paymentMode, setPaymentMode] = useState("card");
  const [processingPayment, setProcessingPayment] = useState(false);

  if (!selectedPlan || !proposalId) {
    router.push("/quotes");
    return null;
  }

  const insurer = selectedPlan.planData.companyInternalName;
  const gst = selectedPlan.payingAmount * 0.18; // 18% GST
  const totalAmount = selectedPlan.payingAmount + gst;

  const handlePayment = async () => {
    setProcessingPayment(true);
    setIsLoading(true);

    try {
      toast.info("Processing payment...");

      const paymentData = {
        proposalId: proposalId.toString(),
        paymentData: {
          modes: [
            {
              details: {
                paymentMode: paymentMode,
              },
              selected: "Yes",
              displayName: "Payment Gateway",
              internalName: "FORM",
            },
          ],
        },
      };

      const response = await processPayment(paymentData);
      
      if (response.status === "PAYMENT_REDIRECTION" && response.paymentData?.modes[0]?.details?.formUrl) {
        toast.success("Redirecting to payment gateway...");
        
        // In production, redirect to payment gateway
        // window.location.href = response.paymentData.modes[0].details.formUrl;
        
        // For demo purposes, simulate successful payment
        setTimeout(() => {
          toast.success("Payment successful!");
          router.push("/success");
        }, 2000);
      } else {
        toast.success("Payment processed successfully!");
        router.push("/success");
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast.error(error.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-muted-foreground">
              You're one step away from getting insured!
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Options */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-xl">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <span>Select Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup value={paymentMode} onValueChange={setPaymentMode} className="space-y-4">
                    {PAYMENT_MODES.map((mode) => (
                      <div
                        key={mode.id}
                        className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMode === mode.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMode(mode.id)}
                      >
                        <RadioGroupItem value={mode.id} id={mode.id} />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted">
                            <mode.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <Label htmlFor={mode.id} className="text-base font-semibold cursor-pointer">
                              {mode.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{mode.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-900 mb-1">100% Secure Payment</p>
                        <p className="text-green-700">
                          Your payment information is encrypted and secure. We never store your card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">What happens after payment?</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Instant policy issuance</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Policy document sent to your email</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>SMS confirmation with policy number</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Coverage starts from the next day</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl sticky top-24">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Plan Details */}
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield 
                        className="h-8 w-8" 
                        style={{ color: INSURERS[insurer as keyof typeof INSURERS]?.color }} 
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {INSURERS[insurer as keyof typeof INSURERS]?.name}
                        </p>
                        <p className="font-semibold">{selectedPlan.planData.displayName}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sum Insured</span>
                        <Badge variant="secondary">
                          {formatNumber(parseInt(selectedPlan.planData.coverages[0]?.sumInsured || "0"))}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Policy Tenure</span>
                        <Badge variant="outline">1 Year</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Proposal ID</span>
                        <span className="font-mono text-xs">#{proposalId}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Base Premium</span>
                      <span className="font-semibold">{formatCurrency(selectedPlan.payingAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span className="font-semibold">{formatCurrency(gst)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full gradient-blue text-white"
                    onClick={handlePayment}
                    disabled={processingPayment}
                  >
                    {processingPayment ? "Processing..." : `Pay ${formatCurrency(totalAmount)}`}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By proceeding, you agree to our Terms & Conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

