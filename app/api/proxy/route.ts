import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { endpoint, data, method = 'POST', token } = await request.json();
    
    console.log('Proxy request:', {
      endpoint,
      method,
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    });
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`;
    const originHeader = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.retire100.com/';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'origin': originHeader,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Added Authorization header');
    }

    const response = await fetch(apiUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log('External API response:', response.status);
    
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
