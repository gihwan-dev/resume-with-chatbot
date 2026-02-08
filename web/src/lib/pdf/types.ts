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
}

export interface SerializedProject {
  title: string
  company?: string
  description: string
  techStack: string[]
  link?: string
  github?: string
  dateStart: string
  dateEnd?: string
  body?: string
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

export interface SerializedResumeData {
  profile: SerializedProfile
  work: SerializedWork[]
  projects: SerializedProject[]
  education: SerializedEducation[]
  certificates: SerializedCertificate[]
  awards: SerializedAward[]
  skills?: SerializedSkillCategory[]
}
