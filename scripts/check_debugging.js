const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log('--- FX SNAPSHOT ---');
    const { data: fx, error: fxErr } = await supabase
        .schema('itinero')
        .from('fx_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (fxErr) console.log('FX Err:', fxErr);
    else console.log(JSON.stringify(fx, null, 2));

    console.log('\n--- PLACE ---');
    const { data: places, error: placeErr } = await supabase
        .schema('itinero')
        .from('places')
        .select('id, name, cost_typical, cost_currency')
        .ilike('name', '%Apartheid Museum%');

    if (placeErr) console.log('Place Err:', placeErr);
    else console.log(JSON.stringify(places, null, 2));
}

run();
