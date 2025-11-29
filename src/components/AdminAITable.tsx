
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Bot, Settings, Save, Key } from "lucide-react";
import { AdminTableHeader } from "@/components/AdminTableHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIAssistant {
  id: string;
  business_id: string;
  openai_assistant_id: string;
  openai_thread_id: string;
  assistant_type: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  business?: {
    name: string;
    status: string;
  };
}

interface SystemPromptConfig {
  global: string;
  mission: string;
  culture: string;
  benefits: string;
  values: string;
  general: string;
  outputFormat: string;
}

export const AdminAITable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [systemPrompts, setSystemPrompts] = useState<SystemPromptConfig>({
    global: "",
    mission: "",
    culture: "",
    benefits: "",
    values: "",
    general: "",
    outputFormat: ""
  });
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  const { data: assistants = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-ai-assistants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_assistants')
        .select(`
          *,
          business:businesses(name, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIAssistant[];
    }
  });

  // Load current system prompts
  const { data: currentSystemPrompts, isLoading: promptLoading } = useQuery({
    queryKey: ['ai-system-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-system-prompts');
      if (error) throw error;
      return data.prompts as SystemPromptConfig;
    }
  });

  const updateSystemPrompts = useMutation({
    mutationFn: async (prompts: SystemPromptConfig) => {
      const { data, error } = await supabase.functions.invoke('update-system-prompts', {
        body: { prompts }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "System Prompts Updated",
        description: "All AI system prompts have been successfully updated."
      });
      queryClient.invalidateQueries({ queryKey: ['ai-system-prompts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update system prompts",
        variant: "destructive"
      });
    }
  });

  const updateApiKey = useMutation({
    mutationFn: async (apiKey: string) => {
      const { data, error } = await supabase.functions.invoke('update-openai-key', {
        body: { apiKey }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "API Key Updated",
        description: "OpenAI API key has been successfully updated."
      });
      setNewApiKey("");
      setShowApiKeyForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive"
      });
    }
  });

  const handleDeleteAssistant = async (assistant: AIAssistant) => {
    if (!confirm('Are you sure you want to delete this AI assistant? This will also remove it from OpenAI.')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('delete-ai-assistant', {
        body: {
          assistantId: assistant.openai_assistant_id,
          threadId: assistant.openai_thread_id
        }
      });

      if (error) throw error;

      const { error: deleteError } = await supabase
        .from('ai_assistants')
        .delete()
        .eq('id', assistant.id);

      if (deleteError) throw deleteError;

      toast({
        title: "AI Assistant deleted",
        description: "The AI assistant has been removed from both the database and OpenAI."
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting AI assistant:', error);
      toast({
        title: "Error",
        description: "Failed to delete AI assistant",
        variant: "destructive"
      });
    }
  };

  const handleSaveSystemPrompts = () => {
    updateSystemPrompts.mutate(systemPrompts);
  };

  const handleSaveApiKey = () => {
    if (newApiKey.trim()) {
      updateApiKey.mutate(newApiKey);
    }
  };

  const filteredAssistants = assistants.filter(assistant => {
    const matchesSearch = !searchTerm || 
      assistant.business?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistant.assistant_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistant.openai_assistant_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && assistant.is_active) ||
      (statusFilter === "inactive" && !assistant.is_active) ||
      (statusFilter === "expired" && assistant.expires_at && new Date(assistant.expires_at) < new Date());

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: "All Assistants" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "expired", label: "Expired" }
  ];

  // Set initial values from loaded prompts
  if (currentSystemPrompts && !systemPrompts.global) {
    setSystemPrompts(currentSystemPrompts);
  }

  if (isLoading || promptLoading) {
    return <LoadingSpinner message="Loading AI configuration..." />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="prompts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prompts">System Prompts</TabsTrigger>
          <TabsTrigger value="api-key">API Configuration</TabsTrigger>
          <TabsTrigger value="assistants">Active Assistants</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                AI System Prompts Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="global-prompt">Global System Prompt</Label>
                <p className="text-sm text-slate-600 mb-2">
                  Base behavior and personality for all AI interactions
                </p>
                <Textarea
                  id="global-prompt"
                  placeholder="You are a helpful business assistant..."
                  value={systemPrompts.global}
                  onChange={(e) => setSystemPrompts(prev => ({ ...prev, global: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mission-prompt">Mission Field Prompt</Label>
                  <Textarea
                    id="mission-prompt"
                    placeholder="Additional instructions for mission statement guidance..."
                    value={systemPrompts.mission}
                    onChange={(e) => setSystemPrompts(prev => ({ ...prev, mission: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="culture-prompt">Culture Field Prompt</Label>
                  <Textarea
                    id="culture-prompt"
                    placeholder="Additional instructions for company culture guidance..."
                    value={systemPrompts.culture}
                    onChange={(e) => setSystemPrompts(prev => ({ ...prev, culture: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="benefits-prompt">Benefits Field Prompt</Label>
                  <Textarea
                    id="benefits-prompt"
                    placeholder="Additional instructions for employee benefits guidance..."
                    value={systemPrompts.benefits}
                    onChange={(e) => setSystemPrompts(prev => ({ ...prev, benefits: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="values-prompt">Values Field Prompt</Label>
                  <Textarea
                    id="values-prompt"
                    placeholder="Additional instructions for company values guidance..."
                    value={systemPrompts.values}
                    onChange={(e) => setSystemPrompts(prev => ({ ...prev, values: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="general-prompt">General Field Prompt</Label>
                  <Textarea
                    id="general-prompt"
                    placeholder="Additional instructions for general business guidance..."
                    value={systemPrompts.general}
                    onChange={(e) => setSystemPrompts(prev => ({ ...prev, general: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="output-format">Output Format Instructions</Label>
                <p className="text-sm text-slate-600 mb-2">
                  Hard-coded instructions for response formatting (applied at the end)
                </p>
                <Textarea
                  id="output-format"
                  placeholder="Always provide your response in a professional, actionable format..."
                  value={systemPrompts.outputFormat}
                  onChange={(e) => setSystemPrompts(prev => ({ ...prev, outputFormat: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <Button 
                onClick={handleSaveSystemPrompts}
                disabled={updateSystemPrompts.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateSystemPrompts.isPending ? "Saving..." : "Save All Prompts"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-key">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-green-600" />
                OpenAI API Key Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showApiKeyForm ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Current API key is configured and active.
                  </p>
                  <Button 
                    onClick={() => setShowApiKeyForm(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Update API Key
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">New OpenAI API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveApiKey}
                      disabled={updateApiKey.isPending || !newApiKey.trim()}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {updateApiKey.isPending ? "Updating..." : "Update Key"}
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowApiKeyForm(false);
                        setNewApiKey("");
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Active AI Assistants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminTableHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by business name, type, or assistant ID..."
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterPlaceholder="Filter by status"
                filterOptions={statusOptions}
              />

              <div className="bg-white rounded-lg border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Assistant Type</TableHead>
                      <TableHead>OpenAI ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssistants.map((assistant) => (
                      <TableRow key={assistant.id}>
                        <TableCell>
                          <div className="font-medium text-slate-800">
                            {assistant.business?.name || 'Unknown Business'}
                          </div>
                          <div className="text-sm text-slate-500">
                            Business Status: <Badge variant={assistant.business?.status === 'approved' ? 'default' : 'secondary'}>
                              {assistant.business?.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-blue-600" />
                            {assistant.assistant_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs text-slate-600">
                            {assistant.openai_assistant_id.slice(0, 20)}...
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={assistant.is_active ? 'default' : 'secondary'}
                            className={assistant.is_active ? 'bg-green-100 text-green-700' : ''}
                          >
                            {assistant.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assistant.expires_at ? (
                            <div className="text-sm">
                              {new Date(assistant.expires_at).toLocaleDateString()}
                              {new Date(assistant.expires_at) < new Date() && (
                                <Badge variant="destructive" className="ml-2">Expired</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(assistant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAssistant(assistant)}
                              className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAssistants.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No AI assistants found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
