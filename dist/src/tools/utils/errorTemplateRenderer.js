import { existsSync } from 'node:fs';
import { join } from 'node:path';
import nunjucks from 'nunjucks';
export function createErrorTemplateRenderer(errorsDir) {
    const env = nunjucks.configure(errorsDir, {
        autoescape: false,
        noCache: false,
        throwOnUndefined: false,
    });
    env.addFilter('default', (val, defaultVal = '') => val === undefined || val === null ? defaultVal : val);
    return (toolName, statusCode, context) => {
        const templateFile = `${toolName}.${statusCode}.njk`;
        const templatePath = join(errorsDir, templateFile);
        if (!existsSync(templatePath))
            return null;
        try {
            return env.render(templateFile, context);
        }
        catch {
            return null;
        }
    };
}
