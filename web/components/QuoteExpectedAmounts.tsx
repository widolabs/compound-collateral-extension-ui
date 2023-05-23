import React from "react";
import { LabelValue } from './LabelValue';
import { Label } from './Label';

interface Props {
  expectedAmount: string
  minimumAmount: string
  isLoading: boolean
}

export function QuoteExpectedAmounts({ expectedAmount, minimumAmount, isLoading }: Props) {
  if (isLoading) {
    return <div>Loading...</div>
  }

  return expectedAmount ?
    <>
      <div className="panel__row">
        <Label text="Expected amount"/>
        <LabelValue text={expectedAmount}/>
      </div>
      <div className="panel__row">
        <Label text="Guaranteed amount"/>
        <LabelValue text={minimumAmount}/>
      </div>
    </>
    : null
}
