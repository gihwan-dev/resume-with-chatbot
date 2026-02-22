export interface SerializedHeroMetric {
  value: string
  label: string
  description?: string
}

export interface SerializedCoreStrength {
  title: string
  summary: string
}

export interface SerializedProfile {
  name: string
  label: string
  email: string
  url?: string
  summary: string
  profiles: { network: string; username: string; url: string }[]
  heroMetrics?: SerializedHeroMetric[]
}

export interface SerializedWork {
  company: string
  role: string
  dateStart: string
  dateEnd?: string
  isCurrent: boolean
  location?: string
  summary: string
  projectTitles: string[]
  highlights: string[]
}

export interface SerializedProject {
  resumeItemId: string
  title: string
  summary: string
  hasPortfolio: boolean
  technologies: string[]
  accomplishments: string[]
  evidenceIds: string[]
  architectureSummary?: string
  measurementMethod?: string
  tradeOffs?: string[]
  ctaLabel?: string
  ctaHref?: string
}

export interface SerializedEducation {
  institution: string
  area: string
  studyType: string
  dateStart: string
  dateEnd?: string
  score?: string
}

export interface SerializedCertificate {
  name: string
  issuer: string
  date: string
  body?: string
}

export interface SerializedAward {
  title: string
  issuer: string
  date: string
  summary?: string
  body?: string
}

export interface SerializedSkillCategory {
  name: string
  items: string[]
}

export interface SerializedBlogPost {
  title: string
  url: string
  publishedAt: string
  summary?: string
}

export interface SerializedResumeData {
  profile: SerializedProfile
  coreStrengths?: SerializedCoreStrength[]
  work: SerializedWork[]
  projects: SerializedProject[]
  blogPosts: SerializedBlogPost[]
  education: SerializedEducation[]
  certificates: SerializedCertificate[]
  awards: SerializedAward[]
  skills?: SerializedSkillCategory[]
}
