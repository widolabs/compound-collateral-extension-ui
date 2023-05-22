import React from "react";

interface Props {
  text: string
}

export function LabelValue({ text }: Props) {
  return (
    <label className="label text-color--1">{text}</label>
  );
}
