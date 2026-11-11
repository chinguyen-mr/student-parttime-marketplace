# JobNest — Product Specification Context

## Product Mission & Value Proposition
JobNest is a modern, student-centric recruitment and marketplace platform dedicated to connecting Vietnamese university and college students with verified part-time, internship, and freelance opportunities. It provides transparent wage information, shift flexibility, peer reviews, and verified employer profiles to empower students while simplifying recruitment for verified small-to-medium businesses.

## Target Personas & Roles

1. **Student (`STUDENT`)**:
   - Primary Goals: Search jobs matching class schedules, filter by location and hourly wage, submit applications with 1-click CV, track application review progress, write post-work company reviews.
   - Pain Points: Unverified employers, fake jobs, delayed application responses, rigid working hours conflicting with school timetables.
   
2. **Employer (`EMPLOYER`)**:
   - Primary Goals: Post targeted job openings, set candidate requirements (skills, available shifts), screen applicant profiles & CVs, schedule interviews, and accept/reject candidates with automated notification templates.
   - Pain Points: Low-quality or uncommitted student applicants, complex posting processes, slow review mechanisms.

3. **Administrator (`ADMIN`)**:
   - Primary Goals: Review and approve new employer registrations, moderate job postings to prevent scams/inappropriate content, supervise system audit logs, and inspect platform analytics (jobs posted, active candidates, match rates).
   - Pain Points: Fraudulent employers, scam listings, content moderation overhead.

## Core Workflows
1. **Authentication & Profile Setup**: Registration with role specification, email verification, student resume builder, employer business verification.
2. **Job Discovery & Application**: Rich search with full-text search, categories, schedule filters (morning/afternoon/weekend), location tags, immediate application submission.
3. **Application Lifecycle**: `SUBMITTED` -> `REVIEWING` -> `INTERVIEW_SCHEDULED` -> `ACCEPTED` / `REJECTED`.
4. **Employer Workspace**: Pipeline kanban/table view of applicants per job, status progression, messaging/notifications.
5. **Admin Moderation Desk**: Pending company queue, pending job queue, user dispute handling.

## Business Constraints & Standards
- Data Integrity: Strict adherence to database schema defined in `02_database/Data_v2.xlsx`.
- Responsive Web First: Seamless experience on mobile devices (375px+ viewport) as >70% of student interactions occur on smartphones.
- Zero AI Hallucinations: No fabricated jobs, fake companies, or unauthorized schema migrations.

