# BhoomiSetu AI Architecture

## Frontend

- Next.js App Router
- TypeScript for strong typing
- Tailwind CSS for government-grade layouts
- Role-based navigation and authenticated screens

## Backend

- Next.js API routes
- Structured business logic for document upload, processing, and land records
- Demo-mode data layer for hackathon presentation

## Database

- PostgreSQL-ready normalized model planned for production
- Prototype uses in-memory demo records to keep the workflow functional and demonstrable

## AI services

- OCRService abstraction for local or remote OCR providers
- AIExtractionService for structured extraction from raw text
- AnomalyDetectionService for potential inconsistency flags
- DocumentClassificationService for document-type detection

## OCR

- Modular entry points for preprocessing, text extraction, field detection, and structured output
- Local demo pipeline produces confidence-scored extracted fields

## Validation engine

- Rule-based checks for missing fields, duplicate IDs, invalid dates, and inconsistent metadata
- Severity levels: LOW, MEDIUM, HIGH, CRITICAL

## GIS

- OpenStreetMap + Leaflet for geographic visualization
- Property markers show land location, survey number, and verification status

## Authentication

- Session cookie-based login workflow
- Demo user roles and permission mapping
- Middleware protects private pages and API flows

## Storage

- File upload supported through application endpoints
- Planned file storage integration for object storage such as MinIO or S3

## Deployment

- Docker-ready app structure
- Production startup should use PostgreSQL, secure env vars, and a hardened reverse proxy
