import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({ baseURL: apiBaseUrl })

api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('auth') || '{}')
    const token = stored?.state?.token ?? null
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch { /* ignore */ }
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, full_name: string) =>
    api.post('/auth/register', { email, password, full_name }).then((r) => r.data),
  verifyOtp: (email: string, code: string) =>
    api.post<{ message: string }>('/auth/verify-otp', { email, code }).then((r) => r.data),
  resendOtp: (email: string) =>
    api.post<{ message: string }>('/auth/resend-otp', { email }).then((r) => r.data),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (email: string, code: string, new_password: string) =>
    api.post<{ message: string }>('/auth/reset-password', { email, code, new_password }).then((r) => r.data),
  login: (email: string, password: string) =>
    api
      .post<{ access_token: string; full_name: string }>('/auth/login', { email, password })
      .then((r) => r.data),
  me: () =>
    api
      .get<{ id: string; email: string; created_at: string }>('/auth/me')
      .then((r) => r.data),
  updateProfile: (data: { full_name?: string; new_password?: string; current_password?: string }) =>
    api.put<{ id: string; email: string; full_name: string }>('/auth/profile', data).then((r) => r.data),
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

export const statsApi = {
  get: () => api.get<{ total_projects: number }>('/stats').then((r) => r.data),
}
