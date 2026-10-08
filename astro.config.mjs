// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://mungonkim.github.io',
	integrations: [mdx(), sitemap()],
	// 이력서 페이지를 About으로 합쳤으므로 기존 주소는 About으로 안내한다
	redirects: {
		'/resume': '/about/',
	},
});
