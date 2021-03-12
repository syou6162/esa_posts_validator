import { AxiosInstance } from 'axios';

const { IncomingWebhook } = require('@slack/webhook');

import { EsaConfig, EsaPost, EsaSearchResult, getEsaConfig, createAxiosClient } from './esa'

async function getDailyReport(
    axios: AxiosInstance,
    esaConfig: EsaConfig,
    category: string,
): Promise<EsaSearchResult> {
    const response = await axios.get<EsaSearchResult>(`/v1/teams/${esaConfig.teamName}/posts`, {
        params: {
            q: `in:${category}`,
            sort: "number",
            order: "asc"
        },
    });
    return response.data;
}

const esaConfig = getEsaConfig();
const axios = createAxiosClient(esaConfig.accessToken);

async function getDailyReportWithInvalidTitle(axios: AxiosInstance, esaConfig: EsaConfig): Promise<EsaPost[]> {
    const invalidPosts: EsaPost[] = [];
    await getDailyReport(axios, esaConfig, "日報").then((result: EsaSearchResult) => {
        result.posts.forEach((post: EsaPost) => {
            if (post.name == "日報") {
                invalidPosts.push(post);
            }
        });
    });
    return invalidPosts;
}

getDailyReportWithInvalidTitle(axios, esaConfig).then((posts: EsaPost[]) => {
    const env = process.env
    const url = env.SLACK_WEBHOOK || ""
    const webhook = new IncomingWebhook(url);
    if (posts.length > 0) {
        let text = "以下のpostのタイトル名「日報」から変更しませんか?\n"
        posts.slice(0, 3).forEach((post: EsaPost) => {
            text += `- ${post.full_name}\n`;
            text += `  - https://${esaConfig.teamName}.esa.io/posts/${post.number}\n`
        });
        (async () => {
            await webhook.send({
                text: text
            });
        })();
    }
})