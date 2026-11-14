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
        blog: false,
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
        indexBlog: false,
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
          sidebarId: 'userGuidesSidebar',
          position: 'left',
          label: 'User Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'devGuidesSidebar',
          position: 'left',
          label: 'Developer Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'protocolSidebar',
          position: 'left',
          label: 'Protocol & API',
        },
        {
          type: 'docSidebar',
          sidebarId: 'brandSidebar',
          position: 'left',
          label: 'Brand & Identity',
        },
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
              label: 'Running a Node',
              to: '/docs/users/running-a-node',
            },
            {
              label: 'Desktop Client',
              to: '/docs/users/desktop-client',
            },
            {
              label: 'Mining Guide',
              to: '/docs/users/mining-guide',
            },
            {
              label: 'Developer Guides',
              to: '/docs/developers/compiling-from-source',
            },
            {
              label: 'JSON-RPC Reference',
              to: '/docs/rpc/endpoints',
            },
            {
              label: 'Brand & Design System',
              to: '/docs/brand/brand-overview',
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