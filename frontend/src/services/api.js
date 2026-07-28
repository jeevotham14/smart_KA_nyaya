import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
});

// Separate client with longer timeout for AI calls
const aiApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

const authInterceptor = (config) => {
  const token = window.localStorage.getItem('smartNyayaToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
api.interceptors.request.use(authInterceptor);
aiApi.interceptors.request.use(authInterceptor);

api.interceptors.request.use((config) => {
  return config;
});

export function getApiError(error) {
  return error?.response?.data?.detail || error?.message || 'Something went wrong. Please try again.';
}

function incomeToAnnualIncome(income) {
  if (income === 'Below Rs. 1 lakh') return 100000;
  if (income === 'Rs. 1-3 lakh') return 250000;
  if (income === 'Above Rs. 3 lakh') return 500000;
  return null;
}

function serviceTypeToBackend(value) {
  // Directory filter values are already backend enum strings (e.g. 'court', 'dlsa')
  // Keep legacy label→value map for any old callsites
  const legacy = {
    Court: 'court',
    DLSA: 'dlsa',
    'Police Station': 'police_station',
    'Women Police Station': 'women_police_station',
    NGO: 'ngo',
    'Shelter Home': 'shelter_home',
    Helpline: 'helpline',
    'Legal Aid': 'legal_aid',
    'One Stop Centre (Sakhi)': 'one_stop_centre',
  };
  return legacy[value] || value || undefined;
}

export const authApi = {
  register: async (values) => {
    const { data } = await api.post('/api/auth/register', {
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      password: values.password,
      language_pref: values.language_pref || 'English',
      district: values.district || null,
      taluk: values.taluk || null,
    });
    return data;
  },
  login: async (values) => {
    const { data } = await api.post('/api/auth/login', {
      email: values.email,
      password: values.password,
    });
    window.localStorage.setItem('smartNyayaToken', data.access_token);
    return data;
  },
  me: async () => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
  logout: () => window.localStorage.removeItem('smartNyayaToken'),
};

export const legalApi = {
  askAssistant: async ({ query, language, history = [] }) => {
    const { data } = await aiApi.post('/api/ai/chat', {
      message: query,
      language,
      history,
      consent_to_store: true,
    });
    return {
      answer: data.answer,
      steps: [],          // steps now embedded in the answer text
      category: data.category,
      urgency: data.urgency,
      provider: data.provider,
      model: data.model,
      raw: data,
    };
  },
  translate: async ({ text, sourceLang, targetLang }) => {
    const { data } = await aiApi.post('/api/ai/translate', {
      text,
      source_language: sourceLang,
      target_language: targetLang,
    });
    return data;
  },
  classifyIssue: async ({ text, language }) => {
    const { data } = await api.post('/api/ai/classify-issue', { text, language });
    return data;
  },
  calculateCourtFee: async (payload) => {
    const { data } = await api.post('/api/tools/court-fee', payload);
    return data;
  },
  checkLimitationPeriod: async (payload) => {
    const { data } = await api.post('/api/tools/limitation-period', payload);
    return data;
  },
  explainRights: async (payload) => {
    const { data } = await api.post('/api/tools/rights-explainer', payload);
    return data;
  },
  checkEligibility: async (values) => {
    const { data } = await api.post('/api/legal-aid/check-eligibility', {
      gender: values.gender,
      category: values.category,
      annual_income: incomeToAnnualIncome(values.income),
      disability: values.disability === 'Yes',
      case_type: values.caseType,
    });
    return data;
  },
  submitComplaint: async (values) => {
    const { data } = await api.post('/api/complaints', {
      complaint_type: values.complaint_type,
      description: values.description,
      district: values.district,
      taluk: values.taluk || null,
      uploaded_documents: [],
    });
    return data;
  },
  generateDocument: async (values) => {
    const { data } = await api.post('/api/documents/generate', {
      doc_type: values.type,
      facts: {
        name: values.name,
        issue: values.facts,
        authority: values.respondent,
        district: values.district,
        issue_date: values.issueDate,
        relief: values.relief,
      },
    });
    return data;
  },
  searchDirectory: async ({ district, taluk, serviceType, q }) => {
    const { data } = await api.get('/api/directory/search', {
      params: {
        district: district || undefined,
        taluk: taluk || undefined,
        service_type: serviceTypeToBackend(serviceType),
        q: q || undefined,
      },
    });
    return data;
  },
  trackCase: async (trackingId) => {
    const { data } = await api.get(`/api/tracker/${trackingId}`);
    return data;
  },
  getCaseTimeline: async (caseId) => {
    const { data } = await api.get(`/api/timeline/${caseId}`);
    return data;
  },
  uploadEvidence: async (caseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/api/evidence/${caseId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  listEvidence: async (caseId) => {
    const { data } = await api.get(`/api/evidence/${caseId}`);
    return data;
  },
  bundleEvidence: async (caseId) => {
    const { data } = await api.post(`/api/evidence/${caseId}/bundle`);
    return data;
  },
  uploadCaseDocument: async (caseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/api/tracker/${caseId}/upload-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  listCaseDocuments: async (caseId) => {
    const { data } = await api.get(`/api/tracker/${caseId}/documents`);
    return data;
  },
  submitIntake: async (payload) => {
    const { data } = await aiApi.post('/api/ai/guided-intake', payload);
    return data;
  },
  getLegalHealthScore: async (payload) => {
    const { data } = await aiApi.post('/api/ai/legal-health-score', payload);
    return data;
  },
  getWorkspaceNotes: async (caseId) => {
    const { data } = await api.get(`/api/workspace/${caseId}/notes`);
    return data;
  },
  saveWorkspaceNote: async (caseId, payload) => {
    const { data } = await api.post(`/api/workspace/${caseId}/notes`, payload);
    return data;
  },
  getWorkspaceTasks: async (caseId) => {
    const { data } = await api.get(`/api/workspace/${caseId}/tasks`);
    return data;
  },
  createWorkspaceTask: async (caseId, payload) => {
    const { data } = await api.post(`/api/workspace/${caseId}/tasks`, payload);
    return data;
  },
  updateWorkspaceTask: async (caseId, taskId, payload) => {
    const { data } = await api.patch(`/api/workspace/${caseId}/tasks/${taskId}`, payload);
    return data;
  },
};

export const notificationApi = {
  fetchForUser: async (userId) => {
    const { data } = await api.get(`/api/notifications/user/${userId}`);
    return data;
  },
  markRead: async (notificationId) => {
    const { data } = await api.patch(`/api/notifications/${notificationId}/read`);
    return data;
  },
  markAllRead: async (userId) => {
    // Mark all unread notifications as read for a user
    const notifications = await notificationApi.fetchForUser(userId);
    const unread = notifications.filter((n) => !n.read_status);
    await Promise.all(unread.map((n) => notificationApi.markRead(n.notification_id)));
    return { marked: unread.length };
  },
};

export default api;
