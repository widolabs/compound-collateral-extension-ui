import "../styles/main.scss";
import { RPC } from "@compound-finance/comet-extension";
import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  WidoCompoundSdk,
  CollateralSwapRoute,
  Deployments,
  UserAssets,
  Deployment,
  Position
} from "@widolabs/collateral-swap-sdk";
import { HomePage } from "./HomePage";
import { useAsyncEffect } from './lib/useAsyncEffect';
import { useDebouncedCallback } from 'use-debounce';
import { BigNumber } from 'ethers';
import { formatAmount, getAmountParts, getDecimals, getTokenUnit, ZERO } from './lib/utils';

interface AppProps {
  rpc?: RPC
  web3: JsonRpcProvider
}

export default ({ rpc, web3 }: AppProps) => {
  const [markets, setMarkets] = useState<Deployments>([]);
  const [isSupportedNetwork, setIsSupportedNetwork] = useState<boolean>(false);
  const [selectedMarket, setSelectedMarket] = useState<Deployment | undefined>();
  const [account, setAccount] = useState<string | null>(null);
  const [selectedFromToken, setSelectedFromToken] = useState("");
  const [selectedToToken, setSelectedToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [swapQuote, setSwapQuote] = useState<CollateralSwapRoute | undefined>();
  const [userAssets, setUserAssets] = useState<UserAssets>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<Position | undefined>();
  const [predictedPosition, setPredictedPosition] = useState<Position | undefined>();
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

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
    setAmount("");
    setPredictedPosition(undefined);
    setSwapQuote(undefined);
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
    const decimals = getDecimals(userAssets, selectedFromToken);
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
    for (const asset of userAssets) {
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
      setIsExecuting(true);
      const txHash = await widoSdk.swapCollateral(swapQuote);
      web3.waitForTransaction(txHash)
        .then(async () => {
          setSelectedFromToken("");
          setSelectedToToken("");
          setAmount("");
          const assets = await widoSdk.getUserCollaterals();
          setUserAssets(assets);
        })
        .finally(() => {
          setIsExecuting(false);
        })
    }
  }

  /**
   * Memo to keep updated the max balance when the asset changes
   */
  const assetBalance = useMemo(() => {
    if (!selectedFromToken) {
      return "0";
    }
    const decimals = getDecimals(userAssets, selectedFromToken);
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
    if (isExecuting) return true
    const fromTokenBalance = getFromTokenBalance()
    const fromAmount = getFromAmount();
    return fromAmount.gt(fromTokenBalance);
  }, [amount, assetBalance, selectedFromToken, selectedToToken, isLoading, isExecuting])

  /**
   * Callback that is executed when the user selects "max amount"
   * It converts the user's balance into a string to set it as `amount`
   */
  const onMaxClick = () => {
    if (!selectedFromToken) return;
    const decimals = getDecimals(userAssets, selectedFromToken);
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
    setSelectedMarket(isSupported ? supportedMarkets[0] : undefined)
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
   * Async effect to keep balances updated when the SDK changes
   */
  useAsyncEffect(async () => {
    if (widoSdk && isSupportedNetwork) {
      const assets = await widoSdk.getUserCollaterals();
      setUserAssets(assets);
    }
  }, [widoSdk, isSupportedNetwork]);

  /**
   * Effect to manage quoting logic
   */
  useEffect(() => {
    if (selectedFromToken && selectedToToken && amount) {
      setLoading(true);
      setPredictedPosition(undefined);
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
      // Compute predicted position
      const predictedPosition = await widoSdk.getUserPredictedPosition(quote);
      setPredictedPosition(predictedPosition);
    }
  }, 1000);

  /**
   * Fetch current position when `fromToken` is selected
   */
  useAsyncEffect(async () => {
    if (widoSdk && selectedFromToken) {
      const currentPosition = await widoSdk.getUserCurrentPosition();
      setCurrentPosition(currentPosition);
    }
  }, [selectedFromToken, widoSdk]);

  /**
   * Computes formatted amount to be shown for the quote's expected amounts
   * @param quote
   */
  const { expectedAmount, minimumAmount } = useMemo(() => {
    if (!swapQuote) {
      return {
        expectedAmount: "",
        minimumAmount: "",
      }
    }
    const decimals = getDecimals(userAssets, selectedToToken);
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
        <HomePage
          selectedMarket={selectedMarket}
          markets={markets}
          onSelectMarket={setSelectedMarket}
          collaterals={userAssets}
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
          currentPosition={currentPosition}
          predictedPosition={predictedPosition}
          baseTokenSymbol={selectedMarket?.asset}
          isExecuting={isExecuting}
        />
      </div>
    </div>
  )
};
