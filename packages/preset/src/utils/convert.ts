// Convert camelCase to kebab-case
export function camelToHyphen(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

// Separate css strings and extract values and units.
export function splitCssAndExtractUnit(cssValue: string) {
  const numberRegex = /^(-?\d+(?:\.\d+)?)/;
  const numberMatch = cssValue.match(numberRegex);
  let number = numberMatch? numberMatch[0] : null;
  let unit = cssValue.replace(numberRegex, '').trim() || null;
  return { number: Number(number), unit };
}
