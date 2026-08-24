import re

with open('frontend/src/services/api.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Add getMyProfile to advocateApi
advocateApiStr = """export const advocateApi = {
  getAdvocates: async (params) => {
    const { data } = await api.get('/api/advocates', { params });
    return data;
  },
  getAdvocate: async (id) => {
    const { data } = await api.get(`/api/advocates/${id}`);
    return data;
  },
  getMyProfile: async () => {
    const { data } = await api.get('/api/advocates/me/profile');
    return data;
  },"""

c = re.sub(r'export const advocateApi = \{.*?(?=  createProfile:)', advocateApiStr + '\n  ', c, flags=re.DOTALL)

# Add admin endpoints
adminStr = """export const adminApi = {
  getPendingAdvocates: async () => {
    const { data } = await api.get('/api/admin/advocates/pending');
    return data;
  },
  updateAdvocateStatus: async (id, statusData) => {
    const { data } = await api.patch(`/api/admin/advocates/${id}/status`, statusData);
    return data;
  }
};"""
c += '\n\n' + adminStr

with open('frontend/src/services/api.js', 'w', encoding='utf-8') as f:
    f.write(c)
