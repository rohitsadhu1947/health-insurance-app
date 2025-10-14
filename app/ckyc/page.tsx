"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Upload,
  FileText,
  Camera,
  CreditCard
} from "lucide-react";
import { useHealthInsuranceStore } from "@/lib/store";
import { verifyCKYC, uploadKycDocuments, getS3PresignedUrl } from "@/lib/api/services";
import { formatCurrency, INSURERS } from "@/lib/constants";
import { toast } from "sonner";

export default function CKYCPage() {
  const router = useRouter();
  const { selectedPlan, setCkycData, setIsLoading } = useHealthInsuranceStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    gender: "M",
    idType: "PAN",
    idNumber: "",
  });
  const [ckycVerified, setCkycVerified] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  if (!selectedPlan) {
    router.push("/quotes");
    return null;
  }

  const insurer = selectedPlan.planData.companyInternalName;

  const handleCKYCVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.birthDate || !formData.idNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Format birth date to DD/MM/YYYY
      const date = new Date(formData.birthDate);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

      const ckycData = {
        birthDate: formattedDate,
        fullName: formData.fullName.toUpperCase(),
        gender: formData.gender,
        idNumber: formData.idNumber.toUpperCase(),
        idType: formData.idType,
        quotePlanId: selectedPlan.planId,
        salesChannelId: process.env.NEXT_PUBLIC_API_SALES_CHANNEL || "266",
      };

      const insurer = selectedPlan.planData.companyInternalName;
      
      toast.info("Verifying your details with CKYC...");
      const response = await verifyCKYC(insurer, ckycData);
      
      setCkycData(response);
      setCkycVerified(true);
      
      toast.success("CKYC verification successful!");
      setStep(2);
    } catch (error: any) {
      console.error("CKYC verification failed:", error);
      toast.error(error.response?.data?.message || "CKYC verification failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs = Array.from(files);
    setDocuments([...documents, ...newDocs]);
    toast.success(`${newDocs.length} document(s) added`);
  };

  const handleSubmitDocuments = async () => {
    if (documents.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setIsLoading(true);

    try {
      toast.info("Uploading documents...");

      // Get presigned URLs and upload to S3
      const uploadedDocs = [];

      for (const doc of documents) {
        // Get presigned URL
        const contentType = doc.type || 'application/pdf';
        const filename = doc.name;
        const id = process.env.NEXT_PUBLIC_API_SALES_CHANNEL || "266";
        
        const presignedUrl = await getS3PresignedURL(contentType, filename, id);
        
        // Upload to S3
        await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': contentType,
          },
          body: doc,
        });

        uploadedDocs.push({
          documentType: formData.idType,
          documentUrl: presignedUrl.split('?')[0], // Remove query params
        });
      }

      // Submit to KYC API
      const kycData = {
        birthDate: formData.birthDate,
        fullName: formData.fullName.toUpperCase(),
        idNumber: formData.idNumber.toUpperCase(),
        idType: formData.idType,
        kycDocuments: uploadedDocs,
        quotePlanId: selectedPlan.planId,
      };

      await uploadKycDocuments(insurer, kycData);
      
      toast.success("Documents uploaded successfully!");
      
      // Move to proposal
      router.push("/proposal");
    } catch (error: any) {
      console.error("Document upload failed:", error);
      toast.error(error.response?.data?.message || "Document upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = (step / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">CKYC Verification</h1>
              <p className="text-muted-foreground">Step {step} of 2 - {step === 1 ? "Verify Identity" : "Upload Documents"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
              <p className="font-semibold">{selectedPlan.planData.displayName}</p>
              <p className="text-primary font-bold">{formatCurrency(selectedPlan.payingAmount)}/year</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {step === 1 ? (
                    <Shield className="h-6 w-6 text-primary" />
                  ) : (
                    <Upload className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {step === 1 ? "Verify Your Identity" : "Upload KYC Documents"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step === 1 
                      ? "We'll verify your details with Central KYC Registry" 
                      : "Upload your identity documents for verification"
                    }
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {step === 1 ? (
                <form onSubmit={handleCKYCVerify} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name (as per ID) *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">Enter name exactly as it appears on your ID proof</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Date of Birth *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        required
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="M" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="F" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="O" id="other" />
                          <Label htmlFor="other" className="cursor-pointer">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="idType">ID Proof Type *</Label>
                      <Select
                        value={formData.idType}
                        onValueChange={(value) => setFormData({ ...formData, idType: value })}
                      >
                        <SelectTrigger className="text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAN">PAN Card</SelectItem>
                          <SelectItem value="AADHAAR">Aadhaar Card</SelectItem>
                          <SelectItem value="PASSPORT">Passport</SelectItem>
                          <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number *</Label>
                      <Input
                        id="idNumber"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value.toUpperCase() })}
                        placeholder={formData.idType === "PAN" ? "ABCDE1234F" : "Enter ID number"}
                        required
                        className="text-lg font-mono"
                        maxLength={formData.idType === "PAN" ? 10 : 20}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-900 mb-1">Secure Verification</p>
                        <p className="text-blue-700">
                          Your details will be verified with Central KYC Registry (CKYC) to complete the insurance purchase process.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full gradient-blue text-white text-lg">
                    Verify with CKYC <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">CKYC Verification Successful!</h3>
                    <p className="text-muted-foreground">Now upload your documents to proceed</p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Upload Documents *</Label>
                    
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">Click to upload documents</h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          Upload PAN Card, Aadhaar, or other ID proof
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: PDF, JPG, PNG (Max 5MB each)
                        </p>
                      </label>
                    </div>

                    {documents.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Documents ({documents.length})</Label>
                        {documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDocuments(documents.filter((_, i) => i !== idx));
                                toast.info("Document removed");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Please ensure your documents are clear and readable. Blurry or unclear documents may cause delays in policy issuance.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        setStep(1);
                        setCkycVerified(false);
                      }}
                    >
                      ← Back
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 gradient-blue text-white"
                      onClick={handleSubmitDocuments}
                      disabled={documents.length === 0}
                    >
                      Continue to Proposal <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

