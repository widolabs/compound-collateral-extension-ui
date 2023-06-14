import React from "react";
import { LabelValue } from './LabelValue';
import { Label } from './Label';
import { Fees } from '@widolabs/collateral-swap-sdk';

interface Props {
  expectedAmount: string
  minimumAmount: string
  isLoading: boolean
  tokenSymbol: string
  fees?: Fees
}

export function QuoteExpectedAmounts({ expectedAmount, minimumAmount, isLoading, tokenSymbol, fees }: Props) {
  if (isLoading) {
    return <div className="panel__row panel__row__center">Loading...</div>
  }

  return expectedAmount ?
    <>
      <div className="panel__row">
        <Label text="Expected amount"/>
        <LabelValue text={expectedAmount + " " + tokenSymbol}/>
      </div>
      <div className="panel__row">
        <Label text="Guaranteed amount"/>
        <LabelValue text={minimumAmount + " " + tokenSymbol}/>
      </div>
      {
        fees
        &&
        <div className="panel__row">
          <Label text="Fees"/>
          <LabelValue text={"~ " + fees.totalUsd.toFixed(2) + " USD"}/>
        </div>
      }
    </>
    : null
}
