"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock,
  MapPin,
  Send,
  CheckCircle,
  HelpCircle,
  FileText,
  Shield,
  Users,
  Headphones
} from "lucide-react";
import { toast } from "sonner";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Simulate form submission
    toast.success("Your message has been sent! We'll get back to you within 24 hours.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our support team",
      value: "+91 730 347 2500",
      link: "tel:+917303472500",
      color: "blue",
      availability: "24/7 Available"
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us your queries",
      value: "support@healthinsurance.com",
      link: "mailto:support@healthinsurance.com",
      color: "purple",
      availability: "Response in 24 hours"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our agents",
      value: "Start Chat",
      link: "#",
      color: "green",
      availability: "Mon-Sat, 9 AM - 6 PM"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our office location",
      value: "Mumbai, Maharashtra",
      link: "#",
      color: "indigo",
      availability: "Mon-Fri, 10 AM - 5 PM"
    }
  ];

  const faqs = [
    {
      question: "How do I file a claim?",
      answer: "You can file a claim by calling our 24/7 helpline, through our mobile app, or by visiting the Claims section on our website. Make sure to inform us within 24 hours of hospitalization."
    },
    {
      question: "What is the claim settlement time?",
      answer: "Cashless claims are typically pre-authorized within 2-4 hours. Reimbursement claims are settled within 7-10 working days after receiving all required documents."
    },
    {
      question: "Can I add family members to my policy?",
      answer: "Yes, you can add family members during policy renewal or purchase a new family floater policy. Contact our support team for assistance with policy modifications."
    },
    {
      question: "How do I check my policy status?",
      answer: "You can check your policy status by logging into your account on our website or mobile app. Alternatively, call our customer support with your policy number."
    },
    {
      question: "What documents are needed for claims?",
      answer: "Required documents include: claim form, hospital bills, discharge summary, prescriptions, diagnostic reports, ID proof, and bank details. Additional documents may be needed based on claim type."
    },
    {
      question: "How do I renew my policy?",
      answer: "You'll receive renewal reminders via email and SMS 30 days before expiry. You can renew online through our website, mobile app, or by contacting our support team."
    }
  ];

  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-indigo-600",
      light: "bg-blue-50",
      text: "text-blue-600"
    },
    purple: {
      bg: "from-purple-500 to-violet-600",
      light: "bg-purple-50",
      text: "text-purple-600"
    },
    green: {
      bg: "from-green-500 to-emerald-600",
      light: "bg-green-50",
      text: "text-green-600"
    },
    indigo: {
      bg: "from-indigo-500 to-blue-600",
      light: "bg-indigo-50",
      text: "text-indigo-600"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            Customer Support
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            We're Here to Help
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? Our dedicated support team is available 24/7 to assist you with any queries or concerns
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            const colors = colorClasses[method.color as keyof typeof colorClasses];
            
            return (
              <Card key={index} className="border-0 shadow-xl bg-white/90 backdrop-blur hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <a 
                    href={method.link}
                    className={`text-lg font-bold ${colors.text} hover:underline block mb-2`}
                  >
                    {method.value}
                  </a>
                  <Badge variant="secondary" className="text-xs">
                    {method.availability}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">We'll respond within 24 hours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-300"
                  size="lg"
                >
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Links & Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">24/7 Support</h3>
                <p className="text-blue-100 mb-6">
                  Our customer support team is available round the clock to assist you with any queries or emergencies.
                </p>
                <a 
                  href="tel:+917303472500"
                  className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300"
                >
                  <Phone className="h-5 w-5" />
                  <span>+91 730 347 2500</span>
                </a>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="/claims" className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-300 group">
                    <FileText className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 font-medium">File a Claim</span>
                  </a>
                  <a href="/products" className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg hover:shadow-md transition-all duration-300 group">
                    <Shield className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 font-medium">View Products</span>
                  </a>
                  <a href="/" className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:shadow-md transition-all duration-300 group">
                    <Users className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 font-medium">Get Quotes</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Business Hours</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><strong>Phone Support:</strong> 24/7</p>
                      <p><strong>Email Support:</strong> 24/7</p>
                      <p><strong>Live Chat:</strong> Mon-Sat, 9 AM - 6 PM</p>
                      <p><strong>Office:</strong> Mon-Fri, 10 AM - 5 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find quick answers to common questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-xl bg-white/90 backdrop-blur hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

