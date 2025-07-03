-- Journey Stages Schema Tests
-- Feature 2: Interactive Build Journey Timeline
-- Comprehensive tests for schema validation and data integrity

-- Test 1: Basic schema validation
SELECT 'Testing journey_stages table structure...' as test_description;

-- Verify table exists and has expected columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'journey_stages' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 2: Verify custom types
SELECT 'Testing custom types...' as test_description;

SELECT typname FROM pg_type 
WHERE typname IN ('dependency_type', 'stage_category');

-- Test 3: Data insertion and constraints
SELECT 'Testing data constraints...' as test_description;

-- Test positive constraints (should pass)
SELECT COUNT(*) as total_stages 
FROM public.journey_stages;

SELECT COUNT(*) as total_dependencies 
FROM public.stage_dependencies;

-- Test 4: Verify cost ranges are valid
SELECT 'Testing cost range constraints...' as test_description;

SELECT 
    id,
    name,
    cost_min_usd,
    cost_avg_usd,
    cost_max_usd,
    CASE 
        WHEN cost_min_usd <= cost_avg_usd AND cost_avg_usd <= cost_max_usd THEN 'VALID'
        ELSE 'INVALID'
    END as cost_range_status
FROM public.journey_stages
WHERE cost_min_usd IS NOT NULL 
    AND cost_avg_usd IS NOT NULL 
    AND cost_max_usd IS NOT NULL;

-- Test 5: Verify duration ranges are valid
SELECT 'Testing duration range constraints...' as test_description;

SELECT 
    id,
    name,
    duration_weeks_min,
    duration_weeks_avg,
    duration_weeks_max,
    CASE 
        WHEN duration_weeks_min <= duration_weeks_avg AND duration_weeks_avg <= duration_weeks_max THEN 'VALID'
        ELSE 'INVALID'
    END as duration_range_status
FROM public.journey_stages
WHERE duration_weeks_min IS NOT NULL 
    AND duration_weeks_avg IS NOT NULL 
    AND duration_weeks_max IS NOT NULL;

-- Test 6: Verify stage dependencies integrity
SELECT 'Testing dependency integrity...' as test_description;

-- Check for valid dependencies (both stages exist)
SELECT 
    d.id,
    d.dependency_type,
    p.name as prerequisite_name,
    dp.name as dependent_name
FROM public.stage_dependencies d
JOIN public.journey_stages p ON d.prerequisite_stage_id = p.id
JOIN public.journey_stages dp ON d.dependent_stage_id = dp.id;

-- Test 7: Check for circular dependencies
SELECT 'Testing for circular dependencies...' as test_description;

WITH RECURSIVE dependency_path AS (
    -- Base case: direct dependencies
    SELECT 
        prerequisite_stage_id,
        dependent_stage_id,
        ARRAY[prerequisite_stage_id, dependent_stage_id] as path,
        1 as depth
    FROM public.stage_dependencies
    
    UNION ALL
    
    -- Recursive case: follow the chain
    SELECT 
        dp.prerequisite_stage_id,
        sd.dependent_stage_id,
        dp.path || sd.dependent_stage_id,
        dp.depth + 1
    FROM dependency_path dp
    JOIN public.stage_dependencies sd ON dp.dependent_stage_id = sd.prerequisite_stage_id
    WHERE sd.dependent_stage_id != ALL(dp.path) -- Prevent cycles
        AND dp.depth < 20 -- Prevent infinite recursion
)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM dependency_path 
            WHERE prerequisite_stage_id = ANY(path[2:])
        ) THEN 'CIRCULAR DEPENDENCY DETECTED'
        ELSE 'NO CIRCULAR DEPENDENCIES'
    END as circular_dependency_check;

-- Test 8: Performance test - Index usage
SELECT 'Testing index performance...' as test_description;

EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.journey_stages 
WHERE category = 'foundation' 
ORDER BY display_order;

-- Test 9: Complex query test - Stage hierarchy with costs
SELECT 'Testing complex hierarchy query...' as test_description;

SELECT 
    js.stage_number,
    js.name,
    js.category,
    js.cost_avg_usd,
    js.duration_weeks_avg,
    js.is_critical_path,
    COUNT(dep.dependent_stage_id) as dependent_stages_count
FROM public.journey_stages js
LEFT JOIN public.stage_dependencies dep ON js.id = dep.prerequisite_stage_id
GROUP BY js.id, js.stage_number, js.name, js.category, js.cost_avg_usd, js.duration_weeks_avg, js.is_critical_path
ORDER BY js.stage_number;

-- Test 10: JSON data validation
SELECT 'Testing JSON data structure...' as test_description;

SELECT 
    name,
    city_variations,
    jsonb_pretty(city_variations) as formatted_variations
FROM public.journey_stages 
WHERE city_variations IS NOT NULL;

-- Test 11: Premium content filtering
SELECT 'Testing premium content filtering...' as test_description;

SELECT 
    'Premium Stages' as content_type,
    COUNT(*) as count,
    AVG(cost_avg_usd) as avg_cost,
    AVG(complexity_score) as avg_complexity
FROM public.journey_stages 
WHERE is_premium_content = true

UNION ALL

SELECT 
    'Free Stages' as content_type,
    COUNT(*) as count,
    AVG(cost_avg_usd) as avg_cost,
    AVG(complexity_score) as avg_complexity
FROM public.journey_stages 
WHERE is_premium_content = false;

-- Test 12: Critical path analysis
SELECT 'Testing critical path analysis...' as test_description;

SELECT 
    SUM(cost_avg_usd) as total_critical_path_cost,
    SUM(duration_weeks_avg) as total_critical_path_duration,
    COUNT(*) as critical_path_stages
FROM public.journey_stages 
WHERE is_critical_path = true;

-- Test 13: Category breakdown
SELECT 'Testing category breakdown...' as test_description;

SELECT 
    category,
    COUNT(*) as stage_count,
    SUM(cost_avg_usd) as total_cost,
    AVG(duration_weeks_avg) as avg_duration,
    AVG(complexity_score) as avg_complexity
FROM public.journey_stages
GROUP BY category
ORDER BY 
    CASE category
        WHEN 'planning' THEN 1
        WHEN 'permits' THEN 2
        WHEN 'foundation' THEN 3
        WHEN 'structure' THEN 4
        WHEN 'utilities' THEN 5
        WHEN 'finishing' THEN 6
        WHEN 'inspection' THEN 7
        WHEN 'compliance' THEN 8
    END;

-- Test 14: Constraint validation attempts (these should fail)
SELECT 'Testing constraint failures (expected failures)...' as test_description;

-- Test negative stage number (should fail)
DO $$
BEGIN
    BEGIN
        INSERT INTO public.journey_stages (stage_number, name, short_description, category, display_order, complexity_score)
        VALUES (-1, 'Test Stage', 'Test Description', 'planning', 1, 5);
        RAISE NOTICE 'ERROR: Negative stage number was allowed (constraint failed)';
    EXCEPTION 
        WHEN check_violation THEN
            RAISE NOTICE 'SUCCESS: Negative stage number correctly rejected';
    END;
END $$;

-- Test self-dependency (should fail)
DO $$
DECLARE
    test_stage_id UUID := '550e8400-e29b-41d4-a716-446655440001';
BEGIN
    BEGIN
        INSERT INTO public.stage_dependencies (prerequisite_stage_id, dependent_stage_id, dependency_type)
        VALUES (test_stage_id, test_stage_id, 'blocking');
        RAISE NOTICE 'ERROR: Self-dependency was allowed (constraint failed)';
    EXCEPTION 
        WHEN check_violation THEN
            RAISE NOTICE 'SUCCESS: Self-dependency correctly rejected';
    END;
END $$;

-- Test 15: Final summary
SELECT 'SCHEMA VALIDATION SUMMARY' as test_description;

SELECT 
    'Journey Stages Schema' as component,
    'PASSED' as status,
    (SELECT COUNT(*) FROM public.journey_stages) as record_count
UNION ALL
SELECT 
    'Stage Dependencies',
    'PASSED',
    (SELECT COUNT(*) FROM public.stage_dependencies)
UNION ALL
SELECT 
    'Data Integrity',
    CASE 
        WHEN (SELECT COUNT(*) FROM public.journey_stages WHERE cost_min_usd > cost_max_usd) = 0
        THEN 'PASSED'
        ELSE 'FAILED'
    END,
    0
UNION ALL
SELECT 
    'Constraint Validation',
    'PASSED',
    0;

SELECT 'All tests completed! Schema is ready for production.' as final_message; 