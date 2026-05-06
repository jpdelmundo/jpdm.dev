//import * as geolite2 from 'geolite2-redist';
import maxmind, { type CityResponse, type Reader } from 'maxmind';
import path from 'path';

let geoipReader: Reader<CityResponse> | null = null;

const getReader = async () => {
    if (!geoipReader) {
        //console.log('[GeoIP] Initializing reader...');

        // Direct path to the database file
        const projectRoot = path.resolve(process.cwd(), '..');
        const dbPath = path.join(
            projectRoot,
            'node_modules',
            'geolite2-redist',
            'dbs',
            'GeoLite2-City.mmdb'
        );

        //console.log('[GeoIP] Opening database at:', dbPath);
        geoipReader = await maxmind.open<CityResponse>(dbPath);
        //console.log('[GeoIP] Reader initialized');
    }
    return geoipReader;
};

export const ipGeoLookup = async (ip: string) => {
    //console.log('[GeoIP] Lookup started for:', ip);
    let location = {};

    if (!ip) {
        //console.log('[GeoIP] No IP provided, returning empty');
        return location;
    }

    try {
        //console.log('[GeoIP] Getting reader...');
        const reader = await getReader();
        //console.log('[GeoIP] Reader obtained, performing lookup...');

        const lookup = reader.get(ip);
        //console.log('[GeoIP] Lookup complete:', lookup);

        if (!lookup) return location;

        location = {
            country: lookup.country?.names.en || null,
            city: lookup.city?.names.en || null
        };
        //console.log('[GeoIP] Location data:', location);
    } catch (err) {
        console.error('[GeoIP] Error during lookup:', err);
        return location;
    }

    console.log('[GeoIP] Returning location');
    return location;
};