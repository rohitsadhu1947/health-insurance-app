"use client";

/**
 * ⚠️ DEMO MODE - PAYMENT PROCESSING
 * 
 * This page is currently running in DEMO mode for journey completion demonstration.
 * 
 * CURRENT BEHAVIOR:
 * - Shows payment options (Card, UPI, Net Banking)
 * - Simulates payment processing (2-second delay)
 * - No actual payment gateway integration
 * - Redirects to success page
 * - GST removed (0% GST for health insurance in India)
 * 
 * PRODUCTION TODO:
 * 1. Implement real payment gateway integration
 *    - POST /v3/proposal/HEALTH/payment
 *    - Handle payment gateway redirect URL
 * 2. Implement payment success/failure callbacks
 * 3. Handle payment status verification
 * 4. Store payment transaction details
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: ""
  });
  const [upiId, setUpiId] = useState("");

  if (!selectedPlan || !proposalId) {
    router.push("/quotes");
    return null;
  }

  const insurer = selectedPlan.planData.companyInternalName;
  // Health insurance has 0% GST in India (as of 2024)
  const totalAmount = selectedPlan.payingAmount;

  const handleInitiatePayment = () => {
    // Open payment gateway modal
    setShowPaymentGateway(true);
  };

  const handleConfirmPayment = async () => {
    // Validate payment details based on mode
    if (paymentMode === "card") {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
        toast.error("Please fill in all card details");
        return;
      }
      if (cardDetails.cardNumber.length < 16) {
        toast.error("Please enter a valid 16-digit card number");
        return;
      }
    } else if (paymentMode === "upi") {
      if (!upiId) {
        toast.error("Please enter your UPI ID");
        return;
      }
    }

    setProcessingPayment(true);

    try {
      // DEMO MODE: Simulate payment processing
      console.log('💳 Payment Demo Mode - Processing payment:', {
        proposalId,
        paymentMode,
        amount: totalAmount,
        plan: selectedPlan.planData.displayName
      });

      toast.info("Processing payment...");

      // Simulate payment gateway processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast.success("Payment successful!");
      console.log('✅ Payment Demo Mode - Payment completed successfully');
      
      // Close modal and redirect to success page
      setShowPaymentGateway(false);
      setTimeout(() => {
        router.push("/success");
      }, 500);
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
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
                      <span className="text-muted-foreground">Annual Premium</span>
                      <span className="font-semibold">{formatCurrency(selectedPlan.payingAmount)}</span>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-2">
                      <p className="text-xs text-green-700 flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Health insurance has 0% GST in India</span>
                      </p>
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
                    onClick={handleInitiatePayment}
                    disabled={processingPayment}
                  >
                    Proceed to Payment
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

      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Gateway Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="h-6 w-6" />
                  <div>
                    <h2 className="text-xl font-bold">Secure Payment Gateway</h2>
                    <p className="text-sm text-blue-100">Powered by SecurePay™</p>
                  </div>
                </div>
                <button
                  onClick={() => !processingPayment && setShowPaymentGateway(false)}
                  className="text-white hover:text-blue-100 transition-colors"
                  disabled={processingPayment}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm">Amount to Pay:</span>
                <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="border-b">
              <div className="flex">
                {PAYMENT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPaymentMode(mode.id)}
                    disabled={processingPayment}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      paymentMode === mode.id
                        ? 'border-b-2 border-primary text-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <mode.icon className="h-4 w-4" />
                      <span>{mode.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Forms */}
            <div className="p-6">
              {/* Card Payment Form */}
              {paymentMode === "card" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCardDetails({ ...cardDetails, cardNumber: value });
                      }}
                      maxLength={16}
                      disabled={processingPayment}
                      className="text-lg font-mono"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="Name as on card"
                      value={cardDetails.cardName}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value.toUpperCase() })}
                      disabled={processingPayment}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiryMonth">Expiry Month</Label>
                      <Input
                        id="expiryMonth"
                        placeholder="MM"
                        value={cardDetails.expiryMonth}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                          if (parseInt(value) <= 12 || value === '') {
                            setCardDetails({ ...cardDetails, expiryMonth: value });
                          }
                        }}
                        maxLength={2}
                        disabled={processingPayment}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryYear">Expiry Year</Label>
                      <Input
                        id="expiryYear"
                        placeholder="YY"
                        value={cardDetails.expiryYear}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                          setCardDetails({ ...cardDetails, expiryYear: value });
                        }}
                        maxLength={2}
                        disabled={processingPayment}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                          setCardDetails({ ...cardDetails, cvv: value });
                        }}
                        maxLength={3}
                        disabled={processingPayment}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                    <p className="font-semibold mb-1">🔒 Demo Mode - For Testing Only</p>
                    <p>Enter any 16-digit number. No real payment will be processed.</p>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentMode === "upi" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      disabled={processingPayment}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">Popular UPI Apps:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                        <button
                          key={app}
                          disabled={processingPayment}
                          className="p-2 bg-white rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                    <p className="font-semibold mb-1">🔒 Demo Mode - For Testing Only</p>
                    <p>Enter any UPI ID. No real payment will be processed.</p>
                  </div>
                </div>
              )}

              {/* Net Banking Form */}
              {paymentMode === "netbanking" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bank">Select Your Bank</Label>
                    <select
                      id="bank"
                      disabled={processingPayment}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-2">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select your bank</li>
                      <li>You'll be redirected to your bank's website</li>
                      <li>Login with your internet banking credentials</li>
                      <li>Authorize the payment</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                    <p className="font-semibold mb-1">🔒 Demo Mode - For Testing Only</p>
                    <p>No actual bank redirect will occur. Payment simulation only.</p>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="mt-6 space-y-3">
                <Button
                  size="lg"
                  className="w-full gradient-blue text-white text-lg"
                  onClick={handleConfirmPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Lock className="h-5 w-5" />
                      <span>Pay {formatCurrency(totalAmount)}</span>
                    </div>
                  )}
                </Button>

                <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>256-bit SSL</span>
                  </div>
                  <div>•</div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

