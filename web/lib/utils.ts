import { BigNumber } from 'ethers';
import { UserAssets } from '@widolabs/collateral-swap-sdk';

export const ZERO = BigNumber.from(0);

/**
 * Formats an `amount` of `decimals` precision into a string for the UI
 */
export function formatAmount(amount: BigNumber, decimals: number, precision = 4): string {
  const { integer, decimal } = getAmountParts(amount, decimals);
  const _decimal = BigNumber.from(decimal);
  if (_decimal.eq(ZERO)) {
    return integer;
  }
  // compose visible number
  return integer + "." + decimal.substring(0, precision)
}

/**
 * Returns the given amount in split in two parts: `integer` and `decimal`
 *  so it can be formatted and shown as necessary
 */
export function getAmountParts(amount: BigNumber, decimals: number): {
  integer: string
  decimal: string
} {
  const _unit = BigNumber.from("1" + "0".repeat(decimals))
  // separate parts
  const integerPart = amount.div(_unit);
  const decimalPart = amount.sub(integerPart.mul(_unit));
  let decimalPartString = decimalPart.toString()
  // check if extra zeros required on decimal part
  if (decimalPartString.length < decimals) {
    const leftZeros = decimals - decimalPartString.length;
    decimalPartString = "0".repeat(leftZeros) + decimalPartString
  }
  return {
    integer: integerPart.toNumber().toLocaleString(),
    decimal: decimalPartString
  }
}

/**
 * Returns the number of decimals of a given asset
 * @param collaterals
 * @param asset
 */
export function getDecimals(collaterals: UserAssets, asset: string): number {
  for (const collateral of collaterals) {
    if (collateral.name === asset) {
      return collateral.decimals
    }
  }
  throw new Error("Asset not found");
}

/**
 * Returns a BigNumber that represents the whole unit of a token of given `decimals`
 */
export const getTokenUnit = (decimals: number) => {
  return BigNumber.from("1" + "0".repeat(decimals))
}
