import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Admin Auth APIs
export const adminAPI = {
  register: (data) => api.post("/admin/register", data),
  login: (data) => api.post("/admin/login", data),
  getProfile: () => api.get("/admin/profile"),
  updateProfile: (data) => api.put("/admin/profile", data),
  changePassword: (data) => api.put("/admin/change-password", data),
};

// Booklet APIs
export const bookletAPI = {
  getAll: () => api.get("/booklet-quote"),
  getById: (id) => api.get(`/booklet-quote/${id}`),
  create: (data) =>
    api.post("/booklet-quote", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/booklet-quote/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/booklet-quote/${id}`),
  updateStatus: (id, status) =>
    api.put(`/booklet-quote/${id}/status`, { status }),
};

// Booklet Options APIs
export const bookletOptionsAPI = {
  getAll: () => api.get("/booklet-options"),
  getDropdown: () => api.get("/booklet-options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/booklet-options/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(
      `/booklet-options/category/${encodeURIComponent(categoryKey)}`,
      data,
    ),
  deleteCategory: (data) => api.delete("/booklet-options/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/booklet-options/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/booklet-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/booklet-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/booklet-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/booklet-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/booklet-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/booklet-options/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(
      `/booklet-options/category/${categoryKey}/attribute/${index}`,
      data,
    ),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/booklet-options/category/${categoryKey}/attribute/${index}`),
};

// Notebook APIs
export const notebookAPI = {
  getAll: () => api.get("/notebook-quote"),
  getById: (id) => api.get(`/notebook-quote/${id}`),
  create: (data) =>
    api.post("/notebook-quote", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/notebook-quote/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/notebook-quote/${id}`),
  updateStatus: (id, status) =>
    api.put(`/notebook-quote/${id}/status`, { status }),
};

// Artbook APIs
export const artbookAPI = {
  getAll: () => api.get("/artbook-quote"),
  getById: (id) => api.get(`/artbook-quote/${id}`),
  create: (data) =>
    api.post("/artbook-quote", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/artbook-quote/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/artbook-quote/${id}`),
  updateStatus: (id, status) =>
    api.put(`/artbook-quote/${id}/status`, { status }),
};

// Notebook Options APIs
export const notebookOptionsAPI = {
  getAll: () => api.get("/notebook-options"),
  getDropdown: () => api.get("/notebook-options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/notebook-options/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(
      `/notebook-options/category/${encodeURIComponent(categoryKey)}`,
      data,
    ),
  deleteCategory: (data) => api.delete("/notebook-options/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/notebook-options/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/notebook-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/notebook-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/notebook-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/notebook-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/notebook-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/notebook-options/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(
      `/notebook-options/category/${categoryKey}/attribute/${index}`,
      data,
    ),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/notebook-options/category/${categoryKey}/attribute/${index}`),
};

// Artbook Options APIs
export const artbookOptionsAPI = {
  getAll: () => api.get("/artbook-options"),
  getDropdown: () => api.get("/artbook-options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/artbook-options/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(
      `/artbook-options/category/${encodeURIComponent(categoryKey)}`,
      data,
    ),
  deleteCategory: (data) => api.delete("/artbook-options/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/artbook-options/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/artbook-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/artbook-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/artbook-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/artbook-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/artbook-options/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/artbook-options/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(
      `/artbook-options/category/${categoryKey}/attribute/${index}`,
      data,
    ),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/artbook-options/category/${categoryKey}/attribute/${index}`),
};

// Custom Envelope APIs
export const customEnvelopeAPI = {
  getAll: () => api.get("/custom-envelope"),
  getById: (id) => api.get(`/custom-envelope/${id}`),
  create: (data) =>
    api.post("/custom-envelope", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/custom-envelope/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/custom-envelope/${id}`),
  updateStatus: (id, status) =>
    api.put(`/custom-envelope/${id}/status`, { status }),
};

// Custom Envelope Options APIs
export const customEnvelopeOptionsAPI = {
  getAll: () => api.get("/custom-envelope/options"),
  getDropdown: () => api.get("/custom-envelope/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/custom-envelope/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(
      `/custom-envelope/category/${encodeURIComponent(categoryKey)}`,
      data,
    ),
  deleteCategory: (data) => api.delete("/custom-envelope/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/custom-envelope/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/custom-envelope/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/custom-envelope/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/custom-envelope/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/custom-envelope/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/custom-envelope/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/custom-envelope/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(
      `/custom-envelope/category/${categoryKey}/attribute/${index}`,
      data,
    ),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/custom-envelope/category/${categoryKey}/attribute/${index}`),
};

// Custom Card APIs
export const customCardAPI = {
  getAll: () => api.get("/custom-card"),
  getById: (id) => api.get(`/custom-card/${id}`),
  create: (data) =>
    api.post("/custom-card", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/custom-card/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/custom-card/${id}`),
  updateStatus: (id, status) =>
    api.put(`/custom-card/${id}/status`, { status }),
};

// Custom Card Options APIs
export const customCardOptionsAPI = {
  getAll: () => api.get("/custom-card/options"),
  getDropdown: () => api.get("/custom-card/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/custom-card/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(`/custom-card/category/${encodeURIComponent(categoryKey)}`, data),
  deleteCategory: (data) => api.delete("/custom-card/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/custom-card/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/custom-card/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/custom-card/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/custom-card/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/custom-card/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/custom-card/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/custom-card/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(`/custom-card/category/${categoryKey}/attribute/${index}`, data),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/custom-card/category/${categoryKey}/attribute/${index}`),
};

// Magazine APIs
export const magazineAPI = {
  getAll: () => api.get("/magazines"),
  getById: (id) => api.get(`/magazines/${id}`),
  create: (data) =>
    api.post("/magazines", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/magazines/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/magazines/${id}`),
  updateStatus: (id, status) => api.put(`/magazines/${id}/status`, { status }),
};

// Magazine Options APIs
export const magazineOptionsAPI = {
  getAll: () => api.get("/magazines/options"),
  getDropdown: () => api.get("/magazines/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/magazines/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(`/magazines/category/${encodeURIComponent(categoryKey)}`, data),
  deleteCategory: (data) => api.delete("/magazines/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/magazines/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/magazines/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/magazines/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/magazines/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/magazines/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/magazines/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/magazines/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(`/magazines/category/${categoryKey}/attribute/${index}`, data),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/magazines/category/${categoryKey}/attribute/${index}`),
};

// Business Card APIs
export const businessCardAPI = {
  getAll: () => api.get("/business-card"),
  getById: (id) => api.get(`/business-card/${id}`),
  create: (data) =>
    api.post("/business-card", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/business-card/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/business-card/${id}`),
  updateStatus: (id, status) =>
    api.put(`/business-card/${id}/status`, { status }),
};

// Business Card Options APIs
export const businessCardOptionsAPI = {
  getAll: () => api.get("/business-card/options"),
  getDropdown: () => api.get("/business-card/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/business-card/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(`/business-card/category/${encodeURIComponent(categoryKey)}`, data),
  deleteCategory: (data) => api.delete("/business-card/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/business-card/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/business-card/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/business-card/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/business-card/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/business-card/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/business-card/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/business-card/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(`/business-card/category/${categoryKey}/attribute/${index}`, data),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/business-card/category/${categoryKey}/attribute/${index}`),
};

// Pamphlet APIs
export const pamphletAPI = {
  getAll: () => api.get("/pamphlet"),
  getById: (id) => api.get(`/pamphlet/${id}`),
  create: (data) =>
    api.post("/pamphlet", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/pamphlet/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/pamphlet/${id}`),
  updateStatus: (id, status) => api.put(`/pamphlet/${id}/status`, { status }),
};

// Pamphlet Options APIs
export const pamphletOptionsAPI = {
  getAll: () => api.get("/pamphlet/options"),
  getDropdown: () => api.get("/pamphlet/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/pamphlet/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(`/pamphlet/category/${encodeURIComponent(categoryKey)}`, data),
  deleteCategory: (data) => api.delete("/pamphlet/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/pamphlet/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/pamphlet/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/pamphlet/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/pamphlet/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/pamphlet/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/pamphlet/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/pamphlet/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(`/pamphlet/category/${categoryKey}/attribute/${index}`, data),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/pamphlet/category/${categoryKey}/attribute/${index}`),
};

// Brochure APIs
export const brochureAPI = {
  getAll: () => api.get("/brochure-quote"),
  getById: (id) => api.get(`/brochure-quote/${id}`),
  create: (data) =>
    api.post("/brochure-quote", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/brochure-quote/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/brochure-quote/${id}`),
  updateStatus: (id, status) =>
    api.put(`/brochure-quote/${id}/status`, { status }),
};

// Brochure Options APIs
export const brochureOptionsAPI = {
  getAll: () => api.get("/brochure-options"),
  getDropdown: () => api.get("/brochure-options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/brochure-options/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}`,
      data,
    ),
  deleteCategory: (data) => api.delete("/brochure-options/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/attribute`,
      data,
    ),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/attribute/${index}`,
      data,
    ),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(
      `/brochure-options/category/${encodeURIComponent(categoryKey)}/attribute/${index}`,
    ),
};

// Ledger Register APIs
export const ledgerRegisterAPI = {
  getAll: () => api.get("/ledger-register"),
  getById: (id) => api.get(`/ledger-register/${id}`),
  create: (data) =>
    api.post("/ledger-register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/ledger-register/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/ledger-register/${id}`),
  updateStatus: (id, status) =>
    api.put(`/ledger-register/${id}/status`, { status }),
};

// Ledger Register Options APIs
export const ledgerRegisterOptionsAPI = {
  getAll: () => api.get("/ledger-register/options"),
  getDropdown: () => api.get("/ledger-register/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/ledger-register/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(
      `/ledger-register/category/${encodeURIComponent(categoryKey)}`,
      data,
    ),
  deleteCategory: (data) => api.delete("/ledger-register/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/ledger-register/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/ledger-register/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/ledger-register/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/ledger-register/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/ledger-register/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/ledger-register/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/ledger-register/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(
      `/ledger-register/category/${categoryKey}/attribute/${index}`,
      data,
    ),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/ledger-register/category/${categoryKey}/attribute/${index}`),
};

// Letterhead APIs
export const letterheadAPI = {
  getAll: () => api.get("/letterhead"),
  getById: (id) => api.get(`/letterhead/${id}`),
  create: (data) =>
    api.post("/letterhead", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/letterhead/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/letterhead/${id}`),
  updateStatus: (id, status) => api.put(`/letterhead/${id}/status`, { status }),
};

// Letterhead Options APIs
export const letterheadOptionsAPI = {
  getAll: () => api.get("/letterhead/options"),
  getDropdown: () => api.get("/letterhead/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/letterhead/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(`/letterhead/category/${encodeURIComponent(categoryKey)}`, data),
  deleteCategory: (data) => api.delete("/letterhead/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/letterhead/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/letterhead/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/letterhead/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/letterhead/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/letterhead/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/letterhead/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/letterhead/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(`/letterhead/category/${categoryKey}/attribute/${index}`, data),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/letterhead/category/${categoryKey}/attribute/${index}`),
};

// Shopping Bags APIs
export const shoppingBagsAPI = {
  getAll: () => api.get("/shopping-bags"),
  getById: (id) => api.get(`/shopping-bags/${id}`),
  create: (data) =>
    api.post("/shopping-bags", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/shopping-bags/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/shopping-bags/${id}`),
  updateStatus: (id, status) =>
    api.put(`/shopping-bags/${id}/status`, { status }),
};

// Shopping Bags Options APIs
export const shoppingBagsOptionsAPI = {
  getAll: () => api.get("/shopping-bags/options"),
  getDropdown: () => api.get("/shopping-bags/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/shopping-bags/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(`/shopping-bags/category/${encodeURIComponent(categoryKey)}`, data),
  deleteCategory: (data) => api.delete("/shopping-bags/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/shopping-bags/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/shopping-bags/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/shopping-bags/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/shopping-bags/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/shopping-bags/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/shopping-bags/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/shopping-bags/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(`/shopping-bags/category/${categoryKey}/attribute/${index}`, data),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/shopping-bags/category/${categoryKey}/attribute/${index}`),
};

// Product Catalogue APIs
export const productCatalogueAPI = {
  getAll: () => api.get("/product-catalogue"),
  getById: (id) => api.get(`/product-catalogue/${id}`),
  create: (data) =>
    api.post("/product-catalogue", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/product-catalogue/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/product-catalogue/${id}`),
  updateStatus: (id, status) =>
    api.put(`/product-catalogue/${id}/status`, { status }),
};

// Product Catalogue Options APIs
export const productCatalogueOptionsAPI = {
  getAll: () => api.get("/product-catalogue/options"),
  getDropdown: () => api.get("/product-catalogue/options/dropdown"),
  // Category management APIs
  addCategory: (data) => api.post("/product-catalogue/category", data),
  updateCategory: (categoryKey, data) =>
    api.put(
      `/product-catalogue/category/${encodeURIComponent(categoryKey)}`,
      data,
    ),
  deleteCategory: (data) => api.delete("/product-catalogue/category", { data }),
  // Subcategory management APIs
  addSubcategory: (categoryKey, data) =>
    api.post(
      `/product-catalogue/category/${encodeURIComponent(categoryKey)}/subcategory`,
      data,
    ),
  updateSubcategory: (categoryKey, subcategoryKey, data) =>
    api.put(
      `/product-catalogue/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}/field`,
      data,
    ),
  deleteSubcategory: (categoryKey, subcategoryKey) =>
    api.delete(
      `/product-catalogue/category/${encodeURIComponent(categoryKey)}/subcategory/${encodeURIComponent(subcategoryKey)}`,
    ),
  // Attribute management APIs (subcategory level)
  addAttribute: (categoryKey, subcategoryKey, data) =>
    api.post(
      `/product-catalogue/category/${categoryKey}/subcategory/${subcategoryKey}/attribute`,
      data,
    ),
  updateAttribute: (categoryKey, subcategoryKey, index, data) =>
    api.put(
      `/product-catalogue/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
      data,
    ),
  deleteAttribute: (categoryKey, subcategoryKey, index) =>
    api.delete(
      `/product-catalogue/category/${categoryKey}/subcategory/${subcategoryKey}/attribute/${index}`,
    ),
  // Category-level attribute APIs
  addCategoryAttribute: (categoryKey, data) =>
    api.post(`/product-catalogue/category/${categoryKey}/attribute`, data),
  updateCategoryAttribute: (categoryKey, index, data) =>
    api.put(
      `/product-catalogue/category/${categoryKey}/attribute/${index}`,
      data,
    ),
  deleteCategoryAttribute: (categoryKey, index) =>
    api.delete(`/product-catalogue/category/${categoryKey}/attribute/${index}`),
};

export default api;
