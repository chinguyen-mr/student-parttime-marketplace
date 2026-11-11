--
-- PostgreSQL database dump
--

\restrict 3xD4vUAkDkDE7iroUsF6TwLESlrfQ37AHqOLgaG4kQGZxb64YaM0jlPUCBxelg7

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.admin_logs OWNER TO postgres;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_logs_id_seq OWNER TO postgres;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_logs_id_seq OWNED BY public.admin_logs.id;


--
-- Name: application_histories; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.application_histories OWNER TO postgres;

--
-- Name: application_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_histories_id_seq OWNER TO postgres;

--
-- Name: application_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_histories_id_seq OWNED BY public.application_histories.id;


--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('ACCEPTED'::character varying)::text, ('REJECTED'::character varying)::text])))
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO postgres;

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    parent_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: deliverable_reviews; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.deliverable_reviews OWNER TO postgres;

--
-- Name: deliverable_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deliverable_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deliverable_reviews_id_seq OWNER TO postgres;

--
-- Name: deliverable_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deliverable_reviews_id_seq OWNED BY public.deliverable_reviews.id;


--
-- Name: employer_profiles; Type: TABLE; Schema: public; Owner: postgres
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
    business_license_file character varying(255)
);


ALTER TABLE public.employer_profiles OWNER TO postgres;

--
-- Name: employer_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employer_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employer_profiles_id_seq OWNER TO postgres;

--
-- Name: employer_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employer_profiles_id_seq OWNED BY public.employer_profiles.id;


--
-- Name: freelance_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.freelance_details (
    job_id integer NOT NULL,
    scope text NOT NULL,
    deliverable_requirements text NOT NULL,
    deadline date NOT NULL,
    revision_limit integer
);


ALTER TABLE public.freelance_details OWNER TO postgres;

--
-- Name: freelance_proposals; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.freelance_proposals OWNER TO postgres;

--
-- Name: job_saved; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_saved (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.job_saved OWNER TO postgres;

--
-- Name: job_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_skills (
    job_id integer NOT NULL,
    skill_name character varying(100) NOT NULL
);


ALTER TABLE public.job_skills OWNER TO postgres;

--
-- Name: job_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_views (
    id integer NOT NULL,
    job_id integer NOT NULL,
    viewer_id integer,
    viewed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.job_views OWNER TO postgres;

--
-- Name: job_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_views_id_seq OWNER TO postgres;

--
-- Name: job_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_views_id_seq OWNED BY public.job_views.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
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
    work_type character varying(50) DEFAULT 'PART_TIME'::character varying,
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
    CONSTRAINT jobs_status_check CHECK (((status)::text = ANY (ARRAY[('DRAFT'::character varying)::text, ('PENDING_REVIEW'::character varying)::text, ('PUBLISHED'::character varying)::text, ('CLOSED'::character varying)::text, ('EXPIRED'::character varying)::text, ('REJECTED'::character varying)::text, ('OPEN'::character varying)::text, ('FILLED'::character varying)::text, ('COMPLETED'::character varying)::text])))
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: part_time_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.part_time_details (
    job_id integer NOT NULL,
    shift_description character varying(255),
    weekly_schedule text,
    hours_per_week integer
);


ALTER TABLE public.part_time_details OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: proposal_histories; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.proposal_histories OWNER TO postgres;

--
-- Name: proposal_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proposal_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proposal_histories_id_seq OWNER TO postgres;

--
-- Name: proposal_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proposal_histories_id_seq OWNED BY public.proposal_histories.id;


--
-- Name: proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proposals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proposals_id_seq OWNER TO postgres;

--
-- Name: proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proposals_id_seq OWNED BY public.freelance_proposals.id;


--
-- Name: report_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_actions (
    id integer NOT NULL,
    report_id integer NOT NULL,
    admin_id integer NOT NULL,
    action character varying(100),
    note text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.report_actions OWNER TO postgres;

--
-- Name: report_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_actions_id_seq OWNER TO postgres;

--
-- Name: report_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_actions_id_seq OWNED BY public.report_actions.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: saved_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_jobs_id_seq OWNER TO postgres;

--
-- Name: saved_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_jobs_id_seq OWNED BY public.job_saved.id;


--
-- Name: seasonal_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seasonal_details (
    job_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    schedule_description text
);


ALTER TABLE public.seasonal_details OWNER TO postgres;

--
-- Name: student_cvs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.student_cvs OWNER TO postgres;

--
-- Name: student_cvs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_cvs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_cvs_id_seq OWNER TO postgres;

--
-- Name: student_cvs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_cvs_id_seq OWNED BY public.student_cvs.id;


--
-- Name: student_educations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.student_educations OWNER TO postgres;

--
-- Name: student_educations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_educations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_educations_id_seq OWNER TO postgres;

--
-- Name: student_educations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_educations_id_seq OWNED BY public.student_educations.id;


--
-- Name: student_experiences; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.student_experiences OWNER TO postgres;

--
-- Name: student_experiences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_experiences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_experiences_id_seq OWNER TO postgres;

--
-- Name: student_experiences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_experiences_id_seq OWNED BY public.student_experiences.id;


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: postgres
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
    skills text[]
);


ALTER TABLE public.student_profiles OWNER TO postgres;

--
-- Name: student_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_profiles_id_seq OWNER TO postgres;

--
-- Name: student_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_profiles_id_seq OWNED BY public.student_profiles.id;


--
-- Name: student_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_skills (
    id integer NOT NULL,
    student_profile_id integer NOT NULL,
    skill_name character varying(100) NOT NULL
);


ALTER TABLE public.student_skills OWNER TO postgres;

--
-- Name: student_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_skills_id_seq OWNER TO postgres;

--
-- Name: student_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_skills_id_seq OWNED BY public.student_skills.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('STUDENT'::character varying)::text, ('EMPLOYER'::character varying)::text, ('ADMIN'::character varying)::text]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('BANNED'::character varying)::text, ('PENDING'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.verification_tokens OWNER TO postgres;

--
-- Name: verification_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.verification_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.verification_tokens_id_seq OWNER TO postgres;

--
-- Name: verification_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.verification_tokens_id_seq OWNED BY public.verification_tokens.id;


--
-- Name: work_assignments; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT chk_work_assignments_status CHECK (((status)::text = ANY (ARRAY[('NOT_STARTED'::character varying)::text, ('IN_PROGRESS'::character varying)::text, ('COMPLETED'::character varying)::text]))),
    CONSTRAINT chk_xor_source CHECK (((((application_id IS NOT NULL))::integer + ((proposal_id IS NOT NULL))::integer) = 1))
);


ALTER TABLE public.work_assignments OWNER TO postgres;

--
-- Name: work_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_assignments_id_seq OWNER TO postgres;

--
-- Name: work_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_assignments_id_seq OWNED BY public.work_assignments.id;


--
-- Name: work_deliverables; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.work_deliverables OWNER TO postgres;

--
-- Name: work_deliverables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_deliverables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_deliverables_id_seq OWNER TO postgres;

--
-- Name: work_deliverables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_deliverables_id_seq OWNED BY public.work_deliverables.id;


--
-- Name: work_progress; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.work_progress OWNER TO postgres;

--
-- Name: work_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_progress_id_seq OWNER TO postgres;

--
-- Name: work_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_progress_id_seq OWNED BY public.work_progress.id;


--
-- Name: admin_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_logs_id_seq'::regclass);


--
-- Name: application_histories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_histories ALTER COLUMN id SET DEFAULT nextval('public.application_histories_id_seq'::regclass);


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: deliverable_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliverable_reviews ALTER COLUMN id SET DEFAULT nextval('public.deliverable_reviews_id_seq'::regclass);


--
-- Name: employer_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_profiles ALTER COLUMN id SET DEFAULT nextval('public.employer_profiles_id_seq'::regclass);


--
-- Name: freelance_proposals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelance_proposals ALTER COLUMN id SET DEFAULT nextval('public.proposals_id_seq'::regclass);


--
-- Name: job_saved id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_saved ALTER COLUMN id SET DEFAULT nextval('public.saved_jobs_id_seq'::regclass);


--
-- Name: job_views id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_views ALTER COLUMN id SET DEFAULT nextval('public.job_views_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: proposal_histories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_histories ALTER COLUMN id SET DEFAULT nextval('public.proposal_histories_id_seq'::regclass);


--
-- Name: report_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_actions ALTER COLUMN id SET DEFAULT nextval('public.report_actions_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: student_cvs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_cvs ALTER COLUMN id SET DEFAULT nextval('public.student_cvs_id_seq'::regclass);


--
-- Name: student_educations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_educations ALTER COLUMN id SET DEFAULT nextval('public.student_educations_id_seq'::regclass);


--
-- Name: student_experiences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_experiences ALTER COLUMN id SET DEFAULT nextval('public.student_experiences_id_seq'::regclass);


--
-- Name: student_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN id SET DEFAULT nextval('public.student_profiles_id_seq'::regclass);


--
-- Name: student_skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_skills ALTER COLUMN id SET DEFAULT nextval('public.student_skills_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: verification_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_tokens ALTER COLUMN id SET DEFAULT nextval('public.verification_tokens_id_seq'::regclass);


--
-- Name: work_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_assignments ALTER COLUMN id SET DEFAULT nextval('public.work_assignments_id_seq'::regclass);


--
-- Name: work_deliverables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_deliverables ALTER COLUMN id SET DEFAULT nextval('public.work_deliverables_id_seq'::regclass);


--
-- Name: work_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_progress ALTER COLUMN id SET DEFAULT nextval('public.work_progress_id_seq'::regclass);


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_logs (id, admin_id, action, target_type, target_id, metadata, created_at) FROM stdin;
1	1	SYSTEM_INIT	SYSTEM	0	{"message": "Khởi tạo phân hệ quản trị JobNest Admin Portal"}	2026-11-03 06:38:24.480621
2	133	BAN_USER	USER	132	{"email": "employer.test@vlu.edu.vn", "new_status": "BANNED"}	2026-11-04 10:33:50.809728
3	133	UNBAN_USER	USER	132	{"email": "employer.test@vlu.edu.vn", "new_status": "ACTIVE"}	2026-11-04 10:33:55.96449
4	133	BAN_USER	USER	134	{"email": "le.quang.tuan@vlu.edu.vn", "new_status": "BANNED"}	2026-11-06 07:29:51.078672
5	133	UNBAN_USER	USER	134	{"email": "le.quang.tuan@vlu.edu.vn", "new_status": "ACTIVE"}	2026-11-06 07:29:57.08802
6	133	BAN_USER	USER	132	{"email": "employer.test@vlu.edu.vn", "new_status": "BANNED"}	2026-11-06 07:39:06.395588
7	133	UNBAN_USER	USER	132	{"email": "employer.test@vlu.edu.vn", "new_status": "ACTIVE"}	2026-11-06 07:40:10.771412
8	133	APPROVE_JOB	JOB	229	{"title": "Nhân viên Phục vụ ca sáng", "reason": null, "moderation_status": "APPROVED"}	2026-11-06 07:48:12.453229
9	133	REJECT_JOB	JOB	230	{"title": "Cộng tác viên Tuyển sinh", "reason": "ko hợp lý", "moderation_status": "REJECTED"}	2026-11-06 07:48:21.84537
10	133	BAN_USER	USER	138	{"email": "mai@gmail.com", "new_status": "BANNED"}	2026-11-06 07:49:16.96604
\.


--
-- Data for Name: application_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_histories (id, application_id, from_status, to_status, changed_by, note, created_at) FROM stdin;
1	1278	PENDING	REJECTED	132	Cập nhật trạng thái từ PENDING sang REJECTED	2026-11-04 05:05:51.709965
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, job_id, student_id, cover_letter, cv_url, status, applied_at, updated_at) FROM stdin;
1001	108	108	Kính gửi Quý công ty Tập đoàn Hoàn Cầu 11, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Huu_Anh_VLU.pdf	REJECTED	2026-10-30 02:08:03+00	2026-11-02 06:07:03+00
1002	151	84	Kính gửi Quý công ty Tập đoàn Phát Đạt 19, em là Lê Hồng Thảo, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) và có thể sắp xếp thời gian ca chiều (13h-17h). Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hong_Thao_VLU.pdf	PENDING	2026-08-14 07:32:10+00	\N
1003	169	98	Kính gửi Quý công ty Hộ kinh doanh Tương Lai 10, em xin ứng tuyển vị trí Nhân viên Bếp part-time. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Hoang_Binh_VLU.pdf	PENDING	2026-09-06 09:28:49+00	\N
1004	163	57	Kính gửi anh/chị Yến, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Thanh_Linh_VLU.pdf	ACCEPTED	2026-09-29 01:33:46+00	2026-09-30 03:38:46+00
1005	185	57	Kính gửi anh/chị Trâm, em là Vũ Thanh Linh, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tuyển sinh và có thể sắp xếp thời gian linh hoạt theo lịch học. Tình nguyện viên dạy kèm cuối tuần tại trung tâm cộng đồng. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Thanh_Linh_VLU.pdf	PENDING	2026-10-29 03:49:41+00	\N
1006	140	65	Kính gửi anh/chị Vy, em là Lý Xuân Yến, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Soạn hàng ca đêm và có thể sắp xếp thời gian ca tối (18h-22h). Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ly_Xuan_Yen_VLU.pdf	PENDING	2026-09-09 03:26:18+00	\N
1007	220	119	Kính gửi anh/chị Tâm, em là Trần Xuân Đạt, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Phục vụ ca sáng và có thể sắp xếp thời gian ca sáng (8h-12h). Phục vụ bàn thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Xuan_Dat_VLU.pdf	REJECTED	2026-10-02 04:54:04+00	2026-10-06 07:16:04+00
1008	159	63	Kính gửi anh/chị Tuấn, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Huu_Son_VLU.pdf	REJECTED	2026-08-26 05:18:10+00	2026-08-28 10:33:10+00
1009	209	102	Kính gửi anh/chị Phúc, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Hong_Tuan_VLU.pdf	REJECTED	2026-10-15 03:23:20+00	2026-10-17 08:10:20+00
1010	188	121	Kính gửi Quý công ty Công ty Cổ phần Giao Hàng Nhanh 18, em là Hoàng Hoàng Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian linh hoạt theo lịch học. Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Hoang_Hoang_Nhi_VLU.pdf	REJECTED	2026-10-30 09:56:42+00	2026-11-02 01:38:32+00
1011	153	87	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 42, em là Vũ Thanh Dung, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian ca chiều (13h-17h). Phân loại hàng hóa thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Thanh_Dung_VLU.pdf	PENDING	2026-09-24 09:29:39+00	\N
1012	122	99	Kính gửi anh/chị Cường, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Duc_Nam_VLU.pdf	PENDING	2026-10-18 08:47:41+00	\N
1013	119	73	Kính gửi anh/chị Hân, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Duong_Quang_Dat_VLU.pdf	PENDING	2026-08-19 02:38:03+00	\N
1014	139	56	Kính gửi anh/chị Tuấn, em là Phan Minh Đạt, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca chiều (13h-17h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Minh_Dat_VLU.pdf	PENDING	2026-09-07 05:49:40+00	\N
1015	198	83	Kính gửi Quý công ty Hệ thống Thành Công 28, em là Phan Ngọc Linh, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian linh hoạt theo lịch học. Từng kiểm thử thủ công cho đồ án nhóm trong học phần Kiểm thử phần mềm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Ngoc_Linh_VLU.pdf	REJECTED	2026-10-30 10:32:45+00	2026-11-01 16:58:45+00
1016	159	85	Kính gửi Quý công ty Hộ kinh doanh Đại Dương 50, em là Nguyễn Hữu Cường, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca sáng (8h-12h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Huu_Cuong_VLU.pdf	ACCEPTED	2026-08-28 07:41:08+00	2026-09-01 13:57:08+00
1017	159	70	Kính gửi anh/chị Tuấn, em là Đỗ Bảo Tuấn, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca sáng (8h-12h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Bao_Tuan_VLU.pdf	PENDING	2026-09-06 09:10:57+00	\N
1018	145	106	Kính gửi Quý công ty Hệ thống Foody 44, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Tuan_Vy_VLU.pdf	PENDING	2026-10-24 02:58:02+00	\N
1019	193	96	Kính gửi Quý công ty Công ty TNHH Hoàn Cầu 41, em là Dương Hữu Giang, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca sáng (8h-12h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Duong_Huu_Giang_VLU.pdf	ACCEPTED	2026-08-09 13:24:41+00	2026-08-13 21:04:41+00
1020	150	114	Kính gửi Quý công ty Công ty TNHH Giao Hàng Nhanh 39, em là Hồ Quang Bình, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Đóng gói sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Làm thêm kỹ thuật viên sửa xe máy cuối tuần (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Quang_Binh_VLU.pdf	PENDING	2026-08-26 02:43:37+00	\N
1021	201	117	Kính gửi anh/chị Thảo, em là Võ Tuấn Yến, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Tuan_Yen_VLU.pdf	ACCEPTED	2026-08-22 10:34:00+00	2026-08-23 12:27:00+00
1022	121	56	Kính gửi Quý công ty Hộ kinh doanh Phát Đạt 46, em là Phan Minh Đạt, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian linh hoạt theo lịch học. Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Minh_Dat_VLU.pdf	REJECTED	2026-10-17 08:24:24+00	2026-10-21 12:16:24+00
1023	102	69	Kính gửi Quý công ty Công ty TNHH Đại Dương 40, em xin ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Quang_Tam_VLU.pdf	PENDING	2026-10-14 04:37:34+00	\N
1024	170	98	Kính gửi Quý công ty Tập đoàn Phát Đạt 47, em là Võ Hoàng Bình, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Hoang_Binh_VLU.pdf	PENDING	2026-10-12 11:07:47+00	\N
1025	137	118	Kính gửi Quý công ty Công ty TNHH Đại Dương 40, em xin ứng tuyển vị trí Trợ lý kỹ thuật part-time. Em là sinh viên ngành Kỹ thuật điện - điện tử, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Dinh_Thao_VLU.pdf	ACCEPTED	2026-09-29 00:26:45+00	2026-09-30 04:22:45+00
1026	197	61	Kính gửi anh/chị Oanh, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Kỹ thuật phần mềm, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Le_Hoang_Hoa_VLU.pdf	ACCEPTED	2026-09-09 02:59:15+00	2026-09-11 04:33:15+00
1027	209	108	Kính gửi anh/chị Phúc, em là Bùi Hữu Anh, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca chiều (13h-17h). Cộng tác viên bán hàng online 1 năm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Huu_Anh_VLU.pdf	REJECTED	2026-10-25 05:57:09+00	2026-10-26 14:25:09+00
1028	116	104	Kính gửi anh/chị Vy, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Dang_Quang_Khoa_VLU.pdf	REJECTED	2026-09-12 00:38:14+00	2026-09-15 05:07:14+00
1029	155	54	Kính gửi Quý công ty Công ty TNHH TechNova 4, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Thu_Nam_VLU.pdf	PENDING	2026-10-11 07:45:40+00	\N
1030	103	122	Kính gửi anh/chị Khánh, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Hoang_Hai_VLU.pdf	ACCEPTED	2026-09-17 01:58:29+00	2026-09-21 04:00:29+00
1031	131	109	Kính gửi anh/chị Tâm, em là Ngô Văn Hương, sinh viên ngành Công nghệ kỹ thuật ô tô, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhập liệu sản xuất part-time và có thể sắp xếp thời gian ca tối (18h-22h). Làm thêm kỹ thuật viên sửa xe máy cuối tuần (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ngo_Van_Huong_VLU.pdf	PENDING	2026-09-29 00:25:58+00	\N
1032	133	63	Kính gửi anh/chị Anh, em xin ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Huu_Son_VLU.pdf	REJECTED	2026-08-30 08:28:17+00	2026-09-01 09:38:17+00
1033	218	98	Kính gửi anh/chị Tuấn, em là Võ Hoàng Bình, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca tối (18h-22h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Hoang_Binh_VLU.pdf	ACCEPTED	2026-09-03 00:33:15+00	2026-09-05 05:12:15+00
1034	126	87	Kính gửi Quý công ty Công ty TNHH Thành Công 43, em là Vũ Thanh Dung, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Thanh_Dung_VLU.pdf	REJECTED	2026-10-26 10:28:21+00	2026-10-31 17:22:21+00
1035	138	76	Kính gửi Quý công ty Tập đoàn Hoàn Cầu 11, em là Trần Ngọc Trâm, sinh viên ngành Thương mại điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian ca sáng (8h-12h). Làm thêm 6 tháng tại cửa hàng tiện lợi (thu ngân, sắp xếp hàng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Ngoc_Tram_VLU.pdf	PENDING	2026-10-12 07:51:49+00	\N
1036	115	89	Kính gửi Quý công ty Công ty TNHH Thành Công 43, em là Lê Hồng Vy, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hong_Vy_VLU.pdf	REJECTED	2026-09-12 13:46:49+00	2026-09-16 21:53:49+00
1037	119	99	Kính gửi anh/chị Hân, em là Bùi Đức Nam, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Duc_Nam_VLU.pdf	ACCEPTED	2026-08-02 04:22:39+00	2026-08-06 12:17:39+00
1038	130	71	Kính gửi Quý công ty Hệ thống Foody 44, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Công nghệ thông tin, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Pham_Hoang_Binh_VLU.pdf	ACCEPTED	2026-09-15 05:13:11+00	2026-09-16 09:32:11+00
1039	147	87	Kính gửi anh/chị Tuấn, em xin ứng tuyển vị trí Giao hàng (Shipper) đồ ăn. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Thanh_Dung_VLU.pdf	PENDING	2026-10-22 12:58:47+00	\N
1040	157	91	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 42, em là Đặng Đức Hương, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Kiểm kho part-time và có thể sắp xếp thời gian ca tối (18h-22h). Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Dang_Duc_Huong_VLU.pdf	ACCEPTED	2026-09-14 14:41:03+00	2026-09-17 21:26:03+00
1041	167	104	Kính gửi anh/chị Cường, em là Đặng Quang Khoa, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca chiều (13h-17h). Làm thêm 6 tháng tại cửa hàng tiện lợi (thu ngân, sắp xếp hàng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Dang_Quang_Khoa_VLU.pdf	ACCEPTED	2026-08-30 04:11:56+00	2026-09-01 10:07:56+00
1042	201	110	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em là Lý Thị Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ly_Thi_Nhi_VLU.pdf	ACCEPTED	2026-08-24 11:02:54+00	2026-08-28 17:45:54+00
1043	151	104	Kính gửi Quý công ty Tập đoàn Phát Đạt 19, em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS). Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Dang_Quang_Khoa_VLU.pdf	PENDING	2026-08-04 05:05:53+00	\N
1044	208	75	Kính gửi Quý công ty Công ty TNHH Việt Tín 8, em là Trần Thu Hòa, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian linh hoạt theo lịch học. Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Thu_Hoa_VLU.pdf	REJECTED	2026-09-09 13:53:58+00	2026-09-10 18:29:58+00
1045	132	102	Kính gửi anh/chị Tuấn, em là Vũ Hồng Tuấn, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian ca tối (18h-22h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Hong_Tuan_VLU.pdf	PENDING	2026-09-12 04:35:55+00	\N
1046	159	69	Kính gửi Quý công ty Hộ kinh doanh Đại Dương 50, em là Võ Quang Tâm, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Quang_Tam_VLU.pdf	ACCEPTED	2026-09-03 11:48:16+00	2026-09-07 18:56:16+00
1047	118	64	Kính gửi anh/chị Vy, em xin ứng tuyển vị trí Kiểm kho part-time. Em là sinh viên ngành Logistics và Quản lý chuỗi cung ứng, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Dinh_Anh_VLU.pdf	REJECTED	2026-10-25 00:04:43+00	2026-10-28 05:48:43+00
1048	220	69	Kính gửi Quý công ty Hệ thống Việt Tín 9, em xin ứng tuyển vị trí Nhân viên Phục vụ ca sáng. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Quang_Tam_VLU.pdf	ACCEPTED	2026-09-24 07:00:44+00	2026-09-25 08:33:44+00
1049	122	101	Kính gửi anh/chị Cường, em là Vũ Minh Trâm, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk và có thể sắp xếp thời gian ca tối (18h-22h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Minh_Tram_VLU.pdf	PENDING	2026-10-15 12:24:09+00	\N
1050	140	113	Kính gửi anh/chị Vy, em xin ứng tuyển vị trí Nhân viên Soạn hàng ca đêm. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Le_Ngoc_Hai_VLU.pdf	REJECTED	2026-09-15 11:34:26+00	2026-09-19 18:17:26+00
1051	191	99	Kính gửi anh/chị Tâm, em là Bùi Đức Nam, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales khóa học và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Duc_Nam_VLU.pdf	ACCEPTED	2026-09-20 06:40:16+00	2026-09-21 13:58:16+00
1052	106	77	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ly_Xuan_Khanh_VLU.pdf	ACCEPTED	2026-08-16 08:01:41+00	2026-08-20 11:22:41+00
1053	181	121	Kính gửi Quý công ty Công ty Cổ phần Đại Dương 5, em là Hoàng Hoàng Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Hoang_Hoang_Nhi_VLU.pdf	ACCEPTED	2026-08-31 06:47:00+00	2026-09-02 12:07:00+00
1054	113	113	Kính gửi anh/chị Hùng, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Le_Ngoc_Hai_VLU.pdf	ACCEPTED	2026-08-06 12:49:05+00	2026-08-08 20:21:05+00
1055	205	80	Kính gửi Quý công ty Hệ thống Thành Công 28, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Kỹ thuật phần mềm, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Huynh_Dinh_Tuan_VLU.pdf	PENDING	2026-09-13 07:25:28+00	\N
1056	158	116	Kính gửi Quý công ty Tập đoàn Giao Hàng Nhanh 16, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Dinh_Giang_VLU.pdf	REJECTED	2026-10-03 02:58:10+00	2026-10-06 06:30:10+00
1057	112	56	Kính gửi Quý công ty Công ty TNHH TechNova 32, em là Phan Minh Đạt, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian ca tối (18h-22h). Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Minh_Dat_VLU.pdf	ACCEPTED	2026-08-29 04:34:23+00	2026-08-31 11:26:23+00
1058	154	118	Kính gửi anh/chị Vy, em là Vũ Đình Thảo, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Data Entry part-time và có thể sắp xếp thời gian ca sáng (8h-12h). Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Dinh_Thao_VLU.pdf	REJECTED	2026-10-31 08:12:02+00	2026-11-02 04:50:07+00
1059	101	93	Kính gửi Quý công ty Tập đoàn Phát Đạt 19, em là Hồ Ngọc Nhi, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) và có thể sắp xếp thời gian ca tối (18h-22h). Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Ngoc_Nhi_VLU.pdf	REJECTED	2026-09-26 05:55:07+00	2026-09-29 10:07:07+00
1060	107	92	Kính gửi anh/chị Tuấn, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Do_Quang_Anh_VLU.pdf	ACCEPTED	2026-09-21 00:27:46+00	2026-09-24 05:43:46+00
1061	124	92	Kính gửi Quý công ty Công ty TNHH TechNova 32, em xin ứng tuyển vị trí Phân loại hàng hóa. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Do_Quang_Anh_VLU.pdf	REJECTED	2026-09-09 12:55:05+00	2026-09-13 19:19:05+00
1062	120	63	Kính gửi anh/chị Tuấn, em là Nguyễn Hữu Sơn, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Bếp part-time và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Huu_Son_VLU.pdf	ACCEPTED	2026-09-02 00:13:54+00	2026-09-04 06:05:54+00
1063	153	115	Kính gửi anh/chị Cường, em là Huỳnh Thị Oanh, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian ca chiều (13h-17h). Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Huynh_Thi_Oanh_VLU.pdf	ACCEPTED	2026-09-27 13:23:24+00	2026-09-29 18:37:24+00
1064	110	71	Kính gửi Quý công ty Công ty TNHH Foody 17, em là Phạm Hoàng Bình, sinh viên ngành Công nghệ thông tin, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Data Entry part-time và có thể sắp xếp thời gian ca chiều (13h-17h). Từng kiểm thử thủ công cho đồ án nhóm trong học phần Kiểm thử phần mềm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Pham_Hoang_Binh_VLU.pdf	REJECTED	2026-10-26 07:54:00+00	2026-10-30 16:15:00+00
1065	114	116	Kính gửi Quý công ty Công ty TNHH Sáng Tạo Mới 51, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Dinh_Giang_VLU.pdf	ACCEPTED	2026-09-26 09:53:21+00	2026-09-28 17:36:21+00
1066	144	121	Kính gửi Quý công ty Công ty TNHH Việt Tín 38, em là Hoàng Hoàng Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian ca sáng (8h-12h). Phân loại hàng hóa thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Hoang_Hoang_Nhi_VLU.pdf	REJECTED	2026-10-29 10:04:00+00	2026-11-01 18:44:00+00
1067	216	62	Kính gửi anh/chị Trâm, em là Nguyễn Bảo Quân, sinh viên ngành Quản trị nhà hàng - khách sạn, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Bếp part-time và có thể sắp xếp thời gian ca tối (18h-22h). Phục vụ bàn thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Bao_Quan_VLU.pdf	REJECTED	2026-09-18 04:53:08+00	2026-09-20 09:22:08+00
1068	127	118	Kính gửi Quý công ty Hệ thống Việt Tín 9, em là Vũ Đình Thảo, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Pha chế (Barista) ca tối và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Dinh_Thao_VLU.pdf	REJECTED	2026-10-28 09:16:11+00	2026-10-29 13:54:11+00
1069	185	96	Kính gửi anh/chị Trâm, em xin ứng tuyển vị trí Cộng tác viên Tuyển sinh. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Duong_Huu_Giang_VLU.pdf	REJECTED	2026-10-15 11:04:34+00	2026-10-20 12:57:34+00
1070	201	83	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Ngoc_Linh_VLU.pdf	PENDING	2026-08-24 01:59:13+00	\N
1071	151	100	Kính gửi anh/chị Nam, em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS). Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ho_Ngoc_Thanh_VLU.pdf	ACCEPTED	2026-08-06 13:49:51+00	2026-08-08 16:02:51+00
1072	138	90	Kính gửi anh/chị Yến, em là Nguyễn Tuấn Hương, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian ca sáng (8h-12h). Làm thêm 6 tháng tại cửa hàng tiện lợi (thu ngân, sắp xếp hàng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Tuan_Huong_VLU.pdf	ACCEPTED	2026-10-06 01:38:48+00	2026-10-10 06:27:48+00
1073	194	97	Kính gửi anh/chị Thảo, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Do_Tuan_Thao_VLU.pdf	PENDING	2026-08-17 05:51:44+00	\N
1074	127	69	Kính gửi anh/chị Tâm, em xin ứng tuyển vị trí Pha chế (Barista) ca tối. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Quang_Tam_VLU.pdf	REJECTED	2026-10-17 12:37:49+00	2026-10-18 14:21:49+00
1075	105	80	Kính gửi Quý công ty Hệ thống Thành Công 28, em là Huỳnh Đình Tuấn, sinh viên ngành Kỹ thuật phần mềm, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian ca tối (18h-22h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Huynh_Dinh_Tuan_VLU.pdf	REJECTED	2026-09-26 06:19:09+00	2026-09-28 11:37:09+00
1076	215	88	Kính gửi anh/chị Trâm, em là Võ Thanh Trâm, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Thanh_Tram_VLU.pdf	PENDING	2026-10-06 13:49:32+00	\N
1077	151	55	Kính gửi Quý công ty Tập đoàn Phát Đạt 19, em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS). Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Tuan_Oanh_VLU.pdf	REJECTED	2026-08-07 05:05:04+00	2026-08-10 13:55:04+00
1078	214	99	Kính gửi anh/chị Minh, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Duc_Nam_VLU.pdf	ACCEPTED	2026-09-11 06:05:02+00	2026-09-15 13:02:02+00
1079	102	60	Kính gửi anh/chị Tâm, em xin ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Pham_Ngoc_Minh_VLU.pdf	ACCEPTED	2026-09-24 01:22:15+00	2026-09-28 03:40:15+00
1080	146	101	Kính gửi anh/chị Anh, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Minh_Tram_VLU.pdf	PENDING	2026-08-23 12:41:08+00	\N
1081	104	109	Kính gửi Quý công ty Công ty TNHH Việt Tín 38, em là Ngô Văn Hương, sinh viên ngành Công nghệ kỹ thuật ô tô, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Kiểm kho part-time và có thể sắp xếp thời gian ca sáng (8h-12h). Phân loại hàng hóa thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ngo_Van_Huong_VLU.pdf	PENDING	2026-09-25 02:06:45+00	\N
1082	197	74	Kính gửi Quý công ty Công ty Cổ phần Thành Công 13, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Thương mại điện tử, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Thanh_Giang_VLU.pdf	PENDING	2026-09-24 10:21:26+00	\N
1083	196	112	Kính gửi anh/chị Tuấn, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Pham_Duc_Hoa_VLU.pdf	REJECTED	2026-10-31 13:28:42+00	2026-11-01 22:55:52+00
1084	110	61	Kính gửi Quý công ty Công ty TNHH Foody 17, em là Lê Hoàng Hòa, sinh viên ngành Kỹ thuật phần mềm, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Data Entry part-time và có thể sắp xếp thời gian ca chiều (13h-17h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hoang_Hoa_VLU.pdf	REJECTED	2026-10-27 02:44:32+00	2026-11-01 08:02:32+00
1085	188	93	Kính gửi anh/chị Hùng, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ho_Ngoc_Nhi_VLU.pdf	PENDING	2026-10-27 08:36:01+00	\N
1086	162	53	Kính gửi Quý công ty Công ty Cổ phần Foody 26, em xin ứng tuyển vị trí Hỗ trợ tổ chức lớp học & sự kiện. Em là sinh viên ngành Công nghệ thông tin, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Duong_Huu_Anh_VLU.pdf	ACCEPTED	2026-09-02 14:37:46+00	2026-09-03 19:56:46+00
1105	169	87	Kính gửi anh/chị Trang, em xin ứng tuyển vị trí Nhân viên Bếp part-time. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Thanh_Dung_VLU.pdf	ACCEPTED	2026-08-26 00:16:25+00	2026-08-28 03:53:25+00
1087	199	56	Kính gửi anh/chị Cường, em là Phan Minh Đạt, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Soạn hàng ca đêm và có thể sắp xếp thời gian ca tối (18h-22h). Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Minh_Dat_VLU.pdf	REJECTED	2026-10-28 08:03:56+00	2026-10-29 12:15:56+00
1088	143	105	Kính gửi Quý công ty Hệ thống TechNova 37, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Thương mại điện tử, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Bao_Binh_VLU.pdf	REJECTED	2026-10-30 04:45:49+00	2026-11-01 08:18:49+00
1089	133	108	Kính gửi anh/chị Anh, em xin ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time. Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Huu_Anh_VLU.pdf	ACCEPTED	2026-08-13 11:46:29+00	2026-08-14 12:52:29+00
1090	113	121	Kính gửi Quý công ty Công ty Cổ phần Giao Hàng Nhanh 18, em là Hoàng Hoàng Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Hoang_Hoang_Nhi_VLU.pdf	PENDING	2026-08-09 02:06:16+00	\N
1091	105	61	Kính gửi anh/chị Bình, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Kỹ thuật phần mềm, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Le_Hoang_Hoa_VLU.pdf	ACCEPTED	2026-09-15 04:46:32+00	2026-09-18 07:32:32+00
1092	168	70	Kính gửi Quý công ty Công ty Cổ phần Sáng Tạo Mới 34, em là Đỗ Bảo Tuấn, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Data Entry part-time và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Bao_Tuan_VLU.pdf	PENDING	2026-10-26 07:59:46+00	\N
1093	164	94	Kính gửi anh/chị Trang, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Kỹ thuật phần mềm, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Le_Hoang_Dat_VLU.pdf	REJECTED	2026-10-21 12:43:29+00	2026-10-24 17:43:29+00
1094	128	63	Kính gửi Quý công ty Hệ thống Thành Công 28, em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS). Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Huu_Son_VLU.pdf	PENDING	2026-10-17 09:55:57+00	\N
1095	124	59	Kính gửi Quý công ty Công ty TNHH TechNova 32, em xin ứng tuyển vị trí Phân loại hàng hóa. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Tran_Hong_Anh_VLU.pdf	PENDING	2026-09-10 13:15:57+00	\N
1096	182	122	Kính gửi anh/chị Thảo, em là Bùi Hoàng Hải, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca chiều (13h-17h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Hoang_Hai_VLU.pdf	ACCEPTED	2026-09-15 02:27:52+00	2026-09-17 04:34:52+00
1097	139	97	Kính gửi Quý công ty Công ty Cổ phần Hoàn Cầu 45, em là Đỗ Tuấn Thảo, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca chiều (13h-17h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Tuan_Thao_VLU.pdf	ACCEPTED	2026-09-08 02:00:43+00	2026-09-12 08:23:43+00
1098	133	54	Kính gửi Quý công ty Tập đoàn Sáng Tạo Mới 6, em là Vũ Thu Nam, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time và có thể sắp xếp thời gian linh hoạt theo lịch học. Thực hành xưởng cơ khí theo chương trình học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Thu_Nam_VLU.pdf	ACCEPTED	2026-08-19 00:09:22+00	2026-08-21 05:04:22+00
1099	180	64	Kính gửi anh/chị Đức, em là Phan Đình Anh, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) và có thể sắp xếp thời gian ca tối (18h-22h). Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Dinh_Anh_VLU.pdf	REJECTED	2026-10-27 00:42:23+00	2026-11-01 09:27:23+00
1100	139	90	Kính gửi Quý công ty Công ty Cổ phần Hoàn Cầu 45, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Tuan_Huong_VLU.pdf	REJECTED	2026-09-07 03:51:51+00	2026-09-10 07:07:51+00
1101	194	61	Kính gửi anh/chị Thảo, em là Lê Hoàng Hòa, sinh viên ngành Kỹ thuật phần mềm, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hoang_Hoa_VLU.pdf	ACCEPTED	2026-08-12 08:02:49+00	2026-08-16 12:11:49+00
1102	125	73	Kính gửi Quý công ty Công ty Cổ phần Sáng Tạo Mới 34, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Duong_Quang_Dat_VLU.pdf	PENDING	2026-10-18 10:02:43+00	\N
1103	156	58	Kính gửi Quý công ty Công ty Cổ phần Sáng Tạo Mới 34, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Huynh_Dinh_Cuong_VLU.pdf	REJECTED	2026-10-29 04:09:38+00	2026-10-30 07:48:38+00
1104	119	100	Kính gửi anh/chị Hân, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ho_Ngoc_Thanh_VLU.pdf	PENDING	2026-08-22 07:21:55+00	\N
1106	136	105	Kính gửi Quý công ty Công ty Cổ phần Việt Tín 23, em là Vũ Bảo Bình, sinh viên ngành Thương mại điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Trợ giảng cuối tuần và có thể sắp xếp thời gian linh hoạt theo lịch học. Tình nguyện viên dạy kèm cuối tuần tại trung tâm cộng đồng. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Bao_Binh_VLU.pdf	ACCEPTED	2026-08-19 02:33:15+00	2026-08-23 05:14:15+00
1107	147	117	Kính gửi anh/chị Tuấn, em là Võ Tuấn Yến, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Giao hàng (Shipper) đồ ăn và có thể sắp xếp thời gian ca tối (18h-22h). Phục vụ bàn thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Tuan_Yen_VLU.pdf	PENDING	2026-10-27 11:57:44+00	\N
1108	197	119	Kính gửi anh/chị Oanh, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Tran_Xuan_Dat_VLU.pdf	PENDING	2026-09-18 08:38:00+00	\N
1109	139	120	Kính gửi anh/chị Tuấn, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Van_Binh_VLU.pdf	PENDING	2026-09-12 12:55:14+00	\N
1110	207	79	Kính gửi anh/chị Phong, em là Huỳnh Thị Dung, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca chiều (13h-17h). Cộng tác viên bán hàng online 1 năm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Huynh_Thi_Dung_VLU.pdf	REJECTED	2026-10-18 09:12:01+00	2026-10-19 17:05:01+00
1111	123	122	Kính gửi anh/chị Hân, em là Bùi Hoàng Hải, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian ca tối (18h-22h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Hoang_Hai_VLU.pdf	ACCEPTED	2026-09-02 10:37:39+00	2026-09-05 18:34:39+00
1112	215	66	Kính gửi Quý công ty Công ty TNHH Sáng Tạo Mới 51, em là Phạm Thị Giang, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Cộng tác viên bán hàng online 1 năm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Pham_Thi_Giang_VLU.pdf	REJECTED	2026-09-29 00:44:01+00	2026-09-30 05:53:01+00
1113	151	67	Kính gửi anh/chị Nam, em là Phạm Hoàng Hòa, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) và có thể sắp xếp thời gian ca chiều (13h-17h). Từng kiểm thử thủ công cho đồ án nhóm trong học phần Kiểm thử phần mềm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Pham_Hoang_Hoa_VLU.pdf	PENDING	2026-08-31 05:07:29+00	\N
1114	170	75	Kính gửi Quý công ty Tập đoàn Phát Đạt 47, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Logistics và Quản lý chuỗi cung ứng, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Tran_Thu_Hoa_VLU.pdf	PENDING	2026-10-22 12:03:19+00	\N
1115	193	72	Kính gửi Quý công ty Công ty TNHH Hoàn Cầu 41, em là Hồ Đức Cường, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Duc_Cuong_VLU.pdf	PENDING	2026-08-14 12:36:39+00	\N
1116	191	97	Kính gửi Quý công ty Công ty Cổ phần Foody 26, em là Đỗ Tuấn Thảo, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales khóa học và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Tuan_Thao_VLU.pdf	ACCEPTED	2026-09-17 02:34:03+00	2026-09-19 10:58:03+00
1117	128	82	Kính gửi anh/chị Bình, em là Đặng Thanh Đức, sinh viên ngành Công nghệ thông tin, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) và có thể sắp xếp thời gian ca sáng (8h-12h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Dang_Thanh_Duc_VLU.pdf	REJECTED	2026-10-26 07:46:05+00	2026-10-28 13:04:05+00
1118	118	92	Kính gửi Quý công ty Công ty TNHH Việt Tín 38, em là Đỗ Quang Anh, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Kiểm kho part-time và có thể sắp xếp thời gian ca tối (18h-22h). Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Quang_Anh_VLU.pdf	PENDING	2026-10-13 02:34:13+00	\N
1119	130	93	Kính gửi anh/chị Minh, em là Hồ Ngọc Nhi, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Ngoc_Nhi_VLU.pdf	PENDING	2026-09-17 07:10:21+00	\N
1120	178	106	Kính gửi anh/chị Cường, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Tuan_Vy_VLU.pdf	ACCEPTED	2026-09-29 03:29:06+00	2026-09-30 11:49:06+00
1121	205	71	Kính gửi Quý công ty Hệ thống Thành Công 28, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Công nghệ thông tin, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Pham_Hoang_Binh_VLU.pdf	ACCEPTED	2026-09-11 13:15:36+00	2026-09-12 17:12:36+00
1122	128	75	Kính gửi anh/chị Bình, em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS). Em là sinh viên ngành Logistics và Quản lý chuỗi cung ứng, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Tran_Thu_Hoa_VLU.pdf	REJECTED	2026-10-23 02:55:12+00	2026-10-24 08:17:12+00
1123	158	54	Kính gửi Quý công ty Tập đoàn Giao Hàng Nhanh 16, em là Vũ Thu Nam, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian ca sáng (8h-12h). Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Thu_Nam_VLU.pdf	PENDING	2026-10-07 10:12:33+00	\N
1124	210	84	Kính gửi anh/chị Cường, em là Lê Hồng Thảo, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Đóng gói bưu phẩm và có thể sắp xếp thời gian linh hoạt theo lịch học. Phân loại hàng hóa thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hong_Thao_VLU.pdf	PENDING	2026-10-29 05:47:20+00	\N
1125	181	109	Kính gửi Quý công ty Công ty Cổ phần Đại Dương 5, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Công nghệ kỹ thuật ô tô, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ngo_Van_Huong_VLU.pdf	ACCEPTED	2026-09-01 08:57:14+00	2026-09-02 16:55:14+00
1126	165	107	Kính gửi anh/chị Trang, em xin ứng tuyển vị trí Pha chế (Barista) ca tối. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Tran_Thi_Yen_VLU.pdf	PENDING	2026-10-21 01:17:47+00	\N
1127	155	108	Kính gửi anh/chị Trang, em là Bùi Hữu Anh, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk và có thể sắp xếp thời gian linh hoạt theo lịch học. Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Huu_Anh_VLU.pdf	ACCEPTED	2026-10-08 05:39:45+00	2026-10-12 09:19:45+00
1128	122	117	Kính gửi anh/chị Cường, em là Võ Tuấn Yến, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk và có thể sắp xếp thời gian ca tối (18h-22h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Tuan_Yen_VLU.pdf	REJECTED	2026-10-12 07:14:25+00	2026-10-15 13:56:25+00
1129	152	70	Kính gửi Quý công ty Tập đoàn Sáng Tạo Mới 6, em là Đỗ Bảo Tuấn, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Đóng gói sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Làm thêm kỹ thuật viên sửa xe máy cuối tuần (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Bao_Tuan_VLU.pdf	PENDING	2026-10-08 06:01:28+00	\N
1130	132	107	Kính gửi anh/chị Tuấn, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Tran_Thi_Yen_VLU.pdf	ACCEPTED	2026-09-01 10:55:26+00	2026-09-05 12:22:26+00
1131	144	63	Kính gửi Quý công ty Công ty TNHH Việt Tín 38, em là Nguyễn Hữu Sơn, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Huu_Son_VLU.pdf	REJECTED	2026-10-30 01:07:46+00	2026-11-01 04:40:54+00
1132	185	82	Kính gửi anh/chị Trâm, em xin ứng tuyển vị trí Cộng tác viên Tuyển sinh. Em là sinh viên ngành Công nghệ thông tin, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Dang_Thanh_Duc_VLU.pdf	PENDING	2026-10-31 04:32:07+00	\N
1133	194	60	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Pham_Ngoc_Minh_VLU.pdf	REJECTED	2026-08-30 01:44:34+00	2026-08-31 05:42:34+00
1134	140	107	Kính gửi anh/chị Vy, em là Trần Thị Yến, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Soạn hàng ca đêm và có thể sắp xếp thời gian ca tối (18h-22h). Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Thi_Yen_VLU.pdf	ACCEPTED	2026-09-09 00:02:24+00	2026-09-11 06:41:24+00
1135	117	56	Kính gửi anh/chị Hải, em là Phan Minh Đạt, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tuyển sinh và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Minh_Dat_VLU.pdf	ACCEPTED	2026-08-30 02:06:38+00	2026-09-01 03:09:38+00
1136	195	113	Kính gửi anh/chị Cường, em là Lê Ngọc Hải, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Ngoc_Hai_VLU.pdf	REJECTED	2026-08-28 07:32:18+00	2026-08-31 14:32:18+00
1137	211	111	Kính gửi Quý công ty Công ty Cổ phần Việt Tín 23, em xin ứng tuyển vị trí Trợ giảng cuối tuần. Em là sinh viên ngành Ngôn ngữ Anh, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Huu_Hoa_VLU.pdf	ACCEPTED	2026-09-03 11:03:37+00	2026-09-06 12:14:37+00
1138	114	118	Kính gửi anh/chị Trâm, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Kỹ thuật điện - điện tử, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Dinh_Thao_VLU.pdf	REJECTED	2026-09-19 09:55:37+00	2026-09-21 14:33:37+00
1139	218	120	Kính gửi Quý công ty Hộ kinh doanh Đại Dương 50, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Van_Binh_VLU.pdf	REJECTED	2026-08-29 12:46:07+00	2026-08-30 16:10:07+00
1140	121	72	Kính gửi anh/chị Hân, em là Hồ Đức Cường, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Duc_Cuong_VLU.pdf	PENDING	2026-10-04 06:38:39+00	\N
1141	132	92	Kính gửi anh/chị Tuấn, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Do_Quang_Anh_VLU.pdf	REJECTED	2026-08-28 02:24:50+00	2026-09-02 09:41:50+00
1142	130	101	Kính gửi Quý công ty Hệ thống Foody 44, em là Vũ Minh Trâm, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Minh_Tram_VLU.pdf	REJECTED	2026-09-10 10:42:46+00	2026-09-14 11:42:46+00
1143	184	107	Kính gửi anh/chị Anh, em là Trần Thị Yến, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhập liệu sản xuất part-time và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Thi_Yen_VLU.pdf	REJECTED	2026-10-31 13:50:26+00	2026-11-01 08:22:32+00
1144	135	115	Kính gửi anh/chị Trâm, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Logistics và Quản lý chuỗi cung ứng, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Huynh_Thi_Oanh_VLU.pdf	PENDING	2026-10-28 10:31:08+00	\N
1145	169	113	Kính gửi anh/chị Trang, em là Lê Ngọc Hải, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Bếp part-time và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Ngoc_Hai_VLU.pdf	REJECTED	2026-09-09 11:09:09+00	2026-09-12 17:26:09+00
1146	198	63	Kính gửi anh/chị Bình, em là Nguyễn Hữu Sơn, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian linh hoạt theo lịch học. Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Huu_Son_VLU.pdf	REJECTED	2026-10-30 08:38:24+00	2026-11-02 01:07:45+00
1147	117	109	Kính gửi Quý công ty Công ty TNHH Sáng Tạo Mới 31, em là Ngô Văn Hương, sinh viên ngành Công nghệ kỹ thuật ô tô, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tuyển sinh và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ngo_Van_Huong_VLU.pdf	PENDING	2026-08-26 01:05:11+00	\N
1148	101	108	Kính gửi anh/chị Nam, em là Bùi Hữu Anh, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) và có thể sắp xếp thời gian ca tối (18h-22h). Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Huu_Anh_VLU.pdf	ACCEPTED	2026-09-24 11:15:26+00	2026-09-25 16:15:26+00
1149	206	61	Kính gửi anh/chị Trang, em xin ứng tuyển vị trí Data Entry part-time. Em là sinh viên ngành Kỹ thuật phần mềm, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Le_Hoang_Hoa_VLU.pdf	REJECTED	2026-10-24 13:29:36+00	2026-10-28 20:39:36+00
1150	142	94	Kính gửi anh/chị Trang, em là Lê Hoàng Đạt, sinh viên ngành Kỹ thuật phần mềm, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian linh hoạt theo lịch học. Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hoang_Dat_VLU.pdf	PENDING	2026-10-27 14:59:37+00	\N
1151	198	120	Kính gửi Quý công ty Hệ thống Thành Công 28, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Marketing, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Van_Binh_VLU.pdf	REJECTED	2026-10-28 11:50:10+00	2026-10-29 19:05:10+00
1152	179	61	Kính gửi anh/chị Tâm, em là Lê Hoàng Hòa, sinh viên ngành Kỹ thuật phần mềm, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Đóng gói sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hoang_Hoa_VLU.pdf	PENDING	2026-10-04 11:34:53+00	\N
1153	185	83	Kính gửi anh/chị Trâm, em là Phan Ngọc Linh, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tuyển sinh và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Ngoc_Linh_VLU.pdf	REJECTED	2026-10-17 03:44:39+00	2026-10-18 05:21:39+00
1154	130	92	Kính gửi anh/chị Minh, em là Đỗ Quang Anh, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Quang_Anh_VLU.pdf	REJECTED	2026-09-18 05:44:53+00	2026-09-22 12:09:53+00
1155	134	118	Kính gửi Quý công ty Công ty TNHH Đại Dương 40, em là Vũ Đình Thảo, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Trợ lý kỹ thuật part-time và có thể sắp xếp thời gian ca chiều (13h-17h). Thực hành xưởng cơ khí theo chương trình học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Dinh_Thao_VLU.pdf	REJECTED	2026-10-31 08:24:52+00	2026-11-01 15:09:52+00
1156	189	96	Kính gửi Quý công ty Công ty TNHH Hoàn Cầu 3, em là Dương Hữu Giang, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Duong_Huu_Giang_VLU.pdf	PENDING	2026-10-07 08:14:46+00	\N
1157	104	89	Kính gửi anh/chị Vy, em là Lê Hồng Vy, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Kiểm kho part-time và có thể sắp xếp thời gian ca sáng (8h-12h). Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hong_Vy_VLU.pdf	ACCEPTED	2026-09-25 14:18:42+00	2026-09-26 20:23:42+00
1158	124	113	Kính gửi anh/chị Trang, em là Lê Ngọc Hải, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian ca tối (18h-22h). Phân loại hàng hóa thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Ngoc_Hai_VLU.pdf	ACCEPTED	2026-09-04 11:58:26+00	2026-09-06 16:43:26+00
1159	195	114	Kính gửi anh/chị Cường, em là Hồ Quang Bình, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Cộng tác viên bán hàng online 1 năm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Quang_Binh_VLU.pdf	REJECTED	2026-08-23 03:47:18+00	2026-08-26 09:04:18+00
1160	105	93	Kính gửi anh/chị Bình, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ho_Ngoc_Nhi_VLU.pdf	PENDING	2026-10-02 11:08:10+00	\N
1161	163	105	Kính gửi anh/chị Yến, em là Vũ Bảo Bình, sinh viên ngành Thương mại điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca tối (18h-22h). Làm thêm 6 tháng tại cửa hàng tiện lợi (thu ngân, sắp xếp hàng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Bao_Binh_VLU.pdf	PENDING	2026-10-12 14:21:33+00	\N
1162	200	108	Kính gửi Quý công ty Hộ kinh doanh Foody 14, em là Bùi Hữu Anh, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk và có thể sắp xếp thời gian linh hoạt theo lịch học. Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Huu_Anh_VLU.pdf	REJECTED	2026-09-02 06:56:37+00	2026-09-05 13:42:37+00
1163	170	83	Kính gửi Quý công ty Tập đoàn Phát Đạt 47, em là Phan Ngọc Linh, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Ngoc_Linh_VLU.pdf	REJECTED	2026-10-15 07:27:29+00	2026-10-19 13:12:29+00
1164	219	82	Kính gửi Quý công ty Công ty TNHH TechNova 32, em là Đặng Thanh Đức, sinh viên ngành Công nghệ thông tin, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Dang_Thanh_Duc_VLU.pdf	PENDING	2026-10-31 09:21:42+00	\N
1165	116	63	Kính gửi anh/chị Vy, em là Nguyễn Hữu Sơn, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian linh hoạt theo lịch học. Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Huu_Son_VLU.pdf	ACCEPTED	2026-08-24 06:39:21+00	2026-08-27 14:35:21+00
1166	172	84	Kính gửi Quý công ty Tập đoàn Đại Dương 20, em là Lê Hồng Thảo, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Bếp part-time và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hong_Thao_VLU.pdf	ACCEPTED	2026-08-31 04:30:37+00	2026-09-03 08:27:37+00
1167	197	122	Kính gửi Quý công ty Công ty Cổ phần Thành Công 13, em là Bùi Hoàng Hải, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca tối (18h-22h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Hoang_Hai_VLU.pdf	ACCEPTED	2026-09-11 02:55:59+00	2026-09-14 11:38:59+00
1168	104	66	Kính gửi anh/chị Vy, em xin ứng tuyển vị trí Kiểm kho part-time. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Pham_Thi_Giang_VLU.pdf	REJECTED	2026-09-26 02:46:20+00	2026-10-01 07:30:20+00
1169	109	60	Kính gửi Quý công ty Hệ thống Foody 44, em là Phạm Ngọc Minh, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca chiều (13h-17h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Pham_Ngoc_Minh_VLU.pdf	REJECTED	2026-10-31 06:39:32+00	2026-11-01 14:11:32+00
1170	175	83	Kính gửi Quý công ty Hộ kinh doanh Foody 14, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Ngoc_Linh_VLU.pdf	REJECTED	2026-10-07 02:17:46+00	2026-10-08 07:05:46+00
1171	146	88	Kính gửi anh/chị Anh, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Thanh_Tram_VLU.pdf	PENDING	2026-08-18 00:04:33+00	\N
1172	201	101	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Minh_Tram_VLU.pdf	REJECTED	2026-08-26 02:07:15+00	2026-08-28 09:26:15+00
1173	217	63	Kính gửi anh/chị Thảo, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Huu_Son_VLU.pdf	REJECTED	2026-08-15 11:59:44+00	2026-08-17 14:59:44+00
1174	218	95	Kính gửi anh/chị Tuấn, em là Vũ Bảo Khoa, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca tối (18h-22h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Bao_Khoa_VLU.pdf	REJECTED	2026-08-29 05:34:21+00	2026-09-03 11:03:21+00
1175	146	110	Kính gửi Quý công ty Hệ thống TechNova 37, em là Lý Thị Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian ca sáng (8h-12h). Làm thêm 6 tháng tại cửa hàng tiện lợi (thu ngân, sắp xếp hàng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ly_Thi_Nhi_VLU.pdf	ACCEPTED	2026-08-25 09:41:10+00	2026-08-28 12:01:10+00
1176	175	96	Kính gửi Quý công ty Hộ kinh doanh Foody 14, em là Dương Hữu Giang, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Duong_Huu_Giang_VLU.pdf	PENDING	2026-10-13 09:00:46+00	\N
1177	112	105	Kính gửi anh/chị Trang, em xin ứng tuyển vị trí Phân loại hàng hóa. Em là sinh viên ngành Thương mại điện tử, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Bao_Binh_VLU.pdf	ACCEPTED	2026-09-03 14:43:11+00	2026-09-04 17:46:11+00
1178	121	97	Kính gửi anh/chị Hân, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Do_Tuan_Thao_VLU.pdf	PENDING	2026-09-29 14:31:53+00	\N
1179	151	65	Kính gửi anh/chị Nam, em là Lý Xuân Yến, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) và có thể sắp xếp thời gian ca chiều (13h-17h). Dự án cá nhân: website bán hàng bằng ReactJS + NodeJS. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ly_Xuan_Yen_VLU.pdf	PENDING	2026-08-31 03:44:27+00	\N
1180	139	108	Kính gửi anh/chị Tuấn, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Huu_Anh_VLU.pdf	REJECTED	2026-09-16 13:59:43+00	2026-09-20 16:15:43+00
1181	204	97	Kính gửi Quý công ty Công ty TNHH Việt Tín 38, em là Đỗ Tuấn Thảo, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Soạn hàng ca đêm và có thể sắp xếp thời gian ca chiều (13h-17h). Phân loại hàng hóa thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Tuan_Thao_VLU.pdf	ACCEPTED	2026-08-12 06:24:00+00	2026-08-15 14:09:00+00
1182	218	82	Kính gửi anh/chị Tuấn, em là Đặng Thanh Đức, sinh viên ngành Công nghệ thông tin, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca tối (18h-22h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Dang_Thanh_Duc_VLU.pdf	ACCEPTED	2026-08-24 01:18:12+00	2026-08-26 06:42:12+00
1183	121	118	Kính gửi Quý công ty Hộ kinh doanh Phát Đạt 46, em là Vũ Đình Thảo, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Dinh_Thao_VLU.pdf	ACCEPTED	2026-10-02 06:28:37+00	2026-10-06 11:57:37+00
1184	187	72	Kính gửi Quý công ty Hệ thống Foody 44, em là Hồ Đức Cường, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Duc_Cuong_VLU.pdf	ACCEPTED	2026-09-01 03:14:17+00	2026-09-04 04:44:17+00
1185	122	83	Kính gửi Quý công ty Hệ thống Phát Đạt 49, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Ngoc_Linh_VLU.pdf	ACCEPTED	2026-10-13 11:44:39+00	2026-10-16 17:57:39+00
1186	217	105	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Thương mại điện tử, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Bao_Binh_VLU.pdf	ACCEPTED	2026-08-19 12:16:48+00	2026-08-23 17:16:48+00
1187	215	76	Kính gửi Quý công ty Công ty TNHH Sáng Tạo Mới 51, em là Trần Ngọc Trâm, sinh viên ngành Thương mại điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm thêm 6 tháng tại cửa hàng tiện lợi (thu ngân, sắp xếp hàng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Ngoc_Tram_VLU.pdf	REJECTED	2026-09-28 12:37:06+00	2026-10-03 20:21:06+00
1188	102	92	Kính gửi Quý công ty Công ty TNHH Đại Dương 40, em xin ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Do_Quang_Anh_VLU.pdf	REJECTED	2026-09-29 05:49:05+00	2026-10-04 08:03:05+00
1189	214	106	Kính gửi Quý công ty Hệ thống Foody 44, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Tuan_Vy_VLU.pdf	ACCEPTED	2026-09-08 06:38:38+00	2026-09-12 13:17:38+00
1190	142	121	Kính gửi Quý công ty Công ty TNHH TechNova 32, em là Hoàng Hoàng Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian linh hoạt theo lịch học. Phân loại hàng hóa thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Hoang_Hoang_Nhi_VLU.pdf	PENDING	2026-10-09 03:35:07+00	\N
1192	187	98	Kính gửi anh/chị Minh, em là Võ Hoàng Bình, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Hoang_Binh_VLU.pdf	PENDING	2026-09-02 02:11:20+00	\N
1193	190	66	Kính gửi anh/chị Oanh, em là Phạm Thị Giang, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca chiều (13h-17h). Cộng tác viên bán hàng online 1 năm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Pham_Thi_Giang_VLU.pdf	PENDING	2026-10-10 04:26:39+00	\N
1194	208	122	Kính gửi Quý công ty Công ty TNHH Việt Tín 8, em là Bùi Hoàng Hải, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Hoang_Hai_VLU.pdf	ACCEPTED	2026-09-11 05:06:36+00	2026-09-13 08:02:36+00
1195	165	67	Kính gửi anh/chị Trang, em là Phạm Hoàng Hòa, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Pha chế (Barista) ca tối và có thể sắp xếp thời gian ca sáng (8h-12h). Phục vụ bàn thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Pham_Hoang_Hoa_VLU.pdf	PENDING	2026-10-29 06:02:03+00	\N
1196	157	63	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 42, em là Nguyễn Hữu Sơn, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Kiểm kho part-time và có thể sắp xếp thời gian ca tối (18h-22h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Huu_Son_VLU.pdf	ACCEPTED	2026-09-12 00:52:10+00	2026-09-16 09:50:10+00
1197	208	107	Kính gửi anh/chị Nam, em là Trần Thị Yến, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian linh hoạt theo lịch học. Hỗ trợ đóng gói đơn hàng online cho cửa hàng của gia đình. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Thi_Yen_VLU.pdf	ACCEPTED	2026-09-04 00:12:16+00	2026-09-07 05:10:16+00
1198	154	53	Kính gửi Quý công ty Công ty Cổ phần Đại Dương 5, em xin ứng tuyển vị trí Data Entry part-time. Em là sinh viên ngành Công nghệ thông tin, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Duong_Huu_Anh_VLU.pdf	PENDING	2026-10-25 12:33:16+00	\N
1199	215	100	Kính gửi Quý công ty Công ty TNHH Sáng Tạo Mới 51, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ho_Ngoc_Thanh_VLU.pdf	ACCEPTED	2026-10-07 10:58:49+00	2026-10-10 18:50:49+00
1200	201	78	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em là Lý Ngọc Trang, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ly_Ngoc_Trang_VLU.pdf	REJECTED	2026-08-16 09:06:06+00	2026-08-18 15:28:06+00
1201	205	55	Kính gửi anh/chị Bình, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Tuan_Oanh_VLU.pdf	REJECTED	2026-09-27 01:18:39+00	2026-09-28 07:19:39+00
1202	210	114	Kính gửi anh/chị Cường, em là Hồ Quang Bình, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Đóng gói bưu phẩm và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Quang_Binh_VLU.pdf	PENDING	2026-10-28 04:31:21+00	\N
1203	151	82	Kính gửi Quý công ty Tập đoàn Phát Đạt 19, em là Đặng Thanh Đức, sinh viên ngành Công nghệ thông tin, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) và có thể sắp xếp thời gian ca chiều (13h-17h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Dang_Thanh_Duc_VLU.pdf	REJECTED	2026-08-04 09:19:26+00	2026-08-05 17:28:26+00
1204	200	53	Kính gửi anh/chị Khánh, em là Dương Hữu Anh, sinh viên ngành Công nghệ thông tin, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk và có thể sắp xếp thời gian linh hoạt theo lịch học. Từng kiểm thử thủ công cho đồ án nhóm trong học phần Kiểm thử phần mềm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Duong_Huu_Anh_VLU.pdf	PENDING	2026-09-03 10:13:47+00	\N
1205	189	85	Kính gửi Quý công ty Công ty TNHH Hoàn Cầu 3, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Huu_Cuong_VLU.pdf	ACCEPTED	2026-10-06 01:25:00+00	2026-10-07 09:03:00+00
1207	211	95	Kính gửi anh/chị Cường, em là Vũ Bảo Khoa, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Trợ giảng cuối tuần và có thể sắp xếp thời gian linh hoạt theo lịch học. Tình nguyện viên dạy kèm cuối tuần tại trung tâm cộng đồng. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Bao_Khoa_VLU.pdf	PENDING	2026-09-09 09:46:34+00	\N
1208	159	68	Kính gửi Quý công ty Hộ kinh doanh Đại Dương 50, em là Phan Hoàng Cường, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca sáng (8h-12h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Hoang_Cuong_VLU.pdf	REJECTED	2026-08-29 04:37:13+00	2026-09-02 06:07:13+00
1209	175	81	Kính gửi Quý công ty Hộ kinh doanh Foody 14, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Duc_Minh_VLU.pdf	REJECTED	2026-10-07 02:22:22+00	2026-10-09 09:58:22+00
1210	195	74	Kính gửi Quý công ty Công ty Cổ phần Foody 25, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Thương mại điện tử, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Thanh_Giang_VLU.pdf	ACCEPTED	2026-08-05 06:10:43+00	2026-08-08 12:12:43+00
1211	174	75	Kính gửi Quý công ty Công ty TNHH TechNova 12, em xin ứng tuyển vị trí Tư vấn viên Telesales khóa học. Em là sinh viên ngành Logistics và Quản lý chuỗi cung ứng, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Tran_Thu_Hoa_VLU.pdf	REJECTED	2026-09-17 10:32:45+00	2026-09-18 14:26:45+00
1212	200	59	Kính gửi anh/chị Khánh, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Tran_Hong_Anh_VLU.pdf	REJECTED	2026-08-23 03:15:12+00	2026-08-25 09:01:12+00
1213	190	93	Kính gửi anh/chị Oanh, em là Hồ Ngọc Nhi, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Ngoc_Nhi_VLU.pdf	REJECTED	2026-09-21 09:38:43+00	2026-09-24 13:05:43+00
1214	182	79	Kính gửi anh/chị Thảo, em là Huỳnh Thị Dung, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca chiều (13h-17h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Huynh_Thi_Dung_VLU.pdf	ACCEPTED	2026-09-10 06:14:28+00	2026-09-13 12:55:28+00
1215	183	84	Kính gửi Quý công ty Công ty TNHH Giao Hàng Nhanh 39, em là Lê Hồng Thảo, sinh viên ngành Logistics và Quản lý chuỗi cung ứng, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Đóng gói sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hong_Thao_VLU.pdf	REJECTED	2026-10-31 06:27:18+00	2026-11-01 18:51:12+00
1216	141	58	Kính gửi Quý công ty Công ty TNHH Hoàn Cầu 30, em xin ứng tuyển vị trí Nhập liệu sản xuất part-time. Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Huynh_Dinh_Cuong_VLU.pdf	PENDING	2026-10-27 05:20:58+00	\N
1217	150	103	Kính gửi Quý công ty Công ty TNHH Giao Hàng Nhanh 39, em là Dương Hồng Sơn, sinh viên ngành Công nghệ kỹ thuật ô tô, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Đóng gói sản phẩm và có thể sắp xếp thời gian ca sáng (8h-12h). Thực hành xưởng cơ khí theo chương trình học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Duong_Hong_Son_VLU.pdf	ACCEPTED	2026-08-23 07:20:45+00	2026-08-25 09:27:45+00
1218	163	89	Kính gửi anh/chị Yến, em là Lê Hồng Vy, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm và có thể sắp xếp thời gian ca tối (18h-22h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hong_Vy_VLU.pdf	REJECTED	2026-10-04 08:15:46+00	2026-10-05 09:23:46+00
1219	159	76	Kính gửi anh/chị Tuấn, em là Trần Ngọc Trâm, sinh viên ngành Thương mại điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca sáng (8h-12h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Ngoc_Tram_VLU.pdf	ACCEPTED	2026-08-29 01:17:23+00	2026-09-01 03:04:23+00
1220	117	93	Kính gửi Quý công ty Công ty TNHH Sáng Tạo Mới 31, em xin ứng tuyển vị trí Cộng tác viên Tuyển sinh. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ho_Ngoc_Nhi_VLU.pdf	REJECTED	2026-08-26 05:06:16+00	2026-08-28 13:00:16+00
1221	208	84	Kính gửi Quý công ty Công ty TNHH Việt Tín 8, em xin ứng tuyển vị trí Phân loại hàng hóa. Em là sinh viên ngành Logistics và Quản lý chuỗi cung ứng, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Le_Hong_Thao_VLU.pdf	PENDING	2026-09-07 12:31:01+00	\N
1222	211	98	Kính gửi Quý công ty Công ty Cổ phần Việt Tín 23, em là Võ Hoàng Bình, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Trợ giảng cuối tuần và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vo_Hoang_Binh_VLU.pdf	ACCEPTED	2026-09-02 03:28:21+00	2026-09-04 09:08:21+00
1223	205	98	Kính gửi Quý công ty Hệ thống Thành Công 28, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Hoang_Binh_VLU.pdf	PENDING	2026-09-26 10:28:16+00	\N
1224	134	70	Kính gửi anh/chị Tâm, em là Đỗ Bảo Tuấn, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Trợ lý kỹ thuật part-time và có thể sắp xếp thời gian ca chiều (13h-17h). Làm thêm kỹ thuật viên sửa xe máy cuối tuần (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Bao_Tuan_VLU.pdf	REJECTED	2026-10-31 02:35:06+00	2026-11-01 08:36:06+00
1225	178	57	Kính gửi Quý công ty Công ty Cổ phần Foody 25, em là Vũ Thanh Linh, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian ca sáng (8h-12h). Cộng tác viên bán hàng online 1 năm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Thanh_Linh_VLU.pdf	PENDING	2026-10-08 06:23:28+00	\N
1226	188	100	Kính gửi Quý công ty Công ty Cổ phần Giao Hàng Nhanh 18, em là Hồ Ngọc Thành, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Ngoc_Thanh_VLU.pdf	PENDING	2026-10-30 14:55:57+00	\N
1227	138	121	Kính gửi Quý công ty Tập đoàn Hoàn Cầu 11, em xin ứng tuyển vị trí Cộng tác viên Bán hàng. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Hoang_Hoang_Nhi_VLU.pdf	PENDING	2026-10-12 02:29:49+00	\N
1228	149	70	Kính gửi Quý công ty Công ty TNHH Giao Hàng Nhanh 39, em là Đỗ Bảo Tuấn, sinh viên ngành Kỹ thuật điện - điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Trợ lý kỹ thuật part-time và có thể sắp xếp thời gian ca sáng (8h-12h). Làm thêm kỹ thuật viên sửa xe máy cuối tuần (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Bao_Tuan_VLU.pdf	ACCEPTED	2026-08-13 04:06:03+00	2026-08-15 10:58:03+00
1229	103	97	Kính gửi Quý công ty Hộ kinh doanh Foody 14, em xin ứng tuyển vị trí Cộng tác viên Tester (Manual). Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Do_Tuan_Thao_VLU.pdf	ACCEPTED	2026-09-10 08:57:12+00	2026-09-11 11:49:12+00
1230	202	68	Kính gửi Quý công ty Hộ kinh doanh Foody 14, em là Phan Hoàng Cường, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Data Entry part-time và có thể sắp xếp thời gian ca sáng (8h-12h). Từng kiểm thử thủ công cho đồ án nhóm trong học phần Kiểm thử phần mềm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Hoang_Cuong_VLU.pdf	PENDING	2026-10-11 07:48:52+00	\N
1231	215	105	Kính gửi Quý công ty Công ty TNHH Sáng Tạo Mới 51, em là Vũ Bảo Bình, sinh viên ngành Thương mại điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm thêm 6 tháng tại cửa hàng tiện lợi (thu ngân, sắp xếp hàng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Bao_Binh_VLU.pdf	ACCEPTED	2026-10-04 00:02:37+00	2026-10-08 05:38:37+00
1232	125	55	Kính gửi Quý công ty Công ty Cổ phần Sáng Tạo Mới 34, em là Vũ Tuấn Oanh, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk và có thể sắp xếp thời gian ca chiều (13h-17h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Tuan_Oanh_VLU.pdf	REJECTED	2026-10-21 01:40:11+00	2026-10-25 04:36:11+00
1233	179	109	Kính gửi Quý công ty Công ty TNHH Giao Hàng Nhanh 39, em xin ứng tuyển vị trí Nhân viên Đóng gói sản phẩm. Em là sinh viên ngành Công nghệ kỹ thuật ô tô, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ngo_Van_Huong_VLU.pdf	PENDING	2026-10-25 00:22:44+00	\N
1234	182	76	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em là Trần Ngọc Trâm, sinh viên ngành Thương mại điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca chiều (13h-17h). Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Tran_Ngoc_Tram_VLU.pdf	PENDING	2026-09-13 06:43:05+00	\N
1235	134	122	Kính gửi anh/chị Tâm, em xin ứng tuyển vị trí Trợ lý kỹ thuật part-time. Em là sinh viên ngành Kinh doanh quốc tế, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Hoang_Hai_VLU.pdf	PENDING	2026-10-31 14:26:25+00	\N
1236	144	61	Kính gửi Quý công ty Công ty TNHH Việt Tín 38, em là Lê Hoàng Hòa, sinh viên ngành Kỹ thuật phần mềm, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Le_Hoang_Hoa_VLU.pdf	REJECTED	2026-10-30 11:06:39+00	2026-11-01 07:11:55+00
1237	162	101	Kính gửi Quý công ty Công ty Cổ phần Foody 26, em là Vũ Minh Trâm, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Hỗ trợ tổ chức lớp học & sự kiện và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Minh_Tram_VLU.pdf	ACCEPTED	2026-09-07 00:55:18+00	2026-09-11 05:49:18+00
1238	148	110	Kính gửi anh/chị Hùng, em là Lý Thị Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian ca sáng (8h-12h). Khảo sát thị trường cho đồ án môn Marketing. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ly_Thi_Nhi_VLU.pdf	REJECTED	2026-10-26 07:25:08+00	2026-10-28 14:35:08+00
1239	129	101	Kính gửi anh/chị Dung, em là Vũ Minh Trâm, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần và có thể sắp xếp thời gian linh hoạt theo lịch học. Làm promoter cuối tuần cho nhãn hàng đồ uống (3 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Minh_Tram_VLU.pdf	ACCEPTED	2026-08-10 08:40:28+00	2026-08-11 13:12:28+00
1240	142	110	Kính gửi anh/chị Trang, em là Lý Thị Nhi, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ly_Thi_Nhi_VLU.pdf	REJECTED	2026-10-12 04:25:59+00	2026-10-17 10:59:59+00
1241	208	97	Kính gửi Quý công ty Công ty TNHH Việt Tín 8, em là Đỗ Tuấn Thảo, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Phân loại hàng hóa và có thể sắp xếp thời gian linh hoạt theo lịch học. Phân loại hàng hóa thời vụ dịp Tết (2 tháng). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Tuan_Thao_VLU.pdf	REJECTED	2026-09-11 06:40:49+00	2026-09-12 12:07:49+00
1242	115	85	Kính gửi Quý công ty Công ty TNHH Thành Công 43, em xin ứng tuyển vị trí Nhân viên Trưng bày sản phẩm. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Huu_Cuong_VLU.pdf	REJECTED	2026-09-16 14:14:44+00	2026-09-21 22:03:44+00
1243	167	67	Kính gửi Quý công ty Công ty Cổ phần Foody 25, em xin ứng tuyển vị trí Tư vấn viên Telesales. Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Pham_Hoang_Hoa_VLU.pdf	PENDING	2026-09-02 14:14:00+00	\N
1244	124	117	Kính gửi anh/chị Trang, em xin ứng tuyển vị trí Phân loại hàng hóa. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vo_Tuan_Yen_VLU.pdf	PENDING	2026-09-13 01:09:18+00	\N
1245	140	108	Kính gửi anh/chị Vy, em là Bùi Hữu Anh, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Nhân viên Soạn hàng ca đêm và có thể sắp xếp thời gian ca tối (18h-22h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Huu_Anh_VLU.pdf	REJECTED	2026-09-16 07:47:29+00	2026-09-20 12:16:29+00
1246	182	63	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 36, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Marketing, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Huu_Son_VLU.pdf	REJECTED	2026-09-22 13:36:18+00	2026-09-26 14:36:18+00
1247	136	116	Kính gửi Quý công ty Công ty Cổ phần Việt Tín 23, em xin ứng tuyển vị trí Trợ giảng cuối tuần. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Phan_Dinh_Giang_VLU.pdf	REJECTED	2026-08-26 02:50:53+00	2026-08-27 04:53:53+00
1248	174	108	Kính gửi Quý công ty Công ty TNHH TechNova 12, em là Bùi Hữu Anh, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Tư vấn viên Telesales khóa học và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Huu_Anh_VLU.pdf	ACCEPTED	2026-09-03 07:26:38+00	2026-09-04 11:38:38+00
1249	107	72	Kính gửi Quý công ty Công ty Cổ phần Hoàn Cầu 45, em là Hồ Đức Cường, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Ho_Duc_Cuong_VLU.pdf	ACCEPTED	2026-09-28 03:28:47+00	2026-10-01 06:11:47+00
1250	153	100	Kính gửi Quý công ty Hộ kinh doanh Việt Tín 42, em xin ứng tuyển vị trí Phân loại hàng hóa. Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Ho_Ngoc_Thanh_VLU.pdf	REJECTED	2026-09-27 10:34:26+00	2026-09-28 15:14:26+00
1251	221	123	Kính gửi Quý công ty Công ty TNHH Việt Nova, em là Nguyễn Minh Khang, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Minh_Khang_VLU.pdf	PENDING	2026-10-28 05:55:09+00	\N
1252	221	97	Kính gửi anh/chị Huy, em là Đỗ Tuấn Thảo, sinh viên ngành Marketing, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) và có thể sắp xếp thời gian linh hoạt theo lịch học. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Do_Tuan_Thao_VLU.pdf	PENDING	2026-10-24 11:35:39+00	\N
1253	221	108	Kính gửi anh/chị Huy, em xin ứng tuyển vị trí Thực tập sinh Front-end (ReactJS). Em là sinh viên ngành Khoa học dữ liệu, có thể sắp xếp thời gian linh hoạt theo lịch học. Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Bui_Huu_Anh_VLU.pdf	REJECTED	2026-10-22 13:22:07+00	2026-10-25 07:17:15+00
1254	222	55	Kính gửi Quý công ty Công ty TNHH Việt Nova, em là Vũ Tuấn Oanh, sinh viên ngành Khoa học dữ liệu, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian ca chiều (13h-17h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Tuan_Oanh_VLU.pdf	PENDING	2026-10-20 00:28:25+00	\N
1255	222	103	Kính gửi Quý công ty Công ty TNHH Việt Nova, em là Dương Hồng Sơn, sinh viên ngành Công nghệ kỹ thuật ô tô, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian ca chiều (13h-17h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Duong_Hong_Son_VLU.pdf	PENDING	2026-10-30 08:01:19+00	\N
1256	223	123	Kính gửi Quý công ty Công ty TNHH Việt Nova, em là Nguyễn Minh Khang, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Minh_Khang_VLU.pdf	ACCEPTED	2026-10-21 12:02:05+00	2026-10-29 06:15:13+00
1257	223	101	Kính gửi Quý công ty Công ty TNHH Việt Nova, em là Vũ Minh Trâm, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) và có thể sắp xếp thời gian ca sáng (8h-12h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Minh_Tram_VLU.pdf	ACCEPTED	2026-10-20 13:46:26+00	2026-10-27 00:17:10+00
1258	223	74	Kính gửi Quý công ty Công ty TNHH Việt Nova, em là Phan Thanh Giang, sinh viên ngành Thương mại điện tử, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) và có thể sắp xếp thời gian ca sáng (8h-12h). Tham gia nhóm đồ án môn học (web/app), dùng Git theo nhóm. Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Phan_Thanh_Giang_VLU.pdf	REJECTED	2026-10-18 08:37:43+00	2026-10-26 04:00:21+00
1259	223	102	Kính gửi anh/chị Huy, em xin ứng tuyển vị trí Thực tập sinh Back-end (NodeJS). Em là sinh viên ngành Quản trị kinh doanh, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Vu_Hong_Tuan_VLU.pdf	PENDING	2026-10-24 04:31:42+00	\N
1260	224	123	Kính gửi anh/chị Huy, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Minh_Khang_VLU.pdf	ACCEPTED	2026-08-25 10:39:38+00	2026-08-27 12:20:37+00
1261	224	80	Kính gửi Quý công ty Công ty TNHH Việt Nova, em xin ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk. Em là sinh viên ngành Kỹ thuật phần mềm, có thể sắp xếp thời gian ca chiều (13h-17h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Huynh_Dinh_Tuan_VLU.pdf	ACCEPTED	2026-08-28 12:40:39+00	2026-08-30 04:46:39+00
1262	225	123	Kính gửi anh/chị Huy, em xin ứng tuyển vị trí Data Entry part-time. Em là sinh viên ngành Hệ thống thông tin quản lý, có thể sắp xếp thời gian ca tối (18h-22h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Nguyen_Minh_Khang_VLU.pdf	ACCEPTED	2026-08-30 05:52:37+00	2026-09-02 11:43:46+00
1263	226	123	Kính gửi Quý công ty Công ty TNHH Việt Nova, em là Nguyễn Minh Khang, sinh viên ngành Hệ thống thông tin quản lý, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Nguyen_Minh_Khang_VLU.pdf	REJECTED	2026-09-05 00:16:37+00	2026-09-08 09:00:53+00
1264	226	95	Kính gửi anh/chị Huy, em là Vũ Bảo Khoa, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian ca sáng (8h-12h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Bao_Khoa_VLU.pdf	PENDING	2026-09-10 03:02:13+00	\N
1265	235	82	Kính gửi anh/chị Trâm, em xin ứng tuyển vị trí Khảo sát thị trường cuối tuần. Em là sinh viên ngành Công nghệ thông tin, có thể sắp xếp thời gian ca sáng (8h-12h). Rất mong có cơ hội được làm việc cùng công ty. CV của em được đính kèm.	CV_Dang_Thanh_Duc_VLU.pdf	PENDING	2026-09-28 04:28:15+00	\N
1266	236	99	Kính gửi Quý công ty Tập đoàn Hoàn Cầu 11, em là Bùi Đức Nam, sinh viên ngành Kinh doanh quốc tế, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Bán hàng và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Bui_Duc_Nam_VLU.pdf	PENDING	2026-10-30 13:37:27+00	\N
1267	222	57	Kính gửi anh/chị Huy, em là Vũ Thanh Linh, sinh viên ngành Quản trị kinh doanh, Trường Đại học Văn Lang. Em xin ứng tuyển vị trí Cộng tác viên Tester (Manual) và có thể sắp xếp thời gian ca chiều (13h-17h). Em đã đính kèm CV và mong sớm nhận được phản hồi. Em xin cảm ơn.	CV_Vu_Thanh_Linh_VLU.pdf	REJECTED	2026-10-15 14:02:22+00	2026-10-18 08:42:34+00
1275	236	131	Em rất quan tâm đến vị trí này và mong muốn được cống hiến.	\N	PENDING	2026-11-02 19:28:21.534393+00	2026-11-03 19:28:21.534393+00
1276	109	131	Em đã có kinh nghiệm phù hợp và có thể bắt đầu ngay.	\N	ACCEPTED	2026-10-31 19:28:21.53635+00	2026-11-03 19:28:21.53635+00
1277	106	131	Em đã hoàn thành xuất sắc toàn bộ ca làm việc và các hạng mục bàn giao.	\N	ACCEPTED	2026-10-27 19:28:21.540317+00	2026-11-03 19:28:21.540317+00
1278	238	53	Em là sinh viên năm 3 khoa CNTT, rất đam mê ReactJS và muốn cống hiến cho công ty.	\N	REJECTED	2026-11-03 19:39:03.525992+00	2026-11-03 22:05:51.707324+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, parent_id, is_active, created_at) FROM stdin;
1	Bán lẻ	\N	t	2026-11-03 19:57:36.319565
2	Công nghệ thông tin	\N	t	2026-11-03 19:57:36.319565
3	F&B / Dịch vụ ăn uống	\N	t	2026-11-03 19:57:36.319565
4	Giáo dục / Đào tạo	\N	t	2026-11-03 19:57:36.319565
5	Hàng tiêu dùng / FMCG	\N	t	2026-11-03 19:57:36.319565
6	Logistics / Giao nhận	\N	t	2026-11-03 19:57:36.319565
7	Sản xuất / Kỹ thuật	\N	t	2026-11-03 19:57:36.319565
\.


--
-- Data for Name: deliverable_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deliverable_reviews (id, deliverable_id, reviewed_by, decision, comment, created_at) FROM stdin;
\.


--
-- Data for Name: employer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employer_profiles (id, user_id, display_name, bio, location, avatar_url, email_verified_at, phone_verified_at, created_at, updated_at, account_type, tax_code, website, business_license_file) FROM stdin;
1	3	Công ty TNHH Hoàn Cầu 3	Công ty TNHH Hoàn Cầu 3 hoạt động trong lĩnh vực Bán lẻ với mạng lưới chi nhánh rộng khắp Bình Dương. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN VSIP 1, Thuận An, Bình Dương	uploads/logos/employer_003.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	6337644044	https://www.hoancau3.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Hoan_Cau_3.pdf
2	4	Công ty TNHH TechNova 4	Công ty TNHH TechNova 4 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Bình Dương. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Sóng Thần, Dĩ An, Bình Dương	uploads/logos/employer_004.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	6324778711	https://www.technova4.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_TechNova_4.pdf
3	5	Công ty Cổ phần Đại Dương 5	Công ty Cổ phần Đại Dương 5 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Trà Nóc, Bình Thủy, Cần Thơ	uploads/logos/employer_005.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2632252276	https://www.daiduong5.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Dai_Duong_5.pdf
4	6	Tập đoàn Sáng Tạo Mới 6	Tập đoàn Sáng Tạo Mới 6 hoạt động trong lĩnh vực Sản xuất / Kỹ thuật với mạng lưới chi nhánh rộng khắp Đồng Nai. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Amata, Biên Hòa, Đồng Nai	uploads/logos/employer_006.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	5324868479	https://www.sangtaomoi6.vn	Giay_Phep_Kinh_Doanh_Tap_doan_Sang_Tao_Moi_6.pdf
5	7	Hệ thống Giao Hàng Nhanh 7	Hệ thống Giao Hàng Nhanh 7 hoạt động trong lĩnh vực F&B / Dịch vụ ăn uống với mạng lưới chi nhánh rộng khắp Đà Nẵng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	359 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng	uploads/logos/employer_007.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0468777080	https://www.giaohangnhanh7.vn	Giay_Phep_Kinh_Doanh_He_thong_Giao_Hang_Nhanh_7.pdf
6	8	Công ty TNHH Việt Tín 8	Công ty TNHH Việt Tín 8 hoạt động trong lĩnh vực Logistics / Giao nhận với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Hưng Phú, Cái Răng, Cần Thơ	uploads/logos/employer_008.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2611907345	https://www.viettin8.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Viet_Tin_8.pdf
7	9	Hệ thống Việt Tín 9	Hệ thống Việt Tín 9 hoạt động trong lĩnh vực F&B / Dịch vụ ăn uống với mạng lưới chi nhánh rộng khắp Hải Phòng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	64 Tô Hiệu, Lê Chân, Hải Phòng	uploads/logos/employer_009.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0266301209	https://www.viettin9.vn	Giay_Phep_Kinh_Doanh_He_thong_Viet_Tin_9.pdf
8	10	Hộ kinh doanh Tương Lai 10	Hộ kinh doanh Tương Lai 10 hoạt động trong lĩnh vực F&B / Dịch vụ ăn uống với mạng lưới chi nhánh rộng khắp Bình Dương. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	179 ĐT743, Dĩ An, Bình Dương	uploads/logos/employer_010.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Hộ kinh doanh / Cá nhân	\N	\N	Giay_Phep_Kinh_Doanh_Ho_kinh_doanh_Tuong_Lai_10.pdf
9	11	Tập đoàn Hoàn Cầu 11	Tập đoàn Hoàn Cầu 11 hoạt động trong lĩnh vực Bán lẻ với mạng lưới chi nhánh rộng khắp TP. Hồ Chí Minh. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	182 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh	uploads/logos/employer_011.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0346835716	https://www.hoancau11.vn	Giay_Phep_Kinh_Doanh_Tap_doan_Hoan_Cau_11.pdf
10	12	Công ty TNHH TechNova 12	Công ty TNHH TechNova 12 hoạt động trong lĩnh vực Giáo dục / Đào tạo với mạng lưới chi nhánh rộng khắp Đà Nẵng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	357 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng	uploads/logos/employer_012.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0433968454	https://www.technova12.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_TechNova_12.pdf
11	13	Công ty Cổ phần Thành Công 13	Công ty Cổ phần Thành Công 13 hoạt động trong lĩnh vực Bán lẻ với mạng lưới chi nhánh rộng khắp Đồng Nai. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	146 Phạm Văn Thuận, Biên Hòa, Đồng Nai	uploads/logos/employer_013.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	5325331720	https://www.thanhcong13.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Thanh_Cong_13.pdf
12	14	Hộ kinh doanh Foody 14	Hộ kinh doanh Foody 14 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp TP. Hồ Chí Minh. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	27 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh	uploads/logos/employer_014.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Hộ kinh doanh / Cá nhân	\N	\N	Giay_Phep_Kinh_Doanh_Ho_kinh_doanh_Foody_14.pdf
13	15	Hộ kinh doanh Việt Tín 15	Hộ kinh doanh Việt Tín 15 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp TP. Hồ Chí Minh. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	371 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh	uploads/logos/employer_015.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Hộ kinh doanh / Cá nhân	\N	\N	Giay_Phep_Kinh_Doanh_Ho_kinh_doanh_Viet_Tin_15.pdf
14	16	Tập đoàn Giao Hàng Nhanh 16	Tập đoàn Giao Hàng Nhanh 16 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	253 Trần Hưng Đạo, Ninh Kiều, Cần Thơ	uploads/logos/employer_016.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2660108428	https://www.giaohangnhanh16.vn	Giay_Phep_Kinh_Doanh_Tap_doan_Giao_Hang_Nhanh_16.pdf
15	17	Công ty TNHH Foody 17	Công ty TNHH Foody 17 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Hải Phòng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Đình Vũ, Hải An, Hải Phòng	uploads/logos/employer_017.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0289557254	https://www.foody17.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Foody_17.pdf
16	18	Công ty Cổ phần Giao Hàng Nhanh 18	Công ty Cổ phần Giao Hàng Nhanh 18 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Hà Nội. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	292 Láng Hạ, Đống Đa, Hà Nội	uploads/logos/employer_018.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0136666161	https://www.giaohangnhanh18.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Giao_Hang_Nhanh_18.pdf
17	19	Tập đoàn Phát Đạt 19	Tập đoàn Phát Đạt 19 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Đồng Nai. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	224 Võ Thị Sáu, Biên Hòa, Đồng Nai	uploads/logos/employer_019.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	5388186220	https://www.phatdat19.vn	Giay_Phep_Kinh_Doanh_Tap_doan_Phat_Dat_19.pdf
18	20	Tập đoàn Đại Dương 20	Tập đoàn Đại Dương 20 hoạt động trong lĩnh vực F&B / Dịch vụ ăn uống với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	72 Trần Hưng Đạo, Ninh Kiều, Cần Thơ	uploads/logos/employer_020.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2605449663	https://www.daiduong20.vn	Giay_Phep_Kinh_Doanh_Tap_doan_Dai_Duong_20.pdf
19	21	Công ty TNHH Phát Đạt 21	Công ty TNHH Phát Đạt 21 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Thanh Hóa. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	334 Quang Trung, TP. Thanh Hóa, Thanh Hóa	uploads/logos/employer_021.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	4838595303	https://www.phatdat21.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Phat_Dat_21.pdf
20	22	Công ty TNHH Việt Tín 22	Công ty TNHH Việt Tín 22 hoạt động trong lĩnh vực Sản xuất / Kỹ thuật với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Trà Nóc, Bình Thủy, Cần Thơ	uploads/logos/employer_022.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2630737951	https://www.viettin22.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Viet_Tin_22.pdf
21	23	Công ty Cổ phần Việt Tín 23	Công ty Cổ phần Việt Tín 23 hoạt động trong lĩnh vực Giáo dục / Đào tạo với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	238 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ	uploads/logos/employer_023.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2666028231	https://www.viettin23.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Viet_Tin_23.pdf
22	24	Công ty TNHH Phát Đạt 24	Công ty TNHH Phát Đạt 24 hoạt động trong lĩnh vực Logistics / Giao nhận với mạng lưới chi nhánh rộng khắp Đồng Nai. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Long Thành, Long Thành, Đồng Nai	uploads/logos/employer_024.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	5316137970	https://www.phatdat24.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Phat_Dat_24.pdf
23	25	Công ty Cổ phần Foody 25	Công ty Cổ phần Foody 25 hoạt động trong lĩnh vực Bán lẻ với mạng lưới chi nhánh rộng khắp TP. Hồ Chí Minh. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	17 Lê Văn Việt, Thủ Đức, TP. Hồ Chí Minh	uploads/logos/employer_025.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0344335623	https://www.foody25.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Foody_25.pdf
24	26	Công ty Cổ phần Foody 26	Công ty Cổ phần Foody 26 hoạt động trong lĩnh vực Giáo dục / Đào tạo với mạng lưới chi nhánh rộng khắp Hà Nội. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	387 Láng Hạ, Đống Đa, Hà Nội	uploads/logos/employer_026.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0101379272	https://www.foody26.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Foody_26.pdf
25	27	Hệ thống Việt Tín 27	Hệ thống Việt Tín 27 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Hà Nội. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	44 Nguyễn Trãi, Thanh Xuân, Hà Nội	uploads/logos/employer_027.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0143996862	https://www.viettin27.vn	Giay_Phep_Kinh_Doanh_He_thong_Viet_Tin_27.pdf
26	28	Hệ thống Thành Công 28	Hệ thống Thành Công 28 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Bình Dương. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	384 Nguyễn Văn Linh, Thủ Dầu Một, Bình Dương	uploads/logos/employer_028.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	6368358657	https://www.thanhcong28.vn	Giay_Phep_Kinh_Doanh_He_thong_Thanh_Cong_28.pdf
27	29	Hệ thống Tương Lai 29	Hệ thống Tương Lai 29 hoạt động trong lĩnh vực Giáo dục / Đào tạo với mạng lưới chi nhánh rộng khắp Đồng Nai. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	33 Nguyễn Ái Quốc, Biên Hòa, Đồng Nai	uploads/logos/employer_029.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	5350043318	https://www.tuonglai29.vn	Giay_Phep_Kinh_Doanh_He_thong_Tuong_Lai_29.pdf
28	30	Công ty TNHH Hoàn Cầu 30	Công ty TNHH Hoàn Cầu 30 hoạt động trong lĩnh vực Sản xuất / Kỹ thuật với mạng lưới chi nhánh rộng khắp Đồng Nai. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Long Thành, Long Thành, Đồng Nai	uploads/logos/employer_030.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	5365787262	https://www.hoancau30.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Hoan_Cau_30.pdf
29	31	Công ty TNHH Sáng Tạo Mới 31	Công ty TNHH Sáng Tạo Mới 31 hoạt động trong lĩnh vực Giáo dục / Đào tạo với mạng lưới chi nhánh rộng khắp Hải Phòng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	54 Tô Hiệu, Lê Chân, Hải Phòng	uploads/logos/employer_031.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0206487254	https://www.sangtaomoi31.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Sang_Tao_Moi_31.pdf
30	32	Công ty TNHH TechNova 32	Công ty TNHH TechNova 32 hoạt động trong lĩnh vực Logistics / Giao nhận với mạng lưới chi nhánh rộng khắp Bình Dương. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN VSIP 1, Thuận An, Bình Dương	uploads/logos/employer_032.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	6343199210	https://www.technova32.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_TechNova_32.pdf
31	33	Hệ thống Đại Dương 33	Hệ thống Đại Dương 33 hoạt động trong lĩnh vực Giáo dục / Đào tạo với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	351 Trần Hưng Đạo, Ninh Kiều, Cần Thơ	uploads/logos/employer_033.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2623835888	https://www.daiduong33.vn	Giay_Phep_Kinh_Doanh_He_thong_Dai_Duong_33.pdf
32	34	Công ty Cổ phần Sáng Tạo Mới 34	Công ty Cổ phần Sáng Tạo Mới 34 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp TP. Hồ Chí Minh. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	294 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh	uploads/logos/employer_034.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0301056822	https://www.sangtaomoi34.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Sang_Tao_Moi_34.pdf
33	35	Hệ thống Phát Đạt 35	Hệ thống Phát Đạt 35 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Bình Dương. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Sóng Thần, Dĩ An, Bình Dương	uploads/logos/employer_035.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	6328282709	https://www.phatdat35.vn	Giay_Phep_Kinh_Doanh_He_thong_Phat_Dat_35.pdf
34	36	Hộ kinh doanh Việt Tín 36	Hộ kinh doanh Việt Tín 36 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Thanh Hóa. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	382 Trần Phú, TP. Thanh Hóa, Thanh Hóa	uploads/logos/employer_036.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Hộ kinh doanh / Cá nhân	\N	\N	Giay_Phep_Kinh_Doanh_Ho_kinh_doanh_Viet_Tin_36.pdf
35	37	Hệ thống TechNova 37	Hệ thống TechNova 37 hoạt động trong lĩnh vực Bán lẻ với mạng lưới chi nhánh rộng khắp Bình Dương. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	106 Nguyễn Văn Linh, Thủ Dầu Một, Bình Dương	uploads/logos/employer_037.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	6341806286	https://www.technova37.vn	Giay_Phep_Kinh_Doanh_He_thong_TechNova_37.pdf
36	38	Công ty TNHH Việt Tín 38	Công ty TNHH Việt Tín 38 hoạt động trong lĩnh vực Logistics / Giao nhận với mạng lưới chi nhánh rộng khắp Bà Rịa - Vũng Tàu. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Đông Xuyên, Vũng Tàu, Bà Rịa - Vũng Tàu	uploads/logos/employer_038.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	7579833657	https://www.viettin38.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Viet_Tin_38.pdf
37	39	Công ty TNHH Giao Hàng Nhanh 39	Công ty TNHH Giao Hàng Nhanh 39 hoạt động trong lĩnh vực Sản xuất / Kỹ thuật với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Hưng Phú, Cái Răng, Cần Thơ	uploads/logos/employer_039.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2693853269	https://www.giaohangnhanh39.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Giao_Hang_Nhanh_39.pdf
38	40	Công ty TNHH Đại Dương 40	Công ty TNHH Đại Dương 40 hoạt động trong lĩnh vực Sản xuất / Kỹ thuật với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Hưng Phú, Cái Răng, Cần Thơ	uploads/logos/employer_040.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2623700944	https://www.daiduong40.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Dai_Duong_40.pdf
39	41	Công ty TNHH Hoàn Cầu 41	Công ty TNHH Hoàn Cầu 41 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Hà Nội. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	90 Láng Hạ, Đống Đa, Hà Nội	uploads/logos/employer_041.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0137107468	https://www.hoancau41.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Hoan_Cau_41.pdf
40	42	Hộ kinh doanh Việt Tín 42	Hộ kinh doanh Việt Tín 42 hoạt động trong lĩnh vực Logistics / Giao nhận với mạng lưới chi nhánh rộng khắp Đà Nẵng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	333 Điện Biên Phủ, Thanh Khê, Đà Nẵng	uploads/logos/employer_042.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Hộ kinh doanh / Cá nhân	\N	\N	Giay_Phep_Kinh_Doanh_Ho_kinh_doanh_Viet_Tin_42.pdf
41	43	Công ty TNHH Thành Công 43	Công ty TNHH Thành Công 43 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Bà Rịa - Vũng Tàu. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	200 Lê Hồng Phong, Vũng Tàu, Bà Rịa - Vũng Tàu	uploads/logos/employer_043.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	7574480293	https://www.thanhcong43.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Thanh_Cong_43.pdf
42	44	Hệ thống Foody 44	Hệ thống Foody 44 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Đà Nẵng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	349 Điện Biên Phủ, Thanh Khê, Đà Nẵng	uploads/logos/employer_044.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0466407136	https://www.foody44.vn	Giay_Phep_Kinh_Doanh_He_thong_Foody_44.pdf
43	45	Công ty Cổ phần Hoàn Cầu 45	Công ty Cổ phần Hoàn Cầu 45 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Thanh Hóa. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Lễ Môn, TP. Thanh Hóa, Thanh Hóa	uploads/logos/employer_045.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	4862169666	https://www.hoancau45.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Hoan_Cau_45.pdf
44	46	Hộ kinh doanh Phát Đạt 46	Hộ kinh doanh Phát Đạt 46 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Đà Nẵng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	192 Duy Tân, Hải Châu, Đà Nẵng	uploads/logos/employer_046.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Hộ kinh doanh / Cá nhân	\N	\N	Giay_Phep_Kinh_Doanh_Ho_kinh_doanh_Phat_Dat_46.pdf
45	47	Tập đoàn Phát Đạt 47	Tập đoàn Phát Đạt 47 hoạt động trong lĩnh vực Bán lẻ với mạng lưới chi nhánh rộng khắp Bà Rịa - Vũng Tàu. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	24 Lê Hồng Phong, Vũng Tàu, Bà Rịa - Vũng Tàu	uploads/logos/employer_047.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	7582845195	https://www.phatdat47.vn	Giay_Phep_Kinh_Doanh_Tap_doan_Phat_Dat_47.pdf
46	48	Công ty TNHH Sáng Tạo Mới 48	Công ty TNHH Sáng Tạo Mới 48 hoạt động trong lĩnh vực F&B / Dịch vụ ăn uống với mạng lưới chi nhánh rộng khắp Đà Nẵng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	331 Điện Biên Phủ, Thanh Khê, Đà Nẵng	uploads/logos/employer_048.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0447282770	https://www.sangtaomoi48.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Sang_Tao_Moi_48.pdf
47	49	Hệ thống Phát Đạt 49	Hệ thống Phát Đạt 49 hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp Bà Rịa - Vũng Tàu. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	342 30 Tháng 4, Vũng Tàu, Bà Rịa - Vũng Tàu	uploads/logos/employer_049.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	7516023957	https://www.phatdat49.vn	Giay_Phep_Kinh_Doanh_He_thong_Phat_Dat_49.pdf
48	50	Hộ kinh doanh Đại Dương 50	Hộ kinh doanh Đại Dương 50 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	376 Quang Trung, Cái Răng, Cần Thơ	uploads/logos/employer_050.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Hộ kinh doanh / Cá nhân	\N	\N	Giay_Phep_Kinh_Doanh_Ho_kinh_doanh_Dai_Duong_50.pdf
49	51	Công ty TNHH Sáng Tạo Mới 51	Công ty TNHH Sáng Tạo Mới 51 hoạt động trong lĩnh vực Bán lẻ với mạng lưới chi nhánh rộng khắp Hà Nội. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	58 Giải Phóng, Hai Bà Trưng, Hà Nội	uploads/logos/employer_051.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0173414190	https://www.sangtaomoi51.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Sang_Tao_Moi_51.pdf
50	52	Hệ thống Foody 52	Hệ thống Foody 52 hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Bà Rịa - Vũng Tàu. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	157 Nguyễn Thanh Đằng, Bà Rịa, Bà Rịa - Vũng Tàu	uploads/logos/employer_052.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	7518955462	https://www.foody52.vn	Giay_Phep_Kinh_Doanh_He_thong_Foody_52.pdf
51	126	Công ty TNHH Việt Nova	Công ty TNHH Việt Nova hoạt động trong lĩnh vực Công nghệ thông tin với mạng lưới chi nhánh rộng khắp TP. Hồ Chí Minh. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	305 Quang Trung, Gò Vấp, TP. Hồ Chí Minh	uploads/logos/employer_126.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0320598884	https://www.vietnova.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Viet_Nova.pdf
52	127	Hộ kinh doanh Minh Anh	Hộ kinh doanh Minh Anh hoạt động trong lĩnh vực F&B / Dịch vụ ăn uống với mạng lưới chi nhánh rộng khắp Đà Nẵng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Hòa Khánh, Liên Chiểu, Đà Nẵng	uploads/logos/employer_127.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Hộ kinh doanh / Cá nhân	\N	\N	Giay_Phep_Kinh_Doanh_Ho_kinh_doanh_Minh_Anh.pdf
53	128	Công ty Cổ phần Phú Gia	Công ty Cổ phần Phú Gia hoạt động trong lĩnh vực Logistics / Giao nhận với mạng lưới chi nhánh rộng khắp Hải Phòng. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	KCN Tràng Duệ, An Dương, Hải Phòng	uploads/logos/employer_128.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0271709047	https://www.phugia.vn	Giay_Phep_Kinh_Doanh_Cong_ty_Co_phan_Phu_Gia.pdf
54	129	Công ty TNHH Sao Mai Foods	Công ty TNHH Sao Mai Foods hoạt động trong lĩnh vực Hàng tiêu dùng / FMCG với mạng lưới chi nhánh rộng khắp Cần Thơ. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	231 Võ Văn Kiệt, Bình Thủy, Cần Thơ	uploads/logos/employer_129.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	2651844611	https://www.saomaifoods.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Sao_Mai_Foods.pdf
55	130	Công ty TNHH Giáo dục Tri Thức	Công ty TNHH Giáo dục Tri Thức hoạt động trong lĩnh vực Giáo dục / Đào tạo với mạng lưới chi nhánh rộng khắp TP. Hồ Chí Minh. Chúng tôi thường xuyên tạo điều kiện việc làm thực tế cho sinh viên.	82 Quang Trung, Gò Vấp, TP. Hồ Chí Minh	uploads/logos/employer_130.png	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	Doanh nghiệp / Công ty	0332170351	https://www.giaoductrithuc.vn	Giay_Phep_Kinh_Doanh_Cong_ty_TNHH_Giao_duc_Tri_Thuc.pdf
56	132	Tập Đoàn Giáo Dục & Công Nghệ VLU Enterprise	Doanh nghiệp đối tác chiến lược của Đại học Văn Lang chuyên cung cấp các dự án phần mềm, truyền thông sự kiện và cơ hội việc làm bán thời gian cho sinh viên.	69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh, TP. Hồ Chí Minh	https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop	2026-11-04 04:40:56.130483	2026-11-04 04:40:56.130483	2026-11-04 04:39:03.500098	2026-11-04 04:40:56.130483	Doanh nghiệp / Công ty	0316889977	https://vlu.edu.vn/enterprise	/uploads/licenses/GPKD_VLU_ENTERPRISE_2026.pdf
57	139	công ty B	\N	\N	\N	\N	\N	2026-11-06 07:45:45.757993	2026-11-06 07:45:45.757993	\N	\N	\N	\N
\.


--
-- Data for Name: freelance_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.freelance_details (job_id, scope, deliverable_requirements, deadline, revision_limit) FROM stdin;
\.


--
-- Data for Name: freelance_proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.freelance_proposals (id, job_id, student_id, proposal_text, estimated_duration, proposed_price, status, submitted_at, updated_at) FROM stdin;
1	239	54	Em có kinh nghiệm thiết kế UI/UX trên Figma 1 năm, cam kết bàn giao đúng hạn.	7 ngày	3200000	ACCEPTED	2026-11-04 00:40:56.135382	2026-11-04 05:06:04.89453
2	239	138	abcsdfghjkl;'kjhgfdfghjklk	2 ngày	2000000	SUBMITTED	2026-11-06 07:43:44.653324	2026-11-06 07:43:44.653324
\.


--
-- Data for Name: job_saved; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_saved (id, user_id, job_id, created_at) FROM stdin;
\.


--
-- Data for Name: job_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_skills (job_id, skill_name) FROM stdin;
\.


--
-- Data for Name: job_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_views (id, job_id, viewer_id, viewed_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, employer_id, title, description, requirements, category, location, salary_type, salary, work_type, status, moderation_status, created_at, updated_at, benefits, experience, education, headcount, level, deadline, work_schedule, banner_url, work_address, latitude, longitude, application_deadline, job_banner_url, moderation_reason) FROM stdin;
101	19	Thực tập sinh Back-end (NodeJS)	Mô tả công việc: Viết truy vấn MySQL/MongoDB và tài liệu API cho nhóm; hỗ trợ xây dựng và kiểm thử các REST API bằng NodeJS/Express. Làm việc khoảng 24h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Hiểu REST API và SQL cơ bản; biết dùng Git; biết JavaScript cơ bản, đã làm bài tập hoặc đồ án với NodeJS.	Công nghệ thông tin	313 Võ Thị Sáu, Biên Hòa, Đồng Nai	HOURLY	33000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-09-18 17:00:00+00	2026-09-29 10:07:07+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-07 00:00:00	uploads/banners/job_101.jpg	\N
102	40	Nhân viên Kiểm tra chất lượng (QC) part-time	Mô tả công việc: Kiểm tra ngoại quan và kích thước sản phẩm theo tiêu chuẩn của xưởng; báo cáo kết quả kiểm tra cuối ca. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Tuân thủ quy định an toàn lao động; tỉ mỉ, có mắt quan sát tốt.	Sản xuất / Kỹ thuật	367 Trần Hưng Đạo, Ninh Kiều, Cần Thơ	MONTHLY	5000000.00	Ca chiều (13h-17h)	FILLED	APPROVED	2026-09-22 17:00:00+00	2026-10-04 08:03:05+00	Phụ cấp ca, hỗ trợ cơm ca.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-14 00:00:00	uploads/banners/job_102.jpg	\N
103	14	Cộng tác viên Tester (Manual)	Mô tả công việc: Báo cáo kết quả kiểm thử hằng tuần cho trưởng nhóm; thực hiện kiểm thử thủ công theo test case và ghi nhận lỗi. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT; hiểu quy trình kiểm thử phần mềm cơ bản.	Công nghệ thông tin	356 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh	HOURLY	29000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-09-05 17:00:00+00	2026-09-22 12:34:29+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-23 00:00:00	uploads/banners/job_103.jpg	\N
104	38	Kiểm kho part-time	Mô tả công việc: Ghi nhận chênh lệch và báo cáo cho thủ kho; sắp xếp hàng theo vị trí, hỗ trợ kiểm kê định kỳ. Làm việc khoảng 16h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Sức khỏe tốt, có thể bê vác nhẹ; có thể làm việc theo ca đã đăng ký.	Logistics / Giao nhận	274 Nguyễn Thanh Đằng, Bà Rịa, Bà Rịa - Vũng Tàu	MONTHLY	3000000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-09-18 17:00:00+00	2026-10-03 08:48:42+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-12 00:00:00	uploads/banners/job_104.jpg	\N
105	28	Cộng tác viên Tester (Manual)	Mô tả công việc: Báo cáo kết quả kiểm thử hằng tuần cho trưởng nhóm; thực hiện kiểm thử thủ công theo test case và ghi nhận lỗi. Làm việc khoảng 20h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Hiểu quy trình kiểm thử phần mềm cơ bản; đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT.	Công nghệ thông tin	354 Quốc lộ 1K, Dĩ An, Bình Dương	MONTHLY	5000000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-09-13 17:00:00+00	2026-09-28 11:37:09+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-05 00:00:00	uploads/banners/job_105.jpg	\N
106	36	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Kiểm tra hạn dùng, bổ sung hàng lên kệ và vệ sinh khu vực trưng bày; trưng bày sản phẩm theo sơ đồ (planogram) của nhãn hàng. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Sức khỏe tốt, đứng được nhiều giờ; cẩn thận, có mắt thẩm mỹ.	Hàng tiêu dùng / FMCG	353 Hải Thượng Lãn Ông, TP. Thanh Hóa, Thanh Hóa	MONTHLY	4000000.00	Ca chiều (13h-17h)	COMPLETED	APPROVED	2026-08-10 17:00:00+00	2026-09-20 01:43:41+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-30 00:00:00	uploads/banners/job_106.jpg	\N
107	45	Cộng tác viên Bán hàng	Mô tả công việc: Hỗ trợ trưng bày, kiểm tra tồn kho và ghi nhận doanh số; giới thiệu và tư vấn sản phẩm cho khách tại cửa hàng/điểm bán. Làm việc khoảng 16h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Ưu tiên bạn từng làm bán hàng hoặc cộng tác viên; có thể làm việc cuối tuần.	Hàng tiêu dùng / FMCG	355 Trần Phú, TP. Thanh Hóa, Thanh Hóa	MONTHLY	5000000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-09-19 17:00:00+00	2026-10-05 21:22:47+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-13 00:00:00	uploads/banners/job_107.jpg	\N
108	11	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Kiểm tra hạn dùng, bổ sung hàng lên kệ và vệ sinh khu vực trưng bày; trưng bày sản phẩm theo sơ đồ (planogram) của nhãn hàng. Làm việc khoảng 18h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Sức khỏe tốt, đứng được nhiều giờ; có thể làm việc theo ca đã đăng ký.	Bán lẻ	295 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh	MONTHLY	7000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-03 17:00:00+00	2026-10-04 04:39:26+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-05 00:00:00	uploads/banners/job_108.jpg	\N
109	44	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Ghi nhận tình trạng kệ hàng và báo cáo cho giám sát; kiểm tra hạn dùng, bổ sung hàng lên kệ và vệ sinh khu vực trưng bày. Làm việc khoảng 15h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận, có mắt thẩm mỹ; có thể làm việc theo ca đã đăng ký.	Hàng tiêu dùng / FMCG	266 Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng	MONTHLY	7000000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-21 17:00:00+00	2026-10-22 07:43:08+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-12 00:00:00	uploads/banners/job_109.jpg	\N
110	17	Data Entry part-time	Mô tả công việc: Nhập liệu, chuẩn hóa và đối soát dữ liệu trên bảng tính; cập nhật thông tin khách hàng/đơn hàng vào hệ thống nội bộ. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Cẩn thận, trung thực, giữ bảo mật dữ liệu; gõ máy nhanh, chính xác; dùng thành thạo Excel/Google Sheets.	Công nghệ thông tin	223 Tô Hiệu, Lê Chân, Hải Phòng	MONTHLY	7000000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-13 17:00:00+00	2026-10-14 05:08:35+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-09 00:00:00	uploads/banners/job_110.jpg	\N
111	19	Thực tập sinh Front-end (ReactJS)	Mô tả công việc: Chuyển wireframe thành component và kiểm tra hiển thị trên nhiều kích thước màn hình; hỗ trợ dựng giao diện web bằng ReactJS theo thiết kế Figma. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Biết HTML, CSS, JavaScript; đã làm project nhỏ bằng React; biết dùng Git; đọc được tài liệu tiếng Anh cơ bản.	Công nghệ thông tin	140 Phạm Văn Thuận, Biên Hòa, Đồng Nai	MONTHLY	4000000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-21 17:00:00+00	2026-10-22 06:51:47+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-19 00:00:00	uploads/banners/job_111.jpg	\N
112	32	Phân loại hàng hóa	Mô tả công việc: Phân loại hàng theo tuyến/khu vực dựa trên mã vận đơn; quét mã và cập nhật trạng thái kiện hàng. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Sức khỏe tốt, chịu được áp lực giờ cao điểm; có thể làm việc cuối tuần/ngày lễ nếu cần.	Logistics / Giao nhận	KCN VSIP 1, Thuận An, Bình Dương	MONTHLY	3000000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-08-24 17:00:00+00	2026-10-01 01:54:23+00	Phụ cấp ca đêm/cuối tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-22 00:00:00	uploads/banners/job_112.jpg	\N
113	18	Tư vấn viên Telesales	Mô tả công việc: Hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh; gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn. Làm việc khoảng 15h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc theo ca đã đăng ký; kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm.	Hàng tiêu dùng / FMCG	260 Láng Hạ, Đống Đa, Hà Nội	HOURLY	26000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-07-30 17:00:00+00	2026-08-26 11:22:05+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-23 00:00:00	uploads/banners/job_113.jpg	\N
114	51	Cộng tác viên Bán hàng	Mô tả công việc: Chăm sóc khách hàng, xử lý thắc mắc cơ bản; hỗ trợ trưng bày, kiểm tra tồn kho và ghi nhận doanh số. Làm việc khoảng 12h/tuần, ca chiều (13h-17h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Ưu tiên bạn từng làm bán hàng hoặc cộng tác viên; có thể làm việc cuối tuần.	Bán lẻ	345 Cầu Giấy, Cầu Giấy, Hà Nội	HOURLY	37000.00	Ca chiều (13h-17h)	FILLED	APPROVED	2026-09-12 17:00:00+00	2026-10-06 01:35:21+00	Được giảm giá khi mua sắm tại hệ thống.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-10 00:00:00	uploads/banners/job_114.jpg	\N
115	43	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Ghi nhận tình trạng kệ hàng và báo cáo cho giám sát; kiểm tra hạn dùng, bổ sung hàng lên kệ và vệ sinh khu vực trưng bày. Làm việc khoảng 16h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Sức khỏe tốt, đứng được nhiều giờ; cẩn thận, có mắt thẩm mỹ.	Hàng tiêu dùng / FMCG	286 Nguyễn Thanh Đằng, Bà Rịa, Bà Rịa - Vũng Tàu	HOURLY	24000.00	Ca làm linh hoạt theo lịch học của sinh viên	CLOSED	APPROVED	2026-09-06 17:00:00+00	2026-09-18 18:43:44+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-03 00:00:00	uploads/banners/job_115.jpg	\N
116	5	Cộng tác viên Tester (Manual)	Mô tả công việc: Thực hiện kiểm thử thủ công theo test case và ghi nhận lỗi; báo cáo kết quả kiểm thử hằng tuần cho trưởng nhóm. Làm việc khoảng 20h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Cẩn thận, tư duy logic; biết dùng Excel hoặc công cụ quản lý lỗi; hiểu quy trình kiểm thử phần mềm cơ bản.	Công nghệ thông tin	145 Võ Văn Kiệt, Bình Thủy, Cần Thơ	MONTHLY	4000000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-08-20 17:00:00+00	2026-09-15 05:07:14+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-12 00:00:00	uploads/banners/job_116.jpg	\N
117	31	Cộng tác viên Tuyển sinh	Mô tả công việc: Giới thiệu chương trình đào tạo và tư vấn cho phụ huynh/học viên; thu thập thông tin quan tâm và cập nhật danh sách tư vấn. Làm việc khoảng 16h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Ưu tiên sinh viên ngành giáo dục, truyền thông; giao tiếp tốt, thân thiện, tác phong lịch sự.	Giáo dục / Đào tạo	132 Lê Hồng Phong, Hải An, Hải Phòng	HOURLY	31000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-08-17 17:00:00+00	2026-09-13 10:46:38+00	Được đào tạo nghiệp vụ, cấp xác nhận làm việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-01 00:00:00	uploads/banners/job_117.jpg	\N
118	38	Kiểm kho part-time	Mô tả công việc: Kiểm đếm hàng hóa, đối chiếu số liệu với phiếu nhập – xuất; sắp xếp hàng theo vị trí, hỗ trợ kiểm kê định kỳ. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Sức khỏe tốt, có thể bê vác nhẹ; có thể làm việc theo ca đã đăng ký.	Logistics / Giao nhận	222 Lê Hồng Phong, Vũng Tàu, Bà Rịa - Vũng Tàu	HOURLY	30000.00	Ca tối (18h-22h)	OPEN	APPROVED	2026-10-11 17:00:00+00	2026-10-12 05:15:35+00	Thanh toán lương đúng hạn.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-20 00:00:00	uploads/banners/job_118.jpg	\N
119	46	Tư vấn viên Telesales	Mô tả công việc: Ghi nhận nhu cầu và cập nhật kết quả cuộc gọi vào hệ thống; hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh. Làm việc khoảng 24h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc theo ca đã đăng ký; kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm.	Hàng tiêu dùng / FMCG	213 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng	HOURLY	33000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-07-30 17:00:00+00	2026-09-04 19:53:39+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-22 00:00:00	uploads/banners/job_119.jpg	\N
120	48	Nhân viên Bếp part-time	Mô tả công việc: Sơ chế nguyên liệu và hỗ trợ đầu bếp chế biến món theo thực đơn; giữ vệ sinh khu bếp, dụng cụ và kiểm tra hạn dùng nguyên liệu. Làm việc khoảng 16h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Ưu tiên bạn từng làm bếp hoặc phụ bếp; nhanh nhẹn, tuân thủ quy định vệ sinh an toàn thực phẩm.	F&B / Dịch vụ ăn uống	345 Duy Tân, Hải Châu, Đà Nẵng	HOURLY	42000.00	Ca sáng (8h-12h)	COMPLETED	APPROVED	2026-08-28 17:00:00+00	2026-09-29 12:12:54+00	Hỗ trợ cơm ca và đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-16 00:00:00	uploads/banners/job_120.jpg	\N
121	46	Khảo sát thị trường cuối tuần	Mô tả công việc: Thực hiện khảo sát khách hàng tại điểm bán/khu vực được giao; nhập kết quả khảo sát và gửi báo cáo cuối ngày. Làm việc khoảng 18h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Trung thực khi ghi nhận số liệu; giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms.	Hàng tiêu dùng / FMCG	35 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng	MONTHLY	5000000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-09-22 17:00:00+00	2026-10-21 12:16:24+00	Môi trường năng động, có cơ hội lên giám sát.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-20 00:00:00	uploads/banners/job_121.jpg	\N
122	49	Hỗ trợ Kỹ thuật IT Helpdesk	Mô tả công việc: Cài đặt phần mềm, cấp tài khoản và hướng dẫn người dùng nội bộ; tiếp nhận yêu cầu hỗ trợ và xử lý sự cố máy tính, mạng cơ bản. Làm việc khoảng 20h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Ưu tiên sinh viên ngành CNTT, Mạng máy tính; giao tiếp tốt, kiên nhẫn với người dùng.	Công nghệ thông tin	KCN Đông Xuyên, Vũng Tàu, Bà Rịa - Vũng Tàu	MONTHLY	6000000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-10-02 17:00:00+00	2026-10-19 02:37:39+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-18 00:00:00	uploads/banners/job_122.jpg	\N
123	46	Cộng tác viên Bán hàng	Mô tả công việc: Giới thiệu và tư vấn sản phẩm cho khách tại cửa hàng/điểm bán; chăm sóc khách hàng, xử lý thắc mắc cơ bản. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giao tiếp tốt, nhanh nhẹn, thân thiện; có thể làm việc cuối tuần.	Hàng tiêu dùng / FMCG	134 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng	HOURLY	29000.00	Ca tối (18h-22h)	COMPLETED	APPROVED	2026-08-21 17:00:00+00	2026-10-05 09:08:39+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-05 00:00:00	uploads/banners/job_123.jpg	\N
124	32	Phân loại hàng hóa	Mô tả công việc: Hỗ trợ sắp xếp hàng lên xe giao; quét mã và cập nhật trạng thái kiện hàng. Làm việc khoảng 12h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Có thể làm việc cuối tuần/ngày lễ nếu cần; sức khỏe tốt, chịu được áp lực giờ cao điểm.	Logistics / Giao nhận	KCN Mỹ Phước 2, Bến Cát, Bình Dương	HOURLY	31000.00	Ca tối (18h-22h)	COMPLETED	APPROVED	2026-08-24 17:00:00+00	2026-10-01 01:58:26+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-14 00:00:00	uploads/banners/job_124.jpg	\N
125	34	Hỗ trợ Kỹ thuật IT Helpdesk	Mô tả công việc: Cài đặt phần mềm, cấp tài khoản và hướng dẫn người dùng nội bộ; tiếp nhận yêu cầu hỗ trợ và xử lý sự cố máy tính, mạng cơ bản. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Biết cài đặt Windows, phần mềm văn phòng; hiểu mạng LAN/Wi-Fi cơ bản; giao tiếp tốt, kiên nhẫn với người dùng.	Công nghệ thông tin	267 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh	HOURLY	44000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-09 17:00:00+00	2026-10-10 04:37:59+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-01 00:00:00	uploads/banners/job_125.jpg	\N
126	43	Khảo sát thị trường cuối tuần	Mô tả công việc: Ghi nhận phản hồi, giá bán và hoạt động của đối thủ; nhập kết quả khảo sát và gửi báo cáo cuối ngày. Làm việc khoảng 12h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms; trung thực khi ghi nhận số liệu.	Hàng tiêu dùng / FMCG	102 Trần Phú, Vũng Tàu, Bà Rịa - Vũng Tàu	HOURLY	35000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-22 17:00:00+00	2026-10-23 06:41:50+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-08 00:00:00	uploads/banners/job_126.jpg	\N
127	9	Pha chế (Barista) ca tối	Mô tả công việc: Vệ sinh máy móc, dụng cụ và kiểm kê nguyên liệu cuối ca; pha chế đồ uống theo công thức của quán. Làm việc khoảng 20h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Trung thực, tác phong chuyên nghiệp; yêu thích pha chế; có kinh nghiệm là lợi thế.	F&B / Dịch vụ ăn uống	109 Tô Hiệu, Lê Chân, Hải Phòng	MONTHLY	4000000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-05 17:00:00+00	2026-10-06 06:14:52+00	Lịch làm linh hoạt, ưu tiên sinh viên.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-17 00:00:00	uploads/banners/job_127.jpg	\N
128	28	Thực tập sinh Front-end (ReactJS)	Mô tả công việc: Chuyển wireframe thành component và kiểm tra hiển thị trên nhiều kích thước màn hình; hỗ trợ dựng giao diện web bằng ReactJS theo thiết kế Figma. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Cẩn thận với chi tiết giao diện; ưu tiên có portfolio trên GitHub; biết dùng Git; đọc được tài liệu tiếng Anh cơ bản.	Công nghệ thông tin	275 Huỳnh Văn Lũy, Thủ Dầu Một, Bình Dương	HOURLY	37000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-13 17:00:00+00	2026-10-14 05:07:07+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-05 00:00:00	uploads/banners/job_128.jpg	\N
129	21	Khảo sát thị trường cuối tuần	Mô tả công việc: Thực hiện khảo sát khách hàng tại điểm bán/khu vực được giao; ghi nhận phản hồi, giá bán và hoạt động của đối thủ. Làm việc khoảng 20h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms; làm việc được vào cuối tuần.	Hàng tiêu dùng / FMCG	168 Hải Thượng Lãn Ông, TP. Thanh Hóa, Thanh Hóa	HOURLY	45000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-07-26 17:00:00+00	2026-08-19 19:51:28+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-13 00:00:00	uploads/banners/job_129.jpg	\N
130	44	Tư vấn viên Telesales	Mô tả công việc: Ghi nhận nhu cầu và cập nhật kết quả cuộc gọi vào hệ thống; hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh. Làm việc khoảng 24h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Có thể làm việc theo ca đã đăng ký; giọng nói rõ ràng, tự tin giao tiếp qua điện thoại.	Hàng tiêu dùng / FMCG	347 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng	HOURLY	49000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-09-01 17:00:00+00	2026-09-24 23:14:11+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-19 00:00:00	uploads/banners/job_130.jpg	\N
131	40	Nhập liệu sản xuất part-time	Mô tả công việc: Nhập số liệu sản lượng, phế phẩm và tồn kho vào bảng theo dõi; tổng hợp báo cáo ca gửi quản lý. Làm việc khoảng 15h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Gõ máy nhanh, dùng tốt Excel; có thể làm đúng ca đăng ký.	Sản xuất / Kỹ thuật	KCN Trà Nóc, Bình Thủy, Cần Thơ	MONTHLY	3000000.00	Ca tối (18h-22h)	CLOSED	APPROVED	2026-09-23 17:00:00+00	2026-10-04 07:21:58+00	Được trang bị bảo hộ lao động và đào tạo an toàn.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-08 00:00:00	uploads/banners/job_131.jpg	\N
132	50	Cộng tác viên Bán hàng	Mô tả công việc: Chăm sóc khách hàng, xử lý thắc mắc cơ bản; hỗ trợ trưng bày, kiểm tra tồn kho và ghi nhận doanh số. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc cuối tuần; giao tiếp tốt, nhanh nhẹn, thân thiện.	Hàng tiêu dùng / FMCG	273 30 Tháng 4, Ninh Kiều, Cần Thơ	HOURLY	32000.00	Ca tối (18h-22h)	COMPLETED	APPROVED	2026-08-19 17:00:00+00	2026-10-07 23:41:26+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-15 00:00:00	uploads/banners/job_132.jpg	\N
133	6	Nhân viên Kiểm tra chất lượng (QC) part-time	Mô tả công việc: Kiểm tra ngoại quan và kích thước sản phẩm theo tiêu chuẩn của xưởng; ghi nhận lỗi, phân loại sản phẩm đạt/không đạt. Làm việc khoảng 12h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Tuân thủ quy định an toàn lao động; đọc được bản vẽ/tiêu chuẩn đơn giản; ưu tiên sinh viên ngành kỹ thuật.	Sản xuất / Kỹ thuật	KCN Amata, Biên Hòa, Đồng Nai	HOURLY	37000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-08-08 17:00:00+00	2026-09-23 09:18:22+00	Cơ hội học hỏi quy trình sản xuất thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-31 00:00:00	uploads/banners/job_133.jpg	\N
134	40	Trợ lý kỹ thuật part-time	Mô tả công việc: Hỗ trợ kỹ sư kiểm tra thiết bị và ghi nhận thông số vận hành; chuẩn bị vật tư, dụng cụ cho ca bảo trì. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận, tuân thủ quy định an toàn lao động; biết dùng Excel cơ bản.	Sản xuất / Kỹ thuật	KCN Hưng Phú, Cái Răng, Cần Thơ	HOURLY	44000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-29 17:00:00+00	2026-10-30 04:29:09+00	Cơ hội học hỏi quy trình sản xuất thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-20 00:00:00	uploads/banners/job_134.jpg	\N
135	51	Khảo sát thị trường cuối tuần	Mô tả công việc: Ghi nhận phản hồi, giá bán và hoạt động của đối thủ; thực hiện khảo sát khách hàng tại điểm bán/khu vực được giao. Làm việc khoảng 16h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms; trung thực khi ghi nhận số liệu.	Bán lẻ	110 Giải Phóng, Hai Bà Trưng, Hà Nội	HOURLY	34000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-21 17:00:00+00	2026-10-22 03:04:35+00	Được giảm giá khi mua sắm tại hệ thống.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-02 00:00:00	uploads/banners/job_135.jpg	\N
136	23	Trợ giảng cuối tuần	Mô tả công việc: Hướng dẫn học viên làm bài tập, chấm bài trắc nghiệm; chuẩn bị phòng học và dụng cụ cho buổi dạy. Làm việc khoảng 12h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Kiên nhẫn, yêu việc giảng dạy; làm việc ổn định vào cuối tuần.	Giáo dục / Đào tạo	221 Võ Văn Kiệt, Bình Thủy, Cần Thơ	HOURLY	34000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-08-10 17:00:00+00	2026-09-08 20:50:15+00	Được đào tạo nghiệp vụ, cấp xác nhận làm việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-27 00:00:00	uploads/banners/job_136.jpg	\N
137	40	Trợ lý kỹ thuật part-time	Mô tả công việc: Cập nhật sổ theo dõi và tài liệu kỹ thuật; hỗ trợ kỹ sư kiểm tra thiết bị và ghi nhận thông số vận hành. Làm việc khoảng 15h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Biết dùng Excel cơ bản; sinh viên ngành kỹ thuật (cơ khí, điện, ô tô…) hoặc có kiến thức nền.	Sản xuất / Kỹ thuật	KCN Hưng Phú, Cái Răng, Cần Thơ	HOURLY	37000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-09-23 17:00:00+00	2026-10-03 13:07:45+00	Được trang bị bảo hộ lao động và đào tạo an toàn.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-19 00:00:00	uploads/banners/job_137.jpg	\N
138	11	Cộng tác viên Bán hàng	Mô tả công việc: Giới thiệu và tư vấn sản phẩm cho khách tại cửa hàng/điểm bán; chăm sóc khách hàng, xử lý thắc mắc cơ bản. Làm việc khoảng 18h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc cuối tuần; ưu tiên bạn từng làm bán hàng hoặc cộng tác viên.	Bán lẻ	134 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh	HOURLY	44000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-10-03 17:00:00+00	2026-10-12 15:22:48+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-22 00:00:00	uploads/banners/job_138.jpg	\N
139	45	Tư vấn viên Telesales	Mô tả công việc: Gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn; hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh. Làm việc khoảng 12h/tuần, ca chiều (13h-17h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm; giọng nói rõ ràng, tự tin giao tiếp qua điện thoại.	Hàng tiêu dùng / FMCG	275 Quang Trung, TP. Thanh Hóa, Thanh Hóa	HOURLY	48000.00	Ca chiều (13h-17h)	COMPLETED	APPROVED	2026-08-26 17:00:00+00	2026-10-06 15:40:43+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-19 00:00:00	uploads/banners/job_139.jpg	\N
140	38	Nhân viên Soạn hàng ca đêm	Mô tả công việc: Soạn hàng theo đơn, kiểm tra số lượng và quy cách; dán nhãn, xếp hàng lên pallet và bàn giao cho khâu vận chuyển. Làm việc khoảng 24h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Tuân thủ nội quy kho; nhanh nhẹn, cẩn thận.	Logistics / Giao nhận	195 Nguyễn Thanh Đằng, Bà Rịa, Bà Rịa - Vũng Tàu	HOURLY	29000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-09-02 17:00:00+00	2026-09-20 12:16:29+00	Thanh toán lương đúng hạn.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-19 00:00:00	uploads/banners/job_140.jpg	\N
141	30	Nhập liệu sản xuất part-time	Mô tả công việc: Nhập số liệu sản lượng, phế phẩm và tồn kho vào bảng theo dõi; tổng hợp báo cáo ca gửi quản lý. Làm việc khoảng 20h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Có thể làm đúng ca đăng ký; gõ máy nhanh, dùng tốt Excel.	Sản xuất / Kỹ thuật	81 Nguyễn Ái Quốc, Biên Hòa, Đồng Nai	HOURLY	33000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-20 17:00:00+00	2026-10-21 05:29:03+00	Được trang bị bảo hộ lao động và đào tạo an toàn.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-23 00:00:00	uploads/banners/job_141.jpg	\N
142	32	Phân loại hàng hóa	Mô tả công việc: Hỗ trợ sắp xếp hàng lên xe giao; quét mã và cập nhật trạng thái kiện hàng. Làm việc khoảng 20h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Sức khỏe tốt, chịu được áp lực giờ cao điểm; đọc hiểu mã/địa chỉ nhanh, chính xác.	Logistics / Giao nhận	KCN Sóng Thần, Dĩ An, Bình Dương	HOURLY	25000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-03 17:00:00+00	2026-10-04 06:06:52+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-06 00:00:00	uploads/banners/job_142.jpg	\N
143	37	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Ghi nhận tình trạng kệ hàng và báo cáo cho giám sát; trưng bày sản phẩm theo sơ đồ (planogram) của nhãn hàng. Làm việc khoảng 20h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Sức khỏe tốt, đứng được nhiều giờ; có thể làm việc theo ca đã đăng ký.	Bán lẻ	379 Quốc lộ 1K, Dĩ An, Bình Dương	HOURLY	43000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-24 17:00:00+00	2026-10-25 06:42:27+00	Được giảm giá khi mua sắm tại hệ thống.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-24 00:00:00	uploads/banners/job_143.jpg	\N
144	38	Phân loại hàng hóa	Mô tả công việc: Hỗ trợ sắp xếp hàng lên xe giao; phân loại hàng theo tuyến/khu vực dựa trên mã vận đơn. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Sức khỏe tốt, chịu được áp lực giờ cao điểm; đọc hiểu mã/địa chỉ nhanh, chính xác.	Logistics / Giao nhận	KCN Đông Xuyên, Vũng Tàu, Bà Rịa - Vũng Tàu	HOURLY	34000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-27 17:00:00+00	2026-10-28 05:33:51+00	Phụ cấp ca đêm/cuối tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-23 00:00:00	uploads/banners/job_144.jpg	\N
145	44	Tư vấn viên Telesales	Mô tả công việc: Ghi nhận nhu cầu và cập nhật kết quả cuộc gọi vào hệ thống; hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh. Làm việc khoảng 20h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Giọng nói rõ ràng, tự tin giao tiếp qua điện thoại; có thể làm việc theo ca đã đăng ký.	Hàng tiêu dùng / FMCG	98 Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng	HOURLY	28000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-10 17:00:00+00	2026-10-11 05:45:17+00	Môi trường năng động, có cơ hội lên giám sát.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-30 00:00:00	uploads/banners/job_145.jpg	\N
146	37	Cộng tác viên Bán hàng	Mô tả công việc: Chăm sóc khách hàng, xử lý thắc mắc cơ bản; giới thiệu và tư vấn sản phẩm cho khách tại cửa hàng/điểm bán. Làm việc khoảng 20h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giao tiếp tốt, nhanh nhẹn, thân thiện; ưu tiên bạn từng làm bán hàng hoặc cộng tác viên.	Bán lẻ	131 Huỳnh Văn Lũy, Thủ Dầu Một, Bình Dương	HOURLY	34000.00	Ca sáng (8h-12h)	COMPLETED	APPROVED	2026-08-13 17:00:00+00	2026-09-25 00:08:10+00	Được giảm giá khi mua sắm tại hệ thống.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-08 00:00:00	uploads/banners/job_146.jpg	\N
147	48	Giao hàng (Shipper) đồ ăn	Mô tả công việc: Nhận đơn và giao đồ ăn cho khách trong khu vực được phân công; kiểm tra đơn, đóng gói đúng quy định và xác nhận giao hàng trên ứng dụng. Làm việc khoảng 15h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Tuân thủ luật giao thông và quy định an toàn thực phẩm; trung thực, đúng giờ; có điện thoại cài ứng dụng.	F&B / Dịch vụ ăn uống	188 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng	MONTHLY	4000000.00	Ca tối (18h-22h)	OPEN	APPROVED	2026-10-13 17:00:00+00	2026-10-14 05:39:14+00	Lịch làm linh hoạt, ưu tiên sinh viên.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-28 00:00:00	uploads/banners/job_147.jpg	\N
148	18	Khảo sát thị trường cuối tuần	Mô tả công việc: Nhập kết quả khảo sát và gửi báo cáo cuối ngày; ghi nhận phản hồi, giá bán và hoạt động của đối thủ. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Trung thực khi ghi nhận số liệu; giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms.	Hàng tiêu dùng / FMCG	220 Phạm Hùng, Nam Từ Liêm, Hà Nội	HOURLY	21000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-24 17:00:00+00	2026-10-25 08:21:38+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-21 00:00:00	uploads/banners/job_148.jpg	\N
149	39	Trợ lý kỹ thuật part-time	Mô tả công việc: Chuẩn bị vật tư, dụng cụ cho ca bảo trì; cập nhật sổ theo dõi và tài liệu kỹ thuật. Làm việc khoảng 15h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Biết dùng Excel cơ bản; cẩn thận, tuân thủ quy định an toàn lao động.	Sản xuất / Kỹ thuật	KCN Hưng Phú, Cái Răng, Cần Thơ	MONTHLY	3000000.00	Ca sáng (8h-12h)	COMPLETED	APPROVED	2026-08-09 17:00:00+00	2026-08-26 21:41:03+00	Cơ hội học hỏi quy trình sản xuất thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-07 00:00:00	uploads/banners/job_149.jpg	\N
150	39	Nhân viên Đóng gói sản phẩm	Mô tả công việc: Kiểm tra số lượng, ngoại quan trước khi bàn giao; giữ gọn gàng khu vực đóng gói. Làm việc khoảng 16h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Sức khỏe tốt, đứng làm việc được nhiều giờ; tuân thủ nội quy an toàn của xưởng.	Sản xuất / Kỹ thuật	KCN Trà Nóc, Bình Thủy, Cần Thơ	HOURLY	43000.00	Ca sáng (8h-12h)	COMPLETED	APPROVED	2026-08-16 17:00:00+00	2026-09-13 19:55:45+00	Cơ hội học hỏi quy trình sản xuất thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-03 00:00:00	uploads/banners/job_150.jpg	\N
151	19	Thực tập sinh Front-end (ReactJS)	Mô tả công việc: Hỗ trợ dựng giao diện web bằng ReactJS theo thiết kế Figma; kết nối giao diện với API và sửa lỗi hiển thị. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận với chi tiết giao diện; ưu tiên có portfolio trên GitHub; biết HTML, CSS, JavaScript; đã làm project nhỏ bằng React.	Công nghệ thông tin	255 Phạm Văn Thuận, Biên Hòa, Đồng Nai	MONTHLY	4000000.00	Ca chiều (13h-17h)	COMPLETED	APPROVED	2026-08-02 17:00:00+00	2026-08-30 18:40:51+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-31 00:00:00	uploads/banners/job_151.jpg	\N
152	6	Nhân viên Đóng gói sản phẩm	Mô tả công việc: Kiểm tra số lượng, ngoại quan trước khi bàn giao; đóng gói thành phẩm theo quy cách, dán nhãn và xếp thùng. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Tuân thủ nội quy an toàn của xưởng; sức khỏe tốt, đứng làm việc được nhiều giờ.	Sản xuất / Kỹ thuật	KCN Amata, Biên Hòa, Đồng Nai	HOURLY	32000.00	Ca sáng (8h-12h)	CLOSED	APPROVED	2026-09-26 17:00:00+00	2026-10-13 13:04:28+00	Được trang bị bảo hộ lao động và đào tạo an toàn.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-16 00:00:00	uploads/banners/job_152.jpg	\N
153	42	Phân loại hàng hóa	Mô tả công việc: Hỗ trợ sắp xếp hàng lên xe giao; phân loại hàng theo tuyến/khu vực dựa trên mã vận đơn. Làm việc khoảng 20h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Sức khỏe tốt, chịu được áp lực giờ cao điểm; đọc hiểu mã/địa chỉ nhanh, chính xác.	Logistics / Giao nhận	KCN Hòa Khánh, Liên Chiểu, Đà Nẵng	MONTHLY	3000000.00	Ca chiều (13h-17h)	FILLED	APPROVED	2026-09-20 17:00:00+00	2026-10-08 06:04:24+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-13 00:00:00	uploads/banners/job_153.jpg	\N
154	5	Data Entry part-time	Mô tả công việc: Nhập liệu, chuẩn hóa và đối soát dữ liệu trên bảng tính; kiểm tra lỗi dữ liệu và báo cáo cuối ca. Làm việc khoảng 18h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Gõ máy nhanh, chính xác; dùng thành thạo Excel/Google Sheets; cẩn thận, trung thực, giữ bảo mật dữ liệu.	Công nghệ thông tin	160 Trần Hưng Đạo, Ninh Kiều, Cần Thơ	HOURLY	42000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-20 17:00:00+00	2026-10-21 04:08:33+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-30 00:00:00	uploads/banners/job_154.jpg	\N
155	4	Hỗ trợ Kỹ thuật IT Helpdesk	Mô tả công việc: Tiếp nhận yêu cầu hỗ trợ và xử lý sự cố máy tính, mạng cơ bản; cài đặt phần mềm, cấp tài khoản và hướng dẫn người dùng nội bộ. Làm việc khoảng 24h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Biết cài đặt Windows, phần mềm văn phòng; hiểu mạng LAN/Wi-Fi cơ bản; ưu tiên sinh viên ngành CNTT, Mạng máy tính.	Công nghệ thông tin	189 Quốc lộ 1K, Dĩ An, Bình Dương	HOURLY	38000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-09-30 17:00:00+00	2026-10-21 19:17:45+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-18 00:00:00	uploads/banners/job_155.jpg	\N
156	34	Hỗ trợ Kỹ thuật IT Helpdesk	Mô tả công việc: Cài đặt phần mềm, cấp tài khoản và hướng dẫn người dùng nội bộ; tiếp nhận yêu cầu hỗ trợ và xử lý sự cố máy tính, mạng cơ bản. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Biết cài đặt Windows, phần mềm văn phòng; hiểu mạng LAN/Wi-Fi cơ bản; giao tiếp tốt, kiên nhẫn với người dùng.	Công nghệ thông tin	100 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh	HOURLY	43000.00	Ca tối (18h-22h)	OPEN	APPROVED	2026-10-22 17:00:00+00	2026-10-23 04:13:25+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-28 00:00:00	uploads/banners/job_156.jpg	\N
157	42	Kiểm kho part-time	Mô tả công việc: Sắp xếp hàng theo vị trí, hỗ trợ kiểm kê định kỳ; kiểm đếm hàng hóa, đối chiếu số liệu với phiếu nhập – xuất. Làm việc khoảng 16h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Cẩn thận, trung thực; biết dùng Excel cơ bản; có thể làm việc theo ca đã đăng ký.	Logistics / Giao nhận	KCN Hòa Khánh, Liên Chiểu, Đà Nẵng	MONTHLY	4000000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-09-01 17:00:00+00	2026-10-03 01:08:10+00	Phụ cấp ca đêm/cuối tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-22 00:00:00	uploads/banners/job_157.jpg	\N
158	16	Cộng tác viên Tester (Manual)	Mô tả công việc: Viết test case cho tính năng mới và kiểm tra lại lỗi sau khi sửa; báo cáo kết quả kiểm thử hằng tuần cho trưởng nhóm. Làm việc khoảng 15h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận, tư duy logic; biết dùng Excel hoặc công cụ quản lý lỗi; đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT.	Công nghệ thông tin	207 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ	HOURLY	41000.00	Ca sáng (8h-12h)	CLOSED	APPROVED	2026-09-23 17:00:00+00	2026-10-08 17:24:33+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-09 00:00:00	uploads/banners/job_158.jpg	\N
159	50	Tư vấn viên Telesales	Mô tả công việc: Ghi nhận nhu cầu và cập nhật kết quả cuộc gọi vào hệ thống; hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh. Làm việc khoảng 20h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Giọng nói rõ ràng, tự tin giao tiếp qua điện thoại; có thể làm việc theo ca đã đăng ký.	Hàng tiêu dùng / FMCG	28 Trần Hưng Đạo, Ninh Kiều, Cần Thơ	MONTHLY	3000000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-08-23 17:00:00+00	2026-09-26 11:02:16+00	Môi trường năng động, có cơ hội lên giám sát.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-09 00:00:00	uploads/banners/job_159.jpg	\N
160	6	Trợ lý kỹ thuật part-time	Mô tả công việc: Hỗ trợ kỹ sư kiểm tra thiết bị và ghi nhận thông số vận hành; chuẩn bị vật tư, dụng cụ cho ca bảo trì. Làm việc khoảng 15h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận, tuân thủ quy định an toàn lao động; biết dùng Excel cơ bản.	Sản xuất / Kỹ thuật	365 Nguyễn Ái Quốc, Biên Hòa, Đồng Nai	MONTHLY	6000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	PENDING	2026-11-01 17:00:00+00	2026-11-02 03:59:53+00	Phụ cấp ca, hỗ trợ cơm ca.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-16 00:00:00	uploads/banners/job_160.jpg	\N
161	24	Nhân viên Soạn hàng ca đêm	Mô tả công việc: Dán nhãn, xếp hàng lên pallet và bàn giao cho khâu vận chuyển; giữ khu vực soạn hàng gọn gàng, đúng quy định an toàn. Làm việc khoảng 24h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Sức khỏe tốt, có thể làm ca đêm; nhanh nhẹn, cẩn thận.	Logistics / Giao nhận	267 Võ Thị Sáu, Biên Hòa, Đồng Nai	HOURLY	21000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-01 17:00:00+00	2026-10-02 05:33:44+00	Phụ cấp ca đêm/cuối tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-08 00:00:00	uploads/banners/job_161.jpg	\N
162	26	Hỗ trợ tổ chức lớp học & sự kiện	Mô tả công việc: Chuẩn bị phòng học, thiết bị và tài liệu cho lớp/sự kiện; hỗ trợ chụp ảnh, ghi nhận phản hồi sau sự kiện. Làm việc khoảng 15h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Nhanh nhẹn, giao tiếp tốt; có thể làm việc vào cuối tuần/ngày sự kiện.	Giáo dục / Đào tạo	40 Phạm Hùng, Nam Từ Liêm, Hà Nội	MONTHLY	4000000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-08-27 17:00:00+00	2026-09-19 11:39:18+00	Thưởng theo kết quả công việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-11 00:00:00	uploads/banners/job_162.jpg	\N
163	11	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Ghi nhận tình trạng kệ hàng và báo cáo cho giám sát; kiểm tra hạn dùng, bổ sung hàng lên kệ và vệ sinh khu vực trưng bày. Làm việc khoảng 16h/tuần, ca tối (18h-22h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Có thể làm việc theo ca đã đăng ký; cẩn thận, có mắt thẩm mỹ.	Bán lẻ	26 Cộng Hòa, Tân Bình, TP. Hồ Chí Minh	HOURLY	27000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-09-24 17:00:00+00	2026-10-06 12:42:46+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-19 00:00:00	uploads/banners/job_163.jpg	\N
164	16	Hỗ trợ Kỹ thuật IT Helpdesk	Mô tả công việc: Tiếp nhận yêu cầu hỗ trợ và xử lý sự cố máy tính, mạng cơ bản; ghi nhận ticket và cập nhật trạng thái xử lý. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giao tiếp tốt, kiên nhẫn với người dùng; ưu tiên sinh viên ngành CNTT, Mạng máy tính.	Công nghệ thông tin	61 Võ Văn Kiệt, Bình Thủy, Cần Thơ	MONTHLY	4000000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-14 17:00:00+00	2026-10-15 04:32:02+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-24 00:00:00	uploads/banners/job_164.jpg	\N
165	10	Pha chế (Barista) ca tối	Mô tả công việc: Vệ sinh máy móc, dụng cụ và kiểm kê nguyên liệu cuối ca; pha chế đồ uống theo công thức của quán. Làm việc khoảng 15h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Trung thực, tác phong chuyên nghiệp; có thể làm ca tối đến 22h.	F&B / Dịch vụ ăn uống	47 Nguyễn Văn Linh, Thủ Dầu Một, Bình Dương	HOURLY	34000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-09 17:00:00+00	2026-10-10 04:42:32+00	Lịch làm linh hoạt, ưu tiên sinh viên.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-03 00:00:00	uploads/banners/job_165.jpg	\N
166	8	Phân loại hàng hóa	Mô tả công việc: Phân loại hàng theo tuyến/khu vực dựa trên mã vận đơn; hỗ trợ sắp xếp hàng lên xe giao. Làm việc khoảng 15h/tuần, ca tối (18h-22h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Sức khỏe tốt, chịu được áp lực giờ cao điểm; đọc hiểu mã/địa chỉ nhanh, chính xác.	Logistics / Giao nhận	KCN Trà Nóc, Bình Thủy, Cần Thơ	HOURLY	39000.00	Ca tối (18h-22h)	OPEN	APPROVED	2026-10-09 17:00:00+00	2026-10-10 06:16:06+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-14 00:00:00	uploads/banners/job_166.jpg	\N
167	25	Tư vấn viên Telesales	Mô tả công việc: Ghi nhận nhu cầu và cập nhật kết quả cuộc gọi vào hệ thống; gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm; giọng nói rõ ràng, tự tin giao tiếp qua điện thoại.	Bán lẻ	KCN Tân Bình, Tân Phú, TP. Hồ Chí Minh	MONTHLY	3000000.00	Ca chiều (13h-17h)	COMPLETED	APPROVED	2026-08-27 17:00:00+00	2026-09-27 13:51:56+00	Lịch làm linh hoạt theo lịch học, được đào tạo trước khi nhận việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-25 00:00:00	uploads/banners/job_167.jpg	\N
168	34	Data Entry part-time	Mô tả công việc: Kiểm tra lỗi dữ liệu và báo cáo cuối ca; nhập liệu, chuẩn hóa và đối soát dữ liệu trên bảng tính. Làm việc khoảng 12h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Gõ máy nhanh, chính xác; dùng thành thạo Excel/Google Sheets; có thể làm việc đúng ca đã đăng ký.	Công nghệ thông tin	99 Lê Văn Việt, Thủ Đức, TP. Hồ Chí Minh	HOURLY	25000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-09 17:00:00+00	2026-10-10 05:44:14+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-19 00:00:00	uploads/banners/job_168.jpg	\N
169	10	Nhân viên Bếp part-time	Mô tả công việc: Giữ vệ sinh khu bếp, dụng cụ và kiểm tra hạn dùng nguyên liệu; sơ chế nguyên liệu và hỗ trợ đầu bếp chế biến món theo thực đơn. Làm việc khoảng 18h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Nhanh nhẹn, tuân thủ quy định vệ sinh an toàn thực phẩm; ưu tiên bạn từng làm bếp hoặc phụ bếp.	F&B / Dịch vụ ăn uống	380 Huỳnh Văn Lũy, Thủ Dầu Một, Bình Dương	MONTHLY	5000000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-08-23 17:00:00+00	2026-09-16 14:53:25+00	Lịch làm linh hoạt, ưu tiên sinh viên.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-12 00:00:00	uploads/banners/job_169.jpg	\N
170	47	Tư vấn viên Telesales	Mô tả công việc: Gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn; hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh. Làm việc khoảng 24h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc theo ca đã đăng ký; kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm.	Bán lẻ	341 30 Tháng 4, Vũng Tàu, Bà Rịa - Vũng Tàu	HOURLY	45000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-08 17:00:00+00	2026-10-09 05:57:20+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-23 00:00:00	uploads/banners/job_170.jpg	\N
171	37	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Trưng bày sản phẩm theo sơ đồ (planogram) của nhãn hàng; kiểm tra hạn dùng, bổ sung hàng lên kệ và vệ sinh khu vực trưng bày. Làm việc khoảng 18h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận, có mắt thẩm mỹ; có thể làm việc theo ca đã đăng ký.	Bán lẻ	344 Huỳnh Văn Lũy, Thủ Dầu Một, Bình Dương	MONTHLY	3000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-20 17:00:00+00	2026-10-21 05:25:06+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-21 00:00:00	uploads/banners/job_171.jpg	\N
172	20	Nhân viên Bếp part-time	Mô tả công việc: Chuẩn bị nguyên liệu trước giờ cao điểm; giữ vệ sinh khu bếp, dụng cụ và kiểm tra hạn dùng nguyên liệu. Làm việc khoảng 12h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Ưu tiên bạn từng làm bếp hoặc phụ bếp; nhanh nhẹn, tuân thủ quy định vệ sinh an toàn thực phẩm.	F&B / Dịch vụ ăn uống	144 Trần Hưng Đạo, Ninh Kiều, Cần Thơ	HOURLY	23000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-08-25 17:00:00+00	2026-09-30 20:32:37+00	Lịch làm linh hoạt, ưu tiên sinh viên.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-18 00:00:00	uploads/banners/job_172.jpg	\N
173	14	Cộng tác viên Tester (Manual)	Mô tả công việc: Viết test case cho tính năng mới và kiểm tra lại lỗi sau khi sửa; báo cáo kết quả kiểm thử hằng tuần cho trưởng nhóm. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Hiểu quy trình kiểm thử phần mềm cơ bản; đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT.	Công nghệ thông tin	135 Quang Trung, Gò Vấp, TP. Hồ Chí Minh	HOURLY	39000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-11 17:00:00+00	2026-10-12 07:04:32+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-23 00:00:00	uploads/banners/job_173.jpg	\N
174	12	Tư vấn viên Telesales khóa học	Mô tả công việc: Cập nhật kết quả cuộc gọi vào hệ thống; gọi điện giới thiệu khóa học cho danh sách học viên tiềm năng. Làm việc khoảng 15h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Giọng nói rõ ràng, giao tiếp tự tin; kiên nhẫn, chịu được áp lực chỉ tiêu mềm.	Giáo dục / Đào tạo	79 Duy Tân, Hải Châu, Đà Nẵng	HOURLY	41000.00	Ca chiều (13h-17h)	COMPLETED	APPROVED	2026-08-28 17:00:00+00	2026-09-18 14:26:45+00	Thưởng theo kết quả công việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-20 00:00:00	uploads/banners/job_174.jpg	\N
175	14	Hỗ trợ Kỹ thuật IT Helpdesk	Mô tả công việc: Tiếp nhận yêu cầu hỗ trợ và xử lý sự cố máy tính, mạng cơ bản; ghi nhận ticket và cập nhật trạng thái xử lý. Làm việc khoảng 18h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Biết cài đặt Windows, phần mềm văn phòng; hiểu mạng LAN/Wi-Fi cơ bản; giao tiếp tốt, kiên nhẫn với người dùng.	Công nghệ thông tin	KCN Vĩnh Lộc, Bình Chánh, TP. Hồ Chí Minh	MONTHLY	3000000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-05 17:00:00+00	2026-10-06 05:08:06+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-11 00:00:00	uploads/banners/job_175.jpg	\N
176	31	Cộng tác viên Tuyển sinh	Mô tả công việc: Tham gia các buổi giới thiệu/ngày hội tuyển sinh; thu thập thông tin quan tâm và cập nhật danh sách tư vấn. Làm việc khoảng 12h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Có thể làm việc cuối tuần; giao tiếp tốt, thân thiện, tác phong lịch sự.	Giáo dục / Đào tạo	151 Điện Biên Phủ, Hồng Bàng, Hải Phòng	MONTHLY	7000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	PENDING	2026-10-28 17:00:00+00	2026-10-29 06:55:30+00	Môi trường học thuật, ưu tiên sinh viên ngành liên quan.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-23 00:00:00	uploads/banners/job_176.jpg	\N
177	14	Thực tập sinh Back-end (NodeJS)	Mô tả công việc: Hỗ trợ xây dựng và kiểm thử các REST API bằng NodeJS/Express; sửa lỗi nhỏ, viết unit test và hỗ trợ triển khai bản thử nghiệm. Làm việc khoảng 15h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Ham học hỏi, làm việc nhóm tốt; ưu tiên sinh viên năm 3–4 ngành CNTT; hiểu REST API và SQL cơ bản; biết dùng Git.	Công nghệ thông tin	230 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh	MONTHLY	4000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-13 17:00:00+00	2026-10-14 06:31:34+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-30 00:00:00	uploads/banners/job_177.jpg	\N
178	25	Tư vấn viên Telesales	Mô tả công việc: Hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh; gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giọng nói rõ ràng, tự tin giao tiếp qua điện thoại; có thể làm việc theo ca đã đăng ký.	Bán lẻ	375 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh	HOURLY	20000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-09-22 17:00:00+00	2026-10-06 22:32:06+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-09 00:00:00	uploads/banners/job_178.jpg	\N
179	39	Nhân viên Đóng gói sản phẩm	Mô tả công việc: Kiểm tra số lượng, ngoại quan trước khi bàn giao; đóng gói thành phẩm theo quy cách, dán nhãn và xếp thùng. Làm việc khoảng 15h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Tỉ mỉ, nhanh nhẹn; sức khỏe tốt, đứng làm việc được nhiều giờ.	Sản xuất / Kỹ thuật	160 Quang Trung, Cái Răng, Cần Thơ	MONTHLY	3000000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-09-30 17:00:00+00	2026-10-01 05:31:57+00	Cơ hội học hỏi quy trình sản xuất thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-11 00:00:00	uploads/banners/job_179.jpg	\N
180	35	Thực tập sinh Front-end (ReactJS)	Mô tả công việc: Chuyển wireframe thành component và kiểm tra hiển thị trên nhiều kích thước màn hình; hỗ trợ dựng giao diện web bằng ReactJS theo thiết kế Figma. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Biết HTML, CSS, JavaScript; đã làm project nhỏ bằng React; biết dùng Git; đọc được tài liệu tiếng Anh cơ bản.	Công nghệ thông tin	144 ĐT743, Dĩ An, Bình Dương	HOURLY	35000.00	Ca tối (18h-22h)	OPEN	APPROVED	2026-10-24 17:00:00+00	2026-10-25 03:49:17+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-29 00:00:00	uploads/banners/job_180.jpg	\N
181	5	Cộng tác viên Tester (Manual)	Mô tả công việc: Thực hiện kiểm thử thủ công theo test case và ghi nhận lỗi; báo cáo kết quả kiểm thử hằng tuần cho trưởng nhóm. Làm việc khoảng 18h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT; cẩn thận, tư duy logic; biết dùng Excel hoặc công cụ quản lý lỗi.	Công nghệ thông tin	362 30 Tháng 4, Ninh Kiều, Cần Thơ	HOURLY	26000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-08-17 17:00:00+00	2026-09-16 04:01:00+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-11 00:00:00	uploads/banners/job_181.jpg	\N
182	36	Khảo sát thị trường cuối tuần	Mô tả công việc: Nhập kết quả khảo sát và gửi báo cáo cuối ngày; thực hiện khảo sát khách hàng tại điểm bán/khu vực được giao. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms; làm việc được vào cuối tuần.	Hàng tiêu dùng / FMCG	155 Hải Thượng Lãn Ông, TP. Thanh Hóa, Thanh Hóa	HOURLY	38000.00	Ca chiều (13h-17h)	FILLED	APPROVED	2026-09-05 17:00:00+00	2026-10-15 11:07:52+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-22 00:00:00	uploads/banners/job_182.jpg	\N
183	39	Nhân viên Đóng gói sản phẩm	Mô tả công việc: Đóng gói thành phẩm theo quy cách, dán nhãn và xếp thùng; giữ gọn gàng khu vực đóng gói. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Tuân thủ nội quy an toàn của xưởng; tỉ mỉ, nhanh nhẹn.	Sản xuất / Kỹ thuật	KCN Hưng Phú, Cái Răng, Cần Thơ	MONTHLY	3000000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-25 17:00:00+00	2026-10-26 05:15:00+00	Cơ hội học hỏi quy trình sản xuất thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-27 00:00:00	uploads/banners/job_183.jpg	\N
184	6	Nhập liệu sản xuất part-time	Mô tả công việc: Tổng hợp báo cáo ca gửi quản lý; đối soát phiếu xuất – nhập với số liệu trên hệ thống. Làm việc khoảng 20h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Có thể làm đúng ca đăng ký; gõ máy nhanh, dùng tốt Excel.	Sản xuất / Kỹ thuật	KCN Long Thành, Long Thành, Đồng Nai	HOURLY	43000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-23 17:00:00+00	2026-10-24 04:13:03+00	Cơ hội học hỏi quy trình sản xuất thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-17 00:00:00	uploads/banners/job_184.jpg	\N
185	33	Cộng tác viên Tuyển sinh	Mô tả công việc: Thu thập thông tin quan tâm và cập nhật danh sách tư vấn; giới thiệu chương trình đào tạo và tư vấn cho phụ huynh/học viên. Làm việc khoảng 12h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc cuối tuần; ưu tiên sinh viên ngành giáo dục, truyền thông.	Giáo dục / Đào tạo	24 Trần Hưng Đạo, Ninh Kiều, Cần Thơ	MONTHLY	4000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-06 17:00:00+00	2026-10-07 06:12:21+00	Môi trường học thuật, ưu tiên sinh viên ngành liên quan.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-21 00:00:00	uploads/banners/job_185.jpg	\N
186	45	Cộng tác viên Bán hàng	Mô tả công việc: Hỗ trợ trưng bày, kiểm tra tồn kho và ghi nhận doanh số; giới thiệu và tư vấn sản phẩm cho khách tại cửa hàng/điểm bán. Làm việc khoảng 20h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Có thể làm việc cuối tuần; ưu tiên bạn từng làm bán hàng hoặc cộng tác viên.	Hàng tiêu dùng / FMCG	369 Quang Trung, TP. Thanh Hóa, Thanh Hóa	HOURLY	22000.00	Ca tối (18h-22h)	OPEN	PENDING	2026-11-01 17:00:00+00	2026-11-02 04:53:25+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-29 00:00:00	uploads/banners/job_186.jpg	\N
187	44	Tư vấn viên Telesales	Mô tả công việc: Hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh; gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn. Làm việc khoảng 18h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc theo ca đã đăng ký; kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm.	Hàng tiêu dùng / FMCG	357 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng	HOURLY	39000.00	Ca làm linh hoạt theo lịch học của sinh viên	COMPLETED	APPROVED	2026-08-25 17:00:00+00	2026-09-26 16:37:17+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-18 00:00:00	uploads/banners/job_187.jpg	\N
188	18	Cộng tác viên Bán hàng	Mô tả công việc: Chăm sóc khách hàng, xử lý thắc mắc cơ bản; hỗ trợ trưng bày, kiểm tra tồn kho và ghi nhận doanh số. Làm việc khoảng 15h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Có thể làm việc cuối tuần; ưu tiên bạn từng làm bán hàng hoặc cộng tác viên.	Hàng tiêu dùng / FMCG	205 Láng Hạ, Đống Đa, Hà Nội	HOURLY	35000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-21 17:00:00+00	2026-10-22 06:28:42+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-20 00:00:00	uploads/banners/job_188.jpg	\N
189	3	Cộng tác viên Bán hàng	Mô tả công việc: Hỗ trợ trưng bày, kiểm tra tồn kho và ghi nhận doanh số; giới thiệu và tư vấn sản phẩm cho khách tại cửa hàng/điểm bán. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc cuối tuần; ưu tiên bạn từng làm bán hàng hoặc cộng tác viên.	Bán lẻ	33 Đại lộ Bình Dương, Thuận An, Bình Dương	MONTHLY	7000000.00	Ca chiều (13h-17h)	FILLED	APPROVED	2026-09-25 17:00:00+00	2026-10-09 18:58:00+00	Được giảm giá khi mua sắm tại hệ thống.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-12 00:00:00	uploads/banners/job_189.jpg	\N
190	13	Khảo sát thị trường cuối tuần	Mô tả công việc: Nhập kết quả khảo sát và gửi báo cáo cuối ngày; thực hiện khảo sát khách hàng tại điểm bán/khu vực được giao. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Trung thực khi ghi nhận số liệu; làm việc được vào cuối tuần.	Bán lẻ	388 Đồng Khởi, Biên Hòa, Đồng Nai	HOURLY	22000.00	Ca chiều (13h-17h)	CLOSED	APPROVED	2026-09-19 17:00:00+00	2026-10-14 08:48:39+00	Được giảm giá khi mua sắm tại hệ thống.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-11 00:00:00	uploads/banners/job_190.jpg	\N
191	26	Tư vấn viên Telesales khóa học	Mô tả công việc: Cập nhật kết quả cuộc gọi vào hệ thống; giải đáp thắc mắc, hẹn lịch học thử hoặc tư vấn trực tiếp. Làm việc khoảng 20h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Có thể làm theo ca đã đăng ký; giọng nói rõ ràng, giao tiếp tự tin.	Giáo dục / Đào tạo	45 Nguyễn Trãi, Thanh Xuân, Hà Nội	HOURLY	20000.00	Ca chiều (13h-17h)	FILLED	APPROVED	2026-09-14 17:00:00+00	2026-09-27 21:25:03+00	Môi trường học thuật, ưu tiên sinh viên ngành liên quan.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-08 00:00:00	uploads/banners/job_191.jpg	\N
192	36	Cộng tác viên Bán hàng	Mô tả công việc: Giới thiệu và tư vấn sản phẩm cho khách tại cửa hàng/điểm bán; chăm sóc khách hàng, xử lý thắc mắc cơ bản. Làm việc khoảng 24h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc cuối tuần; giao tiếp tốt, nhanh nhẹn, thân thiện.	Hàng tiêu dùng / FMCG	87 Lê Lợi, TP. Thanh Hóa, Thanh Hóa	MONTHLY	5000000.00	Ca tối (18h-22h)	OPEN	PENDING	2026-10-28 17:00:00+00	2026-10-29 06:40:04+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-08 00:00:00	uploads/banners/job_192.jpg	\N
193	41	Khảo sát thị trường cuối tuần	Mô tả công việc: Ghi nhận phản hồi, giá bán và hoạt động của đối thủ; nhập kết quả khảo sát và gửi báo cáo cuối ngày. Làm việc khoảng 20h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Trung thực khi ghi nhận số liệu; làm việc được vào cuối tuần.	Hàng tiêu dùng / FMCG	Khu CNC Hòa Lạc, Thạch Thất, Hà Nội	HOURLY	23000.00	Ca sáng (8h-12h)	COMPLETED	APPROVED	2026-07-30 17:00:00+00	2026-09-13 04:45:41+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-17 00:00:00	uploads/banners/job_193.jpg	\N
194	36	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Ghi nhận tình trạng kệ hàng và báo cáo cho giám sát; trưng bày sản phẩm theo sơ đồ (planogram) của nhãn hàng. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận, có mắt thẩm mỹ; sức khỏe tốt, đứng được nhiều giờ.	Hàng tiêu dùng / FMCG	230 Hải Thượng Lãn Ông, TP. Thanh Hóa, Thanh Hóa	MONTHLY	6000000.00	Ca chiều (13h-17h)	COMPLETED	APPROVED	2026-08-09 17:00:00+00	2026-09-03 20:50:49+00	Môi trường năng động, có cơ hội lên giám sát.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-03 00:00:00	uploads/banners/job_194.jpg	\N
195	25	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Trưng bày sản phẩm theo sơ đồ (planogram) của nhãn hàng; ghi nhận tình trạng kệ hàng và báo cáo cho giám sát. Làm việc khoảng 24h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Có thể làm việc theo ca đã đăng ký; cẩn thận, có mắt thẩm mỹ.	Bán lẻ	386 Quang Trung, Gò Vấp, TP. Hồ Chí Minh	MONTHLY	3000000.00	Ca sáng (8h-12h)	COMPLETED	APPROVED	2026-08-02 17:00:00+00	2026-08-31 14:32:18+00	Được giảm giá khi mua sắm tại hệ thống.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-28 00:00:00	uploads/banners/job_195.jpg	\N
196	45	Tư vấn viên Telesales	Mô tả công việc: Hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh; gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Giọng nói rõ ràng, tự tin giao tiếp qua điện thoại; kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm.	Hàng tiêu dùng / FMCG	341 Trần Phú, TP. Thanh Hóa, Thanh Hóa	HOURLY	25000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-16 17:00:00+00	2026-10-17 03:44:43+00	Môi trường năng động, có cơ hội lên giám sát.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-23 00:00:00	uploads/banners/job_196.jpg	\N
197	13	Khảo sát thị trường cuối tuần	Mô tả công việc: Thực hiện khảo sát khách hàng tại điểm bán/khu vực được giao; nhập kết quả khảo sát và gửi báo cáo cuối ngày. Làm việc khoảng 24h/tuần, ca tối (18h-22h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Trung thực khi ghi nhận số liệu; làm việc được vào cuối tuần.	Bán lẻ	194 Phạm Văn Thuận, Biên Hòa, Đồng Nai	MONTHLY	5000000.00	Ca tối (18h-22h)	FILLED	APPROVED	2026-08-31 17:00:00+00	2026-10-16 23:20:59+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-25 00:00:00	uploads/banners/job_197.jpg	\N
198	28	Cộng tác viên Tester (Manual)	Mô tả công việc: Viết test case cho tính năng mới và kiểm tra lại lỗi sau khi sửa; thực hiện kiểm thử thủ công theo test case và ghi nhận lỗi. Làm việc khoảng 15h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Hiểu quy trình kiểm thử phần mềm cơ bản; đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT.	Công nghệ thông tin	181 Quốc lộ 1K, Dĩ An, Bình Dương	HOURLY	32000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-26 17:00:00+00	2026-10-27 04:31:15+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-27 00:00:00	uploads/banners/job_198.jpg	\N
199	42	Nhân viên Soạn hàng ca đêm	Mô tả công việc: Soạn hàng theo đơn, kiểm tra số lượng và quy cách; giữ khu vực soạn hàng gọn gàng, đúng quy định an toàn. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Tuân thủ nội quy kho; nhanh nhẹn, cẩn thận.	Logistics / Giao nhận	Khu Công nghệ cao, Hòa Vang, Đà Nẵng	MONTHLY	7000000.00	Ca tối (18h-22h)	OPEN	APPROVED	2026-10-03 17:00:00+00	2026-10-04 06:53:05+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-28 00:00:00	uploads/banners/job_199.jpg	\N
200	14	Hỗ trợ Kỹ thuật IT Helpdesk	Mô tả công việc: Cài đặt phần mềm, cấp tài khoản và hướng dẫn người dùng nội bộ; ghi nhận ticket và cập nhật trạng thái xử lý. Làm việc khoảng 16h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giao tiếp tốt, kiên nhẫn với người dùng; biết cài đặt Windows, phần mềm văn phòng; hiểu mạng LAN/Wi-Fi cơ bản.	Công nghệ thông tin	82 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh	MONTHLY	3000000.00	Ca làm linh hoạt theo lịch học của sinh viên	CLOSED	APPROVED	2026-08-21 17:00:00+00	2026-09-04 14:16:47+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-13 00:00:00	uploads/banners/job_200.jpg	\N
201	36	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Trưng bày sản phẩm theo sơ đồ (planogram) của nhãn hàng; kiểm tra hạn dùng, bổ sung hàng lên kệ và vệ sinh khu vực trưng bày. Làm việc khoảng 15h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Có thể làm việc theo ca đã đăng ký; cẩn thận, có mắt thẩm mỹ.	Hàng tiêu dùng / FMCG	282 Lê Lợi, TP. Thanh Hóa, Thanh Hóa	HOURLY	36000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-08-12 17:00:00+00	2026-09-07 02:39:54+00	Môi trường năng động, có cơ hội lên giám sát.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-28 00:00:00	uploads/banners/job_201.jpg	\N
202	14	Data Entry part-time	Mô tả công việc: Kiểm tra lỗi dữ liệu và báo cáo cuối ca; cập nhật thông tin khách hàng/đơn hàng vào hệ thống nội bộ. Làm việc khoảng 24h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Gõ máy nhanh, chính xác; dùng thành thạo Excel/Google Sheets; có thể làm việc đúng ca đã đăng ký.	Công nghệ thông tin	211 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh	HOURLY	42000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-08 17:00:00+00	2026-10-09 03:51:37+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-17 00:00:00	uploads/banners/job_202.jpg	\N
203	21	Tư vấn viên Telesales	Mô tả công việc: Hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh; gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giọng nói rõ ràng, tự tin giao tiếp qua điện thoại; có thể làm việc theo ca đã đăng ký.	Hàng tiêu dùng / FMCG	257 Hải Thượng Lãn Ông, TP. Thanh Hóa, Thanh Hóa	MONTHLY	3000000.00	Ca tối (18h-22h)	OPEN	PENDING	2026-10-29 17:00:00+00	2026-10-30 05:08:13+00	Môi trường năng động, có cơ hội lên giám sát.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-24 00:00:00	uploads/banners/job_203.jpg	\N
204	38	Nhân viên Soạn hàng ca đêm	Mô tả công việc: Dán nhãn, xếp hàng lên pallet và bàn giao cho khâu vận chuyển; soạn hàng theo đơn, kiểm tra số lượng và quy cách. Làm việc khoảng 12h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Tuân thủ nội quy kho; nhanh nhẹn, cẩn thận.	Logistics / Giao nhận	333 Trần Phú, Vũng Tàu, Bà Rịa - Vũng Tàu	MONTHLY	7000000.00	Ca chiều (13h-17h)	COMPLETED	APPROVED	2026-08-04 17:00:00+00	2026-09-10 04:25:00+00	Phụ cấp ca đêm/cuối tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-08-20 00:00:00	uploads/banners/job_204.jpg	\N
205	28	Cộng tác viên Tester (Manual)	Mô tả công việc: Viết test case cho tính năng mới và kiểm tra lại lỗi sau khi sửa; báo cáo kết quả kiểm thử hằng tuần cho trưởng nhóm. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Cẩn thận, tư duy logic; biết dùng Excel hoặc công cụ quản lý lỗi; đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT.	Công nghệ thông tin	244 Đại lộ Bình Dương, Thuận An, Bình Dương	HOURLY	38000.00	Ca chiều (13h-17h)	FILLED	APPROVED	2026-08-31 17:00:00+00	2026-09-28 07:19:39+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-27 00:00:00	uploads/banners/job_205.jpg	\N
206	16	Data Entry part-time	Mô tả công việc: Nhập liệu, chuẩn hóa và đối soát dữ liệu trên bảng tính; cập nhật thông tin khách hàng/đơn hàng vào hệ thống nội bộ. Làm việc khoảng 18h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Gõ máy nhanh, chính xác; dùng thành thạo Excel/Google Sheets; có thể làm việc đúng ca đã đăng ký.	Công nghệ thông tin	101 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ	HOURLY	40000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-18 17:00:00+00	2026-10-19 06:59:21+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-11 00:00:00	uploads/banners/job_206.jpg	\N
207	3	Tư vấn viên Telesales	Mô tả công việc: Gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn; ghi nhận nhu cầu và cập nhật kết quả cuộc gọi vào hệ thống. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm; giọng nói rõ ràng, tự tin giao tiếp qua điện thoại.	Bán lẻ	333 Đại lộ Bình Dương, Thuận An, Bình Dương	HOURLY	29000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-03 17:00:00+00	2026-10-04 03:57:54+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-09 00:00:00	uploads/banners/job_207.jpg	\N
208	8	Phân loại hàng hóa	Mô tả công việc: Phân loại hàng theo tuyến/khu vực dựa trên mã vận đơn; hỗ trợ sắp xếp hàng lên xe giao. Làm việc khoảng 18h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Có thể làm việc cuối tuần/ngày lễ nếu cần; sức khỏe tốt, chịu được áp lực giờ cao điểm.	Logistics / Giao nhận	KCN Trà Nóc, Bình Thủy, Cần Thơ	MONTHLY	4000000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-08-30 17:00:00+00	2026-10-02 17:31:36+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-14 00:00:00	uploads/banners/job_208.jpg	\N
209	47	Khảo sát thị trường cuối tuần	Mô tả công việc: Ghi nhận phản hồi, giá bán và hoạt động của đối thủ; nhập kết quả khảo sát và gửi báo cáo cuối ngày. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms; làm việc được vào cuối tuần.	Bán lẻ	312 30 Tháng 4, Vũng Tàu, Bà Rịa - Vũng Tàu	HOURLY	33000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-01 17:00:00+00	2026-10-02 02:26:59+00	Lịch làm linh hoạt theo lịch học, được đào tạo trước khi nhận việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-31 00:00:00	uploads/banners/job_209.jpg	\N
210	42	Đóng gói bưu phẩm	Mô tả công việc: Đóng gói, dán nhãn và kiểm tra bưu phẩm trước khi bàn giao; bảo quản hàng hóa, hạn chế hư hỏng. Làm việc khoảng 12h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Không yêu cầu kinh nghiệm; có thể làm đúng ca đăng ký.	Logistics / Giao nhận	Khu Công nghệ cao, Hòa Vang, Đà Nẵng	MONTHLY	7000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-26 17:00:00+00	2026-10-27 07:13:36+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-15 00:00:00	uploads/banners/job_210.jpg	\N
211	23	Trợ giảng cuối tuần	Mô tả công việc: Hướng dẫn học viên làm bài tập, chấm bài trắc nghiệm; chuẩn bị phòng học và dụng cụ cho buổi dạy. Làm việc khoảng 24h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Kiến thức tốt ở môn hỗ trợ; ưu tiên sinh viên sư phạm, ngoại ngữ; kiên nhẫn, yêu việc giảng dạy.	Giáo dục / Đào tạo	258 Quang Trung, Cái Răng, Cần Thơ	HOURLY	34000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-08-25 17:00:00+00	2026-09-25 03:05:37+00	Thưởng theo kết quả công việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-11 00:00:00	uploads/banners/job_211.jpg	\N
212	36	Tư vấn viên Telesales	Mô tả công việc: Gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn; ghi nhận nhu cầu và cập nhật kết quả cuộc gọi vào hệ thống. Làm việc khoảng 15h/tuần, linh hoạt theo lịch học. Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Giọng nói rõ ràng, tự tin giao tiếp qua điện thoại; kỹ năng thuyết phục cơ bản; chịu được áp lực chỉ tiêu mềm.	Hàng tiêu dùng / FMCG	391 Quang Trung, TP. Thanh Hóa, Thanh Hóa	HOURLY	45000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	PENDING	2026-11-01 17:00:00+00	2026-11-02 04:37:41+00	Thưởng KPI, hỗ trợ đồng phục và đào tạo sản phẩm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-25 00:00:00	uploads/banners/job_212.jpg	\N
213	36	Tư vấn viên Telesales	Mô tả công việc: Hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh; gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn. Làm việc khoảng 12h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Có thể làm việc theo ca đã đăng ký; giọng nói rõ ràng, tự tin giao tiếp qua điện thoại.	Hàng tiêu dùng / FMCG	391 Trần Phú, TP. Thanh Hóa, Thanh Hóa	MONTHLY	6000000.00	Ca tối (18h-22h)	OPEN	PENDING	2026-10-29 17:00:00+00	2026-10-30 07:37:46+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-20 00:00:00	uploads/banners/job_213.jpg	\N
214	44	Khảo sát thị trường cuối tuần	Mô tả công việc: Nhập kết quả khảo sát và gửi báo cáo cuối ngày; ghi nhận phản hồi, giá bán và hoạt động của đối thủ. Làm việc khoảng 20h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Làm việc được vào cuối tuần; giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms.	Hàng tiêu dùng / FMCG	398 Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng	HOURLY	36000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-08-29 17:00:00+00	2026-09-25 18:39:02+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-14 00:00:00	uploads/banners/job_214.jpg	\N
215	51	Tư vấn viên Telesales	Mô tả công việc: Hẹn lịch tư vấn và chuyển khách tiềm năng cho bộ phận kinh doanh; gọi điện giới thiệu sản phẩm/dịch vụ cho danh sách khách hàng có sẵn. Làm việc khoảng 15h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Giọng nói rõ ràng, tự tin giao tiếp qua điện thoại; có thể làm việc theo ca đã đăng ký.	Bán lẻ	295 Láng Hạ, Đống Đa, Hà Nội	MONTHLY	4000000.00	Ca làm linh hoạt theo lịch học của sinh viên	FILLED	APPROVED	2026-09-24 17:00:00+00	2026-10-17 08:42:49+00	Được giảm giá khi mua sắm tại hệ thống.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-10 00:00:00	uploads/banners/job_215.jpg	\N
216	20	Nhân viên Bếp part-time	Mô tả công việc: Giữ vệ sinh khu bếp, dụng cụ và kiểm tra hạn dùng nguyên liệu; chuẩn bị nguyên liệu trước giờ cao điểm. Làm việc khoảng 18h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Ưu tiên bạn từng làm bếp hoặc phụ bếp; sức khỏe tốt, chịu được áp lực giờ cao điểm.	F&B / Dịch vụ ăn uống	5 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ	HOURLY	45000.00	Ca tối (18h-22h)	CLOSED	APPROVED	2026-09-16 17:00:00+00	2026-09-21 12:41:08+00	Lịch làm linh hoạt, ưu tiên sinh viên.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-01 00:00:00	uploads/banners/job_216.jpg	\N
217	36	Khảo sát thị trường cuối tuần	Mô tả công việc: Thực hiện khảo sát khách hàng tại điểm bán/khu vực được giao; ghi nhận phản hồi, giá bán và hoạt động của đối thủ. Làm việc khoảng 12h/tuần, ca tối (18h-22h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Trung thực khi ghi nhận số liệu; làm việc được vào cuối tuần.	Hàng tiêu dùng / FMCG	334 Hải Thượng Lãn Ông, TP. Thanh Hóa, Thanh Hóa	MONTHLY	6000000.00	Ca tối (18h-22h)	COMPLETED	APPROVED	2026-08-07 17:00:00+00	2026-09-11 05:33:48+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-03 00:00:00	uploads/banners/job_217.jpg	\N
218	50	Khảo sát thị trường cuối tuần	Mô tả công việc: Nhập kết quả khảo sát và gửi báo cáo cuối ngày; ghi nhận phản hồi, giá bán và hoạt động của đối thủ. Làm việc khoảng 20h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms; trung thực khi ghi nhận số liệu.	Hàng tiêu dùng / FMCG	120 Quang Trung, Cái Răng, Cần Thơ	MONTHLY	3000000.00	Ca tối (18h-22h)	COMPLETED	APPROVED	2026-08-20 17:00:00+00	2026-09-17 21:49:15+00	Thanh toán lương đúng hạn hằng tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-10 00:00:00	uploads/banners/job_218.jpg	\N
219	32	Phân loại hàng hóa	Mô tả công việc: Quét mã và cập nhật trạng thái kiện hàng; phân loại hàng theo tuyến/khu vực dựa trên mã vận đơn. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Sức khỏe tốt, chịu được áp lực giờ cao điểm; đọc hiểu mã/địa chỉ nhanh, chính xác.	Logistics / Giao nhận	KCN Sóng Thần, Dĩ An, Bình Dương	HOURLY	24000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-27 17:00:00+00	2026-10-28 04:10:19+00	Hỗ trợ cơm ca và bảo hiểm tai nạn trong ca làm.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-08 00:00:00	uploads/banners/job_219.jpg	\N
220	9	Nhân viên Phục vụ ca sáng	Mô tả công việc: Hỗ trợ thu ngân khi cần; đón khách, ghi order và phục vụ đồ ăn thức uống tại bàn. Làm việc khoảng 15h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Không yêu cầu kinh nghiệm, sẽ được đào tạo; giao tiếp lịch sự, nhanh nhẹn.	F&B / Dịch vụ ăn uống	185 Điện Biên Phủ, Hồng Bàng, Hải Phòng	MONTHLY	3000000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-09-18 17:00:00+00	2026-10-06 07:16:04+00	Thưởng chuyên cần, chia tip theo ca.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-07 00:00:00	uploads/banners/job_220.jpg	\N
221	126	Thực tập sinh Front-end (ReactJS)	Mô tả công việc: Kết nối giao diện với API và sửa lỗi hiển thị; chuyển wireframe thành component và kiểm tra hiển thị trên nhiều kích thước màn hình. Làm việc khoảng 16h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận với chi tiết giao diện; ưu tiên có portfolio trên GitHub; biết HTML, CSS, JavaScript; đã làm project nhỏ bằng React.	Công nghệ thông tin	KCN Tân Bình, Tân Phú, TP. Hồ Chí Minh	HOURLY	35000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	APPROVED	2026-10-19 17:00:00+00	2026-10-20 02:09:42+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-15 00:00:00	uploads/banners/job_221.jpg	\N
222	126	Cộng tác viên Tester (Manual)	Mô tả công việc: Viết test case cho tính năng mới và kiểm tra lại lỗi sau khi sửa; báo cáo kết quả kiểm thử hằng tuần cho trưởng nhóm. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT; hiểu quy trình kiểm thử phần mềm cơ bản.	Công nghệ thông tin	172 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh	HOURLY	30000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-11 17:00:00+00	2026-10-12 05:54:37+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-04 00:00:00	uploads/banners/job_222.jpg	\N
223	126	Thực tập sinh Back-end (NodeJS)	Mô tả công việc: Viết truy vấn MySQL/MongoDB và tài liệu API cho nhóm; hỗ trợ xây dựng và kiểm thử các REST API bằng NodeJS/Express. Làm việc khoảng 20h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Ham học hỏi, làm việc nhóm tốt; ưu tiên sinh viên năm 3–4 ngành CNTT; hiểu REST API và SQL cơ bản; biết dùng Git.	Công nghệ thông tin	98 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh	MONTHLY	6000000.00	Ca sáng (8h-12h)	FILLED	APPROVED	2026-10-04 17:00:00+00	2026-11-01 16:10:57+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-25 00:00:00	uploads/banners/job_223.jpg	\N
224	126	Hỗ trợ Kỹ thuật IT Helpdesk	Mô tả công việc: Tiếp nhận yêu cầu hỗ trợ và xử lý sự cố máy tính, mạng cơ bản; ghi nhận ticket và cập nhật trạng thái xử lý. Làm việc khoảng 20h/tuần, ca chiều (13h-17h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Ưu tiên sinh viên ngành CNTT, Mạng máy tính; giao tiếp tốt, kiên nhẫn với người dùng.	Công nghệ thông tin	51 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh	HOURLY	28000.00	Ca chiều (13h-17h)	COMPLETED	APPROVED	2026-08-19 17:00:00+00	2026-09-25 09:18:11+00	Được mentor kèm cặp, tiếp cận quy trình làm việc thực tế.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-05 00:00:00	uploads/banners/job_224.jpg	\N
225	126	Data Entry part-time	Mô tả công việc: Kiểm tra lỗi dữ liệu và báo cáo cuối ca; cập nhật thông tin khách hàng/đơn hàng vào hệ thống nội bộ. Làm việc khoảng 15h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc đúng ca đã đăng ký; cẩn thận, trung thực, giữ bảo mật dữ liệu.	Công nghệ thông tin	333 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh	HOURLY	25000.00	Ca tối (18h-22h)	COMPLETED	APPROVED	2026-08-24 17:00:00+00	2026-09-30 13:35:31+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-10 00:00:00	uploads/banners/job_225.jpg	\N
226	126	Cộng tác viên Tester (Manual)	Mô tả công việc: Viết test case cho tính năng mới và kiểm tra lại lỗi sau khi sửa; thực hiện kiểm thử thủ công theo test case và ghi nhận lỗi. Làm việc khoảng 24h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Cẩn thận, tư duy logic; biết dùng Excel hoặc công cụ quản lý lỗi; đọc hiểu tiếng Anh cơ bản; ưu tiên sinh viên ngành CNTT.	Công nghệ thông tin	136 Quang Trung, Gò Vấp, TP. Hồ Chí Minh	MONTHLY	4500000.00	Ca sáng (8h-12h)	CLOSED	APPROVED	2026-08-31 17:00:00+00	2026-09-14 08:59:13+00	Cấp xác nhận thực tập; có cơ hội trở thành nhân viên chính thức.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-20 00:00:00	uploads/banners/job_226.jpg	\N
227	126	Thực tập sinh Back-end (NodeJS)	Mô tả công việc: Hỗ trợ xây dựng và kiểm thử các REST API bằng NodeJS/Express; viết truy vấn MySQL/MongoDB và tài liệu API cho nhóm. Làm việc khoảng 24h/tuần, linh hoạt theo lịch học. Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Biết JavaScript cơ bản, đã làm bài tập hoặc đồ án với NodeJS; ham học hỏi, làm việc nhóm tốt; ưu tiên sinh viên năm 3–4 ngành CNTT.	Công nghệ thông tin	201 Cộng Hòa, Tân Bình, TP. Hồ Chí Minh	MONTHLY	7000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	PENDING	2026-10-31 17:00:00+00	2026-11-01 05:30:55+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-20 00:00:00	uploads/banners/job_227.jpg	\N
228	126	Data Entry part-time	Mô tả công việc: Nhập liệu, chuẩn hóa và đối soát dữ liệu trên bảng tính; kiểm tra lỗi dữ liệu và báo cáo cuối ca. Làm việc khoảng 12h/tuần, ca tối (18h-22h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc đúng ca đã đăng ký; gõ máy nhanh, chính xác; dùng thành thạo Excel/Google Sheets.	Công nghệ thông tin	345 Cộng Hòa, Tân Bình, TP. Hồ Chí Minh	HOURLY	22000.00	Ca tối (18h-22h)	OPEN	REJECTED	2026-10-27 17:00:00+00	2026-10-28 07:08:22+00	Lịch làm linh hoạt theo lịch học, một phần có thể làm từ xa.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-10 00:00:00	uploads/banners/job_228.jpg	\N
231	3	Nhân viên Trưng bày sản phẩm	Mô tả công việc: Kiểm tra hạn dùng, bổ sung hàng lên kệ và vệ sinh khu vực trưng bày; ghi nhận tình trạng kệ hàng và báo cáo cho giám sát. Làm việc khoảng 24h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Có thể làm việc theo ca đã đăng ký; cẩn thận, có mắt thẩm mỹ.	Bán lẻ	211 Nguyễn Văn Linh, Thủ Dầu Một, Bình Dương	HOURLY	27000.00	Ca sáng (8h-12h)	OPEN	REJECTED	2026-10-21 17:00:00+00	2026-10-22 03:54:59+00	Lịch làm linh hoạt theo lịch học, được đào tạo trước khi nhận việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-05 00:00:00	uploads/banners/job_231.jpg	\N
232	7	Nhân viên Bếp part-time	Mô tả công việc: Giữ vệ sinh khu bếp, dụng cụ và kiểm tra hạn dùng nguyên liệu; chuẩn bị nguyên liệu trước giờ cao điểm. Làm việc khoảng 12h/tuần, ca tối (18h-22h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Ưu tiên bạn từng làm bếp hoặc phụ bếp; nhanh nhẹn, tuân thủ quy định vệ sinh an toàn thực phẩm.	F&B / Dịch vụ ăn uống	118 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng	HOURLY	29000.00	Ca tối (18h-22h)	OPEN	REJECTED	2026-10-17 17:00:00+00	2026-10-18 07:12:59+00	Hỗ trợ cơm ca và đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-01 00:00:00	uploads/banners/job_232.jpg	\N
233	24	Phân loại hàng hóa	Mô tả công việc: Hỗ trợ sắp xếp hàng lên xe giao; phân loại hàng theo tuyến/khu vực dựa trên mã vận đơn. Làm việc khoảng 18h/tuần, ca chiều (13h-17h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Sức khỏe tốt, chịu được áp lực giờ cao điểm; đọc hiểu mã/địa chỉ nhanh, chính xác.	Logistics / Giao nhận	KCN Long Thành, Long Thành, Đồng Nai	MONTHLY	4000000.00	Ca chiều (13h-17h)	OPEN	REJECTED	2026-10-24 17:00:00+00	2026-10-26 05:49:57+00	Phụ cấp ca đêm/cuối tuần.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-08 00:00:00	uploads/banners/job_233.jpg	\N
234	23	Trợ giảng cuối tuần	Mô tả công việc: Hỗ trợ giáo viên điểm danh, phát tài liệu và theo dõi học viên trong lớp; chuẩn bị phòng học và dụng cụ cho buổi dạy. Làm việc khoảng 24h/tuần, linh hoạt theo lịch học. Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Kiên nhẫn, yêu việc giảng dạy; kiến thức tốt ở môn hỗ trợ; ưu tiên sinh viên sư phạm, ngoại ngữ.	Giáo dục / Đào tạo	26 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ	MONTHLY	5000000.00	Ca làm linh hoạt theo lịch học của sinh viên	OPEN	REJECTED	2026-10-14 17:00:00+00	2026-10-16 08:37:28+00	Được đào tạo nghiệp vụ, cấp xác nhận làm việc.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-30 00:00:00	uploads/banners/job_234.jpg	\N
235	15	Khảo sát thị trường cuối tuần	Mô tả công việc: Thực hiện khảo sát khách hàng tại điểm bán/khu vực được giao; nhập kết quả khảo sát và gửi báo cáo cuối ngày. Làm việc khoảng 24h/tuần, ca sáng (8h-12h). Cam kết thanh toán lương đúng hạn, đảm bảo môi trường làm việc an toàn và tôn trọng quyền lợi sinh viên.	Trung thực khi ghi nhận số liệu; giao tiếp tốt, kiên nhẫn; dùng được điện thoại/Google Forms.	Hàng tiêu dùng / FMCG	242 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh	HOURLY	30000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-09-19 17:00:00+00	2026-09-20 05:44:38+00	Môi trường năng động, có cơ hội lên giám sát.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-10-25 00:00:00	uploads/banners/job_235.jpg	\N
230	130	Cộng tác viên Tuyển sinh	Mô tả công việc: Tham gia các buổi giới thiệu/ngày hội tuyển sinh; thu thập thông tin quan tâm và cập nhật danh sách tư vấn. Làm việc khoảng 24h/tuần, ca chiều (13h-17h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Ưu tiên sinh viên ngành giáo dục, truyền thông; giao tiếp tốt, thân thiện, tác phong lịch sự.	Giáo dục / Đào tạo	336 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh	MONTHLY	4000000.00	Ca chiều (13h-17h)	REJECTED	REJECTED	2026-10-30 17:00:00+00	2026-11-06 07:48:21.841569+00	Môi trường học thuật, ưu tiên sinh viên ngành liên quan.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-20 00:00:00	uploads/banners/job_230.jpg	ko hợp lý
236	11	Cộng tác viên Bán hàng	Mô tả công việc: Giới thiệu và tư vấn sản phẩm cho khách tại cửa hàng/điểm bán; hỗ trợ trưng bày, kiểm tra tồn kho và ghi nhận doanh số. Làm việc khoảng 12h/tuần, ca chiều (13h-17h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Ưu tiên bạn từng làm bán hàng hoặc cộng tác viên; giao tiếp tốt, nhanh nhẹn, thân thiện.	Bán lẻ	Khu Công nghệ cao, Thủ Đức, TP. Hồ Chí Minh	HOURLY	32000.00	Ca chiều (13h-17h)	OPEN	APPROVED	2026-10-24 17:00:00+00	2026-10-25 06:44:19+00	Thưởng theo doanh số, hỗ trợ đồng phục.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-11-02 00:00:00	uploads/banners/job_236.jpg	\N
237	128	Kiểm kho part-time	Mô tả công việc: Kiểm đếm hàng hóa, đối chiếu số liệu với phiếu nhập – xuất; sắp xếp hàng theo vị trí, hỗ trợ kiểm kê định kỳ. Làm việc khoảng 15h/tuần, ca sáng (8h-12h). Ưu tiên sinh viên làm việc ổn định ít nhất 2 tháng; lịch làm có thể điều chỉnh theo lịch thi.	Có thể làm việc theo ca đã đăng ký; sức khỏe tốt, có thể bê vác nhẹ.	Logistics / Giao nhận	81 Điện Biên Phủ, Hồng Bàng, Hải Phòng	MONTHLY	5000000.00	Ca sáng (8h-12h)	CLOSED	APPROVED	2026-09-04 17:00:00+00	2026-09-09 08:35:37+00	Thanh toán lương đúng hạn.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-09-25 00:00:00	uploads/banners/job_237.jpg	\N
238	132	Lập trình viên Frontend React.js Part-time	Phát triển các component giao diện React cho hệ thống JobNest, hỗ trợ sinh viên học hỏi thực tế.	Biết HTML/CSS/JavaScript, React cơ bản. Nhiệt tình, có trách nhiệm.	Công nghệ thông tin	Quận Bình Thạnh, TP.HCM	HOURLY	45000.00	PART_TIME	OPEN	APPROVED	2026-11-03 21:39:03.513776+00	2026-11-03 21:39:03.513776+00	\N	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-04	\N	\N	\N	\N	\N	2026-12-04 04:39:03.513776	https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800	\N
239	132	Thiết kế Banner Sự Kiện & UI Landing Page	Thiết kế bộ nhận diện truyền thông và wireframe giao diện Figma cho sự kiện VLU Job Fair 2026.	Sử dụng thành thạo Figma/Photoshop, có portfolio sản phẩm trước đó.	Thiết kế đồ họa	Làm việc từ xa (Remote)	FIXED	3500000.00	FREELANCE	OPEN	APPROVED	2026-11-03 21:39:03.521354+00	2026-11-03 21:39:03.521354+00	\N	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-04	\N	\N	\N	\N	\N	2026-11-24 04:39:03.521354	https://images.unsplash.com/photo-1558655146-d09347e92766?w=800	\N
229	127	Nhân viên Phục vụ ca sáng	Mô tả công việc: Dọn bàn, giữ vệ sinh khu vực phục vụ; đón khách, ghi order và phục vụ đồ ăn thức uống tại bàn. Làm việc khoảng 12h/tuần, ca sáng (8h-12h). Công ty hỗ trợ sắp xếp ca theo lịch học, thanh toán minh bạch và đúng hạn.	Giao tiếp lịch sự, nhanh nhẹn; có thể làm đúng ca sáng, ít nhất 4 buổi/tuần.	F&B / Dịch vụ ăn uống	KCN Hòa Khánh, Liên Chiểu, Đà Nẵng	HOURLY	26000.00	Ca sáng (8h-12h)	OPEN	APPROVED	2026-10-31 17:00:00+00	2026-11-06 07:48:12.445505+00	Lịch làm linh hoạt, ưu tiên sinh viên.	Không yêu cầu kinh nghiệm	Đại học / Cao đẳng	1	Nhân viên	2026-12-03	\N	\N	\N	\N	\N	2026-12-15 00:00:00	uploads/banners/job_229.jpg	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, body, target_type, target_id, read_at, created_at) FROM stdin;
1	46	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Đức Nam vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1037	2026-08-02 11:22:48	2026-08-02 11:22:48
2	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Quang Khoa vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1043	2026-08-04 12:06:08	2026-08-04 12:06:08
3	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Thanh Đức vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1203	2026-08-04 16:19:27	2026-08-04 16:19:27
4	25	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Thanh Giang vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1210	2026-08-05 13:10:50	2026-08-05 13:10:50
5	82	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) tại Tập đoàn Phát Đạt 19 chưa phù hợp và đã bị từ chối.	APPLICATION	1203	2026-08-06 00:28:36	2026-08-06 00:28:36
6	99	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hộ kinh doanh Phát Đạt 46 đã được chấp nhận.	APPLICATION	1037	2026-08-06 19:17:46	2026-08-06 19:17:46
7	18	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Ngọc Hải vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1054	2026-08-06 19:49:24	2026-08-06 19:49:24
8	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Thành vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1071	2026-08-06 20:50:03	2026-08-06 20:50:03
9	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Tuấn Oanh vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1077	2026-08-07 12:05:07	2026-08-07 12:05:07
10	74	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Công ty Cổ phần Foody 25 đã được chấp nhận.	APPLICATION	1210	2026-08-08 19:13:02	2026-08-08 19:13:02
11	100	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) tại Tập đoàn Phát Đạt 19 đã được chấp nhận.	APPLICATION	1071	2026-08-08 23:02:58	2026-08-08 23:02:58
12	113	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty Cổ phần Giao Hàng Nhanh 18 đã được chấp nhận.	APPLICATION	1054	\N	2026-08-09 03:21:10
13	18	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hoàng Hoàng Nhi vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1090	2026-08-09 09:06:29	2026-08-09 09:06:29
14	41	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hữu Giang vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1019	2026-08-09 20:25:00	2026-08-09 20:25:00
15	21	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Minh Trâm vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1239	2026-08-10 15:40:45	2026-08-10 15:40:45
16	55	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) tại Tập đoàn Phát Đạt 19 chưa phù hợp và đã bị từ chối.	APPLICATION	1077	2026-08-10 20:55:07	2026-08-10 20:55:07
17	101	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Công ty TNHH Phát Đạt 21 đã được chấp nhận.	APPLICATION	1239	2026-08-11 20:12:36	2026-08-11 20:12:36
18	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Tuấn Thảo vừa ứng tuyển vị trí Nhân viên Soạn hàng ca đêm.	APPLICATION	1181	2026-08-12 13:24:01	2026-08-12 13:24:01
19	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Hòa vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1101	2026-08-12 15:02:57	2026-08-12 15:02:57
20	39	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Bảo Tuấn vừa ứng tuyển vị trí Trợ lý kỹ thuật part-time.	APPLICATION	1228	2026-08-13 11:06:17	2026-08-13 11:06:17
21	6	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time.	APPLICATION	1089	2026-08-13 18:46:44	2026-08-13 18:46:44
22	96	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Công ty TNHH Hoàn Cầu 41 đã được chấp nhận.	APPLICATION	1019	2026-08-14 04:04:55	2026-08-14 04:04:55
23	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hồng Thảo vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1002	2026-08-14 14:32:21	2026-08-14 14:32:21
24	41	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Đức Cường vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1115	2026-08-14 19:36:54	2026-08-14 19:36:54
25	108	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time tại Tập đoàn Sáng Tạo Mới 6 đã được chấp nhận.	APPLICATION	1089	2026-08-14 19:52:47	2026-08-14 19:52:47
26	70	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Trợ lý kỹ thuật part-time tại Công ty TNHH Giao Hàng Nhanh 39 đã được chấp nhận.	APPLICATION	1228	2026-08-15 17:58:16	2026-08-15 17:58:16
27	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1173	2026-08-15 18:59:50	2026-08-15 18:59:50
28	97	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Soạn hàng ca đêm tại Công ty TNHH Việt Tín 38 đã được chấp nhận.	APPLICATION	1181	2026-08-15 21:09:09	2026-08-15 21:09:09
29	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lý Xuân Khánh vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1052	2026-08-16 15:01:48	2026-08-16 15:01:48
30	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lý Ngọc Trang vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1200	2026-08-16 16:06:19	2026-08-16 16:06:19
31	61	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hộ kinh doanh Việt Tín 36 đã được chấp nhận.	APPLICATION	1101	2026-08-16 19:11:58	2026-08-16 19:11:58
32	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Tuấn Thảo vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1073	2026-08-17 12:51:56	2026-08-17 12:51:56
33	63	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Việt Tín 36 chưa phù hợp và đã bị từ chối.	APPLICATION	1173	2026-08-17 21:59:49	2026-08-17 21:59:49
34	37	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Thanh Trâm vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1171	2026-08-18 07:04:44	2026-08-18 07:04:44
278	9	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Xuân Đạt vừa ứng tuyển vị trí Nhân viên Phục vụ ca sáng.	APPLICATION	1007	2026-10-02 11:54:15	2026-10-02 11:54:15
35	78	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hộ kinh doanh Việt Tín 36 chưa phù hợp và đã bị từ chối.	APPLICATION	1200	\N	2026-08-18 22:28:10
36	6	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thu Nam vừa ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time.	APPLICATION	1098	2026-08-19 07:09:39	2026-08-19 07:09:39
37	23	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Bình vừa ứng tuyển vị trí Trợ giảng cuối tuần.	APPLICATION	1106	2026-08-19 09:33:20	2026-08-19 09:33:20
38	46	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Quang Đạt vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1013	2026-08-19 09:38:09	2026-08-19 09:38:09
39	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Bình vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1186	2026-08-19 19:16:56	2026-08-19 19:16:56
40	77	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hộ kinh doanh Việt Tín 36 đã được chấp nhận.	APPLICATION	1052	2026-08-20 18:22:55	2026-08-20 18:22:55
41	54	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time tại Tập đoàn Sáng Tạo Mới 6 đã được chấp nhận.	APPLICATION	1098	2026-08-21 12:04:42	2026-08-21 12:04:42
42	46	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Thành vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1104	2026-08-22 14:22:07	2026-08-22 14:22:07
43	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Tuấn Yến vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1021	2026-08-22 17:34:02	2026-08-22 17:34:02
44	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Hồng Anh vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1212	2026-08-23 10:15:19	2026-08-23 10:15:19
45	25	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Quang Bình vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1159	2026-08-23 10:47:37	2026-08-23 10:47:37
46	105	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Trợ giảng cuối tuần tại Công ty Cổ phần Việt Tín 23 đã được chấp nhận.	APPLICATION	1106	2026-08-23 12:14:21	2026-08-23 12:14:21
47	39	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hồng Sơn vừa ứng tuyển vị trí Nhân viên Đóng gói sản phẩm.	APPLICATION	1217	2026-08-23 14:20:47	2026-08-23 14:20:47
48	117	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hộ kinh doanh Việt Tín 36 đã được chấp nhận.	APPLICATION	1021	2026-08-23 19:27:06	2026-08-23 19:27:06
49	37	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Minh Trâm vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1080	2026-08-23 19:41:20	2026-08-23 19:41:20
50	105	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Việt Tín 36 đã được chấp nhận.	APPLICATION	1186	2026-08-24 00:16:57	2026-08-24 00:16:57
51	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Thanh Đức vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1182	2026-08-24 08:18:26	2026-08-24 08:18:26
52	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Ngọc Linh vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1070	2026-08-24 08:59:33	2026-08-24 08:59:33
53	5	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1165	2026-08-24 13:39:29	2026-08-24 13:39:29
54	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lý Thị Nhi vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1042	\N	2026-08-24 18:03:06
55	59	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Hộ kinh doanh Foody 14 chưa phù hợp và đã bị từ chối.	APPLICATION	1212	2026-08-25 16:01:26	2026-08-25 16:01:26
56	103	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Đóng gói sản phẩm tại Công ty TNHH Giao Hàng Nhanh 39 đã được chấp nhận.	APPLICATION	1217	2026-08-25 16:27:47	2026-08-25 16:27:47
57	37	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lý Thị Nhi vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1175	2026-08-25 16:41:29	2026-08-25 16:41:29
58	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Minh Khang vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1260	2026-08-25 17:39:54	2026-08-25 17:39:54
59	10	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thanh Dung vừa ứng tuyển vị trí Nhân viên Bếp part-time.	APPLICATION	1105	2026-08-26 07:16:36	2026-08-26 07:16:36
60	31	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Ngô Văn Hương vừa ứng tuyển vị trí Cộng tác viên Tuyển sinh.	APPLICATION	1147	2026-08-26 08:05:12	2026-08-26 08:05:12
61	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Minh Trâm vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1172	2026-08-26 09:07:35	2026-08-26 09:07:35
62	39	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Quang Bình vừa ứng tuyển vị trí Nhân viên Đóng gói sản phẩm.	APPLICATION	1020	2026-08-26 09:43:52	2026-08-26 09:43:52
63	23	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Đình Giang vừa ứng tuyển vị trí Trợ giảng cuối tuần.	APPLICATION	1247	2026-08-26 09:51:00	2026-08-26 09:51:00
64	31	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Nhi vừa ứng tuyển vị trí Cộng tác viên Tuyển sinh.	APPLICATION	1220	2026-08-26 12:06:20	2026-08-26 12:06:20
65	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1008	2026-08-26 12:18:25	2026-08-26 12:18:25
66	82	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Đại Dương 50 đã được chấp nhận.	APPLICATION	1182	2026-08-26 13:42:17	2026-08-26 13:42:17
67	114	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Công ty Cổ phần Foody 25 chưa phù hợp và đã bị từ chối.	APPLICATION	1159	2026-08-26 16:04:25	2026-08-26 16:04:25
68	116	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Trợ giảng cuối tuần tại Công ty Cổ phần Việt Tín 23 chưa phù hợp và đã bị từ chối.	APPLICATION	1247	2026-08-27 11:54:10	2026-08-27 11:54:10
69	123	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Công ty TNHH Việt Nova đã được chấp nhận.	APPLICATION	1260	2026-08-27 19:20:57	2026-08-27 19:20:57
70	63	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Công ty Cổ phần Đại Dương 5 đã được chấp nhận.	APPLICATION	1165	2026-08-27 21:35:32	2026-08-27 21:35:32
71	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Quang Anh vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1141	2026-08-28 09:24:57	2026-08-28 09:24:57
72	87	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Bếp part-time tại Hộ kinh doanh Tương Lai 10 đã được chấp nhận.	APPLICATION	1105	2026-08-28 10:53:40	2026-08-28 10:53:40
73	25	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Ngọc Hải vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1136	2026-08-28 14:32:20	2026-08-28 14:32:20
74	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Cường vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1016	2026-08-28 14:41:23	2026-08-28 14:41:23
75	101	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hộ kinh doanh Việt Tín 36 chưa phù hợp và đã bị từ chối.	APPLICATION	1172	\N	2026-08-28 16:26:23
76	63	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hộ kinh doanh Đại Dương 50 chưa phù hợp và đã bị từ chối.	APPLICATION	1008	2026-08-28 17:33:15	2026-08-28 17:33:15
77	110	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Hệ thống TechNova 37 đã được chấp nhận.	APPLICATION	1175	2026-08-28 19:01:11	2026-08-28 19:01:11
78	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Đình Tuấn vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1261	2026-08-28 19:40:54	2026-08-28 19:40:54
79	93	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tuyển sinh tại Công ty TNHH Sáng Tạo Mới 31 chưa phù hợp và đã bị từ chối.	APPLICATION	1220	2026-08-28 20:00:28	2026-08-28 20:00:28
80	110	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hộ kinh doanh Việt Tín 36 đã được chấp nhận.	APPLICATION	1042	2026-08-29 00:45:59	2026-08-29 00:45:59
81	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Ngọc Trâm vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1219	2026-08-29 08:17:36	2026-08-29 08:17:36
82	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Minh Đạt vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1057	2026-08-29 11:34:40	2026-08-29 11:34:40
83	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Hoàng Cường vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1208	2026-08-29 11:37:31	2026-08-29 11:37:31
84	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Khoa vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1174	2026-08-29 12:34:33	2026-08-29 12:34:33
85	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Văn Bình vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1139	2026-08-29 19:46:12	2026-08-29 19:46:12
86	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Ngọc Minh vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1133	2026-08-30 08:44:37	2026-08-30 08:44:37
87	31	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Minh Đạt vừa ứng tuyển vị trí Cộng tác viên Tuyển sinh.	APPLICATION	1135	2026-08-30 09:06:40	2026-08-30 09:06:40
88	25	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Quang Khoa vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1041	2026-08-30 11:12:07	2026-08-30 11:12:07
89	80	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Công ty TNHH Việt Nova đã được chấp nhận.	APPLICATION	1261	2026-08-30 11:46:56	2026-08-30 11:46:56
90	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Minh Khang vừa ứng tuyển vị trí Data Entry part-time.	APPLICATION	1262	2026-08-30 12:52:54	2026-08-30 12:52:54
91	6	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time.	APPLICATION	1032	2026-08-30 15:28:18	2026-08-30 15:28:18
92	120	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Đại Dương 50 chưa phù hợp và đã bị từ chối.	APPLICATION	1139	2026-08-30 23:10:09	2026-08-30 23:10:09
93	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lý Xuân Yến vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1179	2026-08-31 10:44:36	2026-08-31 10:44:36
94	20	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hồng Thảo vừa ứng tuyển vị trí Nhân viên Bếp part-time.	APPLICATION	1166	2026-08-31 11:30:42	2026-08-31 11:30:42
95	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Hoàng Hòa vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1113	2026-08-31 12:07:46	2026-08-31 12:07:46
96	60	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hộ kinh doanh Việt Tín 36 chưa phù hợp và đã bị từ chối.	APPLICATION	1133	2026-08-31 12:42:43	2026-08-31 12:42:43
97	5	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hoàng Hoàng Nhi vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1053	2026-08-31 13:47:03	2026-08-31 13:47:03
98	56	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH TechNova 32 đã được chấp nhận.	APPLICATION	1057	2026-08-31 18:26:43	2026-08-31 18:26:43
99	113	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Công ty Cổ phần Foody 25 chưa phù hợp và đã bị từ chối.	APPLICATION	1136	2026-08-31 21:32:36	2026-08-31 21:32:36
100	76	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hộ kinh doanh Đại Dương 50 đã được chấp nhận.	APPLICATION	1219	2026-09-01 10:04:41	2026-09-01 10:04:41
101	56	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Tuyển sinh tại Công ty TNHH Sáng Tạo Mới 31 đã được chấp nhận.	APPLICATION	1135	2026-09-01 10:09:50	2026-09-01 10:09:50
102	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Đức Cường vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1184	2026-09-01 10:14:26	2026-09-01 10:14:26
103	5	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Ngô Văn Hương vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1125	2026-09-01 15:57:21	2026-09-01 15:57:21
138	107	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Hộ kinh doanh Đại Dương 50 đã được chấp nhận.	APPLICATION	1130	2026-09-05 19:22:41	2026-09-05 19:22:41
104	63	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time tại Tập đoàn Sáng Tạo Mới 6 chưa phù hợp và đã bị từ chối.	APPLICATION	1032	2026-09-01 16:38:30	2026-09-01 16:38:30
105	104	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty Cổ phần Foody 25 đã được chấp nhận.	APPLICATION	1041	2026-09-01 17:08:12	2026-09-01 17:08:12
106	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thị Yến vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1130	2026-09-01 17:55:29	2026-09-01 17:55:29
107	85	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hộ kinh doanh Đại Dương 50 đã được chấp nhận.	APPLICATION	1016	2026-09-01 20:57:24	2026-09-01 20:57:24
108	48	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Nhân viên Bếp part-time.	APPLICATION	1062	2026-09-02 07:14:14	2026-09-02 07:14:14
109	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Hoàng Bình vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1192	2026-09-02 09:11:24	2026-09-02 09:11:24
110	23	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Hoàng Bình vừa ứng tuyển vị trí Trợ giảng cuối tuần.	APPLICATION	1222	2026-09-02 10:28:28	2026-09-02 10:28:28
111	68	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hộ kinh doanh Đại Dương 50 chưa phù hợp và đã bị từ chối.	APPLICATION	1208	2026-09-02 13:07:29	2026-09-02 13:07:29
112	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1162	2026-09-02 13:56:43	2026-09-02 13:56:43
113	92	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Hộ kinh doanh Đại Dương 50 chưa phù hợp và đã bị từ chối.	APPLICATION	1141	2026-09-02 16:42:08	2026-09-02 16:42:08
114	46	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hoàng Hải vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1111	2026-09-02 17:37:42	2026-09-02 17:37:42
115	123	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Data Entry part-time tại Công ty TNHH Việt Nova đã được chấp nhận.	APPLICATION	1262	2026-09-02 18:43:50	2026-09-02 18:43:50
116	121	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Công ty Cổ phần Đại Dương 5 đã được chấp nhận.	APPLICATION	1053	2026-09-02 19:07:18	2026-09-02 19:07:18
117	25	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Hoàng Hòa vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1243	2026-09-02 21:14:10	2026-09-02 21:14:10
118	26	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hữu Anh vừa ứng tuyển vị trí Hỗ trợ tổ chức lớp học & sự kiện.	APPLICATION	1086	2026-09-02 21:38:06	2026-09-02 21:38:06
119	109	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Công ty Cổ phần Đại Dương 5 đã được chấp nhận.	APPLICATION	1125	2026-09-02 23:55:15	2026-09-02 23:55:15
120	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Hoàng Bình vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1033	2026-09-03 07:33:34	2026-09-03 07:33:34
121	12	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Tư vấn viên Telesales khóa học.	APPLICATION	1248	2026-09-03 14:26:58	2026-09-03 14:26:58
122	84	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Bếp part-time tại Tập đoàn Đại Dương 20 đã được chấp nhận.	APPLICATION	1166	2026-09-03 15:27:53	2026-09-03 15:27:53
123	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hữu Anh vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1204	2026-09-03 17:13:57	2026-09-03 17:13:57
124	95	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Đại Dương 50 chưa phù hợp và đã bị từ chối.	APPLICATION	1174	2026-09-03 18:03:32	2026-09-03 18:03:32
125	23	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Hòa vừa ứng tuyển vị trí Trợ giảng cuối tuần.	APPLICATION	1137	2026-09-03 18:03:57	2026-09-03 18:03:57
126	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Quang Tâm vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1046	2026-09-03 18:48:20	2026-09-03 18:48:20
127	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Bình vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1177	2026-09-03 21:43:17	2026-09-03 21:43:17
128	53	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Hỗ trợ tổ chức lớp học & sự kiện tại Công ty Cổ phần Foody 26 đã được chấp nhận.	APPLICATION	1086	2026-09-04 02:56:48	2026-09-04 02:56:48
129	8	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thị Yến vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1197	2026-09-04 07:12:30	2026-09-04 07:12:30
130	72	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hệ thống Foody 44 đã được chấp nhận.	APPLICATION	1184	2026-09-04 11:44:25	2026-09-04 11:44:25
131	63	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Bếp part-time tại Công ty TNHH Sáng Tạo Mới 48 đã được chấp nhận.	APPLICATION	1062	2026-09-04 13:05:57	2026-09-04 13:05:57
132	98	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Trợ giảng cuối tuần tại Công ty Cổ phần Việt Tín 23 đã được chấp nhận.	APPLICATION	1222	2026-09-04 16:08:38	2026-09-04 16:08:38
133	108	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales khóa học tại Công ty TNHH TechNova 12 đã được chấp nhận.	APPLICATION	1248	2026-09-04 18:38:44	2026-09-04 18:38:44
134	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Ngọc Hải vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1158	2026-09-04 18:58:39	2026-09-04 18:58:39
135	105	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH TechNova 32 đã được chấp nhận.	APPLICATION	1177	2026-09-05 00:46:27	2026-09-05 00:46:27
136	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Minh Khang vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1263	2026-09-05 07:16:51	2026-09-05 07:16:51
137	98	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Đại Dương 50 đã được chấp nhận.	APPLICATION	1033	2026-09-05 12:12:19	2026-09-05 12:12:19
314	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lý Thị Nhi vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1240	2026-10-12 11:26:02	2026-10-12 11:26:02
139	108	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Hộ kinh doanh Foody 14 chưa phù hợp và đã bị từ chối.	APPLICATION	1162	2026-09-05 20:42:40	2026-09-05 20:42:40
140	122	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Hộ kinh doanh Phát Đạt 46 đã được chấp nhận.	APPLICATION	1111	2026-09-06 01:34:46	2026-09-06 01:34:46
141	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Bảo Tuấn vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1017	2026-09-06 16:11:02	2026-09-06 16:11:02
142	10	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Hoàng Bình vừa ứng tuyển vị trí Nhân viên Bếp part-time.	APPLICATION	1003	2026-09-06 16:29:03	2026-09-06 16:29:03
143	111	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Trợ giảng cuối tuần tại Công ty Cổ phần Việt Tín 23 đã được chấp nhận.	APPLICATION	1137	2026-09-06 19:14:39	2026-09-06 19:14:39
144	113	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH TechNova 32 đã được chấp nhận.	APPLICATION	1158	2026-09-06 23:43:36	2026-09-06 23:43:36
145	26	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Minh Trâm vừa ứng tuyển vị trí Hỗ trợ tổ chức lớp học & sự kiện.	APPLICATION	1237	2026-09-07 07:55:27	2026-09-07 07:55:27
146	45	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Tuấn Hương vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1100	2026-09-07 10:51:57	2026-09-07 10:51:57
147	107	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH Việt Tín 8 đã được chấp nhận.	APPLICATION	1197	2026-09-07 12:10:19	2026-09-07 12:10:19
148	45	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Minh Đạt vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1014	2026-09-07 12:49:49	2026-09-07 12:49:49
149	8	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hồng Thảo vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1221	2026-09-07 19:31:05	2026-09-07 19:31:05
150	69	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hộ kinh doanh Đại Dương 50 đã được chấp nhận.	APPLICATION	1046	2026-09-08 01:56:32	2026-09-08 01:56:32
151	45	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Tuấn Thảo vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1097	2026-09-08 09:01:02	2026-09-08 09:01:02
152	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Tuấn Vy vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1189	2026-09-08 13:38:56	2026-09-08 13:38:56
153	123	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Công ty TNHH Việt Nova chưa phù hợp và đã bị từ chối.	APPLICATION	1263	2026-09-08 16:00:54	2026-09-08 16:00:54
154	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thị Yến vừa ứng tuyển vị trí Nhân viên Soạn hàng ca đêm.	APPLICATION	1134	\N	2026-09-09 07:02:27
155	13	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Hòa vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1026	\N	2026-09-09 09:59:22
156	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lý Xuân Yến vừa ứng tuyển vị trí Nhân viên Soạn hàng ca đêm.	APPLICATION	1006	2026-09-09 10:26:37	2026-09-09 10:26:37
157	23	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Khoa vừa ứng tuyển vị trí Trợ giảng cuối tuần.	APPLICATION	1207	2026-09-09 16:46:39	2026-09-09 16:46:39
158	10	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Ngọc Hải vừa ứng tuyển vị trí Nhân viên Bếp part-time.	APPLICATION	1145	2026-09-09 18:09:12	2026-09-09 18:09:12
159	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Quang Anh vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1061	2026-09-09 19:55:19	2026-09-09 19:55:19
160	8	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thu Hòa vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1044	2026-09-09 20:54:08	2026-09-09 20:54:08
161	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Khoa vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1264	2026-09-10 10:02:29	2026-09-10 10:02:29
162	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Thị Dung vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1214	2026-09-10 13:14:40	2026-09-10 13:14:40
163	90	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty Cổ phần Hoàn Cầu 45 chưa phù hợp và đã bị từ chối.	APPLICATION	1100	2026-09-10 14:07:58	2026-09-10 14:07:58
164	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Tuấn Thảo vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1229	2026-09-10 15:57:13	2026-09-10 15:57:13
165	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Minh Trâm vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1142	2026-09-10 17:43:00	2026-09-10 17:43:00
166	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Hồng Anh vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1095	2026-09-10 20:16:12	2026-09-10 20:16:12
167	75	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH Việt Tín 8 chưa phù hợp và đã bị từ chối.	APPLICATION	1044	2026-09-11 01:30:12	2026-09-11 01:30:12
168	13	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hoàng Hải vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1167	2026-09-11 09:56:09	2026-09-11 09:56:09
169	61	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Công ty Cổ phần Thành Công 13 đã được chấp nhận.	APPLICATION	1026	2026-09-11 11:33:17	2026-09-11 11:33:17
170	8	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hoàng Hải vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1194	\N	2026-09-11 12:06:42
171	101	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Hỗ trợ tổ chức lớp học & sự kiện tại Công ty Cổ phần Foody 26 đã được chấp nhận.	APPLICATION	1237	2026-09-11 12:49:28	2026-09-11 12:49:28
172	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Đức Nam vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1078	2026-09-11 13:05:06	2026-09-11 13:05:06
173	8	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Tuấn Thảo vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1241	2026-09-11 13:41:01	2026-09-11 13:41:01
174	107	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Soạn hàng ca đêm tại Công ty TNHH Việt Tín 38 đã được chấp nhận.	APPLICATION	1134	2026-09-11 13:41:30	2026-09-11 13:41:30
175	97	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hộ kinh doanh Foody 14 đã được chấp nhận.	APPLICATION	1229	2026-09-11 18:49:18	2026-09-11 18:49:18
176	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Hoàng Bình vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1121	2026-09-11 20:15:38	2026-09-11 20:15:38
177	5	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Quang Khoa vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1028	2026-09-12 07:38:20	2026-09-12 07:38:20
178	42	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Kiểm kho part-time.	APPLICATION	1196	2026-09-12 07:52:16	2026-09-12 07:52:16
179	50	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Hồng Tuấn vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1045	2026-09-12 11:35:58	2026-09-12 11:35:58
180	97	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty Cổ phần Hoàn Cầu 45 đã được chấp nhận.	APPLICATION	1097	2026-09-12 15:24:00	2026-09-12 15:24:00
181	97	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH Việt Tín 8 chưa phù hợp và đã bị từ chối.	APPLICATION	1241	2026-09-12 19:08:08	2026-09-12 19:08:08
182	45	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Văn Bình vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1109	2026-09-12 19:55:33	2026-09-12 19:55:33
183	106	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hệ thống Foody 44 đã được chấp nhận.	APPLICATION	1189	2026-09-12 20:17:48	2026-09-12 20:17:48
184	43	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hồng Vy vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1036	2026-09-12 20:46:55	2026-09-12 20:46:55
185	71	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hệ thống Thành Công 28 đã được chấp nhận.	APPLICATION	1121	2026-09-13 00:12:42	2026-09-13 00:12:42
186	113	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Bếp part-time tại Hộ kinh doanh Tương Lai 10 chưa phù hợp và đã bị từ chối.	APPLICATION	1145	2026-09-13 00:26:26	2026-09-13 00:26:26
187	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Tuấn Yến vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1244	2026-09-13 08:09:28	2026-09-13 08:09:28
188	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Ngọc Trâm vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1234	2026-09-13 13:43:16	2026-09-13 13:43:16
189	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Đình Tuấn vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1055	2026-09-13 14:25:42	2026-09-13 14:25:42
190	122	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH Việt Tín 8 đã được chấp nhận.	APPLICATION	1194	2026-09-13 15:02:38	2026-09-13 15:02:38
191	79	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Việt Tín 36 đã được chấp nhận.	APPLICATION	1214	2026-09-13 19:55:41	2026-09-13 19:55:41
192	92	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH TechNova 32 chưa phù hợp và đã bị từ chối.	APPLICATION	1061	2026-09-14 02:19:12	2026-09-14 02:19:12
193	122	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Công ty Cổ phần Thành Công 13 đã được chấp nhận.	APPLICATION	1167	2026-09-14 18:39:01	2026-09-14 18:39:01
194	101	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hệ thống Foody 44 chưa phù hợp và đã bị từ chối.	APPLICATION	1142	2026-09-14 18:42:48	2026-09-14 18:42:48
195	42	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Đức Hương vừa ứng tuyển vị trí Kiểm kho part-time.	APPLICATION	1040	2026-09-14 21:41:14	2026-09-14 21:41:14
196	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hoàng Hải vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1096	2026-09-15 09:27:59	2026-09-15 09:27:59
197	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Hòa vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1091	2026-09-15 11:46:39	2026-09-15 11:46:39
198	104	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Công ty Cổ phần Đại Dương 5 chưa phù hợp và đã bị từ chối.	APPLICATION	1028	2026-09-15 12:07:19	2026-09-15 12:07:19
199	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Hoàng Bình vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1038	2026-09-15 12:13:26	2026-09-15 12:13:26
200	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Ngọc Hải vừa ứng tuyển vị trí Nhân viên Soạn hàng ca đêm.	APPLICATION	1050	2026-09-15 18:34:29	2026-09-15 18:34:29
201	99	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hệ thống Foody 44 đã được chấp nhận.	APPLICATION	1078	2026-09-15 20:02:09	2026-09-15 20:02:09
202	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Nhân viên Soạn hàng ca đêm.	APPLICATION	1245	2026-09-16 14:47:38	2026-09-16 14:47:38
203	71	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hệ thống Foody 44 đã được chấp nhận.	APPLICATION	1038	2026-09-16 16:32:14	2026-09-16 16:32:14
204	63	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Kiểm kho part-time tại Hộ kinh doanh Việt Tín 42 đã được chấp nhận.	APPLICATION	1196	2026-09-16 16:50:16	2026-09-16 16:50:16
205	45	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1180	2026-09-16 20:59:51	2026-09-16 20:59:51
206	43	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Cường vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1242	2026-09-16 21:14:53	2026-09-16 21:14:53
207	89	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Công ty TNHH Thành Công 43 chưa phù hợp và đã bị từ chối.	APPLICATION	1036	2026-09-17 04:54:07	2026-09-17 04:54:07
208	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hoàng Hải vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1030	2026-09-17 08:58:45	2026-09-17 08:58:45
209	26	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Tuấn Thảo vừa ứng tuyển vị trí Tư vấn viên Telesales khóa học.	APPLICATION	1116	2026-09-17 09:34:12	2026-09-17 09:34:12
210	122	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Việt Tín 36 đã được chấp nhận.	APPLICATION	1096	2026-09-17 11:35:09	2026-09-17 11:35:09
211	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Nhi vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1119	2026-09-17 14:10:34	2026-09-17 14:10:34
212	12	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thu Hòa vừa ứng tuyển vị trí Tư vấn viên Telesales khóa học.	APPLICATION	1211	2026-09-17 17:32:50	2026-09-17 17:32:50
213	91	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Kiểm kho part-time tại Hộ kinh doanh Việt Tín 42 đã được chấp nhận.	APPLICATION	1040	2026-09-18 04:26:10	2026-09-18 04:26:10
214	20	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Bảo Quân vừa ứng tuyển vị trí Nhân viên Bếp part-time.	APPLICATION	1067	2026-09-18 11:53:22	2026-09-18 11:53:22
215	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Quang Anh vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1154	2026-09-18 12:45:08	2026-09-18 12:45:08
216	61	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hệ thống Thành Công 28 đã được chấp nhận.	APPLICATION	1091	2026-09-18 14:32:43	2026-09-18 14:32:43
217	13	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Xuân Đạt vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1108	2026-09-18 15:38:09	2026-09-18 15:38:09
218	75	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales khóa học tại Công ty TNHH TechNova 12 chưa phù hợp và đã bị từ chối.	APPLICATION	1211	2026-09-18 21:27:02	2026-09-18 21:27:02
219	51	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Đình Thảo vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1138	2026-09-19 16:55:57	2026-09-19 16:55:57
220	97	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales khóa học tại Công ty Cổ phần Foody 26 đã được chấp nhận.	APPLICATION	1116	2026-09-19 17:58:09	2026-09-19 17:58:09
221	113	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Soạn hàng ca đêm tại Công ty TNHH Việt Tín 38 chưa phù hợp và đã bị từ chối.	APPLICATION	1050	2026-09-20 01:17:31	2026-09-20 01:17:31
222	26	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Đức Nam vừa ứng tuyển vị trí Tư vấn viên Telesales khóa học.	APPLICATION	1051	2026-09-20 13:40:19	2026-09-20 13:40:19
223	62	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Bếp part-time tại Tập đoàn Đại Dương 20 chưa phù hợp và đã bị từ chối.	APPLICATION	1067	2026-09-20 16:22:15	2026-09-20 16:22:15
224	108	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Soạn hàng ca đêm tại Công ty TNHH Việt Tín 38 chưa phù hợp và đã bị từ chối.	APPLICATION	1245	2026-09-20 19:16:38	2026-09-20 19:16:38
225	108	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty Cổ phần Hoàn Cầu 45 chưa phù hợp và đã bị từ chối.	APPLICATION	1180	2026-09-20 23:15:59	2026-09-20 23:15:59
226	45	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Quang Anh vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1060	2026-09-21 07:27:58	2026-09-21 07:27:58
227	122	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hộ kinh doanh Foody 14 đã được chấp nhận.	APPLICATION	1030	2026-09-21 11:00:47	2026-09-21 11:00:47
228	13	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Nhi vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1213	\N	2026-09-21 16:38:46
229	99	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales khóa học tại Công ty Cổ phần Foody 26 đã được chấp nhận.	APPLICATION	1051	2026-09-21 20:58:28	2026-09-21 20:58:28
230	118	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Công ty TNHH Sáng Tạo Mới 51 chưa phù hợp và đã bị từ chối.	APPLICATION	1138	2026-09-21 21:33:43	2026-09-21 21:33:43
231	85	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Công ty TNHH Thành Công 43 chưa phù hợp và đã bị từ chối.	APPLICATION	1242	2026-09-22 05:03:52	2026-09-22 05:03:52
232	92	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Hệ thống Foody 44 chưa phù hợp và đã bị từ chối.	APPLICATION	1154	2026-09-22 19:10:09	2026-09-22 19:10:09
233	36	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1246	2026-09-22 20:36:37	2026-09-22 20:36:37
234	40	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Ngọc Minh vừa ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time.	APPLICATION	1079	2026-09-24 08:22:31	2026-09-24 08:22:31
235	92	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Công ty Cổ phần Hoàn Cầu 45 đã được chấp nhận.	APPLICATION	1060	2026-09-24 12:44:00	2026-09-24 12:44:00
236	9	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Quang Tâm vừa ứng tuyển vị trí Nhân viên Phục vụ ca sáng.	APPLICATION	1048	2026-09-24 14:00:46	2026-09-24 14:00:46
237	42	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thanh Dung vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1011	2026-09-24 16:29:53	2026-09-24 16:29:53
238	13	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Thanh Giang vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1082	\N	2026-09-24 17:21:41
239	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Thực tập sinh Back-end (NodeJS).	APPLICATION	1148	2026-09-24 18:15:28	2026-09-24 18:15:28
240	93	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Công ty Cổ phần Thành Công 13 chưa phù hợp và đã bị từ chối.	APPLICATION	1213	2026-09-24 20:06:02	2026-09-24 20:06:02
241	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Ngô Văn Hương vừa ứng tuyển vị trí Kiểm kho part-time.	APPLICATION	1081	2026-09-25 09:06:51	2026-09-25 09:06:51
242	69	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Phục vụ ca sáng tại Hệ thống Việt Tín 9 đã được chấp nhận.	APPLICATION	1048	2026-09-25 15:33:45	2026-09-25 15:33:45
243	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hồng Vy vừa ứng tuyển vị trí Kiểm kho part-time.	APPLICATION	1157	2026-09-25 21:18:45	2026-09-25 21:18:45
244	108	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) tại Tập đoàn Phát Đạt 19 đã được chấp nhận.	APPLICATION	1148	2026-09-25 23:15:29	2026-09-25 23:15:29
245	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Thị Giang vừa ứng tuyển vị trí Kiểm kho part-time.	APPLICATION	1168	\N	2026-09-26 09:46:34
246	19	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Nhi vừa ứng tuyển vị trí Thực tập sinh Back-end (NodeJS).	APPLICATION	1059	2026-09-26 12:55:12	2026-09-26 12:55:12
247	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Đình Tuấn vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1075	2026-09-26 13:19:23	2026-09-26 13:19:23
248	51	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Đình Giang vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1065	2026-09-26 16:53:39	2026-09-26 16:53:39
249	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Hoàng Bình vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1223	2026-09-26 17:28:22	2026-09-26 17:28:22
250	63	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Việt Tín 36 chưa phù hợp và đã bị từ chối.	APPLICATION	1246	2026-09-26 21:36:28	2026-09-26 21:36:28
251	89	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Kiểm kho part-time tại Công ty TNHH Việt Tín 38 đã được chấp nhận.	APPLICATION	1157	\N	2026-09-27 03:23:48
252	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Tuấn Oanh vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1201	2026-09-27 08:18:57	2026-09-27 08:18:57
253	42	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Thành vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1250	2026-09-27 17:34:33	2026-09-27 17:34:33
254	42	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Thị Oanh vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1063	2026-09-27 20:23:34	2026-09-27 20:23:34
255	45	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Đức Cường vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1249	2026-09-28 10:29:03	2026-09-28 10:29:03
256	60	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time tại Công ty TNHH Đại Dương 40 đã được chấp nhận.	APPLICATION	1079	2026-09-28 10:40:27	2026-09-28 10:40:27
257	15	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Thanh Đức vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1265	2026-09-28 11:28:24	2026-09-28 11:28:24
258	55	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hệ thống Thành Công 28 chưa phù hợp và đã bị từ chối.	APPLICATION	1201	\N	2026-09-28 14:19:56
259	80	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hệ thống Thành Công 28 chưa phù hợp và đã bị từ chối.	APPLICATION	1075	2026-09-28 18:37:28	2026-09-28 18:37:28
260	51	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Ngọc Trâm vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1187	2026-09-28 19:37:08	2026-09-28 19:37:08
261	100	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Hộ kinh doanh Việt Tín 42 chưa phù hợp và đã bị từ chối.	APPLICATION	1250	2026-09-28 22:14:27	2026-09-28 22:14:27
262	116	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Công ty TNHH Sáng Tạo Mới 51 đã được chấp nhận.	APPLICATION	1065	2026-09-29 00:36:31	2026-09-29 00:36:31
263	40	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Ngô Văn Hương vừa ứng tuyển vị trí Nhập liệu sản xuất part-time.	APPLICATION	1031	2026-09-29 07:26:06	2026-09-29 07:26:06
264	40	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Đình Thảo vừa ứng tuyển vị trí Trợ lý kỹ thuật part-time.	APPLICATION	1025	2026-09-29 07:27:00	2026-09-29 07:27:00
265	51	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Thị Giang vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1112	2026-09-29 07:44:03	2026-09-29 07:44:03
266	11	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thanh Linh vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1004	2026-09-29 08:33:55	2026-09-29 08:33:55
267	25	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Tuấn Vy vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1120	2026-09-29 10:29:07	2026-09-29 10:29:07
268	40	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Quang Anh vừa ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time.	APPLICATION	1188	2026-09-29 12:49:15	2026-09-29 12:49:15
269	93	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) tại Tập đoàn Phát Đạt 19 chưa phù hợp và đã bị từ chối.	APPLICATION	1059	2026-09-29 17:07:24	2026-09-29 17:07:24
270	46	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Tuấn Thảo vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1178	2026-09-29 21:32:05	2026-09-29 21:32:05
271	115	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Hộ kinh doanh Việt Tín 42 đã được chấp nhận.	APPLICATION	1063	2026-09-30 01:37:30	2026-09-30 01:37:30
272	57	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Tập đoàn Hoàn Cầu 11 đã được chấp nhận.	APPLICATION	1004	\N	2026-09-30 10:39:02
273	118	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Trợ lý kỹ thuật part-time tại Công ty TNHH Đại Dương 40 đã được chấp nhận.	APPLICATION	1025	2026-09-30 11:22:58	2026-09-30 11:22:58
274	66	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty TNHH Sáng Tạo Mới 51 chưa phù hợp và đã bị từ chối.	APPLICATION	1112	2026-09-30 12:53:15	2026-09-30 12:53:15
275	106	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty Cổ phần Foody 25 đã được chấp nhận.	APPLICATION	1120	2026-09-30 18:49:23	2026-09-30 18:49:23
276	72	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Công ty Cổ phần Hoàn Cầu 45 đã được chấp nhận.	APPLICATION	1249	2026-10-01 13:11:57	2026-10-01 13:11:57
277	66	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Kiểm kho part-time tại Công ty TNHH Việt Tín 38 chưa phù hợp và đã bị từ chối.	APPLICATION	1168	2026-10-01 14:30:34	2026-10-01 14:30:34
279	46	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Đình Thảo vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1183	2026-10-02 13:28:44	2026-10-02 13:28:44
280	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Nhi vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1160	2026-10-02 18:08:20	2026-10-02 18:08:20
281	16	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Đình Giang vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1056	2026-10-03 09:58:13	2026-10-03 09:58:13
282	76	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty TNHH Sáng Tạo Mới 51 chưa phù hợp và đã bị từ chối.	APPLICATION	1187	2026-10-04 03:21:08	2026-10-04 03:21:08
283	51	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Bình vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1231	2026-10-04 07:02:57	2026-10-04 07:02:57
284	46	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Đức Cường vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1140	2026-10-04 13:38:44	2026-10-04 13:38:44
285	92	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time tại Công ty TNHH Đại Dương 40 chưa phù hợp và đã bị từ chối.	APPLICATION	1188	2026-10-04 15:03:19	2026-10-04 15:03:19
286	11	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hồng Vy vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1218	2026-10-04 15:16:04	2026-10-04 15:16:04
287	39	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Hòa vừa ứng tuyển vị trí Nhân viên Đóng gói sản phẩm.	APPLICATION	1152	2026-10-04 18:35:05	2026-10-04 18:35:05
288	89	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Tập đoàn Hoàn Cầu 11 chưa phù hợp và đã bị từ chối.	APPLICATION	1218	2026-10-05 16:23:51	2026-10-05 16:23:51
289	3	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Cường vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1205	2026-10-06 08:25:17	2026-10-06 08:25:17
290	11	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Tuấn Hương vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1072	2026-10-06 08:39:05	2026-10-06 08:39:05
291	116	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Tập đoàn Giao Hàng Nhanh 16 chưa phù hợp và đã bị từ chối.	APPLICATION	1056	\N	2026-10-06 13:30:12
292	119	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Phục vụ ca sáng tại Hệ thống Việt Tín 9 chưa phù hợp và đã bị từ chối.	APPLICATION	1007	2026-10-06 14:16:09	2026-10-06 14:16:09
293	118	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Phát Đạt 46 đã được chấp nhận.	APPLICATION	1183	2026-10-06 18:57:52	2026-10-06 18:57:52
294	51	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Thanh Trâm vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1076	2026-10-06 20:49:43	2026-10-06 20:49:43
295	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Ngọc Linh vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1170	2026-10-07 09:18:00	2026-10-07 09:18:00
296	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Đức Minh vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1209	2026-10-07 09:22:40	2026-10-07 09:22:40
297	3	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hữu Giang vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1156	2026-10-07 15:14:53	2026-10-07 15:14:53
298	85	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Công ty TNHH Hoàn Cầu 3 đã được chấp nhận.	APPLICATION	1205	2026-10-07 16:03:09	2026-10-07 16:03:09
299	16	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thu Nam vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1123	2026-10-07 17:12:44	2026-10-07 17:12:44
300	51	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Thành vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1199	\N	2026-10-07 17:58:53
301	105	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty TNHH Sáng Tạo Mới 51 đã được chấp nhận.	APPLICATION	1231	2026-10-08 12:38:49	2026-10-08 12:38:49
302	4	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1127	2026-10-08 12:39:53	2026-10-08 12:39:53
303	6	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Bảo Tuấn vừa ứng tuyển vị trí Nhân viên Đóng gói sản phẩm.	APPLICATION	1129	2026-10-08 13:01:45	2026-10-08 13:01:45
304	25	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thanh Linh vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1225	2026-10-08 13:23:47	2026-10-08 13:23:47
305	83	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Hộ kinh doanh Foody 14 chưa phù hợp và đã bị từ chối.	APPLICATION	1170	2026-10-08 14:06:04	2026-10-08 14:06:04
306	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hoàng Hoàng Nhi vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1190	2026-10-09 10:35:25	2026-10-09 10:35:25
307	81	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Hộ kinh doanh Foody 14 chưa phù hợp và đã bị từ chối.	APPLICATION	1209	2026-10-09 16:58:32	2026-10-09 16:58:32
308	13	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Thị Giang vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1193	2026-10-10 11:26:59	2026-10-10 11:26:59
309	90	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Tập đoàn Hoàn Cầu 11 đã được chấp nhận.	APPLICATION	1072	2026-10-10 13:27:55	2026-10-10 13:27:55
310	100	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty TNHH Sáng Tạo Mới 51 đã được chấp nhận.	APPLICATION	1199	2026-10-11 01:51:04	2026-10-11 01:51:04
311	4	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thu Nam vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1029	2026-10-11 14:45:57	2026-10-11 14:45:57
312	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Hoàng Cường vừa ứng tuyển vị trí Data Entry part-time.	APPLICATION	1230	2026-10-11 14:49:02	2026-10-11 14:49:02
313	11	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hoàng Hoàng Nhi vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1227	2026-10-12 09:29:53	2026-10-12 09:29:53
315	49	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Tuấn Yến vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1128	2026-10-12 14:14:27	2026-10-12 14:14:27
316	11	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Ngọc Trâm vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1035	2026-10-12 14:51:50	2026-10-12 14:51:50
317	108	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Công ty TNHH TechNova 4 đã được chấp nhận.	APPLICATION	1127	2026-10-12 16:19:46	2026-10-12 16:19:46
318	47	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Hoàng Bình vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1024	2026-10-12 18:08:00	2026-10-12 18:08:00
319	11	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Bình vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1161	2026-10-12 21:21:42	2026-10-12 21:21:42
320	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Quang Anh vừa ứng tuyển vị trí Kiểm kho part-time.	APPLICATION	1118	2026-10-13 09:34:24	2026-10-13 09:34:24
321	14	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hữu Giang vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1176	2026-10-13 16:01:05	2026-10-13 16:01:05
322	49	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Ngọc Linh vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1185	2026-10-13 18:44:41	2026-10-13 18:44:41
323	40	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Quang Tâm vừa ứng tuyển vị trí Nhân viên Kiểm tra chất lượng (QC) part-time.	APPLICATION	1023	2026-10-14 11:37:39	2026-10-14 11:37:39
324	47	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Hồng Tuấn vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1009	2026-10-15 10:23:25	2026-10-15 10:23:25
325	47	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Ngọc Linh vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1163	2026-10-15 14:27:43	2026-10-15 14:27:43
326	33	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hữu Giang vừa ứng tuyển vị trí Cộng tác viên Tuyển sinh.	APPLICATION	1069	2026-10-15 18:04:41	2026-10-15 18:04:41
327	49	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Minh Trâm vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1049	2026-10-15 19:24:19	2026-10-15 19:24:19
328	117	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Hệ thống Phát Đạt 49 chưa phù hợp và đã bị từ chối.	APPLICATION	1128	2026-10-15 20:56:33	2026-10-15 20:56:33
329	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thanh Linh vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1267	2026-10-15 21:02:42	2026-10-15 21:02:42
330	83	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Hệ thống Phát Đạt 49 đã được chấp nhận.	APPLICATION	1185	2026-10-17 00:57:41	2026-10-17 00:57:41
331	33	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Ngọc Linh vừa ứng tuyển vị trí Cộng tác viên Tuyển sinh.	APPLICATION	1153	2026-10-17 10:44:58	2026-10-17 10:44:58
332	102	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Tập đoàn Phát Đạt 47 chưa phù hợp và đã bị từ chối.	APPLICATION	1009	2026-10-17 15:10:36	2026-10-17 15:10:36
333	46	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Minh Đạt vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1022	2026-10-17 15:24:43	2026-10-17 15:24:43
334	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1094	2026-10-17 16:56:10	2026-10-17 16:56:10
335	110	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH TechNova 32 chưa phù hợp và đã bị từ chối.	APPLICATION	1240	2026-10-17 18:00:18	2026-10-17 18:00:18
336	9	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Quang Tâm vừa ứng tuyển vị trí Pha chế (Barista) ca tối.	APPLICATION	1074	2026-10-17 19:38:00	2026-10-17 19:38:00
337	83	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tuyển sinh tại Hệ thống Đại Dương 33 chưa phù hợp và đã bị từ chối.	APPLICATION	1153	\N	2026-10-18 12:21:56
338	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Thanh Giang vừa ứng tuyển vị trí Thực tập sinh Back-end (NodeJS).	APPLICATION	1258	2026-10-18 15:37:54	2026-10-18 15:37:54
339	57	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Công ty TNHH Việt Nova chưa phù hợp và đã bị từ chối.	APPLICATION	1267	2026-10-18 15:42:41	2026-10-18 15:42:41
340	49	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Đức Nam vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1012	2026-10-18 15:47:58	2026-10-18 15:47:58
341	3	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Thị Dung vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1110	2026-10-18 16:12:08	2026-10-18 16:12:08
342	34	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Quang Đạt vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1102	2026-10-18 17:03:01	2026-10-18 17:03:01
343	69	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Pha chế (Barista) ca tối tại Hệ thống Việt Tín 9 chưa phù hợp và đã bị từ chối.	APPLICATION	1074	2026-10-18 21:21:57	2026-10-18 21:21:57
344	83	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Tập đoàn Phát Đạt 47 chưa phù hợp và đã bị từ chối.	APPLICATION	1163	2026-10-19 20:12:40	2026-10-19 20:12:40
345	79	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty TNHH Hoàn Cầu 3 chưa phù hợp và đã bị từ chối.	APPLICATION	1110	2026-10-20 00:05:10	2026-10-20 00:05:10
346	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Tuấn Oanh vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1254	2026-10-20 07:28:30	2026-10-20 07:28:30
347	96	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tuyển sinh tại Hệ thống Đại Dương 33 chưa phù hợp và đã bị từ chối.	APPLICATION	1069	2026-10-20 19:57:47	2026-10-20 19:57:47
348	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Minh Trâm vừa ứng tuyển vị trí Thực tập sinh Back-end (NodeJS).	APPLICATION	1257	2026-10-20 20:46:39	2026-10-20 20:46:39
349	10	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thị Yến vừa ứng tuyển vị trí Pha chế (Barista) ca tối.	APPLICATION	1126	2026-10-21 08:18:07	2026-10-21 08:18:07
350	34	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Tuấn Oanh vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1232	2026-10-21 08:40:30	2026-10-21 08:40:30
351	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Minh Khang vừa ứng tuyển vị trí Thực tập sinh Back-end (NodeJS).	APPLICATION	1256	2026-10-21 19:02:24	2026-10-21 19:02:24
352	56	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Hộ kinh doanh Phát Đạt 46 chưa phù hợp và đã bị từ chối.	APPLICATION	1022	2026-10-21 19:16:29	2026-10-21 19:16:29
353	16	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Đạt vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1093	2026-10-21 19:43:37	2026-10-21 19:43:37
354	47	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thu Hòa vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1114	2026-10-22 19:03:27	2026-10-22 19:03:27
355	48	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thanh Dung vừa ứng tuyển vị trí Giao hàng (Shipper) đồ ăn.	APPLICATION	1039	2026-10-22 19:58:56	2026-10-22 19:58:56
356	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1253	2026-10-22 20:22:08	2026-10-22 20:22:08
357	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thu Hòa vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1122	2026-10-23 09:55:13	2026-10-23 09:55:13
358	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Tuấn Vy vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1018	2026-10-24 09:58:16	2026-10-24 09:58:16
359	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Hồng Tuấn vừa ứng tuyển vị trí Thực tập sinh Back-end (NodeJS).	APPLICATION	1259	2026-10-24 11:31:50	2026-10-24 11:31:50
360	75	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) tại Hệ thống Thành Công 28 chưa phù hợp và đã bị từ chối.	APPLICATION	1122	2026-10-24 15:17:25	2026-10-24 15:17:25
361	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Tuấn Thảo vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1252	2026-10-24 18:35:51	2026-10-24 18:35:51
362	16	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Hòa vừa ứng tuyển vị trí Data Entry part-time.	APPLICATION	1149	2026-10-24 20:29:51	2026-10-24 20:29:51
363	94	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Tập đoàn Giao Hàng Nhanh 16 chưa phù hợp và đã bị từ chối.	APPLICATION	1093	2026-10-25 00:43:31	2026-10-25 00:43:31
364	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Đình Anh vừa ứng tuyển vị trí Kiểm kho part-time.	APPLICATION	1047	2026-10-25 07:04:56	2026-10-25 07:04:56
365	39	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Ngô Văn Hương vừa ứng tuyển vị trí Nhân viên Đóng gói sản phẩm.	APPLICATION	1233	2026-10-25 07:22:46	2026-10-25 07:22:46
366	55	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Công ty Cổ phần Sáng Tạo Mới 34 chưa phù hợp và đã bị từ chối.	APPLICATION	1232	2026-10-25 11:36:22	2026-10-25 11:36:22
367	47	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1027	2026-10-25 12:57:28	2026-10-25 12:57:28
368	108	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) tại Công ty TNHH Việt Nova chưa phù hợp và đã bị từ chối.	APPLICATION	1253	2026-10-25 14:17:19	2026-10-25 14:17:19
369	5	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hữu Anh vừa ứng tuyển vị trí Data Entry part-time.	APPLICATION	1198	2026-10-25 19:33:27	2026-10-25 19:33:27
370	74	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) tại Công ty TNHH Việt Nova chưa phù hợp và đã bị từ chối.	APPLICATION	1258	2026-10-26 11:00:39	2026-10-26 11:00:39
371	18	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lý Thị Nhi vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1238	2026-10-26 14:25:13	2026-10-26 14:25:13
372	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Thanh Đức vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1117	2026-10-26 14:46:23	2026-10-26 14:46:23
373	17	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Hoàng Bình vừa ứng tuyển vị trí Data Entry part-time.	APPLICATION	1064	2026-10-26 14:54:14	2026-10-26 14:54:14
374	34	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Bảo Tuấn vừa ứng tuyển vị trí Data Entry part-time.	APPLICATION	1092	2026-10-26 14:59:51	2026-10-26 14:59:51
375	43	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thanh Dung vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1034	2026-10-26 17:28:28	2026-10-26 17:28:28
376	108	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Tập đoàn Phát Đạt 47 chưa phù hợp và đã bị từ chối.	APPLICATION	1027	\N	2026-10-26 21:25:14
377	101	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) tại Công ty TNHH Việt Nova đã được chấp nhận.	APPLICATION	1257	\N	2026-10-27 07:17:23
378	35	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Đình Anh vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1099	\N	2026-10-27 07:42:29
379	17	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Hòa vừa ứng tuyển vị trí Data Entry part-time.	APPLICATION	1084	\N	2026-10-27 09:44:36
380	30	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Đình Cường vừa ứng tuyển vị trí Nhập liệu sản xuất part-time.	APPLICATION	1216	2026-10-27 12:21:13	2026-10-27 12:21:13
381	18	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Nhi vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1085	\N	2026-10-27 15:36:13
382	48	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Võ Tuấn Yến vừa ứng tuyển vị trí Giao hàng (Shipper) đồ ăn.	APPLICATION	1107	\N	2026-10-27 18:57:58
383	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Đạt vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1150	\N	2026-10-27 21:59:41
384	42	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Quang Bình vừa ứng tuyển vị trí Đóng gói bưu phẩm.	APPLICATION	1202	\N	2026-10-28 11:31:40
385	64	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Kiểm kho part-time tại Công ty TNHH Việt Tín 38 chưa phù hợp và đã bị từ chối.	APPLICATION	1047	\N	2026-10-28 12:48:44
386	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Minh Khang vừa ứng tuyển vị trí Thực tập sinh Front-end (ReactJS).	APPLICATION	1251	\N	2026-10-28 12:55:16
387	42	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Minh Đạt vừa ứng tuyển vị trí Nhân viên Soạn hàng ca đêm.	APPLICATION	1087	\N	2026-10-28 15:04:06
388	9	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Đình Thảo vừa ứng tuyển vị trí Pha chế (Barista) ca tối.	APPLICATION	1068	\N	2026-10-28 16:16:13
389	51	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Thị Oanh vừa ứng tuyển vị trí Khảo sát thị trường cuối tuần.	APPLICATION	1144	\N	2026-10-28 17:31:25
390	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Văn Bình vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1151	\N	2026-10-28 18:50:15
391	82	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) tại Hệ thống Thành Công 28 chưa phù hợp và đã bị từ chối.	APPLICATION	1117	\N	2026-10-28 20:04:10
392	110	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Công ty Cổ phần Giao Hàng Nhanh 18 chưa phù hợp và đã bị từ chối.	APPLICATION	1238	\N	2026-10-28 21:35:16
393	61	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Data Entry part-time tại Tập đoàn Giao Hàng Nhanh 16 chưa phù hợp và đã bị từ chối.	APPLICATION	1149	\N	2026-10-29 03:39:52
394	33	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Thanh Linh vừa ứng tuyển vị trí Cộng tác viên Tuyển sinh.	APPLICATION	1005	\N	2026-10-29 10:49:59
395	34	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Huỳnh Đình Cường vừa ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk.	APPLICATION	1103	\N	2026-10-29 11:09:41
396	42	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hồng Thảo vừa ứng tuyển vị trí Đóng gói bưu phẩm.	APPLICATION	1124	\N	2026-10-29 12:47:29
397	10	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Hoàng Hòa vừa ứng tuyển vị trí Pha chế (Barista) ca tối.	APPLICATION	1195	\N	2026-10-29 13:02:06
398	123	APPLICATION_ACCEPTED	Thông báo: APPLICATION_ACCEPTED	Đơn ứng tuyển vị trí Thực tập sinh Back-end (NodeJS) tại Công ty TNHH Việt Nova đã được chấp nhận.	APPLICATION	1256	\N	2026-10-29 13:15:17
399	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hoàng Hoàng Nhi vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1066	\N	2026-10-29 17:04:20
400	56	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Soạn hàng ca đêm tại Hộ kinh doanh Việt Tín 42 chưa phù hợp và đã bị từ chối.	APPLICATION	1087	\N	2026-10-29 19:16:03
401	118	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Pha chế (Barista) ca tối tại Hệ thống Việt Tín 9 chưa phù hợp và đã bị từ chối.	APPLICATION	1068	2026-10-29 20:54:29	2026-10-29 20:54:29
402	120	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hệ thống Thành Công 28 chưa phù hợp và đã bị từ chối.	APPLICATION	1151	\N	2026-10-30 02:05:19
403	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1131	\N	2026-10-30 08:08:04
404	11	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hữu Anh vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1001	\N	2026-10-30 09:08:06
405	37	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Bảo Bình vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1088	\N	2026-10-30 11:45:55
406	58	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Hỗ trợ Kỹ thuật IT Helpdesk tại Công ty Cổ phần Sáng Tạo Mới 34 chưa phù hợp và đã bị từ chối.	APPLICATION	1103	\N	2026-10-30 14:48:45
407	126	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Dương Hồng Sơn vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1255	\N	2026-10-30 15:01:36
408	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Nguyễn Hữu Sơn vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1146	\N	2026-10-30 15:38:32
409	18	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hoàng Hoàng Nhi vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1010	\N	2026-10-30 16:56:54
410	28	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phan Ngọc Linh vừa ứng tuyển vị trí Cộng tác viên Tester (Manual).	APPLICATION	1015	\N	2026-10-30 17:33:04
411	38	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hoàng Hòa vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1236	\N	2026-10-30 18:06:40
412	11	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Đức Nam vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1266	\N	2026-10-30 20:37:39
413	18	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Hồ Ngọc Thành vừa ứng tuyển vị trí Cộng tác viên Bán hàng.	APPLICATION	1226	2026-10-30 21:56:02	2026-10-30 21:56:02
414	71	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Data Entry part-time tại Công ty TNHH Foody 17 chưa phù hợp và đã bị từ chối.	APPLICATION	1064	2026-10-30 23:15:03	2026-10-30 23:15:03
415	40	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đỗ Bảo Tuấn vừa ứng tuyển vị trí Trợ lý kỹ thuật part-time.	APPLICATION	1224	\N	2026-10-31 09:35:25
416	33	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Thanh Đức vừa ứng tuyển vị trí Cộng tác viên Tuyển sinh.	APPLICATION	1132	\N	2026-10-31 11:32:21
417	39	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Lê Hồng Thảo vừa ứng tuyển vị trí Nhân viên Đóng gói sản phẩm.	APPLICATION	1215	\N	2026-10-31 13:27:31
418	44	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Ngọc Minh vừa ứng tuyển vị trí Nhân viên Trưng bày sản phẩm.	APPLICATION	1169	\N	2026-10-31 13:39:46
419	5	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Đình Thảo vừa ứng tuyển vị trí Data Entry part-time.	APPLICATION	1058	\N	2026-10-31 15:12:15
420	40	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Vũ Đình Thảo vừa ứng tuyển vị trí Trợ lý kỹ thuật part-time.	APPLICATION	1155	2026-10-31 15:24:59	2026-10-31 15:24:59
421	32	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Đặng Thanh Đức vừa ứng tuyển vị trí Phân loại hàng hóa.	APPLICATION	1164	2026-10-31 16:21:46	2026-10-31 16:21:46
422	45	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Phạm Đức Hòa vừa ứng tuyển vị trí Tư vấn viên Telesales.	APPLICATION	1083	\N	2026-10-31 20:28:52
423	6	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Trần Thị Yến vừa ứng tuyển vị trí Nhập liệu sản xuất part-time.	APPLICATION	1143	\N	2026-10-31 20:50:43
424	40	NEW_APPLICATION	Thông báo: NEW_APPLICATION	Sinh viên Bùi Hoàng Hải vừa ứng tuyển vị trí Trợ lý kỹ thuật part-time.	APPLICATION	1235	\N	2026-10-31 21:26:43
425	87	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Khảo sát thị trường cuối tuần tại Công ty TNHH Thành Công 43 chưa phù hợp và đã bị từ chối.	APPLICATION	1034	\N	2026-11-01 00:22:36
426	63	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH Việt Tín 38 chưa phù hợp và đã bị từ chối.	APPLICATION	1131	\N	2026-11-01 11:41:07
427	61	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH Việt Tín 38 chưa phù hợp và đã bị từ chối.	APPLICATION	1236	\N	2026-11-01 14:12:05
428	61	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Data Entry part-time tại Công ty TNHH Foody 17 chưa phù hợp và đã bị từ chối.	APPLICATION	1084	\N	2026-11-01 15:02:47
429	105	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hệ thống TechNova 37 chưa phù hợp và đã bị từ chối.	APPLICATION	1088	\N	2026-11-01 15:19:05
430	107	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhập liệu sản xuất part-time tại Tập đoàn Sáng Tạo Mới 6 chưa phù hợp và đã bị từ chối.	APPLICATION	1143	2026-11-01 15:22:34	2026-11-01 15:22:34
431	70	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Trợ lý kỹ thuật part-time tại Công ty TNHH Đại Dương 40 chưa phù hợp và đã bị từ chối.	APPLICATION	1224	\N	2026-11-01 15:36:08
432	64	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Thực tập sinh Front-end (ReactJS) tại Hệ thống Phát Đạt 35 chưa phù hợp và đã bị từ chối.	APPLICATION	1099	\N	2026-11-01 16:27:35
433	60	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Hệ thống Foody 44 chưa phù hợp và đã bị từ chối.	APPLICATION	1169	2026-11-01 21:11:37	2026-11-01 21:11:37
434	118	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Trợ lý kỹ thuật part-time tại Công ty TNHH Đại Dương 40 chưa phù hợp và đã bị từ chối.	APPLICATION	1155	\N	2026-11-01 22:09:59
435	83	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hệ thống Thành Công 28 chưa phù hợp và đã bị từ chối.	APPLICATION	1015	\N	2026-11-01 23:58:47
436	121	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Phân loại hàng hóa tại Công ty TNHH Việt Tín 38 chưa phù hợp và đã bị từ chối.	APPLICATION	1066	2026-11-02 01:44:03	2026-11-02 01:44:03
437	84	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Đóng gói sản phẩm tại Công ty TNHH Giao Hàng Nhanh 39 chưa phù hợp và đã bị từ chối.	APPLICATION	1215	\N	2026-11-02 01:51:16
438	112	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Tư vấn viên Telesales tại Công ty Cổ phần Hoàn Cầu 45 chưa phù hợp và đã bị từ chối.	APPLICATION	1083	\N	2026-11-02 05:55:59
439	63	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Tester (Manual) tại Hệ thống Thành Công 28 chưa phù hợp và đã bị từ chối.	APPLICATION	1146	\N	2026-11-02 08:07:48
440	121	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Cộng tác viên Bán hàng tại Công ty Cổ phần Giao Hàng Nhanh 18 chưa phù hợp và đã bị từ chối.	APPLICATION	1010	\N	2026-11-02 08:38:41
441	118	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Data Entry part-time tại Công ty Cổ phần Đại Dương 5 chưa phù hợp và đã bị từ chối.	APPLICATION	1058	2026-11-02 11:50:13	2026-11-02 11:50:13
442	108	APPLICATION_REJECTED	Thông báo: APPLICATION_REJECTED	Đơn ứng tuyển vị trí Nhân viên Trưng bày sản phẩm tại Tập đoàn Hoàn Cầu 11 chưa phù hợp và đã bị từ chối.	APPLICATION	1001	\N	2026-11-02 13:07:21
448	131	SYSTEM	Chào mừng bạn đến với JobNest	Tài khoản sinh viên đã kích hoạt thành công. Bắt đầu tìm việc ngay!	\N	\N	2026-11-04 02:46:21.65735	2026-11-03 02:28:21.543191
447	131	APPLICATION_STATUS	Đơn ứng tuyển được tiếp nhận	Nhà tuyển dụng đã xem hồ sơ của bạn cho vị trí Part-time.	\N	\N	2026-11-04 02:46:21.65735	2026-11-04 00:28:21.543191
450	54	PROPOSAL_ACCEPTED	Đề xuất được chấp nhận	Đề xuất của bạn cho dự án "Thiết kế Banner Sự Kiện & UI Landing Page" đã được chấp nhận! Hợp đồng làm việc đã được khởi tạo.	PROPOSAL	1	\N	2026-11-04 05:06:04.898379
451	54	ASSIGNMENT_IN_PROGRESS	Công việc đã bắt đầu	Công việc "Thiết kế Banner Sự Kiện & UI Landing Page" đã chuyển sang trạng thái đang thực hiện (IN_PROGRESS).	ASSIGNMENT	589	\N	2026-11-04 05:06:14.137364
449	132	APPLICATION	Ứng viên mới nộp hồ sơ	Sinh viên Dương Hữu Anh vừa nộp đơn ứng tuyển cho tin tuyển dụng #238	\N	\N	2026-11-04 05:55:21.341671	2026-11-04 04:40:56.292868
452	132	PROPOSAL_RECEIVED	Bạn nhận được đề xuất Freelance mới	Một sinh viên vừa gửi đề xuất báo giá cho dự án "Thiết kế Banner Sự Kiện & UI Landing Page".	PROPOSAL	2	2026-11-06 07:47:35.525407	2026-11-06 07:43:44.65676
453	127	JOB	Tin tuyển dụng đã được phê duyệt	Tin tuyển dụng "Nhân viên Phục vụ ca sáng" đã được Quản trị viên duyệt và công khai trên thị trường việc làm.	JOB	229	\N	2026-11-06 07:48:12.450568
454	130	JOB	Tin tuyển dụng bị từ chối phê duyệt	Tin tuyển dụng "Cộng tác viên Tuyển sinh" không được phê duyệt. Lý do: ko hợp lý	JOB	230	\N	2026-11-06 07:48:21.843792
\.


--
-- Data for Name: part_time_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.part_time_details (job_id, shift_description, weekly_schedule, hours_per_week) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
1	123	4a8eec4925826f4b60526d7ac3c0a9b61ef54ac19233bafce2f4a13eb49395d2	2026-10-30 09:25:00	2026-10-30 09:14:00	2026-10-30 09:10:00
2	53	f449a51a13d3252d50ea7a5f3e8b745a67db69dc286d652eeb5e9e1dc4aa439b	2026-10-31 20:15:00	\N	2026-10-31 20:00:00
3	3	153ddb4f2d83d530486654efd3fe22d4214b7476011c86f6390197bfda46a9c2	2026-10-28 14:45:00	2026-10-28 14:36:00	2026-10-28 14:30:00
4	60	de7efbfb8a5cb8bfc32fb23010d6301eac78062f932acbf0fece6036cb399d61	2026-11-01 08:20:00	\N	2026-11-01 08:05:00
5	126	90b7de3c81bca701227e702d5d5410e1495931c9191b8909fa650f2c318ba0fd	2026-11-02 16:40:00	\N	2026-11-02 16:25:00
6	124	b4cd6d4c524ea9af4f572a0edfa078d043b77e8161ce07f0841380ef5449bed5	2026-11-01 22:55:00	2026-11-01 22:43:00	2026-11-01 22:40:00
\.


--
-- Data for Name: proposal_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_histories (id, proposal_id, from_status, to_status, changed_by, note, created_at) FROM stdin;
\.


--
-- Data for Name: report_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_actions (id, report_id, admin_id, action, note, created_at) FROM stdin;
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, reporter_id, target_type, target_id, reason, description, status, created_at) FROM stdin;
1	1	JOB	101	Thông tin lương không rõ ràng	Tin tuyển dụng để mức lương quá cao so với thực tế và yêu cầu đặt cọc phí giữ chỗ.	OPEN	2026-11-02 06:38:24.469038
2	1	USER	2	Hành vi spam tin tuyển dụng ảo	Tài khoản liên tục gửi tin nhắn rác và yêu cầu sinh viên cung cấp mã OTP ngân hàng.	OPEN	2026-11-03 06:38:24.469038
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, job_id, reviewer_id, reviewee_id, rating, comment, created_at) FROM stdin;
900	193	96	41	4	Môi trường làm việc thoải mái.	2026-09-16 07:51:41+00
901	218	50	98	3	Sinh viên chăm chỉ, đúng giờ.	2026-09-21 01:03:15+00
902	119	99	46	4	Anh chị quản lý nhiệt tình hỗ trợ.	2026-09-07 01:14:39+00
903	167	104	25	5	Nhà tuyển dụng trả lương đúng hạn.	2026-09-28 16:45:56+00
904	201	36	110	5	Sinh viên chăm chỉ, đúng giờ.	2026-09-07 08:58:54+00
905	106	36	77	3	Hoàn thành tốt công việc được giao.	2026-09-22 08:38:41+00
906	181	121	5	4	Anh chị quản lý nhiệt tình hỗ trợ.	2026-09-17 08:52:00+00
907	113	18	113	3	Sinh viên chăm chỉ, đúng giờ.	2026-08-31 15:18:05+00
908	112	56	32	5	Nhà tuyển dụng trả lương đúng hạn.	2026-10-01 03:45:23+00
909	120	48	63	4	Sinh viên chăm chỉ, đúng giờ.	2026-10-02 15:47:54+00
910	151	19	100	4	Sinh viên chăm chỉ, đúng giờ.	2026-09-01 23:45:51+00
911	151	100	19	4	Môi trường làm việc thoải mái.	2026-09-01 00:32:51+00
912	214	99	44	5	Nhà tuyển dụng trả lương đúng hạn.	2026-09-25 21:24:02+00
913	182	36	122	5	Sinh viên chăm chỉ, đúng giờ.	2026-10-15 14:47:52+00
914	139	97	45	4	Môi trường làm việc thoải mái.	2026-10-08 18:19:43+00
915	133	54	6	5	Nhà tuyển dụng trả lương đúng hạn.	2026-09-27 18:12:22+00
916	169	10	87	3	Hoàn thành tốt công việc được giao.	2026-09-17 20:12:25+00
917	169	87	10	4	Môi trường làm việc thoải mái.	2026-09-18 21:38:25+00
918	136	23	105	5	Nhanh nhẹn, thái độ tốt.	2026-09-13 22:08:15+00
919	136	105	23	4	Anh chị quản lý nhiệt tình hỗ trợ.	2026-09-11 01:11:15+00
920	181	5	109	4	Sinh viên chăm chỉ, đúng giờ.	2026-09-15 05:07:14+00
921	132	50	107	5	Nhanh nhẹn, thái độ tốt.	2026-10-10 04:51:26+00
922	117	56	31	4	Nhà tuyển dụng trả lương đúng hạn.	2026-09-17 16:54:38+00
923	211	111	23	4	Anh chị quản lý nhiệt tình hỗ trợ.	2026-09-25 10:24:37+00
924	124	32	113	5	Hoàn thành tốt công việc được giao.	2026-10-02 08:14:26+00
925	172	20	84	4	Sinh viên chăm chỉ, đúng giờ.	2026-10-05 02:46:37+00
926	172	84	20	4	Anh chị quản lý nhiệt tình hỗ trợ.	2026-10-01 01:34:37+00
927	146	37	110	3	Sinh viên chăm chỉ, đúng giờ.	2026-09-28 05:25:10+00
928	187	44	72	3	Hoàn thành tốt công việc được giao.	2026-09-26 18:12:17+00
929	208	8	122	5	Nhanh nhẹn, thái độ tốt.	2026-10-07 00:17:36+00
930	208	122	8	5	Nhà tuyển dụng trả lương đúng hạn.	2026-10-03 01:08:36+00
931	195	25	74	4	Hoàn thành tốt công việc được giao.	2026-08-21 04:35:43+00
932	162	101	26	4	Anh chị quản lý nhiệt tình hỗ trợ.	2026-09-20 15:04:18+00
933	129	21	101	3	Sinh viên chăm chỉ, đúng giờ.	2026-08-24 23:28:28+00
934	174	12	108	3	Nhanh nhẹn, thái độ tốt.	2026-09-16 02:45:38+00
935	174	108	12	4	Môi trường làm việc thoải mái.	2026-09-17 23:55:38+00
936	224	123	126	5	Môi trường làm việc thoải mái, được hướng dẫn tận tình.	2026-09-22 13:14:53+00
937	224	126	123	5	Sinh viên chăm chỉ, đúng giờ.	2026-09-21 10:07:41+00
938	224	126	80	4	Hoàn thành tốt công việc được giao.	2026-09-26 13:40:18+00
939	225	126	123	5	Nhanh nhẹn, thái độ tốt.	2026-10-02 11:59:37+00
940	106	77	36	1	Công việc không đúng như tin tuyển dụng.	2026-09-25 08:00:41+00
941	112	32	56	5	Chủ động học hỏi, phối hợp tốt với đồng nghiệp.	2026-10-02 07:37:23+00
942	113	113	18	5	Anh chị quản lý nhiệt tình hỗ trợ.	2026-08-26 13:08:05+00
943	116	63	5	5	Môi trường làm việc thoải mái.	2026-09-18 02:30:21+00
944	119	46	99	4	Đúng giờ, hoàn thành đúng yêu cầu.	2026-09-04 22:05:39+00
945	120	63	48	4	Môi trường tốt, thỉnh thoảng hơi nhiều việc.	2026-10-01 13:34:54+00
946	123	122	46	1	Trả lương chậm và thiếu hỗ trợ.	2026-10-10 16:01:39+00
947	133	6	54	3	Hoàn thành công việc ở mức trung bình.	2026-09-28 15:16:22+00
948	149	70	39	5	Được hướng dẫn tận tình, sẽ làm lại nếu có cơ hội.	2026-08-28 00:18:03+00
949	150	103	39	3	Công việc ổn nhưng lịch làm đôi khi thay đổi sát giờ.	2026-09-19 00:51:45+00
950	157	63	42	4	Lương đúng hạn, lịch làm khá phù hợp.	2026-10-04 09:17:10+00
951	159	69	50	4	Môi trường tốt, thỉnh thoảng hơi nhiều việc.	2026-09-28 17:11:16+00
952	159	50	69	4	Đúng giờ, hoàn thành đúng yêu cầu.	2026-09-30 15:48:16+00
953	159	76	50	5	Công việc đúng như mô tả, lịch làm linh hoạt.	2026-09-29 16:07:23+00
954	167	25	104	3	Thỉnh thoảng đi trễ nhưng có báo trước.	2026-09-30 22:05:56+00
955	181	109	5	5	Môi trường làm việc thoải mái.	2026-09-12 23:51:14+00
956	181	5	121	4	Đúng giờ, hoàn thành đúng yêu cầu.	2026-09-21 05:56:00+00
957	187	72	44	3	Lương đúng hạn nhưng ít hướng dẫn ban đầu.	2026-09-27 22:18:17+00
958	193	41	96	5	Hoàn thành tốt công việc được giao.	2026-09-15 06:53:41+00
959	194	61	36	5	Môi trường làm việc thoải mái.	2026-09-05 04:12:49+00
960	194	36	61	5	Chủ động học hỏi, phối hợp tốt với đồng nghiệp.	2026-09-07 04:11:49+00
961	197	122	13	3	Lương đúng hạn nhưng ít hướng dẫn ban đầu.	2026-10-21 01:06:59+00
962	197	13	122	5	Sinh viên chăm chỉ, đúng giờ.	2026-10-21 03:32:59+00
963	201	110	36	1	Công việc không đúng như tin tuyển dụng.	2026-09-12 05:56:54+00
964	204	97	38	1	Công việc không đúng như tin tuyển dụng.	2026-09-10 09:03:00+00
965	211	23	111	4	Làm việc ổn định, cần chủ động hơn.	2026-09-25 11:28:37+00
966	214	44	99	5	Chủ động học hỏi, phối hợp tốt với đồng nghiệp.	2026-09-28 02:49:02+00
967	217	105	36	4	Quản lý thân thiện, cần rõ ràng hơn về phân ca.	2026-09-15 14:07:48+00
968	217	36	105	1	Nghỉ việc không báo trước.	2026-09-14 11:12:48+00
969	218	82	50	2	Thanh toán lương chậm vài ngày.	2026-09-12 13:46:12+00
\.


--
-- Data for Name: seasonal_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seasonal_details (job_id, start_date, end_date, schedule_description) FROM stdin;
\.


--
-- Data for Name: student_cvs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_cvs (id, student_profile_id, file_key, original_name, mime_type, size_bytes, is_default, created_at) FROM stdin;
\.


--
-- Data for Name: student_educations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_educations (id, student_profile_id, institution, degree, start_date, end_date) FROM stdin;
\.


--
-- Data for Name: student_experiences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_experiences (id, student_profile_id, title, organization, description, start_date, end_date) FROM stdin;
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_profiles (id, user_id, full_name, date_of_birth, school, major, bio, avatar_url, created_at, updated_at, student_code, experience, default_cv_url, skills) FROM stdin;
1	53	Dương Hữu Anh	\N	Đại học Văn Lang	Công nghệ thông tin	Đang học năm 4 ngành Công nghệ thông tin. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Duong_Huu_Anh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
2	54	Vũ Thu Nam	\N	Đại học Văn Lang	Hệ thống thông tin quản lý	Sinh viên năm 2 ngành Hệ thống thông tin quản lý; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Vu_Thu_Nam_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
3	55	Vũ Tuấn Oanh	\N	Đại học Văn Lang	Khoa học dữ liệu	Sinh viên năm 3 ngành Khoa học dữ liệu; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Vu_Tuan_Oanh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
4	56	Phan Minh Đạt	\N	Đại học Văn Lang	Quản trị kinh doanh	Sinh viên năm 3 ngành Quản trị kinh doanh; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Phan_Minh_Dat_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
5	57	Vũ Thanh Linh	\N	Đại học Văn Lang	Quản trị kinh doanh	Sinh viên năm 4 ngành Quản trị kinh doanh; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Vu_Thanh_Linh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
6	58	Huỳnh Đình Cường	\N	Đại học Văn Lang	Khoa học dữ liệu	Đang học năm 4 ngành Khoa học dữ liệu. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Huynh_Dinh_Cuong_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
7	59	Trần Hồng Anh	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 4 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Tran_Hong_Anh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
8	60	Phạm Ngọc Minh	\N	Đại học Văn Lang	Kinh doanh quốc tế	Sinh viên năm 4 ngành Kinh doanh quốc tế; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Pham_Ngoc_Minh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
9	61	Lê Hoàng Hòa	\N	Đại học Văn Lang	Kỹ thuật phần mềm	Đang học năm 2 ngành Kỹ thuật phần mềm. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Le_Hoang_Hoa_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
10	62	Nguyễn Bảo Quân	\N	Đại học Văn Lang	Quản trị nhà hàng - khách sạn	Mình là sinh viên năm 4 ngành Quản trị nhà hàng - khách sạn, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Nguyen_Bao_Quan_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
11	63	Nguyễn Hữu Sơn	\N	Đại học Văn Lang	Marketing	Sinh viên năm 4 ngành Marketing; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Nguyen_Huu_Son_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
12	64	Phan Đình Anh	\N	Đại học Văn Lang	Logistics và Quản lý chuỗi cung ứng	Sinh viên năm 3 ngành Logistics và Quản lý chuỗi cung ứng; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Phan_Dinh_Anh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
13	65	Lý Xuân Yến	\N	Đại học Văn Lang	Logistics và Quản lý chuỗi cung ứng	Đang học năm 3 ngành Logistics và Quản lý chuỗi cung ứng. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Ly_Xuan_Yen_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
14	66	Phạm Thị Giang	\N	Đại học Văn Lang	Marketing	Đang học năm 2 ngành Marketing. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Pham_Thi_Giang_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
15	67	Phạm Hoàng Hòa	\N	Đại học Văn Lang	Khoa học dữ liệu	Sinh viên năm 4 ngành Khoa học dữ liệu; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Pham_Hoang_Hoa_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
16	68	Phan Hoàng Cường	\N	Đại học Văn Lang	Kinh doanh quốc tế	Mình là sinh viên năm 2 ngành Kinh doanh quốc tế, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Phan_Hoang_Cuong_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
17	69	Võ Quang Tâm	\N	Đại học Văn Lang	Quản trị kinh doanh	Sinh viên năm 2 ngành Quản trị kinh doanh; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Vo_Quang_Tam_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
18	70	Đỗ Bảo Tuấn	\N	Đại học Văn Lang	Kỹ thuật điện - điện tử	Đang học năm 3 ngành Kỹ thuật điện - điện tử. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Do_Bao_Tuan_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
19	71	Phạm Hoàng Bình	\N	Đại học Văn Lang	Công nghệ thông tin	Đang học năm 1 ngành Công nghệ thông tin. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Pham_Hoang_Binh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
20	72	Hồ Đức Cường	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 1 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Ho_Duc_Cuong_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
21	73	Dương Quang Đạt	\N	Đại học Văn Lang	Kinh doanh quốc tế	Mình là sinh viên năm 3 ngành Kinh doanh quốc tế, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Duong_Quang_Dat_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
22	74	Phan Thanh Giang	\N	Đại học Văn Lang	Thương mại điện tử	Mình là sinh viên năm 3 ngành Thương mại điện tử, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Phan_Thanh_Giang_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
23	75	Trần Thu Hòa	\N	Đại học Văn Lang	Logistics và Quản lý chuỗi cung ứng	Sinh viên năm 3 ngành Logistics và Quản lý chuỗi cung ứng; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Tran_Thu_Hoa_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
24	76	Trần Ngọc Trâm	\N	Đại học Văn Lang	Thương mại điện tử	Đang học năm 1 ngành Thương mại điện tử. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Tran_Ngoc_Tram_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
25	77	Lý Xuân Khánh	\N	Đại học Văn Lang	Kinh doanh quốc tế	Sinh viên năm 4 ngành Kinh doanh quốc tế; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Ly_Xuan_Khanh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
26	78	Lý Ngọc Trang	\N	Đại học Văn Lang	Marketing	Đang học năm 2 ngành Marketing. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Ly_Ngoc_Trang_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
27	79	Huỳnh Thị Dung	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 4 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Huynh_Thi_Dung_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
28	80	Huỳnh Đình Tuấn	\N	Đại học Văn Lang	Kỹ thuật phần mềm	Sinh viên năm 4 ngành Kỹ thuật phần mềm; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Huynh_Dinh_Tuan_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
29	81	Bùi Đức Minh	\N	Đại học Văn Lang	Hệ thống thông tin quản lý	Đang học năm 4 ngành Hệ thống thông tin quản lý. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Bui_Duc_Minh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
30	82	Đặng Thanh Đức	\N	Đại học Văn Lang	Công nghệ thông tin	Sinh viên năm 3 ngành Công nghệ thông tin; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Dang_Thanh_Duc_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
31	83	Phan Ngọc Linh	\N	Đại học Văn Lang	Hệ thống thông tin quản lý	Đang học năm 1 ngành Hệ thống thông tin quản lý. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Phan_Ngoc_Linh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
32	84	Lê Hồng Thảo	\N	Đại học Văn Lang	Logistics và Quản lý chuỗi cung ứng	Sinh viên năm 1 ngành Logistics và Quản lý chuỗi cung ứng; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Le_Hong_Thao_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
33	85	Nguyễn Hữu Cường	\N	Đại học Văn Lang	Quản trị kinh doanh	Sinh viên năm 2 ngành Quản trị kinh doanh; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Nguyen_Huu_Cuong_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
34	86	Hoàng Thanh Thành	\N	Đại học Văn Lang	Quản trị kinh doanh	Đang học năm 2 ngành Quản trị kinh doanh. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Hoang_Thanh_Thanh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
35	87	Vũ Thanh Dung	\N	Đại học Văn Lang	Quản trị kinh doanh	Sinh viên năm 2 ngành Quản trị kinh doanh; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Vu_Thanh_Dung_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
36	88	Võ Thanh Trâm	\N	Đại học Văn Lang	Marketing	Sinh viên năm 4 ngành Marketing; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Vo_Thanh_Tram_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
37	89	Lê Hồng Vy	\N	Đại học Văn Lang	Quản trị kinh doanh	Đang học năm 4 ngành Quản trị kinh doanh. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Le_Hong_Vy_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
38	90	Nguyễn Tuấn Hương	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 3 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Nguyen_Tuan_Huong_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
39	91	Đặng Đức Hương	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 4 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Dang_Duc_Huong_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
40	92	Đỗ Quang Anh	\N	Đại học Văn Lang	Marketing	Sinh viên năm 1 ngành Marketing; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Do_Quang_Anh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
41	93	Hồ Ngọc Nhi	\N	Đại học Văn Lang	Hệ thống thông tin quản lý	Mình là sinh viên năm 3 ngành Hệ thống thông tin quản lý, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Ho_Ngoc_Nhi_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
42	94	Lê Hoàng Đạt	\N	Đại học Văn Lang	Kỹ thuật phần mềm	Mình là sinh viên năm 2 ngành Kỹ thuật phần mềm, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Le_Hoang_Dat_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
43	95	Vũ Bảo Khoa	\N	Đại học Văn Lang	Kinh doanh quốc tế	Đang học năm 1 ngành Kinh doanh quốc tế. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Vu_Bao_Khoa_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
44	96	Dương Hữu Giang	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 1 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Duong_Huu_Giang_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
45	97	Đỗ Tuấn Thảo	\N	Đại học Văn Lang	Marketing	Đang học năm 4 ngành Marketing. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Do_Tuan_Thao_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
46	98	Võ Hoàng Bình	\N	Đại học Văn Lang	Marketing	Sinh viên năm 1 ngành Marketing; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Vo_Hoang_Binh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
47	99	Bùi Đức Nam	\N	Đại học Văn Lang	Kinh doanh quốc tế	Sinh viên năm 2 ngành Kinh doanh quốc tế; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Bui_Duc_Nam_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
48	100	Hồ Ngọc Thành	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 2 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Ho_Ngoc_Thanh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
49	101	Vũ Minh Trâm	\N	Đại học Văn Lang	Kinh doanh quốc tế	Đang học năm 4 ngành Kinh doanh quốc tế. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Vu_Minh_Tram_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
50	102	Vũ Hồng Tuấn	\N	Đại học Văn Lang	Quản trị kinh doanh	Đang học năm 3 ngành Quản trị kinh doanh. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Vu_Hong_Tuan_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
51	103	Dương Hồng Sơn	\N	Đại học Văn Lang	Công nghệ kỹ thuật ô tô	Đang học năm 3 ngành Công nghệ kỹ thuật ô tô. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Duong_Hong_Son_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
52	104	Đặng Quang Khoa	\N	Đại học Văn Lang	Khoa học dữ liệu	Sinh viên năm 3 ngành Khoa học dữ liệu; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Dang_Quang_Khoa_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
53	105	Vũ Bảo Bình	\N	Đại học Văn Lang	Thương mại điện tử	Sinh viên năm 2 ngành Thương mại điện tử; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Vu_Bao_Binh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
54	106	Võ Tuấn Vy	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 3 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Vo_Tuan_Vy_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
55	107	Trần Thị Yến	\N	Đại học Văn Lang	Quản trị kinh doanh	Đang học năm 2 ngành Quản trị kinh doanh. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Tran_Thi_Yen_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
56	108	Bùi Hữu Anh	\N	Đại học Văn Lang	Khoa học dữ liệu	Mình là sinh viên năm 2 ngành Khoa học dữ liệu, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Bui_Huu_Anh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
57	109	Ngô Văn Hương	\N	Đại học Văn Lang	Công nghệ kỹ thuật ô tô	Đang học năm 3 ngành Công nghệ kỹ thuật ô tô. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Ngo_Van_Huong_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
58	110	Lý Thị Nhi	\N	Đại học Văn Lang	Marketing	Đang học năm 4 ngành Marketing. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Ly_Thi_Nhi_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
59	111	Nguyễn Hữu Hòa	\N	Đại học Văn Lang	Ngôn ngữ Anh	Đang học năm 2 ngành Ngôn ngữ Anh. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Nguyen_Huu_Hoa_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
60	112	Phạm Đức Hòa	\N	Đại học Văn Lang	Kinh doanh quốc tế	Mình là sinh viên năm 1 ngành Kinh doanh quốc tế, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Pham_Duc_Hoa_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
61	113	Lê Ngọc Hải	\N	Đại học Văn Lang	Kinh doanh quốc tế	Đang học năm 4 ngành Kinh doanh quốc tế. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Le_Ngoc_Hai_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
62	114	Hồ Quang Bình	\N	Đại học Văn Lang	Kỹ thuật điện - điện tử	Mình là sinh viên năm 2 ngành Kỹ thuật điện - điện tử, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Ho_Quang_Binh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
63	115	Huỳnh Thị Oanh	\N	Đại học Văn Lang	Logistics và Quản lý chuỗi cung ứng	Sinh viên năm 3 ngành Logistics và Quản lý chuỗi cung ứng; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Huynh_Thi_Oanh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
64	116	Phan Đình Giang	\N	Đại học Văn Lang	Hệ thống thông tin quản lý	Mình là sinh viên năm 2 ngành Hệ thống thông tin quản lý, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Phan_Dinh_Giang_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
65	117	Võ Tuấn Yến	\N	Đại học Văn Lang	Quản trị kinh doanh	Mình là sinh viên năm 3 ngành Quản trị kinh doanh, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Vo_Tuan_Yen_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
66	118	Vũ Đình Thảo	\N	Đại học Văn Lang	Kỹ thuật điện - điện tử	Đang học năm 1 ngành Kỹ thuật điện - điện tử. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Vu_Dinh_Thao_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
67	119	Trần Xuân Đạt	\N	Đại học Văn Lang	Quản trị kinh doanh	Đang học năm 2 ngành Quản trị kinh doanh. Có thể làm việc vào cuối tuần và các buổi không có tiết học.	uploads/cv/CV_Tran_Xuan_Dat_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
68	120	Bùi Văn Bình	\N	Đại học Văn Lang	Marketing	Mình là sinh viên năm 3 ngành Marketing, mong muốn tìm việc part-time phù hợp lịch học để tích lũy kinh nghiệm.	uploads/cv/CV_Bui_Van_Binh_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
69	121	Hoàng Hoàng Nhi	\N	Đại học Văn Lang	Marketing	Sinh viên năm 3 ngành Marketing; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Hoang_Hoang_Nhi_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
70	122	Bùi Hoàng Hải	\N	Đại học Văn Lang	Kinh doanh quốc tế	Sinh viên năm 3 ngành Kinh doanh quốc tế; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Bui_Hoang_Hai_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
71	123	Nguyễn Minh Khang	\N	Đại học Văn Lang	Hệ thống thông tin quản lý	Sinh viên năm 4 ngành Hệ thống thông tin quản lý; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Nguyen_Minh_Khang_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
72	124	Lê Thảo Nguyên	\N	\N	\N	\N	\N	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
73	125	Phạm Quốc Bảo	\N	Đại học Văn Lang	Kỹ thuật phần mềm	Sinh viên năm 2 ngành Kỹ thuật phần mềm; chăm chỉ, đúng giờ và sẵn sàng học hỏi.	uploads/cv/CV_Pham_Quoc_Bao_VLU.pdf	2026-11-03 19:57:36.319565	2026-11-03 19:57:36.319565	\N	\N	\N	\N
74	131	Nguyễn Văn Chí (Sinh Viên Test)	\N	Trường Đại học Văn Lang (VLU)	Công nghệ Thông tin	Sinh viên năm 4 đam mê lập trình web và ứng dụng thực tế.	\N	2026-11-04 01:58:09.55367	2026-11-04 02:28:21.528719	20110001	Đã hoàn thành dự án Website thương mại điện tử, có 6 tháng làm trợ lý kỹ thuật.	https://jobnest.vn/uploads/cv/CV_NguyenVanChi_Default.pdf	{React.js,Node.js,"Giao tiếp","Làm việc nhóm",SQL}
75	134	Lê Quang Anh Tuấn	\N	Trường Đại học Văn Lang (VLU)	Công nghệ Thông tin	Sinh viên năm 4 đam mê lập trình và phát triển kỹ năng mềm. Năng động, cầu tiến, có thể linh hoạt sắp xếp thời gian làm việc.	\N	2026-11-05 21:46:59.540816	2026-11-05 21:47:43.866612	20110001	Đã hoàn thành dự án Web bán hàng ReactJS, có kinh nghiệm phục vụ cafe 6 tháng.	https://jobnest.vn/uploads/cv/CV_LeQuangAnhTuan_Default.pdf	{"Giao tiếp","Làm việc nhóm","Tin học văn phòng",Java,SQL,React.js}
81	137	huynh văn bảo	\N	\N	\N	\N	\N	2026-11-06 07:22:26.693712	2026-11-06 07:22:26.693712	\N	\N	\N	\N
79	136	nguyen thi tuyet	\N	\N	\N	\N	\N	2026-11-06 07:17:29.455084	2026-11-06 07:17:29.455084	\N	\N	\N	\N
77	135	Nguyễn Văn Chí	\N	Trường Đại học Văn Lang (VLU)	Công nghệ Thông tin	Sinh viên năm 4 đam mê lập trình và phát triển kỹ năng mềm. Năng động, cầu tiến, có thể linh hoạt sắp xếp thời gian làm việc.	\N	2026-11-05 21:49:39.735424	2026-11-06 07:20:32.654977	20110001	Ứng tuyển, gửi proposal, nộp sản phẩm ahahs	https://jobnest.vn/uploads/cv/CV_NguyenVanChi_Default.pdf	{"Giao tiếp","Làm việc nhóm","Tin học văn phòng",Java,SQL,React.js}
82	138	hoang thị mai	\N	\N	\N	\N	\N	2026-11-06 07:42:54.009773	2026-11-06 07:42:54.009773	\N	\N	\N	\N
\.


--
-- Data for Name: student_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_skills (id, student_profile_id, skill_name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, phone, role, status, created_at, updated_at) FROM stdin;
1	admin@vlu.edu.vn	$2b$10$i0L8.U00uWYHMqNnYsI0B.QmYuG.jDrQUJ5LSWUOSlUAHF.elEv/y	Nguyễn Văn Quản Trị	0901112223	ADMIN	ACTIVE	2026-06-20 06:08:23+00	2026-07-03 09:13:23+00
2	admin.content@vlu.edu.vn	$2b$10$4cauc8zzlKKvb0dmvrGfJOCsAKLMBCkAr36wUQ6GA94tZVPfmovP.	Lê Thị Kiểm Duyệt	0901112224	ADMIN	ACTIVE	2026-06-20 05:35:06+00	2026-07-11 11:23:06+00
3	hr_3@company.com	$2b$10$2/2VASzf6V/Z9txwVM11JeAfWsT2Gw1IfYvlzZ1sVdtLPIzSnBE8y	Lý Hữu Phong	0955985243	EMPLOYER	ACTIVE	2026-09-22 19:36:50+00	2026-10-03 21:51:50+00
4	hr_4@company.com	$2b$10$9J6XRZSIPLmtuqVtSdqdWuK/qlDDebwkJ5hJA7XeGl7m0ICBpBKRW	Vũ Xuân Trang	0969296070	EMPLOYER	ACTIVE	2026-09-28 02:59:35+00	2026-10-13 07:11:35+00
5	hr_5@company.com	$2b$10$GQX3coiRKvKAjQVd0hCqv.3DrB64Gw5.twcGan4p4OcOSOfUSO2Ja	Trần Thu Vy	0937714575	EMPLOYER	ACTIVE	2026-08-03 21:51:24+00	2026-09-10 00:51:24+00
6	hr_6@company.com	$2b$10$stg7yTNo4l1AVCdBNPac7upQwt0UbZYMj7vp0XvhyLx1Xk3bQVemO	Ngô Hoàng Anh	0957753120	EMPLOYER	ACTIVE	2026-07-26 16:56:21+00	2026-08-25 00:33:21+00
7	hr_7@company.com	$2b$10$qKzdcCYS40TTEn949WsHHOiP4daclTA0MlVzQWXxpnipBU3bZ4GGi	Hồ Thu Cường	0962298440	EMPLOYER	ACTIVE	2026-10-05 20:48:59+00	2026-10-10 03:25:59+00
8	hr_8@company.com	$2b$10$CEz0d9zOx/lxcvZ33Wnf6.gU6wAH7MFYLusdJhUQqz4PuU1H/7.bS	Hồ Minh Nam	0998892558	EMPLOYER	ACTIVE	2026-08-11 23:59:37+00	2026-09-19 02:28:37+00
9	hr_9@company.com	$2b$10$9W.a.gF2ykmqgZvqtnFLk.YoKWWEkvMQmsMXyLbsJvVCe.3Glvfq.	Ngô Văn Tâm	0968518993	EMPLOYER	ACTIVE	2026-08-25 19:50:34+00	2026-09-12 23:46:34+00
10	hr_10@company.com	$2b$10$qiIIKmLfwPnZXodTgltjR.8Cbgw37rRTxMU55iftf1ZrvHi2IhE5.	Võ Tuấn Trang	0959507943	EMPLOYER	ACTIVE	2026-08-14 00:59:34+00	2026-08-27 06:29:34+00
11	hr_11@company.com	$2b$10$ng/xPYA01QX1sLcyCyRv5etJDbaMF1dkcOCxPttG2BXOaHFkTRicK	Hoàng Hồng Yến	0925548233	EMPLOYER	ACTIVE	2026-08-26 17:42:27+00	2026-09-12 19:31:27+00
12	hr_12@company.com	$2b$10$/9YVORwf0ggpsjoba5lh/.c.DGf7CYhcqZB435lV7wbxx425YSsga	Bùi Đức Oanh	0998529664	EMPLOYER	ACTIVE	2026-08-01 22:07:19+00	2026-08-06 03:00:19+00
13	hr_13@company.com	$2b$10$/.HI0oUrq3ZZs3kEGDIOYOa40gslMRe1SZfMI3WqrSyXx.TkR4.cS	Dương Minh Oanh	0913384974	EMPLOYER	ACTIVE	2026-08-15 19:40:16+00	2026-08-28 23:31:16+00
14	hr_14@company.com	$2b$10$R7y3XofZZZxE/my6Ckd/Le3THOs0k74MVnqeFmQX/a6kYpTIFFAne	Hoàng Văn Khánh	0956965612	EMPLOYER	ACTIVE	2026-08-02 01:29:11+00	2026-08-03 07:59:11+00
15	hr_15@company.com	$2b$10$GzeWRNrXYYXzqdff1XK7/eqbbrbhoO0zuIS3T23Om0cV9alRKvOfu	Hoàng Bảo Trâm	0984813495	EMPLOYER	ACTIVE	2026-09-13 20:52:38+00	2026-10-05 23:01:38+00
16	hr_16@company.com	$2b$10$bKZgqCWDRHJdi/IQ5hAo2.terVefee93OVpq9LXshsPd/JIr84joi	Võ Đức Trang	0980079990	EMPLOYER	ACTIVE	2026-08-25 16:52:44+00	2026-08-27 20:24:44+00
17	hr_17@company.com	$2b$10$KIDn8AJq2dCjo6KcsolylupzM9L8.HnwK/TV7CeMmlUkzGRKFg96e	Trần Tuấn Thảo	0927476070	EMPLOYER	ACTIVE	2026-09-30 18:36:35+00	2026-10-11 23:56:35+00
18	hr_18@company.com	$2b$10$jnDkc3arutNwgCcN6SNe9eIw.a3LEO2hJowo83L7OXWC0H4ixlhXS	Huỳnh Thu Hùng	0914312559	EMPLOYER	ACTIVE	2026-07-03 03:00:28+00	2026-07-10 08:04:28+00
19	hr_19@company.com	$2b$10$m0oAukNeqczGB5NO/kGhaemy.XSmKsFW6MYO37I.kTBQcUkjPtOlm	Phạm Thu Nam	0951121070	EMPLOYER	ACTIVE	2026-07-26 18:50:46+00	2026-08-19 02:37:46+00
20	hr_20@company.com	$2b$10$zrAi0tuHNp8e8wVojipFAe8RIBlYdx/qebjW9IpMGdr/wmU05pjtS	Võ Hoàng Trâm	0947856221	EMPLOYER	ACTIVE	2026-08-22 16:24:01+00	2026-09-13 18:47:01+00
21	hr_21@company.com	$2b$10$DikpHVUOueW5N0uC.og1uuI9CkfqednSDfN5dxtvcjagvAMFM5zyK	Đỗ Thị Dung	0950021493	EMPLOYER	ACTIVE	2026-07-14 03:33:50+00	2026-08-20 11:57:50+00
22	hr_22@company.com	$2b$10$5.9O85w1PO6MpMS9ijMVzuRphyaJFxRI2Z/gffDhesdy8AT4nnMLa	Lý Tuấn Hương	0986336870	EMPLOYER	ACTIVE	2026-07-15 03:34:26+00	2026-08-09 09:34:26+00
23	hr_23@company.com	$2b$10$GF.EhUvQby4WWT9kXKjD2.j92oWHRIzNn9RvH2VkRmczK9MTRteXm	Dương Tuấn Cường	0931948586	EMPLOYER	ACTIVE	2026-07-16 01:05:46+00	2026-08-23 06:48:46+00
24	hr_24@company.com	$2b$10$yuqYL0aAyxWGXNLQA298PePuSiHZlBhtu1SDvet5dg6ZKqidSGb9O	Vũ Xuân Dung	0934616307	EMPLOYER	ACTIVE	2026-09-12 21:29:44+00	2026-10-10 04:22:44+00
25	hr_25@company.com	$2b$10$jIzQhLTSXFhabg6CgkQnx.lBZFD8bwVEtncCw1pZjOLKZz6YcmbXS	Ngô Quang Cường	0963847468	EMPLOYER	ACTIVE	2026-07-26 04:33:11+00	2026-08-15 12:57:11+00
26	hr_26@company.com	$2b$10$LA6.G.iX00OZxEA5.BsPi.vnaB8F3t2B9pr5nFQy5Y5MnudH813py	Phạm Thu Tâm	0986462017	EMPLOYER	ACTIVE	2026-08-03 20:46:46+00	2026-09-11 23:14:46+00
27	hr_27@company.com	$2b$10$rlQFcvpvBNYKE.qbD8A/SuwFDbkAqyg8S/zbH4dB9X1lBj/.wxR6i	Lý Bảo Hòa	0950588143	EMPLOYER	ACTIVE	2026-08-17 11:52:45+00	2026-09-12 19:53:45+00
28	hr_28@company.com	$2b$10$2o92h/GjDAbI89e9qInR7uFt89gCuJ9UIDPYPgdPHY6Ae5IgiCGFq	Lê Thị Bình	0965822236	EMPLOYER	ACTIVE	2026-08-19 22:19:27+00	2026-09-01 05:13:27+00
29	hr_29@company.com	$2b$10$YykfnZGBvTF3BQiM2SDHxe8vwoCikwNPHu9rha3wO6KtuiNtzkvWu	Hồ Thu Phúc	0956209166	EMPLOYER	ACTIVE	2026-10-09 01:33:09+00	2026-10-24 08:04:09+00
30	hr_30@company.com	$2b$10$3RS./7iWXo3L689xMLU6yOtd/rgadRDquKp6.trCT.ZxzPfbFiG4.	Dương Thanh Hương	0958914745	EMPLOYER	ACTIVE	2026-10-16 18:17:03+00	2026-10-30 04:09:27+00
31	hr_31@company.com	$2b$10$OMKDj.l5vYzFp6WsdKizmOr6kN.HM4Pf8ixgC9/jOrBTgdyweq/hm	Trần Thu Hải	0966598008	EMPLOYER	ACTIVE	2026-07-21 02:49:48+00	2026-07-24 07:16:48+00
32	hr_32@company.com	$2b$10$clTR7ud1y96Ib1P7hm4boOjbC7OXHTeAjeDrxYJovR1thJb3J/EmS	Hoàng Xuân Trang	0916421188	EMPLOYER	ACTIVE	2026-08-14 00:50:15+00	2026-09-19 02:42:15+00
33	hr_33@company.com	$2b$10$q3EyPUE0VpnFTEcSJqvXaeq.ZR6EfewaQCB2zUmVwhIwKhft2xeHW	Trần Thu Trâm	0991016399	EMPLOYER	ACTIVE	2026-09-18 01:30:21+00	2026-10-23 03:02:21+00
34	hr_34@company.com	$2b$10$SROO/j./QqSvI8.G1O3hPuOOq3Dv23m/TxfSbIDY3.F9NA07f9OlG	Huỳnh Bảo Nhi	0998593920	EMPLOYER	ACTIVE	2026-09-26 16:33:59+00	2026-09-30 19:26:59+00
35	hr_35@company.com	$2b$10$OgjFReDmu54CuU4wUth0se9yjeFig1tg.55ZuCkv7rGiYOxo/6ZnS	Đặng Thị Đức	0981517375	EMPLOYER	ACTIVE	2026-10-07 20:41:17+00	2026-10-24 04:59:17+00
36	hr_36@company.com	$2b$10$Ry7U5MuWuy2OXQWGFbFk8eYs9uU2Z0fSka8GeSOD9C47SqkhYpTsa	Phạm Hoàng Thảo	0934479411	EMPLOYER	ACTIVE	2026-07-13 18:49:40+00	2026-07-16 23:00:40+00
37	hr_37@company.com	$2b$10$Et1hPCLBsqwvBWPP8EcifOeTUzXcdlwaUZle4LNUImNNPou2cxL9W	Hồ Tuấn Anh	0927206795	EMPLOYER	ACTIVE	2026-07-16 20:15:12+00	2026-07-23 02:48:12+00
38	hr_38@company.com	$2b$10$rfkY/rukMaCu6HXjzksB6eejrxBsE8WTUyWysvOBC01mR8YDYzN1K	Võ Quang Vy	0918155890	EMPLOYER	ACTIVE	2026-07-08 16:50:03+00	2026-08-15 21:54:03+00
39	hr_39@company.com	$2b$10$4LN95Y1Ry1NoKno42lUhz.riZohc/Ex6uqfYviw8FL8MI2bjT9RyG	Võ Đức Tâm	0985021757	EMPLOYER	ACTIVE	2026-08-01 19:22:42+00	2026-09-03 23:46:42+00
40	hr_40@company.com	$2b$10$D1yBcz0qSX53u/ikNPdZKu5ribHbjtuKTTW4tmj6sNp9ZZGUy3NoO	Phạm Hữu Tâm	0972184011	EMPLOYER	ACTIVE	2026-09-17 19:11:43+00	2026-09-20 02:12:43+00
41	hr_41@company.com	$2b$10$kG2RV3VHdqRQia0WEHfn6OMfvIsAtcntJmpeVkKgXUzNT601/FDS2	Ngô Văn Sơn	0989541318	EMPLOYER	ACTIVE	2026-07-13 19:57:37+00	2026-07-19 00:04:37+00
42	hr_42@company.com	$2b$10$ebpRmAQprPzcu.BSBfcJf.e6bliaOtLBgBRWaZlXUyWECt8ed/D8e	Huỳnh Đức Cường	0992324893	EMPLOYER	ACTIVE	2026-08-22 18:51:32+00	2026-09-09 21:54:32+00
43	hr_43@company.com	$2b$10$DNvQPaiM3KlBuJYsi4C42uBq3OjpzwT2N1MCtFcqFLUuFV0mcm6IK	Vũ Đình Trang	0954912436	EMPLOYER	ACTIVE	2026-08-14 21:44:09+00	2026-08-16 00:39:09+00
44	hr_44@company.com	$2b$10$.NfsdricQOokvueXPyDSY.8c3Xg8Z2lwPi/3S8Ybhr4gJElzxerRS	Võ Minh Minh	0955311327	EMPLOYER	ACTIVE	2026-08-04 19:28:17+00	2026-08-05 01:45:17+00
45	hr_45@company.com	$2b$10$yQPHMGN7.WyXkua3zXsqpOyimMZRqHq1nyIhAs1jIHhPsrHUJvq/m	Đỗ Thanh Tuấn	0976523223	EMPLOYER	ACTIVE	2026-08-03 21:01:36+00	2026-08-28 02:32:36+00
46	hr_46@company.com	$2b$10$R/o7mO5Jf/JeuDDTxpOKcectSnmf2Fyz0dvDMldmAT59LV8Psum6C	Lý Bảo Hân	0983823912	EMPLOYER	ACTIVE	2026-07-12 22:56:27+00	2026-08-11 01:53:27+00
47	hr_47@company.com	$2b$10$kre5Jx4441iu1LO4yi.Ei.rxJvlUhja/49ttsPw6tlE1gwi/zNWKm	Huỳnh Bảo Phúc	0915575662	EMPLOYER	ACTIVE	2026-09-09 01:18:59+00	2026-09-29 03:04:59+00
48	hr_48@company.com	$2b$10$Dk91A5kB.DcaTlT9dxUA6.kboPaemQHIRDcUAYbIyZOFAr9gc5B26	Hồ Tuấn Tuấn	0965330145	EMPLOYER	ACTIVE	2026-07-30 23:12:14+00	2026-08-09 06:04:14+00
49	hr_49@company.com	$2b$10$v/MPBy88/x/RG0GEP6U5Yu2lU6lQyAuhT2DBx0wnki8LOedpp6Qqu	Bùi Thanh Cường	0979698040	EMPLOYER	ACTIVE	2026-09-03 16:26:15+00	2026-10-08 22:43:15+00
50	hr_50@company.com	$2b$10$LqMx0TUetA/1WxU4ldfwv.Xug4JPiLt8PpQiyX9tNSDq4gHA5tBy.	Đỗ Đức Tuấn	0915731051	EMPLOYER	ACTIVE	2026-08-07 16:50:03+00	2026-08-07 17:54:03+00
51	hr_51@company.com	$2b$10$re9wyaOAv3vALid4AAcLT.XeFTvUjCruQNiiY0q47WvFFyRBOqGMC	Võ Minh Trâm	0920604171	EMPLOYER	ACTIVE	2026-09-05 01:12:48+00	2026-09-19 04:46:48+00
52	hr_52@company.com	$2b$10$Q/vqWqlZ2y6AHyWgxThCceqE/qqJidzbsBcfduY7w.T3FmfBWwLQ6	Phan Hồng Linh	0949498844	EMPLOYER	ACTIVE	2026-10-06 09:06:28+00	2026-10-26 10:47:28+00
53	sv_53@vanlanguni.vn	$2b$10$D44GnCFa/HIFDjDpd47up.1ywki4k9mQ1/SsiGefVFCnkQauFYKPS	Dương Hữu Anh	0955799764	STUDENT	ACTIVE	2026-08-30 09:37:46+00	2026-09-28 17:33:46+00
54	sv_54@vanlanguni.vn	$2b$10$bh9bUFEyBe0Ndc3QtVqkD.03j1XxoQ2kSx9sGTytTKO1dnYrdqgB.	Vũ Thu Nam	0911756474	STUDENT	ACTIVE	2026-07-20 19:09:22+00	2026-08-02 01:03:22+00
55	sv_55@vanlanguni.vn	$2b$10$650BBM0bPTo3awUWEfI16.zHlFRV9uGlDs0I2nP.vrghulqw4APJO	Vũ Tuấn Oanh	0985350553	STUDENT	ACTIVE	2026-07-12 21:05:04+00	2026-07-19 00:03:04+00
56	sv_56@vanlanguni.vn	$2b$10$WKBkBKGkv5bQzikyWTFBpeVnUR.k40aPBjSF/Wok/OwWC8otxs2HS	Phan Minh Đạt	0951103360	STUDENT	ACTIVE	2026-08-12 03:34:23+00	2026-09-14 11:56:23+00
57	sv_57@vanlanguni.vn	$2b$10$kpCA1937EORZJaP.clIVzOjGWWh9PcY2vgEIsHmrOXqVnPxJz0J7C	Vũ Thanh Linh	0968340278	STUDENT	ACTIVE	2026-09-07 17:33:46+00	2026-09-30 22:10:46+00
58	sv_58@vanlanguni.vn	$2b$10$V73yIcKpoARFAVoX3XDaxuMuItik7FvLNdC1QH5aq3LVLx.HDSw3K	Huỳnh Đình Cường	0957112295	STUDENT	ACTIVE	2026-10-06 00:20:58+00	2026-10-19 09:18:50+00
59	sv_59@vanlanguni.vn	$2b$10$qgp8x6CRHqD56qqXWPXnduAVM1/4WTQfHw0znjSOXhIlwcignOAL6	Trần Hồng Anh	0955940314	STUDENT	ACTIVE	2026-08-01 03:15:12+00	2026-08-22 08:29:12+00
60	sv_60@vanlanguni.vn	$2b$10$9tLSBzF1RSEk9La2A33/PeokSFEfETQbwIg4EtlLTglTiwOz28Yy.	Phạm Ngọc Minh	0976874461	STUDENT	ACTIVE	2026-08-24 18:44:34+00	2026-09-23 01:10:34+00
61	sv_61@vanlanguni.vn	$2b$10$sqPBQDdhV5UTrNneVu3Kh.M7zZSh9oF13ljByduO4R56ZWH6Yk76.	Lê Hoàng Hòa	0986775053	STUDENT	ACTIVE	2026-08-06 22:02:49+00	2026-09-08 06:56:49+00
62	sv_62@vanlanguni.vn	$2b$10$bCE0pkIayqHGygeOWU8E8uTYeHweI7UGnw1oEh6uwwa52TWfmF7jW	Nguyễn Bảo Quân	0961638420	STUDENT	ACTIVE	2026-08-21 04:53:08+00	2026-08-24 07:28:08+00
63	sv_63@vanlanguni.vn	$2b$10$iYOIQ47bFo9EC3DnwNYK..GNkl3ZzyoJkcRVyQcUaJK8iOQeLut52	Nguyễn Hữu Sơn	0946113944	STUDENT	ACTIVE	2026-07-19 04:59:44+00	2026-07-26 11:34:44+00
64	sv_64@vanlanguni.vn	$2b$10$J/MDwPIVw4wzdWuIhKbzz.Xyolr/QTYVwIhZJ7trkNKqipPZ3GJYC	Phan Đình Anh	0946419872	STUDENT	ACTIVE	2026-10-12 16:04:43+00	2026-10-22 01:38:37+00
65	sv_65@vanlanguni.vn	$2b$10$piWO8zSKT/lVit8Uf8H48upL/NMFQyrgU0DSEpK9YuWhQc.JY0dI.	Lý Xuân Yến	0991314277	STUDENT	ACTIVE	2026-08-01 01:44:27+00	2026-08-14 09:04:27+00
66	sv_66@vanlanguni.vn	$2b$10$v/ruQEr6nY4444YFrSz7c.okLehBfCdp.BnsAFCwelVHHdb7sS9KK	Phạm Thị Giang	0983987473	STUDENT	ACTIVE	2026-08-29 00:46:20+00	2026-10-03 05:22:20+00
67	sv_67@vanlanguni.vn	$2b$10$524U.J7l1zNMpsZWFmXkFeXDruH11QnuyIjS2ugvIGGtV0eL.80OO	Phạm Hoàng Hòa	0984332920	STUDENT	ACTIVE	2026-08-07 01:07:29+00	2026-08-14 02:07:29+00
68	sv_68@vanlanguni.vn	$2b$10$vyNjRbWOXis9LouKwTVk4.J8mUIjc4l3jvEBWaHmIkxElu98cWd.u	Phan Hoàng Cường	0912341804	STUDENT	ACTIVE	2026-08-25 03:37:13+00	2026-09-05 09:27:13+00
69	sv_69@vanlanguni.vn	$2b$10$EzA2U4.j.HKNCcJTRqc35edn1NCuKSmandMVFiAQOAp2FcMu/nMFe	Võ Quang Tâm	0973847826	STUDENT	ACTIVE	2026-08-27 02:48:16+00	2026-09-24 04:53:16+00
70	sv_70@vanlanguni.vn	$2b$10$UKEbd/tB5RJYPW8.BfIypuv54AJyE.KuyBVwCMTR/YqNStm5qvdnq	Đỗ Bảo Tuấn	0938579027	STUDENT	ACTIVE	2026-08-01 03:06:03+00	2026-08-31 09:26:03+00
71	sv_71@vanlanguni.vn	$2b$10$Z/m0.N252ufKv4U5VISV9u88yKffnSYgicCggYmmS4v4LGRg0j4c.	Phạm Hoàng Bình	0978968582	STUDENT	ACTIVE	2026-08-12 13:15:36+00	2026-08-16 19:55:36+00
72	sv_72@vanlanguni.vn	$2b$10$QrFFvPDiBEYACNQMGd0jquMvx/Zygtpeoil0Vt3dZSIMV9DgghyOy	Hồ Đức Cường	0981302788	STUDENT	ACTIVE	2026-07-19 09:36:39+00	2026-08-02 15:03:39+00
73	sv_73@vanlanguni.vn	$2b$10$xfLCEzFOBsPphg4HARfKLurNb6aSTtS1di92I6nR7msGSFLLRQUai	Dương Quang Đạt	0942268066	STUDENT	ACTIVE	2026-07-28 21:38:03+00	2026-08-06 03:31:03+00
74	sv_74@vanlanguni.vn	$2b$10$qt7whgR/zbri.lfmSKOXGuIrZjnlQzF/RlhIWvTbGyC71CXb.66PO	Phan Thanh Giang	0993490328	STUDENT	ACTIVE	2026-07-12 03:10:43+00	2026-07-27 04:46:43+00
75	sv_75@vanlanguni.vn	$2b$10$c.h.iKV3PbNAD.xjE7Dg1.PHoRPV4OjEFrD8ex2O7aJ/pME9fOgLu	Trần Thu Hòa	0922250856	STUDENT	ACTIVE	2026-08-31 06:53:58+00	2026-09-11 10:20:58+00
76	sv_76@vanlanguni.vn	$2b$10$SJw2JFapuDYrBtG39U7EN.r6Td/RXONyJ1VIVRywRyQEYplsVeINm	Trần Ngọc Trâm	0944578474	STUDENT	ACTIVE	2026-08-16 23:17:23+00	2026-09-26 07:13:23+00
77	sv_77@vanlanguni.vn	$2b$10$6gBWoLn.2u0ASm6RkyVQfe0zgonHW8v.82zLgSmETO68n1zcmeQwe	Lý Xuân Khánh	0982018885	STUDENT	ACTIVE	2026-07-30 23:01:41+00	2026-08-14 03:44:41+00
78	sv_78@vanlanguni.vn	$2b$10$rEZfHaSUTu/m.xoR7H2K4eQBWRFQq/VAzSIX.Za9Tv568z9q5o89O	Lý Ngọc Trang	0912747657	STUDENT	ACTIVE	2026-07-23 00:06:06+00	2026-08-02 05:36:06+00
79	sv_79@vanlanguni.vn	$2b$10$DazDSYoXkJXLcjogwewh7u6VKuD4xR409sM5RknLDNZPZ.0kMnZn.	Huỳnh Thị Dung	0939924907	STUDENT	ACTIVE	2026-09-03 02:14:28+00	2026-09-29 11:06:28+00
80	sv_80@vanlanguni.vn	$2b$10$O4YVAdrkqdbjer2CA3lsieMJdr6EqZW0pfEgROcfpo/fyqdQPu5q.	Huỳnh Đình Tuấn	0942300608	STUDENT	ACTIVE	2026-08-05 11:40:39+00	2026-08-28 16:12:39+00
81	sv_81@vanlanguni.vn	$2b$10$cObikGfQJ2E5BjcPl3fKxeu5cKYXjJyZF70XnmpfC4X3vIKqwtRSy	Bùi Đức Minh	0978493584	STUDENT	ACTIVE	2026-09-26 02:22:22+00	2026-10-01 10:56:22+00
82	sv_82@vanlanguni.vn	$2b$10$xispFpmpM.G4x7w9JSOGweS2nCsD88PiKvdvKIjYWgcYKMvx0pyGq	Đặng Thanh Đức	0925626864	STUDENT	ACTIVE	2026-07-12 09:19:26+00	2026-07-14 13:52:26+00
83	sv_83@vanlanguni.vn	$2b$10$Ra4KvPyNexWCsGsnqZLsGOBDqaqWRkJrL8jLqmQS5InBi7ESgaMXy	Phan Ngọc Linh	0910076444	STUDENT	ACTIVE	2026-08-19 22:59:13+00	2026-09-18 07:20:13+00
84	sv_84@vanlanguni.vn	$2b$10$slvqI7bn5C/FxqSsN.zf9e3ZAYQZGB.cOQPUdVyVFAup9.M/0aqIm	Lê Hồng Thảo	0975991511	STUDENT	ACTIVE	2026-08-09 06:32:10+00	2026-08-26 10:08:10+00
85	sv_85@vanlanguni.vn	$2b$10$ai1D3pRItaE.EM7AIXGsmu1ZLxW0XFDklOfHS2uV.It.wdawZKDiy	Nguyễn Hữu Cường	0971290168	STUDENT	ACTIVE	2026-08-08 03:41:08+00	2026-09-03 11:13:08+00
86	sv_86@vanlanguni.vn	$2b$10$/0FFmVCXtUUKpC5TvqPk9evussLs6aUk4Opo8IpO.LpaQr5LdRhDi	Hoàng Thanh Thành	0953704010	STUDENT	ACTIVE	2026-09-12 02:44:18+00	2026-09-29 09:37:18+00
87	sv_87@vanlanguni.vn	$2b$10$zRGw0yUN/eY5ZgocgusfK.3pJoZIQmDxkbFIyyojWWNogXzHZPv9m	Vũ Thanh Dung	0949324770	STUDENT	ACTIVE	2026-08-01 14:16:25+00	2026-09-03 16:35:25+00
88	sv_88@vanlanguni.vn	$2b$10$8sTWI.STrgMzukVfUa5I9emiQRNIpI.C/xgWbgg.dzErc7kZOGq5C	Võ Thanh Trâm	0917448157	STUDENT	ACTIVE	2026-07-30 21:04:33+00	2026-07-31 03:29:33+00
89	sv_89@vanlanguni.vn	$2b$10$kWdwyUZOoFEaXotgFnEBdeb9wV6CZpI4jv0Kuie7dozoSOQ9WRsgy	Lê Hồng Vy	0940126529	STUDENT	ACTIVE	2026-09-01 07:46:49+00	2026-10-11 13:11:49+00
90	sv_90@vanlanguni.vn	$2b$10$TzD9wpkMEv6f3TObtLrD.OIDSlEh7DHIWUgaZSj19Ga4.XD8YDJiK	Nguyễn Tuấn Hương	0962145195	STUDENT	ACTIVE	2026-08-08 19:51:51+00	2026-08-30 22:14:51+00
91	sv_91@vanlanguni.vn	$2b$10$4SlrUnBWhe1hi9k8wXczZ.68ClPzVGScBHkC59szZ8gz/PMym7zvq	Đặng Đức Hương	0993349821	STUDENT	ACTIVE	2026-08-19 09:41:03+00	2026-09-08 12:12:03+00
92	sv_92@vanlanguni.vn	$2b$10$0XIKURJJh3KCzrOZlxhiieSEEs3yti2xHYF.9cJuFoTEnyr72P.Lu	Đỗ Quang Anh	0979191553	STUDENT	ACTIVE	2026-08-18 16:24:50+00	2026-08-24 21:03:50+00
93	sv_93@vanlanguni.vn	$2b$10$kSDekqM1ZYvudOfJbRf3Ku3XGjES4bnF3IM/zZH5E4.pgCvSyQqJu	Hồ Ngọc Nhi	0967121837	STUDENT	ACTIVE	2026-08-01 02:06:16+00	2026-08-28 06:05:16+00
94	sv_94@vanlanguni.vn	$2b$10$428r9WUVAVvRk5.5aaOQDeH89/mzgKzvqGoBCY/my2gaezyHUmoKW	Lê Hoàng Đạt	0978042961	STUDENT	ACTIVE	2026-10-08 12:43:29+00	2026-10-26 19:20:29+00
95	sv_95@vanlanguni.vn	$2b$10$eI8bfE8nEdsb51wiwMTxcO9IUHiJAmfl0WXAgzazMeElci0bUQtNy	Vũ Bảo Khoa	0936672962	STUDENT	ACTIVE	2026-08-16 22:34:21+00	2026-08-19 01:43:21+00
96	sv_96@vanlanguni.vn	$2b$10$wHMEC0tnuykecoR4i.lNjObcdrLwlHcOfk1/X3zdpBQSUQv/XLXnK	Dương Hữu Giang	0983003605	STUDENT	ACTIVE	2026-07-28 03:24:41+00	2026-08-15 04:41:41+00
97	sv_97@vanlanguni.vn	$2b$10$OJ2bJrkft4CQS9FsyW3GJ.03vbc4JHqrXEzLbS3bjOAkckLyQZyRe	Đỗ Tuấn Thảo	0947494462	STUDENT	ACTIVE	2026-07-29 22:24:00+00	2026-08-24 00:07:00+00
98	sv_98@vanlanguni.vn	$2b$10$2gEPN7IXL1gLwKWZIq38y.2hOhsrwDTF2SUVWrhex7h6kjFUsGIKS	Võ Hoàng Bình	0990566317	STUDENT	ACTIVE	2026-08-29 02:11:20+00	2026-09-23 04:47:20+00
99	sv_99@vanlanguni.vn	$2b$10$GcXCDIyhn3/WpZ3yPKMxy.xP1/Kytr2ABBfSdYnm3J8pjO4RjzxI2	Bùi Đức Nam	0984130384	STUDENT	ACTIVE	2026-07-16 19:22:39+00	2026-08-13 23:37:39+00
100	sv_100@vanlanguni.vn	$2b$10$hpngduUwV0C5SuUWf448MO63L3Xev3JF2AbOg5ChHPjrgE9V9cg56	Hồ Ngọc Thành	0928834622	STUDENT	ACTIVE	2026-07-14 11:49:51+00	2026-08-20 20:22:51+00
101	sv_101@vanlanguni.vn	$2b$10$yoq2.0vhTyNYJ1RC6QdaEuXINg5DynZ4NjB8qtX4xVYHepv43StAC	Vũ Minh Trâm	0916429991	STUDENT	ACTIVE	2026-07-17 03:40:28+00	2026-08-26 10:20:28+00
102	sv_102@vanlanguni.vn	$2b$10$EK63qXq8TH9b3D.of8b4w.Hbzx.nadmaZTRINnjSRH4xULQ80loYm	Vũ Hồng Tuấn	0994810565	STUDENT	ACTIVE	2026-08-19 02:35:55+00	2026-08-19 05:33:55+00
103	sv_103@vanlanguni.vn	$2b$10$GMeI.H6SWowu05qILagYges9YJ7XkpK8Na3mwU62WxZw3G2XSATya	Dương Hồng Sơn	0998016235	STUDENT	ACTIVE	2026-08-10 03:20:45+00	2026-09-03 04:23:45+00
104	sv_104@vanlanguni.vn	$2b$10$o5emfGXeVIQh7A3o5a.R4uPy2aNUwD8MqdZOGEyHbt32VwzQc58Me	Đặng Quang Khoa	0998504469	STUDENT	ACTIVE	2026-07-10 19:05:53+00	2026-07-19 03:26:53+00
105	sv_105@vanlanguni.vn	$2b$10$Yxds1fe.orMa8GBL8p9i2.l9xv1FCi8uO.4Wutx7fSLvAhD472g7m	Vũ Bảo Bình	0965279372	STUDENT	ACTIVE	2026-07-22 02:33:15+00	2026-08-29 05:49:15+00
106	sv_106@vanlanguni.vn	$2b$10$OsLX92fZmfXybvFGi49tc.442WBQv.O2Hfvhd.qUBtkIRJVc50fbS	Võ Tuấn Vy	0980083493	STUDENT	ACTIVE	2026-08-09 00:38:38+00	2026-08-16 08:05:38+00
107	sv_107@vanlanguni.vn	$2b$10$XoR5rLlqvjCONNtti5XPn./5us576Yum18qlyfEbd78ct8ecSqVKa	Trần Thị Yến	0956562895	STUDENT	ACTIVE	2026-08-15 01:55:26+00	2026-09-06 08:19:26+00
108	sv_108@vanlanguni.vn	$2b$10$XSiQGz7dWBTrcfblmUnDN.Tk6TcHpCP3jC2intQvBQdeoK8LTUzBG	Bùi Hữu Anh	0928301812	STUDENT	ACTIVE	2026-07-30 06:46:29+00	2026-09-04 15:16:29+00
109	sv_109@vanlanguni.vn	$2b$10$FL6NrRK9QK69c1bSLh5mIetLTxnLwGYbkVwc2rGYvZISR7pjP1osa	Ngô Văn Hương	0984532846	STUDENT	ACTIVE	2026-08-17 20:05:11+00	2026-09-12 02:08:11+00
110	sv_110@vanlanguni.vn	$2b$10$z5Mk.GQ.qg7gL8PCeYcbJeinZLmEvqSteZJA4wDuvP0izCkT7q4a6	Lý Thị Nhi	0940392175	STUDENT	ACTIVE	2026-08-04 07:02:54+00	2026-09-09 14:49:54+00
111	sv_111@vanlanguni.vn	$2b$10$Nj0.glv7kD08Hf92tYFFyudLjRsQ.5NPTNjCZxRNN.221yEPiZaAS	Nguyễn Hữu Hòa	0989963559	STUDENT	ACTIVE	2026-08-08 04:03:37+00	2026-08-10 05:11:37+00
112	sv_112@vanlanguni.vn	$2b$10$nYcWqOtexJk12Alh7zIUMubyFirIYqpxvkxmDHnJjYYKJPcx58x1C	Phạm Đức Hòa	0929800290	STUDENT	ACTIVE	2026-10-07 09:28:42+00	2026-10-31 11:21:42+00
113	sv_113@vanlanguni.vn	$2b$10$rqW5SS.ecTWVTnEbV9SrgeE0o2URHeCPG7gtqV.DEBjZPXgowhPxe	Lê Ngọc Hải	0939688806	STUDENT	ACTIVE	2026-07-20 05:49:05+00	2026-08-12 10:53:05+00
114	sv_114@vanlanguni.vn	$2b$10$GDtx5ZjXJrsSSV4ujRkjUu80RJj8RTq0FqD4smPc8EOC.FoBKYovq	Hồ Quang Bình	0999850274	STUDENT	ACTIVE	2026-08-17 17:47:18+00	2026-08-22 18:54:18+00
115	sv_115@vanlanguni.vn	$2b$10$dsj21OO.sMuqpf.lP6UTLuyDQK.URB8sNmPCyrH3JHZKabt8Nr0ua	Huỳnh Thị Oanh	0950658273	STUDENT	ACTIVE	2026-09-24 05:23:24+00	2026-10-26 13:58:24+00
116	sv_116@vanlanguni.vn	$2b$10$1SakDKLU3xvVae.rmO.ziurHJPhnXVlRUscd0KEx6osd.gCcWH37K	Phan Đình Giang	0941888193	STUDENT	ACTIVE	2026-08-16 23:50:53+00	2026-09-18 05:04:53+00
117	sv_117@vanlanguni.vn	$2b$10$uEVTbMA2FXeCfy.Mf7YTd.ok4Q2SmdGrliq7LIrlL8.0gPjzgcyqe	Võ Tuấn Yến	0995061941	STUDENT	ACTIVE	2026-08-01 03:34:00+00	2026-08-07 04:55:00+00
118	sv_118@vanlanguni.vn	$2b$10$YMQfHk/XmEUTvJAWbW72zet37tt31/qa5Ri6hiTPBeCrIPlP1xIKa	Vũ Đình Thảo	0984692330	STUDENT	ACTIVE	2026-09-11 04:55:37+00	2026-09-17 08:24:37+00
119	sv_119@vanlanguni.vn	$2b$10$WQYDw4KPNeR.RcS2X/IRS..NDcZFm8P6NzH0AqsFEZFFdYU8KQaN.	Trần Xuân Đạt	0941496370	STUDENT	ACTIVE	2026-08-22 02:38:00+00	2026-08-29 09:39:00+00
120	sv_120@vanlanguni.vn	$2b$10$t7F5kb4DgF90FBTk.J1hAOpoWfgsZBcDMsYKYjdS26ivyA3Ux3QGS	Bùi Văn Bình	0916978518	STUDENT	ACTIVE	2026-08-11 09:46:07+00	2026-09-12 15:08:07+00
121	sv_121@vanlanguni.vn	$2b$10$st1pHuIzPQlSzrT53flCl.aTtN/6o9BcNvAAjnAu6xo8qQea9hVXW	Hoàng Hoàng Nhi	0999871716	STUDENT	ACTIVE	2026-07-18 00:06:16+00	2026-08-01 05:38:16+00
122	sv_122@vanlanguni.vn	$2b$10$yAFLzYOt378cWiUOQe1pGO19QRfj2kyIH8/ZhsmwZOKwsarPhasCW	Bùi Hoàng Hải	0912443959	STUDENT	ACTIVE	2026-08-04 01:37:39+00	2026-08-04 09:49:39+00
123	sv_demo@vanlanguni.vn	$2b$10$3mciM8y4DFkYJKpZ8mP0e.UeRUvJSCmps699.8kFBFq.iVR/Q69tC	Nguyễn Minh Khang	0881621603	STUDENT	ACTIVE	2026-08-01 03:22:11+00	2026-08-29 05:18:11+00
124	sv_moi@vanlanguni.vn	$2b$10$tGAgqdaNMQvbcxmvd3.keeLyL3rodH4CouKUvhj1gg5KNgHMJ52Ua	Lê Thảo Nguyên	0358973928	STUDENT	ACTIVE	2026-11-01 01:08:24+00	2026-11-02 02:18:24+00
125	sv_bi_khoa@vanlanguni.vn	$2b$10$w8dWFLYRy0/cYOWraTag5ubsCR2jbS7ardeVKoUAN9kEFamRMgpWW	Phạm Quốc Bảo	0359795388	STUDENT	BANNED	2026-08-15 08:39:53+00	2026-09-18 14:54:53+00
126	hr_demo@company.com	$2b$10$EmhO7g0B/5HSzVQPWOR.gumv6wsc9G6YR9/WIKGj1qEbuD81nGMw2	Hoàng Gia Huy	0901118800	EMPLOYER	ACTIVE	2026-07-20 01:34:08+00	2026-08-08 09:26:08+00
127	hr_moi@company.com	$2b$10$dxgxnOHyjb5zwEfDCd3Snu/DZGuB4O/TRXybFd8Unms8piyCzxYNu	Đặng Thùy Dương	0705981691	EMPLOYER	ACTIVE	2026-10-30 03:11:49+00	2026-10-31 14:19:37+00
128	hr_bi_khoa@company.com	$2b$10$ghn0Lgot5iseZF60or79B.16Jiarp/yQFv4boZ65sd3vxtE/YstOq	Vũ Đức Thịnh	0978914988	EMPLOYER	BANNED	2026-07-25 03:17:40+00	2026-08-24 04:58:40+00
129	hr_moi_2@company.com	$2b$10$Fgsqmd1BBGnEIqjqzkcc7OEO1rPGObovg1wwCJo.F0y.P03sgPKD2	Bùi Ngọc Hân	0351492451	EMPLOYER	ACTIVE	2026-10-31 05:44:04+00	2026-11-01 08:16:16+00
130	hr_moi_3@company.com	$2b$10$4HuWQr2vVdMTx731xSA1O.sU4dbVzL9KwxjEE3a7x4yji7TF4lD.G	Trương Quang Vinh	0700725586	EMPLOYER	ACTIVE	2026-10-29 05:07:08+00	2026-11-01 23:59:29+00
131	student.test@vlu.edu.vn	$2b$10$t1Eo7oC7wN.JWYu5PDQxUu3lJOY2bICAQT5p4iuAE9wfijv1hVybm	Nguyễn Văn Chí (Sinh Viên Test)	0901234567	STUDENT	ACTIVE	2026-11-03 18:57:48.197582+00	2026-11-03 19:28:21.524371+00
133	admin.test@vlu.edu.vn	$2b$10$mOLSIwhn.vNruSM8/pXs8.xsac3kY3p0X1qGVJ5rky/PJhp8lIP9q	Quản trị viên Hệ thống (Admin Test)	0900000001	ADMIN	ACTIVE	2026-11-03 23:35:12.390801+00	2026-11-04 07:26:42.356886+00
135	nguyen.van.chi@vlu.edu.vn	$2b$10$YBgB5u5SQ9f.zH2IE5OebuXwM6ul8Y2mI1bipIb.I1iuvFTHR1zMS	Nguyễn Văn Chí	\N	STUDENT	ACTIVE	2026-11-05 21:49:39.722493+00	2026-11-05 21:49:39.722493+00
136	tuyet123@gmail.com	$2b$10$w9a3twcs3aTtLbSBlKg7RuxqVemXSQRpf/ymTXSLS6gTRkrZmZrpC	nguyen thi tuyet	\N	STUDENT	ACTIVE	2026-11-06 07:17:29.44827+00	2026-11-06 07:17:29.44827+00
137	bao@gmail.com	$2b$10$ecWmSpyiN1r2/62S4Rb4vOvFeElK/WGfd1hFzx17TbJ69PqnlTQ..	huynh văn bảo	\N	STUDENT	ACTIVE	2026-11-06 07:22:26.690119+00	2026-11-06 07:22:26.690119+00
132	employer.test@vlu.edu.vn	$2b$10$YIQbLPk9T1j0qjQkCUQ03OIP1K/aqsiJ0fJ9i6tbJ9pO7UpMOz1vS	Công Ty Công Nghệ Giáo Dục Văn Lang (VLU Tech)	0987654321	EMPLOYER	ACTIVE	2026-11-03 21:39:03.483404+00	2026-11-06 07:40:10.768428+00
134	le.quang.tuan@vlu.edu.vn	$2b$10$c24mYf755Fi4jsRE0PQNEuiayb1CZPPwhu2xoDl3vgv/s59YeBZBO	Lê Quang Anh Tuấn	\N	STUDENT	ACTIVE	2026-11-05 21:46:59.515158+00	2026-11-06 07:29:57.085906+00
139	congtyb@gmail.com	$2b$10$UZDMboHJRmQqcOVF/QKtGu6iA6aw8sxpquAd8yHHFtx4XbGlXnf.i	công ty B	\N	EMPLOYER	ACTIVE	2026-11-06 07:45:45.753504+00	2026-11-06 07:45:45.753504+00
138	mai@gmail.com	$2b$10$nP49ATTFPt4HHGub8TDb1u/o3cOunTtW6QjLCGjECT4lZJiGQsqL2	hoang thị mai	\N	STUDENT	BANNED	2026-11-06 07:42:54.006437+00	2026-11-06 07:49:16.963318+00
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_tokens (id, user_id, channel, token_hash, expires_at, used_at, attempt_count, created_at) FROM stdin;
\.


--
-- Data for Name: work_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_assignments (id, job_id, student_id, application_id, status, created_at, updated_at, proposal_id, started_at, completed_at) FROM stdin;
500	163	57	1004	IN_PROGRESS	2026-10-03 15:58:46	2026-10-06 19:42:46	\N	2026-10-03 15:58:46	\N
501	159	85	1016	IN_PROGRESS	2026-09-03 00:15:08	2026-09-06 01:36:08	\N	2026-09-03 00:15:08	\N
502	193	96	1019	COMPLETED	2026-08-15 08:13:41	2026-09-13 11:45:41	\N	2026-08-15 08:13:41	2026-09-13 11:45:41
503	201	117	1021	IN_PROGRESS	2026-08-26 20:40:00	2026-08-28 23:40:00	\N	2026-08-26 20:40:00	\N
504	137	118	1025	IN_PROGRESS	2026-10-01 14:04:45	2026-10-03 20:07:45	\N	2026-10-01 14:04:45	\N
505	197	61	1026	IN_PROGRESS	2026-09-13 17:58:15	2026-09-16 01:00:15	\N	2026-09-13 17:58:15	\N
506	103	122	1030	IN_PROGRESS	2026-09-22 17:58:29	2026-09-22 19:34:29	\N	2026-09-22 17:58:29	\N
507	218	98	1033	COMPLETED	2026-09-08 21:05:15	2026-09-18 04:49:15	\N	2026-09-08 21:05:15	2026-09-18 04:49:15
508	119	99	1037	COMPLETED	2026-08-09 23:51:39	2026-09-05 02:53:39	\N	2026-08-09 23:51:39	2026-09-05 02:53:39
509	130	71	1038	IN_PROGRESS	2026-09-20 00:56:11	2026-09-25 06:14:11	\N	2026-09-20 00:56:11	\N
510	157	91	1040	IN_PROGRESS	2026-09-21 07:46:03	2026-09-24 16:44:03	\N	2026-09-21 07:46:03	\N
511	167	104	1041	COMPLETED	2026-09-03 19:19:56	2026-09-27 20:51:56	\N	2026-09-03 19:19:56	2026-09-27 20:51:56
512	201	110	1042	COMPLETED	2026-08-30 05:50:54	2026-09-07 09:39:54	\N	2026-08-30 05:50:54	2026-09-07 09:39:54
513	159	69	1046	COMPLETED	2026-09-09 10:03:16	2026-09-26 18:02:16	\N	2026-09-09 10:03:16	2026-09-26 18:02:16
514	220	69	1048	IN_PROGRESS	2026-09-28 19:36:44	2026-10-05 03:31:44	\N	2026-09-28 19:36:44	\N
515	191	99	1051	IN_PROGRESS	2026-09-23 22:26:16	2026-09-26 00:56:16	\N	2026-09-23 22:26:16	\N
516	106	77	1052	COMPLETED	2026-08-22 00:30:41	2026-09-20 08:43:41	\N	2026-08-22 00:30:41	2026-09-20 08:43:41
517	181	121	1053	COMPLETED	2026-09-06 03:40:00	2026-09-16 11:01:00	\N	2026-09-06 03:40:00	2026-09-16 11:01:00
518	113	113	1054	COMPLETED	2026-08-11 11:34:05	2026-08-26 18:22:05	\N	2026-08-11 11:34:05	2026-08-26 18:22:05
519	112	56	1057	COMPLETED	2026-09-04 02:38:23	2026-10-01 08:54:23	\N	2026-09-04 02:38:23	2026-10-01 08:54:23
520	107	92	1060	IN_PROGRESS	2026-09-25 15:15:46	2026-09-28 17:08:46	\N	2026-09-25 15:15:46	\N
521	120	63	1062	COMPLETED	2026-09-07 18:03:54	2026-09-29 19:12:54	\N	2026-09-07 18:03:54	2026-09-29 19:12:54
522	153	115	1063	IN_PROGRESS	2026-10-02 09:01:24	2026-10-08 13:04:24	\N	2026-10-02 09:01:24	\N
523	114	116	1065	IN_PROGRESS	2026-10-01 02:47:21	2026-10-06 08:35:21	\N	2026-10-01 02:47:21	\N
524	151	100	1071	COMPLETED	2026-08-10 00:37:51	2026-08-31 01:40:51	\N	2026-08-10 00:37:51	2026-08-31 01:40:51
525	138	90	1072	IN_PROGRESS	2026-10-11 20:15:48	2026-10-12 22:22:48	\N	2026-10-11 20:15:48	\N
526	214	99	1078	COMPLETED	2026-09-18 23:31:02	2026-09-26 01:39:02	\N	2026-09-18 23:31:02	2026-09-26 01:39:02
527	102	60	1079	IN_PROGRESS	2026-09-29 17:30:15	2026-10-04 01:05:15	\N	2026-09-29 17:30:15	\N
528	162	53	1086	IN_PROGRESS	2026-09-06 08:09:46	2026-09-12 13:35:46	\N	2026-09-06 08:09:46	\N
529	133	108	1089	IN_PROGRESS	2026-08-18 03:07:29	2026-08-19 08:29:29	\N	2026-08-18 03:07:29	\N
530	105	61	1091	IN_PROGRESS	2026-09-21 19:11:32	2026-09-21 21:38:32	\N	2026-09-21 19:11:32	\N
531	182	122	1096	COMPLETED	2026-09-18 15:09:52	2026-10-15 18:07:52	\N	2026-09-18 15:09:52	2026-10-15 18:07:52
532	139	97	1097	COMPLETED	2026-09-15 20:00:43	2026-10-06 22:40:43	\N	2026-09-15 20:00:43	2026-10-06 22:40:43
533	133	54	1098	COMPLETED	2026-08-24 14:03:22	2026-09-23 16:18:22	\N	2026-08-24 14:03:22	2026-09-23 16:18:22
534	194	61	1101	COMPLETED	2026-08-18 00:43:49	2026-09-04 03:50:49	\N	2026-08-18 00:43:49	2026-09-04 03:50:49
535	169	87	1105	COMPLETED	2026-08-30 13:08:25	2026-09-16 21:53:25	\N	2026-08-30 13:08:25	2026-09-16 21:53:25
536	136	105	1106	COMPLETED	2026-08-24 18:53:15	2026-09-09 03:50:15	\N	2026-08-24 18:53:15	2026-09-09 03:50:15
537	123	122	1111	COMPLETED	2026-09-07 08:55:39	2026-10-05 16:08:39	\N	2026-09-07 08:55:39	2026-10-05 16:08:39
538	191	97	1116	IN_PROGRESS	2026-09-21 23:13:03	2026-09-28 04:25:03	\N	2026-09-21 23:13:03	\N
539	178	106	1120	IN_PROGRESS	2026-10-03 02:27:06	2026-10-07 05:32:06	\N	2026-10-03 02:27:06	\N
540	205	71	1121	IN_PROGRESS	2026-09-16 06:31:36	2026-09-16 14:35:36	\N	2026-09-16 06:31:36	\N
541	181	109	1125	COMPLETED	2026-09-04 04:03:14	2026-09-12 05:39:14	\N	2026-09-04 04:03:14	2026-09-12 05:39:14
542	155	108	1127	IN_PROGRESS	2026-10-16 00:56:45	2026-10-22 02:17:45	\N	2026-10-16 00:56:45	\N
543	132	107	1130	COMPLETED	2026-09-07 23:08:26	2026-10-08 06:41:26	\N	2026-09-07 23:08:26	2026-10-08 06:41:26
544	140	107	1134	IN_PROGRESS	2026-09-12 17:46:24	2026-09-18 23:27:24	\N	2026-09-12 17:46:24	\N
545	117	56	1135	COMPLETED	2026-09-02 14:28:38	2026-09-13 17:46:38	\N	2026-09-02 14:28:38	2026-09-13 17:46:38
546	211	111	1137	COMPLETED	2026-09-10 01:12:37	2026-09-25 10:05:37	\N	2026-09-10 01:12:37	2026-09-25 10:05:37
547	101	108	1148	IN_PROGRESS	2026-09-28 06:02:26	2026-09-28 09:45:26	\N	2026-09-28 06:02:26	\N
548	104	89	1157	IN_PROGRESS	2026-09-30 09:57:42	2026-10-03 15:48:42	\N	2026-09-30 09:57:42	\N
549	124	113	1158	COMPLETED	2026-09-10 05:30:26	2026-10-01 08:58:26	\N	2026-09-10 05:30:26	2026-10-01 08:58:26
550	116	63	1165	COMPLETED	2026-08-30 01:14:21	2026-09-14 07:15:21	\N	2026-08-30 01:14:21	2026-09-14 07:15:21
551	172	84	1166	COMPLETED	2026-09-04 23:09:37	2026-10-01 03:32:37	\N	2026-09-04 23:09:37	2026-10-01 03:32:37
552	197	122	1167	COMPLETED	2026-09-16 23:46:59	2026-10-17 06:20:59	\N	2026-09-16 23:46:59	2026-10-17 06:20:59
553	146	110	1175	COMPLETED	2026-08-31 23:05:10	2026-09-25 07:08:10	\N	2026-08-31 23:05:10	2026-09-25 07:08:10
554	112	105	1177	IN_PROGRESS	2026-09-08 06:18:11	2026-09-11 11:01:11	\N	2026-09-08 06:18:11	\N
555	204	97	1181	COMPLETED	2026-08-18 03:35:00	2026-09-10 11:25:00	\N	2026-08-18 03:35:00	2026-09-10 11:25:00
556	218	82	1182	COMPLETED	2026-08-29 15:33:12	2026-09-07 16:57:12	\N	2026-08-29 15:33:12	2026-09-07 16:57:12
557	121	118	1183	IN_PROGRESS	2026-10-08 00:38:37	2026-10-12 06:23:37	\N	2026-10-08 00:38:37	\N
558	187	72	1184	COMPLETED	2026-09-05 15:43:17	2026-09-26 23:37:17	\N	2026-09-05 15:43:17	2026-09-26 23:37:17
559	122	83	1185	IN_PROGRESS	2026-10-18 04:21:39	2026-10-19 09:37:39	\N	2026-10-18 04:21:39	\N
560	217	105	1186	COMPLETED	2026-08-27 04:15:48	2026-09-11 12:33:48	\N	2026-08-27 04:15:48	2026-09-11 12:33:48
561	214	106	1189	IN_PROGRESS	2026-09-14 02:46:38	2026-09-15 10:29:38	\N	2026-09-14 02:46:38	\N
562	208	122	1194	COMPLETED	2026-09-16 16:16:36	2026-10-03 00:31:36	\N	2026-09-16 16:16:36	2026-10-03 00:31:36
563	157	63	1196	COMPLETED	2026-09-18 01:30:10	2026-10-03 08:08:10	\N	2026-09-18 01:30:10	2026-10-03 08:08:10
564	208	107	1197	IN_PROGRESS	2026-09-10 16:39:16	2026-09-10 18:54:16	\N	2026-09-10 16:39:16	\N
565	215	100	1199	IN_PROGRESS	2026-10-14 09:47:49	2026-10-17 15:42:49	\N	2026-10-14 09:47:49	\N
566	189	85	1205	IN_PROGRESS	2026-10-09 20:06:00	2026-10-10 01:58:00	\N	2026-10-09 20:06:00	\N
567	195	74	1210	COMPLETED	2026-08-10 02:49:43	2026-08-17 09:23:43	\N	2026-08-10 02:49:43	2026-08-17 09:23:43
568	182	79	1214	IN_PROGRESS	2026-09-16 21:28:28	2026-09-20 01:40:28	\N	2026-09-16 21:28:28	\N
569	150	103	1217	COMPLETED	2026-08-28 19:45:45	2026-09-14 02:55:45	\N	2026-08-28 19:45:45	2026-09-14 02:55:45
570	159	76	1219	COMPLETED	2026-09-02 12:51:23	2026-09-26 16:48:23	\N	2026-09-02 12:51:23	2026-09-26 16:48:23
571	211	98	1222	IN_PROGRESS	2026-09-06 18:47:21	2026-09-10 23:39:21	\N	2026-09-06 18:47:21	\N
572	149	70	1228	COMPLETED	2026-08-17 20:22:03	2026-08-27 04:41:03	\N	2026-08-17 20:22:03	2026-08-27 04:41:03
573	103	97	1229	IN_PROGRESS	2026-09-13 21:45:12	2026-09-13 23:57:12	\N	2026-09-13 21:45:12	\N
574	215	105	1231	IN_PROGRESS	2026-10-10 16:53:37	2026-10-13 23:16:37	\N	2026-10-10 16:53:37	\N
575	162	101	1237	COMPLETED	2026-09-12 17:04:18	2026-09-19 18:39:18	\N	2026-09-12 17:04:18	2026-09-19 18:39:18
576	129	101	1239	COMPLETED	2026-08-13 00:27:28	2026-08-20 02:51:28	\N	2026-08-13 00:27:28	2026-08-20 02:51:28
577	174	108	1248	COMPLETED	2026-09-05 23:05:38	2026-09-14 04:50:38	\N	2026-09-05 23:05:38	2026-09-14 04:50:38
578	107	72	1249	IN_PROGRESS	2026-10-03 19:38:47	2026-10-06 04:22:47	\N	2026-10-03 19:38:47	\N
579	223	123	1256	IN_PROGRESS	2026-10-31 18:04:57	2026-11-01 23:10:57	\N	2026-10-31 18:04:57	\N
580	223	101	1257	IN_PROGRESS	2026-10-30 17:04:27	2026-10-31 01:22:27	\N	2026-10-30 17:04:27	\N
581	224	123	1260	COMPLETED	2026-08-29 17:44:13	2026-09-20 14:11:25	\N	2026-08-29 17:44:13	2026-09-20 14:11:25
582	224	80	1261	COMPLETED	2026-09-01 08:16:03	2026-09-25 16:18:11	\N	2026-09-01 08:16:03	2026-09-25 16:18:11
583	225	123	1262	COMPLETED	2026-09-04 15:40:35	2026-09-30 20:35:31	\N	2026-09-04 15:40:35	2026-09-30 20:35:31
586	109	131	1276	IN_PROGRESS	2026-11-02 02:28:21.538254	2026-11-04 02:28:21.538254	\N	\N	\N
587	106	131	1277	COMPLETED	2026-10-30 02:28:21.541497	2026-11-04 02:28:21.541497	\N	\N	\N
588	238	53	1278	IN_PROGRESS	2026-11-01 04:40:56.141719	2026-11-04 04:40:56.141719	\N	2026-11-01 04:40:56.141719	\N
589	239	54	\N	IN_PROGRESS	2026-11-04 05:06:04.89453	2026-11-04 05:06:14.135717	1	\N	\N
\.


--
-- Data for Name: work_deliverables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_deliverables (id, assignment_id, submitted_by, version_no, file_key, description, status, submitted_at) FROM stdin;
\.


--
-- Data for Name: work_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_progress (id, assignment_id, updated_by, progress_percent, description, created_at, started_at) FROM stdin;
500	500	57	50	Đang làm việc tốt.	2026-10-06 19:42:46	2026-10-03 15:58:46
501	501	85	50	Đang trong giai đoạn thử việc, phản hồi tích cực.	2026-09-06 01:36:08	2026-09-03 00:15:08
502	502	96	100	Đã hoàn thành công việc.	2026-09-13 11:45:41	2026-08-15 08:13:41
503	503	117	50	Đang thực hiện đúng kế hoạch.	2026-08-28 23:40:00	2026-08-26 20:40:00
504	504	118	50	Đang làm việc tốt.	2026-10-03 20:07:45	2026-10-01 14:04:45
505	505	61	50	Đang làm việc tốt.	2026-09-16 01:00:15	2026-09-13 17:58:15
506	506	122	50	Đang làm việc tốt.	2026-09-22 19:34:29	2026-09-22 17:58:29
507	507	98	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-18 04:49:15	2026-09-08 21:05:15
508	508	99	100	Đã hoàn thành công việc.	2026-09-05 02:53:39	2026-08-09 23:51:39
509	509	71	50	Đang làm việc tốt.	2026-09-25 06:14:11	2026-09-20 00:56:11
510	510	91	50	Đã hoàn thành khoảng một nửa khối lượng công việc.	2026-09-24 16:44:03	2026-09-21 07:46:03
511	511	104	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-27 20:51:56	2026-09-03 19:19:56
512	512	110	100	Đã hoàn thành công việc.	2026-09-07 09:39:54	2026-08-30 05:50:54
513	513	69	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-26 18:02:16	2026-09-09 10:03:16
514	514	69	50	Đang trong giai đoạn thử việc, phản hồi tích cực.	2026-10-05 03:31:44	2026-09-28 19:36:44
515	515	99	50	Đang làm việc tốt.	2026-09-26 00:56:16	2026-09-23 22:26:16
516	516	77	100	Đã hoàn thành công việc.	2026-09-20 08:43:41	2026-08-22 00:30:41
517	517	121	100	Đã hoàn thành công việc.	2026-09-16 11:01:00	2026-09-06 03:40:00
518	518	113	100	Hoàn thành đúng hạn, đã thanh toán.	2026-08-26 18:22:05	2026-08-11 11:34:05
519	519	56	100	Đã hoàn thành công việc.	2026-10-01 08:54:23	2026-09-04 02:38:23
520	520	92	50	Đang làm việc tốt.	2026-09-28 17:08:46	2026-09-25 15:15:46
521	521	63	100	Đã hoàn thành công việc.	2026-09-29 19:12:54	2026-09-07 18:03:54
522	522	115	50	Đang làm việc tốt.	2026-10-08 13:04:24	2026-10-02 09:01:24
523	523	116	50	Đang làm việc tốt.	2026-10-06 08:35:21	2026-10-01 02:47:21
524	524	100	100	Đã hoàn thành công việc.	2026-08-31 01:40:51	2026-08-10 00:37:51
525	525	90	50	Đang trong giai đoạn thử việc, phản hồi tích cực.	2026-10-12 22:22:48	2026-10-11 20:15:48
526	526	99	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-26 01:39:02	2026-09-18 23:31:02
527	527	60	50	Đang làm việc tốt.	2026-10-04 01:05:15	2026-09-29 17:30:15
528	528	53	50	Đang làm việc tốt.	2026-09-12 13:35:46	2026-09-06 08:09:46
529	529	108	50	Đang trong giai đoạn thử việc, phản hồi tích cực.	2026-08-19 08:29:29	2026-08-18 03:07:29
530	530	61	50	Đang làm việc tốt.	2026-09-21 21:38:32	2026-09-21 19:11:32
531	531	122	100	Đã hoàn thành công việc.	2026-10-15 18:07:52	2026-09-18 15:09:52
532	532	97	100	Đã hoàn thành công việc.	2026-10-06 22:40:43	2026-09-15 20:00:43
533	533	54	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-23 16:18:22	2026-08-24 14:03:22
534	534	61	100	Đã hoàn thành công việc.	2026-09-04 03:50:49	2026-08-18 00:43:49
535	535	87	100	Đã hoàn thành công việc.	2026-09-16 21:53:25	2026-08-30 13:08:25
536	536	105	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-09 03:50:15	2026-08-24 18:53:15
537	537	122	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-10-05 16:08:39	2026-09-07 08:55:39
538	538	97	50	Đang trong giai đoạn thử việc, phản hồi tích cực.	2026-09-28 04:25:03	2026-09-21 23:13:03
539	539	106	50	Đang làm việc tốt.	2026-10-07 05:32:06	2026-10-03 02:27:06
540	540	71	50	Đã hoàn thành khoảng một nửa khối lượng công việc.	2026-09-16 14:35:36	2026-09-16 06:31:36
541	541	109	100	Hoàn thành đúng hạn, đã thanh toán.	2026-09-12 05:39:14	2026-09-04 04:03:14
542	542	108	50	Đang làm việc tốt.	2026-10-22 02:17:45	2026-10-16 00:56:45
543	543	107	100	Hoàn thành đúng hạn, đã thanh toán.	2026-10-08 06:41:26	2026-09-07 23:08:26
544	544	107	50	Đã hoàn thành khoảng một nửa khối lượng công việc.	2026-09-18 23:27:24	2026-09-12 17:46:24
545	545	56	100	Đã hoàn thành công việc.	2026-09-13 17:46:38	2026-09-02 14:28:38
546	546	111	100	Hoàn thành đúng hạn, đã thanh toán.	2026-09-25 10:05:37	2026-09-10 01:12:37
547	547	108	50	Đã hoàn thành khoảng một nửa khối lượng công việc.	2026-09-28 09:45:26	2026-09-28 06:02:26
548	548	89	50	Đang thực hiện đúng kế hoạch.	2026-10-03 15:48:42	2026-09-30 09:57:42
549	549	113	100	Đã hoàn thành công việc.	2026-10-01 08:58:26	2026-09-10 05:30:26
550	550	63	100	Hoàn thành đúng hạn, đã thanh toán.	2026-09-14 07:15:21	2026-08-30 01:14:21
551	551	84	100	Hoàn thành đúng hạn, đã thanh toán.	2026-10-01 03:32:37	2026-09-04 23:09:37
552	552	122	100	Hoàn thành đúng hạn, đã thanh toán.	2026-10-17 06:20:59	2026-09-16 23:46:59
553	553	110	100	Đã hoàn thành công việc.	2026-09-25 07:08:10	2026-08-31 23:05:10
554	554	105	50	Đang làm việc tốt.	2026-09-11 11:01:11	2026-09-08 06:18:11
555	555	97	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-10 11:25:00	2026-08-18 03:35:00
556	556	82	100	Hoàn thành đúng hạn, đã thanh toán.	2026-09-07 16:57:12	2026-08-29 15:33:12
557	557	118	50	Đang làm việc tốt.	2026-10-12 06:23:37	2026-10-08 00:38:37
558	558	72	100	Hoàn thành đúng hạn, đã thanh toán.	2026-09-26 23:37:17	2026-09-05 15:43:17
559	559	83	50	Đang làm việc tốt.	2026-10-19 09:37:39	2026-10-18 04:21:39
560	560	105	100	Đã hoàn thành công việc.	2026-09-11 12:33:48	2026-08-27 04:15:48
561	561	106	50	Đang làm việc tốt.	2026-09-15 10:29:38	2026-09-14 02:46:38
562	562	122	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-10-03 00:31:36	2026-09-16 16:16:36
563	563	63	100	Hoàn thành đúng hạn, đã thanh toán.	2026-10-03 08:08:10	2026-09-18 01:30:10
564	564	107	50	Đang trong giai đoạn thử việc, phản hồi tích cực.	2026-09-10 18:54:16	2026-09-10 16:39:16
565	565	100	50	Đang làm việc tốt.	2026-10-17 15:42:49	2026-10-14 09:47:49
566	566	85	50	Đang làm việc tốt.	2026-10-10 01:58:00	2026-10-09 20:06:00
567	567	74	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-08-17 09:23:43	2026-08-10 02:49:43
568	568	79	50	Đang thực hiện đúng kế hoạch.	2026-09-20 01:40:28	2026-09-16 21:28:28
569	569	103	100	Đã hoàn thành công việc.	2026-09-14 02:55:45	2026-08-28 19:45:45
570	570	76	100	Đã hoàn thành công việc.	2026-09-26 16:48:23	2026-09-02 12:51:23
571	571	98	50	Đang làm việc tốt.	2026-09-10 23:39:21	2026-09-06 18:47:21
572	572	70	100	Đã hoàn thành công việc.	2026-08-27 04:41:03	2026-08-17 20:22:03
573	573	97	50	Đã hoàn thành khoảng một nửa khối lượng công việc.	2026-09-13 23:57:12	2026-09-13 21:45:12
574	574	105	50	Đang thực hiện đúng kế hoạch.	2026-10-13 23:16:37	2026-10-10 16:53:37
575	575	101	100	Đã hoàn thành công việc.	2026-09-19 18:39:18	2026-09-12 17:04:18
576	576	101	100	Hoàn thành đúng hạn, đã thanh toán.	2026-08-20 02:51:28	2026-08-13 00:27:28
577	577	108	100	Đã hoàn thành công việc.	2026-09-14 04:50:38	2026-09-05 23:05:38
578	578	72	50	Đang làm việc tốt.	2026-10-06 04:22:47	2026-10-03 19:38:47
579	579	123	50	Đang trong giai đoạn thử việc, phản hồi tích cực.	2026-11-01 23:10:57	2026-10-31 18:04:57
580	580	101	50	Đang thực hiện đúng kế hoạch.	2026-10-31 01:22:27	2026-10-30 17:04:27
581	581	123	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-20 14:11:25	2026-08-29 17:44:13
582	582	80	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-25 16:18:11	2026-09-01 08:16:03
583	583	123	100	Hoàn thành tốt, nhà tuyển dụng hài lòng.	2026-09-30 20:35:31	2026-09-04 15:40:35
\.


--
-- Name: admin_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_logs_id_seq', 10, true);


--
-- Name: application_histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_histories_id_seq', 1, true);


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 1278, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 7, true);


--
-- Name: deliverable_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deliverable_reviews_id_seq', 1, false);


--
-- Name: employer_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employer_profiles_id_seq', 57, true);


--
-- Name: job_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_views_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 239, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 454, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 6, true);


--
-- Name: proposal_histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proposal_histories_id_seq', 1, false);


--
-- Name: proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proposals_id_seq', 2, true);


--
-- Name: report_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_actions_id_seq', 1, false);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 2, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 969, true);


--
-- Name: saved_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_jobs_id_seq', 1, false);


--
-- Name: student_cvs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_cvs_id_seq', 1, false);


--
-- Name: student_educations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_educations_id_seq', 1, false);


--
-- Name: student_experiences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_experiences_id_seq', 1, false);


--
-- Name: student_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_profiles_id_seq', 82, true);


--
-- Name: student_skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_skills_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 139, true);


--
-- Name: verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verification_tokens_id_seq', 1, false);


--
-- Name: work_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_assignments_id_seq', 591, true);


--
-- Name: work_deliverables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_deliverables_id_seq', 1, false);


--
-- Name: work_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_progress_id_seq', 583, true);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: application_histories application_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_histories
    ADD CONSTRAINT application_histories_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: deliverable_reviews deliverable_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliverable_reviews
    ADD CONSTRAINT deliverable_reviews_pkey PRIMARY KEY (id);


--
-- Name: employer_profiles employer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_pkey PRIMARY KEY (id);


--
-- Name: employer_profiles employer_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_user_id_key UNIQUE (user_id);


--
-- Name: freelance_details freelance_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelance_details
    ADD CONSTRAINT freelance_details_pkey PRIMARY KEY (job_id);


--
-- Name: job_skills job_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_pkey PRIMARY KEY (job_id, skill_name);


--
-- Name: job_views job_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_views
    ADD CONSTRAINT job_views_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: part_time_details part_time_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_time_details
    ADD CONSTRAINT part_time_details_pkey PRIMARY KEY (job_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: proposal_histories proposal_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_histories
    ADD CONSTRAINT proposal_histories_pkey PRIMARY KEY (id);


--
-- Name: freelance_proposals proposals_job_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelance_proposals
    ADD CONSTRAINT proposals_job_id_student_id_key UNIQUE (job_id, student_id);


--
-- Name: freelance_proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelance_proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: report_actions report_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_actions
    ADD CONSTRAINT report_actions_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: job_saved saved_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_saved
    ADD CONSTRAINT saved_jobs_pkey PRIMARY KEY (id);


--
-- Name: seasonal_details seasonal_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonal_details
    ADD CONSTRAINT seasonal_details_pkey PRIMARY KEY (job_id);


--
-- Name: student_cvs student_cvs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_cvs
    ADD CONSTRAINT student_cvs_pkey PRIMARY KEY (id);


--
-- Name: student_educations student_educations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_educations
    ADD CONSTRAINT student_educations_pkey PRIMARY KEY (id);


--
-- Name: student_experiences student_experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_experiences
    ADD CONSTRAINT student_experiences_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: student_skills student_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_skills
    ADD CONSTRAINT student_skills_pkey PRIMARY KEY (id);


--
-- Name: work_assignments unique_application_assignment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT unique_application_assignment UNIQUE (application_id);


--
-- Name: reviews unique_job_reviewer_reviewee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_job_reviewer_reviewee UNIQUE (job_id, reviewer_id, reviewee_id);


--
-- Name: applications unique_job_student; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT unique_job_student UNIQUE (job_id, student_id);


--
-- Name: work_assignments unique_proposal_assignment; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT unique_proposal_assignment UNIQUE (proposal_id);


--
-- Name: job_saved unique_user_saved_job; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_saved
    ADD CONSTRAINT unique_user_saved_job UNIQUE (user_id, job_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_tokens verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: work_assignments work_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_pkey PRIMARY KEY (id);


--
-- Name: work_deliverables work_deliverables_assignment_id_version_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_deliverables
    ADD CONSTRAINT work_deliverables_assignment_id_version_no_key UNIQUE (assignment_id, version_no);


--
-- Name: work_deliverables work_deliverables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_deliverables
    ADD CONSTRAINT work_deliverables_pkey PRIMARY KEY (id);


--
-- Name: work_progress work_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_progress
    ADD CONSTRAINT work_progress_pkey PRIMARY KEY (id);


--
-- Name: idx_application_histories_app_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_application_histories_app_id ON public.application_histories USING btree (application_id);


--
-- Name: idx_apps_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_apps_job_id ON public.applications USING btree (job_id);


--
-- Name: idx_apps_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_apps_student_id ON public.applications USING btree (student_id);


--
-- Name: idx_jobs_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_category ON public.jobs USING btree (category);


--
-- Name: idx_jobs_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_location ON public.jobs USING btree (location);


--
-- Name: idx_jobs_status_mod; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_status_mod ON public.jobs USING btree (status, moderation_status);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, read_at, created_at);


--
-- Name: idx_password_reset_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_user ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_proposal_histories_prop_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_proposal_histories_prop_id ON public.proposal_histories USING btree (proposal_id);


--
-- Name: idx_proposals_job_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_proposals_job_status ON public.freelance_proposals USING btree (job_id, status);


--
-- Name: idx_proposals_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_proposals_student ON public.freelance_proposals USING btree (student_id);


--
-- Name: idx_saved_jobs_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_jobs_job_id ON public.job_saved USING btree (job_id);


--
-- Name: idx_saved_jobs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_jobs_user_id ON public.job_saved USING btree (user_id);


--
-- Name: idx_verification_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_verification_tokens_user ON public.verification_tokens USING btree (user_id);


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: application_histories application_histories_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_histories
    ADD CONSTRAINT application_histories_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: application_histories application_histories_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_histories
    ADD CONSTRAINT application_histories_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: applications applications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: deliverable_reviews deliverable_reviews_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliverable_reviews
    ADD CONSTRAINT deliverable_reviews_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES public.work_deliverables(id) ON DELETE CASCADE;


--
-- Name: deliverable_reviews deliverable_reviews_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliverable_reviews
    ADD CONSTRAINT deliverable_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: employer_profiles employer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: freelance_details freelance_details_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelance_details
    ADD CONSTRAINT freelance_details_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_skills job_skills_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_views job_views_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_views
    ADD CONSTRAINT job_views_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_views job_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_views
    ADD CONSTRAINT job_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jobs jobs_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: part_time_details part_time_details_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_time_details
    ADD CONSTRAINT part_time_details_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: proposal_histories proposal_histories_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_histories
    ADD CONSTRAINT proposal_histories_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: proposal_histories proposal_histories_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_histories
    ADD CONSTRAINT proposal_histories_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.freelance_proposals(id) ON DELETE CASCADE;


--
-- Name: freelance_proposals proposals_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelance_proposals
    ADD CONSTRAINT proposals_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: freelance_proposals proposals_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelance_proposals
    ADD CONSTRAINT proposals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: report_actions report_actions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_actions
    ADD CONSTRAINT report_actions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: report_actions report_actions_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_actions
    ADD CONSTRAINT report_actions_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_saved saved_jobs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_saved
    ADD CONSTRAINT saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_saved saved_jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_saved
    ADD CONSTRAINT saved_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seasonal_details seasonal_details_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonal_details
    ADD CONSTRAINT seasonal_details_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: student_cvs student_cvs_student_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_cvs
    ADD CONSTRAINT student_cvs_student_profile_id_fkey FOREIGN KEY (student_profile_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: student_educations student_educations_student_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_educations
    ADD CONSTRAINT student_educations_student_profile_id_fkey FOREIGN KEY (student_profile_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: student_experiences student_experiences_student_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_experiences
    ADD CONSTRAINT student_experiences_student_profile_id_fkey FOREIGN KEY (student_profile_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_skills student_skills_student_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_skills
    ADD CONSTRAINT student_skills_student_profile_id_fkey FOREIGN KEY (student_profile_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: verification_tokens verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: work_assignments work_assignments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: work_assignments work_assignments_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: work_assignments work_assignments_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.freelance_proposals(id) ON DELETE CASCADE;


--
-- Name: work_assignments work_assignments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: work_deliverables work_deliverables_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_deliverables
    ADD CONSTRAINT work_deliverables_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.work_assignments(id) ON DELETE CASCADE;


--
-- Name: work_deliverables work_deliverables_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_deliverables
    ADD CONSTRAINT work_deliverables_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: work_progress work_progress_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_progress
    ADD CONSTRAINT work_progress_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.work_assignments(id) ON DELETE CASCADE;


--
-- Name: work_progress work_progress_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_progress
    ADD CONSTRAINT work_progress_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 3xD4vUAkDkDE7iroUsF6TwLESlrfQ37AHqOLgaG4kQGZxb64YaM0jlPUCBxelg7

