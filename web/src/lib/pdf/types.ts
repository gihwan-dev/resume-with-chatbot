export interface SerializedProfile {
  name: string
  label: string
  email: string
  url?: string
  summary: string
  profiles: { network: string; username: string; url: string }[]
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
}

export interface SerializedProject {
  resumeItemId: string
  title: string
  summary: string
  hasPortfolio: boolean
  technologies: string[]
  accomplishments: string[]
  evidenceIds: string[]
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
  work: SerializedWork[]
  projects: SerializedProject[]
  blogPosts: SerializedBlogPost[]
  education: SerializedEducation[]
  certificates: SerializedCertificate[]
  awards: SerializedAward[]
  skills?: SerializedSkillCategory[]
}
