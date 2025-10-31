import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error('❌ Missing NEXT_PUBLIC_API_BASE_URL in auth route');
      return NextResponse.json(
        { error: 'Server configuration error: Missing API base URL' },
        { status: 500 }
      );
    }
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v3/login/verifyPassword`;
    const originHeader = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.retire100.com/';
    
    console.log('\n=== 🔐 AUTH REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Origin Header:', originHeader);
    console.log('Request Body:', JSON.stringify(body, null, 2));
    console.log('Env vars check:', {
      hasBaseUrl: !!process.env.NEXT_PUBLIC_API_BASE_URL,
      hasOrigin: !!process.env.NEXT_PUBLIC_API_ORIGIN,
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      origin: process.env.NEXT_PUBLIC_API_ORIGIN
    });
    
    const headers = {
      'Content-Type': 'application/json',
      'origin': originHeader,
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('📥 Auth Response Status:', response.status);
    
    let data;
    try {
      data = await response.json();
    } catch (error) {
      const text = await response.text();
      console.error('❌ Auth non-JSON response:', text);
      data = { error: text || 'Authentication failed', status: response.status };
    }
    
    // Enhanced 403 error logging for auth
    if (response.status === 403 || response.status === 401) {
      console.error('\n❌❌❌ AUTH 403/401 ERROR ❌❌❌');
      console.error('Auth URL:', apiUrl);
      console.error('Request Body:', JSON.stringify(body, null, 2));
      console.error('Response Status:', response.status);
      console.error('Response Data:', JSON.stringify(data, null, 2));
      console.error('Environment Variables:', {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_API_ORIGIN: process.env.NEXT_PUBLIC_API_ORIGIN,
        NEXT_PUBLIC_API_USER_ID: process.env.NEXT_PUBLIC_API_USER_ID ? '***SET***' : 'MISSING',
        NEXT_PUBLIC_API_PASSWORD: process.env.NEXT_PUBLIC_API_PASSWORD ? '***SET***' : 'MISSING',
      });
      console.error('❌❌❌ END AUTH ERROR LOG ❌❌❌\n');
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

