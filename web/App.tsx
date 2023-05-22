import "../styles/main.scss";
import { RPC } from "@compound-finance/comet-extension";
import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { HomePage } from "./HomePage";
import { usePoll } from './lib/usePoll';
import { useAsyncEffect } from './lib/useAsyncEffect';
import { WidoCompoundSdk } from "wido-compound-sdk";
import { useDebouncedCallback } from 'use-debounce';
import { CollateralSwapRoute } from 'types/index';
import { BigNumber } from 'ethers';
import { Assets, UserAssets } from '../../wido-compound-sdk/src';

interface AppProps {
  rpc?: RPC
  web3: JsonRpcProvider
}

type AppPropsInternal = AppProps & {
  account: string;
}

function getDecimals(collaterals: Assets, asset: string): number {
  for (const collateral of collaterals) {
    if (collateral.name === asset) {
      return collateral.decimals
    }
  }
  throw new Error("Asset not found");
}

function App(
  {
    rpc, web3, account
  }: AppPropsInternal
) {
  const [supportedCollaterals, setSupportedCollaterals] = useState<Assets>([]);
  const [selectedFromToken, setSelectedFromToken] = useState("");
  const [selectedToToken, setSelectedToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [swapQuote, setSwapQuote] = useState<CollateralSwapRoute | undefined>();
  const [balances, setBalances] = useState<UserAssets>([]);

  // initialize SDK
  const widoSdk = useMemo(() => {
    const signer = web3.getSigner().connectUnchecked();
    return new WidoCompoundSdk(signer, "polygon_usdc")
  }, [web3, account]);

  // load supported collateral
  useAsyncEffect(async () => {
    const collaterals = await widoSdk.getSupportedCollaterals();
    setSupportedCollaterals(collaterals);
  }, [widoSdk]);

  // load user balances
  useAsyncEffect(async () => {
    const balances = await widoSdk.getUserCollaterals();
    setBalances(balances);
  }, [widoSdk]);

  // asset selection
  const selectFromToken = (selection: string) => {
    if (selection === selectedToToken) {
      setSelectedToToken(selectedFromToken)
    }
    setSelectedFromToken(selection);
  }
  const selectToToken = (selection: string) => {
    if (selection === selectedFromToken) {
      setSelectedFromToken(selectedToToken)
    }
    setSelectedToToken(selection);
  }

  // quote
  useEffect(() => {
    if (selectedFromToken && selectedToToken && amount) {
      quote()
    }
  }, [selectedFromToken, selectedToToken, amount])

  const quote = useDebouncedCallback(async () => {
    const decimals = getDecimals(supportedCollaterals, selectedFromToken);
    const _amount = BigNumber.from(amount);
    const _unit = BigNumber.from("1" + "0".repeat(decimals))
    const fromAmount = _amount.mul(_unit);
    const quote = await widoSdk.getCollateralSwapRoute(
      selectedFromToken,
      selectedToToken,
      fromAmount
    );
    setSwapQuote(quote)
  }, 1000);

  // execute
  const executeSwap = async () => {
    if (swapQuote) {
      await widoSdk.swapCollateral(swapQuote)
    }
  }

  return (
    <div className="page home">
      <div className="container">
        <div className="masthead L1">
          <h1 className="L0 heading heading--emphasized">
            Wido Collateral Swaps
          </h1>
          <button
            className="button button--large button--supply"
            onClick={() => null}
          >
            Enable
          </button>
        </div>

        <HomePage
          collaterals={supportedCollaterals.map(c => c.name)}
          fromToken={selectedFromToken}
          toToken={selectedToToken}
          amount={amount}
          setFromToken={selectFromToken}
          setToToken={selectToToken}
          setAmount={setAmount}
          onSwap={executeSwap}
        />

        <p>Market Info</p>
        <p>chainId: </p>
        <p>baseAssetSymbol: </p>
        <p>marketAddress: </p>
      </div>
    </div>
  );
}

export default ({ rpc, web3 }: AppProps) => {
  let timer = usePoll(10000);
  const [account, setAccount] = useState<string | null>(null);
  const [isSupportedNetwork, setIsSupportedNetwork] = useState<boolean>(true);

  useAsyncEffect(async () => {
    let accounts = await web3.listAccounts();
    if (accounts.length > 0) {
      let [account] = accounts;
      setAccount(account);
    }
  }, [web3, timer]);

  if (!isSupportedNetwork) {
    return <div>Unsupported network...</div>;
  }

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <App
      rpc={rpc}
      web3={web3}
      account={account}
    />
  );
};
