---
name: ppt-master
description: "AI agent presentation generator created by Hugo He (https://github.com/hugohe3/ppt-master). Generates native, editable PowerPoint (.pptx) decks packed with vector shapes, charts, and diagrams from project documentation, specs, and spreadsheets."
---

# PPT Master — Native Editable PowerPoint Deck Generator

Official Repository: [https://github.com/hugohe3/ppt-master](https://github.com/hugohe3/ppt-master)  
Author: Hugo He  
Standard: Agent Skills Specification / Claude Code & Cursor Compatibility

## Overview
`ppt-master` is a specialized AI skill that ingests project documents (Markdown, Word docs, Excel sheets, PDFs) and converts them into natively editable PowerPoint presentations (`.pptx`). Unlike tools that generate static image-based slides, `ppt-master` creates true DrawingML shapes, text frames, and vector elements that team members and advisors can edit natively in Microsoft PowerPoint, Google Slides, or LibreOffice Impress.

---

## Core Capabilities

1. **Document Ingestion & Content Normalization**:
   - Parses SRS (`.docx`, `.xlsx`), Product Backlog, ERD, and Architecture docs.
   - Extracts structured facts without fabricating metrics or features.
2. **Native Editable Vector Output**:
   - Compiles absolute coordinate layouts into PowerPoint shapes (rectangles, cards, badges, arrows).
   - Generates clean typography hierarchy (slide title, section header, body bullets, stat callouts).
3. **Curriculum & Defense Deck Templates**:
   - Supports 16:9 widescreen layout standard for graduation defenses and academic presentations.
   - Preserves project branding (in JobNest: Soft Lavender `#7565A8` and Warm Peach `#F4B99D`).
4. **Speaker Notes Generation**:
   - Automatically attaches detailed bilingual (Vietnamese/English) presentation scripts in the speaker notes section of each slide.

---

## Slide Architecture for JobNest

When generating slides for the JobNest project, follow this 15-slide defense structure:
1. **Slide 1**: Title & Project Introduction (`JOBNEST — Nền tảng kết nối việc làm bán thời gian cho sinh viên`).
2. **Slide 2**: Problem Statement (Student scheduling conflicts, unverified employer scams).
3. **Slide 3**: Project Goals & Scope (Automated matching, shift management, peer review).
4. **Slide 4**: Target Personas & Roles (Student, Employer, Admin).
5. **Slide 5**: Core Functional Requirements (Recruitment, Application, Moderation, Review).
6. **Slide 6**: Use Case Diagram & Workflows.
7. **Slide 7**: Database Design & ERD (Data model based on `02_database/Data_v2.xlsx`).
8. **Slide 8**: System Architecture (Client-Server, Clean Architecture, REST API).
9. **Slide 9**: UI/UX Design System (Soft Lavender `#7565A8` & Peach `#F4B99D`, Responsive).
10. **Slide 10**: Technology Stack (React, Tailwind, Node.js, Express, PostgreSQL 17, Docker).
11. **Slide 11**: Sprint Plan & Implementation Progress (Agile Sprints).
12. **Slide 12**: Feature Demonstration Flow.
13. **Slide 13**: Quality Assurance & Testing (31/31 backend tests, Oxlint, Security Audit).
14. **Slide 14**: Current Limitations & Lessons Learned.
15. **Slide 15**: Conclusion & Future Roadmap.

---

## Generation Commands & Workflows

```bash
# Ingest project documents and generate presentation deck
python scripts/generate_presentation.py --input docs/ --output docs/presentation/jobnest-defense.pptx --theme lavender-peach
```
*(Dependencies: `python-pptx`, `lxml`)*

