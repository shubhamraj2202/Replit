import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Camera, Images, Leaf, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IOSStatusBar } from '@/components/ui/ios-status-bar';
import { LoadingModal } from '@/components/ui/loading-modal';
import { analyzeImage, getRecentScans, type ScanResult } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [, setLocation] = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // Fetch recent scans
  const { data: recentScans = [], isLoading } = useQuery({
    queryKey: ['/api/scans'],
    queryFn: getRecentScans,
  });

  // Analyze image mutation
  const analyzeMutation = useMutation({
    mutationFn: analyzeImage,
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (result) => {
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/scans'] });
      setLocation(`/scan/${result.id}`);
      toast({
        title: "Analysis Complete!",
        description: `Food analyzed: ${result.isVegan ? 'Vegan' : 'Not Vegan'}`,
      });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageCapture = (file: File) => {
    analyzeMutation.mutate(file);
  };

  const handleImageSelect = (file: File) => {
    analyzeMutation.mutate(file);
  };

  const navigateToHistory = () => {
    setLocation('/history');
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
          <div className="w-6"></div>
          <h1 className="text-xl font-bold text-center">Is It Vegie?</h1>
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
        <Card className="bg-gradient-to-br from-green-500 to-green-400 border-0 rounded-ios-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Scan Your Food</h2>
                <p className="text-white text-opacity-90 text-sm">Instantly check if it's vegan-friendly</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan Options Card */}
        <Card className="rounded-ios-lg border border-ios-gray-5">
          <CardContent className="p-0">
            <div className="p-6 pb-4">
              <h3 className="text-lg font-semibold mb-4">Choose Scan Method</h3>
            </div>
            
            {/* Camera Option */}
            <Button
              variant="ghost"
              className="w-full px-6 py-4 h-auto flex items-center gap-4 border-t border-ios-gray-5 justify-start rounded-none hover:bg-ios-gray-6"
              onClick={openCamera}
              disabled={isAnalyzing}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 ios-blue" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Take Photo</div>
                <div className="text-sm text-ios-gray-2">Capture food or ingredients</div>
              </div>
              <ChevronRight className="w-4 h-4 text-ios-gray-2" />
            </Button>

            {/* Gallery Option */}
            <Button
              variant="ghost"
              className="w-full px-6 py-4 h-auto flex items-center gap-4 border-t border-ios-gray-5 justify-start rounded-none hover:bg-ios-gray-6"
              onClick={openGallery}
              disabled={isAnalyzing}
            >
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Images className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Choose from Gallery</div>
                <div className="text-sm text-ios-gray-2">Select existing photo</div>
              </div>
              <ChevronRight className="w-4 h-4 text-ios-gray-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Scans Preview */}
        {recentScans.length > 0 && (
          <Card className="rounded-ios-lg border border-ios-gray-5">
            <CardContent className="p-0">
              <div className="p-6 pb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Scans</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToHistory}
                  className="ios-blue text-sm font-medium p-0 h-auto"
                >
                  View All
                </Button>
              </div>
              
              {recentScans.slice(0, 3).map((scan) => (
                <Button
                  key={scan.id}
                  variant="ghost"
                  className="w-full px-6 py-3 h-auto flex items-center gap-4 border-t border-ios-gray-5 justify-start rounded-none hover:bg-ios-gray-6"
                  onClick={() => navigateToScan(scan.id)}
                >
                  <div className="w-12 h-12 bg-ios-gray-6 rounded-lg flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-ios-gray-2" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{scan.foodName}</div>
                    <div className="text-xs text-ios-gray-2">
                      {formatDistanceToNow(scan.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full ${
                      scan.isVegan 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      <span className="text-xs font-medium">
                        {scan.isVegan ? '✓ Vegan' : '✗ Not Vegan'}
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
                <Lightbulb className="w-4 h-4 ios-blue" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Pro Tip</h4>
                <p className="text-sm text-ios-gray-2 leading-relaxed">
                  For best results, ensure ingredients lists are clearly visible and well-lit. 
                  Our AI can analyze both whole foods and ingredient labels!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageCapture(file);
            e.target.value = '';
          }
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageSelect(file);
            e.target.value = '';
          }
        }}
      />

      {/* Loading Modal */}
      <LoadingModal isOpen={isAnalyzing} />
    </>
  );
}
