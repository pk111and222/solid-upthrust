import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/@fs/Users/zhangchen327/code/github/pk111and222/solid-upthrust/packages/components/lib/Form/Item.tsx");import { template as _$template } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
import { insert as _$insert } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
import { memo as _$memo } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
import { createComponent as _$createComponent } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
import { style as _$style } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
import { className as _$className } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
import { effect as _$effect } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
import { setAttribute as _$setAttribute } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
var _tmpl$ = /* @__PURE__ */ _$template(`<div>`);
var _tmpl$2 = /* @__PURE__ */ _$template(`<span>*`);
var _tmpl$3 = /* @__PURE__ */ _$template(`<span>:`);
var _tmpl$4 = /* @__PURE__ */ _$template(`<span>(可选)`);
var _tmpl$5 = /* @__PURE__ */ _$template(`<span>`);
var _tmpl$6 = /* @__PURE__ */ _$template(`<div><label><!><!><!><!><!>`);
var _tmpl$7 = /* @__PURE__ */ _$template(`<span class=i-mdi-close-circle>`);
var _tmpl$8 = /* @__PURE__ */ _$template(`<span><span>`);
var _tmpl$9 = /* @__PURE__ */ _$template(`<div><div>`);
var _tmpl$10 = /* @__PURE__ */ _$template(`<div><div><div><div>`);
var _tmpl$11 = /* @__PURE__ */ _$template(`<span class=i-mdi-alert>`);
var _tmpl$12 = /* @__PURE__ */ _$template(`<span class="i-mdi-loading animate-spin-upthrust">`);
var _tmpl$13 = /* @__PURE__ */ _$template(`<span class=i-mdi-check-circle>`);
import { $$component as _$$component } from "/node_modules/.vite/deps/solid-js_refresh.js?v=77ba22d8";
import { $$refresh as _$$refresh } from "/node_modules/.vite/deps/solid-js_refresh.js?v=77ba22d8";
import { $$registry as _$$registry } from "/node_modules/.vite/deps/solid-js_refresh.js?v=77ba22d8";
import { Show, createMemo, merge, untrack } from "/node_modules/.vite/deps/solid-js.js?v=77ba22d8";
import { For } from "/node_modules/.vite/deps/@solidjs_web.js?v=77ba22d8";
import { twMerge } from "/node_modules/.vite/deps/tailwind-merge.js?v=d94b2d1c";
import { createFormField, isRequiredRule } from "/@fs/Users/zhangchen327/code/github/pk111and222/solid-upthrust/packages/competence/src/index.ts";
import { FormItemContext } from "/@fs/Users/zhangchen327/code/github/pk111and222/solid-upthrust/packages/components/lib/Input/context.ts";
import { useFormContext, useFormListContext } from "/@fs/Users/zhangchen327/code/github/pk111and222/solid-upthrust/packages/components/lib/Form/context.ts";
import { formItemClass, formItemColonClass, formItemControlClass, formItemControlContentClass, formItemControlInputClass, formItemExplainClass, formItemExplainItemClass, formItemExtraClass, formItemFeedbackIconClass, formItemFeedbackIconWrapClass, formItemLabelClass, formItemLabelWrapClass, formItemOptionalMarkClass, formItemRequiredMarkClass, formItemTooltipClass } from "/@fs/Users/zhangchen327/code/github/pk111and222/solid-upthrust/packages/components/lib/Form/styles.ts";
import Tooltip from "/@fs/Users/zhangchen327/code/github/pk111and222/solid-upthrust/packages/components/lib/Tooltip/index.tsx";
/** antd trims a trailing user-supplied colon (ASCII or full-width) from labels. */
const trimColon = (label) => typeof label === "string" ? label.replace(/[:|：]\s*$/, "") : label;
const _REGISTRY = _$$registry();
const FormItem = _$$component(_REGISTRY, "FormItem", (rawProps) => {
	const props = merge({}, rawProps);
	const formCtx = useFormContext();
	const listCtx = useFormListContext();
	// A field needs a store. Outside <Form> the headless layer is the intended
	// usage path — catch the wiring mistake with a clear message instead of a
	// context crash from deep inside createFormField.
	if (!formCtx) {
		throw new Error("[upthrust-ui] Form.Item must be rendered inside a <Form> (or use the headless createFormField from upthrust-competence).");
	}
	// Resolve the namePath: List prefix + own name.
	const ownName = props.name === undefined ? undefined : Array.isArray(props.name) ? props.name : [props.name];
	const resolvedListPath = listCtx && ownName !== undefined ? listCtx.resolvePath(ownName) : undefined;
	const namePath = createMemo(() => {
		if (ownName === undefined) return [];
		if (resolvedListPath) return resolvedListPath();
		return ownName;
	});
	// untrack: component bodies run untracked in Solid 2 — reading the form()
	// memo directly here would trip STRICT_READ_UNTRACKED in dev. The form
	// instance is static for the Item's lifetime (the form prop never swaps),
	// so a one-time untracked read is semantically exact.
	const field = createFormField(untrack(() => formCtx.form()), {
		get name() {
			return props.name === undefined ? undefined : namePath();
		},
		get rules() {
			return props.rules;
		},
		get initialValue() {
			return props.initialValue;
		},
		get dependencies() {
			const rowPrefix = listCtx ? namePath().slice(0, -1) : [];
			return props.dependencies?.map((dependency) => [...rowPrefix, ...Array.isArray(dependency) ? dependency : [dependency]]);
		},
		get validateTrigger() {
			return props.validateTrigger ?? formCtx?.validateTrigger();
		},
		get validateFirst() {
			return props.validateFirst;
		},
		get validateDebounce() {
			return props.validateDebounce;
		},
		get messageVariables() {
			return props.messageVariables;
		},
		get normalize() {
			return props.normalize;
		},
		get getValueFromEvent() {
			return props.getValueFromEvent;
		},
		get preserve() {
			return props.preserve;
		},
		get disabled() {
			return props.disabled;
		},
		get onReset() {
			return props.onReset;
		}
	});
	// Resolve the DOM id: htmlFor > form name + namePath.
	const itemId = createMemo(() => {
		if (props.htmlFor) return props.htmlFor;
		if (props.name === undefined) return undefined;
		return `upthrust-form-item-${namePath().join("-")}`;
	});
	const layout = () => formCtx.layout?.() ?? "horizontal";
	const size = () => formCtx.size();
	// Required asterisk: antd requiredMark resolves per item —
	// form-level mark (true/false/'optional') × item required state.
	const itemRequired = createMemo(() => props.required ?? isRequiredRule(props.rules, props.name));
	const formRequiredMark = () => formCtx.requiredMark?.() ?? true;
	// show the `*`: form mark is truthy AND the item is required
	const showRequiredMark = createMemo(() => formRequiredMark() !== false && itemRequired());
	// show `(optional)`: form mark is 'optional' AND the item is NOT required
	const showOptionalMark = createMemo(() => formRequiredMark() === "optional" && !itemRequired());
	const showColon = createMemo(() => {
		if (layout() === "vertical") return false;
		if (props.colon !== undefined) return props.colon;
		return formCtx.colon?.() ?? true;
	});
	// Effective validate status: prop override > field state.
	const validateStatus = createMemo(() => {
		if (props.validateStatus) return props.validateStatus;
		const meta = field.meta();
		if (meta.validating) return "validating";
		if (meta.errors.length) return "error";
		if (meta.warnings.length) return "warning";
		if (meta.validated && meta.touched) return "success";
		return undefined;
	});
	const helpMessage = createMemo(() => {
		if (props.help !== undefined) return props.help;
		const errors = field.errors();
		if (errors.length) return _$createComponent(For, {
			each: errors,
			children: (msg) => (() => {
				var _el$ = _tmpl$();
				_$insert(_el$, msg);
				_$effect(() => formItemExplainItemClass(), (_v$, _$p) => {
					_$className(_el$, _v$, _$p);
				});
				return _el$;
			})()
		});
		const warnings = field.warnings();
		if (warnings.length) return _$createComponent(For, {
			each: warnings,
			children: (msg) => (() => {
				var _el$2 = _tmpl$();
				_$insert(_el$2, msg);
				_$effect(() => formItemExplainItemClass(), (_v$, _$p) => {
					_$className(_el$2, _v$, _$p);
				});
				return _el$2;
			})()
		});
		return undefined;
	});
	const hasLabel = () => props.label !== undefined || props.tooltip !== undefined;
	const control = {
		value: () => {
			formCtx.form().resetCountSignal();
			return field.value();
		},
		onChange: (value, event) => {
			// Form widgets pass the value directly; event is advisory.
			void event;
			field.onChange(value);
		},
		validateStatus,
		id: itemId,
		disabled: () => props.disabled ?? formCtx?.disabled(),
		size: () => formCtx?.size()
	};
	const renderChildren = () => {
		if (typeof props.children === "function") {
			return props.children(field.value(), formCtx.form());
		}
		return props.children;
	};
	// Fixed label column width — an inline style, because a runtime CSS length
	// (e.g. '96px') can't be a static UnoCSS class (arbitrary values built at
	// runtime are invisible to the extractor).
	const labelWidth = () => layout() === "horizontal" ? props.labelWidth ?? formCtx.labelWidth?.() : undefined;
	const labelNode = _$createComponent(Show, {
		get when() {
			return hasLabel();
		},
		get children() {
			var _el$3 = _tmpl$6();
			var _el$4 = _el$3.firstChild;
			var _el$6 = _el$4.firstChild;
			var _el$7 = _el$6.nextSibling;
			var _el$9 = _el$7.nextSibling;
			var _el$11 = _el$9.nextSibling;
			var _el$13 = _el$11.nextSibling;
			_$insert(_el$4, _$createComponent(Show, {
				get when() {
					return showRequiredMark();
				},
				get children() {
					var _el$5 = _tmpl$2();
					_$effect(() => formItemRequiredMarkClass(), (_v$, _$p) => {
						_$className(_el$5, _v$, _$p);
					});
					return _el$5;
				}
			}), _el$6);
			_$insert(_el$4, () => {
				return trimColon(props.label);
			}, _el$7);
			_$insert(_el$4, _$createComponent(Show, {
				get when() {
					return _$memo(() => {
						return !!(showColon() && props.label !== undefined);
					})() ? props.label !== "" : showColon() && props.label !== undefined;
				},
				get children() {
					var _el$8 = _tmpl$3();
					_$effect(() => formItemColonClass(), (_v$, _$p) => {
						_$className(_el$8, _v$, _$p);
					});
					return _el$8;
				}
			}), _el$9);
			_$insert(_el$4, _$createComponent(Show, {
				get when() {
					return showOptionalMark();
				},
				get children() {
					var _el$10 = _tmpl$4();
					_$effect(() => formItemOptionalMarkClass(), (_v$, _$p) => {
						_$className(_el$10, _v$, _$p);
					});
					return _el$10;
				}
			}), _el$11);
			_$insert(_el$4, _$createComponent(Show, {
				get when() {
					return props.tooltip !== undefined;
				},
				keyed: true,
				get children() {
					return _$createComponent(Tooltip, {
						get title() {
							return props.tooltip;
						},
						get children() {
							var _el$12 = _tmpl$5();
							_$effect(() => twMerge("i-mdi-help-circle-outline", formItemTooltipClass()), (_v$, _$p) => {
								_$className(_el$12, _v$, _$p);
							});
							return _el$12;
						}
					});
				}
			}), _el$13);
			_$effect(() => {
				return {
					e: labelWidth() ? {
						"flex-basis": labelWidth(),
						width: labelWidth()
					} : undefined,
					t: formItemLabelWrapClass({
						layout: layout(),
						labelAlign: props.labelAlign ?? formCtx.labelAlign(),
						labelWrap: props.labelWrap ?? formCtx.labelWrap?.()
					}),
					a: formItemLabelClass({ size: size() }),
					o: itemId()
				};
			}, ({ e, t, a, o }, _p$) => {
				_$style(_el$3, e, _p$?.e);
				_$className(_el$3, t, _p$?.t);
				_$className(_el$4, a, _p$?.a);
				o !== _p$?.o && _$setAttribute(_el$4, "for", o);
			});
			return _el$3;
		}
	});
	var _el$14 = _tmpl$10();
	var _el$15 = _el$14.firstChild;
	var _el$16 = _el$15.firstChild;
	var _el$17 = _el$16.firstChild;
	_$insert(_el$14, labelNode, _el$14.firstChild);
	_$insert(_el$17, _$createComponent(FormItemContext, {
		value: control,
		get children() {
			return renderChildren();
		}
	}));
	_$insert(_el$16, _$createComponent(Show, {
		get when() {
			return _$memo(() => {
				return !!props.hasFeedback;
			})() ? validateStatus() : props.hasFeedback;
		},
		get children() {
			var _el$18 = _tmpl$8();
			var _el$19 = _el$18.firstChild;
			_$insert(_el$19, _$createComponent(Show, {
				get when() {
					return validateStatus() === "error";
				},
				get fallback() {
					return _$createComponent(Show, {
						get when() {
							return validateStatus() === "warning";
						},
						get fallback() {
							return _$createComponent(Show, {
								get when() {
									return validateStatus() === "validating";
								},
								get fallback() {
									return _tmpl$13();
								},
								get children() {
									return _tmpl$12();
								}
							});
						},
						get children() {
							return _tmpl$11();
						}
					});
				},
				get children() {
					return _tmpl$7();
				}
			}));
			_$effect(() => {
				return {
					e: formItemFeedbackIconWrapClass({ size: size() }),
					t: formItemFeedbackIconClass(validateStatus())
				};
			}, ({ e, t }, _p$) => {
				_$className(_el$18, e, _p$?.e);
				_$className(_el$19, t, _p$?.t);
			});
			return _el$18;
		}
	}), null);
	_$insert(_el$15, _$createComponent(Show, {
		get when() {
			return helpMessage() !== undefined || props.extra !== undefined;
		},
		get children() {
			var _el$21 = _tmpl$9();
			var _el$22 = _el$21.firstChild;
			_$insert(_el$22, helpMessage);
			_$insert(_el$21, _$createComponent(Show, {
				get when() {
					return props.extra !== undefined;
				},
				get children() {
					var _el$23 = _tmpl$();
					_$insert(_el$23, () => {
						return props.extra;
					});
					_$effect(() => formItemExtraClass(), (_v$, _$p) => {
						_$className(_el$23, _v$, _$p);
					});
					return _el$23;
				}
			}), null);
			_$effect(() => formItemExplainClass(validateStatus() === "error" ? "error" : validateStatus() === "warning" ? "warning" : "default"), (_v$, _$p) => {
				_$className(_el$22, _v$, _$p);
			});
			return _el$21;
		}
	}), null);
	_$effect(() => {
		return {
			e: formItemClass({
				layout: layout(),
				hidden: props.hidden,
				class_: props.class
			}),
			t: formItemControlClass({ layout: layout() }),
			a: formItemControlInputClass({ size: size() }),
			o: formItemControlContentClass()
		};
	}, ({ e, t, a, o }, _p$) => {
		_$className(_el$14, e, _p$?.e);
		_$className(_el$15, t, _p$?.t);
		_$className(_el$16, a, _p$?.a);
		_$className(_el$17, o, _p$?.o);
	});
	return _el$14;
}, {
	location: "../packages/components/lib/Form/Item.tsx:78:43",
	signature: "8785a413",
	dependencies: () => ({
		merge,
		useFormContext,
		useFormListContext,
		Error,
		undefined,
		Array,
		createMemo,
		createFormField,
		untrack,
		isRequiredRule,
		For,
		formItemExplainItemClass,
		Show,
		formItemLabelWrapClass,
		formItemLabelClass,
		formItemRequiredMarkClass,
		trimColon,
		formItemColonClass,
		formItemOptionalMarkClass,
		Tooltip,
		twMerge,
		formItemTooltipClass,
		formItemClass,
		formItemControlClass,
		formItemControlInputClass,
		formItemControlContentClass,
		FormItemContext,
		formItemFeedbackIconWrapClass,
		formItemFeedbackIconClass,
		formItemExplainClass,
		formItemExtraClass
	})
});
export default FormItem;
if (import.meta.hot) {
	import.meta.hot.accept();
	_$$refresh("vite", import.meta.hot, _REGISTRY);
}

//# sourceMappingURL=data:application/json;base64,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QUFXO2NBQzFDQztRQUFNO2dCQUFNLHFCQUFxQjs7UUFBYztnQkFBVUM7O1FBQXpEO2dCQUNFQzs7UUFDQTs7TUFISjtjQUtFQzs7TUFDQTs7SUFQSjtZQVNFQzs7SUFDSztHQVpMOztRQUFPLDhCQUE4QixFQUFFLE1BQU0sT0FBTSxDQUFFO0tBQ25EQyxHQUFPLDBCQUEwQixnQkFBZ0I7O09BRG5EOztJQUNFOztHQUZWLE9BQ0VDOztFQWVLLEdBdEJUO0NBREYsaUJBMEJFQztFQUFNO1VBQU0sa0JBQWtCLGFBQWEsTUFBTSxVQUFVOztFQUEzRDtHQUNFO0dBQ0U7b0JBR0c7R0FKTCxpQkFNRUM7SUFBTTtZQUFNLE1BQU0sVUFBVTs7SUFBNUI7S0FDRTtLQUFBLHVCQUFnQzthQUFHLE1BQU07O0tBQXBDLGVBQU8sdUJBQVA7OztLQURQLE9BQ0VDOztJQUNLLEdBUlQ7R0FDTyxlQUFPLHFCQUNWLHFCQUFxQixVQUFVLFVBQVUscUJBQXFCLFlBQVksWUFBWSxhQURuRjs7O0dBRlQsT0FDRUM7O0VBVUssR0FyQ1Q7Q0FIRzs7TUFBTyxjQUFjO0lBQUUsUUFBUTtJQUFVLFFBQVEsTUFBTTtJQUFRLFFBQVEsTUFBTTtJQUFPO0dBR2xGQyxHQUFPLHFCQUFxQixFQUFFLFFBQVEsU0FBUSxDQUFFO0dBQzlDQyxHQUFPLDBCQUEwQixFQUFFLE1BQU0sT0FBTSxDQUFFO0dBQy9DQyxHQUFPOztLQUxiOztFQUdFO0VBQ0U7RUFDRTs7Q0FOYixPQUNFcEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOENKLGVBQWUiLCJuYW1lcyI6WyI8Rm9yIGVhY2g9e2Vycm9yc30+eyhtc2cpID0+IDxkaXYgY2xhc3M9e2Zvcm1JdGVtRXhwbGFpbkl0ZW1DbGFzcygpfT57bXNnfTwvZGl2Pn08L0Zvcj4iLCJlYWNoPXtlcnJvcnN9IiwiPEZvciBlYWNoPXt3YXJuaW5nc30+eyhtc2cpID0+IDxkaXYgY2xhc3M9e2Zvcm1JdGVtRXhwbGFpbkl0ZW1DbGFzcygpfT57bXNnfTwvZGl2Pn08L0Zvcj4iLCJlYWNoPXt3YXJuaW5nc30iLCI8U2hvdyB3aGVuPXtoYXNMYWJlbCgpfT5cbiAgICAgIDxkaXYgc3R5bGU9e2xhYmVsV2lkdGgoKSA/IHtcblx0XHRcImZsZXgtYmFzaXNcIjogbGFiZWxXaWR0aCgpLFxuXHRcdHdpZHRoOiBsYWJlbFdpZHRoKClcblx0fSA6IHVuZGVmaW5lZH0gY2xhc3M9e2Zvcm1JdGVtTGFiZWxXcmFwQ2xhc3Moe1xuXHRcdGxheW91dDogbGF5b3V0KCksXG5cdFx0bGFiZWxBbGlnbjogcHJvcHMubGFiZWxBbGlnbiA/PyBmb3JtQ3R4LmxhYmVsQWxpZ24oKSxcblx0XHRsYWJlbFdyYXA6IHByb3BzLmxhYmVsV3JhcCA/PyBmb3JtQ3R4LmxhYmVsV3JhcD8uKClcblx0fSl9PlxuICAgICAgICA8bGFiZWwgY2xhc3M9e2Zvcm1JdGVtTGFiZWxDbGFzcyh7IHNpemU6IHNpemUoKSB9KX0gZm9yPXtpdGVtSWQoKX0+XG4gICAgICAgICAgPFNob3cgd2hlbj17c2hvd1JlcXVpcmVkTWFyaygpfT5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPXtmb3JtSXRlbVJlcXVpcmVkTWFya0NsYXNzKCl9Pio8L3NwYW4+XG4gICAgICAgICAgPC9TaG93PlxuICAgICAgICAgIHt0cmltQ29sb24ocHJvcHMubGFiZWwpfVxuICAgICAgICAgIDxTaG93IHdoZW49e3Nob3dDb2xvbigpICYmIHByb3BzLmxhYmVsICE9PSB1bmRlZmluZWQgJiYgcHJvcHMubGFiZWwgIT09IFwiXCJ9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e2Zvcm1JdGVtQ29sb25DbGFzcygpfT46PC9zcGFuPlxuICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICA8U2hvdyB3aGVuPXtzaG93T3B0aW9uYWxNYXJrKCl9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e2Zvcm1JdGVtT3B0aW9uYWxNYXJrQ2xhc3MoKX0+KOWPr+mAiSk8L3NwYW4+XG4gICAgICAgICAgPC9TaG93PlxuICAgICAgICAgIDxTaG93IHdoZW49e3Byb3BzLnRvb2x0aXAgIT09IHVuZGVmaW5lZH0ga2V5ZWQ+XG4gICAgICAgICAgICA8VG9vbHRpcCB0aXRsZT17cHJvcHMudG9vbHRpcH0+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPXt0d01lcmdlKFwiaS1tZGktaGVscC1jaXJjbGUtb3V0bGluZVwiLCBmb3JtSXRlbVRvb2x0aXBDbGFzcygpKX0gLz5cbiAgICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgICA8L1Nob3c+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L2Rpdj5cbiAgICA8L1Nob3c+IiwiPFNob3cgd2hlbj17c2hvd1JlcXVpcmVkTWFyaygpfT5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPXtmb3JtSXRlbVJlcXVpcmVkTWFya0NsYXNzKCl9Pio8L3NwYW4+XG4gICAgICAgICAgPC9TaG93PiIsIjxzcGFuIGNsYXNzPXtmb3JtSXRlbVJlcXVpcmVkTWFya0NsYXNzKCl9Pio8L3NwYW4+IiwiPGxhYmVsIGNsYXNzPXtmb3JtSXRlbUxhYmVsQ2xhc3MoeyBzaXplOiBzaXplKCkgfSl9IGZvcj17aXRlbUlkKCl9PlxuICAgICAgICAgIDxTaG93IHdoZW49e3Nob3dSZXF1aXJlZE1hcmsoKX0+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz17Zm9ybUl0ZW1SZXF1aXJlZE1hcmtDbGFzcygpfT4qPC9zcGFuPlxuICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICB7dHJpbUNvbG9uKHByb3BzLmxhYmVsKX1cbiAgICAgICAgICA8U2hvdyB3aGVuPXtzaG93Q29sb24oKSAmJiBwcm9wcy5sYWJlbCAhPT0gdW5kZWZpbmVkICYmIHByb3BzLmxhYmVsICE9PSBcIlwifT5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPXtmb3JtSXRlbUNvbG9uQ2xhc3MoKX0+Ojwvc3Bhbj5cbiAgICAgICAgICA8L1Nob3c+XG4gICAgICAgICAgPFNob3cgd2hlbj17c2hvd09wdGlvbmFsTWFyaygpfT5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPXtmb3JtSXRlbU9wdGlvbmFsTWFya0NsYXNzKCl9Pijlj6/pgIkpPC9zcGFuPlxuICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICA8U2hvdyB3aGVuPXtwcm9wcy50b29sdGlwICE9PSB1bmRlZmluZWR9IGtleWVkPlxuICAgICAgICAgICAgPFRvb2x0aXAgdGl0bGU9e3Byb3BzLnRvb2x0aXB9PlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz17dHdNZXJnZShcImktbWRpLWhlbHAtY2lyY2xlLW91dGxpbmVcIiwgZm9ybUl0ZW1Ub29sdGlwQ2xhc3MoKSl9IC8+XG4gICAgICAgICAgICA8L1Rvb2x0aXA+XG4gICAgICAgICAgPC9TaG93PlxuICAgICAgICA8L2xhYmVsPiIsIjxTaG93IHdoZW49e3Nob3dDb2xvbigpICYmIHByb3BzLmxhYmVsICE9PSB1bmRlZmluZWQgJiYgcHJvcHMubGFiZWwgIT09IFwiXCJ9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e2Zvcm1JdGVtQ29sb25DbGFzcygpfT46PC9zcGFuPlxuICAgICAgICAgIDwvU2hvdz4iLCJzaG93Q29sb24oKSAmJiBwcm9wcy5sYWJlbCAhPT0gdW5kZWZpbmVkICYmIHByb3BzLmxhYmVsICE9PSBcIlwiIiwiPHNwYW4gY2xhc3M9e2Zvcm1JdGVtQ29sb25DbGFzcygpfT46PC9zcGFuPiIsIjxTaG93IHdoZW49e3Nob3dPcHRpb25hbE1hcmsoKX0+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz17Zm9ybUl0ZW1PcHRpb25hbE1hcmtDbGFzcygpfT4o5Y+v6YCJKTwvc3Bhbj5cbiAgICAgICAgICA8L1Nob3c+IiwiPHNwYW4gY2xhc3M9e2Zvcm1JdGVtT3B0aW9uYWxNYXJrQ2xhc3MoKX0+KOWPr+mAiSk8L3NwYW4+IiwiPFNob3cgd2hlbj17cHJvcHMudG9vbHRpcCAhPT0gdW5kZWZpbmVkfSBrZXllZD5cbiAgICAgICAgICAgIDxUb29sdGlwIHRpdGxlPXtwcm9wcy50b29sdGlwfT5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9e3R3TWVyZ2UoXCJpLW1kaS1oZWxwLWNpcmNsZS1vdXRsaW5lXCIsIGZvcm1JdGVtVG9vbHRpcENsYXNzKCkpfSAvPlxuICAgICAgICAgICAgPC9Ub29sdGlwPlxuICAgICAgICAgIDwvU2hvdz4iLCI8VG9vbHRpcCB0aXRsZT17cHJvcHMudG9vbHRpcH0+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPXt0d01lcmdlKFwiaS1tZGktaGVscC1jaXJjbGUtb3V0bGluZVwiLCBmb3JtSXRlbVRvb2x0aXBDbGFzcygpKX0gLz5cbiAgICAgICAgICAgIDwvVG9vbHRpcD4iLCI8c3BhbiBjbGFzcz17dHdNZXJnZShcImktbWRpLWhlbHAtY2lyY2xlLW91dGxpbmVcIiwgZm9ybUl0ZW1Ub29sdGlwQ2xhc3MoKSl9IC8+IiwiY2xhc3M9e2Zvcm1JdGVtTGFiZWxXcmFwQ2xhc3Moe1xuXHRcdGxheW91dDogbGF5b3V0KCksXG5cdFx0bGFiZWxBbGlnbjogcHJvcHMubGFiZWxBbGlnbiA/PyBmb3JtQ3R4LmxhYmVsQWxpZ24oKSxcblx0XHRsYWJlbFdyYXA6IHByb3BzLmxhYmVsV3JhcCA/PyBmb3JtQ3R4LmxhYmVsV3JhcD8uKClcblx0fSl9IiwiY2xhc3M9e2Zvcm1JdGVtTGFiZWxDbGFzcyh7IHNpemU6IHNpemUoKSB9KX0iLCJmb3I9e2l0ZW1JZCgpfSIsIjxkaXYgc3R5bGU9e2xhYmVsV2lkdGgoKSA/IHtcblx0XHRcImZsZXgtYmFzaXNcIjogbGFiZWxXaWR0aCgpLFxuXHRcdHdpZHRoOiBsYWJlbFdpZHRoKClcblx0fSA6IHVuZGVmaW5lZH0gY2xhc3M9e2Zvcm1JdGVtTGFiZWxXcmFwQ2xhc3Moe1xuXHRcdGxheW91dDogbGF5b3V0KCksXG5cdFx0bGFiZWxBbGlnbjogcHJvcHMubGFiZWxBbGlnbiA/PyBmb3JtQ3R4LmxhYmVsQWxpZ24oKSxcblx0XHRsYWJlbFdyYXA6IHByb3BzLmxhYmVsV3JhcCA/PyBmb3JtQ3R4LmxhYmVsV3JhcD8uKClcblx0fSl9PlxuICAgICAgICA8bGFiZWwgY2xhc3M9e2Zvcm1JdGVtTGFiZWxDbGFzcyh7IHNpemU6IHNpemUoKSB9KX0gZm9yPXtpdGVtSWQoKX0+XG4gICAgICAgICAgPFNob3cgd2hlbj17c2hvd1JlcXVpcmVkTWFyaygpfT5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPXtmb3JtSXRlbVJlcXVpcmVkTWFya0NsYXNzKCl9Pio8L3NwYW4+XG4gICAgICAgICAgPC9TaG93PlxuICAgICAgICAgIHt0cmltQ29sb24ocHJvcHMubGFiZWwpfVxuICAgICAgICAgIDxTaG93IHdoZW49e3Nob3dDb2xvbigpICYmIHByb3BzLmxhYmVsICE9PSB1bmRlZmluZWQgJiYgcHJvcHMubGFiZWwgIT09IFwiXCJ9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e2Zvcm1JdGVtQ29sb25DbGFzcygpfT46PC9zcGFuPlxuICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICA8U2hvdyB3aGVuPXtzaG93T3B0aW9uYWxNYXJrKCl9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e2Zvcm1JdGVtT3B0aW9uYWxNYXJrQ2xhc3MoKX0+KOWPr+mAiSk8L3NwYW4+XG4gICAgICAgICAgPC9TaG93PlxuICAgICAgICAgIDxTaG93IHdoZW49e3Byb3BzLnRvb2x0aXAgIT09IHVuZGVmaW5lZH0ga2V5ZWQ+XG4gICAgICAgICAgICA8VG9vbHRpcCB0aXRsZT17cHJvcHMudG9vbHRpcH0+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPXt0d01lcmdlKFwiaS1tZGktaGVscC1jaXJjbGUtb3V0bGluZVwiLCBmb3JtSXRlbVRvb2x0aXBDbGFzcygpKX0gLz5cbiAgICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgICA8L1Nob3c+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L2Rpdj4iLCI8ZGl2IGNsYXNzPXtmb3JtSXRlbUNsYXNzKHtcblx0XHRsYXlvdXQ6IGxheW91dCgpLFxuXHRcdGhpZGRlbjogcHJvcHMuaGlkZGVuLFxuXHRcdGNsYXNzXzogcHJvcHMuY2xhc3Ncblx0fSl9PlxuICAgICAge2xhYmVsTm9kZX1cblxuICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1Db250cm9sQ2xhc3MoeyBsYXlvdXQ6IGxheW91dCgpIH0pfT5cbiAgICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1Db250cm9sSW5wdXRDbGFzcyh7IHNpemU6IHNpemUoKSB9KX0+XG4gICAgICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1Db250cm9sQ29udGVudENsYXNzKCl9PlxuICAgICAgICAgICAgPEZvcm1JdGVtQ29udGV4dCB2YWx1ZT17Y29udHJvbH0+XG4gICAgICAgICAgICAgIHtyZW5kZXJDaGlsZHJlbigpfVxuICAgICAgICAgICAgPC9Gb3JtSXRlbUNvbnRleHQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPFNob3cgd2hlbj17cHJvcHMuaGFzRmVlZGJhY2sgJiYgdmFsaWRhdGVTdGF0dXMoKX0+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz17Zm9ybUl0ZW1GZWVkYmFja0ljb25XcmFwQ2xhc3MoeyBzaXplOiBzaXplKCkgfSl9PlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz17Zm9ybUl0ZW1GZWVkYmFja0ljb25DbGFzcyh2YWxpZGF0ZVN0YXR1cygpKX0+XG4gICAgICAgICAgICAgICAgPFNob3cgd2hlbj17dmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJlcnJvclwifSBmYWxsYmFjaz17PFNob3cgd2hlbj17dmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJ3YXJuaW5nXCJ9IGZhbGxiYWNrPXs8U2hvdyB3aGVuPXt2YWxpZGF0ZVN0YXR1cygpID09PSBcInZhbGlkYXRpbmdcIn0gZmFsbGJhY2s9ezxzcGFuIGNsYXNzPVwiaS1tZGktY2hlY2stY2lyY2xlXCIgLz59PlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaS1tZGktbG9hZGluZyBhbmltYXRlLXNwaW4tdXB0aHJ1c3RcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L1Nob3c+fT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpLW1kaS1hbGVydFwiIC8+XG4gICAgICAgICAgICAgICAgICA8L1Nob3c+fT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaS1tZGktY2xvc2UtY2lyY2xlXCIgLz5cbiAgICAgICAgICAgICAgICA8L1Nob3c+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L1Nob3c+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxTaG93IHdoZW49e2hlbHBNZXNzYWdlKCkgIT09IHVuZGVmaW5lZCB8fCBwcm9wcy5leHRyYSAhPT0gdW5kZWZpbmVkfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1FeHBsYWluQ2xhc3ModmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJlcnJvclwiID8gXCJlcnJvclwiIDogdmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJ3YXJuaW5nXCIgPyBcIndhcm5pbmdcIiA6IFwiZGVmYXVsdFwiKX0+XG4gICAgICAgICAgICAgIHtoZWxwTWVzc2FnZSgpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8U2hvdyB3aGVuPXtwcm9wcy5leHRyYSAhPT0gdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1FeHRyYUNsYXNzKCl9Pntwcm9wcy5leHRyYX08L2Rpdj5cbiAgICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9TaG93PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+IiwiPEZvcm1JdGVtQ29udGV4dCB2YWx1ZT17Y29udHJvbH0+XG4gICAgICAgICAgICAgIHtyZW5kZXJDaGlsZHJlbigpfVxuICAgICAgICAgICAgPC9Gb3JtSXRlbUNvbnRleHQ+IiwidmFsdWU9e2NvbnRyb2x9IiwiPFNob3cgd2hlbj17cHJvcHMuaGFzRmVlZGJhY2sgJiYgdmFsaWRhdGVTdGF0dXMoKX0+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz17Zm9ybUl0ZW1GZWVkYmFja0ljb25XcmFwQ2xhc3MoeyBzaXplOiBzaXplKCkgfSl9PlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz17Zm9ybUl0ZW1GZWVkYmFja0ljb25DbGFzcyh2YWxpZGF0ZVN0YXR1cygpKX0+XG4gICAgICAgICAgICAgICAgPFNob3cgd2hlbj17dmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJlcnJvclwifSBmYWxsYmFjaz17PFNob3cgd2hlbj17dmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJ3YXJuaW5nXCJ9IGZhbGxiYWNrPXs8U2hvdyB3aGVuPXt2YWxpZGF0ZVN0YXR1cygpID09PSBcInZhbGlkYXRpbmdcIn0gZmFsbGJhY2s9ezxzcGFuIGNsYXNzPVwiaS1tZGktY2hlY2stY2lyY2xlXCIgLz59PlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaS1tZGktbG9hZGluZyBhbmltYXRlLXNwaW4tdXB0aHJ1c3RcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L1Nob3c+fT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpLW1kaS1hbGVydFwiIC8+XG4gICAgICAgICAgICAgICAgICA8L1Nob3c+fT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaS1tZGktY2xvc2UtY2lyY2xlXCIgLz5cbiAgICAgICAgICAgICAgICA8L1Nob3c+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L1Nob3c+IiwicHJvcHMuaGFzRmVlZGJhY2sgJiYgdmFsaWRhdGVTdGF0dXMoKSIsIjxTaG93IHdoZW49e3ZhbGlkYXRlU3RhdHVzKCkgPT09IFwiZXJyb3JcIn0gZmFsbGJhY2s9ezxTaG93IHdoZW49e3ZhbGlkYXRlU3RhdHVzKCkgPT09IFwid2FybmluZ1wifSBmYWxsYmFjaz17PFNob3cgd2hlbj17dmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJ2YWxpZGF0aW5nXCJ9IGZhbGxiYWNrPXs8c3BhbiBjbGFzcz1cImktbWRpLWNoZWNrLWNpcmNsZVwiIC8+fT5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImktbWRpLWxvYWRpbmcgYW5pbWF0ZS1zcGluLXVwdGhydXN0XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9TaG93Pn0+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaS1tZGktYWxlcnRcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9TaG93Pn0+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImktbWRpLWNsb3NlLWNpcmNsZVwiIC8+XG4gICAgICAgICAgICAgICAgPC9TaG93PiIsIjxTaG93IHdoZW49e3ZhbGlkYXRlU3RhdHVzKCkgPT09IFwid2FybmluZ1wifSBmYWxsYmFjaz17PFNob3cgd2hlbj17dmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJ2YWxpZGF0aW5nXCJ9IGZhbGxiYWNrPXs8c3BhbiBjbGFzcz1cImktbWRpLWNoZWNrLWNpcmNsZVwiIC8+fT5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImktbWRpLWxvYWRpbmcgYW5pbWF0ZS1zcGluLXVwdGhydXN0XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9TaG93Pn0+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaS1tZGktYWxlcnRcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9TaG93PiIsIjxTaG93IHdoZW49e3ZhbGlkYXRlU3RhdHVzKCkgPT09IFwidmFsaWRhdGluZ1wifSBmYWxsYmFjaz17PHNwYW4gY2xhc3M9XCJpLW1kaS1jaGVjay1jaXJjbGVcIiAvPn0+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpLW1kaS1sb2FkaW5nIGFuaW1hdGUtc3Bpbi11cHRocnVzdFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvU2hvdz4iLCI8c3BhbiBjbGFzcz1cImktbWRpLWNoZWNrLWNpcmNsZVwiIC8+IiwiPHNwYW4gY2xhc3M9XCJpLW1kaS1sb2FkaW5nIGFuaW1hdGUtc3Bpbi11cHRocnVzdFwiIC8+IiwiPHNwYW4gY2xhc3M9XCJpLW1kaS1hbGVydFwiIC8+IiwiPHNwYW4gY2xhc3M9XCJpLW1kaS1jbG9zZS1jaXJjbGVcIiAvPiIsImNsYXNzPXtmb3JtSXRlbUZlZWRiYWNrSWNvbkNsYXNzKHZhbGlkYXRlU3RhdHVzKCkpfSIsIjxzcGFuIGNsYXNzPXtmb3JtSXRlbUZlZWRiYWNrSWNvbldyYXBDbGFzcyh7IHNpemU6IHNpemUoKSB9KX0+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPXtmb3JtSXRlbUZlZWRiYWNrSWNvbkNsYXNzKHZhbGlkYXRlU3RhdHVzKCkpfT5cbiAgICAgICAgICAgICAgICA8U2hvdyB3aGVuPXt2YWxpZGF0ZVN0YXR1cygpID09PSBcImVycm9yXCJ9IGZhbGxiYWNrPXs8U2hvdyB3aGVuPXt2YWxpZGF0ZVN0YXR1cygpID09PSBcIndhcm5pbmdcIn0gZmFsbGJhY2s9ezxTaG93IHdoZW49e3ZhbGlkYXRlU3RhdHVzKCkgPT09IFwidmFsaWRhdGluZ1wifSBmYWxsYmFjaz17PHNwYW4gY2xhc3M9XCJpLW1kaS1jaGVjay1jaXJjbGVcIiAvPn0+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpLW1kaS1sb2FkaW5nIGFuaW1hdGUtc3Bpbi11cHRocnVzdFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvU2hvdz59PlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImktbWRpLWFsZXJ0XCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvU2hvdz59PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpLW1kaS1jbG9zZS1jaXJjbGVcIiAvPlxuICAgICAgICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPiIsIjxTaG93IHdoZW49e2hlbHBNZXNzYWdlKCkgIT09IHVuZGVmaW5lZCB8fCBwcm9wcy5leHRyYSAhPT0gdW5kZWZpbmVkfT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1FeHBsYWluQ2xhc3ModmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJlcnJvclwiID8gXCJlcnJvclwiIDogdmFsaWRhdGVTdGF0dXMoKSA9PT0gXCJ3YXJuaW5nXCIgPyBcIndhcm5pbmdcIiA6IFwiZGVmYXVsdFwiKX0+XG4gICAgICAgICAgICAgIHtoZWxwTWVzc2FnZSgpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8U2hvdyB3aGVuPXtwcm9wcy5leHRyYSAhPT0gdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1FeHRyYUNsYXNzKCl9Pntwcm9wcy5leHRyYX08L2Rpdj5cbiAgICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9TaG93PiIsIjxTaG93IHdoZW49e3Byb3BzLmV4dHJhICE9PSB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPXtmb3JtSXRlbUV4dHJhQ2xhc3MoKX0+e3Byb3BzLmV4dHJhfTwvZGl2PlxuICAgICAgICAgICAgPC9TaG93PiIsIjxkaXYgY2xhc3M9e2Zvcm1JdGVtRXh0cmFDbGFzcygpfT57cHJvcHMuZXh0cmF9PC9kaXY+IiwiPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9e2Zvcm1JdGVtRXhwbGFpbkNsYXNzKHZhbGlkYXRlU3RhdHVzKCkgPT09IFwiZXJyb3JcIiA/IFwiZXJyb3JcIiA6IHZhbGlkYXRlU3RhdHVzKCkgPT09IFwid2FybmluZ1wiID8gXCJ3YXJuaW5nXCIgOiBcImRlZmF1bHRcIil9PlxuICAgICAgICAgICAgICB7aGVscE1lc3NhZ2UoKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPFNob3cgd2hlbj17cHJvcHMuZXh0cmEgIT09IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9e2Zvcm1JdGVtRXh0cmFDbGFzcygpfT57cHJvcHMuZXh0cmF9PC9kaXY+XG4gICAgICAgICAgICA8L1Nob3c+XG4gICAgICAgICAgPC9kaXY+IiwiY2xhc3M9e2Zvcm1JdGVtQ29udHJvbENsYXNzKHsgbGF5b3V0OiBsYXlvdXQoKSB9KX0iLCJjbGFzcz17Zm9ybUl0ZW1Db250cm9sSW5wdXRDbGFzcyh7IHNpemU6IHNpemUoKSB9KX0iLCJjbGFzcz17Zm9ybUl0ZW1Db250cm9sQ29udGVudENsYXNzKCl9Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIkl0ZW0udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgU2hvdywgY3JlYXRlTWVtbywgbWVyZ2UsIHVudHJhY2sgfSBmcm9tICdzb2xpZC1qcydcbmltcG9ydCB7IEZvciwgdHlwZSBKU1ggfSBmcm9tICdAc29saWRqcy93ZWInXG5pbXBvcnQgeyB0d01lcmdlIH0gZnJvbSAndGFpbHdpbmQtbWVyZ2UnXG5pbXBvcnQge1xuICB0eXBlIEZvcm1GaWVsZFJ1bGUsXG4gIHR5cGUgSW50ZXJuYWxOYW1lUGF0aCxcbiAgdHlwZSBOYW1lUGF0aCxcbiAgY3JlYXRlRm9ybUZpZWxkLFxuICBpc1JlcXVpcmVkUnVsZSxcbn0gZnJvbSAndXB0aHJ1c3QtY29tcGV0ZW5jZSdcbmltcG9ydCB7IEZvcm1JdGVtQ29udGV4dCB9IGZyb20gJy4uL0lucHV0L2NvbnRleHQnXG5pbXBvcnQgeyB1c2VGb3JtQ29udGV4dCwgdXNlRm9ybUxpc3RDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtcbiAgZm9ybUl0ZW1DbGFzcyxcbiAgZm9ybUl0ZW1Db2xvbkNsYXNzLFxuICBmb3JtSXRlbUNvbnRyb2xDbGFzcyxcbiAgZm9ybUl0ZW1Db250cm9sQ29udGVudENsYXNzLFxuICBmb3JtSXRlbUNvbnRyb2xJbnB1dENsYXNzLFxuICBmb3JtSXRlbUV4cGxhaW5DbGFzcyxcbiAgZm9ybUl0ZW1FeHBsYWluSXRlbUNsYXNzLFxuICBmb3JtSXRlbUV4dHJhQ2xhc3MsXG4gIGZvcm1JdGVtRmVlZGJhY2tJY29uQ2xhc3MsXG4gIGZvcm1JdGVtRmVlZGJhY2tJY29uV3JhcENsYXNzLFxuICBmb3JtSXRlbUxhYmVsQ2xhc3MsXG4gIGZvcm1JdGVtTGFiZWxXcmFwQ2xhc3MsXG4gIGZvcm1JdGVtT3B0aW9uYWxNYXJrQ2xhc3MsXG4gIGZvcm1JdGVtUmVxdWlyZWRNYXJrQ2xhc3MsXG4gIGZvcm1JdGVtVG9vbHRpcENsYXNzLFxufSBmcm9tICcuL3N0eWxlcydcbmltcG9ydCBUb29sdGlwIGZyb20gJy4uL1Rvb2x0aXAnXG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9ybUl0ZW1Qcm9wcyB7XG4gIC8qKiBGaWVsZCBuYW1lIHBhdGg7IG9taXQgZm9yIGEgcHVyZSByZW5kZXItcmVnaW9uIEl0ZW0gKG5vIHZhbHVlIGJvdW5kKS4gKi9cbiAgbmFtZT86IE5hbWVQYXRoXG4gIGxhYmVsPzogSlNYLkVsZW1lbnRcbiAgLyoqIExhYmVsIGFsaWdubWVudCBvdmVycmlkZSAoZm9ybSBkZWZhdWx0IGFwcGxpZXMgb3RoZXJ3aXNlKS4gKi9cbiAgbGFiZWxBbGlnbj86ICdsZWZ0JyB8ICdyaWdodCdcbiAgLyoqIExhYmVsIGNvbHVtbiB3aWR0aCBvdmVycmlkZSAoaG9yaXpvbnRhbCBsYXlvdXQgb25seSkuICovXG4gIGxhYmVsV2lkdGg/OiBzdHJpbmdcbiAgLyoqIExldCB0aGlzIGl0ZW0ncyBsYWJlbCB3cmFwIChmb3JtIGRlZmF1bHQgYXBwbGllcyBvdGhlcndpc2UpLiAqL1xuICBsYWJlbFdyYXA/OiBib29sZWFuXG4gIC8qKiBTaG93IHRoZSByZXF1aXJlZCBhc3RlcmlzazsgZGVmYXVsdHMgdG8gZGV0ZWN0aW5nIGByZXF1aXJlZGAgaW4gcnVsZXMuICovXG4gIHJlcXVpcmVkPzogYm9vbGVhblxuICAvKiogU2hvdyBgOmAgYWZ0ZXIgdGhlIGxhYmVsLiBEZWZhdWx0IGZvbGxvd3MgdGhlIEZvcm0gKHRydWUpLiAqL1xuICBjb2xvbj86IGJvb2xlYW5cbiAgcnVsZXM/OiBGb3JtRmllbGRSdWxlW11cbiAgaW5pdGlhbFZhbHVlPzogdW5rbm93blxuICBkZXBlbmRlbmNpZXM/OiBOYW1lUGF0aFtdXG4gIHZhbGlkYXRlVHJpZ2dlcj86IHN0cmluZyB8IHN0cmluZ1tdIHwgZmFsc2VcbiAgdmFsaWRhdGVGaXJzdD86IGJvb2xlYW4gfCAncGFyYWxsZWwnXG4gIHZhbGlkYXRlRGVib3VuY2U/OiBudW1iZXJcbiAgbWVzc2FnZVZhcmlhYmxlcz86IFJlY29yZDxzdHJpbmcsIGFueT5cbiAgbm9ybWFsaXplPzogKHZhbHVlOiBhbnksIHByZXZWYWx1ZTogYW55LCBhbGxWYWx1ZXM6IGFueSkgPT4gYW55XG4gIGdldFZhbHVlRnJvbUV2ZW50PzogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnlcbiAgcHJlc2VydmU/OiBib29sZWFuXG4gIC8qKiBGb3JjZSB0aGUgdmFsaWRhdGlvbiBzdGF0dXMgZGlzcGxheSAob3ZlcnJpZGVzIHRoZSBmaWVsZCdzIG93biBzdGF0ZSkuICovXG4gIHZhbGlkYXRlU3RhdHVzPzogJ2Vycm9yJyB8ICd3YXJuaW5nJyB8ICd2YWxpZGF0aW5nJyB8ICdzdWNjZXNzJ1xuICAvKiogU2hvdyB0aGUgc3RhdHVzIGljb24gaW4gdGhlIHdpZGdldCdzIHN1ZmZpeCBhcmVhLiAqL1xuICBoYXNGZWVkYmFjaz86IGJvb2xlYW5cbiAgLyoqIEN1c3RvbSBoZWxwIHRleHQ7IG92ZXJyaWRlcyB0aGUgdmFsaWRhdGlvbiBtZXNzYWdlcyB3aGVuIG5vbi1lbXB0eS4gKi9cbiAgaGVscD86IEpTWC5FbGVtZW50XG4gIC8qKiBQZXJzaXN0ZW50IGhpbnQgdW5kZXIgdGhlIHZhbGlkYXRpb24gcm93LiAqL1xuICBleHRyYT86IEpTWC5FbGVtZW50XG4gIC8qKiBRdWVzdGlvbi1tYXJrIHRvb2x0aXAgbmV4dCB0byB0aGUgbGFiZWwuICovXG4gIHRvb2x0aXA/OiBKU1guRWxlbWVudFxuICBodG1sRm9yPzogc3RyaW5nXG4gIGhpZGRlbj86IGJvb2xlYW5cbiAgZGlzYWJsZWQ/OiBib29sZWFuXG4gIGNsYXNzPzogc3RyaW5nXG4gIGNoaWxkcmVuOiBKU1guRWxlbWVudCB8ICgodmFsdWU6IGFueSwgZm9ybTogdW5rbm93bikgPT4gSlNYLkVsZW1lbnQpXG4gIG9uUmVzZXQ/OiAoKSA9PiB2b2lkXG59XG5cbi8qKiBhbnRkIHRyaW1zIGEgdHJhaWxpbmcgdXNlci1zdXBwbGllZCBjb2xvbiAoQVNDSUkgb3IgZnVsbC13aWR0aCkgZnJvbSBsYWJlbHMuICovXG5jb25zdCB0cmltQ29sb24gPSAobGFiZWw6IEpTWC5FbGVtZW50KTogSlNYLkVsZW1lbnQgPT5cbiAgdHlwZW9mIGxhYmVsID09PSAnc3RyaW5nJyA/IGxhYmVsLnJlcGxhY2UoL1s6fO+8ml1cXHMqJC8sICcnKSA6IGxhYmVsXG5cbmNvbnN0IEZvcm1JdGVtOiBDb21wb25lbnQ8Rm9ybUl0ZW1Qcm9wcz4gPSByYXdQcm9wcyA9PiB7XG4gIGNvbnN0IHByb3BzID0gbWVyZ2Uoe30sIHJhd1Byb3BzKVxuICBjb25zdCBmb3JtQ3R4ID0gdXNlRm9ybUNvbnRleHQoKVxuICBjb25zdCBsaXN0Q3R4ID0gdXNlRm9ybUxpc3RDb250ZXh0KClcblxuICAvLyBBIGZpZWxkIG5lZWRzIGEgc3RvcmUuIE91dHNpZGUgPEZvcm0+IHRoZSBoZWFkbGVzcyBsYXllciBpcyB0aGUgaW50ZW5kZWRcbiAgLy8gdXNhZ2UgcGF0aCDigJQgY2F0Y2ggdGhlIHdpcmluZyBtaXN0YWtlIHdpdGggYSBjbGVhciBtZXNzYWdlIGluc3RlYWQgb2YgYVxuICAvLyBjb250ZXh0IGNyYXNoIGZyb20gZGVlcCBpbnNpZGUgY3JlYXRlRm9ybUZpZWxkLlxuICBpZiAoIWZvcm1DdHgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1t1cHRocnVzdC11aV0gRm9ybS5JdGVtIG11c3QgYmUgcmVuZGVyZWQgaW5zaWRlIGEgPEZvcm0+IChvciB1c2UgdGhlIGhlYWRsZXNzIGNyZWF0ZUZvcm1GaWVsZCBmcm9tIHVwdGhydXN0LWNvbXBldGVuY2UpLicpXG4gIH1cblxuICAvLyBSZXNvbHZlIHRoZSBuYW1lUGF0aDogTGlzdCBwcmVmaXggKyBvd24gbmFtZS5cbiAgY29uc3Qgb3duTmFtZSA9IHByb3BzLm5hbWUgPT09IHVuZGVmaW5lZFxuICAgID8gdW5kZWZpbmVkXG4gICAgOiAoQXJyYXkuaXNBcnJheShwcm9wcy5uYW1lKSA/IHByb3BzLm5hbWUgOiBbcHJvcHMubmFtZV0pXG4gIGNvbnN0IHJlc29sdmVkTGlzdFBhdGggPSBsaXN0Q3R4ICYmIG93bk5hbWUgIT09IHVuZGVmaW5lZFxuICAgID8gbGlzdEN0eC5yZXNvbHZlUGF0aChvd25OYW1lKVxuICAgIDogdW5kZWZpbmVkXG4gIGNvbnN0IG5hbWVQYXRoID0gY3JlYXRlTWVtbzxJbnRlcm5hbE5hbWVQYXRoPigoKSA9PiB7XG4gICAgaWYgKG93bk5hbWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFtdXG4gICAgaWYgKHJlc29sdmVkTGlzdFBhdGgpIHJldHVybiByZXNvbHZlZExpc3RQYXRoKClcbiAgICByZXR1cm4gb3duTmFtZVxuICB9KVxuXG4gIC8vIHVudHJhY2s6IGNvbXBvbmVudCBib2RpZXMgcnVuIHVudHJhY2tlZCBpbiBTb2xpZCAyIOKAlCByZWFkaW5nIHRoZSBmb3JtKClcbiAgLy8gbWVtbyBkaXJlY3RseSBoZXJlIHdvdWxkIHRyaXAgU1RSSUNUX1JFQURfVU5UUkFDS0VEIGluIGRldi4gVGhlIGZvcm1cbiAgLy8gaW5zdGFuY2UgaXMgc3RhdGljIGZvciB0aGUgSXRlbSdzIGxpZmV0aW1lICh0aGUgZm9ybSBwcm9wIG5ldmVyIHN3YXBzKSxcbiAgLy8gc28gYSBvbmUtdGltZSB1bnRyYWNrZWQgcmVhZCBpcyBzZW1hbnRpY2FsbHkgZXhhY3QuXG4gIGNvbnN0IGZpZWxkID0gY3JlYXRlRm9ybUZpZWxkKHVudHJhY2soKCkgPT4gZm9ybUN0eC5mb3JtKCkpLCB7XG4gICAgZ2V0IG5hbWUoKSB7IHJldHVybiBwcm9wcy5uYW1lID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBuYW1lUGF0aCgpIH0sXG4gICAgZ2V0IHJ1bGVzKCkgeyByZXR1cm4gcHJvcHMucnVsZXMgfSxcbiAgICBnZXQgaW5pdGlhbFZhbHVlKCkgeyByZXR1cm4gcHJvcHMuaW5pdGlhbFZhbHVlIH0sXG4gICAgZ2V0IGRlcGVuZGVuY2llcygpIHtcbiAgICAgIGNvbnN0IHJvd1ByZWZpeCA9IGxpc3RDdHggPyBuYW1lUGF0aCgpLnNsaWNlKDAsIC0xKSA6IFtdXG4gICAgICByZXR1cm4gcHJvcHMuZGVwZW5kZW5jaWVzPy5tYXAoZGVwZW5kZW5jeSA9PiBbXG4gICAgICAgIC4uLnJvd1ByZWZpeCxcbiAgICAgICAgLi4uKEFycmF5LmlzQXJyYXkoZGVwZW5kZW5jeSkgPyBkZXBlbmRlbmN5IDogW2RlcGVuZGVuY3ldKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZXQgdmFsaWRhdGVUcmlnZ2VyKCkgeyByZXR1cm4gcHJvcHMudmFsaWRhdGVUcmlnZ2VyID8/IGZvcm1DdHg/LnZhbGlkYXRlVHJpZ2dlcigpIH0sXG4gICAgZ2V0IHZhbGlkYXRlRmlyc3QoKSB7IHJldHVybiBwcm9wcy52YWxpZGF0ZUZpcnN0IH0sXG4gICAgZ2V0IHZhbGlkYXRlRGVib3VuY2UoKSB7IHJldHVybiBwcm9wcy52YWxpZGF0ZURlYm91bmNlIH0sXG4gICAgZ2V0IG1lc3NhZ2VWYXJpYWJsZXMoKSB7IHJldHVybiBwcm9wcy5tZXNzYWdlVmFyaWFibGVzIH0sXG4gICAgZ2V0IG5vcm1hbGl6ZSgpIHsgcmV0dXJuIHByb3BzLm5vcm1hbGl6ZSB9LFxuICAgIGdldCBnZXRWYWx1ZUZyb21FdmVudCgpIHsgcmV0dXJuIHByb3BzLmdldFZhbHVlRnJvbUV2ZW50IH0sXG4gICAgZ2V0IHByZXNlcnZlKCkgeyByZXR1cm4gcHJvcHMucHJlc2VydmUgfSxcbiAgICBnZXQgZGlzYWJsZWQoKSB7IHJldHVybiBwcm9wcy5kaXNhYmxlZCB9LFxuICAgIGdldCBvblJlc2V0KCkgeyByZXR1cm4gcHJvcHMub25SZXNldCB9LFxuICB9KVxuXG4gIC8vIFJlc29sdmUgdGhlIERPTSBpZDogaHRtbEZvciA+IGZvcm0gbmFtZSArIG5hbWVQYXRoLlxuICBjb25zdCBpdGVtSWQgPSBjcmVhdGVNZW1vKCgpID0+IHtcbiAgICBpZiAocHJvcHMuaHRtbEZvcikgcmV0dXJuIHByb3BzLmh0bWxGb3JcbiAgICBpZiAocHJvcHMubmFtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIGB1cHRocnVzdC1mb3JtLWl0ZW0tJHtuYW1lUGF0aCgpLmpvaW4oJy0nKX1gXG4gIH0pXG5cbiAgY29uc3QgbGF5b3V0ID0gKCkgPT4gZm9ybUN0eC5sYXlvdXQ/LigpID8/ICdob3Jpem9udGFsJ1xuICBjb25zdCBzaXplID0gKCkgPT4gZm9ybUN0eC5zaXplKClcblxuICAvLyBSZXF1aXJlZCBhc3RlcmlzazogYW50ZCByZXF1aXJlZE1hcmsgcmVzb2x2ZXMgcGVyIGl0ZW0g4oCUXG4gIC8vIGZvcm0tbGV2ZWwgbWFyayAodHJ1ZS9mYWxzZS8nb3B0aW9uYWwnKSDDlyBpdGVtIHJlcXVpcmVkIHN0YXRlLlxuICBjb25zdCBpdGVtUmVxdWlyZWQgPSBjcmVhdGVNZW1vKCgpID0+XG4gICAgcHJvcHMucmVxdWlyZWQgPz8gaXNSZXF1aXJlZFJ1bGUocHJvcHMucnVsZXMsIHByb3BzLm5hbWUpLFxuICApXG4gIGNvbnN0IGZvcm1SZXF1aXJlZE1hcmsgPSAoKSA9PiBmb3JtQ3R4LnJlcXVpcmVkTWFyaz8uKCkgPz8gdHJ1ZVxuICAvLyBzaG93IHRoZSBgKmA6IGZvcm0gbWFyayBpcyB0cnV0aHkgQU5EIHRoZSBpdGVtIGlzIHJlcXVpcmVkXG4gIGNvbnN0IHNob3dSZXF1aXJlZE1hcmsgPSBjcmVhdGVNZW1vKCgpID0+XG4gICAgZm9ybVJlcXVpcmVkTWFyaygpICE9PSBmYWxzZSAmJiBpdGVtUmVxdWlyZWQoKSxcbiAgKVxuICAvLyBzaG93IGAob3B0aW9uYWwpYDogZm9ybSBtYXJrIGlzICdvcHRpb25hbCcgQU5EIHRoZSBpdGVtIGlzIE5PVCByZXF1aXJlZFxuICBjb25zdCBzaG93T3B0aW9uYWxNYXJrID0gY3JlYXRlTWVtbygoKSA9PlxuICAgIGZvcm1SZXF1aXJlZE1hcmsoKSA9PT0gJ29wdGlvbmFsJyAmJiAhaXRlbVJlcXVpcmVkKCksXG4gIClcblxuICBjb25zdCBzaG93Q29sb24gPSBjcmVhdGVNZW1vKCgpID0+IHtcbiAgICBpZiAobGF5b3V0KCkgPT09ICd2ZXJ0aWNhbCcpIHJldHVybiBmYWxzZVxuICAgIGlmIChwcm9wcy5jb2xvbiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcHMuY29sb25cbiAgICByZXR1cm4gZm9ybUN0eC5jb2xvbj8uKCkgPz8gdHJ1ZVxuICB9KVxuXG4gIC8vIEVmZmVjdGl2ZSB2YWxpZGF0ZSBzdGF0dXM6IHByb3Agb3ZlcnJpZGUgPiBmaWVsZCBzdGF0ZS5cbiAgY29uc3QgdmFsaWRhdGVTdGF0dXMgPSBjcmVhdGVNZW1vPCdlcnJvcicgfCAnd2FybmluZycgfCAndmFsaWRhdGluZycgfCAnc3VjY2VzcycgfCB1bmRlZmluZWQ+KCgpID0+IHtcbiAgICBpZiAocHJvcHMudmFsaWRhdGVTdGF0dXMpIHJldHVybiBwcm9wcy52YWxpZGF0ZVN0YXR1c1xuICAgIGNvbnN0IG1ldGEgPSBmaWVsZC5tZXRhKClcbiAgICBpZiAobWV0YS52YWxpZGF0aW5nKSByZXR1cm4gJ3ZhbGlkYXRpbmcnXG4gICAgaWYgKG1ldGEuZXJyb3JzLmxlbmd0aCkgcmV0dXJuICdlcnJvcidcbiAgICBpZiAobWV0YS53YXJuaW5ncy5sZW5ndGgpIHJldHVybiAnd2FybmluZydcbiAgICBpZiAobWV0YS52YWxpZGF0ZWQgJiYgbWV0YS50b3VjaGVkKSByZXR1cm4gJ3N1Y2Nlc3MnXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9KVxuXG4gIGNvbnN0IGhlbHBNZXNzYWdlID0gY3JlYXRlTWVtbzxKU1guRWxlbWVudD4oKCkgPT4ge1xuICAgIGlmIChwcm9wcy5oZWxwICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wcy5oZWxwXG4gICAgY29uc3QgZXJyb3JzID0gZmllbGQuZXJyb3JzKClcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkgcmV0dXJuIDxGb3IgZWFjaD17ZXJyb3JzfT57KG1zZykgPT4gPGRpdiBjbGFzcz17Zm9ybUl0ZW1FeHBsYWluSXRlbUNsYXNzKCl9Pnttc2d9PC9kaXY+fTwvRm9yPlxuICAgIGNvbnN0IHdhcm5pbmdzID0gZmllbGQud2FybmluZ3MoKVxuICAgIGlmICh3YXJuaW5ncy5sZW5ndGgpIHJldHVybiA8Rm9yIGVhY2g9e3dhcm5pbmdzfT57KG1zZykgPT4gPGRpdiBjbGFzcz17Zm9ybUl0ZW1FeHBsYWluSXRlbUNsYXNzKCl9Pnttc2d9PC9kaXY+fTwvRm9yPlxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfSlcblxuICBjb25zdCBoYXNMYWJlbCA9ICgpID0+IHByb3BzLmxhYmVsICE9PSB1bmRlZmluZWQgfHwgcHJvcHMudG9vbHRpcCAhPT0gdW5kZWZpbmVkXG5cbiAgY29uc3QgY29udHJvbCA9IHtcbiAgICB2YWx1ZTogKCkgPT4ge1xuICAgICAgZm9ybUN0eC5mb3JtKCkucmVzZXRDb3VudFNpZ25hbCgpXG4gICAgICByZXR1cm4gZmllbGQudmFsdWUoKVxuICAgIH0sXG4gICAgb25DaGFuZ2U6ICh2YWx1ZTogYW55LCBldmVudD86IEV2ZW50KSA9PiB7XG4gICAgICAvLyBGb3JtIHdpZGdldHMgcGFzcyB0aGUgdmFsdWUgZGlyZWN0bHk7IGV2ZW50IGlzIGFkdmlzb3J5LlxuICAgICAgdm9pZCBldmVudFxuICAgICAgZmllbGQub25DaGFuZ2UodmFsdWUpXG4gICAgfSxcbiAgICB2YWxpZGF0ZVN0YXR1cyxcbiAgICBpZDogaXRlbUlkLFxuICAgIGRpc2FibGVkOiAoKSA9PiBwcm9wcy5kaXNhYmxlZCA/PyBmb3JtQ3R4Py5kaXNhYmxlZCgpLFxuICAgIHNpemU6ICgpID0+IGZvcm1DdHg/LnNpemUoKSxcbiAgfVxuXG5cbiAgY29uc3QgcmVuZGVyQ2hpbGRyZW4gPSAoKTogSlNYLkVsZW1lbnQgPT4ge1xuICAgIGlmICh0eXBlb2YgcHJvcHMuY2hpbGRyZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAocHJvcHMuY2hpbGRyZW4gYXMgKHZhbHVlOiBhbnksIGZvcm06IHVua25vd24pID0+IEpTWC5FbGVtZW50KShmaWVsZC52YWx1ZSgpLCBmb3JtQ3R4LmZvcm0oKSlcbiAgICB9XG4gICAgcmV0dXJuIHByb3BzLmNoaWxkcmVuIGFzIEpTWC5FbGVtZW50XG4gIH1cblxuICAvLyBGaXhlZCBsYWJlbCBjb2x1bW4gd2lkdGgg4oCUIGFuIGlubGluZSBzdHlsZSwgYmVjYXVzZSBhIHJ1bnRpbWUgQ1NTIGxlbmd0aFxuICAvLyAoZS5nLiAnOTZweCcpIGNhbid0IGJlIGEgc3RhdGljIFVub0NTUyBjbGFzcyAoYXJiaXRyYXJ5IHZhbHVlcyBidWlsdCBhdFxuICAvLyBydW50aW1lIGFyZSBpbnZpc2libGUgdG8gdGhlIGV4dHJhY3RvcikuXG4gIGNvbnN0IGxhYmVsV2lkdGggPSAoKSA9PiAobGF5b3V0KCkgPT09ICdob3Jpem9udGFsJyA/IChwcm9wcy5sYWJlbFdpZHRoID8/IGZvcm1DdHgubGFiZWxXaWR0aD8uKCkpIDogdW5kZWZpbmVkKVxuXG4gIGNvbnN0IGxhYmVsTm9kZSA9IChcbiAgICA8U2hvdyB3aGVuPXtoYXNMYWJlbCgpfT5cbiAgICAgIDxkaXZcbiAgICAgICAgc3R5bGU9e2xhYmVsV2lkdGgoKSA/IHsgJ2ZsZXgtYmFzaXMnOiBsYWJlbFdpZHRoKCksIHdpZHRoOiBsYWJlbFdpZHRoKCkgfSA6IHVuZGVmaW5lZH1cbiAgICAgICAgY2xhc3M9e2Zvcm1JdGVtTGFiZWxXcmFwQ2xhc3Moe1xuICAgICAgICAgIGxheW91dDogbGF5b3V0KCksXG4gICAgICAgICAgbGFiZWxBbGlnbjogcHJvcHMubGFiZWxBbGlnbiA/PyBmb3JtQ3R4LmxhYmVsQWxpZ24oKSxcbiAgICAgICAgICBsYWJlbFdyYXA6IHByb3BzLmxhYmVsV3JhcCA/PyBmb3JtQ3R4LmxhYmVsV3JhcD8uKCksXG4gICAgICAgIH0pfVxuICAgICAgPlxuICAgICAgICA8bGFiZWxcbiAgICAgICAgICBjbGFzcz17Zm9ybUl0ZW1MYWJlbENsYXNzKHsgc2l6ZTogc2l6ZSgpIH0pfVxuICAgICAgICAgIGZvcj17aXRlbUlkKCl9XG4gICAgICAgID5cbiAgICAgICAgICA8U2hvdyB3aGVuPXtzaG93UmVxdWlyZWRNYXJrKCl9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e2Zvcm1JdGVtUmVxdWlyZWRNYXJrQ2xhc3MoKX0+Kjwvc3Bhbj5cbiAgICAgICAgICA8L1Nob3c+XG4gICAgICAgICAge3RyaW1Db2xvbihwcm9wcy5sYWJlbCl9XG4gICAgICAgICAgPFNob3cgd2hlbj17c2hvd0NvbG9uKCkgJiYgcHJvcHMubGFiZWwgIT09IHVuZGVmaW5lZCAmJiBwcm9wcy5sYWJlbCAhPT0gJyd9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e2Zvcm1JdGVtQ29sb25DbGFzcygpfT46PC9zcGFuPlxuICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICA8U2hvdyB3aGVuPXtzaG93T3B0aW9uYWxNYXJrKCl9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9e2Zvcm1JdGVtT3B0aW9uYWxNYXJrQ2xhc3MoKX0+KOWPr+mAiSk8L3NwYW4+XG4gICAgICAgICAgPC9TaG93PlxuICAgICAgICAgIDxTaG93IHdoZW49e3Byb3BzLnRvb2x0aXAgIT09IHVuZGVmaW5lZH0ga2V5ZWQ+XG4gICAgICAgICAgICA8VG9vbHRpcCB0aXRsZT17cHJvcHMudG9vbHRpcH0+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPXt0d01lcmdlKCdpLW1kaS1oZWxwLWNpcmNsZS1vdXRsaW5lJywgZm9ybUl0ZW1Ub29sdGlwQ2xhc3MoKSl9IC8+XG4gICAgICAgICAgICA8L1Rvb2x0aXA+XG4gICAgICAgICAgPC9TaG93PlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9kaXY+XG4gICAgPC9TaG93PlxuICApXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzPXtmb3JtSXRlbUNsYXNzKHsgbGF5b3V0OiBsYXlvdXQoKSwgaGlkZGVuOiBwcm9wcy5oaWRkZW4sIGNsYXNzXzogcHJvcHMuY2xhc3MgfSl9PlxuICAgICAge2xhYmVsTm9kZX1cblxuICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1Db250cm9sQ2xhc3MoeyBsYXlvdXQ6IGxheW91dCgpIH0pfT5cbiAgICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1Db250cm9sSW5wdXRDbGFzcyh7IHNpemU6IHNpemUoKSB9KX0+XG4gICAgICAgICAgPGRpdiBjbGFzcz17Zm9ybUl0ZW1Db250cm9sQ29udGVudENsYXNzKCl9PlxuICAgICAgICAgICAgPEZvcm1JdGVtQ29udGV4dCB2YWx1ZT17Y29udHJvbH0+XG4gICAgICAgICAgICAgIHtyZW5kZXJDaGlsZHJlbigpfVxuICAgICAgICAgICAgPC9Gb3JtSXRlbUNvbnRleHQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPFNob3cgd2hlbj17cHJvcHMuaGFzRmVlZGJhY2sgJiYgdmFsaWRhdGVTdGF0dXMoKX0+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz17Zm9ybUl0ZW1GZWVkYmFja0ljb25XcmFwQ2xhc3MoeyBzaXplOiBzaXplKCkgfSl9PlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz17Zm9ybUl0ZW1GZWVkYmFja0ljb25DbGFzcyh2YWxpZGF0ZVN0YXR1cygpKX0+XG4gICAgICAgICAgICAgICAgPFNob3cgd2hlbj17dmFsaWRhdGVTdGF0dXMoKSA9PT0gJ2Vycm9yJ30gZmFsbGJhY2s9e1xuICAgICAgICAgICAgICAgICAgPFNob3cgd2hlbj17dmFsaWRhdGVTdGF0dXMoKSA9PT0gJ3dhcm5pbmcnfSBmYWxsYmFjaz17XG4gICAgICAgICAgICAgICAgICAgIDxTaG93IHdoZW49e3ZhbGlkYXRlU3RhdHVzKCkgPT09ICd2YWxpZGF0aW5nJ30gZmFsbGJhY2s9ezxzcGFuIGNsYXNzPVwiaS1tZGktY2hlY2stY2lyY2xlXCIgLz59PlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaS1tZGktbG9hZGluZyBhbmltYXRlLXNwaW4tdXB0aHJ1c3RcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L1Nob3c+XG4gICAgICAgICAgICAgICAgICB9PlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImktbWRpLWFsZXJ0XCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICAgICAgICB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpLW1kaS1jbG9zZS1jaXJjbGVcIiAvPlxuICAgICAgICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvU2hvdz5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPFNob3cgd2hlbj17aGVscE1lc3NhZ2UoKSAhPT0gdW5kZWZpbmVkIHx8IHByb3BzLmV4dHJhICE9PSB1bmRlZmluZWR9PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPXtmb3JtSXRlbUV4cGxhaW5DbGFzcyhcbiAgICAgICAgICAgICAgdmFsaWRhdGVTdGF0dXMoKSA9PT0gJ2Vycm9yJyA/ICdlcnJvcicgOiB2YWxpZGF0ZVN0YXR1cygpID09PSAnd2FybmluZycgPyAnd2FybmluZycgOiAnZGVmYXVsdCcsXG4gICAgICAgICAgICApfT5cbiAgICAgICAgICAgICAge2hlbHBNZXNzYWdlKCl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxTaG93IHdoZW49e3Byb3BzLmV4dHJhICE9PSB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPXtmb3JtSXRlbUV4dHJhQ2xhc3MoKX0+e3Byb3BzLmV4dHJhfTwvZGl2PlxuICAgICAgICAgICAgPC9TaG93PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L1Nob3c+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBGb3JtSXRlbVxuIl0sImZpbGUiOiIvVXNlcnMvemhhbmdjaGVuMzI3L2NvZGUvZ2l0aHViL3BrMTExYW5kMjIyL3NvbGlkLXVwdGhydXN0L3BhY2thZ2VzL2NvbXBvbmVudHMvbGliL0Zvcm0vSXRlbS50c3gifQ==