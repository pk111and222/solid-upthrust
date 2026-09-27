import { Component, createMemo, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createFormList, type FormListOperations } from 'upthrust-competence'
import { FormListContext, useFormContext, useFormListContext } from './context'

export interface FormListProps {
  /** List name path (relative to any enclosing List). */
  name: string | (string | number)[]
  initialValue?: unknown
  children: (
    fields: () => { name: number; key: number; isListField: true }[],
    operations: FormListOperations,
  ) => JSX.Element
}

/**
 * Form.List — renders a keyed row per list entry. children receives the
 * reactive field descriptors and the add/remove/move operations.
 *
 * Row keys come from the headless keyManager, so rows survive add/remove/move
 * without remounting (focus and animations preserved). Nested lists compose
 * their store prefix from the enclosing ListContext.
 */
const FormList: Component<FormListProps> = props => {
  const formCtx = useFormContext()
  const parentListCtx = useFormListContext()

  if (!formCtx) {
    throw new Error('[upthrust-ui] Form.List must be rendered inside a <Form> (or use the headless createFormList from upthrust-competence).')
  }

  // Full store prefix = enclosing list prefix + own name.
  const ownName = Array.isArray(props.name) ? props.name : [props.name]
  const fullName = parentListCtx
    ? parentListCtx.resolvePath(ownName)
    : createMemo<(string | number)[]>(() => ownName)

  // untrack: component bodies run untracked in Solid 2 — reading the form()
  // memo directly here would trip STRICT_READ_UNTRACKED in dev. The form
  // instance is static for the List's lifetime.
  const list = createFormList(untrack(() => formCtx.form()), {
    get name() { return fullName() },
    get initialValue() { return props.initialValue },
    get rules() { return undefined },
    get preserve() { return undefined },
  })

  // Inner rows/fields resolve stable keys through the closest list.
  const getKey = (namePath: (string | number)[]): [number, (string | number)[]] => {
    const rowIndex = typeof namePath[0] === 'number' ? namePath[0] : -1
    return [list.fields()[rowIndex]?.key ?? 0, namePath.slice(rowIndex >= 0 ? 1 : 0)]
  }

  const resolvePath = (namePath: (string | number)[]) => {
    const [key, relativePath] = getKey(namePath)
    const hasRowIndex = typeof namePath[0] === 'number'
    return () => {
      const currentIndex = list.fields().find(field => field.key === key)?.name
      return !hasRowIndex || currentIndex === undefined
        ? [...fullName(), ...relativePath]
        : [...fullName(), currentIndex, ...relativePath]
    }
  }

  return (
    <FormListContext value={{ prefixName: fullName, getKey, resolvePath }}>
      {props.children(list.fields, list.operations)}
    </FormListContext>
  )
}

export default FormList
