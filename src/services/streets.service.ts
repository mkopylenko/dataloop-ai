import axios from 'axios';
import { cities, city, enlishNameByCity } from '../cities/cities';

const DATA_GOV_API_URL = 'https://data.gov.il/api/3/action/datastore_search';
const STREETS_RESOURCE_ID = '1b14e41c-85b3-4c21-bdce-9fe48185ffca';


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
    async getStreetsInCity(city: city, offset: number = 0, limit =1000): Promise<{
        streets: Pick<Street, 'streetId'>[];
        hasMore: boolean;
        nextOffset: number;
    }> {
        const response = await axios.post(DATA_GOV_API_URL, {
            resource_id: STREETS_RESOURCE_ID,
            filters: { city_name: cities[city] },
            limit: limit,
            offset,
        });

        const resultData = response.data.result;
        const results: ApiStreet[] = resultData.records || [];
        const total = resultData.total || 0;

        const streets = results.map((street: ApiStreet) => ({
            streetId: street._id,
        }));

        const hasMore = offset + limit < total;

        return {
            streets,
            hasMore,
            nextOffset: offset + limit,
        };
    }

    async getStreetInfoById(ids: number[]): Promise<Street[]> {
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

