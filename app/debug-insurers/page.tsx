"use client";

import { useState } from 'react';
import { createQuote, getQuote, pollForQuotes } from '@/lib/api/services';
import { QuoteField } from '@/lib/types';

interface InsurerTestResult {
  insurer: string;
  status: 'pending' | 'success' | 'error';
  quotes: any[];
  error?: string;
  responseTime: number;
}

export default function DebugInsurersPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<InsurerTestResult[]>([]);
  const [testData, setTestData] = useState({
    fullName: 'Test User',
    phoneNumber: '9876543210',
    email: 'test@example.com',
    pincode: '400001',
    selfDOB: '1990-01-01',
    sumInsured: '500000',
    tenure: '1_year'
  });

  const insurersToTest = [
    'RELIANCE',
    'CARE', 
    'NIVA_BUPA',
    'DIGIT',
    'ICICI_LOMBARD',
    'RELIGARE'
  ];

  const testSingleQuote = async (): Promise<InsurerTestResult[]> => {
    const startTime = Date.now();
    
    try {
      console.log('Testing all insurers with single quote request...');
      
      // Create field data for the quote
      const fieldData: QuoteField[] = [
        { internalName: 'fullName', value: testData.fullName },
        { internalName: 'phoneNumber', value: testData.phoneNumber },
        { internalName: 'email', value: testData.email },
        { internalName: 'pincode', value: testData.pincode },
        { internalName: 'selfDOB', value: testData.selfDOB },
        { internalName: 'sumInsured', value: testData.sumInsured },
        { internalName: 'tenure', value: testData.tenure },
        { internalName: 'familyMembers', value: JSON.stringify([{ name: 'Self', dob: testData.selfDOB }]) }
      ];

      // Create initial quote
      const initialQuote = await createQuote(fieldData);
      console.log('Initial quote created:', initialQuote.id);

      // Poll for quotes with longer timeout to get all insurers
      const finalQuote = await pollForQuotes(
        initialQuote.id,
        (quote) => {
          console.log('Polling update:', {
            totalPlans: quote.quotePlans?.length || 0,
            insurers: quote.quotePlans?.map(p => p.planData.companyInternalName) || [],
            uniqueInsurers: [...new Set(quote.quotePlans?.map(p => p.planData.companyInternalName) || [])]
          });
        },
        20, // Max 20 attempts
        3000 // 3 second intervals
      );

      const responseTime = Date.now() - startTime;
      
      // Group quotes by insurer
      const quotesByInsurer: Record<string, any[]> = {};
      finalQuote.quotePlans?.forEach(plan => {
        const insurer = plan.planData.companyInternalName;
        if (!quotesByInsurer[insurer]) {
          quotesByInsurer[insurer] = [];
        }
        quotesByInsurer[insurer].push(plan);
      });

      console.log('Final result:', {
        totalPlans: finalQuote.quotePlans?.length || 0,
        insurersWithQuotes: Object.keys(quotesByInsurer),
        quotesByInsurer: Object.entries(quotesByInsurer).map(([insurer, quotes]) => ({
          insurer,
          count: quotes.length,
          plans: quotes.map(p => ({
            planName: p.planData.planName,
            premium: p.payingAmount,
            sumInsured: p.planData.sumInsured
          }))
        }))
      });

      // Create results for all insurers
      return insurersToTest.map(insurer => {
        const insurerQuotes = quotesByInsurer[insurer] || [];
        return {
          insurer,
          status: 'success' as const,
          quotes: insurerQuotes,
          responseTime
        };
      });

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('Error:', error);
      
      return insurersToTest.map(insurer => ({
        insurer,
        status: 'error' as const,
        quotes: [],
        error: error.message || 'Unknown error',
        responseTime
      }));
    }
  };

  const testAllInsurers = async () => {
    setTesting(true);
    setResults([]);

    // Initialize results
    const initialResults = insurersToTest.map(insurer => ({
      insurer,
      status: 'pending' as const,
      quotes: [],
      responseTime: 0
    }));
    setResults(initialResults);

    // Test all insurers with a single quote request
    const results = await testSingleQuote();
    setResults(results);

    setTesting(false);
  };

  const testSpecificInsurer = async (insurer: string) => {
    setTesting(true);
    
    // Update only this insurer's result
    setResults(prev => {
      const existing = prev.find(r => r.insurer === insurer);
      if (existing) {
        return prev.map(r => 
          r.insurer === insurer 
            ? { ...r, status: 'pending' as const }
            : r
        );
      } else {
        return [...prev, {
          insurer,
          status: 'pending' as const,
          quotes: [],
          responseTime: 0
        }];
      }
    });

    // Test all insurers with a single quote request, then filter for the specific insurer
    const allResults = await testSingleQuote();
    const result = allResults.find(r => r.insurer === insurer) || {
      insurer,
      status: 'error' as const,
      quotes: [],
      error: 'Insurer not found in results',
      responseTime: 0
    };
    
    setResults(prev => prev.map(r => 
      r.insurer === insurer ? result : r
    ));
    
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🐛 Insurer Debug Tool
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={testData.pincode}
                  onChange={(e) => setTestData(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sum Insured
                </label>
                <select
                  value={testData.sumInsured}
                  onChange={(e) => setTestData(prev => ({ ...prev, sumInsured: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="300000">₹3 Lakh</option>
                  <option value="500000">₹5 Lakh</option>
                  <option value="1000000">₹10 Lakh</option>
                  <option value="1500000">₹15 Lakh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age (DOB)
                </label>
                <input
                  type="date"
                  value={testData.selfDOB}
                  onChange={(e) => setTestData(prev => ({ ...prev, selfDOB: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenure
                </label>
                <select
                  value={testData.tenure}
                  onChange={(e) => setTestData(prev => ({ ...prev, tenure: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1_year">1 Year</option>
                  <option value="2_year">2 Years</option>
                  <option value="3_year">3 Years</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={testAllInsurers}
                disabled={testing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? 'Testing...' : 'Test All Insurers (Single Quote)'}
              </button>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The API tests all insurers simultaneously with one quote request. 
                Individual insurer buttons will run the same test but show results for that specific insurer.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {insurersToTest.map(insurer => (
                <button
                  key={insurer}
                  onClick={() => testSpecificInsurer(insurer)}
                  disabled={testing}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test {insurer}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            
            {results.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No tests run yet. Click "Test All Insurers" or test individual insurers above.
              </div>
            )}

            {results.map((result) => (
              <div
                key={result.insurer}
                className={`border rounded-lg p-4 ${
                  result.status === 'success' ? 'border-green-200 bg-green-50' :
                  result.status === 'error' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.insurer}</h3>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' :
                      result.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status === 'success' ? '✅ Success' :
                       result.status === 'error' ? '❌ Error' :
                       '⏳ Testing...'}
                    </span>
                    {result.responseTime > 0 && (
                      <span className="text-sm text-gray-600">
                        {result.responseTime}ms
                      </span>
                    )}
                  </div>
                </div>

                {result.status === 'error' && (
                  <div className="mb-3">
                    <p className="text-red-600 font-medium">Error:</p>
                    <p className="text-red-600 text-sm">{result.error}</p>
                  </div>
                )}

                {result.status === 'success' && (
                  <div>
                    <p className="text-green-600 font-medium mb-2">
                      Found {result.quotes.length} quote(s)
                    </p>
                    
                    {result.quotes.length > 0 ? (
                      <div className="space-y-2">
                        {result.quotes.map((quote, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Plan:</span>
                                <p className="text-gray-600">{quote.planData.planName}</p>
                              </div>
                              <div>
                                <span className="font-medium">Premium:</span>
                                <p className="text-gray-600">₹{quote.payingAmount?.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="font-medium">Sum Insured:</span>
                                <p className="text-gray-600">₹{quote.planData.sumInsured?.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-yellow-600">No quotes returned from this insurer</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
