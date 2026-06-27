/**
 * Template Engine for Reacteo SEO
 * Parses and replaces `%%tag%%` variables within strings based on a context object.
 */

export interface TemplateContext {
  sitetitle?: string;
  sitedesc?: string;
  sep?: string;
  current_url?: string;
  current_date?: string;
  current_year?: string;
  post_title?: string;
  post_excerpt?: string;
  post_content?: string;
  post_date?: string;
  post_modified?: string;
  post_author?: string;
  category?: string;
  [key: string]: string | undefined;
}

export const defaultTemplateContext: TemplateContext = {
  sitetitle: '',
  sitedesc: '',
  sep: '-',
  current_url: typeof window !== 'undefined' ? window.location.href : '',
  current_date: new Date().toLocaleDateString(),
  current_year: new Date().getFullYear().toString(),
};

export function renderTemplate(template: string | undefined, context: TemplateContext): string {
  if (!template) return '';

  const mergedContext = { ...defaultTemplateContext, ...context };
  let result = template;

  const regex = /%%([a-zA-Z0-9_]+)%%/g;
  result = result.replace(regex, (_match, tag) => {
    const value = mergedContext[tag];
    return value !== undefined && value !== null ? String(value) : '';
  });

  const sepEscaped = mergedContext.sep ? mergedContext.sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '-';
  const cleanupRegex = new RegExp(`\\s*(?:${sepEscaped}\\s*)+`, 'g');
  result = result.replace(cleanupRegex, ` ${mergedContext.sep} `);

  const edgeRegex = new RegExp(`^(?:\\s*${sepEscaped}\\s*)+|(?:\\s*${sepEscaped}\\s*)+$`, 'g');
  result = result.replace(edgeRegex, '');

  return result.trim();
}

export function renderSeoTemplates<T extends Record<string, unknown>>(templates: T, context: TemplateContext): T {
  const rendered: Record<string, unknown> = { ...templates };

  for (const key in rendered) {
    if (Object.prototype.hasOwnProperty.call(rendered, key)) {
      if (key === '__proto__' || key === 'constructor') continue;

      if (typeof rendered[key] === 'string') {
        rendered[key] = renderTemplate(rendered[key] as string, context);
      } else if (typeof rendered[key] === 'object' && rendered[key] !== null) {
        if (!Array.isArray(rendered[key])) {
          rendered[key] = renderSeoTemplates(rendered[key] as Record<string, unknown>, context);
        }
      }
    }
  }

  return rendered as T;
}
