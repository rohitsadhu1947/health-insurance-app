"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  Download,
  Mail,
  Phone,
  Shield,
  Calendar,
  FileText,
  ArrowRight
} from "lucide-react";
import { useHealthInsuranceStore } from "@/lib/store";
import { formatCurrency, formatNumber, INSURERS } from "@/lib/constants";

export default function SuccessPage() {
  const router = useRouter();
  const { selectedPlan, proposalId, reset } = useHealthInsuranceStore();

  useEffect(() => {
    if (!selectedPlan || !proposalId) {
      router.push("/");
    }
  }, [selectedPlan, proposalId, router]);

  if (!selectedPlan) {
    return null;
  }

  const insurer = selectedPlan.planData.companyInternalName;
  const policyNumber = `POL${Date.now().toString().slice(-8)}`; // Mock policy number

  const handleDownloadPolicy = () => {
    // In production, this would download the actual policy PDF
    window.alert("Policy document download will be available here in production");
  };

  const handleStartNew = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6 animate-bounce">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Congratulations!
            </h1>
            <p className="text-2xl text-muted-foreground mb-2">
              Your Health Insurance is Active
            </p>
            <p className="text-muted-foreground">
              Policy Number: <span className="font-mono font-semibold text-primary">{policyNumber}</span>
            </p>
          </div>

          {/* Policy Details Card */}
          <Card className="border-0 shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <Shield 
                      className="h-8 w-8" 
                      style={{ color: INSURERS[insurer as keyof typeof INSURERS]?.color }} 
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {INSURERS[insurer as keyof typeof INSURERS]?.name}
                    </p>
                    <h3 className="text-2xl font-bold">{selectedPlan.planData.displayName}</h3>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 text-base px-4 py-2">
                  ✓ Active
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Sum Insured</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatNumber(parseInt(selectedPlan.planData.coverages[0]?.sumInsured || "0"))}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Annual Premium</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedPlan.payingAmount)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Policy Tenure</p>
                  <p className="text-2xl font-bold text-primary">1 Year</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Coverage Starts</p>
                    <p className="font-semibold">
                      {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Policy Expires</p>
                    <p className="font-semibold">
                      {new Date(Date.now() + 365 * 86400000).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Button 
              size="lg" 
              className="gradient-blue text-white"
              onClick={handleDownloadPolicy}
            >
              <Download className="mr-2 h-5 w-5" />
              Download Policy Document
            </Button>
            <Button size="lg" variant="outline">
              <Mail className="mr-2 h-5 w-5" />
              Email Policy Document
            </Button>
          </div>

          {/* What's Next */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/5 to-accent/5 mb-8">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="mr-2 h-6 w-6 text-primary" />
                What's Next?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Policy Document Sent</p>
                    <p className="text-sm text-muted-foreground">
                      Check your email for the complete policy document and terms & conditions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">SMS Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an SMS with your policy number and customer care details
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Coverage Activation</p>
                    <p className="text-sm text-muted-foreground">
                      Your health insurance coverage will be active from tomorrow
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Health Card</p>
                    <p className="text-sm text-muted-foreground">
                      Your health card will be delivered to your registered address within 7-10 days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Customer Care</p>
                    <p className="font-semibold">1800-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email Support</p>
                    <p className="font-semibold">support@healthcareplus.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start New Quote */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Want to get insurance for your family members too?
            </p>
            <Button size="lg" variant="outline" onClick={handleStartNew}>
              Get Another Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

