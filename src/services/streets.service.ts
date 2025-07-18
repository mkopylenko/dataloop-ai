import axios from 'axios';
import { cities, city, enlishNameByCity } from '../cities/cities';

// ✅ Constants
const DATA_GOV_API_URL = 'https://data.gov.il/api/3/action/datastore_search';
const STREETS_RESOURCE_ID = '1b14e41c-85b3-4c21-bdce-9fe48185ffca';
const MAX_RESULTS = 100000;

export interface Street {
    streetId: number;
    region_code: number;
    region_name: string;
    city_code: number;
    city_name: string;
    street_code: number;
    street_name: string;
    street_name_status: string;
    official_code: number;
}

interface ApiStreet {
    _id: number;
    region_code: number;
    region_name: string;
    city_code: number;
    city_name: string;
    street_code: number;
    street_name: string;
    street_name_status: string;
    official_code: number;
}

export class StreetsService {
    async getStreetsInCity(city: city): Promise<{ city: city; streets: Pick<Street, 'streetId'>[] }> {
        console.log('Calling city streets info endpoint');

        const response = await axios.post(DATA_GOV_API_URL, {
            resource_id: STREETS_RESOURCE_ID,
            filters: { city_name: cities[city] },
            limit: MAX_RESULTS,
        });

        const results = response.data.result.records;
        if (!results || !results.length) {
            throw new Error('No streets found for city: ' + city);
        }

        const streets = results.map((street: ApiStreet) => ({
            streetId: street._id,
        }));

        return { city, streets };
    }

    async getStreetInfoById(ids: number[]): Promise<Street[]> {
        console.log('Calling street info endpoint');

        const response = await axios.post(DATA_GOV_API_URL, {
            resource_id: STREETS_RESOURCE_ID,
            filters: { _id: ids },
        });

        const results = response.data.result.records;
        if (!results || !results.length) {
            throw new Error('No streets found for ids: ' + ids.join(', '));
        }

        return results.map((item: ApiStreet) => ({
            streetId: item._id,
            region_code: item.region_code,
            region_name: item.region_name.trim(),
            city_code: item.city_code,
            city_name: enlishNameByCity[item.city_name] || item.city_name,
            street_code: item.street_code,
            street_name: item.street_name.trim(),
            street_name_status: item.street_name_status.trim(),
            official_code: item.official_code,
        }));
    }
}
