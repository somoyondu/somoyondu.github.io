export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/** Maps 1:1 to the tabs in the public site's AllExecutives component. */
export enum PositionGroup {
  TOP_LEADER = 'TOP_LEADER',
  TOP_EXECUTIVE = 'TOP_EXECUTIVE',
  ORGANIZING = 'ORGANIZING',
  OFFICIAL = 'OFFICIAL',
  MEMBER = 'MEMBER',
}

export enum PostCategory {
  NOTICE = 'NOTICE',
  BLOG = 'BLOG',
  PRESS = 'PRESS',
}

export enum SubmissionStatus {
  NEW = 'NEW',
  READ = 'READ',
  REPLIED = 'REPLIED',
  SPAM = 'SPAM',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PUBLISH = 'PUBLISH',
  REORDER = 'REORDER',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CLONE = 'CLONE',
}
