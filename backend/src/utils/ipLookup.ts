import * as geolite2 from 'geolite2-redist';
import maxmind, { type CityResponse } from 'maxmind';

export const ipGeoLookup = async (ip: string) => {
    let location = {};

    if (!ip) return location;
    try {
        if (ip) {
            const reader = await geolite2.open(geolite2.GeoIpDbName.City, path => maxmind.open<CityResponse>(path));
            const lookup = reader.get(ip);
            if (!lookup) return location;
            location = {
                country: lookup.country?.names.en || null,
                city: lookup.city?.names.en || null
            };
        }
    } catch (err) {
        return location;
    }

    return location;
}