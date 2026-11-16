export const SESSION_COOKIE = "session";
/** Set next to the session cookie while the visitor uses a Firebase anonymous (guest) account. */
export const GUEST_COOKIE = "guest";
export const LOGIN_PATH = "/";
export const QUIZ_PATH = "/prova";
export const HOME_PATH = QUIZ_PATH;
export const LEGACY_HOME_PATH = "/inicio";
export const REVIEW_PATH = "/revisar";
export const CARDS_PATH = "/flashcards";
export const RANKING_PATH = "/ranking";
export const HELP_PATH = "/ajuda";
export const ACCOUNT_PATH = "/conta";
export const PRIVACY_PATH = "/privacidade";
export const DELETE_ACCOUNT_INFO_PATH = "/excluir-conta";
export const ACCOUNT_DELETED_PARAM = "conta";
export const NEXT_PARAM = "next";
export const PROTECTED_PATHS = [LEGACY_HOME_PATH, QUIZ_PATH, REVIEW_PATH, CARDS_PATH, RANKING_PATH, HELP_PATH, ACCOUNT_PATH];
/** Guests can take quizzes; these pages send them to the login first. */
export const ACCOUNT_ONLY_PATHS = [REVIEW_PATH, CARDS_PATH, RANKING_PATH, ACCOUNT_PATH];
