import React from "react";
import { LabelValue } from './LabelValue';
import { Label } from './Label';
import { Fees } from '@widolabs/collateral-swap-sdk';
import { InfoSolid } from '../Icons';

interface Props {
  fromToken: string
  toToken: string
  expectedAmount: string
  minimumAmount: string
  isLoading: boolean
  tokenSymbol: string
  fees?: Fees
}

export function QuoteExpectedAmounts(
  {
    fromToken,
    toToken,
    expectedAmount,
    minimumAmount,
    isLoading,
    tokenSymbol,
    fees
  }
    : Props) {
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
          <label
            className="label text-color--1"
            title={`Flash loan provider takes ${fees.providerFee} ${toToken} and Wido takes ${fees.widoFee} ${fromToken}`}>
            ~ {fees.totalUsd.toFixed(2)} USD&nbsp;
            <InfoSolid className="svg--icon--2" style={{ width: "15px", height: "15px", cursor: "pointer" }}/>
          </label>
        </div>
      }
    </>
    : null
}
