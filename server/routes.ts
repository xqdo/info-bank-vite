import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { RoundType, TournamentStatus, MatchStatus } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournamentById(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      const { name, settings, participants } = req.body;
      
      const tournament = await storage.createTournament({ name, settings });

      for (const participantName of participants) {
        await storage.createParticipant({
          name: participantName,
          tournamentId: tournament.id,
        });
      }

      const createdParticipants = await storage.getParticipantsByTournament(tournament.id);
      
      const numRounds = Math.log2(settings.participantCount);
      const matchesPerRound: Map<number, string[]> = new Map();

      for (let round = numRounds; round >= 1; round--) {
        const matchesInRound = Math.pow(2, numRounds - round);
        const matchIds: string[] = [];

        for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
          const nextMatchRound = round + 1;
          const nextMatchNumber = Math.ceil(matchNum / 2);
          const nextMatchId = round < numRounds 
            ? matchesPerRound.get(nextMatchRound)?.[nextMatchNumber - 1] || null
            : null;

          const participant1Id = round === 1 
            ? createdParticipants[(matchNum - 1) * 2]?.id || null
            : null;
          const participant2Id = round === 1 
            ? createdParticipants[(matchNum - 1) * 2 + 1]?.id || null
            : null;

          const match = await storage.createMatch({
            tournamentId: tournament.id,
            roundNumber: round,
            matchNumber: matchNum,
            participant1Id,
            participant2Id,
            participant1Score: 0,
            participant2Score: 0,
            winnerId: null,
            status: MatchStatus.PENDING,
            nextMatchId,
          });

          matchIds.push(match.id);
        }

        matchesPerRound.set(round, matchIds);
      }

      res.status(201).json(tournament);
    } catch (error) {
      console.error("Error creating tournament:", error);
      res.status(500).json({ error: "Failed to create tournament" });
    }
  });

  app.post("/api/tournaments/:id/start", async (req, res) => {
    try {
      const tournament = await storage.getTournamentById(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      await storage.updateTournamentStatus(req.params.id, TournamentStatus.IN_PROGRESS);

      const matches = await storage.getMatchesByTournament(req.params.id);
      const firstRoundMatches = matches.filter(m => m.roundNumber === 1);
      
      if (firstRoundMatches.length > 0) {
        await storage.updateMatch(firstRoundMatches[0].id, { status: MatchStatus.IN_PROGRESS });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to start tournament" });
    }
  });

  app.delete("/api/tournaments/:id", async (req, res) => {
    try {
      await storage.deleteTournament(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tournament" });
    }
  });

  app.get("/api/tournaments/:id/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByTournament(req.params.id);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  app.get("/api/tournaments/:id/participants", async (req, res) => {
    try {
      const participants = await storage.getParticipantsByTournament(req.params.id);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const tournament = await storage.getTournamentById(match.tournamentId);
      const participants = await storage.getParticipantsByTournament(match.tournamentId);
      const gameState = await storage.getGameStateByMatch(match.id);
      const helpTools = await storage.getHelpToolsByMatch(match.id);

      let currentQuestion = null;
      if (gameState && gameState.questionIds.length > 0) {
        const questionId = gameState.questionIds[gameState.currentQuestionIndex];
        if (questionId) {
          currentQuestion = await storage.getQuestionById(questionId);
        }
      }

      res.json({
        match,
        tournament,
        participants,
        gameState,
        currentQuestion,
        helpTools,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match data" });
    }
  });

  app.post("/api/matches/:id/start", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const tournament = await storage.getTournamentById(match.tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      const totalQuestions = tournament.settings.roundsPerGame * tournament.settings.questionsPerRound;
      const questions = await storage.getRandomQuestions(totalQuestions + 10);
      const questionIds = questions.map(q => q.id);

      const roundType = tournament.settings.roundTypes[0] || RoundType.SELECTIVE_WITH_CHOICES;

      await storage.createGameState({
        matchId: match.id,
        currentRound: 1,
        currentQuestionIndex: 0,
        currentRoundType: roundType,
        currentTurnParticipantId: match.participant1Id,
        questionIds: questionIds.slice(0, totalQuestions),
        usedQuestionIds: [],
        removedChoices: [],
        showingChoices: false,
        questionRevealed: false,
        answerRevealed: false,
      });

      const helpToolsConfig = tournament.settings.helpToolsPerParticipant;
      if (match.participant1Id) {
        await storage.createHelpTools({
          matchId: match.id,
          participantId: match.participant1Id,
          changeQuestionRemaining: helpToolsConfig.changeQuestion,
          removeTwoAnswersRemaining: helpToolsConfig.removeTwoAnswers,
          showChoicesRemaining: helpToolsConfig.showChoices,
        });
      }
      if (match.participant2Id) {
        await storage.createHelpTools({
          matchId: match.id,
          participantId: match.participant2Id,
          changeQuestionRemaining: helpToolsConfig.changeQuestion,
          removeTwoAnswersRemaining: helpToolsConfig.removeTwoAnswers,
          showChoicesRemaining: helpToolsConfig.showChoices,
        });
      }

      await storage.updateMatch(match.id, { status: MatchStatus.IN_PROGRESS });

      res.json({ success: true });
    } catch (error) {
      console.error("Error starting match:", error);
      res.status(500).json({ error: "Failed to start match" });
    }
  });

  app.post("/api/matches/:id/reveal-question", async (req, res) => {
    try {
      await storage.updateGameState(req.params.id, { questionRevealed: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reveal question" });
    }
  });

  app.post("/api/matches/:id/reveal-answer", async (req, res) => {
    try {
      await storage.updateGameState(req.params.id, { answerRevealed: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reveal answer" });
    }
  });

  app.post("/api/matches/:id/answer", async (req, res) => {
    try {
      const { participantId, correct } = req.body;
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      if (correct) {
        const isParticipant1 = participantId === match.participant1Id;
        const newScore = isParticipant1 
          ? match.participant1Score + 1 
          : match.participant2Score + 1;
        
        await storage.updateMatch(match.id, 
          isParticipant1 
            ? { participant1Score: newScore }
            : { participant2Score: newScore }
        );
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record answer" });
    }
  });

  app.post("/api/matches/:id/next-question", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const tournament = await storage.getTournamentById(match.tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      const gameState = await storage.getGameStateByMatch(match.id);
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      const questionsPerRound = tournament.settings.questionsPerRound;
      const roundsPerGame = tournament.settings.roundsPerGame;
      const roundTypes = tournament.settings.roundTypes;

      let newQuestionIndex = gameState.currentQuestionIndex + 1;
      let newRound = gameState.currentRound;
      let newRoundType = gameState.currentRoundType;
      let newTurnParticipantId = gameState.currentTurnParticipantId;

      if (newQuestionIndex >= questionsPerRound) {
        newQuestionIndex = 0;
        newRound = gameState.currentRound + 1;

        if (newRound > roundsPerGame) {
          const winner = match.participant1Score > match.participant2Score
            ? match.participant1Id
            : match.participant1Score < match.participant2Score
            ? match.participant2Id
            : match.participant1Id;

          await storage.updateMatch(match.id, {
            status: MatchStatus.COMPLETED,
            winnerId: winner,
          });

          if (match.nextMatchId) {
            const nextMatch = await storage.getMatchById(match.nextMatchId);
            if (nextMatch) {
              const isFirstSlot = match.matchNumber % 2 === 1;
              await storage.updateMatch(match.nextMatchId, 
                isFirstSlot 
                  ? { participant1Id: winner }
                  : { participant2Id: winner }
              );
            }
          }

          return res.json({ matchComplete: true, winnerId: winner });
        }

        const roundTypeIndex = (newRound - 1) % roundTypes.length;
        newRoundType = roundTypes[roundTypeIndex];
        newTurnParticipantId = match.participant1Id;
      } else {
        const isSelective = newRoundType === RoundType.SELECTIVE_WITH_CHOICES || 
                           newRoundType === RoundType.SELECTIVE_WITHOUT_CHOICES;
        if (isSelective) {
          newTurnParticipantId = gameState.currentTurnParticipantId === match.participant1Id
            ? match.participant2Id
            : match.participant1Id;
        }
      }

      await storage.updateGameState(match.id, {
        currentQuestionIndex: newQuestionIndex,
        currentRound: newRound,
        currentRoundType: newRoundType,
        currentTurnParticipantId: newTurnParticipantId,
        removedChoices: [],
        showingChoices: false,
        questionRevealed: false,
        answerRevealed: false,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error advancing question:", error);
      res.status(500).json({ error: "Failed to advance question" });
    }
  });

  app.post("/api/matches/:id/use-help-tool", async (req, res) => {
    try {
      const { participantId, tool } = req.body;
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const helpTools = await storage.getHelpToolsByMatch(match.id);
      const participantTools = helpTools.find(h => h.participantId === participantId);
      if (!participantTools) {
        return res.status(404).json({ error: "Help tools not found" });
      }

      const gameState = await storage.getGameStateByMatch(match.id);
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      if (tool === "changeQuestion") {
        if (participantTools.changeQuestionRemaining <= 0) {
          return res.status(400).json({ error: "No more change question tools available" });
        }

        const tournament = await storage.getTournamentById(match.tournamentId);
        const newQuestions = await storage.getRandomQuestions(1, gameState.usedQuestionIds);
        
        if (newQuestions.length > 0) {
          const newQuestionIds = [...gameState.questionIds];
          const currentIdx = (gameState.currentRound - 1) * (tournament?.settings.questionsPerRound || 4) + gameState.currentQuestionIndex;
          newQuestionIds[currentIdx] = newQuestions[0].id;

          await storage.updateGameState(match.id, {
            questionIds: newQuestionIds,
            usedQuestionIds: [...gameState.usedQuestionIds, gameState.questionIds[currentIdx]],
            questionRevealed: true,
            answerRevealed: false,
            removedChoices: [],
          });
        }

        await storage.updateHelpTools(participantTools.id, {
          changeQuestionRemaining: participantTools.changeQuestionRemaining - 1,
        });
      } else if (tool === "removeTwoAnswers") {
        if (participantTools.removeTwoAnswersRemaining <= 0) {
          return res.status(400).json({ error: "No more remove two answers tools available" });
        }

        const questionId = gameState.questionIds[gameState.currentQuestionIndex];
        const question = await storage.getQuestionById(questionId);
        if (question) {
          const wrongIndices = [0, 1, 2, 3].filter(i => i !== question.correctAnswerIndex);
          const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
          const toRemove = shuffled.slice(0, 2);

          await storage.updateGameState(match.id, {
            removedChoices: toRemove,
          });
        }

        await storage.updateHelpTools(participantTools.id, {
          removeTwoAnswersRemaining: participantTools.removeTwoAnswersRemaining - 1,
        });
      } else if (tool === "showChoices") {
        if (participantTools.showChoicesRemaining <= 0) {
          return res.status(400).json({ error: "No more show choices tools available" });
        }

        await storage.updateGameState(match.id, {
          showingChoices: true,
        });

        await storage.updateHelpTools(participantTools.id, {
          showChoicesRemaining: participantTools.showChoicesRemaining - 1,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error using help tool:", error);
      res.status(500).json({ error: "Failed to use help tool" });
    }
  });

  app.post("/api/matches/:id/end", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const winner = match.participant1Score >= match.participant2Score
        ? match.participant1Id
        : match.participant2Id;

      await storage.updateMatch(match.id, {
        status: MatchStatus.COMPLETED,
        winnerId: winner,
      });

      if (match.nextMatchId) {
        const nextMatch = await storage.getMatchById(match.nextMatchId);
        if (nextMatch) {
          const isFirstSlot = match.matchNumber % 2 === 1;
          await storage.updateMatch(match.nextMatchId,
            isFirstSlot
              ? { participant1Id: winner }
              : { participant2Id: winner }
          );
        }
      }

      res.json({ success: true, winnerId: winner });
    } catch (error) {
      res.status(500).json({ error: "Failed to end match" });
    }
  });

  app.get("/api/display", async (req, res) => {
    try {
      const tournamentId = req.query.tournament as string;
      const matchId = req.query.match as string;

      if (!tournamentId) {
        return res.status(400).json({ error: "Tournament ID required" });
      }

      const tournament = await storage.getTournamentById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      const participants = await storage.getParticipantsByTournament(tournamentId);
      
      let match = null;
      let gameState = null;
      let currentQuestion = null;

      if (matchId) {
        match = await storage.getMatchById(matchId);
      } else {
        const matches = await storage.getMatchesByTournament(tournamentId);
        match = matches.find(m => m.status === MatchStatus.IN_PROGRESS) || null;
      }

      if (match) {
        gameState = await storage.getGameStateByMatch(match.id);
        if (gameState && gameState.questionIds.length > 0) {
          const questionId = gameState.questionIds[gameState.currentQuestionIndex];
          if (questionId) {
            currentQuestion = await storage.getQuestionById(questionId);
          }
        }
      }

      res.json({
        tournament,
        match,
        participants,
        gameState,
        currentQuestion,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch display data" });
    }
  });

  return httpServer;
}
