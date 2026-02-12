// Suspect data types
export interface Suspect {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  notes: string;
  isIdentified: boolean;
}

export interface SuspectComparisonData {
  suspectId: string;
  matchScore: number;
  observations: string[];
  timestamp: Date;
}
