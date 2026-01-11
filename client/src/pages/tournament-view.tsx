import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Trophy,
  ArrowLeft,
  Play,
  Users,
  Settings,
  Eye,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TournamentBracket } from "@/components/tournament-bracket";
import type { Tournament, Match, Participant } from "@shared/schema";
import { tournamentStatusLabels, matchStatusLabels, roundTypeLabels } from "@shared/schema";

export default function TournamentView() {
  const [, params] = useRoute("/tournament/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const tournamentId = params?.id;

  const { data: tournament, isLoading: loadingTournament } = useQuery<Tournament>({
    queryKey: ["/api/tournaments", tournamentId],
    enabled: !!tournamentId,
  });

  const { data: matches, isLoading: loadingMatches } = useQuery<Match[]>({
    queryKey: ["/api/tournaments", tournamentId, "matches"],
    enabled: !!tournamentId,
  });

  const { data: participants, isLoading: loadingParticipants } = useQuery<Participant[]>({
    queryKey: ["/api/tournaments", tournamentId, "participants"],
    enabled: !!tournamentId,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/tournaments/${tournamentId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId] });
      toast({
        title: "تم بدء البطولة",
        description: "يمكنك الآن تشغيل المباريات",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = loadingTournament || loadingMatches || loadingParticipants;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">البطولة غير موجودة</h2>
            <Link href="/tournaments">
              <Button variant="ghost" className="underline">العودة للبطولات</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMatch = matches?.find(m => m.status === "in_progress");
  const completedMatches = matches?.filter(m => m.status === "completed").length || 0;
  const totalMatches = matches?.length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/tournaments")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <Badge
                variant={
                  tournament.status === "in_progress"
                    ? "default"
                    : tournament.status === "completed"
                    ? "secondary"
                    : "outline"
                }
              >
                {tournamentStatusLabels[tournament.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {tournament.settings.participantCount} مشارك • {completedMatches}/{totalMatches} مباراة منتهية
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {tournament.status === "draft" && (
            <Button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="gap-2"
              data-testid="button-start-tournament"
            >
              <Play className="h-4 w-4" />
              بدء البطولة
            </Button>
          )}
          {tournament.status === "in_progress" && activeMatch && (
            <Link href={`/tournament/${tournamentId}/match/${activeMatch.id}`}>
              <Button className="gap-2" data-testid="button-continue-match">
                <Play className="h-4 w-4" />
                متابعة المباراة
              </Button>
            </Link>
          )}
          <Link href={`/display?tournament=${tournamentId}`}>
            <Button variant="outline" className="gap-2" data-testid="button-display-mode">
              <Eye className="h-4 w-4" />
              شاشة العرض
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                شجرة البطولة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matches && participants && (
                <TournamentBracket
                  matches={matches}
                  participants={participants}
                  onMatchClick={(matchId) => {
                    if (tournament.status !== "draft") {
                      navigate(`/tournament/${tournamentId}/match/${matchId}`);
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                المشاركون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants?.map((participant, index) => {
                  const isEliminated = matches?.some(
                    (m) =>
                      m.status === "completed" &&
                      ((m.participant1Id === participant.id && m.winnerId !== participant.id) ||
                       (m.participant2Id === participant.id && m.winnerId !== participant.id))
                  );
                  const isWinner = matches?.some(
                    (m) =>
                      m.roundNumber === Math.log2(tournament.settings.participantCount) &&
                      m.status === "completed" &&
                      m.winnerId === participant.id
                  );

                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-md border ${
                        isEliminated ? "opacity-50" : ""
                      } ${isWinner ? "bg-primary/10 border-primary" : ""}`}
                      data-testid={`participant-${participant.id}`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="flex-1 font-medium">{participant.name}</span>
                      {isWinner && (
                        <Badge className="gap-1">
                          <Trophy className="h-3 w-3" />
                          الفائز
                        </Badge>
                      )}
                      {isEliminated && !isWinner && (
                        <Badge variant="secondary">خارج</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات البطولة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الجولات لكل مباراة</span>
                <span className="font-medium">{tournament.settings.roundsPerGame}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">الأسئلة لكل جولة</span>
                <span className="font-medium">{tournament.settings.questionsPerRound}</span>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground text-sm">أنواع الجولات</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tournament.settings.roundTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {roundTypeLabels[type]}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground text-sm">أدوات المساعدة (لكل مشارك)</span>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                  <div className="p-2 rounded-md bg-secondary">
                    <div className="font-bold">{tournament.settings.helpToolsPerParticipant.changeQuestion}</div>
                    <div className="text-xs text-muted-foreground">تغيير</div>
                  </div>
                  <div className="p-2 rounded-md bg-secondary">
                    <div className="font-bold">{tournament.settings.helpToolsPerParticipant.removeTwoAnswers}</div>
                    <div className="text-xs text-muted-foreground">حذف 2</div>
                  </div>
                  <div className="p-2 rounded-md bg-secondary">
                    <div className="font-bold">{tournament.settings.helpToolsPerParticipant.showChoices}</div>
                    <div className="text-xs text-muted-foreground">إظهار</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
