import React from "react";
import { Label } from './Label';
import { LabelValue } from './LabelValue';
import { Position } from 'types/index';

interface Props {
  currentPosition: Position | undefined
  predictedPosition: Position | undefined
}

export function PositionSummary({ currentPosition, predictedPosition }: Props) {
  const format = (number: number): string => {
    if(!number) return ""
    return number.toFixed(4)
  }

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
          {
            currentPosition ? <LabelValue text={format(currentPosition.collateralValue)}/> : null
          }
        </td>
        <td>
          {
            predictedPosition ? <LabelValue text={format(predictedPosition.collateralValue)}/> : null
          }
        </td>
      </tr>
      <tr>
        <td>
          <Label text="Liquidation Point"/>
        </td>
        <td>
          {
            currentPosition ? <LabelValue text={format(currentPosition.liquidationPoint)}/> : null
          }
        </td>
        <td>
          {
            predictedPosition ? <LabelValue text={format(predictedPosition.liquidationPoint)}/> : null
          }
        </td>
      </tr>
      <tr>
        <td>
          <Label text="Borrow Capacity"/>
        </td>
        <td>
          {
            currentPosition ? <LabelValue text={format(currentPosition.borrowCapacity)}/> : null
          }
        </td>
        <td>
          {
            predictedPosition ? <LabelValue text={format(predictedPosition.borrowCapacity)}/> : null
          }
        </td>
      </tr>
      <tr>
        <td>
          <Label text="Available to Borrow"/>
        </td>
        <td>
          {
            currentPosition ? <LabelValue text={format(currentPosition.borrowAvailable)}/> : null
          }
        </td>
        <td>
          {
            predictedPosition ? <LabelValue text={format(predictedPosition.borrowAvailable)}/> : null
          }
        </td>
      </tr>
      </tbody>
    </table>
  );
}
