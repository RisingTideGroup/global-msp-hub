
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for bypass mode: backend-only secret + valid origin
    const bypassEnabled = Deno.env.get('TURNSTILE_BYPASS_ENABLED') === 'true';
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const isLovablePreview = origin.includes('lovableproject.com');
    
    if (bypassEnabled && isLovablePreview) {
      console.log('Turnstile verification bypassed: preview mode enabled with valid origin');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Verification bypassed for authorized preview environment'
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const secretKey = Deno.env.get('TURNSTILE_SECRET_KEY');
    
    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY not found in environment');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the token with Cloudflare Turnstile
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    console.log('Turnstile verification result:', result);

    return new Response(
      JSON.stringify({ 
        success: result.success,
        error: result.success ? null : 'Verification failed'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in verify-turnstile function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
