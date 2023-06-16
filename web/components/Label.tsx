import React from "react";

interface Props {
  text: string
  title?: string
  color?: string
}

export function Label({ text, title, color }: Props) {
  if (!color) {
    color = "2";
  }
  return (
    <label className={"label text-color--" + color} title={title}>{text}</label>
  );
}
