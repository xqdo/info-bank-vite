import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy, HelpCircle, Users, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Tournament, Match, Participant, Question, GameState } from "@shared/schema";
import { roundTypeLabels, RoundType } from "@shared/schema";

interface DisplayData {
  tournament: Tournament;
  match: Match | null;
  participants: Participant[];
  gameState: GameState | null;
  currentQuestion: Question | null;
}

export default function GameDisplay() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const tournamentId = params.get("tournament");
  const matchId = params.get("match");

  const { data, isLoading } = useQuery<DisplayData>({
    queryKey: ["/api/display", tournamentId, matchId],
    enabled: !!tournamentId,
    refetchInterval: 1000,
  });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Trophy className="h-24 w-24 mx-auto text-primary" />
          </div>
          <h1 className="text-4xl font-bold">بنك المعلومات</h1>
          <p className="text-xl text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const { tournament, match, participants, gameState, currentQuestion } = data;

  if (!match || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Trophy className="h-32 w-32 mx-auto text-primary" />
          <h1 className="text-5xl font-bold">{tournament.name}</h1>
          <p className="text-2xl text-muted-foreground">في انتظار بدء المباراة...</p>
        </div>
      </div>
    );
  }

  const participant1 = participants.find((p) => p.id === match.participant1Id);
  const participant2 = participants.find((p) => p.id === match.participant2Id);

  const isSelectiveRound =
    gameState.currentRoundType === RoundType.SELECTIVE_WITH_CHOICES ||
    gameState.currentRoundType === RoundType.SELECTIVE_WITHOUT_CHOICES;
  const showChoices =
    gameState.currentRoundType === RoundType.SELECTIVE_WITH_CHOICES ||
    gameState.currentRoundType === RoundType.FREE_FOR_ALL_WITH_CHOICES ||
    gameState.showingChoices;

  const currentTurnParticipant = isSelectiveRound && gameState.currentTurnParticipantId
    ? participants.find((p) => p.id === gameState.currentTurnParticipantId)
    : null;

  const totalQuestions = tournament.settings.roundsPerGame * tournament.settings.questionsPerRound;
  const currentQuestionNum =
    (gameState.currentRound - 1) * tournament.settings.questionsPerRound + gameState.currentQuestionIndex + 1;

  if (match.status === "completed") {
    const winner = participants.find((p) => p.id === match.winnerId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-8">
          <Trophy className="h-32 w-32 mx-auto text-yellow-500 animate-bounce" />
          <h1 className="text-5xl font-bold">المباراة انتهت</h1>
          <div className="text-3xl">
            الفائز: <span className="text-primary font-bold">{winner?.name}</span>
          </div>
          <div className="text-6xl font-bold">
            {match.participant1Score} - {match.participant2Score}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Trophy className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">{tournament.name}</span>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {roundTypeLabels[gameState.currentRoundType]}
        </Badge>
        <div className="text-lg">
          الجولة {gameState.currentRound} | السؤال {currentQuestionNum}/{totalQuestions}
        </div>
      </div>

      <div className="flex justify-center items-center gap-8 mb-6">
        <ScoreCard
          name={participant1?.name || "—"}
          score={match.participant1Score}
          isActive={currentTurnParticipant?.id === match.participant1Id}
        />
        <div className="text-4xl font-bold text-muted-foreground">VS</div>
        <ScoreCard
          name={participant2?.name || "—"}
          score={match.participant2Score}
          isActive={currentTurnParticipant?.id === match.participant2Id}
        />
      </div>

      <div className="flex-1 flex items-center justify-center">
        {!gameState.questionRevealed ? (
          <Card className="w-full max-w-4xl p-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <HelpCircle className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-3xl font-medium text-muted-foreground">
              في انتظار السؤال...
            </h2>
            {currentTurnParticipant && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                <span className="text-2xl">دور: {currentTurnParticipant.name}</span>
              </div>
            )}
          </Card>
        ) : currentQuestion ? (
          <div className="w-full max-w-5xl space-y-8">
            <Card className="p-8 bg-gradient-to-br from-card to-card/80">
              <div className="text-4xl font-bold text-center leading-relaxed">
                {currentQuestion.text}
              </div>
            </Card>

            {showChoices && (
              <div className="grid gap-4 sm:grid-cols-2">
                {currentQuestion.choices.map((choice, index) => {
                  const isRemoved = gameState.removedChoices.includes(index);
                  const isCorrect = index === currentQuestion.correctAnswerIndex;
                  const showCorrect = gameState.answerRevealed && isCorrect;
                  const showWrong = gameState.answerRevealed && !isCorrect && !isRemoved;

                  return (
                    <Card
                      key={index}
                      className={`p-6 text-center transition-all ${
                        isRemoved
                          ? "opacity-20 scale-95"
                          : showCorrect
                          ? "bg-green-500 text-white scale-105 shadow-xl"
                          : showWrong
                          ? "opacity-50"
                          : "hover-elevate"
                      }`}
                      data-testid={`display-choice-${index}`}
                    >
                      <span className="text-2xl font-bold ml-3">
                        {String.fromCharCode(1571 + index)}.
                      </span>
                      <span className="text-2xl">{choice}</span>
                    </Card>
                  );
                })}
              </div>
            )}

            {!showChoices && (
              <Card className="p-12 text-center bg-muted">
                <div className="text-2xl text-muted-foreground">
                  أجب على السؤال بدون خيارات
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="w-full max-w-4xl p-12 text-center">
            <h2 className="text-3xl text-muted-foreground">لا يوجد سؤال</h2>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <Progress
          value={(currentQuestionNum / totalQuestions) * 100}
          className="h-3"
        />
      </div>
    </div>
  );
}

interface ScoreCardProps {
  name: string;
  score: number;
  isActive: boolean;
}

function ScoreCard({ name, score, isActive }: ScoreCardProps) {
  return (
    <Card
      className={`p-6 min-w-[200px] text-center transition-all ${
        isActive ? "ring-4 ring-primary shadow-xl scale-105" : ""
      }`}
    >
      <div className="text-6xl font-bold text-primary mb-2">{score}</div>
      <div className="text-xl font-medium">{name}</div>
      {isActive && (
        <Badge className="mt-2 gap-1">
          <Zap className="h-3 w-3" />
          دوره
        </Badge>
      )}
    </Card>
  );
}
