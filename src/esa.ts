import { AxiosInstance } from 'axios';
import axios from 'axios';

export type EsaConfig = {
    teamName: string;
    accessToken: string;
}

export type EsaPost = {
    body_md: string;
    body_html: string;
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
    return axios.create({
        baseURL: 'https://api.esa.io',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'json',
    });
}
