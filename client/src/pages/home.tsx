import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Clock, Heart, Users, Scale, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IOSStatusBar } from '@/components/ui/ios-status-bar';
import { getRecentSessions, type MediationResult } from '@/lib/gemini';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [, setLocation] = useLocation();

  // Fetch recent sessions
  const { data: recentSessions = [], isLoading } = useQuery({
    queryKey: ['/api/sessions'],
    queryFn: getRecentSessions,
  });

  const navigateToHistory = () => {
    setLocation('/history');
  };

  const navigateToSession = (sessionId: number) => {
    setLocation(`/session/${sessionId}`);
  };

  const startNewSession = () => {
    setLocation('/new-session');
  };

  return (
    <>
      <IOSStatusBar />
      
      {/* Navigation Bar */}
      <div className="bg-white border-b border-ios-gray-5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="w-6"></div>
          <h1 className="text-xl font-bold text-center">PeaceKeeper AI</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToHistory}
            className="w-6 h-6 p-0 ios-blue"
          >
            <Clock className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-green-400 border-0 rounded-ios-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Resolve Conflicts</h2>
                <p className="text-white text-opacity-90 text-sm">AI-powered mediation for peaceful solutions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Session Card */}
        <Card className="rounded-ios-lg border border-ios-gray-5">
          <CardContent className="p-0">
            <div className="p-6 pb-4">
              <h3 className="text-lg font-semibold mb-4">Start New Session</h3>
            </div>
            
            {/* New Session Option */}
            <Button
              variant="ghost"
              className="w-full px-6 py-4 h-auto flex items-center gap-4 border-t border-ios-gray-5 justify-start rounded-none hover:bg-ios-gray-6"
              onClick={startNewSession}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 ios-blue" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Begin Mediation</div>
                <div className="text-sm text-ios-gray-2">Set up participants and context</div>
              </div>
              <ChevronRight className="w-4 h-4 text-ios-gray-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sessions Preview */}
        {recentSessions.length > 0 && (
          <Card className="rounded-ios-lg border border-ios-gray-5">
            <CardContent className="p-0">
              <div className="p-6 pb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Sessions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToHistory}
                  className="ios-blue text-sm font-medium p-0 h-auto"
                >
                  View All
                </Button>
              </div>
              
              {recentSessions.slice(0, 3).map((session) => (
                <Button
                  key={session.id}
                  variant="ghost"
                  className="w-full px-6 py-3 h-auto flex items-center gap-4 border-t border-ios-gray-5 justify-start rounded-none hover:bg-ios-gray-6"
                  onClick={() => navigateToSession(session.id)}
                >
                  <div className="w-12 h-12 bg-ios-gray-6 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-ios-gray-2" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{session.relationshipContext} - {session.argumentCategory}</div>
                    <div className="text-xs text-ios-gray-2">
                      {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full ${
                      session.status === 'resolved' 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-orange-50 text-orange-600'
                    }`}>
                      <span className="text-xs font-medium">
                        {session.status === 'resolved' ? '✓ Resolved' : '⚡ Active'}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="bg-blue-50 rounded-ios-lg border border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Scale className="w-4 h-4 ios-blue" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Pro Tip</h4>
                <p className="text-sm text-ios-gray-2 leading-relaxed">
                  For best results, encourage all participants to share their perspectives honestly. 
                  Our AI analyzes emotions and provides balanced, fair solutions for everyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
