export const fileCategories = ['avatar', 'cover', 'post'] as const

export type FileCategory = typeof fileCategories[number]
