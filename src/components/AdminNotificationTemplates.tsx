import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useNotificationTypes } from "@/hooks/useNotificationTypes";
import { useNotificationTemplates, useUpdateNotificationTemplate } from "@/hooks/useNotificationTemplates";
import { Save, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminNotificationTemplates = () => {
  const { data: notificationTypes, isLoading: typesLoading } = useNotificationTypes();
  const { data: templates, isLoading: templatesLoading } = useNotificationTemplates();
  const updateTemplate = useUpdateNotificationTemplate();

  const [editingType, setEditingType] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");

  if (typesLoading || templatesLoading) {
    return <LoadingSpinner />;
  }

  const templateMap = new Map(
    templates?.map(t => [t.notification_type_id, t])
  );

  const handleEdit = (typeId: string) => {
    const template = templateMap.get(typeId);
    setEditingType(typeId);
    setSubject(template?.subject || "");
    setBodyHtml(template?.body_html || "");
    setBodyText(template?.body_text || "");
  };

  const handleSave = () => {
    if (!editingType) return;

    updateTemplate.mutate({
      notificationTypeId: editingType,
      subject,
      bodyHtml,
      bodyText
    });
  };

  const getVariablesForType = (typeId: string) => {
    const template = templateMap.get(typeId);
    return template?.variables || [];
  };

  const insertVariable = (variable: string) => {
    setBodyHtml(prev => prev + `{{${variable}}}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {notificationTypes?.map((type) => {
          const template = templateMap.get(type.id);
          const isEditing = editingType === type.id;
          const variables = getVariablesForType(type.id);

          return (
            <Card key={type.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{type.name}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{type.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Current Subject</Label>
                      <p className="text-sm mt-1">{template?.subject || 'Using system default'}</p>
                    </div>
                    <Button onClick={() => handleEdit(type.id)} variant="outline">
                      Edit Template
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`subject-${type.id}`}>Subject Line</Label>
                      <Input
                        id={`subject-${type.id}`}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject with {{variables}}"
                      />
                    </div>

                    <div>
                      <Label>Available Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {variables.map((variable) => (
                          <Badge
                            key={variable}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => insertVariable(variable)}
                          >
                            {variable}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click a variable to insert it into the template
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`html-${type.id}`}>Email Body (HTML)</Label>
                      <Textarea
                        id={`html-${type.id}`}
                        value={bodyHtml}
                        onChange={(e) => setBodyHtml(e.target.value)}
                        placeholder="HTML email body with {{variables}}"
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`text-${type.id}`}>Email Body (Plain Text - Optional)</Label>
                      <Textarea
                        id={`text-${type.id}`}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        placeholder="Plain text fallback"
                        rows={6}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSave}
                        disabled={updateTemplate.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Template
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingType(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
