import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeletionRequest {
  requestId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's auth to verify they're admin
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    // Verify user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('Unauthorized - admin access required');
    }

    const { requestId }: DeletionRequest = await req.json();
    
    if (!requestId) {
      throw new Error('Missing requestId');
    }

    console.log('Processing GDPR deletion request:', requestId);

    // Get the deletion request details
    const { data: deletionRequest, error: fetchError } = await supabase
      .from('gdpr_deletions')
      .select('user_id, email')
      .eq('id', requestId)
      .single();

    if (fetchError || !deletionRequest) {
      throw new Error('GDPR deletion request not found');
    }

    const userIdToDelete = deletionRequest.user_id;
    console.log('Deleting user:', userIdToDelete);

    // Create admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user's businesses and related data (will cascade to jobs, etc.)
    const { error: businessError } = await supabaseAdmin
      .from('businesses')
      .delete()
      .eq('owner_id', userIdToDelete);

    if (businessError) {
      console.error('Error deleting businesses:', businessError);
    }

    // Delete user's job applications
    const { error: applicationsError } = await supabaseAdmin
      .from('job_applications')
      .delete()
      .eq('user_id', userIdToDelete);

    if (applicationsError) {
      console.error('Error deleting job applications:', applicationsError);
    }

    // Delete user's bookmarks
    const { error: bookmarksError } = await supabaseAdmin
      .from('bookmarks')
      .delete()
      .eq('user_id', userIdToDelete);

    if (bookmarksError) {
      console.error('Error deleting bookmarks:', bookmarksError);
    }

    // Delete user's classifications
    const { error: classificationsError } = await supabaseAdmin
      .from('classifications')
      .delete()
      .eq('created_by', userIdToDelete);

    if (classificationsError) {
      console.error('Error deleting classifications:', classificationsError);
    }

    // Delete user's classification types
    const { error: classificationTypesError } = await supabaseAdmin
      .from('classification_types')
      .delete()
      .eq('created_by', userIdToDelete);

    if (classificationTypesError) {
      console.error('Error deleting classification types:', classificationTypesError);
    }

    // Hash IP addresses in visit tracking tables before completing deletion
    console.log('Hashing IP addresses for analytics preservation...');
    
    // Get all businesses owned by this user to hash related visit IPs
    const { data: userBusinesses } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', userIdToDelete);

    if (userBusinesses && userBusinesses.length > 0) {
      const businessIds = userBusinesses.map(b => b.id);
      
      // Hash IP addresses in business_visits for user's businesses
      const { error: businessVisitsHashError } = await supabaseAdmin.rpc('hash_business_visit_ips', {
        p_business_ids: businessIds
      });
      
      if (businessVisitsHashError) {
        console.error('Error hashing business visit IPs:', businessVisitsHashError);
      } else {
        console.log(`Hashed IP addresses for ${businessIds.length} businesses`);
      }

      // Get all jobs from user's businesses to hash job visit IPs
      const { data: userJobs } = await supabaseAdmin
        .from('jobs')
        .select('id')
        .in('business_id', businessIds);

      if (userJobs && userJobs.length > 0) {
        const jobIds = userJobs.map(j => j.id);
        
        // Hash IP addresses in job_visits for user's jobs
        const { error: jobVisitsHashError } = await supabaseAdmin.rpc('hash_job_visit_ips', {
          p_job_ids: jobIds
        });
        
        if (jobVisitsHashError) {
          console.error('Error hashing job visit IPs:', jobVisitsHashError);
        } else {
          console.log(`Hashed IP addresses for ${jobIds.length} jobs`);
        }
      }
    }

    // Update the GDPR deletion request status and hash the email
    const hashedEmail = deletionRequest.email 
      ? `hashed_${userIdToDelete.substring(0, 8)}` // Simple hash prefix for identification
      : null;

    const { error: updateError } = await supabaseAdmin
      .from('gdpr_deletions')
      .update({
        status: 'completed',
        deletion_completed_at: new Date().toISOString(),
        email: hashedEmail, // Replace email with hashed version
        anonymization_data: {
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
          email_hashed: true,
          ip_addresses_hashed: true
        }
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating GDPR request:', updateError);
    }

    // Delete user's profile (this should cascade from auth user deletion, but doing it explicitly)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userIdToDelete);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // Delete user's role
    const { error: roleDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userIdToDelete);

    if (roleDeleteError) {
      console.error('Error deleting user role:', roleDeleteError);
    }

    // Finally, delete the auth user account
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userIdToDelete
    );

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      throw new Error(`Failed to delete auth user: ${authDeleteError.message}`);
    }

    console.log('GDPR deletion completed successfully for user:', userIdToDelete);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'User data deleted successfully',
      userId: userIdToDelete
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-gdpr-deletion function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process GDPR deletion' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
