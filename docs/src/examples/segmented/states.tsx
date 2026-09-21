import Segmented from 'upthrust-ui/source/Segmented'
export default function States() {
 return <div class="px-3 flex flex-col gap-3"><Segmented aria-label="通栏布局" block options={['左侧','中间','右侧']} defaultValue="中间"/><Segmented aria-label="整组禁用" options={['可用','不可用']} disabled defaultValue="可用"/><p>block 让选项等宽铺满容器；整组禁用后不会进入 Tab 顺序。</p></div>
}
