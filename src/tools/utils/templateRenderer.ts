import { existsSync } from 'node:fs';
import { join } from 'node:path';

import nunjucks from 'nunjucks';

/**
 * Renders a named Nunjucks template with raw JSON text.
 * Returns the rendered string, or null if no template exists or the text is not valid JSON.
 */
type TemplateRenderFn = (toolName: string, rawText: string) => string | null;

/**
 * Creates a template renderer function bound to a views directory.
 * Returns a function that checks for a matching template, parses the JSON text,
 * and renders it — or returns null if no template exists or parsing fails.
 */
export function createTemplateRenderer(viewsDir: string): TemplateRenderFn {
  const env = nunjucks.configure(viewsDir, {
    autoescape: false,
    noCache: false,
    throwOnUndefined: false,
  });

  // Render empty string instead of "undefined" for missing values
  env.addFilter('default', (val: unknown, defaultVal: string = '') =>
    val === undefined || val === null ? defaultVal : val
  );

  return (toolName: string, rawText: string): string | null => {
    const templatePath = join(viewsDir, `${toolName}.njk`);
    if (!existsSync(templatePath)) return null;

    try {
      const data = JSON.parse(rawText);
      return env.render(`${toolName}.njk`, data as Record<string, unknown>);
    } catch {
      return null;
    }
  };
}
