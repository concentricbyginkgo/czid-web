import { NO_CONTENT_FALLBACK } from "~/components/ui/Table/constants";

// some of the numerical values in the table come in already cast as strings
const canValueBeNumber = (value: string) => !isNaN(Number(value));

// return true if the value is a non-empty string that is not numerical
export const shouldShowTooltip = value => {
  return !canValueBeNumber(value) && value !== NO_CONTENT_FALLBACK;
};

type cutoffValueType = "Perfect" | "Strict" | "Nudged" | "-";
const cutoffValueOrder: cutoffValueType[] = [
  "Perfect",
  "Strict",
  "Nudged",
  "-",
];

export const sortCutoffCompoundStringFn = (
  a: cutoffValueType,
  b: cutoffValueType,
) => {
  const aIdx = cutoffValueOrder.indexOf(a);
  const bIdx = cutoffValueOrder.indexOf(b);
  return aIdx - bIdx;
};

export const getFormattedCutoffStringValue = (rawValue: string) => {
  if (!rawValue) {
    return NO_CONTENT_FALLBACK;
  } else {
    const valueParts = rawValue.split(";").map(value => value.trim());
    // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'cutoffValueType'.ts(2345) - this is exactly what we're testing here
    if (!valueParts.every(valuePart => cutoffValueOrder.includes(valuePart))) {
      return rawValue;
    }
    valueParts.sort((a, b) =>
      sortCutoffCompoundStringFn(a as cutoffValueType, b as cutoffValueType),
    );
    return valueParts.filter(value => value.length > 0).join("; ");
  }
};

export const sortCutoffColumnFn = (a, b) => {
  /* we want to sort any rows with at least one "perfect"ly matched contig at the top;
    then any rows with at least one "strict"ly matched contig;
    then any rows with at least one "nudged" contig;
    all others at the bottom.

    within these groups, we currently sort at random
    because we have a mix of compound and single values, where sometimes a single value actually represents identical cutoff values for multiple contigs.
    this means that the total strength of the evidence is based on both the number of contigs and the cutoff values in a fairly complex way. we may want to revisit this in the future but this is a reasonable first pass.
    */

  // sometimes we get a string of multiple cutoff values, separated by semicolons
  const aVal: string = a.getValue("cutoff") || NO_CONTENT_FALLBACK;
  const bVal: string = b.getValue("cutoff") || NO_CONTENT_FALLBACK;
  const aVals = aVal.split(";");
  const bVals = bVal.split(";");

  // iterate through each value in preferred order until we find one that differentiates the two
  for (let idx = 0; idx < cutoffValueOrder.length; idx++) {
    const cutoffValue = cutoffValueOrder[idx];
    if (aVals.includes(cutoffValue) && !bVals.includes(cutoffValue)) {
      return 1;
    } else if (bVals.includes(cutoffValue) && !aVals.includes(cutoffValue)) {
      return -1;
    }
  }
  return 0;
};

// We get a lot of different kinds of values from the API, all of which need to
// end up as strings in the table. This function handles all the different cases.
export const getFormattedValueAsString = (
  rawValue: string | number | null | undefined,
) => {
  if (!rawValue) {
    // return placeholder string if value is false-y
    return NO_CONTENT_FALLBACK;
  } else if (typeof rawValue === "string" && !canValueBeNumber(rawValue)) {
    // if the value is a string which is not numerical, check for
    // compound strings separated by semicolons and sort them.
    // returns the original string if it is not compound
    const valueParts = rawValue.split(";").map(value => value.trim());
    valueParts.sort();

    return valueParts.filter(value => value.length > 0).join("; ");
  } else {
    // cast numbers as strings
    return String(rawValue);
  }
};