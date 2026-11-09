import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'RandomX CPU Mining',
    icon: '⚡',
    description: (
      <>
        True ASIC resistance via the RandomX (rx/0) proof-of-work algorithm. Block production and validation are democratized for everyday consumer processors.
      </>
    ),
  },
  {
    title: 'EVM Smart Contracts',
    icon: '⚙️',
    description: (
      <>
        Full compatibility with the Ethereum Virtual Machine, Solidity toolchains, Web3 libraries, and developer tools like Hardhat and MetaMask.
      </>
    ),
  },
  {
    title: 'LWMA-1 Consensus',
    icon: '🛡️',
    description: (
      <>
        Instant per-block difficulty adjustments using Linearly Weighted Moving Average (LWMA-1) with N=60, preventing hashrate rental attacks.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-vert--md">
        <span style={{fontSize: '3rem'}}>{icon}</span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}