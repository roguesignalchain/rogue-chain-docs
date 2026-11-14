import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  userGuidesSidebar: [
    {
      type: 'category',
      label: 'Node & Wallet Setup',
      collapsed: false,
      items: [
        'users/running-a-node',
        'users/desktop-client',
        'users/desktop-configuration',
      ],
    },
    {
      type: 'category',
      label: 'RandomX CPU Mining',
      collapsed: false,
      items: [
        'users/mining-guide',
        'users/hugepages-tuning',
      ],
    },
  ],

  devGuidesSidebar: [
    {
      type: 'category',
      label: 'Build & Operations',
      collapsed: false,
      items: [
        'developers/compiling-from-source',
        'developers/local-devnet-and-cli',
      ],
    },
    {
      type: 'category',
      label: 'EVM & Smart Contracts',
      collapsed: false,
      items: [
        'developers/smart-contracts-and-web3',
      ],
    },
  ],

  protocolSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Network & Consensus',
      collapsed: false,
      items: [
        'network/consensus-parameters',
        'network/seed-rotation',
        'network/security-architecture-adr',
      ],
    },
    {
      type: 'category',
      label: 'JSON-RPC API',
      collapsed: false,
      items: [
        'rpc/endpoints',
      ],
    },
  ],

  brandSidebar: [
    {
      type: 'category',
      label: 'Brand & Identity',
      collapsed: false,
      items: [
        'brand/brand-overview',
        'brand/logo-assets',
        'brand/typography-colors',
        'brand/ui-components',
      ],
    },
  ],
};

export default sidebars;
