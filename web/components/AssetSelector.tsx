import React, { useState } from "react";
import { CaretDown } from "../Icons/CaretDown";
import OutsideClickHandler from "react-outside-click-handler";
import { UserAssets } from '@widolabs/collateral-swap-sdk';
import { formatAmount } from '../lib/utils';

type AssetSelectorProps = {
  value: string
  options: UserAssets
  onChange: (value: string) => void
  showBalance: boolean
};

export function AssetSelector({
  value,
  options,
  onChange,
  showBalance,
}: AssetSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <button
      className="button dropdown"
      onClick={() => setOpen((open) => !open)}
    >
      <div className="icon icon--centered undefined">
        <span className={`asset asset--small asset--${value}`}></span>
      </div>
      <div className="market-selector__option__info">
        <span className="label text-color--1 L1">{value ? value : "Select"}</span>
      </div>
      <CaretDown/>
      {
        open && (
          <OutsideClickHandler onOutsideClick={() => setOpen(false)}>
            <div className="dropdown__content">
              {
                options.length == 0
                &&
                <div>
                  <div className="market-selector__option__info">
                    <span className="label text-color--1 L1">Loading assets...</span>
                  </div>
                </div>
              }
              {
                options.map((option, index) => (
                  <div
                    key={index}
                    className="market-selector__option"
                    onClick={() => {
                      onChange(option.name);
                    }}
                  >
                    <div className="icon icon--centered undefined">
                      <span className={`asset asset--${option.name}`}></span>
                    </div>
                    <div className="market-selector__option__info">
                      <span className="label text-color--1 L1">{option.name}</span>
                    </div>
                    {
                      showBalance
                        ?
                        <div className="market-selector__balance">
                          {formatAmount(option.balance, option.decimals, 4)}
                        </div>
                        :
                        null
                    }
                  </div>
                ))
              }
            </div>
          </OutsideClickHandler>
        )
      }
    </button>
  );
}
