import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trophy, PlusCircle, Users, Calendar, Trash2, Play, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tournament } from "@shared/schema";
import { tournamentStatusLabels } from "@shared/schema";

export default function Tournaments() {
  const { toast } = useToast();
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/tournaments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "تم حذف البطولة",
        description: "تم حذف البطولة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">البطولات</h1>
          <p className="text-muted-foreground">إدارة جميع البطولات المنشأة</p>
        </div>
        <Link href="/create">
          <Button size="lg" className="gap-2" data-testid="button-new-tournament">
            <PlusCircle className="h-5 w-5" />
            بطولة جديدة
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tournaments?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">لا توجد بطولات</h2>
            <p className="text-muted-foreground mb-6">ابدأ بإنشاء أول بطولة لك</p>
            <Link href="/create">
              <Button size="lg" className="gap-2" data-testid="button-create-first-tournament">
                <PlusCircle className="h-5 w-5" />
                إنشاء بطولة
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments?.map((tournament) => (
            <Card key={tournament.id} className="hover-elevate" data-testid={`tournament-card-${tournament.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">{tournament.name}</CardTitle>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{tournament.settings.participantCount} مشارك</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(tournament.createdAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/tournament/${tournament.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2" data-testid={`button-view-${tournament.id}`}>
                      <Eye className="h-4 w-4" />
                      عرض
                    </Button>
                  </Link>

                  {tournament.status !== "completed" && (
                    <Link href={`/tournament/${tournament.id}/play`} className="flex-1">
                      <Button className="w-full gap-2" data-testid={`button-play-${tournament.id}`}>
                        <Play className="h-4 w-4" />
                        تشغيل
                      </Button>
                    </Link>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${tournament.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف البطولة</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف بطولة "{tournament.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(tournament.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
