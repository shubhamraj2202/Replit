import { apiRequest } from './queryClient';

export interface ScanResult {
  id: number;
  foodName: string;
  isVegan: boolean;
  analysis: string;
  confidence: number;
  imageUrl?: string | null;
  createdAt: Date;
}

export async function analyzeImage(imageFile: File): Promise<ScanResult> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await apiRequest('POST', '/api/analyze', formData);
  const result = await response.json();
  
  return {
    ...result,
    createdAt: new Date(result.createdAt)
  };
}

export async function getRecentScans(): Promise<ScanResult[]> {
  const response = await apiRequest('GET', '/api/scans');
  const scans = await response.json();
  
  return scans.map((scan: any) => ({
    ...scan,
    createdAt: new Date(scan.createdAt)
  }));
}

export async function getScan(id: number): Promise<ScanResult> {
  const response = await apiRequest('GET', `/api/scans/${id}`);
  const scan = await response.json();
  
  return {
    ...scan,
    createdAt: new Date(scan.createdAt)
  };
}
