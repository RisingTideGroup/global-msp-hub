
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, useIsModerator } from "@/hooks/useUserRole";
import { Header } from "@/components/Header";
import { AdminBusinessTable } from "@/components/AdminBusinessTable";
import { AdminJobTable } from "@/components/AdminJobTable";
import { AdminUsersTable } from "@/components/AdminUsersTable";
import { AdminAITable } from "@/components/AdminAITable";
import { AdminDashboard as AdminDashboardComponent } from "@/components/AdminDashboard";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Building, Briefcase, Users, Bot, Tags, LayoutDashboard, Mail, BarChart3, Settings } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { AdminClassificationTable } from "@/components/AdminClassificationTable";
import { AdminClassificationTypesTable } from "@/components/AdminClassificationTypesTable";
import { AdminNotificationTemplates } from "@/components/AdminNotificationTemplates";
import { AdminNotificationLogs } from "@/components/AdminNotificationLogs";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const isModerator = useIsModerator();
  const { data: role, isLoading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [classificationsSubTab, setClassificationsSubTab] = useState("classes");
  const [notificationsSubTab, setNotificationsSubTab] = useState("templates");

  useEffect(() => {
    if (!loading && (!user || !isModerator)) {
      navigate('/auth');
    }
  }, [user, loading, isModerator, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rising-blue-50 to-rising-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rising-blue-600"></div>
      </div>
    );
  }

  if (!user || !isModerator) {
    return null;
  }

  // Define available tabs based on role
  const availableTabs = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "analytics", label: "Analytics", icon: BarChart3 },
    { value: "businesses", label: "Businesses", icon: Building },
    { value: "jobs", label: "Jobs", icon: Briefcase },
    { value: "classifications", label: "Classifications", icon: Tags },
    // Only admins can access these tabs
    ...(isAdmin ? [
      { value: "users", label: "Users", icon: Users },
      { value: "ai", label: "AI Assistants", icon: Bot },
      { value: "notifications", label: "Notifications", icon: Mail }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rising-blue-50 to-rising-orange-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {isAdmin ? 'Admin Dashboard' : 'Moderator Dashboard'}
              </h1>
              <p className="text-slate-600">
                {isAdmin 
                  ? 'Manage all platform content and pending approvals' 
                  : 'Manage platform content and pending approvals'
                }
              </p>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin/settings')}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="dashboard">
            <div className="bg-white rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Pending Approvals</h2>
                <p className="text-slate-600">Review and approve pending business profiles and GDPR deletion requests</p>
              </div>
              <AdminDashboardComponent />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-white rounded-lg p-6">
              <AdminAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="businesses">
            <div className="bg-white rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Business Management</h2>
                <p className="text-slate-600">Review and manage business profiles</p>
              </div>
              <AdminBusinessTable />
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="bg-white rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Job Management</h2>
                <p className="text-slate-600">Review and manage job postings</p>
              </div>
              <AdminJobTable />
            </div>
          </TabsContent>

          <TabsContent value="classifications">
            <div className="bg-white rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Classification Management</h2>
                <p className="text-slate-600">Review and manage classification types and classifications</p>
              </div>
              
              <Tabs value={classificationsSubTab} onValueChange={setClassificationsSubTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="classes">Classes</TabsTrigger>
                  <TabsTrigger value="types">Class Types</TabsTrigger>
                </TabsList>

                <TabsContent value="classes">
                  <AdminClassificationTable />
                </TabsContent>

                <TabsContent value="types">
                  <AdminClassificationTypesTable />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="users">
                <div className="bg-white rounded-lg p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">User Management</h2>
                    <p className="text-slate-600">Manage user accounts, roles, and permissions</p>
                  </div>
                  <AdminUsersTable />
                </div>
              </TabsContent>

              <TabsContent value="ai">
                <div className="bg-white rounded-lg p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">AI Assistant Management</h2>
                    <p className="text-slate-600">Monitor and manage AI assistants for businesses</p>
                  </div>
                  <AdminAITable />
                </div>
              </TabsContent>

              <TabsContent value="notifications">
                <div className="bg-white rounded-lg p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Notification Management</h2>
                    <p className="text-slate-600">Manage email templates and notification logs</p>
                  </div>
                  
                  <Tabs value={notificationsSubTab} onValueChange={setNotificationsSubTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="templates">Email Templates</TabsTrigger>
                      <TabsTrigger value="logs">Send Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates">
                      <AdminNotificationTemplates />
                    </TabsContent>

                    <TabsContent value="logs">
                      <AdminNotificationLogs />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
