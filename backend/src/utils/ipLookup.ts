import { Reader } from "@maxmind/geoip2-node";
import fs from 'fs';
import path from "path";

export const ipGeoLookup = async (ip: string) => {
    let location = {};
    if (!ip) return location;
    try {
        if (ip) {
            const dbPath = path.join(process.cwd(), process.env.GEOIP_DB_PATH!);
            const dbBuffer = fs.readFileSync(dbPath);
            const reader = await Reader.openBuffer(dbBuffer);
            const result = reader.city(ip);
            location = {
                country: result.country?.names.en || null,
                city: result.city?.names.en || null
            };
        }
    } catch (err) {
        return location;
    }

    return location;
}