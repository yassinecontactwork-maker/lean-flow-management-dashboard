# Lean Manufacturing Industrial Control Suite

Application web de supervision industrielle dédiée au pilotage des flux de production à travers les méthodes **KANBAN**, **CONWIP** et **DDMRP**.

Ce projet a été réalisé dans le cadre du module **Lean Management et Excellence Opérationnelle**.  
L’objectif est de développer une solution digitale permettant de superviser les flux industriels, suivre les ordres de fabrication, gérer les cartes Kanban, contrôler les tickets CONWIP, analyser les buffers DDMRP et détecter les alertes liées à la production.

---

## Objectif du projet

L’objectif principal de ce projet est de concevoir une application web d’aide à la décision pour le pilotage des flux industriels.

L’application permet de comparer et d’utiliser trois approches complémentaires :

- **KANBAN** : pilotage local des flux par cartes et signaux de réapprovisionnement.
- **CONWIP** : limitation globale des encours dans une ligne de production.
- **DDMRP** : planification supply chain basée sur des buffers stratégiques pilotés par la demande réelle.

Cette solution vise à améliorer la visibilité sur les flux, réduire les encours, limiter les ruptures, mieux gérer les priorités et renforcer la performance opérationnelle.

---

## Technologies utilisées

### Front-end

- React.js
- JavaScript
- CSS / Design System
- Charts / Data Visualization

### Back-end

- Django
- Python
- API backend

### Base de données

- PostgreSQL

### Outils

- Git
- GitHub
- VS Code

---

## Méthodes industrielles intégrées

### KANBAN

Le Kanban est une méthode Lean basée sur des cartes ou signaux visuels.  
Elle permet de déclencher la production ou le réapprovisionnement uniquement lorsqu’il y a une consommation réelle en aval.

### CONWIP

Le CONWIP, ou Constant Work In Process, est une méthode de pilotage des flux qui consiste à limiter le nombre total d’ordres ou de pièces en cours dans un système de production.

### DDMRP

Le DDMRP, ou Demand Driven Material Requirements Planning, est une méthode de planification pilotée par la demande réelle.  
Elle utilise des buffers stratégiques afin de protéger le flux, absorber la variabilité et éviter les ruptures.

---

## Fonctionnalités principales

- Tableau de bord industriel avec indicateurs clés
- Gestion des articles
- Gestion des postes de travail
- Suivi des ordres de fabrication
- Configuration des flux Kanban
- Gestion des cartes Kanban
- Scanner QR
- Gestion des lignes de production
- Gestion des tickets CONWIP
- Suivi des buffers DDMRP
- Système d’alertes
- Gestion des conflits
- Recommandations d’aide à la décision
- Interface d’administration Django

---

## Aperçu de l’application

### Tableau de bord

![Tableau de bord](https://raw.githubusercontent.com/yassinecontactwork-maker/lean-manufacturing-control-suite/main/docs/dashboard-v2.png)

### Gestion des ordres de fabrication

![Ordres de fabrication](https://raw.githubusercontent.com/yassinecontactwork-maker/lean-manufacturing-control-suite/main/docs/ordres-fabrication-v2.png)

### Buffers DDMRP

![Buffers DDMRP](https://raw.githubusercontent.com/yassinecontactwork-maker/lean-manufacturing-control-suite/main/docs/buffers-ddmrp-v2.png)

### Alertes et conflits

![Alertes et conflits](https://raw.githubusercontent.com/yassinecontactwork-maker/lean-manufacturing-control-suite/main/docs/alertes-v2.png)

## Architecture du projet

```text
lean-manufacturing-complete/
│
├── backend/
│   ├── manage.py
│   ├── settings.py
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── docs/
│   └── images/
│
├── README.md
├── .gitignore
└── requirements.txt
