-- =====================================================
-- ANALYSIS TABLES SETUP SCRIPT
-- =====================================================
-- This script creates the analysis tables for RiskRead AI
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE ANALYSIS TABLES
-- =====================================================

-- Analysis records table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'xlsx')),
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    overall_score DECIMAL(5,2),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    relevance_score DECIMAL(5,2) NOT NULL,
    completeness_score DECIMAL(5,2) NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL,
    clarity_score DECIMAL(5,2) NOT NULL,
    accuracy_score DECIMAL(5,2) NOT NULL,
    insights JSONB NOT NULL DEFAULT '[]',
    recommendations JSONB NOT NULL DEFAULT '[]',
    extracted_fields JSONB NOT NULL DEFAULT '[]',
    highlights JSONB NOT NULL DEFAULT '[]',
    questions JSONB NOT NULL DEFAULT '[]',
    raw_ai_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis history for tracking changes
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON public.analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON public.analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis_id ON public.analysis_results(analysis_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_status ON public.analyses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON public.analyses(user_id, created_at DESC);

-- =====================================================
-- 3. CREATE UPDATED_AT TRIGGER FUNCTION
-- =====================================================

-- This function already exists from user profile setup, but let's ensure it exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp for analyses
DROP TRIGGER IF EXISTS trigger_handle_analyses_updated_at ON public.analyses;
CREATE TRIGGER trigger_handle_analyses_updated_at
    BEFORE UPDATE ON public.analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on analysis tables
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Analysis policies
CREATE POLICY "Users can view own analyses" ON public.analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Results policies
CREATE POLICY "Users can view own analysis results" ON public.analysis_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = analysis_results.analysis_id
            AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own analysis results" ON public.analysis_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = analysis_results.analysis_id
            AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own analysis results" ON public.analysis_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = analysis_results.analysis_id
            AND analyses.user_id = auth.uid()
        )
    );

-- History policies
CREATE POLICY "Users can view own analysis history" ON public.analysis_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = analysis_history.analysis_id
            AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own analysis history" ON public.analysis_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = analysis_history.analysis_id
            AND analyses.user_id = auth.uid()
        )
    );

-- =====================================================
-- 6. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get user's analyses
CREATE OR REPLACE FUNCTION public.get_user_analyses(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_status TEXT DEFAULT NULL,
    p_risk_level TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    status TEXT,
    overall_score DECIMAL(5,2),
    risk_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_analyses AS (
        SELECT 
            a.*,
            COUNT(*) OVER() as total_count
        FROM public.analyses a
        WHERE a.user_id = p_user_id
        AND (p_status IS NULL OR a.status = p_status)
        AND (p_risk_level IS NULL OR a.risk_level = p_risk_level)
        ORDER BY a.created_at DESC
        LIMIT p_limit OFFSET p_offset
    )
    SELECT 
        fa.id,
        fa.file_name,
        fa.file_type,
        fa.file_size,
        fa.status,
        fa.overall_score,
        fa.risk_level,
        fa.created_at,
        fa.total_count
    FROM filtered_analyses fa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analysis with results
CREATE OR REPLACE FUNCTION public.get_analysis_with_results(p_analysis_id UUID)
RETURNS TABLE (
    analysis_id UUID,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    status TEXT,
    overall_score DECIMAL(5,2),
    risk_level TEXT,
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
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as analysis_id,
        a.file_name,
        a.file_type,
        a.file_size,
        a.status,
        a.overall_score,
        a.risk_level,
        ar.relevance_score,
        ar.completeness_score,
        ar.risk_score,
        ar.clarity_score,
        ar.accuracy_score,
        ar.insights,
        ar.recommendations,
        ar.extracted_fields,
        ar.highlights,
        ar.questions,
        a.created_at
    FROM public.analyses a
    LEFT JOIN public.analysis_results ar ON a.id = ar.analysis_id
    WHERE a.id = p_analysis_id
    AND a.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update analysis status
CREATE OR REPLACE FUNCTION public.update_analysis_status(
    p_analysis_id UUID,
    p_status TEXT,
    p_overall_score DECIMAL(5,2) DEFAULT NULL,
    p_risk_level TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE public.analyses 
    SET 
        status = p_status,
        overall_score = COALESCE(p_overall_score, overall_score),
        risk_level = COALESCE(p_risk_level, risk_level),
        processing_completed_at = CASE 
            WHEN p_status = 'completed' THEN NOW()
            ELSE processing_completed_at
        END,
        processing_started_at = CASE 
            WHEN p_status = 'processing' AND processing_started_at IS NULL THEN NOW()
            ELSE processing_started_at
        END
    WHERE id = p_analysis_id 
    AND user_id = auth.uid();
    
    -- Insert history record
    INSERT INTO public.analysis_history (analysis_id, action, new_values, performed_by)
    VALUES (
        p_analysis_id,
        'status_update',
        jsonb_build_object(
            'status', p_status,
            'overall_score', p_overall_score,
            'risk_level', p_risk_level
        ),
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analyses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.analysis_results TO authenticated;
GRANT SELECT, INSERT ON public.analysis_history TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_analyses(UUID, INTEGER, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analysis_with_results(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_analysis_status(UUID, TEXT, DECIMAL, TEXT) TO authenticated;

-- =====================================================
-- SCRIPT COMPLETION
-- =====================================================

-- Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Analysis tables setup completed successfully!';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '- Analysis and results tables with proper relationships';
    RAISE NOTICE '- Row Level Security (RLS) policies for data protection';
    RAISE NOTICE '- Performance indexes for optimal queries';
    RAISE NOTICE '- Helper functions for common operations';
    RAISE NOTICE '- Automatic timestamp updates';
    RAISE NOTICE '- Analysis history tracking';
END $$;

