import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationNotificationRequest {
  applicationId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { applicationId }: ApplicationNotificationRequest = await req.json();

    // Fetch application details with job, business, and applicant info
    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select(`
        *,
        job:jobs (
          id,
          title,
          business:businesses (
            id,
            name,
            owner_id,
            profiles:owner_id (
              email,
              first_name
            )
          )
        ),
        applicant:profiles (
          email,
          first_name,
          last_name
        )
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    // Get business owner email
    const businessOwnerEmail = application.job.business.profiles?.email;
    const businessOwnerName = application.job.business.profiles?.first_name;
    const applicantName = `${application.applicant.first_name || ''} ${application.applicant.last_name || ''}`.trim() || 'A candidate';

    if (!businessOwnerEmail) {
      console.log("No business owner email found, skipping notification");
      return new Response(
        JSON.stringify({ message: "No business owner email configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Email notification using Supabase's configured SMTP
    // Note: Supabase SMTP is primarily for auth emails
    // For custom notifications, you may want to add a direct SMTP library here
    console.log("Application notification logged - business owner:", businessOwnerEmail);
    console.log("Application details:", {
      jobTitle: application.job.title,
      applicantName,
      applicationId
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Application received",
        businessOwnerEmail 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-application-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});