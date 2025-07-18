import axios, { Axios } from 'axios';
import { omit } from 'lodash';
import { cities, city, enlishNameByCity } from '../cities/cities';

export interface Street extends Omit<ApiStreet, '_id'> {
    streetId: number
}

interface ApiStreet {
    _id: number
    region_code: number
    region_name: string
    city_code: number
    city_name: string
    street_code: number
    street_name: string
    street_name_status: string
    official_code: number
}


export class StreetsServiceMock {
    private static _axios: Axios
    private static get axios() {
        if (!this._axios) {
            this._axios = axios.create({})
        }
        return this._axios
    }
    async getStreetsInCity(city: city):  Promise<{
    streets: Pick<Street, 'streetId'>[];
    hasMore: boolean;
    nextOffset: number;
}> {
        return { streets: [{ streetId: 1 }, { streetId: 2 }], hasMore: false, nextOffset: 0 }
    }

    async getStreetInfoById(ids: number[]) {


        return [{
            region_code: 72,
            region_name: 'qwerty',
            city_code: 3762,
            city_name: 'qwerty',
            street_code: 9000,
            street_name: 'asd',
            street_name_status: 'official',
            official_code: 9000,
            streetId: 1
        },
            {
                region_code: 72,
                region_name: 'qwerty',
                city_code: 3762,
                city_name: 'qwerty',
                street_code: 9000,
                street_name: 'asd',
                street_name_status: 'official',
                official_code: 9000,
                streetId: 2
            }];
    }
}