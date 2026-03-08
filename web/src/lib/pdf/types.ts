export interface SerializedWorkProject {
  projectId: string
  title: string
  summary: string
  accomplishments: string[]
}

export interface SerializedProfile {
  name: string
  label: string
  email: string
  url?: string
  summary: string
  profiles: { network: string; url: string }[]
}

export interface SerializedWork {
  company: string
  role: string
  dateStart: string
  dateEnd?: string
  isCurrent: boolean
  projects?: SerializedWorkProject[]
  highlights: string[]
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
  blogPosts: SerializedBlogPost[]
  education: SerializedEducation[]
  certificates: SerializedCertificate[]
  awards: SerializedAward[]
  skills?: SerializedSkillCategory[]
}
