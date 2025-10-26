"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock,
  Phone,
  Mail,
  AlertCircle,
  Download,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

export default function ClaimsPage() {
  const claimSteps = [
    {
      icon: Phone,
      title: "Inform Us",
      description: "Call our 24/7 helpline or notify us through the app within 24 hours of hospitalization",
      color: "blue"
    },
    {
      icon: FileText,
      title: "Submit Documents",
      description: "Upload required documents like discharge summary, bills, and prescriptions",
      color: "indigo"
    },
    {
      icon: CheckCircle,
      title: "Verification",
      description: "Our team will verify your documents and process your claim within 7-10 working days",
      color: "green"
    },
    {
      icon: TrendingUp,
      title: "Settlement",
      description: "Approved amount will be transferred directly to your bank account",
      color: "purple"
    }
  ];

  const claimTypes = [
    {
      title: "Cashless Claims",
      description: "Get treatment at network hospitals without paying upfront",
      icon: Shield,
      features: [
        "No upfront payment required",
        "Direct settlement with hospital",
        "Available at 10,000+ network hospitals",
        "Pre-authorization within 2-4 hours"
      ]
    },
    {
      title: "Reimbursement Claims",
      description: "Get reimbursed for treatments at non-network hospitals",
      icon: FileText,
      features: [
        "Treatment at any hospital",
        "Submit bills after discharge",
        "Settlement within 7-10 days",
        "Easy online submission"
      ]
    }
  ];

  const requiredDocuments = [
    "Duly filled claim form",
    "Original hospital bills and receipts",
    "Discharge summary from hospital",
    "Prescription and diagnostic reports",
    "Photo ID proof (Aadhaar/PAN)",
    "Bank account details",
    "FIR copy (for accident cases)",
    "Death certificate (for death claims)"
  ];

  const colorClasses = {
    blue: "from-blue-500 to-indigo-600",
    indigo: "from-indigo-500 to-purple-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-violet-600"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            Claims Process
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            File Your Claim Easily
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, transparent, and hassle-free claim settlement process. We're here to support you when you need it most.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">95%</h3>
              <p className="text-sm text-gray-600">Claim Settlement Ratio</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">7-10</h3>
              <p className="text-sm text-gray-600">Days Settlement Time</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">10K+</h3>
              <p className="text-sm text-gray-600">Network Hospitals</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">24/7</h3>
              <p className="text-sm text-gray-600">Claim Support</p>
            </CardContent>
          </Card>
        </div>

        {/* Claim Process Steps */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">How to File a Claim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {claimSteps.map((step, index) => {
              const Icon = step.icon;
              const gradient = colorClasses[step.color as keyof typeof colorClasses];
              
              return (
                <Card key={index} className="border-0 shadow-xl bg-white/90 backdrop-blur relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full`} />
                  
                  <CardContent className="p-6 text-center relative">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Claim Types */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Types of Claims</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {claimTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card key={index} className="border-0 shadow-xl bg-white/90 backdrop-blur hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{type.title}</CardTitle>
                    <p className="text-gray-600">{type.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {type.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Required Documents */}
        <div className="mb-12">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Required Documents</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Keep these documents ready for smooth claim processing</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Download className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Call Us</h3>
              <p className="text-blue-100 mb-4">Speak with our claims specialist</p>
              <a href="tel:+917303472500" className="text-2xl font-bold hover:underline">
                +91 730 347 2500
              </a>
              <p className="text-sm text-blue-100 mt-2">Available 24/7</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <CardContent className="p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Email Us</h3>
              <p className="text-purple-100 mb-4">Send us your claim documents</p>
              <a href="mailto:claims@healthinsurance.com" className="text-xl font-bold hover:underline">
                claims@healthinsurance.com
              </a>
              <p className="text-sm text-purple-100 mt-2">Response within 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Important Note */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Inform us within 24 hours of hospitalization for cashless claims</li>
                  <li>• Submit reimbursement claims within 30 days of discharge</li>
                  <li>• Keep all original bills and documents safe</li>
                  <li>• Pre-authorization is mandatory for planned hospitalizations</li>
                  <li>• Claim settlement time may vary based on document completeness</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

