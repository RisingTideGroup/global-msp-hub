import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId, resumeUrl, fileName } = await req.json();

    console.log(`Background scan initiated for application ${applicationId}, file: ${fileName}`);

    const VIRUSTOTAL_API_KEY = Deno.env.get('VIRUSTOTAL_API_KEY');
    if (!VIRUSTOTAL_API_KEY) {
      console.error('VirusTotal API key not configured');
      await updateApplicationScanStatus(applicationId, 'error', false, 'API key not configured');
      return new Response(JSON.stringify({ success: false, error: 'Configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Download file from Supabase storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resumeUrl);

    if (downloadError || !fileData) {
      console.error('Failed to download file:', downloadError);
      await updateApplicationScanStatus(applicationId, 'error', false, 'Failed to download file');
      return new Response(JSON.stringify({ success: false, error: 'Download failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fileBlob = new Blob([fileData], { type: 'application/octet-stream' });

    // Upload to VirusTotal
    const uploadFormData = new FormData();
    uploadFormData.append('file', fileBlob, fileName);

    const uploadResponse = await fetch('https://www.virustotal.com/api/v3/files', {
      method: 'POST',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('VirusTotal upload error:', errorText);
      
      await logScanStats({
        file_name: fileName,
        file_size: fileData.size,
        scan_result: 'error',
        error_message: `Upload failed: ${uploadResponse.status}`,
        quota_exceeded: uploadResponse.status === 429,
        response_code: uploadResponse.status,
      });

      await updateApplicationScanStatus(
        applicationId, 
        'error', 
        false, 
        `VirusTotal error: ${uploadResponse.status}`
      );

      return new Response(JSON.stringify({ success: false, error: 'Upload to VirusTotal failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uploadData = await uploadResponse.json();
    const analysisId = uploadData.data.id;

    console.log('Upload successful, analysis ID:', analysisId);

    // Poll for analysis results
    let attempts = 0;
    const maxAttempts = 30;
    let analysisData;

    while (attempts < maxAttempts) {
      const analysisResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            'x-apikey': VIRUSTOTAL_API_KEY,
          },
        }
      );

      if (!analysisResponse.ok) {
        console.error('Analysis check failed:', analysisResponse.status);
        await updateApplicationScanStatus(applicationId, 'error', false, 'Analysis check failed');
        throw new Error(`Analysis check failed: ${analysisResponse.status}`);
      }

      analysisData = await analysisResponse.json();
      const status = analysisData.data.attributes.status;

      console.log(`Analysis status (attempt ${attempts + 1}): ${status}`);

      if (status === 'completed') {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      await logScanStats({
        file_name: fileName,
        file_size: fileData.size,
        scan_result: 'error',
        error_message: 'Scan timeout',
        response_code: 408,
      });
      await updateApplicationScanStatus(applicationId, 'error', false, 'Scan timeout');
      return new Response(JSON.stringify({ success: false, error: 'Scan timeout' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process results
    const stats = analysisData.data.attributes.stats;
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const totalScans = Object.values(stats).reduce((a: number, b: number) => a + b, 0);
    
    const isClean = malicious === 0 && suspicious === 0;
    const scanResult = isClean ? 'clean' : 'malicious';

    console.log(`Scan complete: ${scanResult}, ${malicious} malicious, ${suspicious} suspicious out of ${totalScans} scans`);

    // Log statistics
    await logScanStats({
      file_name: fileName,
      file_size: fileData.size,
      scan_result: scanResult,
      positives: malicious + suspicious,
      total_scans: totalScans,
      response_code: 200,
    });

    // Update application status
    await updateApplicationScanStatus(applicationId, scanResult, !isClean, null);

    // If malware detected, notify admins
    if (!isClean) {
      await notifyAdminsOfMalware(applicationId, fileName, malicious, suspicious);
    }

    return new Response(
      JSON.stringify({
        success: true,
        clean: isClean,
        malicious,
        suspicious,
        totalScans,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in scan-application-resume function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to scan file',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function updateApplicationScanStatus(
  applicationId: string,
  scanStatus: string,
  malwareDetected: boolean,
  errorMessage: string | null
) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('job_applications')
      .update({
        scan_status: scanStatus,
        malware_detected: malwareDetected,
        scan_error_message: errorMessage,
      })
      .eq('id', applicationId);

    if (error) {
      console.error('Failed to update application scan status:', error);
    } else {
      console.log(`Updated application ${applicationId} scan status to ${scanStatus}`);
    }
  } catch (error) {
    console.error('Error updating application scan status:', error);
  }
}

async function logScanStats(stats: {
  file_name: string;
  file_size: number;
  scan_result: string;
  positives?: number;
  total_scans?: number;
  error_message?: string;
  quota_exceeded?: boolean;
  response_code?: number;
}) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('virustotal_scan_stats')
      .insert([stats]);

    if (error) {
      console.error('Failed to log scan stats:', error);
    }
  } catch (error) {
    console.error('Error logging scan stats:', error);
  }
}

async function notifyAdminsOfMalware(
  applicationId: string,
  fileName: string,
  malicious: number,
  suspicious: number
) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin users
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id, profiles!inner(email)')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) {
      console.log('No admins found to notify');
      return;
    }

    // Get application details
    const { data: application } = await supabase
      .from('job_applications')
      .select('*, jobs(title, businesses(name)), profiles!inner(email, first_name, last_name)')
      .eq('id', applicationId)
      .single();

    if (!application) {
      console.error('Application not found');
      return;
    }

    // Send notification to each admin
    for (const admin of admins) {
      const adminEmail = (admin as any).profiles?.email;
      if (!adminEmail) continue;

      await supabase.functions.invoke('send-email', {
        body: {
          to: adminEmail,
          subject: '🚨 Malware Detected in Job Application',
          html: `
            <h2>Malware Alert</h2>
            <p>A job application has been flagged with malware and hidden from the business owner.</p>
            
            <h3>Application Details:</h3>
            <ul>
              <li><strong>Applicant:</strong> ${application.profiles?.first_name} ${application.profiles?.last_name} (${application.profiles?.email})</li>
              <li><strong>Job:</strong> ${application.jobs?.title}</li>
              <li><strong>Business:</strong> ${application.jobs?.businesses?.name}</li>
              <li><strong>File:</strong> ${fileName}</li>
              <li><strong>Detection:</strong> ${malicious} malicious, ${suspicious} suspicious</li>
            </ul>
            
            <p><strong>Action Required:</strong> Please review this application in the admin panel and decide whether to approve or reject it.</p>
            
            <p><a href="${Deno.env.get('SITE_URL')}/admin?tab=applications&filter=malware">View Flagged Applications</a></p>
          `,
        },
      });
    }

    console.log(`Notified ${admins.length} admin(s) about malware detection`);
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}