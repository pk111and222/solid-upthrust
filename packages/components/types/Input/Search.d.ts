import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { InputProps } from './index';
export interface SearchProps extends Omit<InputProps, 'onPressEnter'> {
    /** Callback on search (Enter key, clear button, or search button). */
    onSearch?: (value: string, event?: MouseEvent | KeyboardEvent, info?: {
        source: 'input' | 'clear';
    }) => void;
    /** Render a primary button with the given label instead of the bare icon. */
    enterButton?: JSX.Element | boolean;
    loading?: boolean;
}
/**
 * Input.Search — antd-aligned search input.
 *
 * Two modes (antd):
 *  - default: a magnify icon sits in the suffix slot (px-[7px] hit area;
 *    with the 4px affix gap this yields the symmetric 11px text↔frame
 *    spacing), Enter / click both fire onSearch.
 *  - enterButton: the input frame squares off its RIGHT corners and a
 *    PRIMARY button (squared LEFT corners) joins it via -ml-px — a single
 *    shared 1px divider, exactly antd's bordered group. Custom labels and
 *    the bare magnify button both use variant solid + color primary.
 */
declare const Search: Component<SearchProps>;
export default Search;
