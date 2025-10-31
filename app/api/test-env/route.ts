import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify environment variables are set correctly
 * This is for debugging purposes only - remove in production
 */
export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      NEXT_PUBLIC_API_BASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_API_BASE_URL,
        value: process.env.NEXT_PUBLIC_API_BASE_URL ? 
          `${process.env.NEXT_PUBLIC_API_BASE_URL.substring(0, 20)}...` : 'MISSING',
        cleaned: process.env.NEXT_PUBLIC_API_BASE_URL ? 
          process.env.NEXT_PUBLIC_API_BASE_URL.trim().replace(/^@+/, '').replace(/\/$/, '') : 'N/A'
      },
      NEXT_PUBLIC_API_ORIGIN: {
        exists: !!process.env.NEXT_PUBLIC_API_ORIGIN,
        value: process.env.NEXT_PUBLIC_API_ORIGIN || 'MISSING',
        cleaned: process.env.NEXT_PUBLIC_API_ORIGIN ? (() => {
          let raw = process.env.NEXT_PUBLIC_API_ORIGIN;
          // Remove variable name if accidentally included
          if (raw.includes('=')) {
            raw = raw.split('=').slice(1).join('=').trim();
          }
          return raw.trim();
        })() : 'N/A'
      },
      NEXT_PUBLIC_API_USER_ID: {
        exists: !!process.env.NEXT_PUBLIC_API_USER_ID,
        value: process.env.NEXT_PUBLIC_API_USER_ID || 'MISSING'
      },
      NEXT_PUBLIC_API_PASSWORD: {
        exists: !!process.env.NEXT_PUBLIC_API_PASSWORD,
        value: process.env.NEXT_PUBLIC_API_PASSWORD ? '***SET***' : 'MISSING'
      },
      NEXT_PUBLIC_API_SALES_CHANNEL: {
        exists: !!process.env.NEXT_PUBLIC_API_SALES_CHANNEL,
        value: process.env.NEXT_PUBLIC_API_SALES_CHANNEL || 'MISSING'
      },
    };

    // Test authentication
    let authTest = { success: false, error: null, token: null };
    if (envCheck.NEXT_PUBLIC_API_BASE_URL.exists && 
        envCheck.NEXT_PUBLIC_API_USER_ID.exists && 
        envCheck.NEXT_PUBLIC_API_PASSWORD.exists) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!.trim().replace(/^@+/, '').replace(/\/$/, '');
        // Clean up origin header (handle case where user copied entire line)
        let originHeaderRaw = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.retire100.com/';
        if (originHeaderRaw.includes('=')) {
          originHeaderRaw = originHeaderRaw.split('=').slice(1).join('=').trim();
        }
        const originHeader = originHeaderRaw.trim();
        const authUrl = `${apiBaseUrl}/v3/login/verifyPassword`;
        
        const authResponse = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'origin': originHeader,
          },
          body: JSON.stringify({
            userId: process.env.NEXT_PUBLIC_API_USER_ID,
            password: process.env.NEXT_PUBLIC_API_PASSWORD,
            isOtp: false,
            salesChannelUserId: process.env.NEXT_PUBLIC_API_SALES_CHANNEL,
          }),
        });

        const authData = await authResponse.json();
        
        if (authResponse.ok && authData.accessToken) {
          authTest = {
            success: true,
            error: null,
            token: `${authData.accessToken.substring(0, 20)}...`
          };
        } else {
          authTest = {
            success: false,
            error: authData.message || `HTTP ${authResponse.status}`,
            token: null
          };
        }
      } catch (authError: any) {
        authTest = {
          success: false,
          error: authError.message || 'Authentication test failed',
          token: null
        };
      }
    } else {
      authTest = {
        success: false,
        error: 'Missing required environment variables for authentication',
        token: null
      };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: 'production',
      environmentVariables: envCheck,
      authenticationTest: authTest,
      summary: {
        allVarsSet: Object.values(envCheck).every(v => v.exists),
        authWorking: authTest.success,
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Test failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

