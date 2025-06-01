import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IOSStatusBar } from '@/components/ui/ios-status-bar';
import { LoadingModal } from '@/components/ui/loading-modal';
import { createMediationSession } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  name: string;
  role: string;
  perspective: string;
}

export default function NewSession() {
  const [, setLocation] = useLocation();
  const [relationshipContext, setRelationshipContext] = useState('');
  const [argumentCategory, setArgumentCategory] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', role: '', perspective: '' },
    { name: '', role: '', perspective: '' }
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: createMediationSession,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setLocation(`/session/${result.id}`);
      toast({
        title: "Session Created!",
        description: "Ready to start mediation process",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Session",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addParticipant = () => {
    if (participants.length < 6) {
      setParticipants([...participants, { name: '', role: '', perspective: '' }]);
    }
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 2) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const handleSubmit = () => {
    if (!relationshipContext || !argumentCategory) {
      toast({
        title: "Missing Information",
        description: "Please select relationship context and argument category.",
        variant: "destructive",
      });
      return;
    }

    const validParticipants = participants.filter(p => p.name.trim() && p.perspective.trim());
    if (validParticipants.length < 2) {
      toast({
        title: "Need More Participants",
        description: "Please add at least 2 participants with their perspectives.",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate({
      relationshipContext,
      argumentCategory,
      participants: validParticipants
    });
  };

  const goBack = () => {
    setLocation('/');
  };

  return (
    <>
      <IOSStatusBar />
      
      {/* Navigation Bar */}
      <div className="bg-white border-b border-ios-gray-5 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="w-6 h-6 p-0 ios-blue"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-center">New Session</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Context Setup */}
        <Card className="rounded-ios-lg border border-ios-gray-5">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Session Context</h3>
            
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship Type</Label>
              <Select value={relationshipContext} onValueChange={setRelationshipContext}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="romantic">Romantic Partner</SelectItem>
                  <SelectItem value="workplace">Workplace</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="roommates">Roommates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Argument Category</Label>
              <Select value={argumentCategory} onValueChange={setArgumentCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select argument category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="household">Household Chores</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="time management">Time Management</SelectItem>
                  <SelectItem value="responsibilities">Responsibilities</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="boundaries">Boundaries</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card className="rounded-ios-lg border border-ios-gray-5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Participants ({participants.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={addParticipant}
                disabled={participants.length >= 6}
                className="ios-blue text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            {participants.map((participant, index) => (
              <div key={index} className="space-y-3 p-4 bg-ios-gray-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Person {index + 1}</h4>
                  {participants.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(index)}
                      className="text-red-600 p-1 h-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`name-${index}`}>Name</Label>
                    <Input
                      id={`name-${index}`}
                      value={participant.name}
                      onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`role-${index}`}>Role (optional)</Label>
                    <Input
                      id={`role-${index}`}
                      value={participant.role}
                      onChange={(e) => updateParticipant(index, 'role', e.target.value)}
                      placeholder="e.g., Parent, Manager"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor={`perspective-${index}`}>Their Perspective</Label>
                  <Textarea
                    id={`perspective-${index}`}
                    value={participant.perspective}
                    onChange={(e) => updateParticipant(index, 'perspective', e.target.value)}
                    placeholder="Describe their side of the argument..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Start Session Button */}
        <Button
          onClick={handleSubmit}
          disabled={createSessionMutation.isPending}
          className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        >
          <Users className="w-5 h-5 mr-2" />
          Start Mediation Session
        </Button>
      </div>

      {/* Loading Modal */}
      <LoadingModal 
        isOpen={createSessionMutation.isPending}
        title="Creating Session"
        message="Setting up your mediation session..."
      />
    </>
  );
}