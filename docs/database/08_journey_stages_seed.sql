-- Journey Stages Seed Data
-- Feature 2: Interactive Build Journey Timeline
-- Seed data for Zimbabwe house building journey stages

-- Insert main journey stages (parent stages)
INSERT INTO public.journey_stages (
    id,
    stage_number,
    name,
    short_description,
    detailed_description,
    category,
    cost_min_usd,
    cost_avg_usd,
    cost_max_usd,
    cost_notes,
    duration_weeks_min,
    duration_weeks_avg,
    duration_weeks_max,
    duration_notes,
    seasonal_notes,
    risk_factors,
    required_permits,
    best_practices,
    common_mistakes,
    city_variations,
    is_premium_content,
    is_critical_path,
    display_order,
    complexity_score
) VALUES
-- 1. PLANNING PHASE
(
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    'Land Acquisition & Legal Due Diligence',
    'Secure suitable land and complete all legal requirements for property ownership',
    'Comprehensive land acquisition process including title verification, surveying, legal clearances, and preparation for development. This critical first step establishes the foundation for your entire building project.',
    'planning',
    2000.00,
    4500.00,
    8000.00,
    'Varies significantly by location and land size. Urban areas command premium prices.',
    4,
    8,
    16,
    'Legal processes can be unpredictable, especially title verification',
    'Avoid rainy season for surveying. Best to complete during dry season (April-October)',
    ARRAY['Title disputes', 'Surveying delays', 'Legal document complications', 'Zoning restrictions'],
    ARRAY['Certificate of No Objection', 'Survey Certificate', 'Title Deeds', 'Municipal Approval'],
    'Engage qualified surveyor and legal practitioner. Verify all boundaries and access rights.',
    'Skipping proper due diligence, not verifying access rights, inadequate boundary surveys',
    '{"harare": {"cost_multiplier": 1.5, "duration_weeks": 10}, "bulawayo": {"cost_multiplier": 1.2, "duration_weeks": 8}, "gweru": {"cost_multiplier": 1.0, "duration_weeks": 6}}',
    true,
    true,
    1,
    8
),

-- 2. PERMITS & APPROVALS
(
    '550e8400-e29b-41d4-a716-446655440002',
    2,
    'Building Plans & Permit Applications',
    'Design house plans and obtain all required building permits and approvals',
    'Professional architectural design and comprehensive permit application process. Includes structural engineering, environmental clearances, and municipal approvals essential for legal construction.',
    'permits',
    1200.00,
    2800.00,
    5000.00,
    'Architect fees vary by house complexity and city requirements',
    6,
    12,
    20,
    'Permit approval times vary by municipality and plan complexity',
    'Submit during dry season for faster site inspections',
    ARRAY['Plan rejections', 'Permit delays', 'Code compliance issues', 'Engineering complications'],
    ARRAY['Building Plans Approval', 'Environmental Impact Assessment', 'Fire Department Clearance', 'Municipal Building Permit'],
    'Use registered architects. Ensure plans comply with local building codes. Submit complete documentation.',
    'Using unregistered professionals, incomplete submissions, not following building codes',
    '{"harare": {"cost_multiplier": 1.4, "approval_weeks": 16}, "bulawayo": {"cost_multiplier": 1.1, "approval_weeks": 10}, "gweru": {"cost_multiplier": 0.9, "approval_weeks": 8}}',
    true,
    true,
    2,
    7
),

-- 3. SITE PREPARATION
(
    '550e8400-e29b-41d4-a716-446655440003',
    3,
    'Site Preparation & Excavation',
    'Clear land, excavate for foundation, and prepare construction site',
    'Comprehensive site preparation including land clearing, excavation, temporary structures, and site security. Critical foundation work that determines structural integrity.',
    'foundation',
    800.00,
    1500.00,
    3000.00,
    'Cost depends on terrain difficulty and access',
    2,
    3,
    6,
    'Weather dependent - avoid rainy season',
    'Cannot excavate during heavy rains. Best done in dry season (May-September)',
    ARRAY['Weather delays', 'Hard rock excavation', 'Underground utilities', 'Access difficulties'],
    ARRAY['Excavation Permit', 'Utility Clearances'],
    'Test soil conditions first. Ensure proper drainage planning. Secure site boundaries.',
    'Inadequate soil testing, poor drainage planning, unsafe excavation practices',
    '{"rocky_terrain": {"cost_multiplier": 1.8}, "flat_terrain": {"cost_multiplier": 1.0}, "sloped_terrain": {"cost_multiplier": 1.3}}',
    false,
    true,
    3,
    6
),

-- 4. FOUNDATION
(
    '550e8400-e29b-41d4-a716-446655440004',
    4,
    'Foundation Construction',
    'Build concrete foundation, footings, and damp-proof course',
    'Professional foundation construction with proper concrete mix, reinforcement, and waterproofing. The most critical structural element determining building longevity and stability.',
    'foundation',
    2500.00,
    4500.00,
    7000.00,
    'Concrete and steel prices fluctuate significantly',
    3,
    4,
    6,
    'Concrete curing requires dry weather',
    'Avoid concrete work during heavy rains. Temperature affects curing time.',
    ARRAY['Concrete quality issues', 'Reinforcement problems', 'Weather delays', 'Poor workmanship'],
    ARRAY['Foundation Inspection Certificate'],
    'Use quality concrete suppliers. Ensure proper reinforcement placement. Allow adequate curing time.',
    'Poor concrete quality, inadequate reinforcement, rushing curing process',
    '{"harare": {"concrete_cost_multiplier": 1.2}, "bulawayo": {"concrete_cost_multiplier": 1.1}, "rural": {"transport_cost_multiplier": 1.5}}',
    true,
    true,
    4,
    9
),

-- 5. STRUCTURAL WORK
(
    '550e8400-e29b-41d4-a716-446655440005',
    5,
    'Structural Framework & Walls',
    'Build structural framework, walls, and load-bearing elements',
    'Complete structural construction including brick/block work, columns, beams, and load-bearing walls. This phase creates the main structure and determines spatial layout.',
    'structure',
    3500.00,
    6500.00,
    10000.00,
    'Material costs vary significantly with brick quality and availability',
    6,
    8,
    12,
    'Progress depends on crew size and material availability',
    'Mortar work best in moderate temperatures. Avoid extreme heat.',
    ARRAY['Material shortages', 'Quality control issues', 'Structural defects', 'Workforce availability'],
    ARRAY['Structural Progress Inspection'],
    'Use quality bricks/blocks. Maintain consistent mortar mix. Regular structural inspections.',
    'Poor quality materials, inconsistent mortar mix, inadequate structural supervision',
    '{"burnt_brick": {"cost_multiplier": 1.3, "quality": "high"}, "concrete_block": {"cost_multiplier": 1.0, "quality": "medium"}, "clay_brick": {"cost_multiplier": 0.8, "quality": "basic"}}',
    true,
    true,
    5,
    8
),

-- 6. ROOFING
(
    '550e8400-e29b-41d4-a716-446655440006',
    6,
    'Roof Structure & Covering',
    'Install roof trusses, covering, and waterproofing systems',
    'Complete roofing system including timber trusses, roof covering, gutters, and comprehensive waterproofing. Critical for weather protection and structural completion.',
    'structure',
    2000.00,
    3500.00,
    6000.00,
    'Roofing material quality significantly impacts cost',
    3,
    4,
    6,
    'Weather sensitive work - requires dry conditions',
    'Must complete before rainy season. High winds can delay installation.',
    ARRAY['Weather delays', 'Material quality issues', 'Installation defects', 'Structural loading problems'],
    ARRAY['Roofing Completion Certificate'],
    'Use seasoned timber. Ensure proper ventilation. Quality waterproofing essential.',
    'Poor timber quality, inadequate waterproofing, incorrect installation',
    '{"asbestos": {"cost_multiplier": 0.8, "lifespan": "medium"}, "corrugated_iron": {"cost_multiplier": 1.0, "lifespan": "good"}, "tiles": {"cost_multiplier": 1.8, "lifespan": "excellent"}}',
    true,
    true,
    6,
    7
),

-- 7. UTILITIES INSTALLATION
(
    '550e8400-e29b-41d4-a716-446655440007',
    7,
    'Electrical & Plumbing Installation',
    'Install electrical wiring, plumbing systems, and utility connections',
    'Professional installation of all electrical and plumbing systems. Includes connection to municipal services, internal distribution systems, and safety compliance measures.',
    'utilities',
    1800.00,
    3200.00,
    5500.00,
    'Electrical materials and certified electrician fees',
    4,
    6,
    8,
    'Requires coordination with utility providers',
    'Utility connections may be delayed during peak periods',
    ARRAY['Utility connection delays', 'Electrical safety issues', 'Plumbing complications', 'Certification problems'],
    ARRAY['Electrical Certificate of Compliance', 'Plumbing Approval', 'Utility Connection Permits'],
    'Use certified electricians and plumbers. Test all systems thoroughly before covering.',
    'Using uncertified professionals, poor quality materials, inadequate testing',
    '{"harare": {"utility_connection_cost": 800}, "bulawayo": {"utility_connection_cost": 600}, "rural": {"generator_backup_cost": 1200}}',
    true,
    true,
    7,
    8
),

-- 8. FINISHING WORKS
(
    '550e8400-e29b-41d4-a716-446655440008',
    8,
    'Plastering, Painting & Interior Finishing',
    'Complete all interior and exterior finishing work',
    'Comprehensive finishing work including plastering, painting, flooring, ceiling installation, and interior fittings. This phase transforms structure into livable space.',
    'finishing',
    2200.00,
    4000.00,
    7000.00,
    'Finish quality significantly impacts cost',
    6,
    8,
    12,
    'Sequential work requiring proper drying times',
    'Avoid painting during rainy season. Humidity affects finish quality.',
    ARRAY['Quality control issues', 'Material availability', 'Weather sensitivity', 'Skilled labour shortage'],
    ARRAY['Building Progress Inspection'],
    'Allow proper drying time between coats. Use quality materials for durability.',
    'Rushing finish work, poor quality materials, inadequate surface preparation',
    '{"standard_finish": {"cost_multiplier": 1.0}, "premium_finish": {"cost_multiplier": 1.8}, "luxury_finish": {"cost_multiplier": 3.0}}',
    true,
    false,
    8,
    6
),

-- 9. FINAL INSPECTIONS
(
    '550e8400-e29b-41d4-a716-446655440009',
    9,
    'Final Inspections & Compliance',
    'Complete all required inspections and obtain occupancy certificates',
    'Final compliance verification including structural, electrical, plumbing, and safety inspections. Essential for legal occupancy and property registration.',
    'inspection',
    300.00,
    600.00,
    1200.00,
    'Inspection fees and potential remedial work',
    2,
    3,
    6,
    'Scheduling depends on inspector availability',
    'Allow extra time during busy construction periods',
    ARRAY['Inspection failures', 'Remedial work requirements', 'Scheduling delays', 'Compliance gaps'],
    ARRAY['Occupancy Certificate', 'Final Building Approval', 'Safety Compliance Certificate'],
    'Address all previous inspection comments. Ensure all systems are functional.',
    'Ignoring previous inspection feedback, incomplete remedial work',
    '{"urban": {"inspection_thoroughness": "high"}, "rural": {"inspection_thoroughness": "medium"}}',
    false,
    true,
    9,
    5
),

-- 10. MOVE-IN PREPARATION
(
    '550e8400-e29b-41d4-a716-446655440010',
    10,
    'Final Cleanup & Move-in Preparation',
    'Complete final cleanup, landscaping, and prepare for occupancy',
    'Final preparation for occupancy including comprehensive cleanup, basic landscaping, security installation, and utility activation. The exciting final step to homeownership.',
    'finishing',
    500.00,
    1000.00,
    2000.00,
    'Cleanup and landscaping costs',
    1,
    2,
    3,
    'Quick final phase',
    'Good time for landscaping and external work',
    ARRAY['Weather delays for external work', 'Security system issues', 'Final defects'],
    ARRAY['Water Connection Certificate', 'Electricity Connection Certificate'],
    'Thorough final inspection. Document any defects for contractor follow-up.',
    'Inadequate final inspection, not documenting defects',
    '{"basic_landscaping": {"cost_multiplier": 1.0}, "premium_landscaping": {"cost_multiplier": 2.5}}',
    false,
    false,
    10,
    3
);

-- Insert stage dependencies
INSERT INTO public.stage_dependencies (
    prerequisite_stage_id,
    dependent_stage_id,
    dependency_type,
    dependency_notes
) VALUES
-- Linear dependencies (blocking)
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'blocking', 'Land must be secured before applying for building permits'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'blocking', 'Building permits required before site preparation'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'blocking', 'Site must be prepared before foundation work'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'blocking', 'Foundation must be complete before structural work'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 'blocking', 'Walls must be up before roof installation'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007', 'blocking', 'Roof must be complete before utilities installation'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008', 'blocking', 'Utilities must be in before finishing work'),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440009', 'blocking', 'Finishing work must be complete before final inspections'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', 'blocking', 'All inspections must pass before move-in preparation'),

-- Optional dependencies (planning optimizations)
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 'optional', 'Early utility planning can be beneficial during land acquisition phase');

-- Add RLS policies for journey stages (assuming auth schema exists)
-- ALTER TABLE public.journey_stages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.stage_dependencies ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Journey stages are viewable by everyone" ON public.journey_stages
--     FOR SELECT USING (true);

-- CREATE POLICY "Journey stages are editable by authenticated users" ON public.journey_stages
--     FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Stage dependencies are viewable by everyone" ON public.stage_dependencies
--     FOR SELECT USING (true);

-- CREATE POLICY "Stage dependencies are editable by authenticated users" ON public.stage_dependencies
--     FOR ALL USING (auth.role() = 'authenticated'); 