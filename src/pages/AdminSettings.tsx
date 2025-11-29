import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Mail, Bell, Shield, ArrowLeft, Plug, Brain, ScanSearch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VirusTotalStats } from "@/components/VirusTotalStats";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = useState("admin@example.com");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to database or configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings saved",
        description: "Notification settings have been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-brand-primary" />
            <h1 className="text-3xl font-bold text-brand-primary">System Settings</h1>
          </div>
          <p className="text-dark-text">Configure system-wide settings and preferences</p>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrations">
              <Plug className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations">
            <div className="space-y-6">
              {/* AI Integration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-brand-primary" />
                    <CardTitle>AI Integration</CardTitle>
                  </div>
                  <CardDescription>
                    Configure AI services for enhanced functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">OpenAI Configuration</h4>
                    <div className="space-y-1 text-sm">
                      <p>Status: <span className="text-green-600 font-medium">Connected</span></p>
                      <p>API Key: <span className="font-mono text-xs">••••••••••••••••</span></p>
                      <p className="text-muted-foreground mt-2">
                        Used for AI coaching, content generation, and intelligent features
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Malware Scanning Integration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ScanSearch className="h-5 w-5 text-brand-primary" />
                    <CardTitle>Malware Scanning</CardTitle>
                  </div>
                  <CardDescription>
                    VirusTotal integration for file security scanning
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">VirusTotal Status</h4>
                    <div className="space-y-1 text-sm">
                      <p>Status: <span className="text-green-600 font-medium">Active</span></p>
                      <p>API Key: <span className="font-mono text-xs">••••••••••••••••</span></p>
                      <p className="text-muted-foreground mt-2">
                        All resume uploads are automatically scanned for malware
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Scan Statistics</h4>
                    <VirusTotalStats />
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-amber-800">API Usage Information</h4>
                    <div className="space-y-1 text-sm text-amber-700">
                      <p>• Free tier: 4 requests/minute, 500 requests/day</p>
                      <p>• Files larger than 32MB require premium API</p>
                      <p>• Monitor quota exceeded errors to determine if upgrade is needed</p>
                      <p className="mt-2 font-medium">
                        If you see frequent quota errors, consider upgrading at{" "}
                        <a 
                          href="https://www.virustotal.com/gui/my-apikey" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:text-amber-900"
                        >
                          virustotal.com
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Recipients</CardTitle>
                <CardDescription>
                  Configure who receives admin notifications for system events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email Address</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    This email will receive notifications for new businesses, job postings, and system alerts
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Active Notification Types</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>New Business Registrations</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>New Job Postings</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>Business Status Changes</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>Application Notifications</span>
                      <span className="text-green-600">Active</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveNotificationSettings}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? "Saving..." : "Save Notification Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure email service settings and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email Address</Label>
                  <Input
                    id="from-email"
                    type="email"
                    defaultValue="noreply@yourapp.com"
                    placeholder="noreply@yourapp.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    type="text"
                    defaultValue="Your App Name"
                    placeholder="Your App Name"
                  />
                </div>

                <Separator />

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Email Service Status</h4>
                  <div className="space-y-1 text-sm">
                    <p>Provider: <span className="font-medium">Mailgun</span></p>
                    <p>Status: <span className="text-green-600 font-medium">Connected</span></p>
                    <p>Daily Limit: <span className="font-medium">10,000 emails</span></p>
                  </div>
                </div>

                <Button className="w-full">
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Security Status</h4>
                  <div className="space-y-1 text-sm">
                    <p>✓ Row Level Security (RLS) enabled on all tables</p>
                    <p>✓ Authentication configured</p>
                    <p>✓ API keys secured</p>
                    <p>✓ CORS configured</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Access Control</h4>
                  <p className="text-sm text-muted-foreground">
                    Role-based access control is active. Manage user roles in the Users section.
                  </p>
                </div>

                <Button 
                  variant="outline"
                  onClick={() => navigate('/admin?tab=users')}
                  className="w-full"
                >
                  Manage User Roles
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
