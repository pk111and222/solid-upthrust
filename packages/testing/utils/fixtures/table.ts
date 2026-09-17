import type { TableColumnDef } from '../../../competence/src/table/types'
export interface Person { key: string | number; name: string; age: number; team: string; disabled?: boolean; children?: Person[]; profile?: { score: number } }
export const people: Person[] = [
  { key: 0, name: 'Ada', age: 30, team: 'A', profile: { score: 5 } },
  { key: 'b', name: 'Ben', age: 20, team: 'B' },
  { key: 'c', name: 'Chen', age: 40, team: 'A' },
  { key: 'd', name: 'Dora', age: 20, team: 'B', disabled: true },
  { key: 'e', name: 'Eli', age: 50, team: 'A' },
]
export const columns: TableColumnDef<Person>[] = [
  { dataIndex: 'name', title: 'Name', sorter: 'auto' },
  { dataIndex: 'age', title: 'Age', sorter: 'auto', aggregation: 'sum', width: 100, minWidth: 60, maxWidth: 240 },
  { dataIndex: 'team', title: 'Team', onFilter: (value, record) => record.team === value, filters: [{ text: 'A', value: 'A' }, { text: 'B', value: 'B' }] },
]
export const treePeople: Person[] = [
  { key: 'p', name: 'Parent', age: 60, team: 'P', children: [
    { key: 'a', name: 'Ada', age: 10, team: 'A' },
    { key: 'b', name: 'Ben', age: 20, team: 'B' },
    { key: 'disabled', name: 'Disabled', age: 30, team: 'D', disabled: true, children: [{ key: 'locked', name: 'Locked', age: 1, team: 'D' }] },
  ] },
  { key: 'q', name: 'Other', age: 70, team: 'Q' },
]
