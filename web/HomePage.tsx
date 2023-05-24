import React from "react";
import { AssetSelector } from "./components/AssetSelector";
import { ArrowDown } from "./Icons";
import { Label } from "./components/Label";
import { PositionSummary } from "./components/PositionSummary";
import { QuoteExpectedAmounts } from "./components/QuoteExpectedAmounts";
import { Position } from "@widolabs/collateral-swap-sdk";

interface HomePageProps {
  collaterals: string[]
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
  }: HomePageProps
) {
  return (
    <div className="home__content">
      <div className="home__form">
        <div className="panel">
          <div className="panel__row">
            <h6 className="L2 heading text-color--1">Swap collateral</h6>
          </div>
          <div className="panel__column">
            <Label text="Collateral to swap"/>
            <AssetSelector
              value={fromToken}
              options={collaterals}
              onChange={setFromToken}
            />
          </div>
          <div className="panel__column">
            <Label text="Amount"/>
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
            <label className="label text-color--2" style={{ cursor: "pointer" }} onClick={onMaxClick}>
              Balance: {assetBalance}
            </label>
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
            />
          </div>
          <QuoteExpectedAmounts
            isLoading={isLoading}
            expectedAmount={expectedAmount}
            minimumAmount={minimumAmount}
          />
          <div className="panel__column form_button">
            <button className="button button--large button--supply" onClick={onSwap} disabled={disabledButton}>
              Swap
            </button>
          </div>
          <PositionSummary
            currentPosition={currentPosition}
            predictedPosition={predictedPosition}
          />
        </div>
      </div>
    </div>
  );
}
