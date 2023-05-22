import React from "react";

interface Props {
  text: string
}

export function Label({ text }: Props) {
  return (
    <label className="label text-color--2">{text}</label>
  );
}
