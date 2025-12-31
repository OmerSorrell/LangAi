/**
 * Agents
 *
 * Export all agent-related modules
 */

export {
  TeacherAgent,
  createTeacher,
  type TeacherConfig,
  type TeacherResponse,
  type ConversationMessage,
  type Correction,
} from './teacher';

export {
  buildTeacherPrompt,
  getGreetingPrompt,
  type TeacherContext,
  type SupportedLanguage,
  type ProficiencyLevel,
  type InteractionMode,
} from './prompts/system-prompt';
