import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match, Participant } from "@shared/schema";
import { matchStatusLabels } from "@shared/schema";

interface TournamentBracketProps {
  matches: Match[];
  participants: Participant[];
  onMatchClick?: (matchId: string) => void;
}

export function TournamentBracket({
  matches,
  participants,
  onMatchClick,
}: TournamentBracketProps) {
  const participantMap = useMemo(() => {
    const map = new Map<string, Participant>();
    participants.forEach((p) => map.set(p.id, p));
    return map;
  }, [participants]);

  const rounds = useMemo(() => {
    const roundsMap = new Map<number, Match[]>();
    matches.forEach((match) => {
      const roundMatches = roundsMap.get(match.roundNumber) || [];
      roundMatches.push(match);
      roundsMap.set(match.roundNumber, roundMatches);
    });

    const sortedRounds = Array.from(roundsMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([roundNum, roundMatches]) => ({
        roundNumber: roundNum,
        matches: roundMatches.sort((a, b) => a.matchNumber - b.matchNumber),
      }));

    return sortedRounds;
  }, [matches]);

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    if (roundNumber === totalRounds) return "النهائي";
    if (roundNumber === totalRounds - 1) return "نصف النهائي";
    if (roundNumber === totalRounds - 2) return "ربع النهائي";
    return `الجولة ${roundNumber}`;
  };

  const getParticipantName = (participantId: string | null) => {
    if (!participantId) return "—";
    return participantMap.get(participantId)?.name || "غير معروف";
  };

  if (rounds.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        لا توجد مباريات بعد
      </div>
    );
  }

  const totalRounds = Math.max(...rounds.map((r) => r.roundNumber));

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max" style={{ direction: "ltr" }}>
        {rounds.map((round) => (
          <div key={round.roundNumber} className="flex flex-col gap-4">
            <div className="text-center font-semibold text-sm text-muted-foreground py-2 px-4 bg-muted rounded-md">
              {getRoundName(round.roundNumber, totalRounds)}
            </div>
            <div
              className="flex flex-col justify-around flex-1 gap-4"
              style={{
                paddingTop: `${Math.pow(2, round.roundNumber - 1) * 1.5 - 1.5}rem`,
                paddingBottom: `${Math.pow(2, round.roundNumber - 1) * 1.5 - 1.5}rem`,
              }}
            >
              {round.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  participant1Name={getParticipantName(match.participant1Id)}
                  participant2Name={getParticipantName(match.participant2Id)}
                  onClick={() => onMatchClick?.(match.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  participant1Name: string;
  participant2Name: string;
  onClick?: () => void;
}

function MatchCard({
  match,
  participant1Name,
  participant2Name,
  onClick,
}: MatchCardProps) {
  const isActive = match.status === "in_progress";
  const isCompleted = match.status === "completed";

  return (
    <Card
      className={`w-48 cursor-pointer transition-all ${
        isActive ? "ring-2 ring-primary shadow-lg" : ""
      } hover-elevate`}
      onClick={onClick}
      data-testid={`match-card-${match.id}`}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant={
              isActive ? "default" : isCompleted ? "secondary" : "outline"
            }
            className="text-xs"
          >
            {matchStatusLabels[match.status]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            م{match.matchNumber}
          </span>
        </div>
        <div className="space-y-1">
          <ParticipantRow
            name={participant1Name}
            score={match.participant1Score}
            isWinner={isCompleted && match.winnerId === match.participant1Id}
            hasBye={!match.participant2Id && !!match.participant1Id}
          />
          <div className="border-t" />
          <ParticipantRow
            name={participant2Name}
            score={match.participant2Score}
            isWinner={isCompleted && match.winnerId === match.participant2Id}
            hasBye={!match.participant1Id && !!match.participant2Id}
          />
        </div>
      </div>
    </Card>
  );
}

interface ParticipantRowProps {
  name: string;
  score: number;
  isWinner: boolean;
  hasBye: boolean;
}

function ParticipantRow({ name, score, isWinner, hasBye }: ParticipantRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-2 py-1 px-2 rounded ${
        isWinner ? "bg-primary/10 font-semibold" : ""
      }`}
      style={{ direction: "rtl" }}
    >
      <span className="text-sm truncate flex-1">{name}</span>
      {hasBye ? (
        <Badge variant="outline" className="text-xs">
          تأهل تلقائي
        </Badge>
      ) : (
        <span className="text-sm font-medium min-w-[1.5rem] text-center">
          {score}
        </span>
      )}
    </div>
  );
}
