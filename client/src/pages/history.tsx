import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Leaf, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IOSStatusBar } from '@/components/ui/ios-status-bar';
import { getRecentScans } from '@/lib/gemini';
import { formatDistanceToNow } from 'date-fns';

export default function History() {
  const [, setLocation] = useLocation();

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['/api/scans'],
    queryFn: getRecentScans,
  });

  const handleBack = () => {
    setLocation('/');
  };

  const navigateToScan = (scanId: number) => {
    setLocation(`/scan/${scanId}`);
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
            onClick={handleBack}
            className="ios-blue font-medium p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h2 className="text-lg font-semibold">Scan History</h2>
          <div className="w-12"></div>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 bg-ios-gray overflow-y-auto">
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-ios-gray-2">Loading scan history...</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-12">
              <Leaf className="w-16 h-16 text-ios-gray-2 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Scans Yet</h3>
              <p className="text-ios-gray-2 mb-6">
                Start scanning food items to see your history here.
              </p>
              <Button 
                onClick={handleBack}
                className="bg-ios-blue hover:bg-ios-blue/90 text-white"
              >
                Start Scanning
              </Button>
            </div>
          ) : (
            scans.map((scan) => (
              <Card 
                key={scan.id} 
                className="rounded-ios-lg border border-ios-gray-5 cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => navigateToScan(scan.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-16 h-16 bg-ios-gray-6 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-8 h-8 text-ios-gray-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate pr-2">{scan.foodName}</h3>
                        <div className={`px-2 py-1 rounded-full flex-shrink-0 ${
                          scan.isVegan 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          <span className="text-xs font-medium flex items-center gap-1">
                            {scan.isVegan ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Vegan
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Not Vegan
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-ios-gray-2">
                        {formatDistanceToNow(scan.createdAt, { addSuffix: true })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-ios-gray-2">Confidence:</span>
                        <span className={`text-xs font-medium ${
                          scan.confidence >= 80 ? 'text-green-600' : 
                          scan.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {scan.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-ios-gray-6 rounded-lg p-3">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {scan.analysis.length > 120 
                        ? `${scan.analysis.substring(0, 120)}...` 
                        : scan.analysis
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
