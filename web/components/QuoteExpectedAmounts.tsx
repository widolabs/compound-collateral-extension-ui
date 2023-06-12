import React from "react";
import { LabelValue } from './LabelValue';
import { Label } from './Label';

interface Props {
  expectedAmount: string
  minimumAmount: string
  isLoading: boolean
  tokenSymbol: string
}

export function QuoteExpectedAmounts({ expectedAmount, minimumAmount, isLoading, tokenSymbol }: Props) {
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
    </>
    : null
}
