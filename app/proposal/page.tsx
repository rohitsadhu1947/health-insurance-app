"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  Shield,
  ArrowRight,
  ArrowLeft,
  User,
  Users,
  MapPin,
  Heart,
  CheckCircle
} from "lucide-react";
import { useHealthInsuranceStore } from "@/lib/store";
import { getProposalFields, sendProposalOTP, verifyOTP, createProposal } from "@/lib/api/services";
import { formatCurrency } from "@/lib/constants";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Proposer Details", icon: User },
  { id: 2, title: "Nominee Details", icon: Users },
  { id: 3, title: "Medical History", icon: Heart },
  { id: 4, title: "Address Details", icon: MapPin },
  { id: 5, title: "OTP Verification", icon: CheckCircle },
];

export default function ProposalPage() {
  const router = useRouter();
  const { selectedPlan, ckycData, setProposalId, setIsLoading, userFormData } = useHealthInsuranceStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalFields, setProposalFields] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    proposerName: ckycData?.response?.firstName || userFormData?.fullName || "",
    proposerPhone: userFormData?.phoneNumber || "",
    proposerEmail: userFormData?.email || "",
    proposerDOB: "",
    proposerGender: "M",
    
    nomineeName: "",
    nomineeRelation: "",
    nomineeAge: "",
    
    hasMedicalHistory: "No",
    medicalDetails: "",
    
    address1: ckycData?.response?.address1 || "",
    address2: ckycData?.response?.address2 || "",
    city: ckycData?.response?.city || "",
    state: ckycData?.response?.state || "",
    pincode: ckycData?.response?.pincode || userFormData?.pincode || "",
    
    otp: "",
    otpSent: false,
    otpVerified: false,
  });

  useEffect(() => {
    if (!selectedPlan) {
      router.push("/quotes");
      return;
    }

    // Load proposal fields
    loadProposalFields();
  }, [selectedPlan]);

  const loadProposalFields = async () => {
    try {
      // Get sum insured from selected plan
      const sumInsured = parseFloat(selectedPlan!.planData.coverages[0]?.sumInsured || "500000") / 100000;
      
      const fields = await getProposalFields(
        selectedPlan!.planId,
        selectedPlan!.planId,
        sumInsured,
        0,
        false,
        true
      );
      
      setProposalFields(fields);
    } catch (error) {
      console.error("Failed to load proposal fields:", error);
      toast.error("Failed to load form. Please try again.");
    }
  };

  const handleSendOTP = async () => {
    if (!formData.proposerPhone || formData.proposerPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);

    try {
      await sendProposalOTP(selectedPlan!.planId, {
        phoneNumber: formData.proposerPhone
      });

      setFormData({ ...formData, otpSent: true });
      toast.success("OTP sent successfully! Please check your phone.");
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      await verifyOTP(selectedPlan!.planId, {
        otp: formData.otp,
        phoneNumber: formData.proposerPhone
      });

      setFormData({ ...formData, otpVerified: true });
      toast.success("OTP verified successfully!");
      
      // Submit proposal
      await handleSubmitProposal();
    } catch (error: any) {
      console.error("Failed to verify OTP:", error);
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProposal = async () => {
    setIsLoading(true);

    try {
      toast.info("Submitting proposal...");

      // Prepare proposal fields
      const fields = [
        { id: "proposerName", value: formData.proposerName, parentProperty: "proposerDetails" },
        { id: "proposerPhone", value: formData.proposerPhone, parentProperty: "proposerDetails" },
        { id: "proposerEmail", value: formData.proposerEmail, parentProperty: "proposerDetails" },
        { id: "proposerGender", value: formData.proposerGender, parentProperty: "proposerDetails" },
        
        { id: "nomineeName", value: formData.nomineeName, parentProperty: "nomineeDetails" },
        { id: "nomineeRelation", value: formData.nomineeRelation, parentProperty: "nomineeDetails" },
        
        { id: "hasMedicalHistory", value: formData.hasMedicalHistory, parentProperty: "medicalDetails" },
        { id: "medicalDetails", value: formData.medicalDetails || "", parentProperty: "medicalDetails" },
        
        { id: "address1", value: formData.address1, parentProperty: "addressDetails" },
        { id: "address2", value: formData.address2 || "", parentProperty: "addressDetails" },
        { id: "city", value: formData.city, parentProperty: "addressDetails" },
        { id: "state", value: formData.state, parentProperty: "addressDetails" },
        { id: "pincode", value: formData.pincode, parentProperty: "addressDetails" },
      ];

      const proposal = await createProposal(
        selectedPlan!.planId,
        fields,
        process.env.NEXT_PUBLIC_API_SALES_CHANNEL || "266"
      );

      setProposalId(proposal.id);
      toast.success("Proposal submitted successfully!");
      
      // Navigate to payment
      router.push("/payment");
    } catch (error: any) {
      console.error("Failed to submit proposal:", error);
      toast.error(error.response?.data?.message || "Failed to submit proposal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.proposerName || !formData.proposerPhone || !formData.proposerEmail) {
        toast.error("Please fill in all proposer details");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.nomineeName || !formData.nomineeRelation) {
        toast.error("Please fill in nominee details");
        return;
      }
    } else if (currentStep === 3) {
      if (formData.hasMedicalHistory === "Yes" && !formData.medicalDetails) {
        toast.error("Please provide medical details");
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.address1 || !formData.city || !formData.state || !formData.pincode) {
        toast.error("Please fill in all address details");
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!selectedPlan) {
    return null;
  }

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Proposal Form</h1>
              <p className="text-muted-foreground">Step {currentStep} of {STEPS.length} - {STEPS[currentStep - 1].title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
              <p className="font-semibold">{selectedPlan.planData.displayName}</p>
              <p className="text-primary font-bold">{formatCurrency(selectedPlan.payingAmount)}/year</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <p className={`text-xs text-center max-w-[80px] ${
                  currentStep >= step.id ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {(() => {
                    const IconComponent = STEPS[currentStep - 1].icon;
                    return <IconComponent className="h-6 w-6 text-primary" />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-2xl">{STEPS[currentStep - 1].title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please provide accurate information
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Step 1: Proposer Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="proposerName">Full Name *</Label>
                    <Input
                      id="proposerName"
                      value={formData.proposerName}
                      onChange={(e) => setFormData({ ...formData, proposerName: e.target.value })}
                      placeholder="Enter your full name"
                      className="text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposerPhone">Phone Number *</Label>
                      <Input
                        id="proposerPhone"
                        value={formData.proposerPhone}
                        onChange={(e) => setFormData({ ...formData, proposerPhone: e.target.value })}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proposerEmail">Email Address *</Label>
                      <Input
                        id="proposerEmail"
                        type="email"
                        value={formData.proposerEmail}
                        onChange={(e) => setFormData({ ...formData, proposerEmail: e.target.value })}
                        placeholder="your@email.com"
                        className="text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposerDOB">Date of Birth</Label>
                      <Input
                        id="proposerDOB"
                        type="date"
                        value={formData.proposerDOB}
                        onChange={(e) => setFormData({ ...formData, proposerDOB: e.target.value })}
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <RadioGroup
                        value={formData.proposerGender}
                        onValueChange={(value) => setFormData({ ...formData, proposerGender: value })}
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="M" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="F" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">Female</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Nominee Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nomineeName">Nominee Name *</Label>
                    <Input
                      id="nomineeName"
                      value={formData.nomineeName}
                      onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                      placeholder="Enter nominee's full name"
                      className="text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomineeRelation">Relationship *</Label>
                      <Select
                        value={formData.nomineeRelation}
                        onValueChange={(value) => setFormData({ ...formData, nomineeRelation: value })}
                      >
                        <SelectTrigger className="text-lg">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Son">Son</SelectItem>
                          <SelectItem value="Daughter">Daughter</SelectItem>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Brother">Brother</SelectItem>
                          <SelectItem value="Sister">Sister</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomineeAge">Nominee Age</Label>
                      <Input
                        id="nomineeAge"
                        type="number"
                        value={formData.nomineeAge}
                        onChange={(e) => setFormData({ ...formData, nomineeAge: e.target.value })}
                        placeholder="Enter age"
                        className="text-lg"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> In case of unfortunate events, the sum assured will be paid to the nominee.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Medical History */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Do you have any pre-existing medical conditions? *</Label>
                    <RadioGroup
                      value={formData.hasMedicalHistory}
                      onValueChange={(value) => setFormData({ ...formData, hasMedicalHistory: value })}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="medicalNo" />
                        <Label htmlFor="medicalNo" className="cursor-pointer">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="medicalYes" />
                        <Label htmlFor="medicalYes" className="cursor-pointer">Yes</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.hasMedicalHistory === "Yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="medicalDetails">Please provide details *</Label>
                      <Textarea
                        id="medicalDetails"
                        value={formData.medicalDetails}
                        onChange={(e) => setFormData({ ...formData, medicalDetails: e.target.value })}
                        placeholder="Describe your medical condition(s) and ongoing treatment..."
                        rows={5}
                        className="text-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Please be accurate. Any misrepresentation may lead to claim rejection.
                      </p>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> Disclosure of pre-existing conditions is mandatory. Non-disclosure may lead to claim rejection or policy cancellation.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Address Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address Line 1 *</Label>
                    <Input
                      id="address1"
                      value={formData.address1}
                      onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                      placeholder="House/Flat No., Building Name"
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                      placeholder="Street, Locality"
                      className="text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Enter city"
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Enter state"
                        className="text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      className="text-lg"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: OTP Verification */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Verify Your Mobile Number</h3>
                    <p className="text-muted-foreground">We'll send an OTP to {formData.proposerPhone}</p>
                  </div>

                  <Separator />

                  {!formData.otpSent ? (
                    <Button
                      size="lg"
                      className="w-full gradient-blue text-white"
                      onClick={handleSendOTP}
                    >
                      Send OTP
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP *</Label>
                        <Input
                          id="otp"
                          value={formData.otp}
                          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="text-2xl font-mono text-center tracking-widest"
                        />
                        <p className="text-sm text-center text-muted-foreground">
                          Didn't receive OTP? <button onClick={handleSendOTP} className="text-primary font-medium">Resend</button>
                        </p>
                      </div>

                      <Button
                        size="lg"
                        className="w-full gradient-blue text-white"
                        onClick={handleVerifyOTP}
                        disabled={formData.otp.length !== 6}
                      >
                        Verify OTP & Submit Proposal
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 5 && (
                <div className="flex space-x-4 mt-8">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                  )}
                  <Button
                    size="lg"
                    className="flex-1 gradient-blue text-white"
                    onClick={handleNext}
                  >
                    Next <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

