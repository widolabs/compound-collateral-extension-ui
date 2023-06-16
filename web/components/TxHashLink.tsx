import React from "react";
import { ExternalLink } from '../Icons';

type TxHashLinkProps = {
  chainId: number
  txHash: string
};

export function TxHashLinkProps({
  chainId,
  txHash
}: TxHashLinkProps) {
  return (
    <>
      <a href={txUrl(txHash, chainId)} target="_blank" className="tx-link">
        {txHash.slice(0, 6)}...{txHash.slice(txHash.length - 6)} <ExternalLink className="svg--icon--2"/>
      </a>
    </>
  );
}

function txUrl(txHash: string, chainId: number): string {
  const url = explorerUrl(chainId);
  return url + txHash
}

function explorerUrl(chainId: number): string {
  switch (chainId) {
    case 1:
      return "https://etherscan.io/tx/";
    case 137:
      return "https://polygonscan.com/tx/";
    case 42161:
      return "https://arbiscan.io/tx/";
    default:
      throw new Error("Not supported")
  }
}
