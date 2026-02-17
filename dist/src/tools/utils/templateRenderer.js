import { existsSync } from 'node:fs';
import { join } from 'node:path';
import nunjucks from 'nunjucks';
export function createTemplateRenderer(viewsDir) {
    const env = nunjucks.configure(viewsDir, {
        autoescape: false,
        noCache: false,
        throwOnUndefined: false,
    });
    env.addFilter('default', (val, defaultVal = '') => val === undefined || val === null ? defaultVal : val);
    return (toolName, rawText) => {
        const templatePath = join(viewsDir, `${toolName}.njk`);
        if (!existsSync(templatePath))
            return null;
        try {
            const data = JSON.parse(rawText);
            return env.render(`${toolName}.njk`, data);
        }
        catch {
            return null;
        }
    };
}
