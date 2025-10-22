"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, Users, TrendingUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useHealthInsuranceStore } from '@/lib/store';
import { toast } from 'sonner';
import { createQuote, verifyPincode, pollForQuotes } from '@/lib/api/services';
import { FetchingQuotesOverlay } from '@/components/FetchingQuotesOverlay';
import { SUM_INSURED_OPTIONS } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const { setUserFormData, setCurrentQuote } = useHealthInsuranceStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    pincode: '',
    email: '',
    selfDOB: '',
    spouseDOB: '',
    fatherDOB: '',
    motherDOB: '',
    son: 0,
    daughter: 0,
    sumInsured: ['500000'], // Default: 5L only
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if at least one family member is selected
    const hasFamilyMember = formData.selfDOB || formData.spouseDOB || formData.fatherDOB || formData.motherDOB;
    if (!hasFamilyMember) {
      toast.error('Please select at least one family member to insure');
      return;
    }

    // Sum insured is now defaulted to 5L, no need to validate selection

    try {
      setIsLoading(true);
      
      // Save form data to store
      setUserFormData(formData);
      
      // Show success message
      toast.success('Form submitted successfully! Fetching quotes...');
      
      // Create quote using real API
      // Verify pincode (but don't block if it fails)
      try {
        const pincodeInfo = await verifyPincode(formData.pincode);
        if (!pincodeInfo.pincode.isInputValid) {
          toast.warning('This pincode may have limited coverage.');
        }
      } catch (error: any) {
        // Don't block - proceed to get quotes anyway
      }

      // Convert date from YYYY-MM-DD to DD/MM/YYYY
      const formatDate = (date: string) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
      };

      // Build fieldData array for production API format
      const fieldData = [
        { id: 'fullName', parentProperty: 'basicDetails', value: formData.fullName },
        { id: 'phoneNumber', parentProperty: 'basicDetails', value: formData.phoneNumber },
        { id: 'emailAddress', parentProperty: 'basicDetails', value: formData.email },
        { id: 'pincode', parentProperty: 'communicationAddress', value: formData.pincode },
        { id: 'gender', parentProperty: 'proposerDetails', value: 'male' }, // Default
        { id: 'isIndian', parentProperty: 'proposerDetails', value: 'Yes' },
        
        // Self
        { id: 'self', parentProperty: 'proposerDetails', value: formData.selfDOB ? 'Yes' : '' },
        ...(formData.selfDOB ? [{ id: 'dOBSelf', parentProperty: 'proposerDetails', value: formatDate(formData.selfDOB) }] : []),
        
        // Spouse
        { id: 'spouse', parentProperty: 'insuredMember1', value: formData.spouseDOB ? 'Yes' : '' },
        ...(formData.spouseDOB ? [{ id: 'dOBSpouse', parentProperty: 'insuredMember1', value: formatDate(formData.spouseDOB) }] : []),
        
        // Father
        { id: 'father', parentProperty: 'insuredMember2', value: formData.fatherDOB ? 'Yes' : '' },
        ...(formData.fatherDOB ? [{ id: 'dOBFather', parentProperty: 'insuredMember2', value: formatDate(formData.fatherDOB) }] : []),
        
        // Mother
        { id: 'mother', parentProperty: 'insuredMember3', value: formData.motherDOB ? 'Yes' : '' },
        ...(formData.motherDOB ? [{ id: 'dOBMother', parentProperty: 'insuredMember3', value: formatDate(formData.motherDOB) }] : []),
        
        // Son/Daughter counters
        { id: 'son', parentProperty: 'insuredMember4', value: formData.son > 0 ? 'Yes' : '' },
        { id: 'sonCounter', parentProperty: 'insuredCount', value: formData.son || 0 },
        { id: 'daughter', parentProperty: 'insuredMember5', value: formData.daughter > 0 ? 'Yes' : '' },
        { id: 'daughterCounter', parentProperty: 'insuredCount', value: formData.daughter || 0 },
      ];
      
      // Log the fieldData being sent for debugging
      console.log('📤 Main form fieldData:', JSON.stringify(fieldData, null, 2));
      
      // Create quote and get initial response
      const initialQuote = await createQuote(fieldData);
      console.log('📥 Main form initialQuote:', JSON.stringify(initialQuote, null, 2));
      setCurrentQuote(initialQuote);
      
      // Navigate to quotes page
      router.push('/quotes');
      
      // Start polling for updates in the background
      if (initialQuote.id) {
        let previousPlanCount = initialQuote.quotePlans?.length || 0;
        
        pollForQuotes(
          initialQuote.id,
          (updatedQuote) => {
            // Only update if the number of plans has changed (to avoid unnecessary re-renders)
            const newPlanCount = updatedQuote.quotePlans?.length || 0;
            if (newPlanCount !== previousPlanCount) {
              setCurrentQuote(updatedQuote);
              previousPlanCount = newPlanCount;
            }
          },
          20, // Max 20 attempts (1 minute total)
          3000 // Poll every 3 seconds
        ).then((finalQuote) => {
          // Final update to ensure we have the latest data
          setCurrentQuote(finalQuote);
          const quoteCount = finalQuote.quotePlans?.length || 0;
          if (quoteCount > 0) {
            toast.success(`Received ${quoteCount} quote${quoteCount > 1 ? 's' : ''}!`);
          }
        }).catch((error) => {
          console.error('Polling error:', error);
        });
      }
      
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-10 w-10 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SecureHealth
                </span>
                <p className="text-xs text-gray-500 font-medium">Trusted by 10M+ Indians</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition font-medium text-sm">Products</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition font-medium text-sm">Claims</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition font-medium text-sm">Support</a>
              <div className="flex items-center space-x-3 ml-4">
                <span className="text-sm text-gray-600">📞 1800-123-4567</span>
                <Button variant="outline" size="sm" className="font-medium">Login</Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-semibold border border-blue-200/50">
              <span className="text-lg mr-2">✨</span> Compare 20+ Plans from Top Insurers
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Find the Perfect{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Health Insurance
              </span>{' '}
              for Your Family
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Compare quotes from <span className="font-semibold text-gray-900">6 trusted insurers</span>, get instant CKYC verification, and buy 100% online in minutes. 
              <span className="text-blue-600 font-medium"> No paperwork, no hassle.</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="group flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">100% Secure</span>
                  <span className="text-xs text-gray-500">IRDAI Approved</span>
                </div>
              </div>
              <div className="group flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">6 Top Insurers</span>
                  <span className="text-xs text-gray-500">Best Plans</span>
                </div>
              </div>
              <div className="group flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Best Prices</span>
                  <span className="text-xs text-gray-500">Instant Quotes</span>
                </div>
              </div>
              <div className="group flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="p-2 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">24/7 Support</span>
                  <span className="text-xs text-gray-500">Always Here</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-bl-full" />
            <CardContent className="p-8 relative">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Get Instant Quotes</h3>
                <p className="text-sm text-gray-500 mt-1">Fill in your details to compare plans</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="10-digit mobile"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-sm font-semibold text-gray-700">Pincode *</Label>
                    <Input
                      id="pincode"
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="6-digit pincode"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30 p-5 rounded-xl border border-gray-100">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center">
                    Who do you want to insure? *
                    <span className="ml-2 text-xs text-gray-500 font-normal">(Select at least one)</span>
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="self"
                        checked={!!formData.selfDOB}
                        onCheckedChange={(checked) => {
                          setFormData({ 
                            ...formData, 
                            selfDOB: checked ? (formData.selfDOB || '1990-01-01') : '' 
                          });
                        }}
                      />
                      <Label htmlFor="self" className="min-w-[60px]">Self</Label>
                      {formData.selfDOB && (
                        <Input
                          type="date"
                          value={formData.selfDOB}
                          onChange={(e) => setFormData({ ...formData, selfDOB: e.target.value })}
                          className="flex-1"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="spouse"
                        checked={!!formData.spouseDOB}
                        onCheckedChange={(checked) => {
                          setFormData({ 
                            ...formData, 
                            spouseDOB: checked ? (formData.spouseDOB || '1990-01-01') : '' 
                          });
                        }}
                      />
                      <Label htmlFor="spouse" className="min-w-[60px]">Spouse</Label>
                      {formData.spouseDOB && (
                        <Input
                          type="date"
                          value={formData.spouseDOB}
                          onChange={(e) => setFormData({ ...formData, spouseDOB: e.target.value })}
                          className="flex-1"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="father"
                        checked={!!formData.fatherDOB}
                        onCheckedChange={(checked) => {
                          setFormData({ 
                            ...formData, 
                            fatherDOB: checked ? (formData.fatherDOB || '1960-01-01') : '' 
                          });
                        }}
                      />
                      <Label htmlFor="father" className="min-w-[60px]">Father</Label>
                      {formData.fatherDOB && (
                        <Input
                          type="date"
                          value={formData.fatherDOB}
                          onChange={(e) => setFormData({ ...formData, fatherDOB: e.target.value })}
                          className="flex-1"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="mother"
                        checked={!!formData.motherDOB}
                        onCheckedChange={(checked) => {
                          setFormData({ 
                            ...formData, 
                            motherDOB: checked ? (formData.motherDOB || '1960-01-01') : '' 
                          });
                        }}
                      />
                      <Label htmlFor="mother" className="min-w-[60px]">Mother</Label>
                      {formData.motherDOB && (
                        <Input
                          type="date"
                          value={formData.motherDOB}
                          onChange={(e) => setFormData({ ...formData, motherDOB: e.target.value })}
                          className="flex-1"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Sum Insured Selection - Hidden for now, defaulting to 5L */}
                <div className="space-y-3 bg-gradient-to-br from-gray-50 to-purple-50/30 p-5 rounded-xl border border-gray-100">
                  <Label className="text-sm font-semibold text-gray-800">
                    Default Coverage Amount: ₹5 Lakh
                  </Label>
                  <p className="text-xs text-gray-500">
                    💡 You can change the coverage amount on the quotes page
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Getting Quotes...
                      </>
                    ) : (
                      <>
                        Get Free Quotes 
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>

                <p className="text-xs text-center text-gray-500">
                  <span className="inline-flex items-center">
                    🔒 100% Secure • By clicking, you agree to our 
                    <a href="#" className="text-blue-600 hover:underline ml-1">Terms & Privacy Policy</a>
                  </span>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 relative z-10">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Trusted Partner Insurers</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center justify-center h-16">
              <span className="text-2xl font-bold text-gray-400">Care Health</span>
            </div>
            <div className="flex items-center justify-center h-16">
              <span className="text-2xl font-bold text-gray-400">Digit</span>
            </div>
            <div className="flex items-center justify-center h-16">
              <span className="text-2xl font-bold text-gray-400">Niva Bupa</span>
            </div>
            <div className="flex items-center justify-center h-16">
              <span className="text-2xl font-bold text-gray-400">ICICI Lombard</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Loading Overlay */}
      {isLoading && <FetchingQuotesOverlay />}
    </div>
  );
}