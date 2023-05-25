import React, { useState } from "react";
import { CaretDown } from "../Icons/CaretDown";
import OutsideClickHandler from "react-outside-click-handler";
import { UserAssets } from '@widolabs/collateral-swap-sdk';

type AssetSelectorProps = {
  value: string;
  options: UserAssets;
  onChange: (value: string) => void;
};

export function AssetSelector({
  value,
  options,
  onChange,
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
