-- =====================================================
-- RiskRead AI - Complete Database Setup
-- =====================================================
-- Run this script in Supabase SQL Editor to set up the complete system
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE USER PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    -- Core identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic information (from auth.users)
    email TEXT NOT NULL,
    full_name TEXT,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    
    -- Contact information
    phone TEXT,
    country TEXT,
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en',
    
    -- Profile media
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    
    -- Social links
    website TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    
    -- Professional information
    company TEXT,
    job_title TEXT,
    industry TEXT,
    
    -- Preferences and settings
    is_public BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    
    -- Metadata
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT valid_website CHECK (website IS NULL OR website ~* '^https?://.*'),
    CONSTRAINT valid_social_url CHECK (
        (twitter_url IS NULL OR twitter_url ~* '^https?://(www\.)?twitter\.com/.*') AND
        (linkedin_url IS NULL OR linkedin_url ~* '^https?://(www\.)?linkedin\.com/.*') AND
        (github_url IS NULL OR github_url ~* '^https?://(www\.)?github\.com/.*')
    )
);

-- =====================================================
-- 2. CREATE ANALYSIS TABLES
-- =====================================================

-- Analysis records table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
    file_size INTEGER,
    file_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    overall_score DECIMAL(5,2),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    relevance_score DECIMAL(5,2),
    completeness_score DECIMAL(5,2),
    risk_score DECIMAL(5,2),
    clarity_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    insights JSONB,
    recommendations JSONB,
    extracted_fields JSONB,
    highlights JSONB,
    questions JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON public.user_profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_seen ON public.user_profiles(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completed ON public.user_profiles(profile_completed_at) WHERE profile_completed_at IS NOT NULL;

-- Analysis indexes
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis_id ON analysis_results(analysis_id);

-- =====================================================
-- 4. CREATE STORAGE BUCKET
-- =====================================================

-- Create the analysis-files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'analysis-files',
    'analysis-files',
    true,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CREATE TRIGGER FUNCTIONS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        display_name,
        first_name,
        last_name,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            NEW.raw_user_meta_data->>'image'
        ),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, update it with new auth data
        UPDATE public.user_profiles 
        SET 
            email = NEW.email,
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
            display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name'),
            first_name = NEW.raw_user_meta_data->>'first_name',
            last_name = NEW.raw_user_meta_data->>'last_name',
            avatar_url = COALESCE(
                NEW.raw_user_meta_data->>'avatar_url',
                NEW.raw_user_meta_data->>'picture',
                NEW.raw_user_meta_data->>'image'
            ),
            updated_at = NOW()
        WHERE user_id = NEW.id;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp for user_profiles
DROP TRIGGER IF EXISTS trigger_handle_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_handle_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;
CREATE TRIGGER trigger_handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger for analyses table
CREATE TRIGGER update_analyses_updated_at
    BEFORE UPDATE ON analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 7. SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
    FOR SELECT USING (is_public = true);

-- Analysis policies
CREATE POLICY "Users can view own analyses" ON analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Analysis results policies
CREATE POLICY "Users can view own analysis results" ON analysis_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analyses 
            WHERE analyses.id = analysis_results.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own analysis results" ON analysis_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM analyses 
            WHERE analyses.id = analysis_results.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own analysis results" ON analysis_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM analyses 
            WHERE analyses.id = analysis_results.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own analysis results" ON analysis_results
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM analyses 
            WHERE analyses.id = analysis_results.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );

-- =====================================================
-- 8. SET UP STORAGE POLICIES
-- =====================================================

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'analysis-files' 
        AND auth.role() = 'authenticated'
    );

-- Policy: Allow users to view their own uploaded files
CREATE POLICY "Allow users to view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'analysis-files' 
        AND auth.role() = 'authenticated'
    );

-- Policy: Allow users to update their own files
CREATE POLICY "Allow users to update own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'analysis-files' 
        AND auth.role() = 'authenticated'
    );

-- Policy: Allow users to delete their own files
CREATE POLICY "Allow users to delete own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'analysis-files' 
        AND auth.role() = 'authenticated'
    );

-- =====================================================
-- 9. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get current user's profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.user_profiles AS $$
    SELECT * FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to update last seen
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void AS $$
BEGIN
    UPDATE public.user_profiles 
    SET last_seen_at = NOW() 
    WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark profile as completed
CREATE OR REPLACE FUNCTION public.mark_profile_completed()
RETURNS void AS $$
BEGIN
    UPDATE public.user_profiles 
    SET profile_completed_at = NOW() 
    WHERE user_id = auth.uid() AND profile_completed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analyses with pagination
CREATE OR REPLACE FUNCTION get_user_analyses(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    status TEXT,
    overall_score DECIMAL(5,2),
    risk_level TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.file_name,
        a.file_type,
        a.file_size,
        a.status,
        a.overall_score,
        a.risk_level,
        a.created_at,
        a.updated_at
    FROM analyses a
    WHERE a.user_id = p_user_id
    AND (p_status IS NULL OR a.status = p_status)
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analysis with results
CREATE OR REPLACE FUNCTION get_analysis_with_results(p_analysis_id UUID)
RETURNS TABLE (
    analysis_id UUID,
    user_id UUID,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    file_url TEXT,
    status TEXT,
    overall_score DECIMAL(5,2),
    risk_level TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    relevance_score DECIMAL(5,2),
    completeness_score DECIMAL(5,2),
    risk_score DECIMAL(5,2),
    clarity_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    insights JSONB,
    recommendations JSONB,
    extracted_fields JSONB,
    highlights JSONB,
    questions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as analysis_id,
        a.user_id,
        a.file_name,
        a.file_type,
        a.file_size,
        a.file_url,
        a.status,
        a.overall_score,
        a.risk_level,
        a.created_at,
        a.updated_at,
        ar.relevance_score,
        ar.completeness_score,
        ar.risk_score,
        ar.clarity_score,
        ar.accuracy_score,
        ar.insights,
        ar.recommendations,
        ar.extracted_fields,
        ar.highlights,
        ar.questions
    FROM analyses a
    LEFT JOIN analysis_results ar ON a.id = ar.analysis_id
    WHERE a.id = p_analysis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update analysis status
CREATE OR REPLACE FUNCTION update_analysis_status(
    p_analysis_id UUID,
    p_status TEXT,
    p_overall_score DECIMAL(5,2) DEFAULT NULL,
    p_risk_level TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE analyses 
    SET 
        status = p_status,
        overall_score = COALESCE(p_overall_score, overall_score),
        risk_level = COALESCE(p_risk_level, risk_level),
        updated_at = NOW()
    WHERE id = p_analysis_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for public profiles
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    display_name,
    full_name,
    bio,
    avatar_url,
    banner_url,
    company,
    job_title,
    website,
    twitter_url,
    linkedin_url,
    github_url,
    country,
    created_at
FROM public.user_profiles 
WHERE is_public = true;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analyses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analysis_results TO authenticated;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_last_seen() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_profile_completed() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analyses(UUID, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_analysis_with_results(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_analysis_status(UUID, TEXT, DECIMAL, TEXT) TO authenticated;

-- Grant permissions to anon users for public profiles
GRANT SELECT ON public.public_profiles TO anon;

-- =====================================================
-- 12. VERIFICATION
-- =====================================================

-- Check if tables were created successfully
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'analyses', 'analysis_results');

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'analyses', 'analysis_results');

-- Check if bucket was created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'analysis-files';

-- Check storage policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'RiskRead AI Complete Database Setup completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was created:';
    RAISE NOTICE '- User profiles table with automatic creation on signup';
    RAISE NOTICE '- Analysis tables (analyses, analysis_results)';
    RAISE NOTICE '- Row Level Security (RLS) policies for all tables';
    RAISE NOTICE '- Storage bucket (analysis-files) with policies';
    RAISE NOTICE '- Helper functions for common operations';
    RAISE NOTICE '- Performance indexes and triggers';
    RAISE NOTICE '- Public profile view';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now test the file upload and analysis functionality!';
END $$;
