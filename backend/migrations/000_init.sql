--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

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

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.visibility AS ENUM (
    'public',
    'private'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid,
    filename character varying(255) NOT NULL,
    path character varying(1000) NOT NULL,
    mime_type character varying(100) NOT NULL,
    size integer NOT NULL,
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    orig_filename character varying(255) NOT NULL,
    expires_at timestamp with time zone,
    user_id uuid NOT NULL,
    width integer,
    height integer
);


--
-- Name: images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    file_id uuid NOT NULL,
    sort integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: password_reset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    used_at timestamp with time zone,
    expires_at timestamp with time zone DEFAULT (now() + '00:15:00'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: post_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid,
    device_id uuid,
    tz character varying,
    screen_height integer,
    screen_width integer,
    cpu_count integer,
    referrer text,
    client text,
    ip inet,
    os text,
    device_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    country text,
    city text,
    device text
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(200) DEFAULT NULL::character varying,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    user_id uuid NOT NULL,
    visibility public.visibility DEFAULT 'public'::public.visibility NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    views integer DEFAULT 0 NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid NOT NULL,
    client_tz character varying(100) NOT NULL,
    used_at timestamp with time zone,
    revoked_at timestamp with time zone,
    is_used boolean GENERATED ALWAYS AS ((used_at IS NOT NULL)) STORED NOT NULL,
    is_revoked boolean GENERATED ALWAYS AS ((revoked_at IS NOT NULL)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    user_id uuid NOT NULL,
    screen_height integer,
    screen_width integer,
    cpu_count integer NOT NULL,
    previous_refresh_token_id uuid,
    request_ip inet,
    remember boolean DEFAULT false NOT NULL
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    avatar_url text,
    date_of_birth timestamp with time zone,
    bio text,
    phone_number character varying(25) DEFAULT NULL::bpchar,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    first_name character varying(255) DEFAULT NULL::character varying,
    last_name character varying(255) DEFAULT NULL::character varying,
    gender character varying,
    avatar_file_id uuid
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username public.citext NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    password character varying(255),
    email public.citext DEFAULT NULL::character varying,
    email_confirm_code character varying(4) DEFAULT NULL::character varying,
    email_confirmed boolean,
    unconfirmed_email character varying(255) DEFAULT NULL::character varying,
    email_confirm_code_first_sent_at timestamp with time zone,
    email_confirm_code_last_sent_at timestamp with time zone,
    email_confirm_code_num_sent smallint DEFAULT 0 NOT NULL,
    vanity_id character varying(100) DEFAULT NULL::character varying,
    google_id text,
    facebook_id text,
    password_updated_at timestamp with time zone,
    deleted boolean,
    deleted_at timestamp with time zone
);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: user_profiles gender; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles
    ADD CONSTRAINT gender CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'non-binary'::character varying, 'unknown'::character varying])::text[]))) NOT VALID;


--
-- Name: password_reset password_reset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset
    ADD CONSTRAINT password_reset_pkey PRIMARY KEY (id);


--
-- Name: comments post_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT post_comments_pkey PRIMARY KEY (id);


--
-- Name: images post_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT post_files_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: post_views post_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_views
    ADD CONSTRAINT post_views_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: users unique_facebook_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_facebook_id UNIQUE (facebook_id);


--
-- Name: users unique_google_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_google_id UNIQUE (google_id);


--
-- Name: password_reset unique_token_hash; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset
    ADD CONSTRAINT unique_token_hash UNIQUE (token_hash);


--
-- Name: post_likes uq_user_post; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT uq_user_post UNIQUE (user_id, post_id);


--
-- Name: user_profiles user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profile_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profile_uk UNIQUE (id, user_id);


--
-- Name: user_roles user_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_role_key UNIQUE (user_id, role);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--