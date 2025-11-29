import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Bell, User, Shield, ArrowLeft, Lock, Briefcase, Heart, ExternalLink, Building, MapPin } from "lucide-react";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { GDPRDeletionDialog } from "@/components/GDPRDeletionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useApplications } from "@/hooks/useApplications";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useUserSubscriptions } from "@/hooks/useBusinessSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const UserSettings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: applications = [] } = useApplications();
  const { data: bookmarks = [] } = useBookmarks();
  const { data: subscriptions = [], refetch: refetchSubscriptions } = useUserSubscriptions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters long." };
    if (!/[A-Z]/.test(password)) return { valid: false, message: "Password must contain at least one uppercase letter." };
    if (!/[a-z]/.test(password)) return { valid: false, message: "Password must contain at least one lowercase letter." };
    if (!/\d/.test(password)) return { valid: false, message: "Password must contain at least one number." };
    return { valid: true, message: "" };
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both password fields.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive"
      });
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.message,
        variant: "destructive"
      });
      return;
    }

    if (!currentPassword) {
      toast({
        title: "Current Password Required",
        description: "Please enter your current password.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Verify current password first
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (verifyError) {
        throw new Error("Current password is incorrect.");
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated!",
        description: "Your password has been successfully updated.",
      });
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access settings.</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Briefcase className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <Bell className="h-4 w-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-muted-foreground text-xs font-mono">{user.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Applications
                  </CardTitle>
                  <CardDescription>
                    Track your job applications and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No applications yet. Start applying to jobs!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((application: any) => (
                        <div key={application.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link 
                                to={`/job/${application.job?.id}`}
                                className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {application.job?.title}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                              <p className="text-sm text-muted-foreground">{application.job?.business?.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Applied {format(new Date(application.applied_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge variant={
                              application.status === 'accepted' ? 'default' :
                              application.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {application.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {applications.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          And {applications.length - 5} more...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Bookmarked Jobs
                  </CardTitle>
                  <CardDescription>
                    Jobs you've saved for later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookmarks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No bookmarks yet. Save jobs to view them here!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {bookmarks.slice(0, 5).map((bookmark: any) => (
                        <div key={bookmark.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                          {bookmark.job ? (
                            <>
                              <Link 
                                to={`/job/${bookmark.job.id}`}
                                className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {bookmark.job.title}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>{bookmark.job.business?.name}</p>
                                <p>{bookmark.job.location}</p>
                                <p className="text-xs">
                                  Bookmarked {format(new Date(bookmark.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Job no longer available</p>
                          )}
                        </div>
                      ))}
                      {bookmarks.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          And {bookmarks.length - 5} more...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Subscribed Companies
                </CardTitle>
                <CardDescription>
                  Companies you're following for job alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      You're not following any companies yet.
                    </p>
                    <Button onClick={() => navigate('/businesses')} variant="outline">
                      Browse Companies
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((subscription: any) => {
                      const business = subscription.businesses;
                      if (!business) return null;
                      
                      return (
                        <div key={subscription.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                          {business.logo_url ? (
                            <img 
                              src={business.logo_url} 
                              alt={`${business.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">{business.name}</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {business.location && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {business.location}
                                </span>
                              )}
                              {business.industry && (
                                <Badge variant="secondary" className="text-xs">
                                  {business.industry}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Subscribed {format(new Date(subscription.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const { error } = await supabase
                                .from('business_subscriptions')
                                .delete()
                                .eq('id', subscription.id);
                              
                              if (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to unsubscribe",
                                  variant: "destructive"
                                });
                              } else {
                                queryClient.invalidateQueries({ queryKey: ['user-subscriptions', user?.id] });
                                toast({
                                  title: "Unsubscribed",
                                  description: `You won't receive notifications from ${business.name} anymore.`
                                });
                              }
                            }}
                          >
                            Unsubscribe
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>
                  Manage your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Your Rights</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Right to access your personal data</li>
                    <li>• Right to correct inaccurate data</li>
                    <li>• Right to delete your data (GDPR)</li>
                    <li>• Right to data portability</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Data Export</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of your data including your profile, applications, and activity.
                  </p>
                  <Button variant="outline" disabled>
                    Request Data Export
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Feature coming soon
                  </p>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-medium mb-2 text-destructive">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <GDPRDeletionDialog />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserSettings;
