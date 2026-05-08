import type { Moderation } from "@shared/types/Moderation.js";
import OpenAI from "openai";
import { compress } from "./image.js";

export const createLLm = () => {
    return new OpenAI({
        apiKey: process.env.LITELLM_VIRTUAL_KEY,
        baseURL: process.env.LITELLM_API_BASE_URL
    });
}

export const moderateImage = async (filePath: string): Promise<Moderation | null> => {
    const compressed = await compress(filePath, { format: 'webp' });
    const base64Image = compressed.toString('base64');

    const llm = createLLm();
    const result = await llm.chat.completions.create({
        model: 'vision-model',
        messages: [
            {
                role: 'system',
                content: `You are an image moderation system for avatar uploads.

Analyze the uploaded image and respond ONLY with valid JSON with properties:
- is_allowed: boolean
- reason: string

Disallow:
- Nudity or sexually explicit content
- Violence or graphic content
- Hate symbols or extremist content
- Illegal activities
- Harassment or offensive gestures
- Shocking or disturbing imagery
- Spam images (ads, QR codes, promotional graphics, contact info, URLs)

Rules:
- If is_allowed = true, set "reason" to an empty string.
- If is_allowed = false, clearly and concisely explain why the image is not allowed.
- Do NOT describe the person's physical traits.
- Do NOT mention the moderation rules in the output.`
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: ''
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/webp;base64,${base64Image}`
                        }
                    }
                ]
            }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
    });

    const content = result.choices[0]?.message.content;

    return content ? JSON.parse(content) : null;
};

export const moderateComment = async (comment: string): Promise<Moderation | null> => {
    const llm = createLLm();
    const result = await llm.chat.completions.create({
        model: 'moderation-model',
        messages: [
            {
                role: 'system',
                content: `You are a content moderation system.
Respond ONLY with valid JSON with properties:
- is_allowed: boolean
- reason: string

Disallow:
- insults, anything about the face, mouth or looks
- spam messages
- too many unnecessary line breaks but each line is nonsense or unrelated

Rules:
- If is_allowed = true, set "reason" to an empty string.
- If is_allowed = false, state clearly and concisely like talking to a human being why it's not allowed.
- Do NOT include the name/username in the reason value.`
            },
            {
                role: 'user',
                content: comment
            }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
    });

    const content = result.choices[0]?.message.content;

    return content ? JSON.parse(content) : null;
};

export const moderateName = async (name: string): Promise<Moderation | null> => {
    const llm = createLLm();
    const result = await llm.chat.completions.create({
        model: 'moderation-model',
        messages: [
            {
                role: 'system',
                content: `You are a name/username filtering system.
Respond ONLY with valid JSON with properties:
- is_allowed: boolean
- reason: string

Disallow:
- insults, bad words, anything about the face, mouth or looks
- spam messages

Rules:
- If is_allowed = true, set "reason" to an empty string.
- If is_allowed = false, state clearly but concisely like talking to a human being why it's not allowed.
- Do NOT include the name/username in the reason value.
- Do NOT describe the person's physical traits.
- Do NOT mention the moderation rules in the output.`
            },
            {
                role: 'user',
                content: name
            }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
    });

    const content = result.choices[0]?.message.content?.trim();
    console.log({ name, content });
    return content ? JSON.parse(content) : null;
};