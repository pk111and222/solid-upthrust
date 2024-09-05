
export type Option = { 
  weightRatioMap: Record<number, number>
  stepFactor: number; 
  len?: number; 
  minSafety?: number 
  maxSafety?: number
}

const BASIC_WEIGHT_RATIO_MAP = {1: 1, 2: 2, 3: 4, 4: 4, 5: 6, 6: 6, 7: 10, 8: 10}

export function getSequence (value: number, option: Option) {
  const len = option.len ?? 9 
  const afterAndBeforeNumbers = Math.floor(len / 2)
  const stepFactor = option.stepFactor ?? 10
  const minSafarty = option.minSafety ?? 0
  const maxSafarty = option.maxSafety ?? 99999
  const weightRatioMap = option.weightRatioMap ?? BASIC_WEIGHT_RATIO_MAP
  const ladder = Math.ceil(value / stepFactor)
  const baseStep = weightRatioMap[ladder]
  const beforeNumbers = Array.from({length: afterAndBeforeNumbers}, (_, i) => {
    const v = value - (afterAndBeforeNumbers - i) * baseStep
    if ( v <= minSafarty ) return minSafarty
    return v
  })
  const afterNumbers = Array.from({length: afterAndBeforeNumbers}, (_, i) => {
    const v = value + i * baseStep
    if( v >= maxSafarty) return maxSafarty
    return v
  })
  const numbers = [...beforeNumbers, value, ...afterNumbers]
  return numbers
} 