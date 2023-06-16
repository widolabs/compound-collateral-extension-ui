import React from "react";
import { TxHashLinkProps } from './components/TxHashLink';

interface SuccessPageProps {
  fromAsset: string
  toAsset: string
  chainId: number
  txHash: string
  onClick: () => void
}

export function SuccessPage(
  {
    fromAsset,
    toAsset,
    txHash,
    chainId,
    onClick
  }: SuccessPageProps
) {
  return (
    <div className="home__content">
      <div className="home__form">
        <div className="panel">
          <div className="success_page">
            <div className="panel__row panel__row__center">
              <h1 className="">Success!</h1>
            </div>
            <div className="panel__row panel__row__center message">
              <p>You successfully swapped your {fromAsset} collateral to {toAsset}.</p>
            </div>
            <div className="panel__row panel__row__center">
              <TxHashLinkProps
                chainId={chainId}
                txHash={txHash}
              />
            </div>
            <div className="panel__row panel__row__center">
              <button className="button button--large button--supply" onClick={onClick}>
                Swap again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
