"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Heart, 
  Users, 
  Baby,
  Stethoscope,
  Activity,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Award
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  const products = [
    {
      icon: Users,
      color: "blue",
      title: "Family Floater Plans",
      description: "Comprehensive coverage for your entire family under one policy",
      features: [
        "Single premium for whole family",
        "Shared sum insured",
        "Coverage for spouse, children, and parents",
        "Cost-effective solution"
      ],
      popular: true
    },
    {
      icon: Heart,
      color: "red",
      title: "Individual Health Plans",
      description: "Personalized coverage tailored to your specific health needs",
      features: [
        "Dedicated sum insured",
        "Customizable coverage",
        "No claim bonus benefits",
        "Flexible premium options"
      ],
      popular: false
    },
    {
      icon: Baby,
      color: "pink",
      title: "Maternity Cover",
      description: "Complete protection for mother and newborn during pregnancy",
      features: [
        "Pre and post-natal coverage",
        "Normal & C-section delivery",
        "Newborn baby coverage",
        "Vaccination expenses"
      ],
      popular: false
    },
    {
      icon: Stethoscope,
      color: "green",
      title: "Critical Illness Plans",
      description: "Financial support for treatment of serious health conditions",
      features: [
        "Lump sum payout on diagnosis",
        "Coverage for 30+ critical illnesses",
        "No hospitalization required",
        "Income replacement support"
      ],
      popular: false
    },
    {
      icon: Activity,
      color: "purple",
      title: "Senior Citizen Plans",
      description: "Specialized health insurance for elderly family members",
      features: [
        "Coverage up to 80+ years",
        "Pre-existing disease coverage",
        "Domiciliary treatment",
        "Health check-up benefits"
      ],
      popular: true
    },
    {
      icon: Shield,
      color: "indigo",
      title: "Top-Up Plans",
      description: "Additional coverage beyond your existing health insurance",
      features: [
        "Affordable premium",
        "High sum insured",
        "Covers deductible amount",
        "Tax benefits under 80D"
      ],
      popular: false
    }
  ];

  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-indigo-600",
      light: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200"
    },
    red: {
      bg: "from-red-500 to-rose-600",
      light: "bg-red-50",
      text: "text-red-600",
      border: "border-red-200"
    },
    pink: {
      bg: "from-pink-500 to-rose-600",
      light: "bg-pink-50",
      text: "text-pink-600",
      border: "border-pink-200"
    },
    green: {
      bg: "from-green-500 to-emerald-600",
      light: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200"
    },
    purple: {
      bg: "from-purple-500 to-violet-600",
      light: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200"
    },
    indigo: {
      bg: "from-indigo-500 to-blue-600",
      light: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            Our Products
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Choose the Right Health Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive health insurance solutions designed to protect you and your loved ones at every stage of life
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">6+</h3>
              <p className="text-sm text-gray-600">Trusted Insurers</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">20+</h3>
              <p className="text-sm text-gray-600">Health Plans</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">24/7</h3>
              <p className="text-sm text-gray-600">Support Available</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">100%</h3>
              <p className="text-sm text-gray-600">IRDAI Approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => {
            const Icon = product.icon;
            const colors = colorClasses[product.color as keyof typeof colorClasses];
            
            return (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur relative overflow-hidden group">
                {product.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                      Popular
                    </Badge>
                  </div>
                )}
                
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} opacity-10 rounded-bl-full`} />
                
                <CardHeader className="pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} mb-4 shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{product.title}</CardTitle>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle className={`h-5 w-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => router.push("/")}
                    className={`w-full bg-gradient-to-r ${colors.bg} text-white hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                  >
                    Get Quotes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Compare quotes from top insurers and find the perfect plan for your family in minutes
            </p>
            <Button 
              size="lg"
              onClick={() => router.push("/")}
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6"
            >
              Get Instant Quotes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

