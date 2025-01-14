import React from "react";
import { AssetSelector } from "./components/AssetSelector";
import { ArrowDown } from "./Icons";
import { Label } from "./components/Label";
import { PositionSummary } from "./components/PositionSummary";
import { QuoteExpectedAmounts } from "./components/QuoteExpectedAmounts";
import { Deployment, Deployments, Fees, Position, UserAssets } from "@widolabs/collateral-swap-sdk";
import { MarketSelector } from './components/MarketSelector';

interface HomePageProps {
  collaterals: UserAssets
  fromToken: string
  toToken: string
  amount: string
  assetBalance: string
  setFromToken: (c: string) => void
  setToToken: (c: string) => void
  setAmount: (c: string) => void
  onMaxClick: () => void
  onSwap: () => void
  disabledButton: boolean
  expectedAmount: string
  minimumAmount: string
  isLoading: boolean
  currentPosition: Position | undefined
  predictedPosition: Position | undefined
  baseTokenSymbol: string | undefined
  markets: Deployments
  showMarketSelector: boolean
  notEnoughBalance: boolean
  selectedMarket: Deployment | undefined
  onSelectMarket: (market: Deployment) => void
  isExecuting: boolean
  price?: string
  fees?: Fees
}

export function HomePage(
  {
    collaterals,
    fromToken,
    toToken,
    amount,
    assetBalance,
    onMaxClick,
    setFromToken,
    setToToken,
    setAmount,
    onSwap,
    disabledButton,
    expectedAmount,
    minimumAmount,
    isLoading,
    currentPosition,
    predictedPosition,
    baseTokenSymbol,
    markets,
    showMarketSelector,
    notEnoughBalance,
    selectedMarket,
    onSelectMarket,
    isExecuting,
    price,
    fees,
  }: HomePageProps
) {
  return (
    <div className="home__content">
      <div className="home__form">
        <div className="panel">
          <div className="panel__row beta-alert">
            <p>
              This Extension is currently in BETA, contracts have not yet been audited.
              Proceed with caution
            </p>
          </div>
          <div className="panel__row">
            <h6 className="L2 heading text-color--1">Swap collateral</h6>
            {
              showMarketSelector && selectedMarket
                ?
                <MarketSelector
                  value={selectedMarket}
                  options={markets}
                  onChange={(selection) => {
                    onSelectMarket(selection)
                  }}
                />
                : null
            }
          </div>
          <div className="panel__column">
            <Label text="Collateral to swap"/>
            <AssetSelector
              value={fromToken}
              options={collaterals}
              onChange={setFromToken}
              showBalance={true}
            />
          </div>
          <div className="panel__column">
            <Label text="Amount" color="4"/>
            <div className="panel__row" style={{ padding: 0 }}>
              <input
                className="action-input-view__input"
                placeholder="0"
                autoComplete="off"
                value={amount}
                inputMode="decimal"
                type="number"
                autoCorrect="off"
                spellCheck="false"
                onChange={(event) => {
                  setAmount(event.target.value);
                }}
              />
              {
                fromToken
                  ?
                  <button onClick={onMaxClick}>Max</button>
                  :
                  null
              }
            </div>
            {
              fromToken
                ?
                <label className="label text-color--2">
                  <span className={`asset asset--icon asset--${fromToken}`}></span> {assetBalance}&nbsp;
                  <small>{fromToken} Available</small>
                </label>
                :
                null
            }
          </div>
          <div className="panel__row panel__row__center">
            <ArrowDown className="svg--icon--2"/>
          </div>
          <div className="panel__column">
            <Label text="Collateral to obtain"/>
            <AssetSelector
              value={toToken}
              options={collaterals}
              onChange={setToToken}
              showBalance={false}
            />
          </div>
          {
            notEnoughBalance
              ?
              <div className="panel__row panel__row__center">You don’t have enough collateral to perform this
                action</div>
              :
              <QuoteExpectedAmounts
                fromToken={fromToken}
                toToken={toToken}
                isLoading={isLoading}
                expectedAmount={expectedAmount}
                minimumAmount={minimumAmount}
                price={price}
                fees={fees}
              />
          }
          <div className="panel__column form_button">
            <button className="button button--large button--supply" onClick={onSwap} disabled={disabledButton}>
              {
                isExecuting
                  ? "In progress"
                  : "Swap"
              }
            </button>
          </div>
          <PositionSummary
            currentPosition={currentPosition}
            predictedPosition={predictedPosition}
            baseTokenSymbol={baseTokenSymbol}
          />
          <div className="panel__row footer__links">
            <a href="https://www.joinwido.com/" target="_blank">Learn about Wido</a>
            <a href="https://forms.gle/oxbgU2hnvzambjqDA" target="_blank">Provide feedback</a>
          </div>
          </div>
      </div>
    </div>
  );
}
