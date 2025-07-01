export interface Stage {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  estimatedCost: {
    min: number;
    max: number;
  };
  requirements: string[];
  nextStages: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface Progress {
  userId: string;
  stageId: string;
  status: Stage['status'];
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
} 