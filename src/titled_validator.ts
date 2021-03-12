import { AxiosInstance } from 'axios';

const { IncomingWebhook } = require('@slack/webhook');

import { EsaConfig, EsaPost, EsaSearchResult, getEsaConfig, createAxiosClient } from './esa'

async function getPostsWithNoTitle(
    axios: AxiosInstance,
    esaConfig: EsaConfig,
): Promise<EsaSearchResult> {
    const response = await axios.get<EsaSearchResult>(`/v1/teams/${esaConfig.teamName}/posts`, {
        params: {
            q: "title:Untitled",
            sort: "number",
            order: "asc"
        },
    });
    return response.data;
}

const esaConfig = getEsaConfig();
const axios = createAxiosClient(esaConfig.accessToken);
const env = process.env
const url = env.SLACK_WEBHOOK || ""
const webhook = new IncomingWebhook(url);

getPostsWithNoTitle(axios, esaConfig).then((result: EsaSearchResult) => {
    const posts = result.posts;
    if (posts.length > 0) {
        let text = "以下のpostにタイトルを付けませんか?\n"
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
});