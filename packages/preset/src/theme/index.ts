
type Colors = {
  primary,
  success,
  
}
const calcTheme = () => {

}


const defaultTheme = {
  colors: {
    primary: 'var(--color-primary, #1677FF)',
    primaryHover: 'var(--color-primary-hover, #4096ff)',
    success: 'var(--color-success, #52C41A)',
    warning:  'var(--color-warning, #FAAD14)',
    error:  'var(--color-error, #FF4D4F)',
    link: 'var(--color-link, --color-primary, #1677FF)',
  },
  radius: {
    small: 'var(--radius-small, 2px)',
    DEFAULT: 'var(--radius-medium, 4px)',
    large: 'var(--radius-lg, 6px)',
  }
}
export default defaultTheme;
// export default theme;