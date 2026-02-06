import { z } from 'zod';
const envSchema = z.object({
    POSTMAN_API_KEY: z.string(),
    POSTMAN_API_BASE_URL: z.string().url().default('https://api.postman.com'),
    GIT_BRANCH: z.string().default('main'),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('Invalid environment variables for Postman MCP server:', parsedEnv.error.format());
    process.exit(1);
}
export const env = parsedEnv.data;
