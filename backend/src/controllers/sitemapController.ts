import { APP_URL, POST_ALLOWED_USER } from '@/config/config.js';
import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createPostService } from '@/services/postService.js';
import { createUserService } from '@/services/userService.js';
import type { Request, Response } from 'express';

function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const createSitemapController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        sitemap: async (req: Request, res: Response): Promise<void> => {
            const ctx = makeCtx(req);
            const userSvc = createUserService(ctx);
            const postSvc = createPostService(ctx);

            const user = await userSvc.findByUsername(POST_ALLOWED_USER);
            if (!user) {
                res.setHeader('Content-Type', 'application/xml');
                res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`);
                return;
            }

            const posts = await postSvc.get({
                user_id: user.id,
                visibility: 'public',
                is_published: true,
            });

            const staticPages = ['/', '/about', '/projects', '/homelab'];

            const urls = [
                ...staticPages.map(loc => ({
                    loc: `${APP_URL}${loc}`,
                    lastmod: null,
                })),
                ...posts.map((post) => ({
                    loc: `${APP_URL}/posts/${post.id}`,
                    lastmod: (post.updated_at || post.created_at).toISOString().split('T')[0],
                })),
            ];

            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

            res.setHeader('Content-Type', 'application/xml');
            res.send(xml);
        },

        robots: async (_req: Request, res: Response): Promise<void> => {
            res.setHeader('Content-Type', 'text/plain');
            res.send(`User-agent: *
Disallow: /api/
Sitemap: ${APP_URL}/sitemap.xml
`);
        },
    };
};
