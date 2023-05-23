import "../styles/main.scss";
import { RPC } from "@compound-finance/comet-extension";
import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { HomePage } from "./HomePage";
import { useAsyncEffect } from './lib/useAsyncEffect';
import { useDebouncedCallback } from 'use-debounce';
import { BigNumber } from 'ethers';
import { WidoCompoundSdk } from "wido-compound-sdk";
import { CollateralSwapRoute, Deployments, Assets, UserAssets, Deployment } from 'types/index';
import { MarketSelector } from './components/MarketSelector';

interface AppProps {
  rpc?: RPC
  web3: JsonRpcProvider
}

const ZERO = BigNumber.from(0);

export default ({ rpc, web3 }: AppProps) => {
  const [markets, setMarkets] = useState<Deployments>([]);
  const [isSupportedNetwork, setIsSupportedNetwork] = useState<boolean>(false);
  const [selectedMarket, setSelectedMarket] = useState<Deployment | null>();
  const [account, setAccount] = useState<string | null>(null);
  const [supportedCollaterals, setSupportedCollaterals] = useState<Assets>([]);
  const [selectedFromToken, setSelectedFromToken] = useState("");
  const [selectedToToken, setSelectedToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [swapQuote, setSwapQuote] = useState<CollateralSwapRoute | undefined>();
  const [balances, setBalances] = useState<UserAssets>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  const deployments = WidoCompoundSdk.getDeployments();

  /**
   * Memo to build the SDK whenever the chain/account/market changes
   */
  const widoSdk = useMemo(() => {
    if (selectedMarket && isSupportedNetwork) {
      const signer = web3.getSigner().connectUnchecked();
      return new WidoCompoundSdk(signer, selectedMarket.cometKey)
    }
  }, [web3, account, selectedMarket, isSupportedNetwork]);

  /**
   * Logic callback when selecting `fromToken`
   * @param selection
   */
  const selectFromToken = (selection: string) => {
    if (selection === selectedToToken) {
      setSelectedToToken(selectedFromToken)
    }
    setSelectedFromToken(selection);
  }

  /**
   * Logic callback when selecting `toToken`
   * @param selection
   */
  const selectToToken = (selection: string) => {
    if (selection === selectedFromToken) {
      setSelectedFromToken(selectedToToken)
    }
    setSelectedToToken(selection);
  }

  /**
   * Returns a BigNumber that represents the `amount` string input by the user
   */
  const getFromAmount = (): BigNumber => {
    if (!amount) {
      return ZERO;
    }
    const decimals = getDecimals(supportedCollaterals, selectedFromToken);
    const _unit = getTokenUnit(decimals)
    if (amount.indexOf(".") === -1) {
      // if not decimals, we can just multiply
      return BigNumber.from(amount).mul(_unit);
    }
    // separate parts
    const parts = amount.split(".");
    const integerPart = BigNumber.from(parts[0]).mul(_unit);
    const decimalPart = BigNumber.from(parts[1] + ("0".repeat(decimals - parts[1].length)))
    // compose BigNumber
    return integerPart.add(decimalPart);
  }

  /**
   * Returns a BigNumber of the available user's balance of the selected `fromToken`
   */
  const getFromTokenBalance = (): BigNumber => {
    for (const asset of balances) {
      if (asset.name === selectedFromToken) {
        return asset.balance
      }
    }
    return ZERO;
  }

  /**
   * Collateral swap execution function
   */
  const executeSwap = async () => {
    if (swapQuote && widoSdk && isSupportedNetwork) {
      await widoSdk.swapCollateral(swapQuote)
    }
  }

  /**
   * Memo to keep updated the max balance when the asset changes
   */
  const assetBalance = useMemo(() => {
    if (!selectedFromToken) {
      return "0";
    }
    const decimals = getDecimals(supportedCollaterals, selectedFromToken);
    const balance = getFromTokenBalance();
    return formatAmount(balance, decimals);
  }, [selectedFromToken, widoSdk])

  /**
   * Memo to keep the swap button disable state updated when balance/amount changes
   */
  const disabledButton = useMemo(() => {
    if (!selectedFromToken) return true
    if (!selectedToToken) return true
    if (!amount) return true
    if (isLoading) return true
    const fromTokenBalance = getFromTokenBalance()
    const fromAmount = getFromAmount();
    return fromAmount.gt(fromTokenBalance);
  }, [amount, assetBalance, selectedFromToken, selectedToToken, isLoading])

  /**
   * Callback that is executed when the user selects "max amount"
   * It converts the user's balance into a string to set it as `amount`
   */
  const onMaxClick = () => {
    if (!selectedFromToken) return;
    const decimals = getDecimals(supportedCollaterals, selectedFromToken);
    const balance = getFromTokenBalance();
    if (balance.eq(ZERO)) return;
    const { integer, decimal } = getAmountParts(balance, decimals);
    // compose full string
    const balanceString = integer + "." + decimal
    setAmount(balanceString);
  }

  /**
   * Async effect to keep markets updated when chain changes
   */
  useAsyncEffect(async () => {
    const currentChainId = await web3.getSigner().getChainId()
    const supportedMarkets = deployments.filter(d => d.chainId === currentChainId);
    const isSupported = supportedMarkets.length > 0;
    setIsSupportedNetwork(isSupported);
    setMarkets(supportedMarkets)
    setSelectedMarket(isSupported ? supportedMarkets[0] : null)
  }, [web3]);

  /**
   * Async effect to keep account updated
   */
  useAsyncEffect(async () => {
    let accounts = await web3.listAccounts();
    if (accounts.length > 0) {
      let [account] = accounts;
      setAccount(account);
    }
  }, [web3]);

  /**
   * Async effect to keep collaterals updated when the SDK changes
   */
  useAsyncEffect(async () => {
    if (widoSdk && isSupportedNetwork) {
      const collaterals = await widoSdk.getSupportedCollaterals();
      setSupportedCollaterals(collaterals);
    }
  }, [widoSdk, isSupportedNetwork]);

  /**
   * Async effect to keep balances updated when the SDK changes
   */
  useAsyncEffect(async () => {
    if (widoSdk && isSupportedNetwork) {
      const balances = await widoSdk.getUserCollaterals();
      setBalances(balances);
    }
  }, [widoSdk, isSupportedNetwork]);

  /**
   * Effect to manage quoting logic
   */
  useEffect(() => {
    if (selectedFromToken && selectedToToken && amount) {
      setLoading(true);
      quote()
    }
  }, [selectedFromToken, selectedToToken, amount])

  /**
   * Debounced quote function
   */
  const quote = useDebouncedCallback(async () => {
    if (widoSdk && isSupportedNetwork) {
      const fromAmount = getFromAmount();
      const quote = await widoSdk.getCollateralSwapRoute(
        selectedFromToken,
        selectedToToken,
        fromAmount
      ).then((response) => {
        setLoading(false);
        return response;
      })
      setSwapQuote(quote)
    }
  }, 1000);

  /**
   * Computes formatted amount to be shown for the quote's expected amounts
   * @param quote
   */
  const {expectedAmount, minimumAmount} = useMemo(() => {
    if(!swapQuote){
      return {
        expectedAmount: "",
        minimumAmount: "",
      }
    }
    const decimals = getDecimals(supportedCollaterals, selectedToToken);
    const expectedAmount = formatAmount(BigNumber.from(swapQuote.toCollateralAmount), decimals, 6);
    const minimumAmount = formatAmount(BigNumber.from(swapQuote.toCollateralMinAmount), decimals, 6);
    return {
      expectedAmount,
      minimumAmount,
    }
  }, [swapQuote])

  // guard clauses
  if (!isSupportedNetwork) {
    return <div>Unsupported network...</div>;
  }
  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page home">
      <div className="container">
        <div className="masthead L1">
          <h1 className="L0 heading heading--emphasized">
            Wido Collateral Swaps
          </h1>
          {
            selectedMarket
              ? <MarketSelector
                value={selectedMarket}
                options={markets}
                onChange={(selection) => {
                  setSelectedMarket(selection)
                }}
              />
              : null
          }
        </div>

        <HomePage
          collaterals={supportedCollaterals.map(c => c.name)}
          fromToken={selectedFromToken}
          toToken={selectedToToken}
          amount={amount}
          assetBalance={assetBalance}
          setFromToken={selectFromToken}
          setToToken={selectToToken}
          setAmount={setAmount}
          onMaxClick={onMaxClick}
          onSwap={executeSwap}
          disabledButton={disabledButton}
          expectedAmount={expectedAmount}
          minimumAmount={minimumAmount}
          isLoading={isLoading}
        />

        <p>Market Info</p>
        <p>chainId: </p>
        <p>baseAssetSymbol: </p>
        <p>marketAddress: </p>
      </div>
    </div>
  )
};

/**
 * Returns the number of decimals of a given asset
 * @param collaterals
 * @param asset
 */
function getDecimals(collaterals: Assets, asset: string): number {
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
const getTokenUnit = (decimals: number) => {
  return BigNumber.from("1" + "0".repeat(decimals))
}

/**
 * Formats an `amount` of `decimals` precision into a string for the UI
 */
const formatAmount = (amount: BigNumber, decimals: number, precision = 4): string => {
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
function getAmountParts(amount: BigNumber, decimals: number): {
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
    integer: integerPart.toString(),
    decimal: decimalPartString
  }
}