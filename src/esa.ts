import { AxiosInstance, AxiosResponse } from 'axios';

const axiosBase = require('axios');

export type EsaConfig = {
    teamName: string;
    accessToken: string;
}

export type EsaPost = {
    // esaのレスポンスを全部camelcaseに変換するのは面倒なので、ここだけlintは無視する
    body_md: string; // eslint-disable-line camelcase
    body_html: string; // eslint-disable-line camelcase
    number: number;
    name: string;
    category: string;
    full_name: string;
}

export type EsaSearchResult = {
    posts: EsaPost[];
}

const env = process.env
const teamName = env.ESA_TEAM_NAME || ""
const accessToken = env.ESA_ACCESS_TOKEN || ""

export function getEsaConfig(): EsaConfig {
    const config: EsaConfig = { teamName, accessToken };
    return config;
}

export function createAxiosClient(accessToken: string): AxiosInstance {
    const axios = axiosBase.create({
        baseURL: 'https://api.esa.io',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'json',
    });
    return axios;
}
