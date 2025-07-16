import React, { memo } from "react";

const MAX_GUESTS: number = 99;

function canDecrement(value: number): boolean {
  return value > 0;
}

function canIncrement(value: number): boolean {
  return value < MAX_GUESTS;
}

function decrement(value: number): number {
  return canDecrement(value) ? value - 1 : value;
}

function increment(value: number): number {
  return canIncrement(value) ? value + 1 : value;
}

interface CounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const Counter = memo(function CounterMemo({label, value, onChange}: CounterProps) {
  return (
    <>
      <p>{label}</p>
      <button disabled={!canDecrement(value)} onClick={() => onChange(decrement(value))} >-</button>
      <p className="text-center">{value}</p>
      <button disabled={!canIncrement(value)} onClick={() => onChange(increment(value))} >+</button>
    </>
  );
});

export default Counter;