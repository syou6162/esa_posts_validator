import { AxiosInstance } from 'axios';
import { IncomingWebhook } from '@slack/webhook';

import { EsaConfig, EsaPost, EsaSearchResult, getEsaConfig, createAxiosClient } from './esa'

async function getPostsWithNoCategory(
    axios: AxiosInstance,
    esaConfig: EsaConfig,
): Promise<EsaSearchResult> {
    const response = await axios.get<EsaSearchResult>(`/v1/teams/${esaConfig.teamName}/posts`, {
        params: {
            q: "on:/",
        },
    });
    return response.data;
}

const esaConfig = getEsaConfig();
const axios = createAxiosClient(esaConfig.accessToken);

getPostsWithNoCategory(axios, esaConfig).then((result: EsaSearchResult) => {
    return result.posts.filter((post: EsaPost) => {
        return post.category == null && post.name !== "README.md"
    })
}).then((posts: EsaPost[]) => {
    const env = process.env
    const url = env.SLACK_WEBHOOK || ""
    const webhook = new IncomingWebhook(url);
    if (posts.length > 0) {
        let text = "以下のpostのカテゴリを考えませんか?\n"
        posts.forEach((post: EsaPost) => {
            text += `- ${post.full_name}\n`;
            text += `  - https://${esaConfig.teamName}.esa.io/posts/${post.number}\n`
        });
        (async () => {
            await webhook.send({
                text: text
            });
        })().catch(err => {
            console.log(err);
            process.exit(1);
        });
    }
}).catch(err => {
    console.log(err);
    process.exit(1);
})