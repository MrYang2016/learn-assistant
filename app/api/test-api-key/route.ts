// Temporary test endpoint to debug API key lookup
// DELETE THIS AFTER FIXING
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = 'sk_EIye6hZkUuJqRpSfp4G0WsFG_aIlb-LSRJJ9n5hlIck';
  const prefix = apiKey.substring(3, 11);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const queryUrl = `${supabaseUrl}/rest/v1/api_keys?prefix=eq.${prefix}&select=*`;
  
  try {
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      queryUrl,
      results: data,
      count: Array.isArray(data) ? data.length : 'not an array',
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      queryUrl,
      usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }
}
