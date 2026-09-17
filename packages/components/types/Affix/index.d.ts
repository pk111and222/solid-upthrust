import { JSX } from '@solidjs/web';
import { AffixConfig, AffixIns } from 'upthrust-competence';
export interface AffixProps extends AffixConfig {
    children: JSX.Element;
    zIndex?: number;
    class?: string;
    style?: JSX.CSSProperties;
    affixClass?: string;
    ref?: (instance: AffixIns) => void;
}
declare const Affix: (props: AffixProps) => JSX.Element;
export default Affix;
