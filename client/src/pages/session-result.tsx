import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bot, CheckCircle, Clock, Scale, Users, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IOSStatusBar } from '@/components/ui/ios-status-bar';
import { LoadingModal } from '@/components/ui/loading-modal';
import { getSession, getMediationResult } from '@/lib/gemini';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function SessionResult() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const sessionId = parseInt(params.id || '0');
  const [isResolving, setIsResolving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['/api/sessions', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  });

  const resolveMutation = useMutation({
    mutationFn: () => getMediationResult(sessionId),
    onMutate: () => {
      setIsResolving(true);
    },
    onSuccess: (result) => {
      setIsResolving(false);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.setQueryData(['/api/sessions', sessionId], result);
      toast({
        title: "Mediation Complete!",
        description: "AI has analyzed the situation and provided solutions",
      });
    },
    onError: (error) => {
      setIsResolving(false);
      toast({
        title: "Mediation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    setLocation('/');
  };

  const handleResolve = () => {
    resolveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ios-gray-2">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Session Not Found</h2>
          <p className="text-ios-gray-2 mb-4">The requested session could not be found.</p>
          <Button onClick={handleBack} className="ios-blue">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <IOSStatusBar />
      
      {/* Navigation Bar */}
      <div className="bg-white border-b border-ios-gray-5 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="ios-blue font-medium p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h2 className="text-lg font-semibold">Session Details</h2>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Session Content */}
      <div className="flex-1 bg-ios-gray overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Session Status */}
          <Card className="rounded-ios-lg">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  session.status === 'resolved' 
                    ? 'bg-green-50' 
                    : 'bg-blue-50'
                }`}>
                  {session.status === 'resolved' ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <Clock className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{session.relationshipContext} Conflict</h3>
                <p className="text-lg text-ios-gray-2 mb-2">{session.argumentCategory}</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${
                  session.status === 'resolved' 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  <span className="text-sm font-medium">
                    {session.status === 'resolved' ? '✓ Resolved' : '⚡ Active Session'}
                  </span>
                </div>
                <p className="text-xs text-ios-gray-2 mt-2">
                  Created {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="rounded-ios-lg">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 ios-blue" />
                Participants ({session.participants.length})
              </h4>
              <div className="space-y-3">
                {session.participants.map((participant: any, index: number) => (
                  <div key={index} className="bg-ios-gray-6 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{participant.name}</h5>
                      {participant.role && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          {participant.role}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      "{participant.perspective}"
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Resolution */}
          {session.status === 'resolved' && session.aiResolution ? (
            <>
              <Card className="rounded-ios-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5 ios-blue" />
                    AI Mediation Result
                  </h4>
                  <div className="bg-ios-gray-6 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {session.aiResolution}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Items */}
              {session.actionItems && session.actionItems.length > 0 && (
                <Card className="rounded-ios-lg">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Action Items</h4>
                    <div className="space-y-2">
                      {session.actionItems.map((item: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fairness Score */}
              {session.fairnessScore && (
                <Card className="rounded-ios-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center gap-2">
                        <Scale className="w-5 h-5" />
                        Fairness Score
                      </span>
                      <span className={`text-sm font-semibold ${
                        session.fairnessScore >= 8 ? 'text-green-600' : 
                        session.fairnessScore >= 6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {session.fairnessScore}/10
                      </span>
                    </div>
                    <div className="w-full bg-ios-gray-5 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          session.fairnessScore >= 8 ? 'bg-green-500' : 
                          session.fairnessScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(session.fairnessScore / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-ios-gray-2 mt-2">
                      How balanced and fair the proposed solution is for all parties
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Start Mediation Button */
            <Button 
              onClick={handleResolve}
              disabled={resolveMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-ios py-4 text-lg font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              Start AI Mediation
            </Button>
          )}

          {/* Back to Home Button */}
          <Button 
            onClick={handleBack}
            variant="outline"
            className="w-full rounded-ios py-3"
          >
            {session.status === 'resolved' ? 'Start New Session' : 'Back to Home'}
          </Button>
        </div>
      </div>

      {/* Loading Modal */}
      <LoadingModal 
        isOpen={isResolving}
        title="AI Mediation in Progress"
        message="Analyzing perspectives and generating fair solutions..."
      />
    </>
  );
}