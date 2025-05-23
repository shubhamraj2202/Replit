import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bot, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IOSStatusBar } from '@/components/ui/ios-status-bar';
import { getScan } from '@/lib/gemini';
import { formatDistanceToNow } from 'date-fns';

export default function ScanResult() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const scanId = parseInt(params.id || '0');

  const { data: scan, isLoading, error } = useQuery({
    queryKey: ['/api/scans', scanId],
    queryFn: () => getScan(scanId),
    enabled: !!scanId,
  });

  const handleBack = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ios-gray-2">Loading scan result...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Scan Not Found</h2>
          <p className="text-ios-gray-2 mb-4">The requested scan could not be found.</p>
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
          <h2 className="text-lg font-semibold">Scan Result</h2>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Scan Result Content */}
      <div className="flex-1 bg-ios-gray overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Result Status */}
          <Card className="rounded-ios-lg">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  scan.isVegan 
                    ? 'bg-green-50' 
                    : 'bg-red-50'
                }`}>
                  {scan.isVegan ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{scan.foodName}</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${
                  scan.isVegan 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  <span className="text-sm font-medium">
                    {scan.isVegan ? '✓ This is Vegan!' : '✗ This is Not Vegan'}
                  </span>
                </div>
                <p className="text-xs text-ios-gray-2 mt-2">
                  Scanned {formatDistanceToNow(scan.createdAt, { addSuffix: true })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="rounded-ios-lg">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Bot className="w-5 h-5 ios-blue" />
                AI Analysis
              </h4>
              <div className="bg-ios-gray-6 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {scan.analysis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Score */}
          <Card className="rounded-ios-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Confidence Level</span>
                <span className={`text-sm font-semibold ${
                  scan.confidence >= 80 ? 'text-green-600' : 
                  scan.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {scan.confidence}%
                </span>
              </div>
              <div className="w-full bg-ios-gray-5 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    scan.confidence >= 80 ? 'bg-green-500' : 
                    scan.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${scan.confidence}%` }}
                />
              </div>
              <p className="text-xs text-ios-gray-2 mt-2">
                Based on visible ingredients and AI analysis
              </p>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button 
            onClick={handleBack}
            className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white rounded-ios py-3"
          >
            Scan Another Item
          </Button>
        </div>
      </div>
    </>
  );
}
