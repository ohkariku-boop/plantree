export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  commonNames?: string[];
  imageUrl?: string; // base64 or object URL
  addedAt: string; // ISO
  lastWatered?: string;
  notes?: string;
  care?: CareInfo;
  healthStatus?: 'healthy' | 'needs-attention' | 'critical' | 'unknown';
}

export interface CareInfo {
  light: string;
  water: string;
  humidity?: string;
  soil?: string;
  temperature?: string;
  fertilizing?: string;
  pruning?: string;
  repotting?: string;
  tips?: string[];
}

export interface JournalEntry {
  id: string;
  plantId: string;
  date: string; // ISO
  imageUrl?: string;
  notes?: string;
  healthNotes?: string;
  careActions?: string[]; // e.g. ["watered", "rotated"]
}

export interface DiagnosisResult {
  plantName?: string;
  issues: {
    name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    causes?: string[];
  }[];
  recoverySteps: string[];
  preventionTips?: string[];
  confidence?: number;
}

export interface IdentificationResult {
  name: string;
  scientificName?: string;
  confidence: number;
  commonNames?: string[];
  description?: string;
  care?: CareInfo;
  alternatives?: { name: string; confidence: number }[];
}

export interface AppSettings {
  openRouterApiKey?: string;
  preferredModel?: string;
  theme?: 'light' | 'dark' | 'system';
}
