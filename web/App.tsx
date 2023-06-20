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
import { SuccessPage } from './SuccessPage';
import { FailedPage } from './FailedPage';
import { usePoll } from './lib/usePoll';
import { SelectedMarket } from '@compound-finance/comet-extension/dist/CometState';

interface AppProps {
  rpc?: RPC
  web3: JsonRpcProvider
}

enum SwapStatus {
  Preparing,
  Success,
  Failed,
}

export default ({ rpc, web3 }: AppProps) => {
  const [widoSdk, setSdk] = useState<WidoCompoundSdk>();
  const [markets, setMarkets] = useState<Deployments>([]);
  const [isSupportedNetwork, setIsSupportedNetwork] = useState<boolean>(false);
  const [requestWalletChange, setRequestWalletChange] = useState<boolean>(false);
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
  const [notEnoughBalance, setNotEnoughBalance] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>("");
  const [swapStatus, setSwapStatus] = useState<SwapStatus>(SwapStatus.Preparing);
  const timer = usePoll(!!account ? 30000 : 5000);

  const deployments = WidoCompoundSdk.getDeployments();

  const showMarketSelector = useMemo(() => {
    return !rpc;
  }, [rpc]);

  /**
   * Initial load of the current selected market
   */
  useEffect(() => {
    if (rpc) {
      // @ts-ignore
      rpc.sendRPC({ type: 'getSelectedMarket' }).then(({ selectedMarket }) => {
        selectMarket(selectedMarket);
      });
    }
  }, [rpc])

  /**
   * Event subscribing for market changes
   */
  useAsyncEffect(async () => {
    if (rpc) {
      rpc.on({
        setSelectedMarket: async (msg) => {
          selectMarket(msg.selectedMarket);
        }
      });
    }
  }, [rpc, deployments, chainId]);

  /**
   * Logic to internally select a market from the Compound event details
   * @param selectedMarket
   */
  const selectMarket = (selectedMarket: SelectedMarket) => {
    const market = deployments.find(m => {
      return m.chainId == selectedMarket.chainId && m.address == selectedMarket.marketAddress
    });
    if (market) {
      setSelectedMarket(market);
      if (selectedMarket.chainId !== chainId) {
        setRequestWalletChange(true);
      }
    }
  }

  /**
   * Effect to check if the selected chain is already good, so we remove the message
   */
  useEffect(() => {
    if (selectedMarket) {
      if (selectedMarket.chainId === chainId) {
        setRequestWalletChange(false);
      }
    }
  }, [selectedMarket, chainId]);

  /**
   * Memo to build the SDK whenever the chain/account/market changes
   */
  useAsyncEffect(async () => {
    if (selectedMarket && isSupportedNetwork) {
      const signer = web3.getSigner().connectUnchecked();
      const chainId = await web3.getNetwork()
      const sdk = new WidoCompoundSdk(signer, selectedMarket.cometKey);
      setChainId(chainId.chainId);
      setSdk(sdk)
    }
  }, [web3, account, selectedMarket, isSupportedNetwork, timer]);

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
      const txHash = await widoSdk.swapCollateral(swapQuote);
      setIsExecuting(true);
      setTxHash(txHash);
      web3.waitForTransaction(txHash)
        .then(async () => {
          setSwapStatus(SwapStatus.Success);
          await loadUserAssets();
        })
        .catch(error => {
          setSwapStatus(SwapStatus.Failed);
        })
        .finally(() => {
          setIsExecuting(false);
        });
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
    if (showMarketSelector) {
      setSelectedMarket(isSupported ? supportedMarkets[0] : undefined)
    }
  }, [web3, showMarketSelector]);

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
    await loadUserAssets();
  }, [widoSdk, isSupportedNetwork]);

  /**
   * Loads all user's assets
   */
  const loadUserAssets = async () => {
    if (widoSdk && isSupportedNetwork) {
      const assets = await widoSdk.getUserCollaterals();
      setUserAssets(assets);
    }
  }

  /**
   * Effect to manage quoting logic
   */
  useEffect(() => {
    if (selectedFromToken && selectedToToken && amount) {
      if(!enoughBalance()){
        setNotEnoughBalance(true);
        return;
      }
      setNotEnoughBalance(false);
      setLoading(true);
      setPredictedPosition(undefined);
      quote()
    }
  }, [selectedFromToken, selectedToToken, amount])

  /**
   * Checks whether the user has enough balance to swap the given amount
   */
  const enoughBalance = () => {
    const fromTokenBalance = getFromTokenBalance()
    const fromAmount = getFromAmount();
    return fromTokenBalance.gte(fromAmount);
  }

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

  /**
   * Sets all the interface to initial state
   */
  const cleanInterface = () => {
    setSelectedFromToken("");
    setSelectedToToken("");
    setAmount("");
    setSwapStatus(SwapStatus.Preparing);
  };

  // guard clauses
  if (requestWalletChange) {
    return <div className="panel__row panel__row__center">
      <h1 style={{ color: "white", margin: "3rem" }}>Switch wallet to market chain</h1>
    </div>;
  }
  if (!isSupportedNetwork) {
    return <div className="panel__row panel__row__center">
      <h1 style={{ color: "white", margin: "3rem" }}>Unsupported network</h1>
    </div>;
  }
  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page home">
      <div className="container">
        {
          swapStatus == SwapStatus.Preparing
          &&
          <HomePage
            notEnoughBalance={notEnoughBalance}
            showMarketSelector={showMarketSelector}
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
            fees={swapQuote?.fees}
          />
        }
        {
          swapStatus == SwapStatus.Success
          &&
          <SuccessPage
            fromAsset={selectedFromToken}
            toAsset={selectedToToken}
            chainId={chainId}
            txHash={txHash}
            onClick={cleanInterface}
          />
        }
        {
          swapStatus == SwapStatus.Failed
          &&
          <FailedPage
            chainId={chainId}
            txHash={txHash}
            onClick={cleanInterface}
          />
        }
      </div>
    </div>
  )
};
