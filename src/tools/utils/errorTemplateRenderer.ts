import { existsSync } from 'node:fs';
import { join } from 'node:path';

import nunjucks from 'nunjucks';

/**
 * Renders a named Nunjucks error template with error context.
 * Returns the rendered string, or null if no template exists or rendering fails.
 */
type ErrorTemplateRenderFn = (
  toolName: string,
  statusCode: number,
  context: Record<string, unknown>
) => string | null;

/**
 * Creates an error template renderer function bound to an errors directory.
 * Looks for templates named `{toolName}.{statusCode}.njk`.
 * Returns a function that renders the template with the given context,
 * or returns null if no matching template exists.
 */
export function createErrorTemplateRenderer(errorsDir: string): ErrorTemplateRenderFn {
  const env = nunjucks.configure(errorsDir, {
    autoescape: false,
    noCache: false,
    throwOnUndefined: false,
  });

  // Render empty string instead of "undefined" for missing values
  env.addFilter('default', (val: unknown, defaultVal: string = '') =>
    val === undefined || val === null ? defaultVal : val
  );

  return (toolName: string, statusCode: number, context: Record<string, unknown>): string | null => {
    const templateFile = `${toolName}.${statusCode}.njk`;
    const templatePath = join(errorsDir, templateFile);
    if (!existsSync(templatePath)) return null;

    try {
      return env.render(templateFile, context);
    } catch {
      return null;
    }
  };
}
