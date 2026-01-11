import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy, PlusCircle, Play, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tournament } from "@shared/schema";
import { tournamentStatusLabels } from "@shared/schema";

export default function Home() {
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const activeTournaments = tournaments?.filter(t => t.status === "in_progress") || [];
  const recentTournaments = tournaments?.slice(0, 5) || [];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">مرحباً بك في بنك المعلومات</h1>
        <p className="text-muted-foreground text-lg">
          أنشئ وأدر مسابقات معرفية بنظام الإقصاء الفردي
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي البطولات</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{tournaments?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">البطولات النشطة</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{activeTournaments.length}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاركين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">
                {tournaments?.reduce((acc, t) => acc + t.settings.participantCount, 0) || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر تحديث</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-medium">اليوم</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/create">
              <Button className="w-full justify-start gap-3" size="lg" data-testid="button-create-tournament">
                <PlusCircle className="h-5 w-5" />
                إنشاء بطولة جديدة
              </Button>
            </Link>
            <Link href="/tournaments">
              <Button variant="outline" className="w-full justify-start gap-3" size="lg" data-testid="button-view-tournaments">
                <Trophy className="h-5 w-5" />
                عرض جميع البطولات
              </Button>
            </Link>
            {activeTournaments.length > 0 && (
              <Link href={`/tournament/${activeTournaments[0].id}`}>
                <Button variant="secondary" className="w-full justify-start gap-3" size="lg" data-testid="button-continue-tournament">
                  <Play className="h-5 w-5" />
                  متابعة البطولة النشطة
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>آخر البطولات</CardTitle>
            <Link href="/tournaments">
              <Button variant="ghost" size="sm" data-testid="link-view-all">
                عرض الكل
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentTournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد بطولات بعد</p>
                <Link href="/create">
                  <Button variant="ghost" className="mt-2 underline" data-testid="button-create-first">
                    أنشئ أول بطولة
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTournaments.map((tournament) => (
                  <Link key={tournament.id} href={`/tournament/${tournament.id}`}>
                    <div className="flex items-center justify-between gap-4 p-4 rounded-md border hover-elevate cursor-pointer" data-testid={`tournament-card-${tournament.id}`}>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{tournament.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tournament.settings.participantCount} مشارك
                        </p>
                      </div>
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
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
