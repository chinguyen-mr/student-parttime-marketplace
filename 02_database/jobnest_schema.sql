-- JobNest — schema PostgreSQL (đã gồm mọi migration tới 018).
-- Dữ liệu demo nạp riêng: scripts/data_v3/import_data_v3.py (hoặc: docker compose --profile seed run --rm seed)

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_logs (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    action character varying(100) NOT NULL,
    target_type character varying(50),
    target_id integer,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: admin_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_logs_id_seq OWNED BY public.admin_logs.id;


--
-- Name: application_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_histories (
    id integer NOT NULL,
    application_id integer NOT NULL,
    from_status character varying(30),
    to_status character varying(30) NOT NULL,
    changed_by integer,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: application_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_histories_id_seq OWNED BY public.application_histories.id;


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    job_id integer NOT NULL,
    student_id integer NOT NULL,
    cover_letter text,
    cv_url text,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    rejection_reason text,
    decided_at timestamp with time zone,
    decided_by integer,
    profile_snapshot jsonb,
    withdrawn_at timestamp with time zone,
    withdraw_reason text,
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'REVIEWING'::character varying, 'SHORTLISTED'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying, 'WITHDRAWN'::character varying])::text[])))
);


--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    parent_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: company_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_reviews (
    id integer NOT NULL,
    employer_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    experience_type character varying(20) NOT NULL,
    rating_environment smallint NOT NULL,
    rating_salary_benefits smallint NOT NULL,
    rating_management smallint NOT NULL,
    rating_culture smallint NOT NULL,
    rating_learning smallint NOT NULL,
    rating_recruitment smallint NOT NULL,
    rating_overall smallint NOT NULL,
    title character varying(120) NOT NULL,
    pros text NOT NULL,
    cons text NOT NULL,
    advice text,
    is_anonymous boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    verification_source character varying(20),
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    moderation_flags text[] DEFAULT '{}'::text[] NOT NULL,
    moderation_reason text,
    edit_count integer DEFAULT 0 NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT company_reviews_experience_type_check CHECK (((experience_type)::text = ANY ((ARRAY['WORKED'::character varying, 'INTERNED'::character varying, 'INTERVIEWED'::character varying, 'APPLIED'::character varying])::text[]))),
    CONSTRAINT company_reviews_no_self CHECK ((employer_id <> reviewer_id)),
    CONSTRAINT company_reviews_rating_culture_check CHECK (((rating_culture >= 1) AND (rating_culture <= 5))),
    CONSTRAINT company_reviews_rating_environment_check CHECK (((rating_environment >= 1) AND (rating_environment <= 5))),
    CONSTRAINT company_reviews_rating_learning_check CHECK (((rating_learning >= 1) AND (rating_learning <= 5))),
    CONSTRAINT company_reviews_rating_management_check CHECK (((rating_management >= 1) AND (rating_management <= 5))),
    CONSTRAINT company_reviews_rating_overall_check CHECK (((rating_overall >= 1) AND (rating_overall <= 5))),
    CONSTRAINT company_reviews_rating_recruitment_check CHECK (((rating_recruitment >= 1) AND (rating_recruitment <= 5))),
    CONSTRAINT company_reviews_rating_salary_benefits_check CHECK (((rating_salary_benefits >= 1) AND (rating_salary_benefits <= 5))),
    CONSTRAINT company_reviews_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PUBLISHED'::character varying, 'REJECTED'::character varying, 'HIDDEN'::character varying, 'REMOVED'::character varying])::text[]))),
    CONSTRAINT company_reviews_verification_source_check CHECK (((verification_source)::text = ANY ((ARRAY['WORK_ASSIGNMENT'::character varying, 'APPLICATION'::character varying])::text[]))),
    CONSTRAINT company_reviews_verified_source CHECK ((is_verified = (verification_source IS NOT NULL)))
);


--
-- Name: company_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_reviews_id_seq OWNED BY public.company_reviews.id;


--
-- Name: deliverable_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deliverable_reviews (
    id integer NOT NULL,
    deliverable_id integer NOT NULL,
    reviewed_by integer NOT NULL,
    decision character varying(30),
    comment text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT deliverable_reviews_decision_check CHECK (((decision)::text = ANY (ARRAY[('ACCEPTED'::character varying)::text, ('REVISION_REQUESTED'::character varying)::text])))
);


--
-- Name: deliverable_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deliverable_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deliverable_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deliverable_reviews_id_seq OWNED BY public.deliverable_reviews.id;


--
-- Name: employer_profile_changes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employer_profile_changes (
    id integer NOT NULL,
    employer_id integer NOT NULL,
    changed_by integer,
    section character varying(40) NOT NULL,
    changes jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: employer_profile_changes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employer_profile_changes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employer_profile_changes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employer_profile_changes_id_seq OWNED BY public.employer_profile_changes.id;


--
-- Name: employer_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employer_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    display_name character varying(255) NOT NULL,
    bio text,
    location character varying(255),
    avatar_url character varying(500),
    email_verified_at timestamp without time zone,
    phone_verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    account_type character varying(100),
    tax_code character varying(20),
    website character varying(255),
    business_license_file character varying(255),
    representative_name character varying(255),
    representative_title character varying(255),
    company_name character varying(255),
    company_type character varying(100),
    industry character varying(255),
    company_size character varying(100),
    province character varying(255),
    detailed_address text,
    cover_url character varying(500),
    recruiter_name character varying(255),
    recruiter_email character varying(255),
    work_environment_desc text,
    office_images jsonb DEFAULT '[]'::jsonb,
    verification_status character varying(50) DEFAULT 'UNVERIFIED'::character varying,
    profile_completion_rate integer DEFAULT 30,
    is_profile_completed boolean DEFAULT false,
    brand_name character varying(255),
    founded_year smallint,
    mission text,
    core_values text,
    products_services text,
    achievements text,
    benefits text,
    hr_policies text,
    branches jsonb DEFAULT '[]'::jsonb,
    social_links jsonb DEFAULT '{}'::jsonb,
    public_email character varying(255),
    public_phone character varying(20),
    latitude numeric(9,6),
    longitude numeric(9,6),
    representative_avatar_url character varying(500),
    internal_culture text,
    hr_policy_details jsonb DEFAULT '{}'::jsonb,
    verification_note text,
    verification_submitted_at timestamp with time zone,
    verification_reviewed_at timestamp with time zone,
    CONSTRAINT employer_profiles_coords_check CHECK ((((latitude IS NULL) AND (longitude IS NULL)) OR (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)) AND ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))))),
    CONSTRAINT employer_profiles_founded_year_check CHECK (((founded_year IS NULL) OR ((founded_year >= 1800) AND (founded_year <= 2100))))
);


--
-- Name: employer_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employer_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employer_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employer_profiles_id_seq OWNED BY public.employer_profiles.id;


--
-- Name: file_uploads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.file_uploads (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    kind character varying(20) NOT NULL,
    original_name character varying(255),
    mime_type character varying(100) NOT NULL,
    size_bytes integer NOT NULL,
    data bytea NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT file_uploads_kind_check CHECK (((kind)::text = ANY ((ARRAY['AVATAR'::character varying, 'AVATAR_SOURCE'::character varying, 'CV'::character varying, 'REVIEW_IMAGE'::character varying, 'COVER'::character varying, 'OFFICE_IMAGE'::character varying, 'REP_AVATAR'::character varying, 'LEGAL_DOC'::character varying])::text[]))),
    CONSTRAINT file_uploads_size_bytes_check CHECK ((size_bytes > 0))
);


--
-- Name: file_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.file_uploads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: file_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.file_uploads_id_seq OWNED BY public.file_uploads.id;


--
-- Name: freelance_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.freelance_details (
    job_id integer NOT NULL,
    scope text NOT NULL,
    deliverable_requirements text NOT NULL,
    deadline date NOT NULL,
    revision_limit integer
);


--
-- Name: freelance_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.freelance_proposals (
    id integer NOT NULL,
    job_id integer NOT NULL,
    student_id integer NOT NULL,
    proposal_text text NOT NULL,
    estimated_duration character varying(100),
    proposed_price integer,
    status character varying(30) DEFAULT 'SUBMITTED'::character varying,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT proposals_status_check CHECK (((status)::text = ANY (ARRAY[('SUBMITTED'::character varying)::text, ('REVIEWING'::character varying)::text, ('ACCEPTED'::character varying)::text, ('REJECTED'::character varying)::text, ('WITHDRAWN'::character varying)::text])))
);


--
-- Name: job_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_reviews (
    id integer NOT NULL,
    job_id integer NOT NULL,
    employer_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    assignment_id integer,
    experience_type character varying(20) NOT NULL,
    rating_description_accuracy smallint NOT NULL,
    rating_salary_accuracy smallint NOT NULL,
    rating_schedule smallint NOT NULL,
    rating_workload smallint NOT NULL,
    rating_manager_support smallint NOT NULL,
    rating_overall smallint NOT NULL,
    content text NOT NULL,
    is_anonymous boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    verification_source character varying(20),
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    moderation_flags text[] DEFAULT '{}'::text[] NOT NULL,
    moderation_reason text,
    edit_count integer DEFAULT 0 NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_reviews_experience_type_check CHECK (((experience_type)::text = ANY ((ARRAY['WORKED'::character varying, 'INTERNED'::character varying])::text[]))),
    CONSTRAINT job_reviews_no_self CHECK ((employer_id <> reviewer_id)),
    CONSTRAINT job_reviews_rating_description_accuracy_check CHECK (((rating_description_accuracy >= 1) AND (rating_description_accuracy <= 5))),
    CONSTRAINT job_reviews_rating_manager_support_check CHECK (((rating_manager_support >= 1) AND (rating_manager_support <= 5))),
    CONSTRAINT job_reviews_rating_overall_check CHECK (((rating_overall >= 1) AND (rating_overall <= 5))),
    CONSTRAINT job_reviews_rating_salary_accuracy_check CHECK (((rating_salary_accuracy >= 1) AND (rating_salary_accuracy <= 5))),
    CONSTRAINT job_reviews_rating_schedule_check CHECK (((rating_schedule >= 1) AND (rating_schedule <= 5))),
    CONSTRAINT job_reviews_rating_workload_check CHECK (((rating_workload >= 1) AND (rating_workload <= 5))),
    CONSTRAINT job_reviews_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PUBLISHED'::character varying, 'REJECTED'::character varying, 'HIDDEN'::character varying, 'REMOVED'::character varying])::text[]))),
    CONSTRAINT job_reviews_verification_source_check CHECK (((verification_source)::text = 'WORK_ASSIGNMENT'::text)),
    CONSTRAINT job_reviews_verified_source CHECK ((is_verified = (verification_source IS NOT NULL)))
);


--
-- Name: job_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_reviews_id_seq OWNED BY public.job_reviews.id;


--
-- Name: job_saved; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_saved (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: job_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_skills (
    job_id integer NOT NULL,
    skill_name character varying(100) NOT NULL
);


--
-- Name: job_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_views (
    id integer NOT NULL,
    job_id integer NOT NULL,
    viewer_id integer,
    viewed_at timestamp without time zone DEFAULT now()
);


--
-- Name: job_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_views_id_seq OWNED BY public.job_views.id;


--
-- Name: job_work_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_work_schedules (
    id integer NOT NULL,
    job_id integer NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    min_hours_per_shift numeric(4,2) DEFAULT 0,
    is_mandatory boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_job_time_range CHECK ((end_time > start_time)),
    CONSTRAINT job_work_schedules_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7))),
    CONSTRAINT job_work_schedules_min_hours_per_shift_check CHECK ((min_hours_per_shift >= (0)::numeric))
);


--
-- Name: job_work_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_work_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_work_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_work_schedules_id_seq OWNED BY public.job_work_schedules.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    employer_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    requirements text,
    category character varying(150) NOT NULL,
    location character varying(255) NOT NULL,
    salary_type character varying(50) DEFAULT 'HOURLY'::character varying,
    salary numeric(12,2) NOT NULL,
    work_type character varying(50) DEFAULT 'PART_TIME'::character varying NOT NULL,
    status character varying(50) DEFAULT 'OPEN'::character varying,
    moderation_status character varying(50) DEFAULT 'APPROVED'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    benefits text,
    experience character varying(100) DEFAULT 'Không yêu cầu kinh nghiệm'::character varying,
    education character varying(100) DEFAULT 'Đại học / Cao đẳng'::character varying,
    headcount integer DEFAULT 1,
    level character varying(100) DEFAULT 'Nhân viên'::character varying,
    deadline date DEFAULT (CURRENT_DATE + '30 days'::interval),
    work_schedule text,
    banner_url text,
    work_address character varying(255),
    latitude numeric(10,7),
    longitude numeric(10,7),
    application_deadline timestamp without time zone,
    job_banner_url character varying(500),
    moderation_reason text,
    CONSTRAINT jobs_moderation_status_check CHECK (((moderation_status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('APPROVED'::character varying)::text, ('REJECTED'::character varying)::text]))),
    CONSTRAINT jobs_status_check CHECK (((status)::text = ANY (ARRAY[('DRAFT'::character varying)::text, ('PENDING_REVIEW'::character varying)::text, ('PUBLISHED'::character varying)::text, ('CLOSED'::character varying)::text, ('EXPIRED'::character varying)::text, ('REJECTED'::character varying)::text, ('OPEN'::character varying)::text, ('FILLED'::character varying)::text, ('COMPLETED'::character varying)::text]))),
    CONSTRAINT jobs_work_type_check CHECK (((work_type)::text = ANY ((ARRAY['PART_TIME'::character varying, 'FULL_TIME'::character varying])::text[])))
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    body text,
    target_type character varying(50),
    target_id integer,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: part_time_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_time_details (
    job_id integer NOT NULL,
    shift_description character varying(255),
    weekly_schedule text,
    hours_per_week integer
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: proposal_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposal_histories (
    id integer NOT NULL,
    proposal_id integer NOT NULL,
    from_status character varying(30),
    to_status character varying(30) NOT NULL,
    changed_by integer,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: proposal_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proposal_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proposal_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proposal_histories_id_seq OWNED BY public.proposal_histories.id;


--
-- Name: proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proposals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proposals_id_seq OWNED BY public.freelance_proposals.id;


--
-- Name: report_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_actions (
    id integer NOT NULL,
    report_id integer NOT NULL,
    admin_id integer NOT NULL,
    action character varying(100),
    note text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: report_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.report_actions_id_seq OWNED BY public.report_actions.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    reporter_id integer NOT NULL,
    target_type character varying(20),
    target_id integer NOT NULL,
    reason text NOT NULL,
    description text,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reports_target_type_check CHECK (((target_type)::text = ANY (ARRAY[('JOB'::character varying)::text, ('USER'::character varying)::text])))
);


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: review_moderation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_moderation_logs (
    id integer NOT NULL,
    company_review_id integer,
    job_review_id integer,
    actor_id integer,
    actor_role character varying(20) NOT NULL,
    action character varying(30) NOT NULL,
    from_status character varying(20),
    to_status character varying(20),
    reason text,
    report_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT review_logs_one_target CHECK (((((company_review_id IS NOT NULL))::integer + ((job_review_id IS NOT NULL))::integer) = 1))
);


--
-- Name: review_moderation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_moderation_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_moderation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_moderation_logs_id_seq OWNED BY public.review_moderation_logs.id;


--
-- Name: review_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_replies (
    id integer NOT NULL,
    company_review_id integer,
    job_review_id integer,
    employer_id integer NOT NULL,
    content text NOT NULL,
    status character varying(20) DEFAULT 'VISIBLE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT review_replies_one_target CHECK (((((company_review_id IS NOT NULL))::integer + ((job_review_id IS NOT NULL))::integer) = 1)),
    CONSTRAINT review_replies_status_check CHECK (((status)::text = ANY ((ARRAY['VISIBLE'::character varying, 'HIDDEN'::character varying])::text[])))
);


--
-- Name: review_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_replies_id_seq OWNED BY public.review_replies.id;


--
-- Name: review_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_reports (
    id integer NOT NULL,
    company_review_id integer,
    job_review_id integer,
    reporter_id integer NOT NULL,
    kind character varying(10) DEFAULT 'REPORT'::character varying NOT NULL,
    reason character varying(30) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    resolution_note text,
    resolved_by integer,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT review_reports_kind_check CHECK (((kind)::text = ANY ((ARRAY['REPORT'::character varying, 'APPEAL'::character varying])::text[]))),
    CONSTRAINT review_reports_one_target CHECK (((((company_review_id IS NOT NULL))::integer + ((job_review_id IS NOT NULL))::integer) = 1)),
    CONSTRAINT review_reports_reason_check CHECK (((reason)::text = ANY ((ARRAY['SPAM'::character varying, 'OFFENSIVE'::character varying, 'FALSE_INFO'::character varying, 'PERSONAL_INFO'::character varying, 'CONFLICT_OF_INTEREST'::character varying, 'OTHER'::character varying, 'APPEAL'::character varying])::text[]))),
    CONSTRAINT review_reports_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'RESOLVED'::character varying, 'DISMISSED'::character varying])::text[])))
);


--
-- Name: review_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_reports_id_seq OWNED BY public.review_reports.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    job_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    reviewee_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: saved_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saved_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saved_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saved_jobs_id_seq OWNED BY public.job_saved.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    id integer NOT NULL,
    version character varying(255) NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: schema_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schema_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schema_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schema_migrations_id_seq OWNED BY public.schema_migrations.id;


--
-- Name: seasonal_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasonal_details (
    job_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    schedule_description text
);


--
-- Name: student_availabilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_availabilities (
    id integer NOT NULL,
    student_id integer NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_student_time_range CHECK ((end_time > start_time)),
    CONSTRAINT student_availabilities_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


--
-- Name: student_availabilities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_availabilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_availabilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_availabilities_id_seq OWNED BY public.student_availabilities.id;


--
-- Name: student_cvs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_cvs (
    id integer NOT NULL,
    student_profile_id integer NOT NULL,
    file_key character varying(500) NOT NULL,
    original_name character varying(255),
    mime_type character varying(100),
    size_bytes integer,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: student_cvs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_cvs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_cvs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_cvs_id_seq OWNED BY public.student_cvs.id;


--
-- Name: student_educations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_educations (
    id integer NOT NULL,
    student_profile_id integer NOT NULL,
    institution character varying(255) NOT NULL,
    degree character varying(255),
    start_date date,
    end_date date,
    CONSTRAINT student_educations_check CHECK ((end_date > start_date))
);


--
-- Name: student_educations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_educations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_educations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_educations_id_seq OWNED BY public.student_educations.id;


--
-- Name: student_experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_experiences (
    id integer NOT NULL,
    student_profile_id integer NOT NULL,
    title character varying(255) NOT NULL,
    organization character varying(255),
    description text,
    start_date date,
    end_date date
);


--
-- Name: student_experiences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_experiences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_experiences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_experiences_id_seq OWNED BY public.student_experiences.id;


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    date_of_birth date,
    school character varying(255),
    major character varying(255),
    bio text,
    avatar_url character varying(500),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    student_code character varying(50),
    experience text,
    default_cv_url character varying(500),
    skills text[],
    gender character varying(50),
    province character varying(255),
    interested_category character varying(255),
    desired_position character varying(255),
    detailed_address text,
    languages jsonb DEFAULT '[]'::jsonb,
    desired_salary character varying(100),
    desired_work_type character varying(100),
    profile_completion_rate integer DEFAULT 30,
    is_profile_completed boolean DEFAULT false,
    year_of_study character varying(30),
    graduation_year smallint,
    gpa numeric(4,2),
    ward character varying(255),
    CONSTRAINT student_profiles_gpa_check CHECK (((gpa IS NULL) OR ((gpa >= (0)::numeric) AND (gpa <= (10)::numeric)))),
    CONSTRAINT student_profiles_graduation_year_check CHECK (((graduation_year IS NULL) OR ((graduation_year >= 1990) AND (graduation_year <= 2100))))
);


--
-- Name: student_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_profiles_id_seq OWNED BY public.student_profiles.id;


--
-- Name: student_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_skills (
    id integer NOT NULL,
    student_profile_id integer NOT NULL,
    skill_name character varying(100) NOT NULL
);


--
-- Name: student_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_skills_id_seq OWNED BY public.student_skills.id;


--
-- Name: user_appeals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_appeals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    violation_id integer,
    appeal_reason text NOT NULL,
    evidence_url text,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    admin_response text,
    resolved_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    resolved_at timestamp with time zone
);


--
-- Name: user_appeals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_appeals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_appeals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_appeals_id_seq OWNED BY public.user_appeals.id;


--
-- Name: user_violations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_violations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    violation_code character varying(50) NOT NULL,
    violation_type character varying(100) NOT NULL,
    severity character varying(50) DEFAULT 'MEDIUM'::character varying,
    tier integer DEFAULT 1,
    reason text NOT NULL,
    evidence text,
    handled_by integer,
    status character varying(50) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_violations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_violations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_violations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_violations_id_seq OWNED BY public.user_violations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(50),
    role character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    violation_count integer DEFAULT 0,
    suspension_reason text,
    suspended_at timestamp with time zone,
    suspension_expires_at timestamp with time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('STUDENT'::character varying)::text, ('EMPLOYER'::character varying)::text, ('ADMIN'::character varying)::text]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('BANNED'::character varying)::text, ('PENDING'::character varying)::text])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    channel character varying(10) NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    attempt_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT verification_tokens_channel_check CHECK (((channel)::text = ANY (ARRAY[('EMAIL'::character varying)::text, ('PHONE'::character varying)::text])))
);


--
-- Name: verification_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.verification_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: verification_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.verification_tokens_id_seq OWNED BY public.verification_tokens.id;


--
-- Name: work_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_assignments (
    id integer NOT NULL,
    job_id integer NOT NULL,
    student_id integer NOT NULL,
    application_id integer,
    status character varying(50) DEFAULT 'NOT_STARTED'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    proposal_id integer,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    termination_reason text,
    terminated_at timestamp without time zone,
    CONSTRAINT chk_work_assignments_status CHECK (((status)::text = ANY ((ARRAY['NOT_STARTED'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'TERMINATED'::character varying, 'RESIGNED'::character varying])::text[]))),
    CONSTRAINT chk_xor_source CHECK (((((application_id IS NOT NULL))::integer + ((proposal_id IS NOT NULL))::integer) = 1))
);


--
-- Name: work_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_assignments_id_seq OWNED BY public.work_assignments.id;


--
-- Name: work_deliverables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_deliverables (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    submitted_by integer NOT NULL,
    version_no integer NOT NULL,
    file_key character varying(500),
    description text,
    status character varying(30),
    submitted_at timestamp without time zone DEFAULT now(),
    CONSTRAINT work_deliverables_status_check CHECK (((status)::text = ANY (ARRAY[('SUBMITTED'::character varying)::text, ('ACCEPTED'::character varying)::text, ('REVISION_REQUESTED'::character varying)::text])))
);


--
-- Name: work_deliverables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_deliverables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_deliverables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_deliverables_id_seq OWNED BY public.work_deliverables.id;


--
-- Name: work_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_progress (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    updated_by integer NOT NULL,
    progress_percent integer,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    started_at timestamp without time zone
);


--
-- Name: work_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_progress_id_seq OWNED BY public.work_progress.id;


--
-- Name: admin_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_logs_id_seq'::regclass);


--
-- Name: application_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_histories ALTER COLUMN id SET DEFAULT nextval('public.application_histories_id_seq'::regclass);


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: company_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_reviews ALTER COLUMN id SET DEFAULT nextval('public.company_reviews_id_seq'::regclass);


--
-- Name: deliverable_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverable_reviews ALTER COLUMN id SET DEFAULT nextval('public.deliverable_reviews_id_seq'::regclass);


--
-- Name: employer_profile_changes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profile_changes ALTER COLUMN id SET DEFAULT nextval('public.employer_profile_changes_id_seq'::regclass);


--
-- Name: employer_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profiles ALTER COLUMN id SET DEFAULT nextval('public.employer_profiles_id_seq'::regclass);


--
-- Name: file_uploads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_uploads ALTER COLUMN id SET DEFAULT nextval('public.file_uploads_id_seq'::regclass);


--
-- Name: freelance_proposals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freelance_proposals ALTER COLUMN id SET DEFAULT nextval('public.proposals_id_seq'::regclass);


--
-- Name: job_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_reviews ALTER COLUMN id SET DEFAULT nextval('public.job_reviews_id_seq'::regclass);


--
-- Name: job_saved id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_saved ALTER COLUMN id SET DEFAULT nextval('public.saved_jobs_id_seq'::regclass);


--
-- Name: job_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_views ALTER COLUMN id SET DEFAULT nextval('public.job_views_id_seq'::regclass);


--
-- Name: job_work_schedules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_schedules ALTER COLUMN id SET DEFAULT nextval('public.job_work_schedules_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: proposal_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_histories ALTER COLUMN id SET DEFAULT nextval('public.proposal_histories_id_seq'::regclass);


--
-- Name: report_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_actions ALTER COLUMN id SET DEFAULT nextval('public.report_actions_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: review_moderation_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs ALTER COLUMN id SET DEFAULT nextval('public.review_moderation_logs_id_seq'::regclass);


--
-- Name: review_replies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies ALTER COLUMN id SET DEFAULT nextval('public.review_replies_id_seq'::regclass);


--
-- Name: review_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports ALTER COLUMN id SET DEFAULT nextval('public.review_reports_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: schema_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations ALTER COLUMN id SET DEFAULT nextval('public.schema_migrations_id_seq'::regclass);


--
-- Name: student_availabilities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_availabilities ALTER COLUMN id SET DEFAULT nextval('public.student_availabilities_id_seq'::regclass);


--
-- Name: student_cvs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_cvs ALTER COLUMN id SET DEFAULT nextval('public.student_cvs_id_seq'::regclass);


--
-- Name: student_educations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_educations ALTER COLUMN id SET DEFAULT nextval('public.student_educations_id_seq'::regclass);


--
-- Name: student_experiences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_experiences ALTER COLUMN id SET DEFAULT nextval('public.student_experiences_id_seq'::regclass);


--
-- Name: student_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN id SET DEFAULT nextval('public.student_profiles_id_seq'::regclass);


--
-- Name: student_skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_skills ALTER COLUMN id SET DEFAULT nextval('public.student_skills_id_seq'::regclass);


--
-- Name: user_appeals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_appeals ALTER COLUMN id SET DEFAULT nextval('public.user_appeals_id_seq'::regclass);


--
-- Name: user_violations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_violations ALTER COLUMN id SET DEFAULT nextval('public.user_violations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: verification_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_tokens ALTER COLUMN id SET DEFAULT nextval('public.verification_tokens_id_seq'::regclass);


--
-- Name: work_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments ALTER COLUMN id SET DEFAULT nextval('public.work_assignments_id_seq'::regclass);


--
-- Name: work_deliverables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_deliverables ALTER COLUMN id SET DEFAULT nextval('public.work_deliverables_id_seq'::regclass);


--
-- Name: work_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_progress ALTER COLUMN id SET DEFAULT nextval('public.work_progress_id_seq'::regclass);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: application_histories application_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_histories
    ADD CONSTRAINT application_histories_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: company_reviews company_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_reviews
    ADD CONSTRAINT company_reviews_pkey PRIMARY KEY (id);


--
-- Name: company_reviews company_reviews_unique_reviewer; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_reviews
    ADD CONSTRAINT company_reviews_unique_reviewer UNIQUE (employer_id, reviewer_id);


--
-- Name: deliverable_reviews deliverable_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverable_reviews
    ADD CONSTRAINT deliverable_reviews_pkey PRIMARY KEY (id);


--
-- Name: employer_profile_changes employer_profile_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profile_changes
    ADD CONSTRAINT employer_profile_changes_pkey PRIMARY KEY (id);


--
-- Name: employer_profiles employer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_pkey PRIMARY KEY (id);


--
-- Name: employer_profiles employer_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_user_id_key UNIQUE (user_id);


--
-- Name: file_uploads file_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT file_uploads_pkey PRIMARY KEY (id);


--
-- Name: freelance_details freelance_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freelance_details
    ADD CONSTRAINT freelance_details_pkey PRIMARY KEY (job_id);


--
-- Name: job_reviews job_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_reviews
    ADD CONSTRAINT job_reviews_pkey PRIMARY KEY (id);


--
-- Name: job_reviews job_reviews_unique_reviewer; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_reviews
    ADD CONSTRAINT job_reviews_unique_reviewer UNIQUE (job_id, reviewer_id);


--
-- Name: job_skills job_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_pkey PRIMARY KEY (job_id, skill_name);


--
-- Name: job_views job_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_views
    ADD CONSTRAINT job_views_pkey PRIMARY KEY (id);


--
-- Name: job_work_schedules job_work_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_schedules
    ADD CONSTRAINT job_work_schedules_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: part_time_details part_time_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_time_details
    ADD CONSTRAINT part_time_details_pkey PRIMARY KEY (job_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: proposal_histories proposal_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_histories
    ADD CONSTRAINT proposal_histories_pkey PRIMARY KEY (id);


--
-- Name: freelance_proposals proposals_job_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freelance_proposals
    ADD CONSTRAINT proposals_job_id_student_id_key UNIQUE (job_id, student_id);


--
-- Name: freelance_proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freelance_proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: report_actions report_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_actions
    ADD CONSTRAINT report_actions_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: review_moderation_logs review_moderation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs
    ADD CONSTRAINT review_moderation_logs_pkey PRIMARY KEY (id);


--
-- Name: review_replies review_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT review_replies_pkey PRIMARY KEY (id);


--
-- Name: review_reports review_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: job_saved saved_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_saved
    ADD CONSTRAINT saved_jobs_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_version_key UNIQUE (version);


--
-- Name: seasonal_details seasonal_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_details
    ADD CONSTRAINT seasonal_details_pkey PRIMARY KEY (job_id);


--
-- Name: student_availabilities student_availabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_availabilities
    ADD CONSTRAINT student_availabilities_pkey PRIMARY KEY (id);


--
-- Name: student_cvs student_cvs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_cvs
    ADD CONSTRAINT student_cvs_pkey PRIMARY KEY (id);


--
-- Name: student_educations student_educations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_educations
    ADD CONSTRAINT student_educations_pkey PRIMARY KEY (id);


--
-- Name: student_experiences student_experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_experiences
    ADD CONSTRAINT student_experiences_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: student_skills student_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_skills
    ADD CONSTRAINT student_skills_pkey PRIMARY KEY (id);


--
-- Name: work_assignments unique_application_assignment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT unique_application_assignment UNIQUE (application_id);


--
-- Name: reviews unique_job_reviewer_reviewee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_job_reviewer_reviewee UNIQUE (job_id, reviewer_id, reviewee_id);


--
-- Name: applications unique_job_student; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT unique_job_student UNIQUE (job_id, student_id);


--
-- Name: work_assignments unique_proposal_assignment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT unique_proposal_assignment UNIQUE (proposal_id);


--
-- Name: job_saved unique_user_saved_job; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_saved
    ADD CONSTRAINT unique_user_saved_job UNIQUE (user_id, job_id);


--
-- Name: job_work_schedules uq_job_schedule_slot; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_schedules
    ADD CONSTRAINT uq_job_schedule_slot UNIQUE (job_id, day_of_week, start_time, end_time);


--
-- Name: student_availabilities uq_student_avail_slot; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_availabilities
    ADD CONSTRAINT uq_student_avail_slot UNIQUE (student_id, day_of_week, start_time, end_time);


--
-- Name: user_appeals user_appeals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_appeals
    ADD CONSTRAINT user_appeals_pkey PRIMARY KEY (id);


--
-- Name: user_violations user_violations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_tokens verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: work_assignments work_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_pkey PRIMARY KEY (id);


--
-- Name: work_deliverables work_deliverables_assignment_id_version_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_deliverables
    ADD CONSTRAINT work_deliverables_assignment_id_version_no_key UNIQUE (assignment_id, version_no);


--
-- Name: work_deliverables work_deliverables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_deliverables
    ADD CONSTRAINT work_deliverables_pkey PRIMARY KEY (id);


--
-- Name: work_progress work_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_progress
    ADD CONSTRAINT work_progress_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_logs_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_logs_admin ON public.admin_logs USING btree (admin_id);


--
-- Name: idx_admin_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_logs_created ON public.admin_logs USING btree (created_at);


--
-- Name: idx_appeals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appeals_user_id ON public.user_appeals USING btree (user_id);


--
-- Name: idx_application_histories_app; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_application_histories_app ON public.application_histories USING btree (application_id);


--
-- Name: idx_application_histories_app_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_application_histories_app_id ON public.application_histories USING btree (application_id);


--
-- Name: idx_applications_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_applications_job ON public.applications USING btree (job_id);


--
-- Name: idx_applications_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_applications_student ON public.applications USING btree (student_id);


--
-- Name: idx_apps_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apps_job_id ON public.applications USING btree (job_id);


--
-- Name: idx_apps_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apps_student_id ON public.applications USING btree (student_id);


--
-- Name: idx_categories_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_parent ON public.categories USING btree (parent_id);


--
-- Name: idx_company_reviews_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_reviews_public ON public.company_reviews USING btree (employer_id, status, published_at DESC);


--
-- Name: idx_company_reviews_reviewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_reviews_reviewer ON public.company_reviews USING btree (reviewer_id, created_at DESC);


--
-- Name: idx_company_reviews_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_reviews_status ON public.company_reviews USING btree (status, created_at DESC);


--
-- Name: idx_deliverable_reviews_deliverable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deliverable_reviews_deliverable ON public.deliverable_reviews USING btree (deliverable_id);


--
-- Name: idx_employer_profile_changes_employer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employer_profile_changes_employer ON public.employer_profile_changes USING btree (employer_id, created_at DESC);


--
-- Name: idx_employer_profiles_industry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employer_profiles_industry ON public.employer_profiles USING btree (industry);


--
-- Name: idx_employer_profiles_province; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employer_profiles_province ON public.employer_profiles USING btree (province);


--
-- Name: idx_employer_profiles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employer_profiles_user ON public.employer_profiles USING btree (user_id);


--
-- Name: idx_employer_profiles_vstatus; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employer_profiles_vstatus ON public.employer_profiles USING btree (verification_status);


--
-- Name: idx_file_uploads_owner_kind; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_file_uploads_owner_kind ON public.file_uploads USING btree (owner_id, kind);


--
-- Name: idx_freelance_proposals_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_freelance_proposals_job ON public.freelance_proposals USING btree (job_id);


--
-- Name: idx_freelance_proposals_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_freelance_proposals_student ON public.freelance_proposals USING btree (student_id);


--
-- Name: idx_job_reviews_employer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_reviews_employer ON public.job_reviews USING btree (employer_id, status, published_at DESC);


--
-- Name: idx_job_reviews_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_reviews_public ON public.job_reviews USING btree (job_id, status, published_at DESC);


--
-- Name: idx_job_reviews_reviewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_reviews_reviewer ON public.job_reviews USING btree (reviewer_id, created_at DESC);


--
-- Name: idx_job_reviews_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_reviews_status ON public.job_reviews USING btree (status, created_at DESC);


--
-- Name: idx_job_saved_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_saved_user ON public.job_saved USING btree (user_id);


--
-- Name: idx_job_schedule_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_schedule_lookup ON public.job_work_schedules USING btree (job_id, day_of_week);


--
-- Name: idx_job_views_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_views_job ON public.job_views USING btree (job_id);


--
-- Name: idx_jobs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_category ON public.jobs USING btree (category);


--
-- Name: idx_jobs_employer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_employer_id ON public.jobs USING btree (employer_id);


--
-- Name: idx_jobs_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_location ON public.jobs USING btree (location);


--
-- Name: idx_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);


--
-- Name: idx_jobs_status_mod; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_status_mod ON public.jobs USING btree (status, moderation_status);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, read_at, created_at);


--
-- Name: idx_password_reset_tokens_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_reset_tokens_user ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_proposal_histories_prop; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposal_histories_prop ON public.proposal_histories USING btree (proposal_id);


--
-- Name: idx_proposal_histories_prop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposal_histories_prop_id ON public.proposal_histories USING btree (proposal_id);


--
-- Name: idx_proposals_job_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposals_job_status ON public.freelance_proposals USING btree (job_id, status);


--
-- Name: idx_proposals_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposals_student ON public.freelance_proposals USING btree (student_id);


--
-- Name: idx_report_actions_report; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_actions_report ON public.report_actions USING btree (report_id);


--
-- Name: idx_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_status ON public.reports USING btree (status);


--
-- Name: idx_reports_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_target ON public.reports USING btree (target_type, target_id);


--
-- Name: idx_review_logs_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_logs_company ON public.review_moderation_logs USING btree (company_review_id, created_at);


--
-- Name: idx_review_logs_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_logs_job ON public.review_moderation_logs USING btree (job_review_id, created_at);


--
-- Name: idx_review_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_reports_status ON public.review_reports USING btree (status, kind, created_at DESC);


--
-- Name: idx_reviews_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_job ON public.reviews USING btree (job_id);


--
-- Name: idx_reviews_reviewee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_reviewee ON public.reviews USING btree (reviewee_id);


--
-- Name: idx_saved_jobs_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saved_jobs_job_id ON public.job_saved USING btree (job_id);


--
-- Name: idx_saved_jobs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saved_jobs_user_id ON public.job_saved USING btree (user_id);


--
-- Name: idx_student_avail_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_avail_lookup ON public.student_availabilities USING btree (student_id, day_of_week) WHERE (is_active = true);


--
-- Name: idx_student_cvs_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_cvs_profile ON public.student_cvs USING btree (student_profile_id);


--
-- Name: idx_student_educations_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_educations_profile ON public.student_educations USING btree (student_profile_id);


--
-- Name: idx_student_experiences_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_experiences_profile ON public.student_experiences USING btree (student_profile_id);


--
-- Name: idx_student_profiles_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_profiles_category ON public.student_profiles USING btree (interested_category);


--
-- Name: idx_student_profiles_province; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_profiles_province ON public.student_profiles USING btree (province);


--
-- Name: idx_student_profiles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_profiles_user ON public.student_profiles USING btree (user_id);


--
-- Name: idx_student_skills_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_skills_profile ON public.student_skills USING btree (student_profile_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_verification_tokens_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_verification_tokens_user ON public.verification_tokens USING btree (user_id);


--
-- Name: idx_violations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_violations_user_id ON public.user_violations USING btree (user_id);


--
-- Name: idx_work_assignments_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_assignments_job ON public.work_assignments USING btree (job_id);


--
-- Name: idx_work_assignments_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_assignments_student ON public.work_assignments USING btree (student_id);


--
-- Name: idx_work_deliverables_assignment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_deliverables_assignment ON public.work_deliverables USING btree (assignment_id);


--
-- Name: idx_work_progress_assignment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_progress_assignment ON public.work_progress USING btree (assignment_id);


--
-- Name: uq_review_replies_company; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_review_replies_company ON public.review_replies USING btree (company_review_id) WHERE (company_review_id IS NOT NULL);


--
-- Name: uq_review_replies_job; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_review_replies_job ON public.review_replies USING btree (job_review_id) WHERE (job_review_id IS NOT NULL);


--
-- Name: uq_review_reports_pending_company; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_review_reports_pending_company ON public.review_reports USING btree (company_review_id, reporter_id, kind) WHERE (((status)::text = 'PENDING'::text) AND (company_review_id IS NOT NULL));


--
-- Name: uq_review_reports_pending_job; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_review_reports_pending_job ON public.review_reports USING btree (job_review_id, reporter_id, kind) WHERE (((status)::text = 'PENDING'::text) AND (job_review_id IS NOT NULL));


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: application_histories application_histories_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_histories
    ADD CONSTRAINT application_histories_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: application_histories application_histories_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_histories
    ADD CONSTRAINT application_histories_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: applications applications_decided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES public.users(id);


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: applications applications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: company_reviews company_reviews_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_reviews
    ADD CONSTRAINT company_reviews_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: company_reviews company_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_reviews
    ADD CONSTRAINT company_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: deliverable_reviews deliverable_reviews_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverable_reviews
    ADD CONSTRAINT deliverable_reviews_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES public.work_deliverables(id) ON DELETE CASCADE;


--
-- Name: deliverable_reviews deliverable_reviews_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverable_reviews
    ADD CONSTRAINT deliverable_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: employer_profile_changes employer_profile_changes_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profile_changes
    ADD CONSTRAINT employer_profile_changes_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: employer_profile_changes employer_profile_changes_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profile_changes
    ADD CONSTRAINT employer_profile_changes_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employer_profiles employer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: file_uploads file_uploads_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT file_uploads_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: freelance_details freelance_details_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freelance_details
    ADD CONSTRAINT freelance_details_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_reviews job_reviews_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_reviews
    ADD CONSTRAINT job_reviews_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.work_assignments(id) ON DELETE SET NULL;


--
-- Name: job_reviews job_reviews_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_reviews
    ADD CONSTRAINT job_reviews_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_reviews job_reviews_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_reviews
    ADD CONSTRAINT job_reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_reviews job_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_reviews
    ADD CONSTRAINT job_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_skills job_skills_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_views job_views_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_views
    ADD CONSTRAINT job_views_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_views job_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_views
    ADD CONSTRAINT job_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: job_work_schedules job_work_schedules_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_schedules
    ADD CONSTRAINT job_work_schedules_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: part_time_details part_time_details_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_time_details
    ADD CONSTRAINT part_time_details_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: proposal_histories proposal_histories_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_histories
    ADD CONSTRAINT proposal_histories_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: proposal_histories proposal_histories_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposal_histories
    ADD CONSTRAINT proposal_histories_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.freelance_proposals(id) ON DELETE CASCADE;


--
-- Name: freelance_proposals proposals_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freelance_proposals
    ADD CONSTRAINT proposals_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: freelance_proposals proposals_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freelance_proposals
    ADD CONSTRAINT proposals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: report_actions report_actions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_actions
    ADD CONSTRAINT report_actions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: report_actions report_actions_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_actions
    ADD CONSTRAINT report_actions_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_moderation_logs review_moderation_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs
    ADD CONSTRAINT review_moderation_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: review_moderation_logs review_moderation_logs_company_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs
    ADD CONSTRAINT review_moderation_logs_company_review_id_fkey FOREIGN KEY (company_review_id) REFERENCES public.company_reviews(id) ON DELETE CASCADE;


--
-- Name: review_moderation_logs review_moderation_logs_job_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs
    ADD CONSTRAINT review_moderation_logs_job_review_id_fkey FOREIGN KEY (job_review_id) REFERENCES public.job_reviews(id) ON DELETE CASCADE;


--
-- Name: review_moderation_logs review_moderation_logs_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_moderation_logs
    ADD CONSTRAINT review_moderation_logs_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.review_reports(id) ON DELETE SET NULL;


--
-- Name: review_replies review_replies_company_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT review_replies_company_review_id_fkey FOREIGN KEY (company_review_id) REFERENCES public.company_reviews(id) ON DELETE CASCADE;


--
-- Name: review_replies review_replies_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT review_replies_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_replies review_replies_job_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT review_replies_job_review_id_fkey FOREIGN KEY (job_review_id) REFERENCES public.job_reviews(id) ON DELETE CASCADE;


--
-- Name: review_reports review_reports_company_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_company_review_id_fkey FOREIGN KEY (company_review_id) REFERENCES public.company_reviews(id) ON DELETE CASCADE;


--
-- Name: review_reports review_reports_job_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_job_review_id_fkey FOREIGN KEY (job_review_id) REFERENCES public.job_reviews(id) ON DELETE CASCADE;


--
-- Name: review_reports review_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_reports review_reports_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: reviews reviews_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_saved saved_jobs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_saved
    ADD CONSTRAINT saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_saved saved_jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_saved
    ADD CONSTRAINT saved_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seasonal_details seasonal_details_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_details
    ADD CONSTRAINT seasonal_details_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: student_availabilities student_availabilities_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_availabilities
    ADD CONSTRAINT student_availabilities_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_cvs student_cvs_student_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_cvs
    ADD CONSTRAINT student_cvs_student_profile_id_fkey FOREIGN KEY (student_profile_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: student_educations student_educations_student_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_educations
    ADD CONSTRAINT student_educations_student_profile_id_fkey FOREIGN KEY (student_profile_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: student_experiences student_experiences_student_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_experiences
    ADD CONSTRAINT student_experiences_student_profile_id_fkey FOREIGN KEY (student_profile_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_skills student_skills_student_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_skills
    ADD CONSTRAINT student_skills_student_profile_id_fkey FOREIGN KEY (student_profile_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: user_appeals user_appeals_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_appeals
    ADD CONSTRAINT user_appeals_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: user_appeals user_appeals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_appeals
    ADD CONSTRAINT user_appeals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_appeals user_appeals_violation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_appeals
    ADD CONSTRAINT user_appeals_violation_id_fkey FOREIGN KEY (violation_id) REFERENCES public.user_violations(id) ON DELETE SET NULL;


--
-- Name: user_violations user_violations_handled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.users(id);


--
-- Name: user_violations user_violations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: verification_tokens verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: work_assignments work_assignments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: work_assignments work_assignments_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: work_assignments work_assignments_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.freelance_proposals(id) ON DELETE CASCADE;


--
-- Name: work_assignments work_assignments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: work_deliverables work_deliverables_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_deliverables
    ADD CONSTRAINT work_deliverables_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.work_assignments(id) ON DELETE CASCADE;


--
-- Name: work_deliverables work_deliverables_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_deliverables
    ADD CONSTRAINT work_deliverables_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: work_progress work_progress_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_progress
    ADD CONSTRAINT work_progress_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.work_assignments(id) ON DELETE CASCADE;


--
-- Name: work_progress work_progress_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_progress
    ADD CONSTRAINT work_progress_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--


COPY public.schema_migrations (id, version, applied_at) FROM stdin;
1	users.sql	2026-11-09 19:46:53.229872+00
2	categories.sql	2026-11-09 19:46:53.244753+00
3	employer_profiles.sql	2026-11-09 19:46:53.253397+00
4	student_profiles.sql	2026-11-09 19:46:53.260026+00
5	jobs.sql	2026-11-09 19:46:53.272169+00
6	part_time_details.sql	2026-11-09 19:46:53.276056+00
7	freelance_details.sql	2026-11-09 19:46:53.280968+00
8	seasonal_details.sql	2026-11-09 19:46:53.284087+00
9	job_skills.sql	2026-11-09 19:46:53.287231+00
10	job_saved.sql	2026-11-09 19:46:53.291927+00
11	job_views.sql	2026-11-09 19:46:53.297412+00
12	applications.sql	2026-11-09 19:46:53.305599+00
13	application_histories.sql	2026-11-09 19:46:53.311638+00
14	freelance_proposals.sql	2026-11-09 19:46:53.319345+00
15	proposal_histories.sql	2026-11-09 19:46:53.324456+00
16	work_assignments.sql	2026-11-09 19:46:53.333709+00
17	work_progress.sql	2026-11-09 19:46:53.338935+00
18	work_deliverables.sql	2026-11-09 19:46:53.343354+00
19	deliverable_reviews.sql	2026-11-09 19:46:53.350676+00
20	reviews.sql	2026-11-09 19:46:53.356136+00
21	reports.sql	2026-11-09 19:46:53.363143+00
22	report_actions.sql	2026-11-09 19:46:53.368597+00
23	notifications.sql	2026-11-09 19:46:53.371437+00
24	admin_logs.sql	2026-11-09 19:46:53.376929+00
25	student_cvs.sql	2026-11-09 19:46:53.383324+00
26	student_educations.sql	2026-11-09 19:46:53.388266+00
27	student_experiences.sql	2026-11-09 19:46:53.392684+00
28	student_skills.sql	2026-11-09 19:46:53.398733+00
29	verification_tokens.sql	2026-11-09 19:46:53.401352+00
30	password_reset_tokens.sql	2026-11-09 19:46:53.403742+00
31	update_columns_for_data_v2.sql	2026-11-09 19:46:53.438023+00
32	003_create_schedules_and_availability.sql	2026-11-09 19:46:53.441192+00
33	004_add_rejection_reason_and_user_violations.sql	2026-11-09 23:20:22.034921+00
34	005_registration_redesign_profiles.sql	2026-11-12 17:21:00.232736+00
35	006_normalize_work_type.sql	2026-11-12 17:21:00.232736+00
36	007_file_uploads.sql	2026-11-12 18:15:53.289635+00
37	008_student_profile_details.sql	2026-11-12 18:26:05.712691+00
38	009_student_ward.sql	2026-11-12 18:37:40.276154+00
39	010_avatar_source.sql	2026-11-12 18:41:50.101202+00
40	011_application_snapshot_withdraw.sql	2026-11-12 18:49:54.222844+00
41	012_employer_public_profile.sql	2026-11-12 21:45:33.677135+00
42	013_employer_location.sql	2026-11-12 22:05:36.333693+00
43	014_company_job_reviews.sql	2026-11-12 22:25:39.3462+00
44	015_assignment_status_parttime.sql	2026-11-13 21:27:10.695964+00
45	016_application_withdraw_reason.sql	2026-11-13 21:27:11.094841+00
46	017_employer_company_restructure.sql	2026-11-13 21:27:11.52773+00
47	018_application_status_shortlisted.sql	2026-11-13 21:27:11.961917+00
\.
SELECT pg_catalog.setval('public.schema_migrations_id_seq', 47, true);

-- Migration 019 + 020 (thêm sau bản dump 001→018) — áp dụng cho volume Docker mới
-- Ảnh banner tin tuyển dụng: nhà tuyển dụng tải ảnh từ máy (thay cho dán đường dẫn)
ALTER TABLE file_uploads DROP CONSTRAINT IF EXISTS file_uploads_kind_check;
ALTER TABLE file_uploads ADD CONSTRAINT file_uploads_kind_check
  CHECK (kind IN ('AVATAR', 'AVATAR_SOURCE', 'CV', 'REVIEW_IMAGE', 'COVER', 'OFFICE_IMAGE', 'REP_AVATAR', 'LEGAL_DOC', 'JOB_BANNER'));

-- Đăng xuất thu hồi phiên: token có thời điểm phát hành (iat) không sau mốc này bị từ chối
ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_valid_after TIMESTAMPTZ;

-- Khôi phục mật khẩu bằng mã OTP 6 số: đếm số lần nhập sai để khóa mã khi bị dò
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;

INSERT INTO public.schema_migrations (version) VALUES ('019_job_banner_upload.sql'), ('020_logout_and_reset_otp.sql');
