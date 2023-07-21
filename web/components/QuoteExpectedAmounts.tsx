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
  price?: string
  fees?: Fees
}

export function QuoteExpectedAmounts(
  {
    fromToken,
    toToken,
    expectedAmount,
    minimumAmount,
    isLoading,
    price,
    fees,
  }
    : Props) {
  if (isLoading) {
    return <div className="panel__row panel__row__center">Loading...</div>
  }

  return expectedAmount ?
    <>
      <div className="panel__row">
        <Label text="Price"/>
        <LabelValue
          text={"~ " + Number(price).toLocaleString("en-US", {maximumFractionDigits: 6}) + " " + toToken + "/" + fromToken}
        />
      </div>
      <div className="panel__row">
        <Label text="Expected amount"/>
        <LabelValue text={expectedAmount + " " + toToken}/>
      </div>
      <div className="panel__row">
        <Label text="Guaranteed amount"/>
        <LabelValue text={minimumAmount + " " + toToken}/>
      </div>
      {
        fees
        &&
        <div className="panel__row">
          <Label text="Fees"/>
          <label className="label hover-tooltip text-color--1">
            ~ {fees.totalUsd.toFixed(2)} USD&nbsp;
            <InfoSolid className="svg--icon--2" style={{ width: "15px", height: "15px" }}/>
            <span className="hover-tooltiptext">Flash loan provider takes {fees.providerFee} {toToken}(~${fees.providerFeeUsd.toFixed(2)}) and Wido takes {fees.widoFee} {fromToken}(~${fees.widoFeeUsd.toFixed(2)})</span>
          </label>
        </div>
      }
    </>
    : null
}
