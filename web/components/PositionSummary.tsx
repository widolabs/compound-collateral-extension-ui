import React from "react";
import { Label } from './Label';
import { LabelValue } from './LabelValue';

interface Props {
}

export function PositionSummary({}: Props) {
  return (
    <table className="pos__summary">
      <tbody>
      <tr>
        <td>
          <Label text="Position Summary"></Label>
        </td>
        <td>
          <Label text="Current"/>
        </td>
        <td>
          <Label text="Target"/>
        </td>
      </tr>
      <tr>
        <td>
          <Label text="Collateral Value"/>
        </td>
        <td>
          <LabelValue text="3,591.77"/>
        </td>
        <td>
          <LabelValue text="$3,591.77"/>
        </td>
      </tr>
      <tr>
        <td>
          <Label text="Liquidation Point"/>
        </td>
        <td>
          <LabelValue text="$1,185.28"/>
        </td>
        <td>
          <LabelValue text="$1,185.28"/>
        </td>
      </tr>
      <tr>
        <td>
          <Label text="Borrow Capacity"/>
        </td>
        <td>
          <LabelValue text="$2,945.25"/>
        </td>
        <td>
          <LabelValue text="$2,945.25"/>
        </td>
      </tr>
      <tr>
        <td>
          <Label text="Available to Borrow"/>
        </td>
        <td>
          <LabelValue text="$1,945.17"/>
        </td>
        <td>
          <LabelValue text="$1,945.17"/>
        </td>
      </tr>
      </tbody>
    </table>
  );
}
