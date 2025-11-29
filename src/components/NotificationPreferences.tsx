import { Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useNotificationTypes } from "@/hooks/useNotificationTypes";
import { useUserNotificationPreferences, useToggleNotificationPreference } from "@/hooks/useUserNotificationPreferences";
import { useIsAdmin } from "@/hooks/useUserRole";

export const NotificationPreferences = () => {
  const { data: notificationTypes, isLoading: typesLoading } = useNotificationTypes();
  const { data: preferences, isLoading: prefsLoading } = useUserNotificationPreferences();
  const togglePreference = useToggleNotificationPreference();
  const isAdmin = useIsAdmin();

  if (typesLoading || prefsLoading) {
    return <LoadingSpinner />;
  }

  const preferencesMap = new Map(
    preferences?.map(p => [p.notification_type_id, p.is_enabled])
  );

  const handleToggle = (notificationTypeId: string, currentValue: boolean) => {
    togglePreference.mutate({
      notificationTypeId,
      isEnabled: !currentValue
    });
  };

  // Filter out admin notifications for non-admin users
  const filteredTypes = notificationTypes?.filter(type => {
    if (type.category === 'admin' && !isAdmin) {
      return false;
    }
    return true;
  });

  // Group by category
  const groupedTypes = filteredTypes?.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof notificationTypes>);

  const categoryLabels = {
    business: 'Business Notifications',
    applicant: 'Application Notifications',
    admin: 'Admin Notifications',
    system: 'System Notifications'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose which email notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedTypes || {}).map(([category, types]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-3">
              {types.map((type) => {
                const isEnabled = preferencesMap.get(type.id) ?? type.default_enabled;
                return (
                  <div key={type.id} className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor={type.id} className="cursor-pointer">
                        {type.name}
                      </Label>
                      {type.description && (
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      id={type.id}
                      checked={isEnabled}
                      disabled={type.is_system}
                      onCheckedChange={() => handleToggle(type.id, isEnabled)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
