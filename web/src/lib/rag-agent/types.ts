/**
 * RAG Agent Types
 *
 * Type definitions for the Agentic RAG system.
 */

// Query Analysis Types
export interface QueryAnalysis {
  intent: QueryIntent
  keywords: string[]
  skillFilters: string[]
  techFilters: string[]
  projectTypeFilter: string | null
}

export type QueryIntent =
  | "skill_inquiry" // Asking about specific skills/abilities
  | "project_inquiry" // Asking about projects/experience
  | "tech_inquiry" // Asking about technology stack
  | "general_info" // General information request
  | "problem_solving" // Asking about problem-solving experience
  | "team_experience" // Asking about team/collaboration experience

// Search Result Types
export interface SearchResult {
  id: string
  title: string
  content: string
  category: string
  skills: string[]
  techStack: string[]
  projectType: string | null
  relevanceScore: number
}

export interface SearchParams {
  searchQuery: string
  skillFilters?: string[]
  techFilters?: string[]
  projectTypeFilter?: string
  limit?: number
}

// Evaluation Types
export interface EvaluationResult {
  isRelevant: boolean
  relevanceScore: number
  coverageScore: number
  suggestedAction: SuggestedAction
  reason: string
}

export type SuggestedAction = "answer" | "rewrite" | "expand"

// Query Rewrite Types
export interface RewriteResult {
  rewrittenQuery: string
  modifications: string[]
}

export type RewriteStrategy = "broaden" | "narrow" | "rephrase" | "decompose"

// Source Type (for client compatibility)
export interface Source {
  id: string
  title: string
  content: string
  category: string
  relevanceScore: number
}

// Firestore Document Types
export interface KnowledgeDocument {
  content: string
  title?: string
  category?: string
  summary?: string
  contextPrefix?: string
  contextualContent?: string
  skills?: string[]
  techStack?: string[]
  projectType?: string
  embedding_field?: number[]
  vector_distance?: number
}

// Agent Configuration
export interface RAGAgentConfig {
  maxSteps?: number
  relevanceThreshold?: number
  initialFetchLimit?: number
  maxResults?: number
}

export const DEFAULT_AGENT_CONFIG: RAGAgentConfig = {
  maxSteps: 5,
  relevanceThreshold: 0.7,
  initialFetchLimit: 10,
  maxResults: 5,
}
