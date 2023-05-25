import React from "react";

interface Props {
  text: string
  title?: string
}

export function Label({ text, title }: Props) {
  return (
    <label className="label text-color--2" title={title}>{text}</label>
  );
}
