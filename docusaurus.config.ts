import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Rogue Signal',
  tagline: 'Decentralized Proof-of-Work Blockchain Powered by RandomX',
  favicon: 'img/icon.png',

  // Production URL for GitHub Pages / Custom Subdomain
  url: 'https://docs.roguechain.org',
  baseUrl: '/',

  // GitHub Pages deployment config
  organizationName: 'roguesignalchain',
  projectName: 'rogue-chain-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'zh-Hans'],
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
      'zh-Hans': {
        label: '简体中文',
        direction: 'ltr',
        htmlLang: 'zh-Hans',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/roguesignalchain/rogue-chain-docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/roguesignalchain/rogue-chain-docs/tree/main/',
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
        language: ['en', 'es', 'zh'],
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/icon.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'ROGUE SIGNAL',
      logo: {
        alt: 'Rogue Signal Technical Isotype',
        src: 'img/icon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/brand/brand-overview',
          label: 'Brand & Identity',
          position: 'left',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://discord.gg/c6bwF6Wk6c',
          label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://x.com/roguesignal_',
          label: 'X (Twitter)',
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
              label: 'Brand & Design System',
              to: '/docs/brand/brand-overview',
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
              label: 'Discord',
              href: 'https://discord.gg/c6bwF6Wk6c',
            },
            {
              label: 'Telegram Community',
              href: 'https://t.me/roguesignalchain',
            },
            {
              label: 'X (Twitter)',
              href: 'https://x.com/roguesignal_',
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