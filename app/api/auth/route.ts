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
    
    // Clean up API base URL (remove leading @ or other invalid characters)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.trim().replace(/^@+/, '').replace(/\/$/, '');
    if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
      console.error('❌ Invalid NEXT_PUBLIC_API_BASE_URL format:', apiBaseUrl);
      return NextResponse.json(
        { error: 'Server configuration error: Invalid API base URL format' },
        { status: 500 }
      );
    }
    
    const apiUrl = `${apiBaseUrl}/v3/login/verifyPassword`;
    // Clean up origin header (handle case where user copied entire line like "NEXT_PUBLIC_API_ORIGIN=https://...")
    let originHeaderRaw = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.retire100.com/';
    // Remove variable name if accidentally included
    if (originHeaderRaw.includes('=')) {
      originHeaderRaw = originHeaderRaw.split('=').slice(1).join('=').trim();
    }
    const originHeader = originHeaderRaw.trim();
    
    console.log('\n=== 🔐 AUTH REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Origin Header:', originHeader);
    console.log('Request Body:', JSON.stringify(body, null, 2));
    console.log('Env vars check:', {
      hasBaseUrl: !!process.env.NEXT_PUBLIC_API_BASE_URL,
      hasOrigin: !!process.env.NEXT_PUBLIC_API_ORIGIN,
      baseUrlRaw: process.env.NEXT_PUBLIC_API_BASE_URL,
      baseUrlCleaned: apiBaseUrl,
      originRaw: process.env.NEXT_PUBLIC_API_ORIGIN,
      originCleaned: originHeader
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
        NEXT_PUBLIC_API_BASE_URL_raw: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_API_BASE_URL_cleaned: apiBaseUrl,
        NEXT_PUBLIC_API_ORIGIN_raw: process.env.NEXT_PUBLIC_API_ORIGIN,
        NEXT_PUBLIC_API_ORIGIN_cleaned: originHeader,
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

