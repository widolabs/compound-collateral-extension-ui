import React from "react";
import { TxHashLinkProps } from './components/TxHashLink';

interface FailedPageProps {
  chainId: number
  txHash: string
  onClick: () => void
}

export function FailedPage(
  {
    txHash,
    chainId,
    onClick
  }: FailedPageProps
) {
  return (
    <div className="home__content">
      <div className="home__form">
        <div className="panel">
          <div className="success_page">
            <div className="panel__row panel__row__center">
              <h1 className="">Ops!</h1>
            </div>
            <div className="panel__column panel__row__center message">
              <p>Something went wrong while trying to execute the swap.</p>
              <a href="https://docs.joinwido.com/company/contact-us" target="_blank" style={{color: "gray"}}>Reach out for support</a>
            </div>
            <div className="panel__row panel__row__center">
              <TxHashLinkProps
                chainId={chainId}
                txHash={txHash}
              />
            </div>
            <div className="panel__row panel__row__center">
              <button className="button button--large button--failed" onClick={onClick}>
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
