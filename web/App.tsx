import "../styles/main.scss";
import { OutMessage, RPC } from "@compound-finance/comet-extension";
import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { HomePage } from "./HomePage";
import { SelectedMarket } from "@compound-finance/comet-extension/dist/CometState";
import { usePoll } from './lib/usePoll';
import { useAsyncEffect } from './lib/useAsyncEffect';

interface AppProps {
  rpc?: RPC;
  web3: JsonRpcProvider;
}

type AppPropsInternal = AppProps & {
  account: string;
};

function App({
  rpc,
  web3,
  account,
}: AppPropsInternal) {

  const signer = useMemo(() => {
    return web3.getSigner().connectUnchecked();
  }, [web3, account]);

  const [selectedMarket, setSelectedMarket] = useState<SelectedMarket>();

  useEffect(() => {
    rpc?.sendRPC({ type: "getSelectedMarket" }).then((result) => {
      result = result as OutMessage<{
        type: "getSelectedMarket";
      }>;

      setSelectedMarket(result.selectedMarket);
    });
  }, [rpc]);

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

        <HomePage/>

        <p>Market Info</p>
        <p>chainId: {selectedMarket?.chainId}</p>
        <p>baseAssetSymbol: {selectedMarket?.baseAssetSymbol}</p>
        <p>marketAddress: {selectedMarket?.marketAddress}</p>
      </div>
    </div>
  );
}

export default ({ rpc, web3 }: AppProps) => {
  let timer = usePoll(10000);
  const [account, setAccount] = useState<string | null>(null);
  const [supportedNetwork, setSupportedNetwork] = useState<boolean>(true);

  useAsyncEffect(async () => {
    let accounts = await web3.listAccounts();
    if (accounts.length > 0) {
      let [account] = accounts;
      setAccount(account);
    }
  }, [web3, timer]);

  useAsyncEffect(async () => {
    let networkWeb3 = await web3.getNetwork();
    // TODO : check supported network
  }, [web3, timer]);

  if (!supportedNetwork) {
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
