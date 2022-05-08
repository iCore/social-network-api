export const userRoles = ['normal', 'moderator', 'administrator'] as const

export type UserRole = typeof userRoles[number]

export const userKeys = ['registration', 'password_recovery'] as const

export type UserKeysType = typeof userKeys[number]

export const userInterests = ['man', 'women'] as const

export type UserInterest = typeof userInterests[number]

export const usersAbout = ['studied_at', 'lived_in', 'worked_in'] as const

export type UserAbout = typeof usersAbout[number]

export const userRelationships = [
  'known',
  'friends',
  'best_friends',
  'boyfriend',
  'girlfriend',
  'married',
  'dad',
  'mom',
  'grandfather',
  'grandmother',
  'daughter',
  'son',
  'grandson',
  'granddaughter'
] as const

export type UserRelationship = typeof userRelationships[number]

export const userReactions = ['like', 'love', 'angry', 'sad', 'haha'] as const

export type UserReaction = typeof userReactions[number]
