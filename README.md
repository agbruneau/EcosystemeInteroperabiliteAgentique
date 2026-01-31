# Écosystème et Interopérabilité Agentique

**Architectures d'Intégration — Du Couplage Fort au Découplage Maximal**

Publication professionnelle couvrant l'ensemble du spectre de l'interopérabilité des systèmes d'entreprise : des intégrations traditionnelles point-à-point jusqu'aux architectures agentiques pilotées par l'IA. Le contenu est structuré en 12 chapitres et 5 volumes consolidés, publié sous forme de site statique HTML.

## Thèse centrale

L'interopérabilité se situe sur un continuum allant du couplage fort au découplage maximal. Ce continuum s'articule autour de trois domaines d'intégration :

- **Le Verbe** — Intégration des applications (action synchrone, orchestration)
- **Le Nom** — Intégration des données (cohérence d'état, accessibilité)
- **Le Signal** — Intégration des événements (communication asynchrone, découplage maximal)

## Sujets couverts

- **Fondements théoriques** — Théorème CAP, modèle PACELC, couplage spatio-temporel, System of Record
- **Patrons d'architecture applicative** — API Gateway, BFF, Circuit Breaker, Service Mesh, Strangler Fig, Saga, orchestration vs chorégraphie
- **Patrons d'intégration de données** — CDC, CQRS, Event Sourcing, Data Mesh, MDM, Data Virtualization, Medallion Architecture
- **Patrons événementiels** — Pub/Sub, Event Streaming, Transactional Outbox, Dead Letter Queue, vues matérialisées
- **Standards et contrats** — OpenAPI, gRPC, AsyncAPI, CloudEvents, JSON-LD, Protocol Buffers, Apache Avro
- **Résilience et observabilité** — OpenTelemetry, traçage distribué, tolérance aux pannes
- **Étude de cas** — Processus Order-to-Cash de bout en bout
- **Entreprise agentique** — Agents IA comme orchestrateurs d'intégration

## Technologies référencées

Apache Kafka, RabbitMQ, Apache Pulsar, Apache Iceberg, PostgreSQL, MongoDB, ClickHouse, Kubernetes, Docker, Prometheus, Jaeger, OAuth 2.0, mTLS

## Structure du projet

```
├── Chapitres/          # Fichiers sources Markdown (12 chapitres + 5 volumes + annexes)
├── templates/          # Templates HTML (accueil et chapitres)
├── public/             # Assets sources (Poster, Présentation PDF, Podcast)
├── build.js            # Script de génération des pages HTML
├── chapters.json       # Métadonnées des chapitres et volumes (titres, slugs, catégories)
├── package.json        # Dépendances Node.js
└── docs/               # Pages HTML générées (output du build)
    └── public/         # Copie des assets statiques
```

## Prérequis

- [Node.js](https://nodejs.org/) version 18 ou supérieure

## Installation

```bash
git clone https://github.com/agbruneau/Interoperabilite.git
cd Interoperabilite
npm install
```

## Générer le site

```bash
npm run build
```

Les pages HTML sont générées dans le dossier `docs/`.

## Consulter le site localement

Après avoir exécuté le build, ouvrir le fichier suivant dans un navigateur :

```
docs/index.html
```

Sous Windows, depuis le terminal :

```bash
start docs/index.html
```

Sous macOS :

```bash
open docs/index.html
```

Sous Linux :

```bash
xdg-open docs/index.html
```

Toutes les pages sont des fichiers HTML statiques autonomes. Aucun serveur Web n'est requis — la navigation fonctionne directement depuis le système de fichiers.

## Déploiement GitHub Pages

Le site se déploie automatiquement via GitHub Actions à chaque push sur la branche `master`. Le workflow (`.github/workflows/deploy.yml`) exécute le build puis publie le contenu de `docs/` sur GitHub Pages.

## Contenu

### Chapitres — Intégration

| Chapitre | Sujet                             |
| -------- | --------------------------------- |
| I        | Introduction et Problématique    |
| II       | Fondements Théoriques            |
| III      | Intégration des Applications     |
| IV       | Intégration des Données         |
| V        | Intégration des Événements     |
| VI       | Standards et Contrats d'Interface |
| VII      | Résilience et Observabilité     |
| VIII     | Collaboration et Automatisation   |
| IX       | Architecture de Référence       |
| X        | Étude de Cas : Order-to-Cash     |
| XI       | L'Entreprise Agentique            |
| —       | Annexes                           |

### Volumes — Entreprise Agentique

| Volume | Sujet                                  |
| ------ | -------------------------------------- |
| I      | Fondations de l'Entreprise Agentique   |
| II     | Infrastructure Agentique               |
| III    | Apache Kafka : Guide de l'Architecte   |
| IV     | Apache Iceberg : Lakehouse             |
| V      | Le Développeur Renaissance             |

## Ressources complémentaires

La page d'accueil donne accès aux ressources suivantes :

- **Présentation (PDF)** — Diaporama synthétique du contenu
- **Podcast (M4A)** — Version audio de la présentation
- **Poster** — Blueprint de l'Entreprise Moderne

Ces fichiers se trouvent dans `public/` (copiés dans `docs/public/` lors du build).

## Ajouter ou modifier un chapitre

1. Modifier le fichier Markdown correspondant dans `Chapitres/`
2. Si un nouveau chapitre est ajouté, mettre à jour `chapters.json`
3. Relancer `npm run build`

## Public cible

Architectes d'entreprise, architectes de solutions, spécialistes en intégration, leaders technologiques et développeurs souhaitant approfondir les patrons d'intégration modernes et la transition vers l'entreprise agentique.
