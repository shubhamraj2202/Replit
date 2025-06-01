import { apiRequest } from './queryClient';

export interface MediationResult {
  id: number;
  relationshipContext: string;
  argumentCategory: string;
  participants: Array<{
    name: string;
    role?: string;
    perspective: string;
  }>;
  aiResolution?: string;
  actionItems?: string[];
  fairnessScore?: number;
  status: string;
  createdAt: Date;
}

export async function createMediationSession(sessionData: {
  relationshipContext: string;
  argumentCategory: string;
  participants: Array<{
    name: string;
    role?: string;
    perspective: string;
  }>;
}): Promise<MediationResult> {
  const response = await apiRequest('POST', '/api/sessions', sessionData);
  const result = await response.json();
  
  return {
    ...result,
    createdAt: new Date(result.createdAt)
  };
}

export async function getMediationResult(sessionId: number): Promise<MediationResult> {
  const response = await apiRequest('POST', `/api/sessions/${sessionId}/resolve`);
  const result = await response.json();
  
  return {
    ...result,
    createdAt: new Date(result.createdAt)
  };
}

export async function getRecentSessions(): Promise<MediationResult[]> {
  const response = await apiRequest('GET', '/api/sessions');
  const sessions = await response.json();
  
  return sessions.map((session: any) => ({
    ...session,
    createdAt: new Date(session.createdAt)
  }));
}

export async function getSession(id: number): Promise<MediationResult> {
  const response = await apiRequest('GET', `/api/sessions/${id}`);
  const session = await response.json();
  
  return {
    ...session,
    createdAt: new Date(session.createdAt)
  };
}
