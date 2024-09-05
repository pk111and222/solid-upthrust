// Gap between each container and gap
import { isFunction, splitCssAndExtractUnit } from '../utils'
import { getSequence } from '../utils/sequence'

const BASE_SIZE = '16px'

export type GapTheme = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export function createGapTheme (size?: string | number, customLogic?: (value: string | number) => GapTheme) {
  if(isFunction(customLogic)) return customLogic(size)
  return generateSizeLevels(size ?? BASE_SIZE)
}

// px类型
function generateSizeByPx(value: number, unit?: string) {
  const weightRatio = {1: 1, 2: 2, 3: 4, 4: 4, 5: 6, 6: 6, 7: 10, 8: 10}
  return getSequence(value, {
    len: 5,
    weightRatioMap: weightRatio,
    stepFactor: 10,
    minSafety: 2,
    maxSafety: 100
  }).map(e => `${e}${unit ? unit : ''}`)
}

// em 或者rem类型
function generateSizeByEm(value: number, unit: string) {
  const weightRatio = {1: 0.175, 2: 0.175, 3: 0.175, 4: 0.175, 5: 0.175, 6: 0.25, 7: 0.25, 8: 0.25, 9: 0.375, 10: 0.375, 11: 0.375, 12: 0.5, 13: 0.5, 14: 0.5}
  return getSequence(value, {
    len: 5,
    weightRatioMap: weightRatio,
    stepFactor: 0.25,
    minSafety: 0.125,
    maxSafety: 28
  }).map(e => `${e}${unit}`)
}

export function generateSizeLevels(base: string | number): GapTheme {
  let sizeSet: string[] = []
  let data = `${base}`
  if(typeof base === 'number') {
    sizeSet = generateSizeByPx(base, 'px')
  } else {
    const {number, unit} = splitCssAndExtractUnit(data)
    if(!unit) {
      sizeSet = generateSizeByPx(number)
    } else {
      switch (unit) {
        case 'px':
          sizeSet = generateSizeByPx(number, 'px')
        case 'em':
          sizeSet = generateSizeByEm(number, 'em')
        case 'rem':
          sizeSet = generateSizeByEm(number, 'rem')
        default:
          sizeSet = generateSizeByPx(number, unit)
      }
    }
  }
  const index = sizeSet.indexOf(data);
  const start = Math.max(0, index - 2);
  const arr = sizeSet.slice(start, start + 5);
  return {
    xs: arr[0],
    sm: arr[1],
    md: arr[2],
    lg: arr[3],
    xl: arr[4]
  }
}