# Instructions d'Installation et de Lancement

## Application Lean Manufacturing - Django + React

Application complète de gestion Lean Manufacturing intégrant **Kanban**, **CONWIP**, **DDMRP**, alertes et résolution de conflits.

---

## 📋 Prérequis

- **Python 3.12 ou 3.13** (PAS 3.14)
- **Node.js 18+** et npm
- **Git** (optionnel)

---

## 🚀 Installation Backend (Django)

### 1. Créer un environnement virtuel Python

```bash
cd backend
python3.12 -m venv venv
# ou python3.13 -m venv venv

# Activer l'environnement virtuel
# Sur Linux/macOS:
source venv/bin/activate
# Sur Windows:
venv\Scripts\activate
```

### 2. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### 3. Créer la base de données

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Créer un superutilisateur (admin Django)

```bash
python manage.py createsuperuser
# Suivre les instructions à l'écran
# Exemple: admin / admin@example.com / admin123
```

### 5. Générer les données de test

```bash
python generate_test_data.py
```

Ce script crée automatiquement :
- 8 articles
- 6 postes de travail
- 20 ordres de fabrication
- Configurations Kanban avec cartes QR
- Lignes CONWIP avec tickets
- Buffers DDMRP avec recommandations
- Alertes et conflits d'exemple

### 6. Lancer le serveur Django

```bash
python manage.py runserver
```

Le serveur Django démarre sur **http://localhost:8000**

✅ **Backend prêt !** Vous pouvez accéder à :
- API: http://localhost:8000/api/
- Admin Django: http://localhost:8000/admin/
- Documentation Swagger: http://localhost:8000/api/docs/

---

## 🎨 Installation Frontend (React)

### 1. Installer les dépendances Node.js

```bash
cd ../frontend
npm install
```

### 2. Lancer le serveur de développement React

```bash
npm start
```

Le serveur React démarre sur **http://localhost:3000**

L'application s'ouvre automatiquement dans votre navigateur.

✅ **Frontend prêt !**

---

## 📱 Utilisation de l'Application

### Navigation

L'application dispose d'une sidebar avec les sections suivantes :

#### **Core**
- **Articles** : Gestion des articles (SKU, stock, prix)
- **Postes de Travail** : Configuration des postes de production
- **Ordres de Fabrication** : Suivi des OF

#### **Kanban**
- **Configuration Flux** : Paramétrage des flux Kanban entre postes
- **Cartes Kanban** : Gestion des cartes avec QR code
- **Scanner QR** : Scanner les cartes avec webcam ou saisie manuelle

#### **CONWIP**
- **Lignes de Production** : Configuration des lignes avec séquence de postes
- **Tickets CONWIP** : Gestion des tickets circulants

#### **DDMRP**
- **Buffers DDMRP** : Gestion des buffers avec zones automatiques
- **Recommandations** : Recommandations de réapprovisionnement

#### **Alertes & Conflits**
- **Alertes** : Alertes automatiques du système
- **Conflits** : Conflits multi-signaux nécessitant arbitrage

### Fonctionnalités Clés

#### 1. Scanner QR Kanban
- Accéder à **Kanban > Scanner QR**
- Cliquer sur "Démarrer le Scanner" pour utiliser la webcam
- Scanner un QR code de carte Kanban
- Le système change automatiquement le statut et crée un OF si nécessaire

#### 2. Recalcul des Zones DDMRP
- Accéder à **DDMRP > Buffers DDMRP**
- Cliquer sur l'icône calculatrice pour recalculer un buffer
- Ou utiliser "Recalculer Tous" pour tous les buffers

#### 3. Gestion des Alertes
- Accéder à **Alertes**
- Résoudre ou ignorer les alertes actives
- Générer de nouvelles alertes automatiquement

#### 4. Résolution des Conflits
- Accéder à **Conflits**
- Voir les conflits en attente
- Choisir la méthode de résolution (Kanban/CONWIP/DDMRP/Manuel)

---

## 🔧 Configuration

### Ports par Défaut
- **Backend Django** : 8000
- **Frontend React** : 3000

### Authentification
- L'application utilise **SessionAuthentication**
- Les cookies de session sont automatiquement gérés
- Pas besoin de token JWT

### Proxy React
Le fichier `package.json` contient :
```json
"proxy": "http://localhost:8000"
```
Cela permet au frontend de communiquer avec le backend sans problème de CORS.

---

## 📊 Structure du Projet

```
lean-manufacturing/
├── backend/
│   ├── config/              # Configuration Django
│   │   ├── settings.py
│   │   ├── urls.py          # Router global unique
│   │   └── wsgi.py
│   ├── core/                # Module Core (Articles, Postes, OF)
│   ├── kanban/              # Module Kanban
│   ├── conwip/              # Module CONWIP
│   ├── ddmrp/               # Module DDMRP
│   ├── alerts/              # Module Alertes & Conflits
│   ├── media/               # Fichiers QR codes
│   ├── db.sqlite3           # Base de données
│   ├── manage.py
│   ├── requirements.txt
│   └── generate_test_data.py
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/      # Composants réutilisables
    │   │   └── Layout.js
    │   ├── pages/           # Pages de l'application
    │   │   ├── Dashboard.js
    │   │   ├── BuffersDDMRP.js
    │   │   ├── ScannerKanban.js
    │   │   └── ...
    │   ├── services/
    │   │   └── api.js       # Service Axios
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🐛 Dépannage

### Erreur CSRF Token
Si vous obtenez des erreurs 403 CSRF:
1. Vérifiez que le serveur Django tourne sur le port 8000
2. Vérifiez que le proxy est bien configuré dans package.json
3. Effacez les cookies du navigateur et rechargez

### Erreur lors du scan QR
1. Accordez les permissions caméra au navigateur
2. Utilisez HTTPS ou localhost (la caméra ne fonctionne que sur connexions sécurisées)
3. Utilisez la saisie manuelle en cas de problème avec la webcam

### Problèmes de migrations
Si les migrations échouent:
```bash
python manage.py migrate --run-syncdb
```

### Port déjà utilisé
Si le port 8000 ou 3000 est occupé:
```bash
# Backend sur un autre port
python manage.py runserver 8001

# Frontend sur un autre port
PORT=3001 npm start
```

---

## 📚 API Documentation

La documentation complète de l'API est disponible via Swagger UI :
- **URL** : http://localhost:8000/api/docs/
- Vous y trouverez tous les endpoints avec exemples

### Endpoints Principaux

#### Core
- `GET /api/articles/` - Liste des articles
- `GET /api/postes-travail/` - Liste des postes
- `GET /api/ordres-fabrication/` - Liste des OF

#### Kanban
- `POST /api/cartes-kanban/scanner/` - Scanner une carte
- `GET /api/config-flux-kanban/` - Configurations de flux

#### CONWIP
- `GET /api/lignes-production/` - Lignes de production
- `POST /api/tickets-conwip/{id}/attribuer/` - Attribuer un ticket

#### DDMRP
- `POST /api/buffers-ddmrp/{id}/recalculer_zones/` - Recalculer zones
- `POST /api/recommandations/{id}/executer/` - Exécuter recommandation

#### Alertes
- `GET /api/alertes/actives/` - Alertes actives
- `POST /api/conflits/{id}/resoudre/` - Résoudre conflit

---

## ✨ Fonctionnalités Implémentées

### ✅ Core
- [x] Gestion des articles avec stock
- [x] Postes de travail avec identification des goulets
- [x] Ordres de fabrication multi-sources

### ✅ Kanban
- [x] Configuration flux avec calcul automatique du nombre de cartes
- [x] Génération automatique de QR codes
- [x] Scanner QR avec webcam (@yudiel/react-qr-scanner)
- [x] Création automatique d'OF lors du passage à VIDE

### ✅ CONWIP
- [x] Lignes de production avec séquences de postes
- [x] Tickets CONWIP circulants
- [x] Détection WIP critique et goulets

### ✅ DDMRP
- [x] Buffers avec calcul automatique des zones rouge/jaune/verte
- [x] Recommandations de réapprovisionnement
- [x] Exécution automatique des recommandations (création OF)

### ✅ Alertes & Conflits
- [x] Génération automatique d'alertes
- [x] Détection de conflits multi-signaux
- [x] Résolution manuelle ou automatique

### ✅ Dashboard
- [x] KPIs globaux
- [x] Graphiques (Chart.js)
- [x] Vue d'ensemble du système

---

## 🔐 Sécurité

- ⚠️ **Cette application est en mode développement**
- Ne pas utiliser en production sans :
  - Changer SECRET_KEY dans settings.py
  - Activer HTTPS
  - Configurer DEBUG=False
  - Utiliser une vraie base de données (PostgreSQL)
  - Configurer un serveur de production (Gunicorn + Nginx)

---

## 📞 Support

En cas de problème :
1. Vérifiez que Python 3.12/3.13 est utilisé
2. Vérifiez que les deux serveurs (Django + React) tournent
3. Consultez les logs des deux terminaux
4. Vérifiez la configuration CORS et le proxy

---

## 🎉 C'est Prêt !

Votre application Lean Manufacturing est maintenant opérationnelle !

Accédez à http://localhost:3000 et explorez toutes les fonctionnalités.

**Bon travail !** 🚀
