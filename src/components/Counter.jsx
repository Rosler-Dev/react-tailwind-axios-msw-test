import { memo } from "react";

const MAX_GUESTS = 99;

function canDecrement(value) {
  return value > 0;
}

function canIncrement(value) {
  return value < MAX_GUESTS;
}

function decrement(value) {
  return canDecrement(value) ? value - 1 : value;
}

function increment(value) {
  return canIncrement(value) ? value + 1 : value;
}

const Counter = memo(({id, label, value, onChange}) => (
  <>
    <p>{label}</p>
    <button disabled={!canDecrement(value)} onClick={() => onChange(id, decrement(value))} >-</button>
    <p className="text-center">{value}</p>
    <button disabled={!canIncrement(value)} onClick={() => onChange(id, increment(value))} >+</button>
  </>
));

export default Counter