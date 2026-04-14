import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }).then((r) => r.data),
  login: (email: string, password: string) =>
    api
      .post<{ access_token: string }>('/auth/login', { email, password })
      .then((r) => r.data),
  me: () =>
    api
      .get<{ id: string; email: string; created_at: string }>('/auth/me')
      .then((r) => r.data),
}

// ── Projects ─────────────────────────────────────────────────────────────────
export interface RoadmapPhase {
  id: string
  phase: string
  description: string
  goals: string[]
  deliverables: string[]
}

export interface Task {
  id: string
  phase: string
  name: string
  description: string
  estimated_hours: number
  completed: boolean
  completed_at: string | null
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  level: string
  domain: string
  business_value: string
  unique_aspects: string
  technologies: string[]
  roadmap: RoadmapPhase[]
  tasks: Task[]
  progress: number
  created_at: string
  updated_at: string
}

export interface GenerateRequest {
  level: string
  technologies: string[]
  domain?: string
  business_value?: string
  unique_aspects?: string
}

export interface CoachRequest {
  project_title: string
  level: string
  domain: string
  done_tasks: number
  total_tasks: number
  completed_phases: number
  total_phases: number
  daily_streak: number
  active_phase?: string | null
}

export interface CoachResponse {
  message: string
}

export const projectsApi = {
  list: () => api.get<Project[]>('/projects').then((r) => r.data),
  get: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  generate: (payload: GenerateRequest) =>
    api.post<Project>('/projects/generate', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, payload).then((r) => r.data),
  coach: (id: string, payload: CoachRequest) =>
    api.post<CoachResponse>(`/projects/${id}/coach`, payload).then((r) => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`).then((r) => r.data),
}
