import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useBusinessDelete = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('=== STARTING COMPREHENSIVE BUSINESS DELETION PROCESS ===');
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);

      const errors: string[] = [];
      const warnings: string[] = [];
      const successLog: string[] = [];

      try {
        // Step 1: Create GDPR deletion request first
        console.log('Step 1: Creating GDPR deletion request...');
        try {
          const { data: gdprData, error: gdprError } = await supabase
            .from('gdpr_deletions')
            .insert({
              user_id: user.id,
              status: 'pending'
            })
            .select()
            .maybeSingle();

          if (gdprError || !gdprData) {
            console.error('GDPR insertion error:', gdprError);
            errors.push(`GDPR deletion request failed: ${gdprError.message}`);
          } else {
            console.log('✓ GDPR deletion request created:', gdprData);
            successLog.push('GDPR deletion request created');
          }
        } catch (error) {
          console.error('GDPR step exception:', error);
          errors.push(`GDPR step failed with exception: ${error}`);
        }

        // Step 2: Get all businesses owned by this user
        console.log('Step 2: Fetching all businesses for user...');
        let businesses: any[] = [];
        try {
          const { data: businessData, error: businessFetchError } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', user.id);

          if (businessFetchError) {
            console.error('Business fetch error:', businessFetchError);
            errors.push(`Failed to fetch businesses: ${businessFetchError.message}`);
          } else {
            businesses = businessData || [];
            console.log('Found businesses:', businesses);
            successLog.push(`Found ${businesses.length} businesses`);
          }
        } catch (error) {
          console.error('Business fetch exception:', error);
          errors.push(`Business fetch failed with exception: ${error}`);
        }

        // Step 3: Delete AI assistants for each business (both from DB and OpenAI)
        if (businesses.length > 0) {
          console.log('Step 3: Deleting AI assistants for all businesses...');
          for (const business of businesses) {
            try {
              console.log(`Processing AI assistants for business: ${business.name} (${business.id})`);
              
              // First get all AI assistants for this business
              const { data: aiAssistants, error: assistantFetchError } = await supabase
                .from('ai_assistants')
                .select('*')
                .eq('business_id', business.id);

              if (assistantFetchError) {
                console.error(`AI assistant fetch error for business ${business.id}:`, assistantFetchError);
                errors.push(`Failed to fetch AI assistants for business ${business.name}: ${assistantFetchError.message}`);
              } else if (aiAssistants && aiAssistants.length > 0) {
                console.log(`Found ${aiAssistants.length} AI assistants for business ${business.id}`);
                
                // Delete each assistant from OpenAI first
                for (const assistant of aiAssistants) {
                  try {
                    console.log(`Deleting OpenAI assistant: ${assistant.openai_assistant_id}`);
                    
                    // Call edge function to delete the OpenAI assistant
                    const { error: deleteError } = await supabase.functions.invoke('delete-ai-assistant', {
                      body: { 
                        assistantId: assistant.openai_assistant_id,
                        threadId: assistant.openai_thread_id 
                      }
                    });

                    if (deleteError) {
                      console.error(`Failed to delete OpenAI assistant ${assistant.openai_assistant_id}:`, deleteError);
                      warnings.push(`Failed to delete OpenAI assistant for business ${business.name}: ${deleteError.message}`);
                    } else {
                      console.log(`✓ Deleted OpenAI assistant ${assistant.openai_assistant_id}`);
                      successLog.push(`Deleted OpenAI assistant for business ${business.name}`);
                    }
                  } catch (error) {
                    console.error(`Exception deleting OpenAI assistant ${assistant.openai_assistant_id}:`, error);
                    warnings.push(`Exception deleting OpenAI assistant for business ${business.name}: ${error}`);
                  }
                }

                // Now delete from our database
                const { data: deletedAssistants, error: assistantDeleteError } = await supabase
                  .from('ai_assistants')
                  .delete()
                  .eq('business_id', business.id)
                  .select();

                if (assistantDeleteError) {
                  console.error(`AI assistant DB deletion error for business ${business.id}:`, assistantDeleteError);
                  errors.push(`Failed to delete AI assistants from DB for business ${business.name}: ${assistantDeleteError.message}`);
                } else {
                  console.log(`✓ Deleted ${deletedAssistants?.length || 0} AI assistants from DB for business ${business.id}`);
                  successLog.push(`Deleted ${deletedAssistants?.length || 0} AI assistants from DB for business ${business.name}`);
                }
              } else {
                console.log(`No AI assistants found for business ${business.id}`);
              }
            } catch (error) {
              console.error(`AI assistant deletion exception for business ${business.id}:`, error);
              errors.push(`AI assistant deletion failed for business ${business.name}: ${error}`);
            }
          }

          // Step 4: Delete all jobs for each business
          console.log('Step 4: Deleting jobs for all businesses...');
          for (const business of businesses) {
            try {
              console.log(`Deleting jobs for business: ${business.name} (${business.id})`);
              
              const { data: deletedJobs, error: jobsError } = await supabase
                .from('jobs')
                .delete()
                .eq('business_id', business.id)
                .select();

              if (jobsError) {
                console.error(`Jobs deletion error for business ${business.id}:`, jobsError);
                errors.push(`Failed to delete jobs for business ${business.name}: ${jobsError.message}`);
              } else {
                console.log(`✓ Deleted ${deletedJobs?.length || 0} jobs for business ${business.id}`);
                successLog.push(`Deleted ${deletedJobs?.length || 0} jobs for business ${business.name}`);
              }
            } catch (error) {
              console.error(`Jobs deletion exception for business ${business.id}:`, error);
              errors.push(`Jobs deletion failed for business ${business.name}: ${error}`);
            }
          }

          // Step 5: Delete business wizard progress
          console.log('Step 5: Deleting business wizard progress...');
          for (const business of businesses) {
            try {
              const { data: deletedWizard, error: wizardError } = await supabase
                .from('business_wizard_progress')
                .delete()
                .eq('business_id', business.id)
                .select();

              if (wizardError) {
                console.error(`Wizard progress deletion error for business ${business.id}:`, wizardError);
                errors.push(`Failed to delete wizard progress for ${business.name}: ${wizardError.message}`);
              } else {
                console.log(`✓ Deleted wizard progress for business ${business.id}:`, deletedWizard);
                successLog.push(`Deleted wizard progress for business ${business.name}`);
              }
            } catch (error) {
              console.error(`Wizard deletion exception for business ${business.id}:`, error);
              errors.push(`Wizard deletion failed for business ${business.name}: ${error}`);
            }
          }

          // NEW: Step 5.5: Check if businesses still exist before trying to delete them
          console.log('Step 5.5: Checking if businesses still exist before deletion...');
          try {
            const { data: businessesBeforeDeletion, error: checkError } = await supabase
              .from('businesses')
              .select('*')
              .eq('owner_id', user.id);

            if (checkError) {
              console.error('Error checking businesses before deletion:', checkError);
              errors.push(`Failed to check businesses before deletion: ${checkError.message}`);
            } else {
              console.log(`Businesses still existing before deletion:`, businessesBeforeDeletion);
              console.log(`Count: ${businessesBeforeDeletion?.length || 0}`);
              
              if (!businessesBeforeDeletion || businessesBeforeDeletion.length === 0) {
                console.log('⚠️ WARNING: No businesses found before deletion step - they may have been deleted by cascading foreign keys');
                warnings.push('Businesses appear to have been deleted by cascading constraints');
              }
            }
          } catch (error) {
            console.error('Exception checking businesses before deletion:', error);
            errors.push(`Exception checking businesses before deletion: ${error}`);
          }

          // Step 6: Delete all businesses
          console.log('Step 6: Deleting all businesses...');
          try {
            const { data: deletedBusinesses, error: businessDeleteError } = await supabase
              .from('businesses')
              .delete()
              .eq('owner_id', user.id)
              .select();

            if (businessDeleteError) {
              console.error('Business deletion error:', businessDeleteError);
              errors.push(`Failed to delete businesses: ${businessDeleteError.message}`);
            } else {
              console.log(`✓ Deleted ${deletedBusinesses?.length || 0} businesses:`, deletedBusinesses);
              successLog.push(`Deleted ${deletedBusinesses?.length || 0} businesses`);
              
              if (!deletedBusinesses || deletedBusinesses.length === 0) {
                console.log('⚠️ WARNING: Business deletion returned 0 rows - businesses may have been deleted earlier');
                warnings.push('Business deletion returned 0 rows - may have been deleted by cascading constraints');
              }
            }
          } catch (error) {
            console.error('Business deletion exception:', error);
            errors.push(`Business deletion failed: ${error}`);
          }
        } else {
          console.log('No businesses found to delete');
          successLog.push('No businesses found to delete');
        }

        // Step 7: Delete user job applications
        console.log('Step 7: Deleting user job applications...');
        try {
          const { data: deletedApplications, error: applicationsError } = await supabase
            .from('job_applications')
            .delete()
            .eq('user_id', user.id)
            .select();

          if (applicationsError) {
            console.error('Applications deletion error:', applicationsError);
            errors.push(`Failed to delete applications: ${applicationsError.message}`);
          } else {
            console.log(`✓ Deleted ${deletedApplications?.length || 0} job applications`);
            successLog.push(`Deleted ${deletedApplications?.length || 0} job applications`);
          }
        } catch (error) {
          console.error('Applications deletion exception:', error);
          errors.push(`Applications deletion failed: ${error}`);
        }

        // Step 8: Delete user bookmarks
        console.log('Step 8: Deleting user bookmarks...');
        try {
          const { data: deletedBookmarks, error: bookmarksError } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', user.id)
            .select();

          if (bookmarksError) {
            console.error('Bookmarks deletion error:', bookmarksError);
            errors.push(`Failed to delete bookmarks: ${bookmarksError.message}`);
          } else {
            console.log(`✓ Deleted ${deletedBookmarks?.length || 0} bookmarks`);
            successLog.push(`Deleted ${deletedBookmarks?.length || 0} bookmarks`);
          }
        } catch (error) {
          console.error('Bookmarks deletion exception:', error);
          errors.push(`Bookmarks deletion failed: ${error}`);
        }

        // Step 9: Delete user roles
        console.log('Step 9: Deleting user roles...');
        try {
          const { data: deletedRoles, error: rolesError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', user.id)
            .select();

          if (rolesError) {
            console.error('User roles deletion error:', rolesError);
            errors.push(`Failed to delete user roles: ${rolesError.message}`);
          } else {
            console.log(`✓ Deleted ${deletedRoles?.length || 0} user roles`);
            successLog.push(`Deleted ${deletedRoles?.length || 0} user roles`);
          }
        } catch (error) {
          console.error('User roles deletion exception:', error);
          errors.push(`User roles deletion failed: ${error}`);
        }

        // Step 10: Delete user profile
        console.log('Step 10: Deleting user profile...');
        try {
          const { data: deletedProfile, error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id)
            .select();

          if (profileError) {
            console.error('Profile deletion error:', profileError);
            errors.push(`Failed to delete user profile: ${profileError.message}`);
          } else {
            console.log('✓ User profile deleted:', deletedProfile);
            successLog.push('User profile deleted');
          }
        } catch (error) {
          console.error('Profile deletion exception:', error);
          errors.push(`Profile deletion failed: ${error}`);
        }

        // Step 11: Mark GDPR deletion as completed (only if it was created successfully)
        if (!errors.some(e => e.includes('GDPR'))) {
          console.log('Step 11: Marking GDPR deletion as completed...');
          try {
            const { data: updatedGdpr, error: gdprUpdateError } = await supabase
              .from('gdpr_deletions')
              .update({
                status: 'completed',
                deletion_completed_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
              .select();

            if (gdprUpdateError) {
              console.error('GDPR update error:', gdprUpdateError);
              errors.push(`Failed to update GDPR deletion status: ${gdprUpdateError.message}`);
            } else {
              console.log('✓ GDPR deletion marked as completed:', updatedGdpr);
              successLog.push('GDPR deletion marked as completed');
            }
          } catch (error) {
            console.error('GDPR update exception:', error);
            errors.push(`GDPR update failed: ${error}`);
          }
        } else {
          warnings.push('Skipped GDPR completion due to earlier GDPR errors');
        }

        console.log('Step 12: Attempting to delete auth user account...');
        try {
          const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
          
          if (authDeleteError) {
            console.error('Auth user deletion error:', authDeleteError);
            warnings.push(`Auth user deletion may require admin permissions: ${authDeleteError.message}`);
          } else {
            console.log('✓ Auth user account deleted successfully');
            successLog.push('Auth user account deleted');
          }
        } catch (error) {
          console.error('Auth deletion exception:', error);
          warnings.push(`Auth user deletion failed: ${error}`);
        }

        // Final summary
        console.log('=== DELETION PROCESS SUMMARY ===');
        console.log('Successes:', successLog);
        console.log('Warnings:', warnings);
        console.log('Errors:', errors);

        if (errors.length > 0) {
          console.log('=== BUSINESS DELETION PROCESS COMPLETED WITH ERRORS ===');
          throw new Error(`Deletion completed with ${errors.length} errors: ${errors.join('; ')}`);
        } else if (warnings.length > 0) {
          console.log('=== BUSINESS DELETION PROCESS COMPLETED WITH WARNINGS ===');
          return { 
            success: true, 
            warnings, 
            message: `Deletion completed with ${warnings.length} warnings` 
          };
        } else {
          console.log('=== BUSINESS DELETION PROCESS COMPLETED SUCCESSFULLY ===');
          return { success: true, message: 'All data deleted successfully' };
        }

      } catch (error) {
        console.error('=== BUSINESS DELETION PROCESS FAILED ===');
        console.error('Final error:', error);
        throw error;
      }
    },
    onSuccess: async (result) => {
      console.log('Business deletion mutation succeeded:', result);
      
      const message = result.warnings && result.warnings.length > 0 
        ? `Account deletion completed with some warnings. Check console for details.`
        : "Account and Business Data Deleted Successfully";
      
      toast({
        title: "Account Deletion Complete",
        description: message,
      });
      
      setTimeout(async () => {
        console.log('Signing out user...');
        await signOut();
      }, 2000);
    },
    onError: (error) => {
      console.error('Business deletion mutation failed:', error);
      toast({
        title: "Deletion Failed",
        description: `There was an error deleting your data: ${error.message}. Check console for detailed error information.`,
        variant: "destructive"
      });
    }
  });
};
