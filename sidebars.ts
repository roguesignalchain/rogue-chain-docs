import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Core Chain (Node)',
      collapsed: false,
      items: [
        'core-chain/getting-started',
        'core-chain/compilation',
        'core-chain/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Desktop Wallet',
      collapsed: false,
      items: [
        'desktop-wallet/overview',
        'desktop-wallet/vault-management',
      ],
    },
    {
      type: 'category',
      label: 'Mining & RandomX',
      collapsed: false,
      items: [
        'mining/randomx-mining',
        'mining/hugepages-tuning',
      ],
    },
    {
      type: 'category',
      label: 'Network & Consensus',
      collapsed: false,
      items: [
        'network/consensus-parameters',
        'network/seed-rotation',
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
};

export default sidebars;