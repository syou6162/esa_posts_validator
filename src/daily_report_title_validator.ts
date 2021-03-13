import { AxiosInstance } from 'axios';
import { IncomingWebhook } from '@slack/webhook';
import format from 'date-fns/format';
import { convertToTimeZone } from 'date-fns-timezone';

import { EsaConfig, EsaPost, EsaSearchResult, getEsaConfig, createAxiosClient } from './esa'

const timeZone = "Asia/Tokyo";

async function getDailyReport(
    axios: AxiosInstance,
    esaConfig: EsaConfig,
    category: string,
    title: string,
): Promise<EsaSearchResult> {
    const response = await axios.get<EsaSearchResult>(`/v1/teams/${esaConfig.teamName}/posts`, {
        params: {
            q: `in:${category} title:${title} created:<${format(convertToTimeZone(new Date, { timeZone: timeZone }), 'yyyy-MM-dd')}`,
        },
    });
    return response.data;
}

const esaConfig = getEsaConfig();
const axios = createAxiosClient(esaConfig.accessToken);

getDailyReport(axios, esaConfig, "日報", "日報").then((result: EsaSearchResult) => {
    const env = process.env
    const url = env.SLACK_WEBHOOK || ""
    const webhook = new IncomingWebhook(url);
    if (result.posts.length > 0) {
        let text = "以下のpostのタイトル名「日報」から変更しませんか?\n"
        result.posts.forEach((post: EsaPost) => {
            text += `- ${post.full_name}\n`;
            text += `  - https://${esaConfig.teamName}.esa.io/posts/${post.number}\n`
        });
        (async () => {
            await webhook.send({
                text: text
            })
        })().catch(err => {
            console.log(err);
            process.exit(1);
        });
    }
}).catch(err => {
    console.log(err);
    process.exit(1);
})