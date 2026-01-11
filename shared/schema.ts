import { z } from "zod";

export const RoundType = {
  SELECTIVE_WITH_CHOICES: "selective_with_choices",
  SELECTIVE_WITHOUT_CHOICES: "selective_without_choices",
  FREE_FOR_ALL_WITH_CHOICES: "free_for_all_with_choices",
  FREE_FOR_ALL_WITHOUT_CHOICES: "free_for_all_without_choices",
} as const;

export type RoundType = (typeof RoundType)[keyof typeof RoundType];

export const MatchStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const TournamentStatus = {
  DRAFT: "draft",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export type TournamentStatus = (typeof TournamentStatus)[keyof typeof TournamentStatus];

export const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  choices: z.array(z.string()).length(4),
  correctAnswerIndex: z.number().min(0).max(3),
  category: z.string().optional(),
});

export type Question = z.infer<typeof questionSchema>;

export const insertQuestionSchema = questionSchema.omit({ id: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export const participantSchema = z.object({
  id: z.string(),
  name: z.string(),
  tournamentId: z.string(),
});

export type Participant = z.infer<typeof participantSchema>;

export const insertParticipantSchema = participantSchema.omit({ id: true });
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

export const helpToolsSchema = z.object({
  changeQuestion: z.number().default(1),
  removeTwoAnswers: z.number().default(1),
  showChoices: z.number().default(1),
});

export type HelpTools = z.infer<typeof helpToolsSchema>;

export const tournamentSettingsSchema = z.object({
  participantCount: z.union([z.literal(2), z.literal(4), z.literal(8), z.literal(16), z.literal(32)]),
  roundsPerGame: z.number().min(1).max(10).default(4),
  questionsPerRound: z.number().min(1).max(10).default(4),
  roundTypes: z.array(z.enum([
    RoundType.SELECTIVE_WITH_CHOICES,
    RoundType.SELECTIVE_WITHOUT_CHOICES,
    RoundType.FREE_FOR_ALL_WITH_CHOICES,
    RoundType.FREE_FOR_ALL_WITHOUT_CHOICES,
  ])).default([
    RoundType.SELECTIVE_WITH_CHOICES,
    RoundType.SELECTIVE_WITHOUT_CHOICES,
    RoundType.FREE_FOR_ALL_WITH_CHOICES,
    RoundType.FREE_FOR_ALL_WITHOUT_CHOICES,
  ]),
  helpToolsPerParticipant: helpToolsSchema.default({
    changeQuestion: 1,
    removeTwoAnswers: 1,
    showChoices: 1,
  }),
});

export type TournamentSettings = z.infer<typeof tournamentSettingsSchema>;

export const tournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  settings: tournamentSettingsSchema,
  status: z.enum([TournamentStatus.DRAFT, TournamentStatus.IN_PROGRESS, TournamentStatus.COMPLETED]),
  createdAt: z.string(),
});

export type Tournament = z.infer<typeof tournamentSchema>;

export const insertTournamentSchema = z.object({
  name: z.string().min(1),
  settings: tournamentSettingsSchema,
});

export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export const matchSchema = z.object({
  id: z.string(),
  tournamentId: z.string(),
  roundNumber: z.number(),
  matchNumber: z.number(),
  participant1Id: z.string().nullable(),
  participant2Id: z.string().nullable(),
  participant1Score: z.number().default(0),
  participant2Score: z.number().default(0),
  winnerId: z.string().nullable(),
  status: z.enum([MatchStatus.PENDING, MatchStatus.IN_PROGRESS, MatchStatus.COMPLETED]),
  nextMatchId: z.string().nullable(),
});

export type Match = z.infer<typeof matchSchema>;

export const insertMatchSchema = matchSchema.omit({ id: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export const participantHelpToolsSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  participantId: z.string(),
  changeQuestionRemaining: z.number(),
  removeTwoAnswersRemaining: z.number(),
  showChoicesRemaining: z.number(),
});

export type ParticipantHelpTools = z.infer<typeof participantHelpToolsSchema>;

export const gameStateSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  currentRound: z.number().default(1),
  currentQuestionIndex: z.number().default(0),
  currentRoundType: z.enum([
    RoundType.SELECTIVE_WITH_CHOICES,
    RoundType.SELECTIVE_WITHOUT_CHOICES,
    RoundType.FREE_FOR_ALL_WITH_CHOICES,
    RoundType.FREE_FOR_ALL_WITHOUT_CHOICES,
  ]),
  currentTurnParticipantId: z.string().nullable(),
  questionIds: z.array(z.string()),
  usedQuestionIds: z.array(z.string()),
  removedChoices: z.array(z.number()).default([]),
  showingChoices: z.boolean().default(false),
  questionRevealed: z.boolean().default(false),
  answerRevealed: z.boolean().default(false),
});

export type GameState = z.infer<typeof gameStateSchema>;

export const gameScoreSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  participantId: z.string(),
  roundNumber: z.number(),
  questionIndex: z.number(),
  points: z.number(),
  correct: z.boolean(),
});

export type GameScore = z.infer<typeof gameScoreSchema>;

export const roundTypeLabels: Record<RoundType, string> = {
  [RoundType.SELECTIVE_WITH_CHOICES]: "انتقائي مع الخيارات",
  [RoundType.SELECTIVE_WITHOUT_CHOICES]: "انتقائي بدون خيارات",
  [RoundType.FREE_FOR_ALL_WITH_CHOICES]: "حر للجميع مع الخيارات",
  [RoundType.FREE_FOR_ALL_WITHOUT_CHOICES]: "حر للجميع بدون خيارات",
};

export const matchStatusLabels: Record<MatchStatus, string> = {
  [MatchStatus.PENDING]: "قادمة",
  [MatchStatus.IN_PROGRESS]: "جارية",
  [MatchStatus.COMPLETED]: "منتهية",
};

export const tournamentStatusLabels: Record<TournamentStatus, string> = {
  [TournamentStatus.DRAFT]: "مسودة",
  [TournamentStatus.IN_PROGRESS]: "جارية",
  [TournamentStatus.COMPLETED]: "منتهية",
};
