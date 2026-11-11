DO $$
DECLARE
    r RECORD;
    v_sql TEXT;
    v_count INT;
    v_total_records INT;
    v_total_orphans INT := 0;
    v_checked_fks INT := 0;
BEGIN
    RAISE NOTICE '=== AUDITING ALL 52 FOREIGN KEYS (WITH RECORD COUNTS) ===';
    FOR r IN (
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
    ) LOOP
        v_checked_fks := v_checked_fks + 1;
        -- count total records with non-null FK
        v_sql := format('SELECT count(*) FROM %I WHERE %I IS NOT NULL', r.table_name, r.column_name);
        EXECUTE v_sql INTO v_total_records;

        -- count orphan records
        v_sql := format(
            'SELECT count(*) FROM %I t WHERE t.%I IS NOT NULL AND NOT EXISTS (SELECT 1 FROM %I ft WHERE ft.%I = t.%I)',
            r.table_name, r.column_name, r.foreign_table_name, r.foreign_column_name, r.column_name
        );
        EXECUTE v_sql INTO v_count;
        v_total_orphans := v_total_orphans + v_count;

        IF v_count > 0 THEN
            RAISE WARNING 'ORPHAN DETECTED: %.% -> %.% | Checked: % | Orphans: %', 
                r.table_name, r.column_name, r.foreign_table_name, r.foreign_column_name, v_total_records, v_count;
        ELSE
            RAISE NOTICE 'OK [%/52]: %.% -> %.% | Checked: % | Orphans: %', 
                v_checked_fks, r.table_name, r.column_name, r.foreign_table_name, r.foreign_column_name, v_total_records, v_count;
        END IF;
    END LOOP;
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'TOTAL CHECKED FOREIGN KEYS: %', v_checked_fks;
    RAISE NOTICE 'TOTAL ORPHAN RECORDS FOUND: %', v_total_orphans;
    IF v_total_orphans = 0 THEN
        RAISE NOTICE 'FINAL VERDICT: VERIFIED_ZERO_ORPHANS';
    ELSE
        RAISE WARNING 'FINAL VERDICT: ORPHANS_FOUND';
    END IF;
    RAISE NOTICE '=======================================================';
END $$;
