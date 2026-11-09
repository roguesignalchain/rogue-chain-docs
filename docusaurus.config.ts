import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Rogue Signal',
  tagline: 'Decentralized Proof-of-Work Blockchain Powered by RandomX',
  favicon: 'img/logo.svg',

  // Production URL for GitHub Pages / Custom Subdomain
  url: 'https://docs.roguechain.org',
  baseUrl: '/',

  // GitHub Pages deployment config
  organizationName: 'roguesignalchain',
  projectName: 'rogue-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      es: {
        label: 'Español',
        direction: 'ltr',
        htmlLang: 'es-ES',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/roguesignalchain/rogue-docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/roguesignalchain/rogue-docs/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      {
        hashed: true,
        language: ['en', 'es'],
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Rogue Signal',
      logo: {
        alt: 'Rogue Signal Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/roguesignalchain',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Overview & Parameters',
              to: '/docs/intro',
            },
            {
              label: 'Core Node Setup',
              to: '/docs/core-chain/getting-started',
            },
            {
              label: 'Mining Guide',
              to: '/docs/mining/randomx-mining',
            },
            {
              label: 'JSON-RPC Reference',
              to: '/docs/rpc/endpoints',
            },
          ],
        },
        {
          title: 'Ecosystem',
          items: [
            {
              label: 'Official Website',
              href: 'https://roguesignal.org',
            },
            {
              label: 'Block Explorer',
              href: 'https://explorer.roguesignal.org',
            },
            {
              label: 'Core Chain Repository',
              href: 'https://github.com/roguesignalchain/rogue-core-chain',
            },
            {
              label: 'Desktop Client Repository',
              href: 'https://github.com/roguesignalchain/rogue-desktop-client',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Telegram Community',
              href: 'https://t.me/roguesignalchain',
            },
            {
              label: 'X (Twitter)',
              href: 'https://x.com/roguesignal',
            },
            {
              label: 'GitHub Organization',
              href: 'https://github.com/roguesignalchain',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Rogue Signal Protocol. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'yaml', 'toml', 'go', 'cpp'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;