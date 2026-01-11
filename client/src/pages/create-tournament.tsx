import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  Settings,
  ArrowLeft,
  Trophy,
  HelpCircle,
  Shuffle,
  Eye,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RoundType, roundTypeLabels, insertTournamentSchema } from "@shared/schema";

const participantCounts = [2, 4, 8, 16, 32] as const;

const formSchema = z.object({
  name: z.string().min(1, "اسم البطولة مطلوب"),
  participantCount: z.union([z.literal(2), z.literal(4), z.literal(8), z.literal(16), z.literal(32)]),
  roundsPerGame: z.number().min(1).max(10),
  questionsPerRound: z.number().min(1).max(10),
  roundTypes: z.array(z.enum([
    RoundType.SELECTIVE_WITH_CHOICES,
    RoundType.SELECTIVE_WITHOUT_CHOICES,
    RoundType.FREE_FOR_ALL_WITH_CHOICES,
    RoundType.FREE_FOR_ALL_WITHOUT_CHOICES,
  ])).min(1, "يجب اختيار نوع واحد على الأقل"),
  changeQuestion: z.number().min(0).max(5),
  removeTwoAnswers: z.number().min(0).max(5),
  showChoices: z.number().min(0).max(5),
  participants: z.array(z.string().min(1, "اسم المشارك مطلوب")),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateTournament() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      participantCount: 4,
      roundsPerGame: 4,
      questionsPerRound: 4,
      roundTypes: [
        RoundType.SELECTIVE_WITH_CHOICES,
        RoundType.SELECTIVE_WITHOUT_CHOICES,
        RoundType.FREE_FOR_ALL_WITH_CHOICES,
        RoundType.FREE_FOR_ALL_WITHOUT_CHOICES,
      ],
      changeQuestion: 1,
      removeTwoAnswers: 1,
      showChoices: 1,
      participants: ["", "", "", ""],
    },
  });

  const participantCount = form.watch("participantCount");

  const handleParticipantCountChange = (count: typeof participantCounts[number]) => {
    form.setValue("participantCount", count);
    const currentParticipants = form.getValues("participants");
    if (count > currentParticipants.length) {
      form.setValue(
        "participants",
        [...currentParticipants, ...Array(count - currentParticipants.length).fill("")]
      );
    } else {
      form.setValue("participants", currentParticipants.slice(0, count));
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const tournamentData = {
        name: data.name,
        settings: {
          participantCount: data.participantCount,
          roundsPerGame: data.roundsPerGame,
          questionsPerRound: data.questionsPerRound,
          roundTypes: data.roundTypes,
          helpToolsPerParticipant: {
            changeQuestion: data.changeQuestion,
            removeTwoAnswers: data.removeTwoAnswers,
            showChoices: data.showChoices,
          },
        },
        participants: data.participants,
      };
      return apiRequest("POST", "/api/tournaments", tournamentData);
    },
    onSuccess: async (response) => {
      const tournament = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "تم إنشاء البطولة بنجاح",
        description: `تم إنشاء بطولة "${tournament.name}"`,
      });
      navigate(`/tournament/${tournament.id}`);
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء البطولة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">إنشاء بطولة جديدة</h1>
          <p className="text-muted-foreground">
            أدخل تفاصيل البطولة وإعداداتها
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                معلومات البطولة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم البطولة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل اسم البطولة..."
                        {...field}
                        data-testid="input-tournament-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participantCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد المشاركين</FormLabel>
                    <FormDescription>
                      اختر عدد المشاركين في البطولة (سيتم إنشاء شجرة الإقصاء بناءً على العدد)
                    </FormDescription>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {participantCounts.map((count) => (
                        <Button
                          key={count}
                          type="button"
                          variant={participantCount === count ? "default" : "outline"}
                          className="w-16 h-16 text-xl font-bold"
                          onClick={() => handleParticipantCountChange(count)}
                          data-testid={`button-participant-count-${count}`}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                المشاركون
              </CardTitle>
              <CardDescription>
                أدخل أسماء المشاركين في البطولة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: participantCount }).map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`participants.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المشارك {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`اسم المشارك ${index + 1}...`}
                            {...field}
                            data-testid={`input-participant-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible defaultValue="settings">
            <AccordionItem value="settings">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5" />
                    إعدادات اللعبة
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="roundsPerGame"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عدد الجولات لكل مباراة</FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="flex-1"
                                  data-testid="slider-rounds"
                                />
                              </FormControl>
                              <Badge variant="secondary" className="min-w-[3rem] justify-center">
                                {field.value}
                              </Badge>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="questionsPerRound"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عدد الأسئلة لكل جولة</FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="flex-1"
                                  data-testid="slider-questions"
                                />
                              </FormControl>
                              <Badge variant="secondary" className="min-w-[3rem] justify-center">
                                {field.value}
                              </Badge>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="roundTypes"
                      render={() => (
                        <FormItem>
                          <FormLabel>أنواع الجولات</FormLabel>
                          <FormDescription>
                            اختر أنواع الجولات المتاحة في المباريات
                          </FormDescription>
                          <div className="grid gap-3 sm:grid-cols-2 pt-2">
                            {Object.entries(roundTypeLabels).map(([value, label]) => (
                              <FormField
                                key={value}
                                control={form.control}
                                name="roundTypes"
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(value as RoundType)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          if (checked) {
                                            field.onChange([...current, value]);
                                          } else {
                                            field.onChange(
                                              current.filter((v) => v !== value)
                                            );
                                          }
                                        }}
                                        data-testid={`checkbox-round-type-${value}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer flex-1">
                                      {label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="help-tools">
              <Card className="mt-4">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5" />
                    أدوات المساعدة
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      حدد عدد أدوات المساعدة المتاحة لكل مشارك في كل مباراة
                    </p>
                    <div className="grid gap-6 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="changeQuestion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4" />
                              تغيير السؤال
                            </FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={5}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="flex-1"
                                  data-testid="slider-change-question"
                                />
                              </FormControl>
                              <Badge variant="secondary" className="min-w-[2rem] justify-center">
                                {field.value}
                              </Badge>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="removeTwoAnswers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <XCircle className="h-4 w-4" />
                              حذف إجابتين
                            </FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={5}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="flex-1"
                                  data-testid="slider-remove-two"
                                />
                              </FormControl>
                              <Badge variant="secondary" className="min-w-[2rem] justify-center">
                                {field.value}
                              </Badge>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="showChoices"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              إظهار الخيارات
                            </FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={5}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="flex-1"
                                  data-testid="slider-show-choices"
                                />
                              </FormControl>
                              <Badge variant="secondary" className="min-w-[2rem] justify-center">
                                {field.value}
                              </Badge>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              data-testid="button-cancel"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={createMutation.isPending}
              data-testid="button-create-submit"
            >
              {createMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 ml-2" />
                  إنشاء البطولة
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
