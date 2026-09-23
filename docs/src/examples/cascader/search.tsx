import Cascader from 'upthrust-ui/source/Cascader'
export default function Search() { return <Cascader aria-label="搜索地区" showSearch options={[{ value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }, { value: 'nb', label: '宁波' }] }, { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] }]} placeholder="输入城市或地区" /> }
