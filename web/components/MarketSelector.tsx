import React, { useState } from "react";
import { CaretDown } from "../Icons/CaretDown";
import OutsideClickHandler from "react-outside-click-handler";
import { Deployment } from 'types/index';

type Props = {
  value: Deployment;
  options: Deployment[];
  onChange: (value: Deployment) => void;
};

export function MarketSelector({
  value,
  options,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <button
      className="button dropdown"
      onClick={() => setOpen((open) => !open)}
    >
      <div className="market-selector__option__info">
        <span className="label text-color--1 L1">{value.asset.toUpperCase()}</span>
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
                      onChange(option);
                    }}
                  >
                    <div className="market-selector__option__info">
                      <span className="label text-color--1 L1">{option.asset.toUpperCase()}</span>
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
