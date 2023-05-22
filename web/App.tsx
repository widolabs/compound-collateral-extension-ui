import "../styles/main.scss";
import { RPC } from "@compound-finance/comet-extension";
import { useMemo, useState } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { HomePage } from "./HomePage";
import { usePoll } from './lib/usePoll';
import { useAsyncEffect } from './lib/useAsyncEffect';
import { WidoCompoundSdk } from "wido-compound-sdk";

interface AppProps {
  rpc?: RPC
  web3: JsonRpcProvider
}

type AppPropsInternal = AppProps & {
  account: string;
}

function App(
  {
    rpc, web3, account
  }: AppPropsInternal
) {
  const [supportedCollaterals, setSupportedCollaterals] = useState<{ name: string, address: string }[]>([]);
  const [selectedFromToken, setSelectedFromToken] = useState("");
  const [selectedToToken, setSelectedToToken] = useState("");
  const [amount, setAmount] = useState("");

  const widoSdk = useMemo(() => {
    const signer = web3.getSigner().connectUnchecked();
    return new WidoCompoundSdk(signer, "mainnet_usdc")
  }, [web3, account]);

  useAsyncEffect(async () => {
    const collaterals = await widoSdk.getSupportedCollaterals();
    setSupportedCollaterals(collaterals);
  }, [widoSdk]);

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
