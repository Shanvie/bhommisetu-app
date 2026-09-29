# BhoomiSetu AI

BhoomiSetu is an independent prototype for exploring land-record service discovery and sample document workflows. It is not affiliated with any government and does not connect to official land-record databases. Official records must be obtained from the relevant state or Union Territory authority.

## Live Workflows & Functionality

1. **Role-Based Access Control (RBAC)**:
   - Super Admin, Government Officer, Verification Officer, Data Entry Operator, and Citizen personas.
   - 1-Click quick login switcher on the Login page and in the top application header for instant evaluator testing.
   - Dedicated session cookie management and `/api/auth/me` profile integration.

2. **Ingestion & OCR Pipeline (`/documents/upload`)**:
   - Supports drag-and-drop file upload for PDF, scanned JPG, JPEG, and PNG.
   - 1-Click demo preset fillers for sample 7/12 Extracts (Pune), Property Cards (Nagpur), and Sale Deeds (Nashik).
   - Multi-step live visual processing simulation (Accepted -> Preprocessing & Dewarping -> AI Field Extraction -> Cadastral Validation).
   - Automatically synchronizes with land records registry, generates spatial coordinates, and routes to verification.

3. **Interactive Human-in-the-Loop Verification Workspace (`/verification`)**:
   - Verification queue selector allowing officers to step through pending records.
   - High-contrast OCR toggle and scanned document viewer.
   - Inline editable fields (Owner name, Survey number, Gat number, Plot area, Village, District) with per-field confidence ratings.
   - Per-field "Accept (✓)" and "Flag (✕)" toggles.
   - Decision console: "Approve & Mark Verified", "Flag Inconsistency (Request Review)", and "Reject Record".
   - Commits changes immediately to the persistent store and writes an immutable audit log entry.

4. **Sample Land Record Summary (`/land-records/[id]`)**:
   - Illustrative Record of Rights-style summary using demo data; not an official certificate.
   - Property summary (Property ID, Survey No, Gat No, Mutation No, Document No).
   - Ownership & Title breakdown with co-holders and relationship details.
   - Area metric conversions (Sq. Meters & Acres).
   - Cadastral validation diagnostics with severity ratings.
   - Embedded GIS coordinate markers and print-ready layout.

5. **GIS Cadastral Map Module (`/map`)**:
   - Interactive Leaflet OpenStreetMap canvas.
   - Custom colored status markers (Verified = Green, In Review = Cyan, Pending = Amber, Issues = Red).
   - Filter by district, status, or search query.
   - Parcel list sidebar with 1-click map centering and rich parcel popups with direct links to view or verify.

6. **Global Search Engine (`/search`)**:
   - Real-time instant filtering across Owner Name, Survey/Gat Number, Village, District, Status, and Land Type.
   - 1-Click CSV export of search results.

7. **Compliance & Audit Center (`/audit-logs` & `/reports`)**:
   - Chronological audit trail tracking all uploads, verification decisions, and administrative actions.
   - Working CSV downloads for:
     - Officer Verification Compliance Report
     - Master Land Records Register
     - Validation Inconsistencies & Discrepancies
     - District Revenue Analytics
   - System settings configuration (`/settings`) with customizable area thresholds and 1-click demo baseline reset.

8. **Notifications Center (`/notifications`)**:
   - Real-time alerts for incoming documents, queue updates, and validation errors.
   - "Mark as Read", "Mark All as Read", and "Clear All" with persistent store integration.

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Run Vitest test suite
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Run the GitHub Package

After the GitHub Actions workflow succeeds on `main`, it publishes `ghcr.io/shanvie/bhommisetu-app:latest`.

```bash
docker pull ghcr.io/shanvie/bhommisetu-app:latest
docker run --rm -p 3000:3000 \
   -e JWT_SECRET="$(openssl rand -hex 32)" \
   -v bhoomisetu-data:/app/data \
   ghcr.io/shanvie/bhommisetu-app:latest
```

Open [http://localhost:3000](http://localhost:3000). The container starts with sample data; mount the named volume to retain changes between restarts. The package is private by default; change its visibility in GitHub Packages settings if it should be publicly pullable.

## Demo Credentials (Password for all: `Password@123`)

- **Verification Officer**: `verification.officer@example.com`
- **Government Officer**: `government.officer@example.com`
- **Super Administrator**: `super.admin@example.com`
- **Data Entry Operator**: `data.entry@example.com`
- **Citizen User**: `citizen@example.com`
