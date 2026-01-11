import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  XCircle,
  Eye,
  Check,
  Trophy,
  Users,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tournament, Match, Participant, Question, GameState, ParticipantHelpTools } from "@shared/schema";
import { roundTypeLabels, RoundType } from "@shared/schema";

interface MatchData {
  match: Match;
  tournament: Tournament;
  participants: Participant[];
  gameState: GameState | null;
  currentQuestion: Question | null;
  helpTools: ParticipantHelpTools[];
}

export default function MatchControl() {
  const [, params] = useRoute("/tournament/:tournamentId/match/:matchId");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const tournamentId = params?.tournamentId;
  const matchId = params?.matchId;

  const { data, isLoading, refetch } = useQuery<MatchData>({
    queryKey: ["/api/matches", matchId],
    enabled: !!matchId,
    refetchInterval: 2000,
  });

  const startMatchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/matches/${matchId}/start`);
    },
    onSuccess: () => {
      refetch();
      toast({ title: "تم بدء المباراة" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const revealQuestionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/matches/${matchId}/reveal-question`);
    },
    onSuccess: () => refetch(),
  });

  const revealAnswerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/matches/${matchId}/reveal-answer`);
    },
    onSuccess: () => refetch(),
  });

  const recordAnswerMutation = useMutation({
    mutationFn: async ({ participantId, correct }: { participantId: string; correct: boolean }) => {
      return apiRequest("POST", `/api/matches/${matchId}/answer`, { participantId, correct });
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "matches"] });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const nextQuestionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/matches/${matchId}/next-question`);
    },
    onSuccess: () => refetch(),
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const useHelpToolMutation = useMutation({
    mutationFn: async ({ participantId, tool }: { participantId: string; tool: string }) => {
      return apiRequest("POST", `/api/matches/${matchId}/use-help-tool`, { participantId, tool });
    },
    onSuccess: () => refetch(),
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const endMatchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/matches/${matchId}/end`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId] });
      toast({ title: "تم إنهاء المباراة" });
      navigate(`/tournament/${tournamentId}`);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">المباراة غير موجودة</h2>
            <Link href={`/tournament/${tournamentId}`}>
              <Button variant="ghost" className="underline">العودة للبطولة</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { match, tournament, participants, gameState, currentQuestion, helpTools } = data;
  const participant1 = participants.find((p) => p.id === match.participant1Id);
  const participant2 = participants.find((p) => p.id === match.participant2Id);
  const helpTools1 = helpTools.find((h) => h.participantId === match.participant1Id);
  const helpTools2 = helpTools.find((h) => h.participantId === match.participant2Id);

  const isMatchStarted = match.status === "in_progress";
  const isMatchCompleted = match.status === "completed";
  const totalQuestions = tournament.settings.roundsPerGame * tournament.settings.questionsPerRound;
  const currentQuestionNum = gameState
    ? (gameState.currentRound - 1) * tournament.settings.questionsPerRound + gameState.currentQuestionIndex + 1
    : 0;
  const progressPercent = (currentQuestionNum / totalQuestions) * 100;

  const isSelectiveRound = gameState?.currentRoundType === RoundType.SELECTIVE_WITH_CHOICES ||
    gameState?.currentRoundType === RoundType.SELECTIVE_WITHOUT_CHOICES;
  const showChoices = gameState?.currentRoundType === RoundType.SELECTIVE_WITH_CHOICES ||
    gameState?.currentRoundType === RoundType.FREE_FOR_ALL_WITH_CHOICES ||
    gameState?.showingChoices;

  const currentTurnParticipant = isSelectiveRound && gameState?.currentTurnParticipantId
    ? participants.find((p) => p.id === gameState.currentTurnParticipantId)
    : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/tournament/${tournamentId}`)}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {participant1?.name || "—"} ضد {participant2?.name || "—"}
            </h1>
            <p className="text-muted-foreground">{tournament.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/display?tournament=${tournamentId}&match=${matchId}`}>
            <Button variant="outline" className="gap-2" data-testid="button-display">
              <Eye className="h-4 w-4" />
              شاشة العرض
            </Button>
          </Link>
          {isMatchStarted && (
            <Button
              variant="destructive"
              onClick={() => endMatchMutation.mutate()}
              disabled={endMatchMutation.isPending}
              data-testid="button-end-match"
            >
              إنهاء المباراة
            </Button>
          )}
        </div>
      </div>

      {!isMatchStarted && !isMatchCompleted && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-4">المباراة لم تبدأ بعد</h2>
            <Button
              size="lg"
              onClick={() => startMatchMutation.mutate()}
              disabled={startMatchMutation.isPending}
              className="gap-2"
              data-testid="button-start-match"
            >
              <Play className="h-5 w-5" />
              بدء المباراة
            </Button>
          </CardContent>
        </Card>
      )}

      {isMatchCompleted && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">المباراة انتهت</h2>
            <p className="text-muted-foreground mb-4">
              الفائز: {participants.find((p) => p.id === match.winnerId)?.name}
            </p>
            <div className="text-4xl font-bold">
              {match.participant1Score} - {match.participant2Score}
            </div>
          </CardContent>
        </Card>
      )}

      {isMatchStarted && gameState && (
        <>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-medium">
                  الجولة {gameState.currentRound} من {tournament.settings.roundsPerGame}
                </span>
                <Badge>{roundTypeLabels[gameState.currentRoundType]}</Badge>
                <span className="text-sm text-muted-foreground">
                  السؤال {currentQuestionNum} من {totalQuestions}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>السؤال الحالي</CardTitle>
                    {currentTurnParticipant && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        دور: {currentTurnParticipant.name}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!gameState.questionRevealed ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">السؤال مخفي</p>
                      <Button
                        onClick={() => revealQuestionMutation.mutate()}
                        disabled={revealQuestionMutation.isPending}
                        className="gap-2"
                        data-testid="button-reveal-question"
                      >
                        <Eye className="h-4 w-4" />
                        إظهار السؤال
                      </Button>
                    </div>
                  ) : currentQuestion ? (
                    <>
                      <div className="text-xl font-medium text-center p-6 bg-muted rounded-lg">
                        {currentQuestion.text}
                      </div>

                      {showChoices && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {currentQuestion.choices.map((choice, index) => {
                            const isRemoved = gameState.removedChoices.includes(index);
                            const isCorrect = index === currentQuestion.correctAnswerIndex;
                            const showCorrect = gameState.answerRevealed && isCorrect;

                            return (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border text-center transition-all ${
                                  isRemoved
                                    ? "opacity-30 line-through"
                                    : showCorrect
                                    ? "bg-green-500/20 border-green-500"
                                    : "hover-elevate"
                                }`}
                                data-testid={`choice-${index}`}
                              >
                                <span className="font-medium ml-2">
                                  {String.fromCharCode(1571 + index)}.
                                </span>
                                {choice}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex flex-wrap justify-center gap-3">
                        {!gameState.answerRevealed && (
                          <Button
                            onClick={() => revealAnswerMutation.mutate()}
                            disabled={revealAnswerMutation.isPending}
                            variant="outline"
                            className="gap-2"
                            data-testid="button-reveal-answer"
                          >
                            <Check className="h-4 w-4" />
                            إظهار الإجابة الصحيحة
                          </Button>
                        )}
                        <Button
                          onClick={() => nextQuestionMutation.mutate()}
                          disabled={nextQuestionMutation.isPending}
                          className="gap-2"
                          data-testid="button-next-question"
                        >
                          <SkipForward className="h-4 w-4" />
                          السؤال التالي
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      لا يوجد سؤال متاح
                    </div>
                  )}
                </CardContent>
              </Card>

              {gameState.questionRevealed && (
                <Card>
                  <CardHeader>
                    <CardTitle>تسجيل الإجابات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { participant: participant1, id: match.participant1Id },
                        { participant: participant2, id: match.participant2Id },
                      ].map(({ participant, id }) =>
                        participant && id ? (
                          <div key={id} className="p-4 border rounded-lg space-y-3">
                            <div className="font-medium text-center">{participant.name}</div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => recordAnswerMutation.mutate({ participantId: id, correct: true })}
                                disabled={recordAnswerMutation.isPending}
                                variant="outline"
                                className="flex-1 text-green-600 border-green-600 hover:bg-green-600/10"
                                data-testid={`button-correct-${id}`}
                              >
                                <Check className="h-4 w-4 ml-1" />
                                صحيحة
                              </Button>
                              <Button
                                onClick={() => recordAnswerMutation.mutate({ participantId: id, correct: false })}
                                disabled={recordAnswerMutation.isPending}
                                variant="outline"
                                className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                                data-testid={`button-wrong-${id}`}
                              >
                                <XCircle className="h-4 w-4 ml-1" />
                                خاطئة
                              </Button>
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    النتيجة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-around text-center">
                    <div>
                      <div className="text-5xl font-bold text-primary">{match.participant1Score}</div>
                      <div className="text-sm mt-1">{participant1?.name}</div>
                    </div>
                    <div className="text-2xl text-muted-foreground">-</div>
                    <div>
                      <div className="text-5xl font-bold text-primary">{match.participant2Score}</div>
                      <div className="text-sm mt-1">{participant2?.name}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {[
                { participant: participant1, tools: helpTools1, id: match.participant1Id },
                { participant: participant2, tools: helpTools2, id: match.participant2Id },
              ].map(({ participant, tools, id }) =>
                participant && tools && id ? (
                  <Card key={id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{participant.name} - أدوات المساعدة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        disabled={tools.changeQuestionRemaining === 0 || !gameState.questionRevealed}
                        onClick={() => useHelpToolMutation.mutate({ participantId: id, tool: "changeQuestion" })}
                        data-testid={`button-change-question-${id}`}
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          تغيير السؤال
                        </span>
                        <Badge variant="secondary">{tools.changeQuestionRemaining}</Badge>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        disabled={
                          tools.removeTwoAnswersRemaining === 0 ||
                          !showChoices ||
                          gameState.removedChoices.length > 0 ||
                          !gameState.questionRevealed
                        }
                        onClick={() => useHelpToolMutation.mutate({ participantId: id, tool: "removeTwoAnswers" })}
                        data-testid={`button-remove-two-${id}`}
                      >
                        <span className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          حذف إجابتين
                        </span>
                        <Badge variant="secondary">{tools.removeTwoAnswersRemaining}</Badge>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        disabled={
                          tools.showChoicesRemaining === 0 ||
                          showChoices ||
                          !gameState.questionRevealed
                        }
                        onClick={() => useHelpToolMutation.mutate({ participantId: id, tool: "showChoices" })}
                        data-testid={`button-show-choices-${id}`}
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          إظهار الخيارات
                        </span>
                        <Badge variant="secondary">{tools.showChoicesRemaining}</Badge>
                      </Button>
                    </CardContent>
                  </Card>
                ) : null
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
