import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { endpoint, data, method = 'POST', token } = await request.json();
    
    console.log('\n=== 📤 PROXY REQUEST ===');
    console.log('Endpoint:', endpoint);
    console.log('Method:', method);
    console.log('Has Token:', !!token);
    
    // Log the request data for quote creation
    if (endpoint.includes('/v3/getQuote/HEALTH') && method === 'POST' && data) {
      console.log('📋 REQUEST BODY (fieldData):');
      console.log(JSON.stringify(data, null, 2));
    }
    
    // Log CKYC requests
    if (endpoint.includes('/ckyc/') && method === 'POST' && data) {
      console.log('\n=== 🔐 CKYC REQUEST ===');
      console.log('Endpoint:', endpoint);
      console.log('Full URL will be:', `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`);
      console.log('Data keys:', Object.keys(data));
      console.log('quoteId in data:', data.quoteId);
      console.log('quotePlanId in data:', data.quotePlanId);
      console.log('Full Data:', JSON.stringify(data, null, 2));
    }
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`;
    const originHeader = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.retire100.com/';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'origin': originHeader,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(apiUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log('📥 API Status:', response.status);
    
    const responseData = await response.json();
    
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

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`;
    const originHeader = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.retire100.com/';
    
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
