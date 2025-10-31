import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { endpoint, data, method = 'POST', token } = await request.json();
    
    console.log('\n=== 📤 PROXY REQUEST ===');
    console.log('Endpoint:', endpoint);
    console.log('Method:', method);
    console.log('Has Token:', !!token);
    
    // Check for required environment variables and clean them up
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error('❌ Missing NEXT_PUBLIC_API_BASE_URL environment variable');
      return NextResponse.json(
        { error: 'Server configuration error: Missing API base URL' },
        { status: 500 }
      );
    }
    
    // Clean up API base URL (remove leading @ or other invalid characters)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.trim().replace(/^@+/, '').replace(/\/$/, '');
    if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
      console.error('❌ Invalid NEXT_PUBLIC_API_BASE_URL format:', apiBaseUrl);
      return NextResponse.json(
        { error: 'Server configuration error: Invalid API base URL format' },
        { status: 500 }
      );
    }
    
    console.log('API Base URL (raw):', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('API Base URL (cleaned):', apiBaseUrl);
    
    // Log the request data for quote creation
    if (endpoint.includes('/v3/getQuote/HEALTH') && method === 'POST' && data) {
      console.log('📋 REQUEST BODY (fieldData):');
      console.log(JSON.stringify(data, null, 2));
    }
    
    // Log CKYC requests
    if (endpoint.includes('/ckyc/') && method === 'POST' && data) {
      console.log('\n=== 🔐 CKYC REQUEST ===');
      console.log('Endpoint:', endpoint);
      console.log('Full URL will be:', `${apiBaseUrl}${endpoint}`);
      console.log('Data keys:', Object.keys(data));
      console.log('quoteId in data:', data.quoteId);
      console.log('quotePlanId in data:', data.quotePlanId);
      console.log('Full Data:', JSON.stringify(data, null, 2));
    }
    
    // Clean up origin header too
    const originHeader = (process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.retire100.com/').trim();
    
    const apiUrl = `${apiBaseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'origin': originHeader,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('🌐 Making request to:', apiUrl);
    console.log('📤 Headers being sent:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(apiUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log('📥 API Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      // If response is not JSON, get text
      const text = await response.text();
      console.error('❌ Non-JSON response:', text);
      responseData = { error: text || 'Unknown error', status: response.status };
    }
    
    // Enhanced 403 error logging and return detailed error to client
    if (response.status === 403) {
      console.error('\n❌❌❌ 403 FORBIDDEN ERROR ❌❌❌');
      console.error('Request URL:', apiUrl);
      console.error('Request Headers:', JSON.stringify(headers, null, 2));
      console.error('Request Body:', data ? JSON.stringify(data, null, 2) : 'No body');
      console.error('Response Status:', response.status);
      console.error('Response Data:', JSON.stringify(responseData, null, 2));
      console.error('Has Token:', !!token);
      console.error('API Base URL (raw):', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.error('API Base URL (cleaned):', apiBaseUrl);
      console.error('Origin Header (raw):', process.env.NEXT_PUBLIC_API_ORIGIN);
      console.error('Origin Header (cleaned):', originHeader);
      console.error('❌❌❌ END 403 ERROR LOG ❌❌❌\n');
      
      // Return more informative error to client
      return NextResponse.json(
        {
          error: 'Forbidden: API request was rejected',
          details: responseData || 'No additional details',
          message: responseData?.message || responseData?.error || 'The API rejected this request. Please check authentication and environment variables.',
          status: 403
        },
        { status: 403 }
      );
    }
    
    // Log CKYC responses
    if (endpoint.includes('/ckyc/')) {
      console.log('\n=== 🔐 CKYC RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(responseData, null, 2));
      if (response.status >= 400) {
        console.log('❌ CKYC Error Details:', responseData);
      }
    }
    
    // Log detailed response for quote endpoints
    if (endpoint.includes('/v3/getQuote/HEALTH')) {
      console.log('\n=== 📊 QUOTE RESPONSE ===');
      console.log('Quote ID:', responseData.id);
      console.log('Status:', responseData.status);
      console.log('Number of Plans:', responseData.quotePlans?.length || 0);
      
      // Log the sum insured from fieldData if present
      if (responseData.fieldData) {
        const sumInsuredField = responseData.fieldData.find((f: any) => f.id === 'sumInsured');
        console.log('💰 Sum Insured in Request:', sumInsuredField?.value || 'NOT PROVIDED');
      }
      
      // Log the first plan structure to understand the API response format
      if (responseData.quotePlans && responseData.quotePlans.length > 0) {
        console.log('\n🔍 FIRST PLAN STRUCTURE:');
        const firstPlan = responseData.quotePlans[0];
        console.log('Plan Object Keys:', Object.keys(firstPlan));
        console.log('Plan Data Keys:', Object.keys(firstPlan.planData || {}));
        console.log('Company Data Keys:', Object.keys(firstPlan.companyData || {}));
        console.log('Full Plan Structure:', JSON.stringify(firstPlan, null, 2));
      }
      
      // Group plans by insurer for clearer logging
      if (responseData.quotePlans && responseData.quotePlans.length > 0) {
        const plansByInsurer = responseData.quotePlans.reduce((acc: any, plan: any) => {
          // Try different possible insurer name fields
          const insurerName = plan.planData?.companyInternalName || 
                            plan.planData?.companyDisplayName || 
                            plan.companyData?.displayName || 
                            plan.companyData?.name ||
                            plan.company?.displayName ||
                            'Unknown';
          if (!acc[insurerName]) {
            acc[insurerName] = [];
          }
          acc[insurerName].push(plan);
          return acc;
        }, {});
        
        console.log('\n✅ SUCCESSFUL INSURERS & PLANS:');
        Object.entries(plansByInsurer).forEach(([insurer, plans]: [string, any]) => {
          console.log(`\n  🏢 ${insurer} (${plans.length} plan${plans.length > 1 ? 's' : ''})`);
          plans.forEach((plan: any, idx: number) => {
            console.log(`     ${idx + 1}. ${plan.planData?.displayName || plan.planData?.planName || 'Unknown'}`);
            console.log(`        Premium: ₹${plan.payingAmount}`);
            console.log(`        Sum Insured: ₹${plan.planData?.sumInsured || plan.sumInsured || 'N/A'}`);
            console.log(`        Plan ID: ${plan.planId || plan.planData?.id || 'N/A'}`);
            console.log(`        Amount Detail: ${plan.amountDetail ? `${plan.amountDetail.length} options` : 'None'}`);
          });
        });
      }
      
      // Log company errors (insurers that failed)
      if (responseData.companyErrorMessage?.company) {
        console.log('\n❌ FAILED INSURERS:');
        responseData.companyErrorMessage.company.forEach((company: any) => {
          console.log(`  - ${company.displayName} (ID: ${company.id})`);
          if (company.message) {
            console.log(`    Reason: ${company.message}`);
          }
        });
      }
      
      // Summary
      const successfulInsurers = responseData.quotePlans ? 
        new Set(responseData.quotePlans.map((p: any) => 
          p.planData?.companyInternalName || 
          p.planData?.companyDisplayName || 
          p.companyData?.displayName || 
          p.companyData?.name ||
          p.company?.displayName
        )).size : 0;
      const failedInsurers = responseData.companyErrorMessage?.company?.length || 0;
      
      console.log('\n📈 SUMMARY:');
      console.log(`   ✅ Successful Insurers: ${successfulInsurers}`);
      console.log(`   ❌ Failed Insurers: ${failedInsurers}`);
      console.log(`   📋 Total Plans: ${responseData.quotePlans?.length || 0}`);
      
      console.log('\n=== END QUOTE RESPONSE ===\n');
    }

    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error('❌ API Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'API request failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint');
    const token = searchParams.get('token');
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error('❌ Missing NEXT_PUBLIC_API_BASE_URL environment variable');
      return NextResponse.json(
        { error: 'Server configuration error: Missing API base URL' },
        { status: 500 }
      );
    }

    // Clean up API base URL (remove leading @ or other invalid characters)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.trim().replace(/^@+/, '').replace(/\/$/, '');
    if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
      console.error('❌ Invalid NEXT_PUBLIC_API_BASE_URL format:', apiBaseUrl);
      return NextResponse.json(
        { error: 'Server configuration error: Invalid API base URL format' },
        { status: 500 }
      );
    }

    const apiUrl = `${apiBaseUrl}${endpoint}`;
    const originHeader = (process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.retire100.com/').trim();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'origin': originHeader,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    const responseData = await response.json();

    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error('API Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'API request failed' },
      { status: 500 }
    );
  }
}
