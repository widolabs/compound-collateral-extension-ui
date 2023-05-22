import React, { useState } from "react";
import { AssetSelector } from "./components/AssetSelector";
import { ArrowDown } from "./Icons";

export function HomePage() {
  const [fromToken, setFromToken] = useState("WETH");
  const [toToken, setToToken] = useState("WBTC");
  const [amount, setAmount] = useState("");

  return (
    <div className="home__content">
      <div className="home__form">
        <div className="panel">
          <div className="panel__row">
            <h6 className="L2 heading text-color--1">Swap collateral</h6>
          </div>
          <div className="panel__column">
            <label className="label text-color--2">Collateral to swap</label>
            <AssetSelector
              value={fromToken}
              options={["WBTC", "LINK", "COMP", "ETH"]}
              onChange={setFromToken}
            />
          </div>
          <div className="panel__column">
            <label className="label text-color--2">Amount</label>
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
            <ArrowDown className="svg--icon--2" />
          </div>
          <div className="panel__column">
            <label className="label text-color--2">Collateral to obtain</label>
            <AssetSelector
              value={toToken}
              options={["WBTC", "LINK", "COMP", "ETH"]}
              onChange={setToToken}
            />
          </div>
          <div className="panel__row">
            <label className="label text-color--2">Expected amount</label>
            <label className="label text-color--1">0.6213123</label>
          </div>
          <div className="panel__row">
            <label className="label text-color--2">Guaranteed amount</label>
            <label className="label text-color--1">0.5532134</label>
          </div>
          <div className="panel__column form_button">
            <button className="button button--large button--supply">
              Swap
            </button>
          </div>
          <table className="pos__summary">
            <tbody>
              <tr>
                <td>
                  <label className="label text-color--2">
                    Position Summary
                  </label>
                </td>
                <td>
                  <label className="label text-color--2">Current</label>
                </td>
                <td>
                  <label className="label text-color--2">Target</label>
                </td>
              </tr>
              <tr>
                <td>
                  <label className="label text-color--2">
                    Collateral Value
                  </label>
                </td>
                <td>
                  <label className="label text-color--1">$3,591.77</label>
                </td>
                <td>
                  <label className="label text-color--1">$3,591.77</label>
                </td>
              </tr>
              <tr>
                <td>
                  <label className="label text-color--2">
                    Liquidation Point
                  </label>
                </td>
                <td>
                  <label className="label text-color--1">$1,185.28</label>
                </td>
                <td>
                  <label className="label text-color--1">$1,185.28</label>
                </td>
              </tr>
              <tr>
                <td>
                  <label className="label text-color--2">Borrow Capacity</label>
                </td>
                <td>
                  <label className="label text-color--1">$2,945.25</label>
                </td>
                <td>
                  <label className="label text-color--1">$2,945.25</label>
                </td>
              </tr>
              <tr>
                <td>
                  <label className="label text-color--2">
                    Available to Borrow
                  </label>
                </td>
                <td>
                  <label className="label text-color--1">$1,945.17</label>
                </td>
                <td>
                  <label className="label text-color--1">$1,945.17</label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
