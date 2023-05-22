import React, { useState } from "react";
import { AssetSelector } from "./components/AssetSelector";
import { ArrowDown } from "./Icons";
import { Label } from './components/Label';
import { LabelValue } from './components/LabelValue';
import { PositionSummary } from './components/PositionSummary';

interface HomePageProps {
  collaterals: string[]
  fromToken: string
  toToken: string
  amount: string
  setFromToken: (c: string) => void
  setToToken: (c: string) => void
  setAmount: (c: string) => void
}

export function HomePage({ collaterals, fromToken, toToken, amount, setFromToken, setToToken, setAmount }: HomePageProps) {
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
          <div className="panel__row">
            <Label text="Expected amount"/>
            <LabelValue text=".6213123"/>
          </div>
          <div className="panel__row">
            <Label text="Guaranteed amount"/>
            <LabelValue text="0.5532134"/>
          </div>
          <div className="panel__column form_button">
            <button className="button button--large button--supply">
              Swap
            </button>
          </div>
          <PositionSummary/>
        </div>
      </div>
    </div>
  );
}
