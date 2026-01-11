import { v4 as uuidv4 } from "uuid";
import db from "./db";
import type {
  Question,
  InsertQuestion,
  Tournament,
  InsertTournament,
  Participant,
  InsertParticipant,
  Match,
  InsertMatch,
  GameState,
  ParticipantHelpTools,
  TournamentSettings,
  HelpTools,
} from "@shared/schema";

export interface IStorage {
  getQuestions(): Promise<Question[]>;
  getRandomQuestions(count: number, excludeIds?: string[]): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  getTournaments(): Promise<Tournament[]>;
  getTournamentById(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournamentStatus(id: string, status: string): Promise<void>;
  deleteTournament(id: string): Promise<void>;

  getParticipantsByTournament(tournamentId: string): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;

  getMatchesByTournament(tournamentId: string): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<void>;

  getGameStateByMatch(matchId: string): Promise<GameState | undefined>;
  createGameState(state: Omit<GameState, "id">): Promise<GameState>;
  updateGameState(matchId: string, updates: Partial<GameState>): Promise<void>;

  getHelpToolsByMatch(matchId: string): Promise<ParticipantHelpTools[]>;
  createHelpTools(tools: Omit<ParticipantHelpTools, "id">): Promise<ParticipantHelpTools>;
  updateHelpTools(id: string, updates: Partial<ParticipantHelpTools>): Promise<void>;
}

export class SQLiteStorage implements IStorage {
  async getQuestions(): Promise<Question[]> {
    const rows = db.prepare("SELECT * FROM questions").all() as any[];
    return rows.map((row) => ({
      id: row.id,
      text: row.text,
      choices: JSON.parse(row.choices),
      correctAnswerIndex: row.correct_answer_index,
      category: row.category,
    }));
  }

  async getRandomQuestions(count: number, excludeIds: string[] = []): Promise<Question[]> {
    const placeholders = excludeIds.length > 0 
      ? `WHERE id NOT IN (${excludeIds.map(() => "?").join(",")})` 
      : "";
    const rows = db
      .prepare(`SELECT * FROM questions ${placeholders} ORDER BY RANDOM() LIMIT ?`)
      .all(...excludeIds, count) as any[];
    return rows.map((row) => ({
      id: row.id,
      text: row.text,
      choices: JSON.parse(row.choices),
      correctAnswerIndex: row.correct_answer_index,
      category: row.category,
    }));
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const row = db.prepare("SELECT * FROM questions WHERE id = ?").get(id) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      text: row.text,
      choices: JSON.parse(row.choices),
      correctAnswerIndex: row.correct_answer_index,
      category: row.category,
    };
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = uuidv4();
    db.prepare(
      "INSERT INTO questions (id, text, choices, correct_answer_index, category) VALUES (?, ?, ?, ?, ?)"
    ).run(id, question.text, JSON.stringify(question.choices), question.correctAnswerIndex, question.category || null);
    return { id, ...question };
  }

  async getTournaments(): Promise<Tournament[]> {
    const rows = db.prepare("SELECT * FROM tournaments ORDER BY created_at DESC").all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      settings: JSON.parse(row.settings) as TournamentSettings,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  async getTournamentById(id: string): Promise<Tournament | undefined> {
    const row = db.prepare("SELECT * FROM tournaments WHERE id = ?").get(id) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      settings: JSON.parse(row.settings) as TournamentSettings,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    db.prepare(
      "INSERT INTO tournaments (id, name, settings, status, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, tournament.name, JSON.stringify(tournament.settings), "draft", createdAt);
    return {
      id,
      name: tournament.name,
      settings: tournament.settings,
      status: "draft",
      createdAt,
    };
  }

  async updateTournamentStatus(id: string, status: string): Promise<void> {
    db.prepare("UPDATE tournaments SET status = ? WHERE id = ?").run(status, id);
  }

  async deleteTournament(id: string): Promise<void> {
    db.prepare("DELETE FROM tournaments WHERE id = ?").run(id);
  }

  async getParticipantsByTournament(tournamentId: string): Promise<Participant[]> {
    const rows = db
      .prepare("SELECT * FROM participants WHERE tournament_id = ?")
      .all(tournamentId) as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      tournamentId: row.tournament_id,
    }));
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const id = uuidv4();
    db.prepare(
      "INSERT INTO participants (id, name, tournament_id) VALUES (?, ?, ?)"
    ).run(id, participant.name, participant.tournamentId);
    return { id, ...participant };
  }

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    const rows = db
      .prepare("SELECT * FROM matches WHERE tournament_id = ? ORDER BY round_number, match_number")
      .all(tournamentId) as any[];
    return rows.map((row) => ({
      id: row.id,
      tournamentId: row.tournament_id,
      roundNumber: row.round_number,
      matchNumber: row.match_number,
      participant1Id: row.participant1_id,
      participant2Id: row.participant2_id,
      participant1Score: row.participant1_score,
      participant2Score: row.participant2_score,
      winnerId: row.winner_id,
      status: row.status,
      nextMatchId: row.next_match_id,
    }));
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const row = db.prepare("SELECT * FROM matches WHERE id = ?").get(id) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      tournamentId: row.tournament_id,
      roundNumber: row.round_number,
      matchNumber: row.match_number,
      participant1Id: row.participant1_id,
      participant2Id: row.participant2_id,
      participant1Score: row.participant1_score,
      participant2Score: row.participant2_score,
      winnerId: row.winner_id,
      status: row.status,
      nextMatchId: row.next_match_id,
    };
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = uuidv4();
    db.prepare(
      `INSERT INTO matches (id, tournament_id, round_number, match_number, participant1_id, participant2_id, 
       participant1_score, participant2_score, winner_id, status, next_match_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      match.tournamentId,
      match.roundNumber,
      match.matchNumber,
      match.participant1Id,
      match.participant2Id,
      match.participant1Score || 0,
      match.participant2Score || 0,
      match.winnerId,
      match.status,
      match.nextMatchId
    );
    return { id, ...match, participant1Score: match.participant1Score || 0, participant2Score: match.participant2Score || 0 };
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.participant1Id !== undefined) {
      fields.push("participant1_id = ?");
      values.push(updates.participant1Id);
    }
    if (updates.participant2Id !== undefined) {
      fields.push("participant2_id = ?");
      values.push(updates.participant2Id);
    }
    if (updates.participant1Score !== undefined) {
      fields.push("participant1_score = ?");
      values.push(updates.participant1Score);
    }
    if (updates.participant2Score !== undefined) {
      fields.push("participant2_score = ?");
      values.push(updates.participant2Score);
    }
    if (updates.winnerId !== undefined) {
      fields.push("winner_id = ?");
      values.push(updates.winnerId);
    }
    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }

    if (fields.length > 0) {
      values.push(id);
      db.prepare(`UPDATE matches SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
  }

  async getGameStateByMatch(matchId: string): Promise<GameState | undefined> {
    const row = db.prepare("SELECT * FROM game_states WHERE match_id = ?").get(matchId) as any;
    if (!row) return undefined;
    return {
      id: row.id,
      matchId: row.match_id,
      currentRound: row.current_round,
      currentQuestionIndex: row.current_question_index,
      currentRoundType: row.current_round_type,
      currentTurnParticipantId: row.current_turn_participant_id,
      questionIds: JSON.parse(row.question_ids),
      usedQuestionIds: JSON.parse(row.used_question_ids),
      removedChoices: JSON.parse(row.removed_choices),
      showingChoices: Boolean(row.showing_choices),
      questionRevealed: Boolean(row.question_revealed),
      answerRevealed: Boolean(row.answer_revealed),
    };
  }

  async createGameState(state: Omit<GameState, "id">): Promise<GameState> {
    const id = uuidv4();
    db.prepare(
      `INSERT INTO game_states (id, match_id, current_round, current_question_index, current_round_type,
       current_turn_participant_id, question_ids, used_question_ids, removed_choices, showing_choices,
       question_revealed, answer_revealed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      state.matchId,
      state.currentRound,
      state.currentQuestionIndex,
      state.currentRoundType,
      state.currentTurnParticipantId,
      JSON.stringify(state.questionIds),
      JSON.stringify(state.usedQuestionIds),
      JSON.stringify(state.removedChoices),
      state.showingChoices ? 1 : 0,
      state.questionRevealed ? 1 : 0,
      state.answerRevealed ? 1 : 0
    );
    return { id, ...state };
  }

  async updateGameState(matchId: string, updates: Partial<GameState>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.currentRound !== undefined) {
      fields.push("current_round = ?");
      values.push(updates.currentRound);
    }
    if (updates.currentQuestionIndex !== undefined) {
      fields.push("current_question_index = ?");
      values.push(updates.currentQuestionIndex);
    }
    if (updates.currentRoundType !== undefined) {
      fields.push("current_round_type = ?");
      values.push(updates.currentRoundType);
    }
    if (updates.currentTurnParticipantId !== undefined) {
      fields.push("current_turn_participant_id = ?");
      values.push(updates.currentTurnParticipantId);
    }
    if (updates.questionIds !== undefined) {
      fields.push("question_ids = ?");
      values.push(JSON.stringify(updates.questionIds));
    }
    if (updates.usedQuestionIds !== undefined) {
      fields.push("used_question_ids = ?");
      values.push(JSON.stringify(updates.usedQuestionIds));
    }
    if (updates.removedChoices !== undefined) {
      fields.push("removed_choices = ?");
      values.push(JSON.stringify(updates.removedChoices));
    }
    if (updates.showingChoices !== undefined) {
      fields.push("showing_choices = ?");
      values.push(updates.showingChoices ? 1 : 0);
    }
    if (updates.questionRevealed !== undefined) {
      fields.push("question_revealed = ?");
      values.push(updates.questionRevealed ? 1 : 0);
    }
    if (updates.answerRevealed !== undefined) {
      fields.push("answer_revealed = ?");
      values.push(updates.answerRevealed ? 1 : 0);
    }

    if (fields.length > 0) {
      values.push(matchId);
      db.prepare(`UPDATE game_states SET ${fields.join(", ")} WHERE match_id = ?`).run(...values);
    }
  }

  async getHelpToolsByMatch(matchId: string): Promise<ParticipantHelpTools[]> {
    const rows = db
      .prepare("SELECT * FROM participant_help_tools WHERE match_id = ?")
      .all(matchId) as any[];
    return rows.map((row) => ({
      id: row.id,
      matchId: row.match_id,
      participantId: row.participant_id,
      changeQuestionRemaining: row.change_question_remaining,
      removeTwoAnswersRemaining: row.remove_two_answers_remaining,
      showChoicesRemaining: row.show_choices_remaining,
    }));
  }

  async createHelpTools(tools: Omit<ParticipantHelpTools, "id">): Promise<ParticipantHelpTools> {
    const id = uuidv4();
    db.prepare(
      `INSERT INTO participant_help_tools (id, match_id, participant_id, change_question_remaining,
       remove_two_answers_remaining, show_choices_remaining) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      tools.matchId,
      tools.participantId,
      tools.changeQuestionRemaining,
      tools.removeTwoAnswersRemaining,
      tools.showChoicesRemaining
    );
    return { id, ...tools };
  }

  async updateHelpTools(id: string, updates: Partial<ParticipantHelpTools>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.changeQuestionRemaining !== undefined) {
      fields.push("change_question_remaining = ?");
      values.push(updates.changeQuestionRemaining);
    }
    if (updates.removeTwoAnswersRemaining !== undefined) {
      fields.push("remove_two_answers_remaining = ?");
      values.push(updates.removeTwoAnswersRemaining);
    }
    if (updates.showChoicesRemaining !== undefined) {
      fields.push("show_choices_remaining = ?");
      values.push(updates.showChoicesRemaining);
    }

    if (fields.length > 0) {
      values.push(id);
      db.prepare(`UPDATE participant_help_tools SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
  }
}

export const storage = new SQLiteStorage();
