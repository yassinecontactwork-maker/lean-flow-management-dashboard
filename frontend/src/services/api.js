   
                                                                    
                                              
                                                       
                                                         
                                                                             
   

import axios from 'axios';

                                                           
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

                                                                               
async function ensureCsrfToken() {
  if (!getCsrfToken()) {
    try {
      await api.get('auth/csrf/');
    } catch (err) {
      console.log('Requete pour charger le CSRF token (erreur ignoree si non connecte)');
    }
  }
}

                                    
const api = axios.create({
  baseURL: '/api/',
  withCredentials: true,                                          
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: {
    'Content-Type': 'application/json',
  },
});

                                                                
api.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toLowerCase();
    const unsafeMethod = !['get', 'head', 'options'].includes(method);

    if (unsafeMethod && !getCsrfToken()) {
      await ensureCsrfToken();
    }

    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

                                                  
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('Erreur CSRF - Token invalide ou manquant');
    }
    if (error.response?.status === 401) {
      console.error('Non authentifié - Redirection vers login nécessaire');
    }
    return Promise.reject(error);
  }
);

                   
export const articlesAPI = {
  getAll: () => api.get('articles/'),
  getOne: (id) => api.get(`articles/${id}/`),
  create: (data) => api.post('articles/', data),
  update: (id, data) => api.put(`articles/${id}/`, data),
  delete: (id) => api.delete(`articles/${id}/`),
  ajusterStock: (id, quantite) => api.post(`articles/${id}/ajuster_stock/`, { quantite }),
};

export const postesTravailAPI = {
  getAll: () => api.get('postes-travail/'),
  getOne: (id) => api.get(`postes-travail/${id}/`),
  create: (data) => api.post('postes-travail/', data),
  update: (id, data) => api.put(`postes-travail/${id}/`, data),
  delete: (id) => api.delete(`postes-travail/${id}/`),
  chargeActuelle: (id) => api.get(`postes-travail/${id}/charge_actuelle/`),
};

export const ordresFabricationAPI = {
  getAll: (params) => api.get('ordres-fabrication/', { params }),
  getOne: (id) => api.get(`ordres-fabrication/${id}/`),
  create: (data) => api.post('ordres-fabrication/', data),
  update: (id, data) => api.put(`ordres-fabrication/${id}/`, data),
  delete: (id) => api.delete(`ordres-fabrication/${id}/`),
  demarrer: (id) => api.post(`ordres-fabrication/${id}/demarrer/`),
  terminer: (id) => api.post(`ordres-fabrication/${id}/terminer/`),
  statistiques: () => api.get('ordres-fabrication/statistiques/'),
};

                     
export const configFluxKanbanAPI = {
  getAll: () => api.get('config-flux-kanban/'),
  getOne: (id) => api.get(`config-flux-kanban/${id}/`),
  create: (data) => api.post('config-flux-kanban/', data),
  update: (id, data) => api.put(`config-flux-kanban/${id}/`, data),
  delete: (id) => api.delete(`config-flux-kanban/${id}/`),
  creerCartes: (id) => api.post(`config-flux-kanban/${id}/creer_cartes/`),
  cartesVides: (id) => api.get(`config-flux-kanban/${id}/cartes_vides/`),
};

export const cartesKanbanAPI = {
  getAll: (params) => api.get('cartes-kanban/', { params }),
  getOne: (id) => api.get(`cartes-kanban/${id}/`),
  create: (data) => api.post('cartes-kanban/', data),
  update: (id, data) => api.put(`cartes-kanban/${id}/`, data),
  delete: (id) => api.delete(`cartes-kanban/${id}/`),
  scanner: (codeUnique, nouveauStatut) => 
    api.post('cartes-kanban/scanner/', { code_unique: codeUnique, nouveau_statut: nouveauStatut }),
  changerStatut: (id, statut) => api.post(`cartes-kanban/${id}/changer_statut/`, { statut }),
  statistiques: () => api.get('cartes-kanban/statistiques/'),
};

                     
export const lignesProductionAPI = {
  getAll: () => api.get('lignes-production/'),
  getOne: (id) => api.get(`lignes-production/${id}/`),
  create: (data) => api.post('lignes-production/', data),
  update: (id, data) => api.put(`lignes-production/${id}/`, data),
  delete: (id) => api.delete(`lignes-production/${id}/`),
  ajouterPoste: (id, posteId, ordre) => 
    api.post(`lignes-production/${id}/ajouter_poste/`, { poste_id: posteId, ordre }),
  creerTickets: (id) => api.post(`lignes-production/${id}/creer_tickets/`),
  statistiques: (id) => api.get(`lignes-production/${id}/statistiques/`),
};

export const ticketsConwipAPI = {
  getAll: (params) => api.get('tickets-conwip/', { params }),
  getOne: (id) => api.get(`tickets-conwip/${id}/`),
  create: (data) => api.post('tickets-conwip/', data),
  update: (id, data) => api.put(`tickets-conwip/${id}/`, data),
  delete: (id) => api.delete(`tickets-conwip/${id}/`),
  attribuer: (id, ordreFabricationId, posteDepartId) => 
    api.post(`tickets-conwip/${id}/attribuer/`, { 
      ordre_fabrication_id: ordreFabricationId,
      poste_depart_id: posteDepartId 
    }),
  liberer: (id) => api.post(`tickets-conwip/${id}/liberer/`),
  demarrer: (id) => api.post(`tickets-conwip/${id}/demarrer/`),
  avancer: (id, prochainPosteId) => 
    api.post(`tickets-conwip/${id}/avancer/`, { prochain_poste_id: prochainPosteId }),
};

                    
export const buffersDDMRPAPI = {
  getAll: () => api.get('buffers-ddmrp/'),
  getOne: (id) => api.get(`buffers-ddmrp/${id}/`),
  create: (data) => api.post('buffers-ddmrp/', data),
  update: (id, data) => api.put(`buffers-ddmrp/${id}/`, data),
  delete: (id) => api.delete(`buffers-ddmrp/${id}/`),
  recalculerZones: (id) => api.post(`buffers-ddmrp/${id}/recalculer_zones/`),
  ajusterStock: (id, stock) => api.post(`buffers-ddmrp/${id}/ajuster_stock/`, { stock }),
  genererRecommandation: (id) => api.post(`buffers-ddmrp/${id}/generer_recommandation/`),
  statistiques: () => api.get('buffers-ddmrp/statistiques/'),
  recalculerTous: () => api.post('buffers-ddmrp/recalculer_tous/'),
};

export const recommandationsAPI = {
  getAll: (params) => api.get('recommandations/', { params }),
  getOne: (id) => api.get(`recommandations/${id}/`),
  create: (data) => api.post('recommandations/', data),
  update: (id, data) => api.put(`recommandations/${id}/`, data),
  delete: (id) => api.delete(`recommandations/${id}/`),
  executer: (id) => api.post(`recommandations/${id}/executer/`),
  rejeter: (id) => api.post(`recommandations/${id}/rejeter/`),
  statistiques: () => api.get('recommandations/statistiques/'),
  genererAutomatiques: () => api.post('recommandations/generer_automatiques/'),
};

                     
export const alertesAPI = {
  getAll: (params) => api.get('alertes/', { params }),
  getOne: (id) => api.get(`alertes/${id}/`),
  create: (data) => api.post('alertes/', data),
  update: (id, data) => api.put(`alertes/${id}/`, data),
  delete: (id) => api.delete(`alertes/${id}/`),
  resoudre: (id) => api.post(`alertes/${id}/resoudre/`),
  ignorer: (id) => api.post(`alertes/${id}/ignorer/`),
  actives: () => api.get('alertes/actives/'),
  statistiques: () => api.get('alertes/statistiques/'),
  genererAutomatiques: () => api.post('alertes/generer_automatiques/'),
};

export const conflitsAPI = {
  getAll: (params) => api.get('conflits/', { params }),
  getOne: (id) => api.get(`conflits/${id}/`),
  create: (data) => api.post('conflits/', data),
  update: (id, data) => api.put(`conflits/${id}/`, data),
  delete: (id) => api.delete(`conflits/${id}/`),
  resoudre: (id, methode, decision) => 
    api.post(`conflits/${id}/resoudre/`, { methode, decision }),
  enAttente: () => api.get('conflits/en_attente/'),
  statistiques: () => api.get('conflits/statistiques/'),
};

                               
export const authAPI = {
  csrf: () => api.get('auth/csrf/'),
  register: async (payload) => {
    await ensureCsrfToken();
    return api.post('auth/register/', payload);
  },
  login: async (email, password) => {
    await ensureCsrfToken();
    return api.post('auth/login/', { email, password });
  },
  logout: () => api.post('auth/logout/'),
  checkAuth: () => api.get('auth/user/'),
};

export default api;
