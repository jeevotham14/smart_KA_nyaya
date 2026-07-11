import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('smartNyayaToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
  const map = {
    Court: 'court',
    DLSA: 'dlsa',
    'Police Station': 'police_station',
    'Women Police Station': 'women_police_station',
    NGO: 'ngo',
    'Shelter Home': 'shelter_home',
    Helpline: 'helpline',
    'Legal Aid': 'legal_aid',
  };
  return map[value] || value || undefined;
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
  askAssistant: async ({ query, language, category }) => {
    const { data } = await api.post('/api/ai/legal-query', {
      grievance_text: query,
      language,
      legal_category: category,
      consent_to_store: true,
    });
    return {
      answer: data.ai_response,
      steps: [
        `Category: ${data.legal_category}`,
        `Urgency: ${data.urgency_level}`,
        `Status: ${data.status}`,
      ],
      queryId: data.query_id,
      raw: data,
    };
  },
  classifyIssue: async ({ text, language }) => {
    const { data } = await api.post('/api/ai/classify-issue', { text, language });
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
};

export default api;
