import "../styles/main.scss";
import { RPC } from "@compound-finance/comet-extension";
import { Fragment, useEffect, useMemo, useState } from "react";
import ERC20 from "../abis/ERC20";
import Comet from "../abis/Comet";
import {
  CTokenSym,
  Network,
  NetworkConfig,
  getNetwork,
  getNetworkById,
  getNetworkConfig,
  isNetwork,
  showNetwork,
} from "./Network";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { Close } from "./Icons/Close";
import { CircleCheckmark } from "./Icons/CircleCheckmark";
import { ArrowDown } from "./Icons/ArrowDown";
import { CaretDown } from "./Icons/CaretDown";

interface AppProps {
  rpc?: RPC;
  web3: JsonRpcProvider;
}

type AppPropsExt<N extends Network> = AppProps & {
  account: string;
  networkConfig: NetworkConfig<N>;
};

interface AccountState<Network> {
  extEnabled: boolean;
}

function usePoll(timeout: number) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let t: NodeJS.Timer;
    function loop(x: number, delay: number) {
      t = setTimeout(() => {
        requestAnimationFrame(() => {
          setTimer(x);
          loop(x + 1, delay);
        });
      }, delay);
    }
    loop(1, timeout);
    return () => clearTimeout(t);
  }, []);

  return timer;
}

function useAsyncEffect(fn: () => Promise<void>, deps: any[] = []) {
  useEffect(() => {
    (async () => {
      await fn();
    })();
  }, deps);
}

export function App<N extends Network>({
  rpc,
  web3,
  account,
  networkConfig,
}: AppPropsExt<N>) {
  let { cTokenNames } = networkConfig;

  rpc?.sendRPC({ type: "getSelectedMarket" }).then((res) => {
    console.log("📜 LOG > rpc?.sendRPC > res:", res);
  });
  console.log("📜 LOG > rpc?.sendRPC > rpc:", rpc);

  const signer = useMemo(() => {
    return web3.getSigner().connectUnchecked();
  }, [web3, account]);

  const initialAccountState = () => ({
    extEnabled: false,
  });
  const [accountState, setAccountState] = useState<AccountState<Network>>(
    initialAccountState
  );

  const ext = useMemo(
    () => new Contract(networkConfig.extAddress, networkConfig.extAbi, signer),
    [signer]
  );
  const comet = useMemo(
    () => new Contract(networkConfig.rootsV3.comet, Comet, signer),
    [signer]
  );

  async function enableExt() {
    console.log("enabling ext");
    await comet.allow(ext.address, true);
    console.log("enabled ext");
  }

  async function disableExt() {
    console.log("disabling ext");
    await comet.allow(ext.address, false);
    console.log("disabling ext");
  }

  return (
    <div className="page home">
      <div className="container">
        <div className="masthead L1">
          <h1 className="L0 heading heading--emphasized">
            Wido Collateral Swaps
          </h1>
          {accountState.extEnabled ? (
            <button
              className="button button--large button--supply"
              onClick={disableExt}
            >
              <CircleCheckmark />
              <label>Enabled</label>
            </button>
          ) : (
            <button
              className="button button--large button--supply"
              onClick={enableExt}
            >
              Enable
            </button>
          )}
        </div>
        <div className="home__content">
          <div className="home__form">
            <div className="panel">
              <div className="panel__row">
                <h6 className="L2 heading text-color--1">Swap collateral</h6>
              </div>
              <div className="panel__column">
                <label className="label text-color--2">
                  Collateral to swap
                </label>
                <button className="button dropdown">
                  <span>WETH</span>
                  <CaretDown />
                </button>
              </div>
              <div className="panel__column">
                <label className="label text-color--2">Amount</label>
                <div className="action-input-view__input">8.5213123</div>
              </div>
              <div className="panel__row panel__row__center">
                <ArrowDown className="svg--icon--2" />
              </div>
              <div className="panel__column">
                <label className="label text-color--2">
                  Collateral to obtain
                </label>
                <button className="dropdown">WBTC</button>
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
                    <label className="label text-color--2">
                      Borrow Capacity
                    </label>
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
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ({ rpc, web3 }: AppProps) => {
  let timer = usePoll(10000);
  const [account, setAccount] = useState<string | null>(null);
  const [networkConfig, setNetworkConfig] = useState<
    NetworkConfig<Network> | "unsupported" | null
  >(null);
  console.log("📜 LOG > networkConfig:", networkConfig);

  useAsyncEffect(async () => {
    let accounts = await web3.listAccounts();
    if (accounts.length > 0) {
      let [account] = accounts;
      setAccount(account);
    }
  }, [web3, timer]);

  useAsyncEffect(async () => {
    let networkWeb3 = await web3.getNetwork();
    let network = getNetworkById(networkWeb3.chainId);
    if (network) {
      setNetworkConfig(getNetworkConfig(network));
    } else {
      setNetworkConfig("unsupported");
    }
  }, [web3, timer]);

  if (networkConfig && account) {
    if (networkConfig === "unsupported") {
      return <div>Unsupported network...</div>;
    } else {
      return (
        <App
          rpc={rpc}
          web3={web3}
          account={account}
          networkConfig={networkConfig}
        />
      );
    }
  } else {
    return <div>Loading...</div>;
  }
};
