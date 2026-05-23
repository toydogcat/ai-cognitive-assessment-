export enum EvaluationType {
  MMSE = "MMSE",
  MOCA = "MoCA",
  CDT = "CDT",
  CASI = "CASI"
}

export enum EvaluationForm {
  FORM_A = "Form_A",
  FORM_B = "Form_B"
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "男" | "女" | "其他";
  education: string;
  notes?: string;
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

// Represent an answer/scoring for a specific section
export interface QuestionProgress {
  id: string;
  category: string;
  title: string;
  prompt: string; // Instructions for subject
  testerAdvice: string; // Instructions for assessor
  maxScore: number;
  score: number;
  checkedPoints: { label: string; scoreContribution: number; checked: boolean }[];
  subjectAnswerText?: string;
  assessorNotes?: string;
  canvasDrawing?: DrawingPath[]; // for visuospatial tasks (like CDT, cube, Pentagons, Trail-making)
  // special dynamic widgets:
  widgetType?: "naming" | "calculation" | "serial_trail" | "recall_words" | "drawing" | "standard_checklist";
  wordsToRemember?: string[];
}

export interface TestSession {
  id: string;
  patientId: string;
  testType: EvaluationType;
  formVersion: EvaluationForm;
  date: string;
  progressIndex: number;
  questions: QuestionProgress[];
  isCompleted: boolean;
  scoreSummary?: {
    total: number;
    max: number;
    cognitiveStatus: string;
    aiReportHtml?: string;
  };
}
