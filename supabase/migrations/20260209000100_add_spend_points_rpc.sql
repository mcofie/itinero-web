CREATE OR REPLACE FUNCTION itinero.spend_points(p_cost INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = itinero, public
AS $$
DECLARE
    v_uid UUID;
    v_bal INT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        -- Allow testing? No, strict.
        RETURN FALSE; 
    END IF;

    -- Calculate current balance from ledger
    SELECT COALESCE(SUM(delta), 0) INTO v_bal
    FROM itinero.points_ledger
    WHERE user_id = v_uid;

    IF v_bal >= p_cost THEN
        -- Deduct points
        INSERT INTO itinero.points_ledger (user_id, delta, reason, meta)
        VALUES (v_uid, -p_cost, 'save_trip', jsonb_build_object('source', 'web', 'at', now()));
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;
