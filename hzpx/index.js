
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @returns {void} */
	function validate_store(store, name) {
		if (store != null && typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}

	function subscribe(store, ...callbacks) {
		if (store == null) {
			for (const callback of callbacks) {
				callback(undefined);
			}
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}

	/** @returns {void} */
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}

	function set_store_value(store, ret, value) {
		store.set(value);
		return ret;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}
	/** */
	class HtmlTag {
		/**
		 * @private
		 * @default false
		 */
		is_svg = false;
		/** parent for creating node */
		e = undefined;
		/** html tag nodes */
		n = undefined;
		/** target */
		t = undefined;
		/** anchor */
		a = undefined;
		constructor(is_svg = false) {
			this.is_svg = is_svg;
			this.e = this.n = null;
		}

		/**
		 * @param {string} html
		 * @returns {void}
		 */
		c(html) {
			this.h(html);
		}

		/**
		 * @param {string} html
		 * @param {HTMLElement | SVGElement} target
		 * @param {HTMLElement | SVGElement} anchor
		 * @returns {void}
		 */
		m(html, target, anchor = null) {
			if (!this.e) {
				if (this.is_svg)
					this.e = svg_element(/** @type {keyof SVGElementTagNameMap} */ (target.nodeName));
				/** #7364  target for <template> may be provided as #document-fragment(11) */ else
					this.e = element(
						/** @type {keyof HTMLElementTagNameMap} */ (
							target.nodeType === 11 ? 'TEMPLATE' : target.nodeName
						)
					);
				this.t =
					target.tagName !== 'TEMPLATE'
						? target
						: /** @type {HTMLTemplateElement} */ (target).content;
				this.c(html);
			}
			this.i(anchor);
		}

		/**
		 * @param {string} html
		 * @returns {void}
		 */
		h(html) {
			this.e.innerHTML = html;
			this.n = Array.from(
				this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes
			);
		}

		/**
		 * @returns {void} */
		i(anchor) {
			for (let i = 0; i < this.n.length; i += 1) {
				insert(this.t, this.n[i], anchor);
			}
		}

		/**
		 * @param {string} html
		 * @returns {void}
		 */
		p(html) {
			this.d();
			this.h(html);
			this.i(this.a);
		}

		/**
		 * @returns {void} */
		d() {
			this.n.forEach(detach);
		}
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	/** @returns {void} */
	function add_flush_callback(fn) {
		flush_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function bind(component, name, callback) {
		const index = component.$$.props[name];
		if (index !== undefined) {
			component.$$.bound[index] = callback;
			callback(component.$$.ctx[index]);
		}
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.18';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	const splitUTF32$1=(str)=>{
	    if (!str) {
	        const empty=[];
	        return empty
	    }
	    let i=0;
	    const out=[];
	    while (i<str.length) {
	        const code=str.codePointAt(i)||0;
	        out.push(code);
	        i++;
	        if (code>0xffff) i++;
	    }
	    return out;
	};
	const splitUTF32Char$1=(str)=>splitUTF32$1(str).map( cp=>String.fromCodePoint(cp));
	const codePointLength$1=(str)=>splitUTF32$1(str).length;

	const splitUTF32Char=(str)=>splitUTF32(str).map( cp=>String.fromCodePoint(cp));
	const codePointLength=(str)=>splitUTF32(str).length;
	const splitUTF32=(str)=>{
	    if (!str) {
	        const empty=[];
	        return empty
	    }
	    let i=0;
	    const out=[];
	    while (i<str.length) {
	        const code=str.codePointAt(i)||0;
	        out.push(code);
	        i++;
	        if (code>0xffff) i++;
	    }
	    return out;
	};

	const CodeStart=0x0E;
	const BYTE_MAX=113;
	const BYTE1_MAX=45;                                       //delta
	const BYTE2_MAX=44*BYTE_MAX+BYTE1_MAX;                     //5017      //for year bc 2000~ad2280
	const BYTE2_START=45;    
	const BYTE3_START=89;         
	const BYTE4_START=105;         
	const BYTE5_START=112;
	const BYTE3_MAX=16*BYTE_MAX*BYTE_MAX+BYTE2_MAX;                     // ~204304     
	const SEP2DITEM=0x7f;
	const SEPARATOR2D="\u007f";
	const unpackInt=(s,delta=false)=>{
		let arr=[];
		//let started=false;
		if (!s) return [];
		let o,i=0,c=0,prev=0;
		while (i<s.length) {
			o=s.charCodeAt(i) - CodeStart;
			if (o<BYTE2_START) ; else if (o<BYTE3_START) {
				const i1=s.charCodeAt(++i) - CodeStart;
				o-=BYTE2_START;
				o = o*BYTE_MAX + i1 + BYTE1_MAX;
			} else if (o<BYTE4_START) {
				const i2=s.charCodeAt(++i) - CodeStart;
				const i1=s.charCodeAt(++i) - CodeStart;
				o-=BYTE3_START;
				o = o*BYTE_MAX*BYTE_MAX + i2*BYTE_MAX + i1 + BYTE2_MAX ;
			} else if (o<BYTE5_START) {
				const i3=s.charCodeAt(++i) - CodeStart;
				const i2=s.charCodeAt(++i) - CodeStart;
				const i1=s.charCodeAt(++i) - CodeStart;
				o-=BYTE4_START;
				o = o*BYTE_MAX*BYTE_MAX*BYTE_MAX + i3*BYTE_MAX*BYTE_MAX + i2*BYTE_MAX + i1+BYTE3_MAX ;		
			} else if (o<SEP2DITEM) {
				const i4=s.charCodeAt(++i) - CodeStart;
				const i3=s.charCodeAt(++i) - CodeStart;
				const i2=s.charCodeAt(++i) - CodeStart;
				const i1=s.charCodeAt(++i) - CodeStart;
				o-=BYTE5_START;
				o = o*BYTE_MAX*BYTE_MAX*BYTE_MAX*BYTE_MAX
				+ i4*BYTE_MAX*BYTE_MAX*BYTE_MAX+i3*BYTE_MAX*BYTE_MAX 
				+ i2*BYTE_MAX + i1+BYTE3_MAX ;		
			} else {
				throw new Error("exit max integer 0x7f,"+ o);
			}

			arr[c] = o + (delta?prev:0)  - 1;
			prev=arr[c];
			c++;
			i++;
		}
		return arr; // return normal array , easier for consequence operation (intersect, union)
	};
	const unpack1=(str)=>{
		const arr=[];
		let i1=0;
		const count=Math.floor(str.length);
		for (let i=0;i<count;i++) {
			i1=str.charCodeAt(i*3) -CodeStart;
			arr.push( i1-1 );
		}
		return arr;
	};
	const intersect=(arr1,arr2)=>{
	    const out=[];
	    let j=0;
	    for (let i=0;i<arr1.length;i++) {
	        let v=arr1[i];
	        while (j<arr2.length) {
	            if (arr2[j]>=v) break;
	            j++;
	        }
	        if (v==arr2[j] && out[out.length-1]!==v) out.push(v);
	        if (j==arr2.length) break;
	    }
	    return out;
	};
	const CJKRanges$1={
	    'BMP': [0x4e00,0x9fa5],
	    'ExtA':[0x3400,0x4dff],
	    'ExtB':[0x20000,0x2A6FF],
	    'ExtC':[0x2A700,0x2B73F],
	    'ExtD':[0x2B740,0x2B81F],
	    'ExtE':[0x2B820,0x2CEAF],
	    'ExtF':[0x2CEB0,0x2EBE0],
	    'ExtG':[0x30000,0x3134F],
	    'ExtH':[0x31350,0x323AF],
	    'ExtZ':[0xA0000,0xD47FF]
	};
	const CJKRangeName$1=(s)=>{//return cjk range name by a char or unicode number value or a base 16 string
	    let cp=0;
	    if (typeof s==='string') {
	        const code=parseInt(s,16);
	        if (!isNaN(code)) {
	            cp=code;
	        } else {
	            cp=s.codePointAt(0)||0;
	        }
	    }
	    for (let rangename in CJKRanges$1) {
	        const [from,to]=CJKRanges$1[rangename];
	        if (cp>=from && cp<=to) return rangename;
	    }
	};

	const bsearch = (arr, obj) =>{
		let low = 0, high = arr.length-1, mid;
		while (low < high) {
		  	mid = (low + high) >> 1;
		  	if (arr[mid] === obj)  {
				while (mid>-1 &&arr[mid-1]===obj ) mid--; //值重覆的元素，回逆到第一個
				return mid;
		  	}
		  	(arr[mid] < obj) ? low = mid + 1 : high = mid;
		}
		return low;
	};
	  
	const alphabetically0 = (a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;

	//import {FontFace,FontFaceMap } from './interfaces.ts';


	const fontfacedef={};

	const addFontFace=(name,settings)=>{
		fontfacedef[name]=settings;
	};

	const getFontFace=(name)=>{
		return fontfacedef[name];
	};
	const enumFontFace=()=>{
		return Object.keys(fontfacedef);
	};

	addFontFace('宋体', { kMinWidthY:2, kMinWidthU:2, kMinWidthT:4.5, kWidth:5});
	addFontFace('细宋体',{ kMinWidthY:2, kMinWidthU:1, kMinWidthT:3, kWidth:5});
	addFontFace('中宋体',{ kMinWidthY:2, kMinWidthU:2, kMinWidthT:6, kWidth:5 });
	addFontFace('粗宋体',{ kMinWidthY:2.5, kMinWidthU:2, kMinWidthT:7, kWidth:5 });
	addFontFace('特宋体',{ kMinWidthY:3, kMinWidthU:2, kMinWidthT:8, kWidth:5});

	addFontFace('黑体',{  hei:true, kWidth:2 });
	addFontFace('细黑体',{ hei:true, kWidth:1 });
	addFontFace('中黑体',{ hei:true, kWidth:3  });
	addFontFace('粗黑体',{ hei:true, kWidth:5});
	addFontFace('特黑体',{ hei:true, kWidth:7});

	/* compression of glyphwiki format */

	//stroke
	// const gd2='2:7:8:86:92:100:97:110:111$1:0:0:17:115:185:115$2:32:7:100:115:71:140:12:163$1:32:0:58:144:58:180$2:0:7:53:184:75:174:107:159$2:0:7:165:127:148:138:114:156$2:7:0:129:148:154:172:179:180'
	//comp
	// const gd1='99:0:0:0:0:200:200:u79be-01$99:0:0:70:0:193:200:cdp-8dc9';
	// const gd3='99:0:0:0:5:200:132:u4ea0-g:0:0:0$2:0:7:99:109:65:144:14:163$1:32:413:66:140:66:178$2:32:7:66:178:79:172:115:156$2:0:7:159:120:148:127:121:143$2:7:8:98:133:150:156:169:184';

	/*rare stroke type ,  '101': 11,  '103': 3,  '106': 1,  '107': 2, */

	const NUMOFFSET=10;//must more than stroke type
	const NEGATIVE=4000;//some stroke deco 
	const unpackGD=(str)=>{
		if (!str) return '';
		const units=str.split(SEPARATOR2D);
		const arr=[];
		for (let i=0;i<units.length;i++) {
			const s=units[i];
			const unit=[];

			let d=unpack1(s[0]);
			if (d[0] >NUMOFFSET) {
				const len= d[0]-NUMOFFSET;
				const name=unpackGID(s.slice(1,len+1));
				const [x1,y1,x2,y2,sx,sy,sx2,sy2]=unpackInt(s.slice(len+1)).map(UN);

				unit.push('99');
				unit.push( sx||'0',sy||'0', x1||'0',y1||'0',x2||'0',y2||'0' , name);
				unit.push('0',sx2||'0',sy2||'0');
			} else {
				const st=d[0];
				const nums=Array.from(unpackInt(s.slice(1)).map(UN));
				unit.push(st,...nums);
			}
			arr.push(unit.join(':'));
		}
		return arr.join('$');
	};
	const UN=(n)=>{
		if (n>NEGATIVE) return -n+NEGATIVE;
		else n-=NUMOFFSET;
		return n;
	};
	const unpackGID=(gid)=>{
		const cp=gid.codePointAt(0)||0;
		let s='';
		if (cp>0xff) {
			const chars=splitUTF32Char(gid);
			s= 'u'+cp.toString(16);
			if (chars.length>1) s+=(chars[1]!=='@'?'-':'')+gid.slice( chars[0].length);
		} else {
			return gid;
		}
		return s;
	};

	let ptk$1 ;
	let cjkbmp,cjkext;

	let gwgid=[]; // 從 gwcomp 拆出的 gid , 不含bmp,ext
	let gwbody=[];  //  組字指令，可能全部(從glyphwiki-dump.txt 載入時)，或不含bmp/ext (從browser 載入時)

	const addFontData=(name,data)=>{ //call by pure js data cjkbmp.js 
		if (name=='cjkbmp') cjkbmp=data.split(/\r?\n/);
		else if (name=='cjkext') cjkext=data.split(/\r?\n/);
		else if (name=='gwcomp') {
			const comps=[];
			const lines=data.split(/\r?\n/);
			for (let i=0;i<lines.length;i++) {
				const line=lines[i];
				const at=line.indexOf(',');
				comps.push([line.slice(0,at),line.slice(at+1)]);
			}
			comps.sort(alphabetically0);
			for (let i=0;i<comps.length;i++) {
				gwgid.push(comps[i][0]);
				gwbody.push(comps[i][1]);
			}
		}
		if (typeof window!=='undefined') { //messy , for eachGlyph to work
			window.CJKBMP=cjkbmp;
			window.CJKEXT=cjkext;
		}
	};
	const getGID=(id)=>{ //replace versioning , allow code point or unicode char
		if (typeof id==='number') return ch2gid$1(id);
		else if (typeof id=='string') {
			if ( (id.codePointAt(0)||0) >0x2000) {
				id='u'+(id.codePointAt(0)||0).toString(16);
			}
			return id;//.replace(/@\d+$/,''); // no versioning (@) in the key
		}
		return '';
	};
	const ch2gid$1=(ch)=>'u'+(typeof ch=='number'?ch:(ch.codePointAt(0)||' ')).toString(16);
	const getGlyph$1=s=>{
		let data='';
		const gid=getGID(s);

		const m=gid.match(/^u([\da-f]{4,5})$/);
		if (m) {
			const cp=parseInt(m[1],16);
			if (cp>=0x20000 && cp<=0x40000) {
	            data=cjkext[cp-0x20000];
			} else if (cp>=0x3400 && cp<0x9FFF) {
	            data=cjkbmp[cp-0x3400];
	        }
	    } else {
			const at= bsearch(gwgid,gid);
			if (~at && gid.startsWith(gwgid[at])) {
				data=gwbody[at];
				
			}
	    }
		const r=unpackGD(data);
		return r
	};


	let depth=0;
	const loadComponents=(data,compObj,countrefer=false)=>{ //enumcomponents recursively
		if (!data) return;
		const entries=data.split('$');
		depth++;
		if (depth>10) {
			console.log('too deep fetching',data); //this occur only when glyphwiki data is not in order.
			return;
		}
		for (let i=0;i<entries.length;i++) {
			const units=entries[i].split(':');
			if (units[0]=='99') {
				let gid=units[7];
				if (gid=='undefined') {
					console.log('wrong gid');
					break;
				}
				const d=getGlyph$1(gid);
				if (!d) {
					console.log('glyph not found',gid);
				} else {
					if (countrefer) {
						if (!compObj[gid])compObj[gid]=0;
						compObj[gid]++;					
					} else {
						if (!compObj[gid])compObj[gid]= getGlyph$1(gid);
					}
					loadComponents(d,compObj,countrefer);
				}
			}
		}
		depth--;
	};
	function frameOf(gd, rawframe='') {
		const entries=gd.split('$');
		let frames=[];
		let gid='';
		for (let i=0;i<entries.length;i++) {
			if (entries[i].slice(0,3)==='99:') {
				const [m,a1,a2,x1,y1,x2,y2,id]=entries[i].split(':');
				const f=[parseInt(x1),parseInt(y1),parseInt(x2),parseInt(y2)];
				frames.push(f);
				gid=id;
			}
		}
		if (!rawframe && frames.length==1) { //自動全框展開
			frames=frameOf(getGlyph$1(gid));
		}
		return frames;
	}

	const gid2ch=(gid)=> {
		if (gid[0]!=='u') return ' ';
		let n=parseInt(gid.slice(1) ,16);
		if (n<0x20 ||isNaN(n)) n=0x20;
		return String.fromCodePoint(n);
	};
	const deserializeGlyphUnit$1=(glyphdata)=>glyphdata.split('$').filter(it=>it!=='0:0:0:0').map(item=>item.split(':'));

	const factorsOfGD=(gd,gid)=>{
		const units=deserializeGlyphUnit$1(gd);
		let factors=[];
		if (units.length==1 && units[0][0]==='99') { //full frame char , dig in 
			const compid=units[0][7];
			return factorsOfGD(getGlyph$1(compid),compid);
		}
		for (let i=0;i<units.length;i++) {
			if (units[i][0]==='99') {
				factors.push(units[i][7]);
			}
		}
		return gid?factors:factors.map(gid2ch).join('');
	};
	const componentsOf=(ch,returnid=false)=>{
		const d=getGlyph$1(ch);
		return (componentsOfGD(d,returnid)).filter(it=>it!==ch);
	};
	const componentsOfGD=(d,returnid=false)=>{
		const comps={};
		loadComponents(d,comps);
		const out=Object.keys(comps);
		return returnid?out:out.map( gid2ch );
	};
	const getLastComps=(value)=>{
		if (!value) return [];
		const chars=splitUTF32Char(value);
		if (!chars.length) return [];
		return componentsOf(chars[chars.length-1]);
	};
	const isFontReady=()=>!!ptk$1;
	const isDataReady=()=>cjkbmp.length&&cjkext.length;

	const autoPinx=(ch,base)=>{
		if (ch==base || !base) return ''
		const f1=factorsOfGD( getGlyph$1(ch), true);
		const f2=factorsOfGD( (getGlyph$1(base))).map(it=> UnifiedComps_UTF32[it]||it );
		// if (ch==='䭙') console.log(f1,f2.map(it=>String.fromCodePoint(it)),ch,base)
		const commonpart=intersect(f1,f2);
		const from=f2.filter(it=>commonpart.indexOf(it)==-1);
		const to=f1.filter(it=>commonpart.indexOf(it)==-1);

		if (from.length===1 && to.length===1) {
			return base+String.fromCodePoint(from)+String.fromCodePoint(to);
		}
		return ''
	};
	const splitPinx=(str, tryAutoIRE=false)=>{
		const out=[];
		const chars=splitUTF32Char(str);
		let i=0;
		let nesting=0 ,ire='';  
		while (i<chars.length) {
			nesting&&nesting--;
			const comps=componentsOf(chars[i]);
			if (~comps.indexOf( chars[i+1] ) ){//|| Instructions[chars[i+1]]) {
				ire += chars[i]+chars[i+1];
				nesting++;
				i++;
			} else {
				if (nesting) {
					ire+=chars[i];
				} else {
					if (ire) {
						out.push(ire+chars[i]);	
						ire='';
					} else {
						let ch=chars[i];
						if (tryAutoIRE&&!getGlyph$1(ch)) { //not found, try to replace with ire
							ch=autoPinx(ch) || ch;
						}
						out.push(ch);
					}
				}
			}
			i++;
		}
		ire&&out.push(ire);
		return out;
	};
	const validIRE=(ire)=>codePointLength(ire)>1 && (splitPinx(ire)).length==1;

	/*! kage.js v0.4.0
	 *  Licensed under GPL-3.0
	 *  https://github.com/kurgm/kage-engine#readme
	 */
	/**
	 * A key-value store that maps a glyph name to a string of KAGE data.
	 */
	var Buhin = /** @class */ (function () {
	    function Buhin() {
	        // initialize
	        // no operation
	        this.hash = {};
	    }
	    // method
	    /**
	     * Adds or updates an element with a given glyph name and KAGE data.
	     * @param name The name of the glyph.
	     * @param data The KAGE data.
	     */
	    Buhin.prototype.set = function (name, data) {
	        this.hash[name] = data;
	    };
	    /**
	     * Search the store for a specified glyph name and returns the corresponding
	     * KAGE data.
	     * @param name The name of the glyph to be looked up.
	     * @returns The KAGE data if found, or an empty string if not found.
	     */
	    Buhin.prototype.search = function (name) {
	        if (this.hash[name]) {
	            return this.hash[name];
	        }
	        return ""; // no data
	    };
	    /**
	     * Adds or updates and element with a given glyph name and KAGE data.
	     * It is an alias of {@link set} method.
	     * @param name The name of the glyph.
	     * @param data The KAGE data.
	     */
	    Buhin.prototype.push = function (name, data) {
	        this.set(name, data);
	    };
	    return Buhin;
	}());

	/**
	 * Represents the rendered glyph.
	 *
	 * A glyph is represented as a series of {@link Polygon}'s.
	 * The contained {@link Polygon}'s can be accessed by the {@link array} property.
	 */
	var Polygons = /** @class */ (function () {
	    function Polygons() {
	        // property
	        this.array = [];
	    }
	    // method
	    /** Clears the content. */
	    Polygons.prototype.clear = function () {
	        this.array = [];
	    };
	    /**
	     * Appends a new {@link Polygon} to the end of the array.
	     * Nothing is performed if `polygon` is not a valid polygon.
	     * @param polygon An instance of {@link Polygon} to be appended.
	     */
	    Polygons.prototype.push = function (polygon) {
	        // only a simple check
	        var minx = 200;
	        var maxx = 0;
	        var miny = 200;
	        var maxy = 0;
	        if (polygon.length < 3) {
	            return;
	        }
	        polygon.floor();
	        for (var _i = 0, _a = polygon.array; _i < _a.length; _i++) {
	            var _b = _a[_i], x = _b.x, y = _b.y;
	            if (x < minx) {
	                minx = x;
	            }
	            if (x > maxx) {
	                maxx = x;
	            }
	            if (y < miny) {
	                miny = y;
	            }
	            if (y > maxy) {
	                maxy = y;
	            }
	            if (isNaN(x) || isNaN(y)) {
	                return;
	            }
	        }
	        if (minx !== maxx && miny !== maxy) {
	            this.array.push(polygon);
	        }
	    };
	    /**
	     * Generates a string in SVG format that represents the rendered glyph.
	     * @param curve Set to true to use `<path />` format or set to false to use
	     *     `<polygon />` format. Must be set to true if the glyph was rendered with
	     *     `kage.kFont.kUseCurve = true`. The `<polygon />` format is used if
	     *     unspecified.
	     * @returns The string representation of the rendered glyph in SVG format.
	     */
	    Polygons.prototype.generateSVG = function (curve) {
	        var buffer = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
	            + 'version="1.1" baseProfile="full" viewBox="0 0 200 200" width="200" height="200">\n';
	        if (curve) {
	            for (var _i = 0, _a = this.array; _i < _a.length; _i++) {
	                var array = _a[_i].array;
	                var mode = "L";
	                buffer += '<path d="';
	                for (var j = 0; j < array.length; j++) {
	                    if (j === 0) {
	                        buffer += "M ";
	                    }
	                    else if (array[j].off) {
	                        buffer += "Q ";
	                        mode = "Q";
	                    }
	                    else if (mode === "Q" && !array[j - 1].off) {
	                        buffer += "L ";
	                    }
	                    else if (mode === "L" && j === 1) {
	                        buffer += "L ";
	                    }
	                    buffer += "".concat(array[j].x, ",").concat(array[j].y, " ");
	                }
	                buffer += 'Z" fill="black" />\n';
	            }
	        }
	        else {
	            buffer += '<g fill="black">\n';
	            buffer += this.array.map(function (_a) {
	                var array = _a.array;
	                return "<polygon points=\"".concat(array.map(function (_a) {
	                    var x = _a.x, y = _a.y;
	                    return "".concat(x, ",").concat(y, " ");
	                }).join(""), "\" />\n");
	            }).join("");
	            buffer += "</g>\n";
	        }
	        buffer += "</svg>\n";
	        return buffer;
	    };
	    /**
	     * Generates a string in EPS format that represents the rendered glyph.
	     * @returns The string representation of the rendered glyph in EPS format.
	     */
	    Polygons.prototype.generateEPS = function () {
	        var buffer = "";
	        buffer += "%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 -208 1024 816\n%%Pages: 0\n%%Title: Kanji glyph\n%%Creator: GlyphWiki powered by KAGE system\n%%CreationDate: ".concat(new Date().toString(), "\n%%EndComments\n%%EndProlog\n");
	        for (var _i = 0, _a = this.array; _i < _a.length; _i++) {
	            var array = _a[_i].array;
	            for (var j = 0; j < array.length; j++) {
	                buffer += "".concat(array[j].x * 5, " ").concat(1000 - array[j].y * 5 - 200, " ");
	                if (j === 0) {
	                    buffer += "newpath\nmoveto\n";
	                }
	                else {
	                    buffer += "lineto\n";
	                }
	            }
	            buffer += "closepath\nfill\n";
	        }
	        buffer += "%%EOF\n";
	        return buffer;
	    };
	    return Polygons;
	}());
	(function () {
	    if (typeof Symbol !== "undefined" && Symbol.iterator) {
	        Polygons.prototype[Symbol.iterator] = function () {
	            return this.array[Symbol.iterator]();
	        };
	    }
	})();

	/** @internal */
	var hypot = Math.hypot ? Math.hypot.bind(Math) : (function (x, y) { return Math.sqrt(x * x + y * y); });
	/**
	 * Calculates a new vector with the same angle and a new magnitude.
	 * @internal
	 */
	function normalize(_a, magnitude) {
	    var x = _a[0], y = _a[1];
	    if (magnitude === void 0) { magnitude = 1; }
	    if (x === 0 && y === 0) {
	        // Angle is the same as Math.atan2(y, x)
	        return [1 / x === Infinity ? magnitude : -magnitude, 0];
	    }
	    var k = magnitude / hypot(x, y);
	    return [x * k, y * k];
	}
	/** @internal */
	function quadraticBezier(p1, p2, p3, t) {
	    var s = 1 - t;
	    return (s * s) * p1 + 2 * (s * t) * p2 + (t * t) * p3;
	}
	/**
	 * Returns d/dt(quadraticBezier)
	 * @internal
	 */
	function quadraticBezierDeriv(p1, p2, p3, t) {
	    // const s = 1 - t;
	    // ds/dt = -1
	    // return (-2 * s) * p1 + 2 * (s - t) * p2 + (2 * t) * p3;
	    return 2 * (t * (p1 - 2 * p2 + p3) - p1 + p2);
	}
	/** @internal */
	function cubicBezier(p1, p2, p3, p4, t) {
	    var s = 1 - t;
	    return (s * s * s) * p1 + 3 * (s * s * t) * p2 + 3 * (s * t * t) * p3 + (t * t * t) * p4;
	}
	/**
	 * Returns d/dt(cubicBezier)
	 * @internal
	 */
	function cubicBezierDeriv(p1, p2, p3, p4, t) {
	    // const s = 1 - t;
	    // ds/dt = -1
	    // const ss = s * s;
	    // const st = s * t;
	    // const tt = t * t;
	    // return (-3 * ss) * p1 + 3 * (ss - 2 * st) * p2 + 3 * (2 * st - tt) * p3 + (3 * tt) * p4;
	    return 3 * (t * (t * (-p1 + 3 * p2 - 3 * p3 + p4) + 2 * (p1 - 2 * p2 + p3)) - p1 + p2);
	}
	/**
	 * Find the minimum of a function by ternary search.
	 * @internal
	 */
	function ternarySearchMin(func, left, right, eps) {
	    if (eps === void 0) { eps = 1E-5; }
	    while (left + eps < right) {
	        var x1 = left + (right - left) / 3;
	        var x2 = right - (right - left) / 3;
	        var y1 = func(x1);
	        var y2 = func(x2);
	        if (y1 < y2) {
	            right = x2;
	        }
	        else {
	            left = x1;
	        }
	    }
	    return left + (right - left) / 2;
	}
	/** @internal */
	function round(v, rate) {
	    if (rate === void 0) { rate = 1E8; }
	    return Math.round(v * rate) / rate;
	}

	// Reference : http://www.cam.hi-ho.ne.jp/strong_warriors/teacher/chapter0{4,5}.html
	/** Cross product of two vectors */
	function cross(x1, y1, x2, y2) {
	    return x1 * y2 - x2 * y1;
	}
	// class Point {
	// 	constructor(public x: number, public y: number) {
	// 	}
	// }
	// function getCrossPoint(
	// 	x11: number, y11: number, x12: number, y12: number,
	// 	x21: number, y21: number, x22: number, y22: number) {
	// 	const a1 = y12 - y11;
	// 	const b1 = x11 - x12;
	// 	const c1 = -1 * a1 * x11 - b1 * y11;
	// 	const a2 = y22 - y21;
	// 	const b2 = x21 - x22;
	// 	const c2 = -1 * a2 * x21 - b2 * y21;
	//
	// 	const temp = b1 * a2 - b2 * a1;
	// 	if (temp === 0) { // parallel
	// 		return null;
	// 	}
	// 	return new Point((c1 * b2 - c2 * b1) / temp, (a1 * c2 - a2 * c1) / temp);
	// }
	/** @internal */
	function isCross(x11, y11, x12, y12, x21, y21, x22, y22) {
	    var cross_1112_2122 = cross(x12 - x11, y12 - y11, x22 - x21, y22 - y21);
	    if (isNaN(cross_1112_2122)) {
	        return true; // for backward compatibility...
	    }
	    if (cross_1112_2122 === 0) {
	        // parallel
	        return false; // XXX should check if segments overlap?
	    }
	    var cross_1112_1121 = cross(x12 - x11, y12 - y11, x21 - x11, y21 - y11);
	    var cross_1112_1122 = cross(x12 - x11, y12 - y11, x22 - x11, y22 - y11);
	    var cross_2122_2111 = cross(x22 - x21, y22 - y21, x11 - x21, y11 - y21);
	    var cross_2122_2112 = cross(x22 - x21, y22 - y21, x12 - x21, y12 - y21);
	    return round(cross_1112_1121 * cross_1112_1122, 1E5) <= 0 && round(cross_2122_2111 * cross_2122_2112, 1E5) <= 0;
	}
	/** @internal */
	function isCrossBox(x1, y1, x2, y2, bx1, by1, bx2, by2) {
	    if (isCross(x1, y1, x2, y2, bx1, by1, bx2, by1)) {
	        return true;
	    }
	    if (isCross(x1, y1, x2, y2, bx2, by1, bx2, by2)) {
	        return true;
	    }
	    if (isCross(x1, y1, x2, y2, bx1, by2, bx2, by2)) {
	        return true;
	    }
	    if (isCross(x1, y1, x2, y2, bx1, by1, bx1, by2)) {
	        return true;
	    }
	    return false;
	}

	function stretch(dp, sp, p, min, max) {
	    var p1;
	    var p2;
	    var p3;
	    var p4;
	    if (p < sp + 100) {
	        p1 = min;
	        p3 = min;
	        p2 = sp + 100;
	        p4 = dp + 100;
	    }
	    else {
	        p1 = sp + 100;
	        p3 = dp + 100;
	        p2 = max;
	        p4 = max;
	    }
	    return Math.floor(((p - p1) / (p2 - p1)) * (p4 - p3) + p3);
	}
	/** @internal */
	var Stroke = /** @class */ (function () {
	    function Stroke(data) {
	        this.a1_100 = data[0], this.a2_100 = data[1], this.a3_100 = data[2], this.x1 = data[3], this.y1 = data[4], this.x2 = data[5], this.y2 = data[6], this.x3 = data[7], this.y3 = data[8], this.x4 = data[9], this.y4 = data[10];
	        this.a1_opt = Math.floor(this.a1_100 / 100);
	        this.a1_100 %= 100;
	        this.a2_opt = Math.floor(this.a2_100 / 100);
	        this.a2_100 %= 100;
	        this.a2_opt_1 = this.a2_opt % 10;
	        this.a2_opt_2 = Math.floor(this.a2_opt / 10) % 10;
	        this.a2_opt_3 = Math.floor(this.a2_opt / 100);
	        this.a3_opt = Math.floor(this.a3_100 / 100);
	        this.a3_100 %= 100;
	        this.a3_opt_1 = this.a3_opt % 10;
	        this.a3_opt_2 = Math.floor(this.a3_opt / 10);
	    }
	    Stroke.prototype.getControlSegments = function () {
	        var res = [];
	        var a1 = this.a1_opt === 0
	            ? this.a1_100
	            : 1; // ?????
	        switch (a1) {
	            case 0:
	            case 8:
	            case 9:
	                break;
	            case 6:
	            case 7:
	                res.unshift([this.x3, this.y3, this.x4, this.y4]);
	            // falls through
	            case 2:
	            case 12:
	            case 3:
	            case 4:
	                res.unshift([this.x2, this.y2, this.x3, this.y3]);
	            // falls through
	            default:
	                res.unshift([this.x1, this.y1, this.x2, this.y2]);
	        }
	        return res;
	    };
	    Stroke.prototype.isCross = function (bx1, by1, bx2, by2) {
	        return this.getControlSegments().some(function (_a) {
	            var x1 = _a[0], y1 = _a[1], x2 = _a[2], y2 = _a[3];
	            return (isCross(x1, y1, x2, y2, bx1, by1, bx2, by2));
	        });
	    };
	    Stroke.prototype.isCrossBox = function (bx1, by1, bx2, by2) {
	        return this.getControlSegments().some(function (_a) {
	            var x1 = _a[0], y1 = _a[1], x2 = _a[2], y2 = _a[3];
	            return (isCrossBox(x1, y1, x2, y2, bx1, by1, bx2, by2));
	        });
	    };
	    Stroke.prototype.stretch = function (sx, sx2, sy, sy2, bminX, bmaxX, bminY, bmaxY) {
	        this.x1 = stretch(sx, sx2, this.x1, bminX, bmaxX);
	        this.y1 = stretch(sy, sy2, this.y1, bminY, bmaxY);
	        this.x2 = stretch(sx, sx2, this.x2, bminX, bmaxX);
	        this.y2 = stretch(sy, sy2, this.y2, bminY, bmaxY);
	        if (!(this.a1_100 === 99 && this.a1_opt === 0)) { // always true
	            this.x3 = stretch(sx, sx2, this.x3, bminX, bmaxX);
	            this.y3 = stretch(sy, sy2, this.y3, bminY, bmaxY);
	            this.x4 = stretch(sx, sx2, this.x4, bminX, bmaxX);
	            this.y4 = stretch(sy, sy2, this.y4, bminY, bmaxY);
	        }
	    };
	    Stroke.prototype.getBox = function () {
	        var minX = Infinity;
	        var minY = Infinity;
	        var maxX = -Infinity;
	        var maxY = -Infinity;
	        var a1 = this.a1_opt === 0
	            ? this.a1_100
	            : 6; // ?????
	        switch (a1) {
	            default:
	                minX = Math.min(minX, this.x4);
	                maxX = Math.max(maxX, this.x4);
	                minY = Math.min(minY, this.y4);
	                maxY = Math.max(maxY, this.y4);
	            // falls through
	            case 2:
	            case 3:
	            case 4:
	                minX = Math.min(minX, this.x3);
	                maxX = Math.max(maxX, this.x3);
	                minY = Math.min(minY, this.y3);
	                maxY = Math.max(maxY, this.y3);
	            // falls through
	            case 1:
	            case 99: // unnecessary?
	                minX = Math.min(minX, this.x1, this.x2);
	                maxX = Math.max(maxX, this.x1, this.x2);
	                minY = Math.min(minY, this.y1, this.y2);
	                maxY = Math.max(maxY, this.y1, this.y2);
	            // falls through
	            case 0:
	        }
	        return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
	    };
	    return Stroke;
	}());

	/** Enum of the supported fonts. */
	var KShotai;
	(function (KShotai) {
	    /**
	     * Mincho style font.
	     * @see {@link Mincho} for its corresponding font class.
	     */
	    KShotai[KShotai["kMincho"] = 0] = "kMincho";
	    /**
	     * Gothic style font.
	     * @see {@link Gothic} for its corresponding font class.
	     */
	    KShotai[KShotai["kGothic"] = 1] = "kGothic";
	})(KShotai || (KShotai = {}));

	/** @internal */
	function divide_curve(x1, y1, sx1, sy1, x2, y2, curve) {
	    var rate = 0.5;
	    var cut = Math.floor(curve.length * rate);
	    var cut_rate = cut / curve.length;
	    var tx1 = x1 + (sx1 - x1) * cut_rate;
	    var ty1 = y1 + (sy1 - y1) * cut_rate;
	    var tx2 = sx1 + (x2 - sx1) * cut_rate;
	    var ty2 = sy1 + (y2 - sy1) * cut_rate;
	    var tx3 = tx1 + (tx2 - tx1) * cut_rate;
	    var ty3 = ty1 + (ty2 - ty1) * cut_rate;
	    // must think about 0 : <0
	    return {
	        index: cut,
	        off: [[x1, y1, tx1, ty1, tx3, ty3], [tx3, ty3, tx2, ty2, x2, y2]],
	    };
	}
	// ------------------------------------------------------------------
	/** @internal */
	function find_offcurve(curve, sx, sy) {
	    var _a = curve[0], nx1 = _a[0], ny1 = _a[1];
	    var _b = curve[curve.length - 1], nx2 = _b[0], ny2 = _b[1];
	    var area = 8;
	    var minx = ternarySearchMin(function (tx) { return curve.reduce(function (diff, p, i) {
	        var t = i / (curve.length - 1);
	        var x = quadraticBezier(nx1, tx, nx2, t);
	        return diff + Math.pow((p[0] - x), 2);
	    }, 0); }, sx - area, sx + area);
	    var miny = ternarySearchMin(function (ty) { return curve.reduce(function (diff, p, i) {
	        var t = i / (curve.length - 1);
	        var y = quadraticBezier(ny1, ty, ny2, t);
	        return diff + Math.pow((p[1] - y), 2);
	    }, 0); }, sy - area, sy + area);
	    return [nx1, ny1, minx, miny, nx2, ny2];
	}
	// ------------------------------------------------------------------
	/** @internal */
	function generateFattenCurve(x1, y1, sx1, sy1, sx2, sy2, x2, y2, kRate, widthFunc, normalize_) {
	    if (normalize_ === void 0) { normalize_ = normalize; }
	    var curve = { left: [], right: [] };
	    var isQuadratic = sx1 === sx2 && sy1 === sy2;
	    var xFunc, yFunc, ixFunc, iyFunc;
	    if (isQuadratic) {
	        // Spline
	        xFunc = function (t) { return quadraticBezier(x1, sx1, x2, t); };
	        yFunc = function (t) { return quadraticBezier(y1, sy1, y2, t); };
	        ixFunc = function (t) { return quadraticBezierDeriv(x1, sx1, x2, t); };
	        iyFunc = function (t) { return quadraticBezierDeriv(y1, sy1, y2, t); };
	    }
	    else { // Bezier
	        xFunc = function (t) { return cubicBezier(x1, sx1, sx2, x2, t); };
	        yFunc = function (t) { return cubicBezier(y1, sy1, sy2, y2, t); };
	        ixFunc = function (t) { return cubicBezierDeriv(x1, sx1, sx2, x2, t); };
	        iyFunc = function (t) { return cubicBezierDeriv(y1, sy1, sy2, y2, t); };
	    }
	    for (var tt = 0; tt <= 1000; tt += kRate) {
	        var t = tt / 1000;
	        // calculate a dot
	        var x = xFunc(t);
	        var y = yFunc(t);
	        // KATAMUKI of vector by BIBUN
	        var ix = ixFunc(t);
	        var iy = iyFunc(t);
	        var width = widthFunc(t);
	        // line SUICHOKU by vector
	        var _a = normalize_([-iy, ix], width), ia = _a[0], ib = _a[1];
	        curve.left.push([x - ia, y - ib]);
	        curve.right.push([x + ia, y + ib]);
	    }
	    return curve;
	}

	/**
	 * Represents a single contour of a rendered glyph.
	 *
	 * A contour that a Polygon represents is a closed curve made up of straight line
	 * segments or quadratic Bézier curve segments. A Polygon is represented as a
	 * series of {@link Point}'s, each of which is an on-curve point or an off-curve
	 * point. Two consecutive on-curve points define a line segment. A sequence of
	 * two on-curve points with an off-curve point in between defines a curve segment.
	 * The last point and the first point of a Polygon define a line segment that closes
	 * the loop (if the two points differ).
	 */
	var Polygon = /** @class */ (function () {
	    function Polygon(param) {
	        this._precision = 10;
	        // property
	        this._array = [];
	        // initialize
	        if (param) {
	            if (typeof param === "number") {
	                for (var i = 0; i < param; i++) {
	                    this.push(0, 0, false);
	                }
	            }
	            else {
	                for (var _i = 0, param_1 = param; _i < param_1.length; _i++) {
	                    var _a = param_1[_i], x = _a.x, y = _a.y, off = _a.off;
	                    this.push(x, y, off);
	                }
	            }
	        }
	    }
	    Object.defineProperty(Polygon.prototype, "array", {
	        /**
	         * A read-only array consisting of the points in this contour.
	         *
	         * Modifications to this array do NOT affect the contour;
	         * call {@link set} method to modify the contour.
	         *
	         * @example
	         * ```ts
	         * for (const point of polygon.array) {
	         * 	// ...
	         * }
	         * ```
	         *
	         * Note that the computation of coordinates of all the points is performed
	         * every time this property is accessed. To get a better performance, consider
	         * caching the result in a variable when you need to access the array repeatedly.
	         * ```ts
	         * // DO:
	         * const array = polygon.array;
	         * for (let i = 0; i < array.length; i++) {
	         * 	const point = array[i];
	         * 	// ...
	         * }
	         *
	         * // DON'T:
	         * for (let i = 0; i < polygon.array.length; i++) {
	         * 	const point = polygon.array[i];
	         * 	// ...
	         * }
	         * ```
	         *
	         * @see {@link Polygon.length} is faster if you only need the length.
	         * @see {@link Polygon.get} is faster if you need just one element.
	         */
	        get: function () {
	            var _this = this;
	            return this._array.map(function (_, i) { return _this.get(i); });
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Polygon.prototype, "length", {
	        /** The number of points in this contour. */
	        // Added by @kurgm
	        get: function () {
	            return this._array.length;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    // method
	    /**
	     * Appends a point at the end of its contour.
	     * @param x The x-coordinate of the appended point.
	     * @param y The y-coordiante of the appended point.
	     * @param off Whether the appended point is an off-curve point. Defaults to `false`.
	     */
	    Polygon.prototype.push = function (x, y, off) {
	        if (off === void 0) { off = false; }
	        this._array.push(this.createInternalPoint(x, y, off));
	    };
	    /**
	     * Appends a point at the end of its contour.
	     * @param point The appended point.
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.pushPoint = function (point) {
	        this.push(point.x, point.y, point.off);
	    };
	    /**
	     * Mutates a point in its contour.
	     * @param index The index in the contour of the point to be mutated.
	     * @param x The new x-coordinate of the point.
	     * @param y The new y-coordinate of the point.
	     * @param off Whether the new point is an off-curve point. Defaults to `false`.
	     */
	    Polygon.prototype.set = function (index, x, y, off) {
	        if (off === void 0) { off = false; }
	        this._array[index] = this.createInternalPoint(x, y, off);
	    };
	    /**
	     * Mutates a point in its contour.
	     * @param index The index in the contour of the point to be mutated.
	     * @param point A point of the new coordinate values. Omitting `off` property makes
	     *     the point an on-curve point (as if `off: false` were specified).
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.setPoint = function (index, point) {
	        this.set(index, point.x, point.y, point.off);
	    };
	    /**
	     * Retrieves a point in its contour. If the index is out of bounds,
	     * throws an error.
	     * @param index The index in the contour of the point to be retrieved.
	     * @returns A read-only point object. Modifications made to the returned
	     *     object do NOT affect the values of the point in the contour;
	     *     call {@link set} method to modify the contour.
	     * @example
	     * ```ts
	     * for (let i = 0; i < polygon.length; i++) {
	     * 	const point = polygon.get(i);
	     * 	// ...
	     * }
	     * ```
	     */
	    // Added by @kurgm
	    Polygon.prototype.get = function (index) {
	        var _a = this._array[index], x = _a.x, y = _a.y, off = _a.off;
	        if (this._precision === 0) {
	            return { x: x, y: y, off: off };
	        }
	        return {
	            x: x / this._precision,
	            y: y / this._precision,
	            off: off,
	        };
	    };
	    /**
	     * Reverses the points in its contour.
	     */
	    Polygon.prototype.reverse = function () {
	        this._array.reverse();
	    };
	    /**
	     * Appends the points in the contour of another {@link Polygon} at the end of
	     * this contour. The other Polygon is not mutated.
	     * @param poly The other {@link Polygon} to be appended.
	     */
	    Polygon.prototype.concat = function (poly) {
	        if (this._precision !== poly._precision) {
	            throw new TypeError("Cannot concat polygon's with different precisions");
	        }
	        this._array = this._array.concat(poly._array);
	    };
	    /**
	     * Removes the first point in its contour. If there are no points in the contour,
	     * nothing is performed.
	     */
	    Polygon.prototype.shift = function () {
	        this._array.shift();
	    };
	    /**
	     * Inserts a new point at the start of its contour.
	     * @param x The x-coordinate of the inserted point.
	     * @param y The y-coordiante of the inserted point.
	     * @param off Whether the inserted point is an off-curve point. Defaults to `false`.
	     */
	    Polygon.prototype.unshift = function (x, y, off) {
	        if (off === void 0) { off = false; }
	        this._array.unshift(this.createInternalPoint(x, y, off));
	    };
	    /**
	     * Creates a deep copy of this Polygon.
	     * @returns A new {@link Polygon} instance.
	     */
	    // Added by @kurgm
	    Polygon.prototype.clone = function () {
	        return new Polygon(this.array);
	    };
	    Polygon.prototype.createInternalPoint = function (x, y, off) {
	        if (off === void 0) { off = false; }
	        if (this._precision === 0) {
	            return { x: x, y: y, off: off };
	        }
	        return {
	            x: x * this._precision,
	            y: y * this._precision,
	            off: off,
	        };
	    };
	    /**
	     * Translates the whole polygon by the given amount.
	     * @param dx The x-amount of translation.
	     * @param dy The y-amount of translation.
	     * @returns This object (for chaining).
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.translate = function (dx, dy) {
	        if (this._precision !== 0) {
	            dx *= this._precision;
	            dy *= this._precision;
	        }
	        for (var _i = 0, _a = this._array; _i < _a.length; _i++) {
	            var point = _a[_i];
	            point.x += dx;
	            point.y += dy;
	        }
	        return this;
	    };
	    /**
	     * Flips the sign of the x-coordinate of each point in the contour.
	     * @returns This object (for chaining).
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.reflectX = function () {
	        for (var _i = 0, _a = this._array; _i < _a.length; _i++) {
	            var point = _a[_i];
	            point.x *= -1;
	        }
	        return this;
	    };
	    /**
	     * Flips the sign of the y-coordinate of each point in the contour.
	     * @returns This object (for chaining).
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.reflectY = function () {
	        for (var _i = 0, _a = this._array; _i < _a.length; _i++) {
	            var point = _a[_i];
	            point.y *= -1;
	        }
	        return this;
	    };
	    /**
	     * Rotates the whole polygon by 90 degrees clockwise.
	     * @returns This object (for chaining).
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.rotate90 = function () {
	        for (var _i = 0, _a = this._array; _i < _a.length; _i++) {
	            var point = _a[_i];
	            var x = point.x, y = point.y;
	            point.x = -y;
	            point.y = x;
	        }
	        return this;
	    };
	    /**
	     * Rotates the whole polygon by 180 degrees.
	     * {@link scale}(-1).
	     * @returns This object (for chaining).
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.rotate180 = function () {
	        for (var _i = 0, _a = this._array; _i < _a.length; _i++) {
	            var point = _a[_i];
	            point.x *= -1;
	            point.y *= -1;
	        }
	        return this;
	    };
	    /**
	     * Rotates the whole polygon by 270 degrees clockwise.
	     * @returns This object (for chaining).
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.rotate270 = function () {
	        for (var _i = 0, _a = this._array; _i < _a.length; _i++) {
	            var point = _a[_i];
	            var x = point.x, y = point.y;
	            point.x = y;
	            point.y = -x;
	        }
	        return this;
	    };
	    /**
	     * @returns This object (for chaining).
	     * @internal
	     */
	    // Added by @kurgm
	    Polygon.prototype.floor = function () {
	        if (this._precision === 0) {
	            return this;
	        }
	        for (var _i = 0, _a = this._array; _i < _a.length; _i++) {
	            var point = _a[_i];
	            var x = point.x, y = point.y;
	            point.x = Math.floor(x);
	            point.y = Math.floor(y);
	        }
	        return this;
	    };
	    return Polygon;
	}());
	(function () {
	    if (typeof Symbol !== "undefined" && Symbol.iterator) {
	        Polygon.prototype[Symbol.iterator] = function () {
	            var _this = this;
	            var i = 0;
	            return {
	                next: function () {
	                    if (i < _this._array.length) {
	                        return {
	                            done: false,
	                            value: _this.get(i++),
	                        };
	                    }
	                    return { done: true, value: undefined };
	                },
	            };
	        };
	    }
	})();

	/**
	 * Calculates global coordinates from local coordinates around a pen
	 * using its position and direction.
	 * @internal
	 */
	var Pen = /** @class */ (function () {
	    function Pen(x, y) {
	        this.cos_theta = 1;
	        this.sin_theta = 0;
	        this.x = x;
	        this.y = y;
	    }
	    Pen.prototype.setMatrix2 = function (cos_theta, sin_theta) {
	        this.cos_theta = cos_theta;
	        this.sin_theta = sin_theta;
	        return this;
	    };
	    Pen.prototype.setLeft = function (otherX, otherY) {
	        var _a = normalize([otherX - this.x, otherY - this.y]), dx = _a[0], dy = _a[1];
	        // Given: rotate(theta)((-1, 0)) = (dx, dy)
	        // Determine: (cos theta, sin theta) = rotate(theta)((1, 0))
	        // = (-dx, -dy)
	        this.setMatrix2(-dx, -dy);
	        return this;
	    };
	    Pen.prototype.setRight = function (otherX, otherY) {
	        var _a = normalize([otherX - this.x, otherY - this.y]), dx = _a[0], dy = _a[1];
	        this.setMatrix2(dx, dy);
	        return this;
	    };
	    Pen.prototype.setUp = function (otherX, otherY) {
	        var _a = normalize([otherX - this.x, otherY - this.y]), dx = _a[0], dy = _a[1];
	        // Given: rotate(theta)((0, -1)) = (dx, dy)
	        // Determine: (cos theta, sin theta) = rotate(theta)((1, 0))
	        // = (-dy, dx)
	        this.setMatrix2(-dy, dx);
	        return this;
	    };
	    Pen.prototype.setDown = function (otherX, otherY) {
	        var _a = normalize([otherX - this.x, otherY - this.y]), dx = _a[0], dy = _a[1];
	        this.setMatrix2(dy, -dx);
	        return this;
	    };
	    Pen.prototype.move = function (localDx, localDy) {
	        var _a;
	        (_a = this.getPoint(localDx, localDy), this.x = _a.x, this.y = _a.y);
	        return this;
	    };
	    Pen.prototype.getPoint = function (localX, localY, off) {
	        return {
	            x: this.x + this.cos_theta * localX + -this.sin_theta * localY,
	            y: this.y + this.sin_theta * localX + this.cos_theta * localY,
	            off: off,
	        };
	    };
	    Pen.prototype.getPolygon = function (localPoints) {
	        var _this = this;
	        return new Polygon(localPoints.map(function (_a) {
	            var x = _a.x, y = _a.y, off = _a.off;
	            return _this.getPoint(x, y, off);
	        }));
	    };
	    return Pen;
	}());

	function cdDrawCurveU$1(font, polygons, x1, y1, sx1, sy1, sx2, sy2, x2, y2, ta1, ta2, opt1, haneAdjustment, opt3, opt4) {
	    var a1 = ta1;
	    var a2 = ta2;
	    var kMinWidthT = font.kMinWidthT - opt1 / 2;
	    var delta1;
	    switch (a1 % 100) {
	        case 0:
	        case 7:
	        case 27:
	            delta1 = -1 * font.kMinWidthY * 0.5;
	            break;
	        case 1:
	        case 2: // ... must be 32
	        case 6:
	        case 22:
	        case 32: // changed
	            delta1 = 0;
	            break;
	        case 12:
	            // case 32:
	            delta1 = font.kMinWidthY;
	            break;
	        default:
	            return;
	    }
	    if (delta1 !== 0) {
	        var _a = (x1 === sx1 && y1 === sy1)
	            ? [0, delta1] // ?????
	            : normalize([x1 - sx1, y1 - sy1], delta1), dx1 = _a[0], dy1 = _a[1];
	        x1 += dx1;
	        y1 += dy1;
	    }
	    var cornerOffset = 0;
	    if ((a1 === 22 || a1 === 27) && a2 === 7 && kMinWidthT > 6) {
	        var contourLength = hypot(sx1 - x1, sy1 - y1) + hypot(sx2 - sx1, sy2 - sy1) + hypot(x2 - sx2, y2 - sy2);
	        if (contourLength < 100) {
	            cornerOffset = (kMinWidthT - 6) * ((100 - contourLength) / 100);
	            x1 += cornerOffset;
	        }
	    }
	    var delta2;
	    switch (a2 % 100) {
	        case 0:
	        case 1:
	        case 7:
	        case 9:
	        case 15: // it can change to 15->5
	        case 14: // it can change to 14->4
	        case 17: // no need
	        case 5:
	            delta2 = 0;
	            break;
	        case 8: // get shorten for tail's circle
	            delta2 = -1 * kMinWidthT * 0.5;
	            break;
	        default:
	            delta2 = delta1; // ?????
	            break;
	    }
	    if (delta2 !== 0) {
	        var _b = (sx2 === x2 && sy2 === y2)
	            ? [0, -delta2] // ?????
	            : normalize([x2 - sx2, y2 - sy2], delta2), dx2 = _b[0], dy2 = _b[1];
	        x2 += dx2;
	        y2 += dy2;
	    }
	    var isQuadratic = sx1 === sx2 && sy1 === sy2;
	    // ---------------------------------------------------------------
	    if (isQuadratic && font.kUseCurve) {
	        // Spline
	        // generating fatten curve -- begin
	        var hosomi_1 = 0.5;
	        var deltadFunc_1 = (a1 === 7 && a2 === 0) // L2RD: fatten
	            ? function (t) { return Math.pow(t, hosomi_1) * 1.1; } // should be font.kL2RDfatten ?
	            : (a1 === 7)
	                ? function (t) { return Math.pow(t, hosomi_1); }
	                : (a2 === 7)
	                    ? function (t) { return Math.pow((1 - t), hosomi_1); }
	                    : (opt3 > 0) // should be (opt3 > 0 || opt4 > 0) ?
	                        ? function (t) { return 1 - opt3 / 2 / (kMinWidthT - opt4 / 2) + opt3 / 2 / (kMinWidthT - opt4) * t; } // ??????
	                        : function () { return 1; };
	        var _c = generateFattenCurve(x1, y1, sx1, sy1, sx1, sy1, x2, y2, 10, function (t) {
	            var deltad = deltadFunc_1(t);
	            if (deltad < 0.15) {
	                deltad = 0.15;
	            }
	            return kMinWidthT * deltad;
	        }, function (_a, mag) {
	            var x = _a[0], y = _a[1];
	            return (y === 0)
	                ? [-mag, 0] // ?????
	                : normalize([x, y], mag);
	        }), curveL = _c.left, curveR = _c.right; // L and R
	        var _d = divide_curve(x1, y1, sx1, sy1, x2, y2, curveL), _e = _d.off, offL1 = _e[0], offL2 = _e[1], indexL = _d.index;
	        var curveL1 = curveL.slice(0, indexL + 1);
	        var curveL2 = curveL.slice(indexL);
	        var _f = divide_curve(x1, y1, sx1, sy1, x2, y2, curveR), _g = _f.off, offR1 = _g[0], offR2 = _g[1], indexR = _f.index;
	        var ncl1 = find_offcurve(curveL1, offL1[2], offL1[3]);
	        var ncl2 = find_offcurve(curveL2, offL2[2], offL2[3]);
	        var poly = new Polygon([
	            { x: ncl1[0], y: ncl1[1] },
	            { x: ncl1[2], y: ncl1[3], off: true },
	            { x: ncl1[4], y: ncl1[5] },
	            { x: ncl2[2], y: ncl2[3], off: true },
	            { x: ncl2[4], y: ncl2[5] },
	        ]);
	        var poly2 = new Polygon([
	            { x: curveR[0][0], y: curveR[0][1] },
	            {
	                x: offR1[2] - (ncl1[2] - offL1[2]),
	                y: offR1[3] - (ncl1[3] - offL1[3]),
	                off: true,
	            },
	            { x: curveR[indexR][0], y: curveR[indexR][1] },
	            {
	                x: offR2[2] - (ncl2[2] - offL2[2]),
	                y: offR2[3] - (ncl2[3] - offL2[3]),
	                off: true,
	            },
	            { x: curveR[curveR.length - 1][0], y: curveR[curveR.length - 1][1] },
	        ]);
	        poly2.reverse();
	        poly.concat(poly2);
	        polygons.push(poly);
	        // generating fatten curve -- end
	    }
	    else {
	        var hosomi_2 = 0.5;
	        if (hypot(x2 - x1, y2 - y1) < 50) {
	            hosomi_2 += 0.4 * (1 - hypot(x2 - x1, y2 - y1) / 50);
	        }
	        var deltadFunc_2 = (a1 === 7 || a1 === 27) && a2 === 0 // L2RD: fatten
	            ? function (t) { return Math.pow(t, hosomi_2) * font.kL2RDfatten; }
	            : (a1 === 7 || a1 === 27)
	                ? (isQuadratic) // ?????
	                    ? function (t) { return Math.pow(t, hosomi_2); }
	                    : function (t) { return Math.pow((Math.pow(t, hosomi_2)), 0.7); } // make fatten
	                : a2 === 7
	                    ? function (t) { return Math.pow((1 - t), hosomi_2); }
	                    : isQuadratic && (opt3 > 0 || opt4 > 0) // ?????
	                        ? function (t) { return ((font.kMinWidthT - opt3 / 2) - (opt4 - opt3) / 2 * t) / font.kMinWidthT; }
	                        : function () { return 1; };
	        var _h = generateFattenCurve(x1, y1, sx1, sy1, sx2, sy2, x2, y2, font.kRate, function (t) {
	            var deltad = deltadFunc_2(t);
	            if (deltad < 0.15) {
	                deltad = 0.15;
	            }
	            return kMinWidthT * deltad;
	        }, function (_a, mag) {
	            var x = _a[0], y = _a[1];
	            return (round(x) === 0 && round(y) === 0)
	                ? [-mag, 0] // ?????
	                : normalize([x, y], mag);
	        }), left = _h.left, right = _h.right;
	        var poly = new Polygon();
	        var poly2 = new Polygon();
	        // copy to polygon structure
	        for (var _i = 0, left_1 = left; _i < left_1.length; _i++) {
	            var _j = left_1[_i], x = _j[0], y = _j[1];
	            poly.push(x, y);
	        }
	        for (var _k = 0, right_1 = right; _k < right_1.length; _k++) {
	            var _l = right_1[_k], x = _l[0], y = _l[1];
	            poly2.push(x, y);
	        }
	        // suiheisen ni setsuzoku
	        if (a1 === 132 || a1 === 22 && (isQuadratic ? (y1 > y2) : (x1 > sx1))) { // ?????
	            poly.floor();
	            poly2.floor();
	            for (var index = 0, length_1 = poly2.length; index + 1 < length_1; index++) {
	                var point1 = poly2.get(index);
	                var point2 = poly2.get(index + 1);
	                if (point1.y <= y1 && y1 <= point2.y) {
	                    var newx1 = point2.x + (point1.x - point2.x) * (y1 - point2.y) / (point1.y - point2.y);
	                    var newy1 = y1;
	                    var point3 = poly.get(0);
	                    var point4 = poly.get(1);
	                    var newx2 = (a1 === 132) // ?????
	                        ? point3.x + (point4.x - point3.x) * (y1 - point3.y) / (point4.y - point3.y)
	                        : point3.x + (point4.x - point3.x + 1) * (y1 - point3.y) / (point4.y - point3.y); // "+ 1"?????
	                    var newy2 = (a1 === 132) // ?????
	                        ? y1
	                        : y1 + 1; // "+ 1"?????
	                    for (var i = 0; i < index; i++) {
	                        poly2.shift();
	                    }
	                    poly2.set(0, newx1, newy1);
	                    poly.unshift(newx2, newy2);
	                    break;
	                }
	            }
	        }
	        poly2.reverse();
	        poly.concat(poly2);
	        polygons.push(poly);
	    }
	    // process for head of stroke
	    switch (a1) {
	        case 12: {
	            var pen1 = new Pen(x1, y1);
	            if (x1 !== sx1) { // ?????
	                pen1.setDown(sx1, sy1);
	            }
	            var poly = pen1.getPolygon([
	                { x: -kMinWidthT, y: 0 },
	                { x: +kMinWidthT, y: 0 },
	                { x: -kMinWidthT, y: -kMinWidthT },
	            ]);
	            polygons.push(poly);
	            break;
	        }
	        case 0: {
	            if (y1 <= y2) { // from up to bottom
	                var pen1 = new Pen(x1, y1);
	                if (x1 !== sx1) { // ?????
	                    pen1.setDown(sx1, sy1);
	                }
	                var type = Math.atan2(Math.abs(y1 - sy1), Math.abs(x1 - sx1)) / Math.PI * 2 - 0.4;
	                if (type > 0) {
	                    type *= 2;
	                }
	                else {
	                    type *= 16;
	                }
	                var pm = type < 0 ? -1 : 1;
	                var poly = pen1.getPolygon([
	                    { x: -kMinWidthT, y: 1 },
	                    { x: +kMinWidthT, y: 0 },
	                    { x: -pm * kMinWidthT, y: -font.kMinWidthY * Math.abs(type) },
	                ]);
	                // if(x1 > x2){
	                //  poly.reverse();
	                // }
	                polygons.push(poly);
	                // beginning of the stroke
	                var move = type < 0 ? -type * font.kMinWidthY : 0;
	                var poly2 = pen1.getPolygon((x1 === sx1 && y1 === sy1) // ?????
	                    ? [
	                        { x: kMinWidthT, y: -move },
	                        { x: kMinWidthT * 1.5, y: font.kMinWidthY - move },
	                        { x: kMinWidthT - 2, y: font.kMinWidthY * 2 + 1 },
	                    ]
	                    : [
	                        { x: kMinWidthT, y: -move },
	                        { x: kMinWidthT * 1.5, y: font.kMinWidthY - move * 1.2 },
	                        { x: kMinWidthT - 2, y: font.kMinWidthY * 2 - move * 0.8 + 1 },
	                        // if(x1 < x2){
	                        //  poly2.reverse();
	                        // }
	                    ]);
	                polygons.push(poly2);
	            }
	            else { // bottom to up
	                var pen1 = new Pen(x1, y1);
	                if (x1 === sx1) {
	                    pen1.setMatrix2(0, 1); // ?????
	                }
	                else {
	                    pen1.setRight(sx1, sy1);
	                }
	                var poly = pen1.getPolygon([
	                    { x: 0, y: +kMinWidthT },
	                    { x: 0, y: -kMinWidthT },
	                    { x: -font.kMinWidthY, y: -kMinWidthT },
	                ]);
	                // if(x1 < x2){
	                //  poly.reverse();
	                // }
	                polygons.push(poly);
	                // beginning of the stroke
	                var poly2 = pen1.getPolygon([
	                    { x: 0, y: +kMinWidthT },
	                    { x: +font.kMinWidthY, y: +kMinWidthT * 1.5 },
	                    { x: +font.kMinWidthY * 3, y: +kMinWidthT * 0.5 },
	                ]);
	                // if(x1 < x2){
	                //  poly2.reverse();
	                // }
	                polygons.push(poly2);
	            }
	            break;
	        }
	        case 22:
	        case 27: { // box's up-right corner, any time same degree
	            var poly = new Pen(x1 - cornerOffset, y1).getPolygon([
	                { x: -kMinWidthT, y: -font.kMinWidthY },
	                { x: 0, y: -font.kMinWidthY - font.kWidth },
	                { x: +kMinWidthT + font.kWidth, y: +font.kMinWidthY },
	                { x: +kMinWidthT, y: +kMinWidthT - 1 },
	            ].concat((a1 === 27)
	                ? [
	                    { x: 0, y: +kMinWidthT + 2 },
	                    { x: 0, y: 0 },
	                ]
	                : [
	                    { x: -kMinWidthT, y: +kMinWidthT + 4 },
	                ]));
	            polygons.push(poly);
	            break;
	        }
	    }
	    // process for tail
	    switch (a2) {
	        case 1:
	        case 8:
	        case 15: { // the last filled circle ... it can change 15->5
	            var kMinWidthT2 = font.kMinWidthT - opt4 / 2;
	            var pen2 = new Pen(x2, y2);
	            if (sx2 === x2) {
	                pen2.setMatrix2(0, 1); // ?????
	            }
	            else if (sy2 !== y2) { // ?????
	                pen2.setLeft(sx2, sy2);
	            }
	            var poly = pen2.getPolygon((font.kUseCurve)
	                ? // by curve path
	                    [
	                        { x: 0, y: -kMinWidthT2 },
	                        { x: +kMinWidthT2 * 0.9, y: -kMinWidthT2 * 0.9, off: true },
	                        { x: +kMinWidthT2, y: 0 },
	                        { x: +kMinWidthT2 * 0.9, y: +kMinWidthT2 * 0.9, off: true },
	                        { x: 0, y: +kMinWidthT2 },
	                    ]
	                : // by polygon
	                    [
	                        { x: 0, y: -kMinWidthT2 },
	                        { x: +kMinWidthT2 * 0.7, y: -kMinWidthT2 * 0.7 },
	                        { x: +kMinWidthT2, y: 0 },
	                        { x: +kMinWidthT2 * 0.7, y: +kMinWidthT2 * 0.7 },
	                        { x: 0, y: +kMinWidthT2 },
	                    ]);
	            if (sx2 === x2) {
	                poly.reverse();
	            }
	            polygons.push(poly);
	            if (a2 === 15) { // jump up ... it can change 15->5
	                // anytime same degree
	                var pen2_r = new Pen(x2, y2);
	                if (y1 >= y2) {
	                    pen2_r.setMatrix2(-1, 0);
	                }
	                var poly_1 = pen2_r.getPolygon([
	                    { x: 0, y: -kMinWidthT + 1 },
	                    { x: +2, y: -kMinWidthT - font.kWidth * 5 },
	                    { x: 0, y: -kMinWidthT - font.kWidth * 5 },
	                    { x: -kMinWidthT, y: -kMinWidthT + 1 },
	                ]);
	                polygons.push(poly_1);
	            }
	            break;
	        }
	        case 0:
	            if (!(a1 === 7 || a1 === 27)) {
	                break;
	            }
	        // fall through
	        case 9: { // Math.sinnyu & L2RD Harai ... no need for a2=9
	            var type = Math.atan2(Math.abs(y2 - sy2), Math.abs(x2 - sx2)) / Math.PI * 2 - 0.6;
	            if (type > 0) {
	                type *= 8;
	            }
	            else {
	                type *= 3;
	            }
	            var pm = type < 0 ? -1 : 1;
	            var pen2 = new Pen(x2, y2);
	            if (sy2 === y2) {
	                pen2.setMatrix2(1, 0); // ?????
	            }
	            else if (sx2 === x2) {
	                pen2.setMatrix2(0, y2 > sy2 ? -1 : 1); // for backward compatibility...
	            }
	            else {
	                pen2.setLeft(sx2, sy2);
	            }
	            var poly = pen2.getPolygon([
	                { x: 0, y: +kMinWidthT * font.kL2RDfatten },
	                { x: 0, y: -kMinWidthT * font.kL2RDfatten },
	                { x: Math.abs(type) * kMinWidthT * font.kL2RDfatten, y: pm * kMinWidthT * font.kL2RDfatten },
	            ]);
	            polygons.push(poly);
	            break;
	        }
	        case 14: { // jump to left, allways go left
	            var jumpFactor = kMinWidthT > 6 ? 6.0 / kMinWidthT : 1.0;
	            var haneLength = font.kWidth * 4 * Math.min(1 - haneAdjustment / 10, Math.pow((kMinWidthT / font.kMinWidthT), 3)) * jumpFactor;
	            var poly = new Pen(x2, y2).getPolygon([
	                { x: 0, y: 0 },
	                { x: 0, y: -kMinWidthT },
	                { x: -haneLength, y: -kMinWidthT },
	                { x: -haneLength, y: -kMinWidthT * 0.5 },
	            ]);
	            // poly.reverse();
	            polygons.push(poly);
	            break;
	        }
	    }
	}
	function cdDrawBezier$1(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a1, a2, opt1, haneAdjustment, opt3, opt4) {
	    cdDrawCurveU$1(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a1, a2, opt1, haneAdjustment, opt3, opt4);
	}
	function cdDrawCurve$1(font, polygons, x1, y1, x2, y2, x3, y3, a1, a2, opt1, haneAdjustment, opt3, opt4) {
	    cdDrawCurveU$1(font, polygons, x1, y1, x2, y2, x2, y2, x3, y3, a1, a2, opt1, haneAdjustment, opt3, opt4);
	}
	function cdDrawLine$1(font, polygons, tx1, ty1, tx2, ty2, ta1, ta2, opt1, urokoAdjustment, kakatoAdjustment) {
	    var x1 = tx1;
	    var y1 = ty1;
	    var x2 = tx2;
	    var y2 = ty2;
	    var a1 = ta1;
	    var a2 = ta2;
	    var kMinWidthT = font.kMinWidthT - opt1 / 2;
	    if (x1 === x2 || y1 !== y2 && (x1 > x2 || Math.abs(y2 - y1) >= Math.abs(x2 - x1) || a1 === 6 || a2 === 6)) {
	        // if TATE stroke, use y-axis
	        // for others, use x-axis
	        // KAKUDO GA FUKAI or KAGI NO YOKO BOU
	        var _a = (x1 === x2)
	            ? [0, 1] // ?????
	            : normalize([x2 - x1, y2 - y1]), cosrad = _a[0], sinrad = _a[1];
	        var pen1 = new Pen(x1, y1);
	        var pen2 = new Pen(x2, y2);
	        // if (x1 !== x2) { // ?????
	        // 	pen1.setDown(x2, y2);
	        // 	pen2.setUp(x1, y1);
	        // }
	        pen1.setMatrix2(sinrad, -cosrad);
	        pen2.setMatrix2(sinrad, -cosrad);
	        var poly0 = new Polygon(4);
	        switch (a1) {
	            case 0:
	                poly0.setPoint(0, pen1.getPoint(kMinWidthT, font.kMinWidthY / 2));
	                poly0.setPoint(3, pen1.getPoint(-kMinWidthT, -font.kMinWidthY / 2));
	                break;
	            case 1:
	            case 6: // ... no need
	                poly0.setPoint(0, pen1.getPoint(kMinWidthT, 0));
	                poly0.setPoint(3, pen1.getPoint(-kMinWidthT, 0));
	                break;
	            case 12:
	                poly0.setPoint(0, pen1.getPoint(kMinWidthT, -font.kMinWidthY));
	                poly0.setPoint(3, pen1.getPoint(-kMinWidthT, -font.kMinWidthY - kMinWidthT));
	                break;
	            case 22:
	                if (x1 === x2) {
	                    poly0.set(0, x1 + kMinWidthT, y1);
	                    poly0.set(3, x1 - kMinWidthT, y1);
	                }
	                else {
	                    var v = x1 > x2 ? -1 : 1;
	                    // TODO: why " + v", " + 1" ???
	                    poly0.set(0, x1 + (kMinWidthT + v) / sinrad, y1 + 1);
	                    poly0.set(3, x1 - kMinWidthT / sinrad, y1);
	                }
	                break;
	            case 32:
	                if (x1 === x2) {
	                    poly0.set(0, x1 + kMinWidthT, y1 - font.kMinWidthY);
	                    poly0.set(3, x1 - kMinWidthT, y1 - font.kMinWidthY);
	                }
	                else {
	                    poly0.set(0, x1 + kMinWidthT / sinrad, y1);
	                    poly0.set(3, x1 - kMinWidthT / sinrad, y1);
	                }
	                break;
	        }
	        switch (a2) {
	            case 0:
	                if (a1 === 6) { // KAGI's tail ... no need
	                    poly0.setPoint(1, pen2.getPoint(kMinWidthT, 0));
	                    poly0.setPoint(2, pen2.getPoint(-kMinWidthT, 0));
	                }
	                else {
	                    poly0.setPoint(1, pen2.getPoint(kMinWidthT, -kMinWidthT / 2));
	                    poly0.setPoint(2, pen2.getPoint(-kMinWidthT, kMinWidthT / 2));
	                }
	                break;
	            case 5:
	                if (x1 === x2) {
	                    break;
	                }
	            // falls through
	            case 1: // is needed?
	                poly0.setPoint(1, pen2.getPoint(kMinWidthT, 0));
	                poly0.setPoint(2, pen2.getPoint(-kMinWidthT, 0));
	                break;
	            case 13:
	                poly0.setPoint(1, pen2.getPoint(kMinWidthT, font.kAdjustKakatoL[kakatoAdjustment]));
	                poly0.setPoint(2, pen2.getPoint(-kMinWidthT, font.kAdjustKakatoL[kakatoAdjustment] + kMinWidthT));
	                break;
	            case 23:
	                poly0.setPoint(1, pen2.getPoint(kMinWidthT, font.kAdjustKakatoR[kakatoAdjustment]));
	                poly0.setPoint(2, pen2.getPoint(-kMinWidthT, font.kAdjustKakatoR[kakatoAdjustment] + kMinWidthT));
	                break;
	            case 24: // for T/H design
	            case 32:
	                if (x1 === x2) {
	                    poly0.set(1, x2 + kMinWidthT, y2 + font.kMinWidthY);
	                    poly0.set(2, x2 - kMinWidthT, y2 + font.kMinWidthY);
	                }
	                else {
	                    poly0.set(1, x2 + kMinWidthT / sinrad, y2);
	                    poly0.set(2, x2 - kMinWidthT / sinrad, y2);
	                }
	                break;
	        }
	        polygons.push(poly0);
	        switch (a2) {
	            case 24: { // for T design
	                var poly = new Pen(x2, y2).getPolygon([
	                    { x: 0, y: +font.kMinWidthY },
	                    (x1 === x2) // ?????
	                        ? { x: +kMinWidthT, y: -font.kMinWidthY * 3 }
	                        : { x: +kMinWidthT * 0.5, y: -font.kMinWidthY * 4 },
	                    { x: +kMinWidthT * 2, y: -font.kMinWidthY },
	                    { x: +kMinWidthT * 2, y: +font.kMinWidthY },
	                ]);
	                polygons.push(poly);
	                break;
	            }
	            case 13:
	                if (kakatoAdjustment === 4) { // for new GTH box's left bottom corner
	                    if (x1 === x2) {
	                        var poly = new Pen(x2, y2).getPolygon([
	                            { x: -kMinWidthT, y: -font.kMinWidthY * 3 },
	                            { x: -kMinWidthT * 2, y: 0 },
	                            { x: -font.kMinWidthY, y: +font.kMinWidthY * 5 },
	                            { x: +kMinWidthT, y: +font.kMinWidthY },
	                        ]);
	                        polygons.push(poly);
	                    }
	                    else { // MUKI KANKEINASHI
	                        var m = (x1 > x2 && y1 !== y2)
	                            ? Math.floor((x1 - x2) / (y2 - y1) * 3)
	                            : 0;
	                        var poly = new Pen(x2 + m, y2).getPolygon([
	                            { x: 0, y: -font.kMinWidthY * 5 },
	                            { x: -kMinWidthT * 2, y: 0 },
	                            { x: -font.kMinWidthY, y: +font.kMinWidthY * 5 },
	                            { x: +kMinWidthT, y: +font.kMinWidthY },
	                            { x: 0, y: 0 },
	                        ]);
	                        polygons.push(poly);
	                    }
	                }
	                break;
	        }
	        switch (a1) {
	            case 22:
	            case 27: {
	                // box's right top corner
	                // SHIKAKU MIGIUE UROKO NANAME DEMO MASSUGU MUKI
	                var poly = new Pen(x1, y1).getPolygon([
	                    { x: -kMinWidthT, y: -font.kMinWidthY },
	                    { x: 0, y: -font.kMinWidthY - font.kWidth },
	                    { x: +kMinWidthT + font.kWidth, y: +font.kMinWidthY },
	                ].concat((x1 === x2)
	                    ? [
	                        { x: +kMinWidthT, y: +kMinWidthT },
	                        { x: -kMinWidthT, y: 0 },
	                    ]
	                    : (a1 === 27)
	                        ? [
	                            { x: +kMinWidthT, y: +kMinWidthT - 1 },
	                            { x: 0, y: +kMinWidthT + 2 },
	                            { x: 0, y: 0 },
	                        ]
	                        : [
	                            { x: +kMinWidthT, y: +kMinWidthT - 1 },
	                            { x: -kMinWidthT, y: +kMinWidthT + 4 },
	                        ]));
	                polygons.push(poly);
	                break;
	            }
	            case 0: { // beginning of the stroke
	                var poly = pen1.getPolygon([
	                    { x: kMinWidthT, y: font.kMinWidthY * 0.5 },
	                    { x: kMinWidthT + kMinWidthT * 0.5, y: font.kMinWidthY * 0.5 + font.kMinWidthY },
	                    { x: kMinWidthT - 2, y: font.kMinWidthY * 0.5 + font.kMinWidthY * 2 + 1 },
	                ]);
	                if (x1 !== x2) { // ?????
	                    poly.set(2, x1 + (kMinWidthT - 2) * sinrad + (font.kMinWidthY * 0.5 + font.kMinWidthY * 2) * cosrad, y1 + (kMinWidthT + 1) * -cosrad + (font.kMinWidthY * 0.5 + font.kMinWidthY * 2) * sinrad); // ?????
	                }
	                polygons.push(poly);
	                break;
	            }
	        }
	        if (x1 === x2 && a2 === 1 || a1 === 6 && (a2 === 0 || x1 !== x2 && a2 === 5)) {
	            // KAGI NO YOKO BOU NO SAIGO NO MARU ... no need only used at 1st=yoko
	            var poly = new Polygon();
	            if (font.kUseCurve) {
	                poly.pushPoint(pen2.getPoint(kMinWidthT, 0));
	                poly.push(x2 - cosrad * kMinWidthT * 0.9 + -sinrad * -kMinWidthT * 0.9, // typo? (- cosrad should be + cosrad)
	                y2 + sinrad * kMinWidthT * 0.9 + cosrad * -kMinWidthT * 0.9, true);
	                poly.pushPoint(pen2.getPoint(0, kMinWidthT));
	                poly.pushPoint(pen2.getPoint(-kMinWidthT * 0.9, kMinWidthT * 0.9, true));
	                poly.pushPoint(pen2.getPoint(-kMinWidthT, 0));
	            }
	            else {
	                var r = (x1 === x2 && (a1 === 6 && a2 === 0 || a2 === 1))
	                    ? 0.6
	                    : 0.8; // ?????
	                poly.pushPoint(pen2.getPoint(kMinWidthT, 0));
	                poly.pushPoint(pen2.getPoint(kMinWidthT * 0.6, kMinWidthT * r));
	                poly.pushPoint(pen2.getPoint(0, kMinWidthT));
	                poly.pushPoint(pen2.getPoint(-kMinWidthT * 0.6, kMinWidthT * r));
	                poly.pushPoint(pen2.getPoint(-kMinWidthT, 0));
	            }
	            if (x1 === x2 && (a1 === 6 && a2 === 0 || a2 === 1)) {
	                // for backward compatibility
	                poly.reverse();
	            }
	            // poly.reverse(); // for fill-rule
	            polygons.push(poly);
	            if (x1 !== x2 && a1 === 6 && a2 === 5) {
	                // KAGI NO YOKO BOU NO HANE
	                var haneLength = font.kWidth * 5;
	                var rv = x1 < x2 ? 1 : -1;
	                var poly_2 = pen2.getPolygon([
	                    { x: rv * (kMinWidthT - 1), y: 0 },
	                    { x: rv * (kMinWidthT + haneLength), y: 2 },
	                    { x: rv * (kMinWidthT + haneLength), y: 0 },
	                    { x: kMinWidthT - 1, y: -kMinWidthT }, // rv ?????
	                ]);
	                polygons.push(poly_2);
	            }
	        }
	    }
	    else if (y1 === y2 && a1 === 6) {
	        // if it is YOKO stroke, use x-axis
	        // if it is KAGI's YOKO stroke, get bold
	        // x1 !== x2 && y1 === y2 && a1 === 6
	        var pen1_r = new Pen(x1, y1);
	        var pen2_r = new Pen(x2, y2);
	        var poly0 = new Polygon([
	            pen1_r.getPoint(0, -kMinWidthT),
	            pen2_r.getPoint(0, -kMinWidthT),
	            pen2_r.getPoint(0, +kMinWidthT),
	            pen1_r.getPoint(0, +kMinWidthT),
	        ]);
	        polygons.push(poly0);
	        switch (a2) {
	            case 1:
	            case 0:
	            case 5: { // no need a2=1
	                // KAGI NO YOKO BOU NO SAIGO NO MARU
	                var pen2 = new Pen(x2, y2);
	                if (x1 > x2) {
	                    pen2.setMatrix2(-1, 0);
	                }
	                var r = 0.6;
	                var poly = pen2.getPolygon((font.kUseCurve)
	                    ? [
	                        { x: 0, y: -kMinWidthT },
	                        { x: +kMinWidthT * 0.9, y: -kMinWidthT * 0.9, off: true },
	                        { x: +kMinWidthT, y: 0 },
	                        { x: +kMinWidthT * 0.9, y: +kMinWidthT * 0.9, off: true },
	                        { x: 0, y: +kMinWidthT },
	                    ]
	                    : [
	                        { x: 0, y: -kMinWidthT },
	                        { x: +kMinWidthT * r, y: -kMinWidthT * 0.6 },
	                        { x: +kMinWidthT, y: 0 },
	                        { x: +kMinWidthT * r, y: +kMinWidthT * 0.6 },
	                        { x: 0, y: +kMinWidthT },
	                    ]);
	                if (x1 >= x2) {
	                    poly.reverse();
	                }
	                polygons.push(poly);
	                if (a2 === 5) {
	                    var haneLength = font.kWidth * (4 * (1 - opt1 / font.kAdjustMageStep) + 1);
	                    // KAGI NO YOKO BOU NO HANE
	                    var rv = x1 < x2 ? 1 : -1;
	                    var poly_3 = pen2.getPolygon([
	                        // { x: 0, y: rv * (-kMinWidthT + 1) },
	                        { x: 0, y: rv * -kMinWidthT },
	                        { x: 2, y: rv * (-kMinWidthT - haneLength) },
	                        { x: 0, y: rv * (-kMinWidthT - haneLength) },
	                        // { x: -kMinWidthT, y: rv * (-kMinWidthT + 1) },
	                        { x: -kMinWidthT, y: rv * -kMinWidthT },
	                    ]);
	                    // poly2.reverse(); // for fill-rule
	                    polygons.push(poly_3);
	                }
	                break;
	            }
	        }
	    }
	    else {
	        // for others, use x-axis
	        // ASAI KAUDO
	        var _b = (y1 === y2)
	            ? [1, 0] // ?????
	            : normalize([x2 - x1, y2 - y1]), cosrad = _b[0], sinrad = _b[1];
	        // always same
	        var pen1 = new Pen(x1, y1);
	        var pen2 = new Pen(x2, y2);
	        // if (y1 !== y2) { // ?????
	        // 	pen1.setRight(x2, y2);
	        // 	pen2.setLeft(x1, y1);
	        // }
	        pen1.setMatrix2(cosrad, sinrad);
	        pen2.setMatrix2(cosrad, sinrad);
	        var poly = new Polygon([
	            pen1.getPoint(0, -font.kMinWidthY),
	            pen2.getPoint(0, -font.kMinWidthY),
	            pen2.getPoint(0, font.kMinWidthY),
	            pen1.getPoint(0, font.kMinWidthY),
	        ]);
	        polygons.push(poly);
	        switch (a2) {
	            // UROKO
	            case 0: {
	                var urokoScale = (font.kMinWidthU / font.kMinWidthY - 1.0) / 4.0 + 1.0;
	                var poly2 = pen2.getPolygon([
	                    { x: 0, y: -font.kMinWidthY },
	                    { x: -font.kAdjustUrokoX[urokoAdjustment] * urokoScale, y: 0 },
	                ]);
	                poly2.push(x2 - (cosrad - sinrad) * font.kAdjustUrokoX[urokoAdjustment] * urokoScale / 2, y2 - (sinrad + cosrad) * font.kAdjustUrokoY[urokoAdjustment] * urokoScale);
	                polygons.push(poly2);
	                break;
	            }
	        }
	    }
	}

	function selectPolygonsRect(polygons, x1, y1, x2, y2) {
	    return polygons.array.filter(function (polygon) { return (polygon.array.every(function (_a) {
	        var x = _a.x, y = _a.y;
	        return x1 <= x && x <= x2 && y1 <= y && y <= y2;
	    })); });
	}
	function dfDrawFont$1(font, polygons, _a) {
	    var _b = _a.stroke, a1_100 = _b.a1_100, a2_100 = _b.a2_100, a2_opt = _b.a2_opt, a2_opt_1 = _b.a2_opt_1, a2_opt_2 = _b.a2_opt_2, a2_opt_3 = _b.a2_opt_3, a3_100 = _b.a3_100, a3_opt = _b.a3_opt, a3_opt_1 = _b.a3_opt_1, a3_opt_2 = _b.a3_opt_2, x1 = _b.x1, y1 = _b.y1, x2 = _b.x2, y2 = _b.y2, x3 = _b.x3, y3 = _b.y3, x4 = _b.x4, y4 = _b.y4, kirikuchiAdjustment = _a.kirikuchiAdjustment, tateAdjustment = _a.tateAdjustment, haneAdjustment = _a.haneAdjustment, urokoAdjustment = _a.urokoAdjustment, kakatoAdjustment = _a.kakatoAdjustment, mageAdjustment = _a.mageAdjustment;
	    switch (a1_100) { // ... no need to divide
	        case 0:
	            if (a2_100 === 98 && a2_opt === 0) {
	                var dx = x1 + x2, dy = 0;
	                for (var _i = 0, _c = selectPolygonsRect(polygons, x1, y1, x2, y2); _i < _c.length; _i++) {
	                    var polygon = _c[_i];
	                    polygon.reflectX().translate(dx, dy).floor();
	                }
	            }
	            else if (a2_100 === 97 && a2_opt === 0) {
	                var dx = 0, dy = y1 + y2;
	                for (var _d = 0, _e = selectPolygonsRect(polygons, x1, y1, x2, y2); _d < _e.length; _d++) {
	                    var polygon = _e[_d];
	                    polygon.reflectY().translate(dx, dy).floor();
	                }
	            }
	            else if (a2_100 === 99 && a2_opt === 0) {
	                if (a3_100 === 1 && a3_opt === 0) {
	                    var dx = x1 + y2, dy = y1 - x1;
	                    for (var _f = 0, _g = selectPolygonsRect(polygons, x1, y1, x2, y2); _f < _g.length; _f++) {
	                        var polygon = _g[_f];
	                        // polygon.translate(-x1, -y2).rotate90().translate(x1, y1);
	                        polygon.rotate90().translate(dx, dy).floor();
	                    }
	                }
	                else if (a3_100 === 2 && a3_opt === 0) {
	                    var dx = x1 + x2, dy = y1 + y2;
	                    for (var _h = 0, _j = selectPolygonsRect(polygons, x1, y1, x2, y2); _h < _j.length; _h++) {
	                        var polygon = _j[_h];
	                        polygon.rotate180().translate(dx, dy).floor();
	                    }
	                }
	                else if (a3_100 === 3 && a3_opt === 0) {
	                    var dx = x1 - y1, dy = y2 + x1;
	                    for (var _k = 0, _l = selectPolygonsRect(polygons, x1, y1, x2, y2); _k < _l.length; _k++) {
	                        var polygon = _l[_k];
	                        // polygon.translate(-x1, -y1).rotate270().translate(x1, y2);
	                        polygon.rotate270().translate(dx, dy).floor();
	                    }
	                }
	            }
	            break;
	        case 1: {
	            if (a3_100 === 4) {
	                var _m = (x1 === x2 && y1 === y2)
	                    ? [0, font.kMage] // ?????
	                    : normalize([x1 - x2, y1 - y2], font.kMage), dx1 = _m[0], dy1 = _m[1];
	                var tx1 = x2 + dx1;
	                var ty1 = y2 + dy1;
	                cdDrawLine$1(font, polygons, x1, y1, tx1, ty1, a2_100 + a2_opt_1 * 100, 1, tateAdjustment, 0, 0);
	                cdDrawCurve$1(font, polygons, tx1, ty1, x2, y2, x2 - font.kMage * (((font.kAdjustTateStep + 4) - tateAdjustment) / (font.kAdjustTateStep + 4)), y2, 1, 14, tateAdjustment % 10, haneAdjustment, Math.floor(tateAdjustment / 10), a3_opt_2);
	            }
	            else {
	                cdDrawLine$1(font, polygons, x1, y1, x2, y2, a2_100 + a2_opt_1 * 100, a3_100, tateAdjustment, urokoAdjustment, kakatoAdjustment);
	            }
	            break;
	        }
	        case 2: {
	            // case 12: // ... no need
	            if (a3_100 === 4) {
	                var _o = (x2 === x3)
	                    ? [0, -font.kMage] // ?????
	                    : (y2 === y3)
	                        ? [-font.kMage, 0] // ?????
	                        : normalize([x2 - x3, y2 - y3], font.kMage), dx1 = _o[0], dy1 = _o[1];
	                var tx1 = x3 + dx1;
	                var ty1 = y3 + dy1;
	                cdDrawCurve$1(font, polygons, x1, y1, x2, y2, tx1, ty1, a2_100 + kirikuchiAdjustment * 100, 0, a2_opt_2, 0, a2_opt_3, 0);
	                cdDrawCurve$1(font, polygons, tx1, ty1, x3, y3, x3 - font.kMage, y3, 2, 14, a2_opt_2, haneAdjustment, 0, a3_opt_2);
	            }
	            else {
	                cdDrawCurve$1(font, polygons, x1, y1, x2, y2, x3, y3, a2_100 + kirikuchiAdjustment * 100, (a3_100 === 5 && a3_opt === 0) ? 15 : a3_100, a2_opt_2, a3_opt_1, a2_opt_3, a3_opt_2);
	            }
	            break;
	        }
	        case 3: {
	            var _p = (x1 === x2 && y1 === y2)
	                ? [0, font.kMage] // ?????
	                : normalize([x1 - x2, y1 - y2], font.kMage), dx1 = _p[0], dy1 = _p[1];
	            var tx1 = x2 + dx1;
	            var ty1 = y2 + dy1;
	            var _q = (x2 === x3 && y2 === y3)
	                ? [0, -font.kMage] // ?????
	                : normalize([x3 - x2, y3 - y2], font.kMage), dx2 = _q[0], dy2 = _q[1];
	            var tx2 = x2 + dx2;
	            var ty2 = y2 + dy2;
	            cdDrawLine$1(font, polygons, x1, y1, tx1, ty1, a2_100 + a2_opt_1 * 100, 1, tateAdjustment, 0, 0);
	            cdDrawCurve$1(font, polygons, tx1, ty1, x2, y2, tx2, ty2, 1, 1, 0, 0, tateAdjustment, mageAdjustment);
	            if (!(a3_100 === 5 && a3_opt_1 === 0 && !((x2 < x3 && x3 - tx2 > 0) || (x2 > x3 && tx2 - x3 > 0)))) { // for closer position
	                var opt2 = (a3_100 === 5 && a3_opt_1 === 0) ? 0 : a3_opt_1 + mageAdjustment * 10;
	                cdDrawLine$1(font, polygons, tx2, ty2, x3, y3, 6, a3_100, mageAdjustment, opt2, opt2); // bolder by force
	            }
	            break;
	        }
	        case 12: {
	            cdDrawCurve$1(font, polygons, x1, y1, x2, y2, x3, y3, a2_100 + a2_opt_1 * 100, 1, a2_opt_2, 0, a2_opt_3, 0);
	            cdDrawLine$1(font, polygons, x3, y3, x4, y4, 6, a3_100, 0, a3_opt, a3_opt);
	            break;
	        }
	        case 4: {
	            var rate = hypot(x3 - x2, y3 - y2) / 120 * 6;
	            if (rate > 6) {
	                rate = 6;
	            }
	            var _r = (x1 === x2 && y1 === y2)
	                ? [0, font.kMage * rate] // ?????
	                : normalize([x1 - x2, y1 - y2], font.kMage * rate), dx1 = _r[0], dy1 = _r[1];
	            var tx1 = x2 + dx1;
	            var ty1 = y2 + dy1;
	            var _s = (x2 === x3 && y2 === y3)
	                ? [0, -font.kMage * rate] // ?????
	                : normalize([x3 - x2, y3 - y2], font.kMage * rate), dx2 = _s[0], dy2 = _s[1];
	            var tx2 = x2 + dx2;
	            var ty2 = y2 + dy2;
	            cdDrawLine$1(font, polygons, x1, y1, tx1, ty1, a2_100 + a2_opt_1 * 100, 1, a2_opt_2 + a2_opt_3 * 10, 0, 0);
	            cdDrawCurve$1(font, polygons, tx1, ty1, x2, y2, tx2, ty2, 1, 1, 0, 0, 0, 0);
	            if (!(a3_100 === 5 && a3_opt === 0 && x3 - tx2 <= 0)) { // for closer position
	                cdDrawLine$1(font, polygons, tx2, ty2, x3, y3, 6, a3_100, 0, a3_opt, a3_opt); // bolder by force
	            }
	            break;
	        }
	        case 6: {
	            if (a3_100 === 4) {
	                var _t = (x3 === x4)
	                    ? [0, -font.kMage] // ?????
	                    : (y3 === y4)
	                        ? [-font.kMage, 0] // ?????
	                        : normalize([x3 - x4, y3 - y4], font.kMage), dx1 = _t[0], dy1 = _t[1];
	                var tx1 = x4 + dx1;
	                var ty1 = y4 + dy1;
	                cdDrawBezier$1(font, polygons, x1, y1, x2, y2, x3, y3, tx1, ty1, a2_100 + a2_opt_1 * 100, 1, a2_opt_2, 0, a2_opt_3, 0);
	                cdDrawCurve$1(font, polygons, tx1, ty1, x4, y4, x4 - font.kMage, y4, 1, 14, 0, haneAdjustment, 0, a3_opt_2);
	            }
	            else {
	                cdDrawBezier$1(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a2_100 + a2_opt_1 * 100, (a3_100 === 5 && a3_opt === 0) ? 15 : a3_100, a2_opt_2, a3_opt_1, a2_opt_3, a3_opt_2);
	            }
	            break;
	        }
	        case 7: {
	            cdDrawLine$1(font, polygons, x1, y1, x2, y2, a2_100 + a2_opt_1 * 100, 1, tateAdjustment, 0, 0);
	            cdDrawCurve$1(font, polygons, x2, y2, x3, y3, x4, y4, 1, a3_100, tateAdjustment % 10, a3_opt_1, Math.floor(tateAdjustment / 10), a3_opt_2);
	            break;
	        }
	    }
	}
	/** Mincho style font. */
	var Mincho = /** @class */ (function () {
	    function Mincho() {
	        this.shotai = KShotai.kMincho;
	        /**
	         * Precision for polygon approximation of curving strokes.
	         * It must be a positive divisor of 1000. The smaller `kRate` will give
	         * smoother curves approximated with the larger number of points (roughly
	         * 2 × 1000 / `kRate` per one curve stroke).
	         */
	        this.kRate = 100; // must divide 1000
	        /** Half of the width of mincho-style horizontal (thinner) strokes. */
	        this.kMinWidthY = 2;
	        /** Determines the size of ウロコ at the 開放 end of mincho-style horizontal strokes. */
	        this.kMinWidthU = 2;
	        /** Half of the width of mincho-style vertical (thicker) strokes. */
	        this.kMinWidthT = 6;
	        /**
	         * Half of the width of gothic-style strokes.
	         * Also used to determine the size of mincho's ornamental elements.
	         */
	        this.kWidth = 5;
	        /** Size of カカト in gothic. */
	        this.kKakato = 3;
	        /** Width at the end of 右払い relative to `2 * kMinWidthT`. */
	        this.kL2RDfatten = 1.1;
	        /** Size of curve at the end of 左ハネ, and at the middle of 折れ and 乙線 strokes. */
	        this.kMage = 10;
	        /**
	         * Whether to use off-curve points to approximate curving strokes
	         * with quadratic Bézier curve (experimental).
	         */
	        this.kUseCurve = false;
	        /** Length of 左下カド's カカト in mincho for each shortening level (0 to 3) and 413 (左下zh用新). */
	        // for KAKATO adjustment 000,100,200,300,400
	        this.kAdjustKakatoL = [14, 9, 5, 2, 0];
	        /** Length of 右下カド's カカト in mincho for each shortening level (0 to 3). */
	        // for KAKATO adjustment 000,100,200,300
	        this.kAdjustKakatoR = [8, 6, 4, 2];
	        /** Width of the collision box below カカト for shortening adjustment. */
	        // check area width
	        this.kAdjustKakatoRangeX = 20;
	        /** Height of the collision box below カカト for each shortening adjustment level (0 to 3). */
	        // 3 steps of checking
	        this.kAdjustKakatoRangeY = [1, 19, 24, 30];
	        /** Number of カカト shortening levels. Must be set to 3. */
	        // number of steps
	        this.kAdjustKakatoStep = 3;
	        /** Size of ウロコ at the 開放 end of mincho-style horizontal strokes for each shrinking level (0 to max({@link kAdjustUrokoLengthStep}, {@link kAdjustUroko2Step})). */
	        // for UROKO adjustment 000,100,200,300
	        this.kAdjustUrokoX = [24, 20, 16, 12];
	        /** Size of ウロコ at the 開放 end of mincho-style horizontal strokes for each shrinking level (0 to max({@link kAdjustUrokoLengthStep}, {@link kAdjustUroko2Step})). */
	        // for UROKO adjustment 000,100,200,300
	        this.kAdjustUrokoY = [12, 11, 9, 8];
	        /** Threshold length of horizontal strokes for shrinking its ウロコ for each adjustment level ({@link kAdjustUrokoLengthStep} to 1). */
	        // length for checking
	        this.kAdjustUrokoLength = [22, 36, 50];
	        /** Number of ウロコ shrinking levels by adjustment using collision detection. */
	        // number of steps
	        this.kAdjustUrokoLengthStep = 3;
	        /** Size of the collision box to the left of ウロコ at the 開放 end of mincho-style horizontal strokes for each shrinking adjustment level ({@link kAdjustUrokoLengthStep} to 1). */
	        // check for crossing. corresponds to length
	        this.kAdjustUrokoLine = [22, 26, 30];
	        /** Number of ウロコ shrinking levels by adjustment using density of horizontal strokes. */
	        this.kAdjustUroko2Step = 3;
	        /** Parameter for shrinking adjustment of ウロコ using density of horizontal strokes. */
	        this.kAdjustUroko2Length = 40;
	        /** Parameter for thinning adjustment of mincho-style vertical strokes. */
	        this.kAdjustTateStep = 4;
	        /** Parameter for thinning adjustment of latter half of mincho-style 折れ strokes. */
	        this.kAdjustMageStep = 5;
	        this.setSize();
	    }
	    Mincho.prototype.setSize = function (size) {
	        if (size === 1) {
	            this.kMinWidthY = 1.2;
	            this.kMinWidthT = 3.6;
	            this.kWidth = 3;
	            this.kKakato = 1.8;
	            this.kL2RDfatten = 1.1;
	            this.kMage = 6;
	            this.kUseCurve = false;
	            this.kAdjustKakatoL = [8, 5, 3, 1, 0];
	            this.kAdjustKakatoR = [4, 3, 2, 1];
	            this.kAdjustKakatoRangeX = 12;
	            this.kAdjustKakatoRangeY = [1, 11, 14, 18];
	            this.kAdjustKakatoStep = 3;
	            this.kAdjustUrokoX = [14, 12, 9, 7];
	            this.kAdjustUrokoY = [7, 6, 5, 4];
	            this.kAdjustUrokoLength = [13, 21, 30];
	            this.kAdjustUrokoLengthStep = 3;
	            this.kAdjustUrokoLine = [13, 15, 18];
	        }
	        else {
	            this.kMinWidthY = 2;
	            this.kMinWidthU = 2;
	            this.kMinWidthT = 6;
	            this.kWidth = 5;
	            this.kKakato = 3;
	            this.kL2RDfatten = 1.1;
	            this.kMage = 10;
	            this.kUseCurve = false;
	            this.kAdjustKakatoL = [14, 9, 5, 2, 0];
	            this.kAdjustKakatoR = [8, 6, 4, 2];
	            this.kAdjustKakatoRangeX = 20;
	            this.kAdjustKakatoRangeY = [1, 19, 24, 30];
	            this.kAdjustKakatoStep = 3;
	            this.kAdjustUrokoX = [24, 20, 16, 12];
	            this.kAdjustUrokoY = [12, 11, 9, 8];
	            this.kAdjustUrokoLength = [22, 36, 50];
	            this.kAdjustUrokoLengthStep = 3;
	            this.kAdjustUrokoLine = [22, 26, 30];
	            this.kAdjustUroko2Step = 3;
	            this.kAdjustUroko2Length = 40;
	            this.kAdjustTateStep = 4;
	            this.kAdjustMageStep = 5;
	        }
	    };
	    /** @internal */
	    Mincho.prototype.getDrawers = function (strokesArray) {
	        var _this = this;
	        return this.adjustStrokes(strokesArray).map(function (adjStroke) { return function (polygons) {
	            dfDrawFont$1(_this, polygons, adjStroke);
	        }; });
	    };
	    /** @internal */
	    Mincho.prototype.adjustStrokes = function (strokesArray) {
	        var adjustedStrokes = strokesArray.map(function (stroke) {
	            var a2_opt_1 = stroke.a2_opt_1, a2_opt_2 = stroke.a2_opt_2, a2_opt_3 = stroke.a2_opt_3, a3_opt = stroke.a3_opt, a3_opt_1 = stroke.a3_opt_1, a3_opt_2 = stroke.a3_opt_2;
	            return {
	                stroke: stroke,
	                // a2:
	                // - 100s place: adjustKirikuchi (when 2:X32);
	                // - 1000s place: adjustTate (when {1,3,7})
	                kirikuchiAdjustment: a2_opt_1,
	                tateAdjustment: a2_opt_2 + a2_opt_3 * 10,
	                // a3:
	                // - 100s place: adjustHane (when {1,2,6}::X04), adjustUroko/adjustUroko2 (when 1::X00),
	                //               adjustKakato (when 1::X{13,23});
	                // - 1000s place: adjustMage (when 3)
	                haneAdjustment: a3_opt_1,
	                urokoAdjustment: a3_opt,
	                kakatoAdjustment: a3_opt,
	                mageAdjustment: a3_opt_2,
	            };
	        });
	        this.adjustHane(adjustedStrokes);
	        this.adjustMage(adjustedStrokes);
	        this.adjustTate(adjustedStrokes);
	        this.adjustKakato(adjustedStrokes);
	        this.adjustUroko(adjustedStrokes);
	        this.adjustUroko2(adjustedStrokes);
	        this.adjustKirikuchi(adjustedStrokes);
	        return adjustedStrokes;
	    };
	    Mincho.prototype.adjustHane = function (adjStrokes) {
	        var vertSegments = [];
	        for (var _i = 0, adjStrokes_1 = adjStrokes; _i < adjStrokes_1.length; _i++) {
	            var stroke = adjStrokes_1[_i].stroke;
	            if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && stroke.x1 === stroke.x2) {
	                vertSegments.push({
	                    stroke: stroke,
	                    x: stroke.x1,
	                    y1: stroke.y1,
	                    y2: stroke.y2,
	                });
	            }
	        }
	        for (var _a = 0, adjStrokes_2 = adjStrokes; _a < adjStrokes_2.length; _a++) {
	            var adjStroke = adjStrokes_2[_a];
	            var stroke = adjStroke.stroke;
	            if ((stroke.a1_100 === 1 || stroke.a1_100 === 2 || stroke.a1_100 === 6) && stroke.a1_opt === 0
	                && stroke.a3_100 === 4 && stroke.a3_opt === 0) {
	                var lpx = void 0; // lastPointX
	                var lpy = void 0; // lastPointY
	                if (stroke.a1_100 === 1) {
	                    lpx = stroke.x2;
	                    lpy = stroke.y2;
	                }
	                else if (stroke.a1_100 === 2) {
	                    lpx = stroke.x3;
	                    lpy = stroke.y3;
	                }
	                else {
	                    lpx = stroke.x4;
	                    lpy = stroke.y4;
	                }
	                var mn = Infinity; // mostNear
	                if (lpx + 18 < 100) {
	                    mn = lpx + 18;
	                }
	                for (var _b = 0, vertSegments_1 = vertSegments; _b < vertSegments_1.length; _b++) {
	                    var _c = vertSegments_1[_b], stroke2 = _c.stroke, x = _c.x, y1 = _c.y1, y2 = _c.y2;
	                    if (stroke !== stroke2
	                        && lpx - x < 100 && x < lpx
	                        && y1 <= lpy && y2 >= lpy) {
	                        mn = Math.min(mn, lpx - x);
	                    }
	                }
	                if (mn !== Infinity) {
	                    adjStroke.haneAdjustment += 7 - Math.floor(mn / 15);
	                }
	            }
	        }
	        return adjStrokes;
	    };
	    Mincho.prototype.adjustMage = function (adjStrokes) {
	        var horiSegments = [];
	        for (var _i = 0, adjStrokes_3 = adjStrokes; _i < adjStrokes_3.length; _i++) {
	            var adjStroke = adjStrokes_3[_i];
	            var stroke = adjStroke.stroke;
	            if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && stroke.y1 === stroke.y2) {
	                horiSegments.push({
	                    stroke: stroke,
	                    adjStroke: adjStroke,
	                    isTarget: false,
	                    y: stroke.y2,
	                    x1: stroke.x1,
	                    x2: stroke.x2,
	                });
	            }
	            else if (stroke.a1_100 === 3 && stroke.a1_opt === 0 && stroke.y2 === stroke.y3) {
	                horiSegments.push({
	                    stroke: stroke,
	                    adjStroke: adjStroke,
	                    isTarget: true,
	                    y: stroke.y2,
	                    x1: stroke.x2,
	                    x2: stroke.x3,
	                });
	            }
	        }
	        for (var _a = 0, horiSegments_1 = horiSegments; _a < horiSegments_1.length; _a++) {
	            var _b = horiSegments_1[_a], adjStroke = _b.adjStroke, stroke = _b.stroke, isTarget = _b.isTarget, y = _b.y, x1 = _b.x1, x2 = _b.x2;
	            if (isTarget) {
	                for (var _c = 0, horiSegments_2 = horiSegments; _c < horiSegments_2.length; _c++) {
	                    var _d = horiSegments_2[_c], stroke2 = _d.stroke, other_y = _d.y, other_x1 = _d.x1, other_x2 = _d.x2;
	                    if (stroke !== stroke2
	                        && !(x1 + 1 > other_x2 || x2 - 1 < other_x1)
	                        && round(Math.abs(y - other_y)) < this.kMinWidthT * this.kAdjustMageStep) {
	                        adjStroke.mageAdjustment += this.kAdjustMageStep - Math.floor(Math.abs(y - other_y) / this.kMinWidthT);
	                        if (adjStroke.mageAdjustment > this.kAdjustMageStep) {
	                            adjStroke.mageAdjustment = this.kAdjustMageStep;
	                        }
	                    }
	                }
	            }
	        }
	        return adjStrokes;
	    };
	    Mincho.prototype.adjustTate = function (adjStrokes) {
	        var vertSegments = [];
	        for (var _i = 0, adjStrokes_4 = adjStrokes; _i < adjStrokes_4.length; _i++) {
	            var adjStroke = adjStrokes_4[_i];
	            var stroke = adjStroke.stroke;
	            if ((stroke.a1_100 === 1 || stroke.a1_100 === 3 || stroke.a1_100 === 7) && stroke.a1_opt === 0 && stroke.x1 === stroke.x2) {
	                vertSegments.push({
	                    stroke: stroke,
	                    adjStroke: adjStroke,
	                    x: stroke.x1,
	                    y1: stroke.y1,
	                    y2: stroke.y2,
	                });
	            }
	        }
	        for (var _a = 0, vertSegments_2 = vertSegments; _a < vertSegments_2.length; _a++) {
	            var _b = vertSegments_2[_a], adjStroke = _b.adjStroke, stroke = _b.stroke, x = _b.x, y1 = _b.y1, y2 = _b.y2;
	            for (var _c = 0, vertSegments_3 = vertSegments; _c < vertSegments_3.length; _c++) {
	                var _d = vertSegments_3[_c], stroke2 = _d.stroke, other_x = _d.x, other_y1 = _d.y1, other_y2 = _d.y2;
	                if (stroke !== stroke2
	                    && !(y1 + 1 > other_y2 || y2 - 1 < other_y1)
	                    && round(Math.abs(x - other_x)) < this.kMinWidthT * this.kAdjustTateStep) {
	                    adjStroke.tateAdjustment += this.kAdjustTateStep - Math.floor(Math.abs(x - other_x) / this.kMinWidthT);
	                    if (adjStroke.tateAdjustment > this.kAdjustTateStep
	                        || adjStroke.tateAdjustment === this.kAdjustTateStep && (stroke.a2_opt_1 !== 0 || stroke.a2_100 !== 0)) {
	                        adjStroke.tateAdjustment = this.kAdjustTateStep;
	                    }
	                }
	            }
	        }
	        return adjStrokes;
	    };
	    Mincho.prototype.adjustKakato = function (adjStrokes) {
	        var _this = this;
	        var _loop_1 = function (adjStroke) {
	            var stroke = adjStroke.stroke;
	            if (stroke.a1_100 === 1 && stroke.a1_opt === 0
	                && (stroke.a3_100 === 13 || stroke.a3_100 === 23) && stroke.a3_opt === 0) {
	                var _loop_2 = function (k) {
	                    if (adjStrokes.some(function (_a) {
	                        var stroke2 = _a.stroke;
	                        return stroke !== stroke2 &&
	                            stroke2.isCrossBox(stroke.x2 - _this.kAdjustKakatoRangeX / 2, stroke.y2 + _this.kAdjustKakatoRangeY[k], stroke.x2 + _this.kAdjustKakatoRangeX / 2, stroke.y2 + _this.kAdjustKakatoRangeY[k + 1]);
	                    })
	                        || round(stroke.y2 + this_1.kAdjustKakatoRangeY[k + 1]) > 200 // adjust for baseline
	                        || round(stroke.y2 - stroke.y1) < this_1.kAdjustKakatoRangeY[k + 1] // for thin box
	                    ) {
	                        adjStroke.kakatoAdjustment = 3 - k;
	                        return "break";
	                    }
	                };
	                for (var k = 0; k < this_1.kAdjustKakatoStep; k++) {
	                    var state_1 = _loop_2(k);
	                    if (state_1 === "break")
	                        break;
	                }
	            }
	        };
	        var this_1 = this;
	        for (var _i = 0, adjStrokes_5 = adjStrokes; _i < adjStrokes_5.length; _i++) {
	            var adjStroke = adjStrokes_5[_i];
	            _loop_1(adjStroke);
	        }
	        return adjStrokes;
	    };
	    Mincho.prototype.adjustUroko = function (adjStrokes) {
	        var _loop_3 = function (adjStroke) {
	            var stroke = adjStroke.stroke;
	            if (stroke.a1_100 === 1 && stroke.a1_opt === 0
	                && stroke.a3_100 === 0 && stroke.a3_opt === 0) { // no operation for TATE
	                var _loop_4 = function (k) {
	                    var _a = (stroke.y1 === stroke.y2) // YOKO
	                        ? [1, 0] // ?????
	                        : (stroke.x2 - stroke.x1 < 0)
	                            ? normalize([stroke.x1 - stroke.x2, stroke.y1 - stroke.y2]) // for backward compatibility...
	                            : normalize([stroke.x2 - stroke.x1, stroke.y2 - stroke.y1]), cosrad = _a[0], sinrad = _a[1];
	                    var tx = stroke.x2 - this_2.kAdjustUrokoLine[k] * cosrad - 0.5 * sinrad; // typo? (sinrad should be -sinrad ?)
	                    var ty = stroke.y2 - this_2.kAdjustUrokoLine[k] * sinrad - 0.5 * cosrad;
	                    var tlen = (stroke.y1 === stroke.y2) // YOKO
	                        ? stroke.x2 - stroke.x1 // should be Math.abs(...)?
	                        : hypot(stroke.y2 - stroke.y1, stroke.x2 - stroke.x1);
	                    if (round(tlen) < this_2.kAdjustUrokoLength[k]
	                        || adjStrokes.some(function (_a) {
	                            var stroke2 = _a.stroke;
	                            return stroke !== stroke2 && stroke2.isCross(tx, ty, stroke.x2, stroke.y2);
	                        })) {
	                        adjStroke.urokoAdjustment = this_2.kAdjustUrokoLengthStep - k;
	                        return "break";
	                    }
	                };
	                for (var k = 0; k < this_2.kAdjustUrokoLengthStep; k++) {
	                    var state_2 = _loop_4(k);
	                    if (state_2 === "break")
	                        break;
	                }
	            }
	        };
	        var this_2 = this;
	        for (var _i = 0, adjStrokes_6 = adjStrokes; _i < adjStrokes_6.length; _i++) {
	            var adjStroke = adjStrokes_6[_i];
	            _loop_3(adjStroke);
	        }
	        return adjStrokes;
	    };
	    Mincho.prototype.adjustUroko2 = function (adjStrokes) {
	        var horiSegments = [];
	        for (var _i = 0, adjStrokes_7 = adjStrokes; _i < adjStrokes_7.length; _i++) {
	            var adjStroke = adjStrokes_7[_i];
	            var stroke = adjStroke.stroke;
	            if (stroke.a1_100 === 1 && stroke.a1_opt === 0
	                && stroke.y1 === stroke.y2) {
	                horiSegments.push({
	                    stroke: stroke,
	                    adjStroke: adjStroke,
	                    isTarget: stroke.a3_100 === 0 && stroke.a3_opt === 0 && adjStroke.urokoAdjustment === 0,
	                    y: stroke.y1,
	                    x1: stroke.x1,
	                    x2: stroke.x2,
	                });
	            }
	            else if (stroke.a1_100 === 3 && stroke.a1_opt === 0
	                && stroke.y2 === stroke.y3) {
	                horiSegments.push({
	                    stroke: stroke,
	                    adjStroke: adjStroke,
	                    isTarget: false,
	                    y: stroke.y2,
	                    x1: stroke.x2,
	                    x2: stroke.x3,
	                });
	            }
	        }
	        for (var _a = 0, horiSegments_3 = horiSegments; _a < horiSegments_3.length; _a++) {
	            var _b = horiSegments_3[_a], adjStroke = _b.adjStroke, stroke = _b.stroke, isTarget = _b.isTarget, y = _b.y, x1 = _b.x1, x2 = _b.x2;
	            if (isTarget) {
	                var pressure = 0;
	                for (var _c = 0, horiSegments_4 = horiSegments; _c < horiSegments_4.length; _c++) {
	                    var _d = horiSegments_4[_c], stroke2 = _d.stroke, other_y = _d.y, other_x1 = _d.x1, other_x2 = _d.x2;
	                    if (stroke !== stroke2
	                        && !(x1 + 1 > other_x2 || x2 - 1 < other_x1)
	                        && round(Math.abs(y - other_y)) < this.kAdjustUroko2Length) {
	                        pressure += Math.pow((this.kAdjustUroko2Length - Math.abs(y - other_y)), 1.1);
	                    }
	                }
	                // const result = Math.min(Math.floor(pressure / this.kAdjustUroko2Length), this.kAdjustUroko2Step) * 100;
	                // if (stroke.a3 < result) {
	                adjStroke.urokoAdjustment = Math.min(Math.floor(pressure / this.kAdjustUroko2Length), this.kAdjustUroko2Step);
	                // }
	            }
	        }
	        return adjStrokes;
	    };
	    Mincho.prototype.adjustKirikuchi = function (adjStrokes) {
	        var horiSegments = [];
	        for (var _i = 0, adjStrokes_8 = adjStrokes; _i < adjStrokes_8.length; _i++) {
	            var stroke = adjStrokes_8[_i].stroke;
	            if (stroke.a1_100 === 1 && stroke.a1_opt === 0 && stroke.y1 === stroke.y2) {
	                horiSegments.push({
	                    y: stroke.y1,
	                    x1: stroke.x1,
	                    x2: stroke.x2,
	                });
	            }
	        }
	        var _loop_5 = function (adjStroke) {
	            var stroke = adjStroke.stroke;
	            if (stroke.a1_100 === 2 && stroke.a1_opt === 0
	                && stroke.a2_100 === 32 && stroke.a2_opt === 0
	                && stroke.x1 > stroke.x2 && stroke.y1 < stroke.y2
	                && horiSegments.some(function (_a) {
	                    var y = _a.y, x1 = _a.x1, x2 = _a.x2;
	                    return ( // no need to skip when i == j
	                    x1 < stroke.x1 && x2 > stroke.x1 && y === stroke.y1);
	                })) {
	                adjStroke.kirikuchiAdjustment = 1;
	            }
	        };
	        for (var _a = 0, adjStrokes_9 = adjStrokes; _a < adjStrokes_9.length; _a++) {
	            var adjStroke = adjStrokes_9[_a];
	            _loop_5(adjStroke);
	        }
	        return adjStrokes;
	    };
	    return Mincho;
	}());

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    if (typeof b !== "function" && b !== null)
	        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	function cdDrawCurveU(font, polygons, x1, y1, sx1, sy1, sx2, sy2, x2, y2, _ta1, _ta2) {
	    var a1 = _ta1;
	    var a2 = _ta2;
	    var delta1 = 0;
	    switch (a1 % 10) {
	        case 2:
	            delta1 = font.kWidth;
	            break;
	        case 3:
	            delta1 = font.kWidth * font.kKakato;
	            break;
	    }
	    if (delta1 !== 0) {
	        var _a = (x1 === sx1 && y1 === sy1)
	            ? [0, delta1] // ?????
	            : normalize([x1 - sx1, y1 - sy1], delta1), dx1 = _a[0], dy1 = _a[1];
	        x1 += dx1;
	        y1 += dy1;
	    }
	    var delta2 = 0;
	    switch (a2 % 10) {
	        case 2:
	            delta2 = font.kWidth;
	            break;
	        case 3:
	            delta2 = font.kWidth * font.kKakato;
	            break;
	    }
	    if (delta2 !== 0) {
	        var _b = (sx2 === x2 && sy2 === y2)
	            ? [0, -delta2] // ?????
	            : normalize([x2 - sx2, y2 - sy2], delta2), dx2 = _b[0], dy2 = _b[1];
	        x2 += dx2;
	        y2 += dy2;
	    }
	    var _c = generateFattenCurve(x1, y1, sx1, sy1, sx2, sy2, x2, y2, font.kRate, function () { return font.kWidth; }, function (_a, mag) {
	        var x = _a[0], y = _a[1];
	        return (round(x) === 0 && round(y) === 0)
	            ? [-mag, 0] // ?????
	            : normalize([x, y], mag);
	    }), left = _c.left, right = _c.right;
	    var poly = new Polygon();
	    var poly2 = new Polygon();
	    // save to polygon
	    for (var _i = 0, left_1 = left; _i < left_1.length; _i++) {
	        var _d = left_1[_i], x = _d[0], y = _d[1];
	        poly.push(x, y);
	    }
	    for (var _e = 0, right_1 = right; _e < right_1.length; _e++) {
	        var _f = right_1[_e], x = _f[0], y = _f[1];
	        poly2.push(x, y);
	    }
	    poly2.reverse();
	    poly.concat(poly2);
	    polygons.push(poly);
	}
	function cdDrawBezier(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a1, a2) {
	    cdDrawCurveU(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a1, a2);
	}
	function cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3, a1, a2) {
	    cdDrawCurveU(font, polygons, x1, y1, x2, y2, x2, y2, x3, y3, a1, a2);
	}
	function cdDrawLine(font, polygons, tx1, ty1, tx2, ty2, ta1, ta2) {
	    var x1;
	    var y1;
	    var x2;
	    var y2;
	    var a1;
	    var a2;
	    if (tx1 === tx2 && ty1 > ty2 || tx1 > tx2) {
	        x1 = tx2;
	        y1 = ty2;
	        x2 = tx1;
	        y2 = ty1;
	        a1 = ta2;
	        a2 = ta1;
	    }
	    else {
	        x1 = tx1;
	        y1 = ty1;
	        x2 = tx2;
	        y2 = ty2;
	        a1 = ta1;
	        a2 = ta2;
	    }
	    var pen1 = new Pen(x1, y1);
	    var pen2 = new Pen(x2, y2);
	    if (x1 !== x2 || y1 !== y2) { // ?????
	        pen1.setDown(x2, y2);
	        pen2.setUp(x1, y1);
	    }
	    switch (a1 % 10) {
	        case 2:
	            pen1.move(0, -font.kWidth);
	            break;
	        case 3:
	            pen1.move(0, -font.kWidth * font.kKakato);
	            break;
	    }
	    switch (a2 % 10) {
	        case 2:
	            pen2.move(0, font.kWidth);
	            break;
	        case 3:
	            pen2.move(0, font.kWidth * font.kKakato);
	            break;
	    }
	    // SUICHOKU NO ICHI ZURASHI HA Math.sin TO Math.cos NO IREKAE + x-axis MAINASU KA
	    var poly = new Polygon([
	        pen1.getPoint(font.kWidth, 0),
	        pen2.getPoint(font.kWidth, 0),
	        pen2.getPoint(-font.kWidth, 0),
	        pen1.getPoint(-font.kWidth, 0),
	    ]);
	    if (tx1 === tx2) {
	        poly.reverse(); // ?????
	    }
	    polygons.push(poly);
	}

	function dfDrawFont(font, polygons, _a) {
	    var _b = _a.stroke, a1_100 = _b.a1_100, a2_100 = _b.a2_100, a3_100 = _b.a3_100, a3_opt = _b.a3_opt, a3_opt_1 = _b.a3_opt_1, a3_opt_2 = _b.a3_opt_2, x1 = _b.x1, y1 = _b.y1, x2 = _b.x2, y2 = _b.y2, x3 = _b.x3, y3 = _b.y3, x4 = _b.x4, y4 = _b.y4, haneAdjustment = _a.haneAdjustment, mageAdjustment = _a.mageAdjustment;
	    switch (a1_100) {
	        case 0:
	            break;
	        case 1: {
	            if (a3_100 === 4 && haneAdjustment === 0 && a3_opt_2 === 0) {
	                var _c = (x1 === x2 && y1 === y2)
	                    ? [0, font.kMage] // ?????
	                    : normalize([x1 - x2, y1 - y2], font.kMage), dx1 = _c[0], dy1 = _c[1];
	                var tx1 = x2 + dx1;
	                var ty1 = y2 + dy1;
	                cdDrawLine(font, polygons, x1, y1, tx1, ty1, a2_100, 1);
	                cdDrawCurve(font, polygons, tx1, ty1, x2, y2, x2 - font.kMage * 2, y2 - font.kMage * 0.5, 1, 0);
	            }
	            else {
	                cdDrawLine(font, polygons, x1, y1, x2, y2, a2_100, a3_100);
	            }
	            break;
	        }
	        case 2:
	        case 12: {
	            if (a3_100 === 4 && haneAdjustment === 0 && a3_opt_2 === 0) {
	                var _d = (x2 === x3)
	                    ? [0, -font.kMage] // ?????
	                    : (y2 === y3)
	                        ? [-font.kMage, 0] // ?????
	                        : normalize([x2 - x3, y2 - y3], font.kMage), dx1 = _d[0], dy1 = _d[1];
	                var tx1 = x3 + dx1;
	                var ty1 = y3 + dy1;
	                cdDrawCurve(font, polygons, x1, y1, x2, y2, tx1, ty1, a2_100, 1);
	                cdDrawCurve(font, polygons, tx1, ty1, x3, y3, x3 - font.kMage * 2, y3 - font.kMage * 0.5, 1, 0);
	            }
	            else if (a3_100 === 5 && a3_opt === 0) {
	                var tx1 = x3 + font.kMage;
	                var ty1 = y3;
	                var tx2 = tx1 + font.kMage * 0.5;
	                var ty2 = y3 - font.kMage * 2;
	                cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3, a2_100, 1);
	                cdDrawCurve(font, polygons, x3, y3, tx1, ty1, tx2, ty2, 1, 0);
	            }
	            else {
	                cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3, a2_100, a3_100);
	            }
	            break;
	        }
	        case 3: {
	            var _e = (x1 === x2 && y1 === y2)
	                ? [0, font.kMage] // ?????
	                : normalize([x1 - x2, y1 - y2], font.kMage), dx1 = _e[0], dy1 = _e[1];
	            var tx1 = x2 + dx1;
	            var ty1 = y2 + dy1;
	            var _f = (x2 === x3 && y2 === y3)
	                ? [0, -font.kMage] // ?????
	                : normalize([x3 - x2, y3 - y2], font.kMage), dx2 = _f[0], dy2 = _f[1];
	            var tx2 = x2 + dx2;
	            var ty2 = y2 + dy2;
	            cdDrawLine(font, polygons, x1, y1, tx1, ty1, a2_100, 1);
	            cdDrawCurve(font, polygons, tx1, ty1, x2, y2, tx2, ty2, 1, 1);
	            if (a3_100 === 5 && a3_opt_1 === 0 && mageAdjustment === 0) {
	                var tx3 = x3 - font.kMage;
	                var ty3 = y3;
	                var tx4 = x3 + font.kMage * 0.5;
	                var ty4 = y3 - font.kMage * 2;
	                cdDrawLine(font, polygons, tx2, ty2, tx3, ty3, 1, 1);
	                cdDrawCurve(font, polygons, tx3, ty3, x3, y3, tx4, ty4, 1, 0);
	            }
	            else {
	                cdDrawLine(font, polygons, tx2, ty2, x3, y3, 1, a3_100);
	            }
	            break;
	        }
	        case 6: {
	            if (a3_100 === 5 && a3_opt === 0) {
	                var tx1 = x4 - font.kMage;
	                var ty1 = y4;
	                var tx2 = x4 + font.kMage * 0.5;
	                var ty2 = y4 - font.kMage * 2;
	                /*
	                cdDrawCurve(x1, y1, x2, y2, (x2 + x3) / 2, (y2 + y3) / 2, a2, 1);
	                cdDrawCurve((x2 + x3) / 2, (y2 + y3) / 2, x3, y3, tx1, ty1, 1, 1);
	                 */
	                cdDrawBezier(font, polygons, x1, y1, x2, y2, x3, y3, tx1, ty1, a2_100, 1);
	                cdDrawCurve(font, polygons, tx1, ty1, x4, y4, tx2, ty2, 1, 0);
	            }
	            else {
	                /*
	                cdDrawCurve(x1, y1, x2, y2, (x2 + x3) / 2, (y2 + y3) / 2, a2, 1);
	                cdDrawCurve((x2 + x3) / 2, (y2 + y3) / 2, x3, y3, x4, y4, 1, a3);
	                 */
	                cdDrawBezier(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4, a2_100, a3_100);
	            }
	            break;
	        }
	        case 7: {
	            cdDrawLine(font, polygons, x1, y1, x2, y2, a2_100, 1);
	            cdDrawCurve(font, polygons, x2, y2, x3, y3, x4, y4, 1, a3_100);
	            break;
	        }
	    }
	}
	/** Gothic style font. */
	var Gothic = /** @class */ (function (_super) {
	    __extends(Gothic, _super);
	    function Gothic() {
	        var _this = _super !== null && _super.apply(this, arguments) || this;
	        _this.shotai = KShotai.kGothic;
	        return _this;
	    }
	    /** @internal */
	    Gothic.prototype.getDrawers = function (strokesArray) {
	        var _this = this;
	        return this.adjustStrokes(strokesArray).map(function (stroke) { return function (polygons) {
	            dfDrawFont(_this, polygons, stroke);
	        }; });
	    };
	    return Gothic;
	}(Mincho));

	function select(shotai) {
	    switch (shotai) {
	        case KShotai.kMincho:
	            return new Mincho();
	        default:
	            return new Gothic();
	    }
	}

	/**
	 * The entry point for KAGE engine (Kanji-glyph Automatic Generating Engine).
	 * It generates glyph outlines from a kanji's stroke data described in a dedicated
	 * intermediate format called KAGE data.
	 *
	 * KAGE data may contain references to other glyphs (components), which are
	 * resolved using a storage at its {@link kBuhin} property. The data for the
	 * referenced glyphs must be registered to the storage prior to generating the outline.
	 *
	 * The font (mincho or gothic) can be changed with its {@link kShotai} property.
	 * The font parameters (stroke width, etc.) can be configured with properties of
	 * {@link kFont}.
	 *
	 * @see {@link Kage.makeGlyph}, {@link Kage.makeGlyph2}, {@link Kage.makeGlyph3} and
	 *     {@link Kage.makeGlyphSeparated} for usage examples.
	 */
	var Kage = /** @class */ (function () {
	    function Kage(size) {
	        /**
	         * An alias of {@link KShotai.kMincho}.
	         * @see {@link Kage.kShotai} for usage.
	         */
	        this.kMincho = KShotai.kMincho;
	        /**
	         * An alias of {@link KShotai.kGothic}.
	         * @see {@link Kage.kShotai} for usage.
	         */
	        this.kGothic = KShotai.kGothic;
	        /**
	         * Provides the way to configure parameters of the currently selected font.
	         * Its parameters are reset to the default values when {@link Kage.kShotai} is set.
	         * @example
	         * ```ts
	         * const kage = new Kage();
	         * kage.kFont.kRate = 50;
	         * kage.kFont.kWidth = 3;
	         * ```
	         */
	        this.kFont = select(KShotai.kMincho);
	        // Probably this can be removed. Keeping here just in case someone is using it...
	        /** @internal */
	        this.stretch = stretch;
	        this.kFont.setSize(size);
	        this.kBuhin = new Buhin();
	    }
	    Object.defineProperty(Kage.prototype, "kShotai", {
	        // properties
	        /**
	         * Gets or sets the font as {@link KShotai}. Setting this property resets all the
	         * font parameters in {@link Kage.kFont}. Defaults to {@link KShotai.kMincho}.
	         * @example
	         * ```ts
	         * const kage = new Kage();
	         * kage.kShotai = kage.kGothic;
	         * ```
	         */
	        get: function () {
	            return this.kFont.shotai;
	        },
	        set: function (shotai) {
	            this.kFont = select(shotai);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Kage.prototype, "kUseCurve", {
	        /**
	         * Whether to generate contours with off-curve points.
	         * An alias of {@link Kage.kFont}.kUseCurve.
	         */
	        get: function () {
	            return this.kFont.kUseCurve;
	        },
	        set: function (value) {
	            this.kFont.kUseCurve = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    // method
	    /**
	     * Renders the glyph of the given name. Existing data in `polygons` (if any) are
	     * NOT cleared; new glyph is "overprinted".
	     * @example
	     * ```ts
	     * const kage = new Kage();
	     * kage.kBuhin.push("uXXXX", "1:0:2:32:31:176:31$2:22:7:176:31:170:43:156:63");
	     * const polygons = new Polygons();
	     * kage.makeGlyph(polygons, "uXXXX");
	     * const svg = polygons.generateSVG(); // now `svg` has the string of the rendered glyph
	     * ```
	     * @param polygons A {@link Polygons} instance on which the glyph is rendered.
	     * @param buhin The name of the glyph to be rendered.
	     */
	    Kage.prototype.makeGlyph = function (polygons, buhin) {
	        var glyphData = this.kBuhin.search(buhin);
	        this.makeGlyph2(polygons, glyphData);
	    };
	    /**
	     * Renders the glyph of the given KAGE data. Existing data in `polygons` (if any) are
	     * NOT cleared; new glyph is "overprinted".
	     * @example
	     * ```ts
	     * const kage = new Kage();
	     * const polygons = new Polygons();
	     * kage.makeGlyph2(polygons, "1:0:2:32:31:176:31$2:22:7:176:31:170:43:156:63");
	     * const svg = polygons.generateSVG(); // now `svg` has the string of the rendered glyph
	     * ```
	     * @param polygons A {@link Polygons} instance on which the glyph is rendered.
	     * @param data The KAGE data to be rendered (in which lines are delimited by `"$"`).
	     */
	    Kage.prototype.makeGlyph2 = function (polygons, data) {
	        if (data !== "") {
	            var strokesArray = this.getEachStrokes(data);
	            var drawers = this.kFont.getDrawers(strokesArray);
	            for (var _i = 0, drawers_1 = drawers; _i < drawers_1.length; _i++) {
	                var draw = drawers_1[_i];
	                draw(polygons);
	            }
	        }
	    };
	    /**
	     * Renders each stroke of the given KAGE data on separate instances of
	     * {@link Polygons}.
	     * @example
	     * ```ts
	     * const kage = new Kage();
	     * const array = kage.makeGlyph3("1:0:2:32:31:176:31$2:22:7:176:31:170:43:156:63");
	     * console.log(array.length); // => 2
	     * console.log(array[0] instanceof Polygons); // => true
	     * ```
	     * @param data The KAGE data to be rendered (in which lines are delimited by `"$"`).
	     * @returns An array of {@link Polygons} instances holding the rendered data
	     *     of each stroke in the glyph.
	     */
	    Kage.prototype.makeGlyph3 = function (data) {
	        var result = [];
	        if (data !== "") {
	            var strokesArray = this.getEachStrokes(data);
	            var drawers = this.kFont.getDrawers(strokesArray);
	            for (var _i = 0, drawers_2 = drawers; _i < drawers_2.length; _i++) {
	                var draw = drawers_2[_i];
	                var polygons = new Polygons();
	                draw(polygons);
	                result.push(polygons);
	            }
	        }
	        return result;
	    };
	    /**
	     * Renders each KAGE data fragment in the given array on separate instances of
	     * {@link Polygons}, with stroke parameters adjusted as if all the fragments joined
	     * together compose a single glyph.
	     * @example
	     * ```ts
	     * const kage = new Kage();
	     * const array = kage.makeGlyphSeparated([
	     * 	"2:7:8:31:16:32:53:16:65",
	     * 	"1:2:2:32:31:176:31$2:22:7:176:31:170:43:156:63",
	     * ]);
	     * console.log(array.length); // => 2
	     * console.log(array[0] instanceof Polygons); // => true
	     * ```
	     * @param data An array of KAGE data fragments (in which lines are delimited by `"$"`)
	     *     to be rendered.
	     * @returns An array of {@link Polygons} instances holding the rendered data
	     *     of each KAGE data fragment.
	     */
	    // Added by @kurgm
	    Kage.prototype.makeGlyphSeparated = function (data) {
	        var _this = this;
	        var strokesArrays = data.map(function (subdata) { return _this.getEachStrokes(subdata); });
	        var drawers = this.kFont.getDrawers(strokesArrays.reduce(function (left, right) { return left.concat(right); }, []));
	        var polygons = new Polygons();
	        var strokeIndex = 0;
	        return strokesArrays.map(function (_a) {
	            var strokeCount = _a.length;
	            var startIndex = polygons.array.length;
	            for (var _i = 0, _b = drawers.slice(strokeIndex, strokeIndex + strokeCount); _i < _b.length; _i++) {
	                var draw = _b[_i];
	                draw(polygons);
	            }
	            strokeIndex += strokeCount;
	            var result = new Polygons();
	            result.array = polygons.array.slice(startIndex);
	            return result;
	        });
	    };
	    Kage.prototype.getEachStrokes = function (glyphData) {
	        var strokesArray = [];
	        var strokes = glyphData.split("$");
	        for (var _i = 0, strokes_1 = strokes; _i < strokes_1.length; _i++) {
	            var stroke = strokes_1[_i];
	            var columns = stroke.split(":");
	            if (Math.floor(+columns[0]) !== 99) {
	                strokesArray.push(new Stroke([
	                    Math.floor(+columns[0]),
	                    Math.floor(+columns[1]),
	                    Math.floor(+columns[2]),
	                    Math.floor(+columns[3]),
	                    Math.floor(+columns[4]),
	                    Math.floor(+columns[5]),
	                    Math.floor(+columns[6]),
	                    Math.floor(+columns[7]),
	                    Math.floor(+columns[8]),
	                    Math.floor(+columns[9]),
	                    Math.floor(+columns[10]),
	                ]));
	            }
	            else {
	                var buhin = this.kBuhin.search(columns[7]);
	                if (buhin !== "") {
	                    strokesArray = strokesArray.concat(this.getEachStrokesOfBuhin(buhin, Math.floor(+columns[3]), Math.floor(+columns[4]), Math.floor(+columns[5]), Math.floor(+columns[6]), Math.floor(+columns[1]), Math.floor(+columns[2]), Math.floor(+columns[9]), Math.floor(+columns[10])));
	                }
	            }
	        }
	        return strokesArray;
	    };
	    Kage.prototype.getEachStrokesOfBuhin = function (buhin, x1, y1, x2, y2, sx, sy, sx2, sy2) {
	        var strokes = this.getEachStrokes(buhin);
	        var box = this.getBox(strokes);
	        if (sx !== 0 || sy !== 0) {
	            if (sx > 100) {
	                sx -= 200;
	            }
	            else {
	                sx2 = 0;
	                sy2 = 0;
	            }
	        }
	        for (var _i = 0, strokes_2 = strokes; _i < strokes_2.length; _i++) {
	            var stroke = strokes_2[_i];
	            if (sx !== 0 || sy !== 0) {
	                stroke.stretch(sx, sx2, sy, sy2, box.minX, box.maxX, box.minY, box.maxY);
	            }
	            stroke.x1 = x1 + stroke.x1 * (x2 - x1) / 200;
	            stroke.y1 = y1 + stroke.y1 * (y2 - y1) / 200;
	            stroke.x2 = x1 + stroke.x2 * (x2 - x1) / 200;
	            stroke.y2 = y1 + stroke.y2 * (y2 - y1) / 200;
	            stroke.x3 = x1 + stroke.x3 * (x2 - x1) / 200;
	            stroke.y3 = y1 + stroke.y3 * (y2 - y1) / 200;
	            stroke.x4 = x1 + stroke.x4 * (x2 - x1) / 200;
	            stroke.y4 = y1 + stroke.y4 * (y2 - y1) / 200;
	        }
	        return strokes;
	    };
	    Kage.prototype.getBox = function (strokes) {
	        var minX = 200;
	        var minY = 200;
	        var maxX = 0;
	        var maxY = 0;
	        for (var _i = 0, strokes_3 = strokes; _i < strokes_3.length; _i++) {
	            var stroke = strokes_3[_i];
	            var _a = stroke.getBox(), sminX = _a.minX, smaxX = _a.maxX, sminY = _a.minY, smaxY = _a.maxY;
	            minX = Math.min(minX, sminX);
	            maxX = Math.max(maxX, smaxX);
	            minY = Math.min(minY, sminY);
	            maxY = Math.max(maxY, smaxY);
	        }
	        return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
	    };
	    /** An alias of Buhin constructor. */
	    Kage.Buhin = Buhin;
	    /** An alias of Polygons constructor. */
	    Kage.Polygons = Polygons;
	    return Kage;
	}());

	let pxe = new Kage();
	pxe.kUseCurve=true;
	let renderedComponents=[];

	const resizeSVG=(svg,size=64)=>svg.replace(/(width|height)=\"\d+\"/g,(m,m1,m2)=>m1+'="'+size+'"');
	const patchSVG=(svg,patch)=>svg.replace(/<svg /,'<svg '+patch+' ');
	const patchColor=(svg,color)=>svg.replace(/fill="black"/g,'fill="'+color+'"');

	const setKageOption=(opts,engine)=>{
		engine=engine||pxe;
		const fontface=getFontFace(opts.fontface||'');
		if (fontface) {
			engine.kShotai=fontface.hei?1:0;
			for (let key in fontface) engine.kFont[key]=fontface[key];
		} else {
			engine.kShotai=opts.hei?1:0;
			engine.kFont.kWidth=opts.width||5;		
		}
	};
	const addFrameToSVG=(gd,svg)=>{
		const frames=frameOf(gd); 
		let framesvg='';
		for (let i=0;i<frames.length;i++) {
			const [x,y,x2,y2]=frames[i];
			const w=x2-x, h=y2-y;
			const color='hsl('+((i+1)*60) +' ,50%,30%)';		
			framesvg+=`<rect x=${x} y=${y} width=${w} height=${h} 
		 style="fill:none;stroke: ${color} ; stroke-width:${i+1}" ></rect>`;
		}
		return appendToSVG(framesvg,svg);
	};
	const  drawGlyph=(unicode , opts={})=>{
		if (!unicode) return '';
		const components={};
		const size=opts.size||128;
		opts.alt||false;
		const color=opts.color||'black';
		opts.frame||false;
		
		let gid;
		let polygons = new Kage.Polygons();

		if (unicode.codePointAt(0)<0x2000) { 
			gid=unicode;
		} else {
			gid='u'+unicode.codePointAt(0).toString(16);
		}
		const d=getGlyph$1(gid);

		if (!d) return unicode;
		loadComponents(d,components);

		for (let comp in components) {
			pxe.kBuhin.push(comp,components[comp]);
		}
		pxe.kBuhin.push(gid,d);
		renderedComponents.push(...Object.keys(components));
		setKageOption(opts,pxe);
		
		pxe.makeGlyph(polygons, gid);
		if (opts.polygon) return polygons.array.map(it=>it._array);
		let svg=polygons.generateSVG(true);
		
		svg = opts.frame?addFrameToSVG(d,svg):svg;
		svg = patchSVG(svg, 'style="padding-top:0.2em" gid="'+gid+ '" title="'+unicode+'"');
		if (color!=='black' && color) svg = patchColor(svg, color);
		return resizeSVG( svg,size);
	};
	const drawPinxChar=(ire,opts={})=>{
		const chars=splitUTF32(ire);

		if (!(validIRE(ire))) return drawGlyph(ire);
		let i=0,polygons = new Kage.Polygons();
		const size=opts.size||128;
		let appends=[];
		while (i<chars.length-2) {
			const components={};	
			const d=getGlyph$1(chars[i]);
			pxe.kBuhin.push(ch2gid$1(chars[i]),d);
			loadComponents(d,components);

			//const func=Instructions[String.fromCodePoint(chars[i+1])];
			let from,to;
			// if (func) {
			// 	[from,to,append]=func(chars.slice(i));
			// 	appends.push(append);
			// } else {
				from = ch2gid$1(chars[i+1]||'');
				to   = ch2gid$1(chars[i+2]||'');
			// }
			for (let c in components) {
				if (c.slice(0,from.length)==from) { 
					
					let repl=getGlyph$1(to+c.slice(from.length)); //same variant
					if (!repl) repl=getGlyph$1(to);
					pxe.kBuhin.push(c, repl ) ; //替換，但框不變，  	
					const comps={};
					loadComponents(repl,comps);
					for (let c2 in comps) pxe.kBuhin.push(c2, comps[c2]);
				} else {
					pxe.kBuhin.push(c, components[c]);
				}
			}
			renderedComponents.push(...Object.keys(components));			
			i+=2;
		}
		const d=getGlyph$1(chars[0]);
		pxe.kBuhin.push(ire,d);
		setKageOption(opts,pxe);
		pxe.makeGlyph(polygons, ire);
		if (opts.polygon) return polygons.array.map(it=>it._array);
		let svg=polygons.generateSVG(true);
		appends.forEach(append=>svg=appendToSVG(append,svg));
		svg = opts.frame?addFrameToSVG(d,svg):svg;
		svg = patchSVG(svg, 'style="padding-top:0.2em" title="'+ire+'"');
		if (opts.color!=='black' && opts.color) svg = patchColor(svg, opts.color);
		svg = resizeSVG(svg,size);
		return svg;
	};
	const drawPinx=(str,opts={})=>{
		pxe = new Kage();
		pxe.kUseCurve = true;
		renderedComponents=[];
	    const units=splitPinx(str,true); // char not in glyph database will be expanded automatically
	    const out=[];
	    for (let i=0;i<units.length;i++) {
	    	const u=units[i];
	    	out.push( (codePointLength(u)==1? (drawGlyph(u,opts)): (drawPinxChar(u,opts))));
	    }
		return out;
	};

	let gw= typeof window!=='undefined' && window.BMP;
	let _cjkbmp= typeof window!=='undefined' && window.CJKBMP;
	let _cjkext= typeof window!=='undefined' && window.CJKEXT;
	let getGlyph;
	const deserializeGlyphUnit=glyphdata=>glyphdata.split('$').filter(it=>it!=='0:0:0:0').map(item=>item.split(':'));

	const eachGlyph=cb=>{
		const cjkbmp=_cjkbmp||window.CJKBMP;
		const cjkext=_cjkext||window.CJKEXT;
		if (cjkbmp) {
			for (let i=0;i<cjkbmp.length;i++) cb('u'+(i+0x3400).toString(16), unpackGD(cjkbmp[i]));
			for (let i=0;i<cjkext.length;i++) cb('u'+(i+0x20000).toString(16), unpackGD(cjkext[i]));
		} else {
			for (let i=0;i<gw.length;i++) {
				if (getGlyph==getGlyph_wiki) {
					const gid=gw[i].slice(0,72).trim();
					const data=gw[i].slice(84);
					cb(gid,data);			
				} else {
					const at=gw[i].indexOf('=');
					cb( gw[i].slice(0,at),gw[i].slice(at+1));
				}
			}		
		}
	};
	const getGlyph_wiki=gid=>{ //get from raw wiki format
		if (gid[0]!==' ') gid=' '+gid;//first char is always ' '
		if (~gid.indexOf('@')) {
			gid=gid.replace(/@\d+$/,'');
		}
		const at=bsearch(gw,gid); //try to reuse getGlyph_js

		if (at<1) {
			// console.log('not found',gid)
			return '';
		}
		if (gw[at].slice(0,gid.length+1)!==gid+' ') {
			// console.log('not found2',gid,gw[at])
			return '';
		}
		return gw[at].slice(84);
	};


	let derived=null;

	const derivedOf=(gid,max)=>{
		if (!derived) buildDerivedIndex();

		if (typeof gid=='number') { //exact number
			return derived[ ch2gid(gid)] || [];
		}
		else if (gid.charCodeAt(0)>0x2000) { // a char
			const prefix='u'+gid.charCodeAt(0).toString(16);
			const out=[];
			for (let i in derived) {
				if (i.startsWith(prefix)) out.push( ... (derived[i] || []));
				if (max && out.length>max) break;
			}
			return max?out.slice(0,max):out;
		} else { //a gid
			return derived[gid]||[];
		}
		
	};

	const buildDerivedIndex=()=>{
		if (!derived) derived={};
		console.time('buildDerivedIndex');
		eachGlyph((gid,data)=>{
			// const comps=componentsOfGD(data,true); //recursive is too slow to unpackGD
			const units=deserializeGlyphUnit(data);
			for (let i=0;i<units.length;i++) {
				if (units[i][0]!=='99') continue;
				const comp=units[i][7];
				if (!derived[comp]) derived[comp]=[];
				derived[comp].push(gid);
	 		}
		});
		console.timeEnd('buildDerivedIndex');
	};

	const inRange=(s,cjkranges )=>{
		const rangename=CJKRangeName$1(s);
		return ~cjkranges.indexOf(rangename);
	};
	const replaceReg=/\07([^\07]+)\07/g;

	const extractPinx=(html,opts={}) =>{
		const pair=opts.pair||'︻︼';
		const cjk=opts.cjk||'ABCDEFGHZ';
		const cjkranges=cjk.toUpperCase().split('').map(s=>'Ext'+s); //match the CJKRangeName
		const Pinx=[];  // keep the parameters for drawPinx, array index is \07idx\07 svg insert point

		const getReplaceId=(s)=>{
			const at=Pinx.indexOf(s);
			if (at==-1) {
				Pinx.push(s);
				return Pinx.length-1;
			}
			return at;
		};
		if (pair && pair.length==2) { //as finding Pinx is slow, user need to specify a enclosing pattern
			const [left,right]=splitUTF32Char(pair);
			const reg=new RegExp(left+'([^'+right+']+)'+right,'g');
			html=html.replace(reg, (m,m1)=>{
				const id=getReplaceId(m1);
				return String.fromCharCode(7) + id.toString() +String.fromCharCode(7) ;
			});
		}
		html=html.replace(/([\ud800-\udfff]{2})/g,function(m,sur){ //extract replaceble CJK Extension
			if (inRange(sur,cjkranges)) {
				const id=getReplaceId(sur);
				return String.fromCharCode(7) + id.toString() +String.fromCharCode(7) ;
			} else {
				return sur;
			}
		});
		return [html,Pinx];
	};

	// this is a naive implementation, assuming ele has fix style
	const injectPinx=(ele,opts={})=>{
		const {color ,fontSize}=window.getComputedStyle(ele); 
		const size=parseInt(fontSize)*1.1;
		const [text,replaces]=extractPinx(ele.innerHTML,opts);
		ele.innerHTML=text.replace(replaceReg,(m,id)=>drawPinx(replaces[parseInt(id)],{color,size}));
	};


	const renderPinx=(ele, text='')=>{
		if (!ele) return;
		if (!text) text=ele.innerText;
		const {color ,fontSize}=window.getComputedStyle(ele);
		const size= parseInt(fontSize);
		ele.innerHTML=drawPinx(text,{color,size}).join('');
		return ele.innerText;
	};

	const loadFont=()=>{
		setFont(ptk,gidarr,gwcomp_starts,bmp_starts,ext_starts,0);
	};
	const ready=()=>{
		return new Promise(resolve=>{
			setInterval(()=>{
			},100);
		});
	};
	const renderSelector=(selector='.hzpx')=>{
		const eles=document.querySelectorAll(selector);
		eles.forEach(ele=>Hzpx.injectPinx(ele));
	};
	const Hzpx={ready,isFontReady, drawPinx,loadFont, injectPinx, renderPinx,getLastComps,addFontData};

	if (typeof window!=='undefined' && !window.Hzpx) {
		window.Hzpx=Hzpx;

	}
	if (typeof window!=='undefined') {
		setTimeout(async ()=>{
			await Hzpx.ready();
			if (typeof document=='undefined') return;
			document.body.attributes['hzpx']=true;//tell extension not to render again
			renderSelector();
		},1);	
	}

	//https://stackoverflow.com/questions/3975499/convert-svg-to-image-jpeg-png-etc-in-the-browser

	function triggerDownload (imgURI, fileName) {
	  var evt = new MouseEvent("click", {
	    view: window,
	    bubbles: false,
	    cancelable: true
	  });
	  var a = document.createElement("a");
	  a.setAttribute("download", fileName);
	  a.setAttribute("href", imgURI);
	  a.setAttribute("target", '_blank');
	  a.dispatchEvent(evt);
	}

	function downloadSvg(svg, fileName ,size) {
	  svg.cloneNode(true);

	  // copyStylesInline(copy, svg);
	  var canvas = document.createElement("canvas");
	  // var bbox = svg.getBBox();
	  canvas.width = size;
	  canvas.height = size;
	  var ctx = canvas.getContext("2d");
	  ctx.clearRect(0, 0, size,size);
	  var data = (new XMLSerializer()).serializeToString(svg);
	  var DOMURL = window.URL || window.webkitURL || window;
	  var img = new Image();
	  var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
	  var url = DOMURL.createObjectURL(svgBlob);
	  img.onload = function () {
	    ctx.drawImage(img, 0, 0);
	    DOMURL.revokeObjectURL(url);

	    var imgURI = canvas
	        .toDataURL("image/png")
	        .replace("image/png", "image/octet-stream");

	    triggerDownload(imgURI, fileName);
	  };
	  img.src = url;
	}

	/* src\glyph.svelte generated by Svelte v4.2.18 */
	const file$5 = "src\\glyph.svelte";

	function get_each_context$5(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[14] = list[i];
		return child_ctx;
	}

	// (51:0) {:else}
	function create_else_block$1(ctx) {
		let span;
		let t;

		const block = {
			c: function create() {
				span = element("span");
				t = text(/*gid*/ ctx[0]);
				toggle_class(span, "derivable", /*derivable*/ ctx[1]);
				add_location(span, file$5, 51, 0, 1186);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*gid*/ 1) set_data_dev(t, /*gid*/ ctx[0]);

				if (dirty & /*derivable*/ 2) {
					toggle_class(span, "derivable", /*derivable*/ ctx[1]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$1.name,
			type: "else",
			source: "(51:0) {:else}",
			ctx
		});

		return block;
	}

	// (46:0) {#if derivable}
	function create_if_block_1$1(ctx) {
		let span0;
		let t0_value = gid2ch(/*gid*/ ctx[0]) + "";
		let t0;
		let t1;
		let span1;
		let t2;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				span0 = element("span");
				t0 = text(t0_value);
				t1 = space();
				span1 = element("span");
				t2 = text(/*gid*/ ctx[0]);
				toggle_class(span0, "derivable", /*derivable*/ ctx[1]);
				add_location(span0, file$5, 46, 0, 944);
				attr_dev(span1, "class", "clickable");
				toggle_class(span1, "derivable", /*derivable*/ ctx[1]);
				add_location(span1, file$5, 49, 0, 1103);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span0, anchor);
				append_dev(span0, t0);
				insert_dev(target, t1, anchor);
				insert_dev(target, span1, anchor);
				append_dev(span1, t2);

				if (!mounted) {
					dispose = listen_dev(span1, "click", /*genDerived*/ ctx[8], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty & /*gid*/ 1 && t0_value !== (t0_value = gid2ch(/*gid*/ ctx[0]) + "")) set_data_dev(t0, t0_value);

				if (dirty & /*derivable*/ 2) {
					toggle_class(span0, "derivable", /*derivable*/ ctx[1]);
				}

				if (dirty & /*gid*/ 1) set_data_dev(t2, /*gid*/ ctx[0]);

				if (dirty & /*derivable*/ 2) {
					toggle_class(span1, "derivable", /*derivable*/ ctx[1]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span0);
					detach_dev(t1);
					detach_dev(span1);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$1.name,
			type: "if",
			source: "(46:0) {#if derivable}",
			ctx
		});

		return block;
	}

	// (58:0) {#each partialDerived(batch) as d}
	function create_each_block$5(ctx) {
		let glyph;
		let current;

		glyph = new Glyph({
				props: {
					gid: /*d*/ ctx[14],
					fontface: /*fontface*/ ctx[2]
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(glyph.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(glyph, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const glyph_changes = {};
				if (dirty & /*batch*/ 32) glyph_changes.gid = /*d*/ ctx[14];
				if (dirty & /*fontface*/ 4) glyph_changes.fontface = /*fontface*/ ctx[2];
				glyph.$set(glyph_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(glyph.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(glyph.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(glyph, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$5.name,
			type: "each",
			source: "(58:0) {#each partialDerived(batch) as d}",
			ctx
		});

		return block;
	}

	// (57:0) {#key batch}
	function create_key_block$2(ctx) {
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*partialDerived*/ ctx[9](/*batch*/ ctx[5]));
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*partialDerived, batch, fontface*/ 548) {
					each_value = ensure_array_like_dev(/*partialDerived*/ ctx[9](/*batch*/ ctx[5]));
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$5(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$5(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_key_block$2.name,
			type: "key",
			source: "(57:0) {#key batch}",
			ctx
		});

		return block;
	}

	// (62:0) {#if batch*batchsize<derived.length}
	function create_if_block$1(ctx) {
		let span;
		let t0;
		let t1_value = /*derived*/ ctx[6].length - /*batch*/ ctx[5] * batchsize + "";
		let t1;
		let t2;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				span = element("span");
				t0 = text("…");
				t1 = text(t1_value);
				t2 = text("…");
				attr_dev(span, "class", "clickable");
				add_location(span, file$5, 65, 0, 1526);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t0);
				append_dev(span, t1);
				append_dev(span, t2);

				if (!mounted) {
					dispose = listen_dev(span, "click", /*morebatch*/ ctx[10], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty & /*derived, batch*/ 96 && t1_value !== (t1_value = /*derived*/ ctx[6].length - /*batch*/ ctx[5] * batchsize + "")) set_data_dev(t1, t1_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(62:0) {#if batch*batchsize<derived.length}",
			ctx
		});

		return block;
	}

	function create_fragment$5(ctx) {
		let ruby;
		let span0;
		let t0;
		let rt;
		let t1;
		let span1;
		let t2;
		let t3;
		let previous_key = /*batch*/ ctx[5];
		let t4;
		let if_block1_anchor;
		let current;
		let mounted;
		let dispose;

		function select_block_type(ctx, dirty) {
			if (/*derivable*/ ctx[1]) return create_if_block_1$1;
			return create_else_block$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block0 = current_block_type(ctx);
		let key_block = create_key_block$2(ctx);
		let if_block1 = /*batch*/ ctx[5] * batchsize < /*derived*/ ctx[6].length && create_if_block$1(ctx);

		const block = {
			c: function create() {
				ruby = element("ruby");
				span0 = element("span");
				t0 = space();
				rt = element("rt");
				if_block0.c();
				t1 = space();
				span1 = element("span");
				t2 = text(/*msg*/ ctx[4]);
				t3 = space();
				key_block.c();
				t4 = space();
				if (if_block1) if_block1.c();
				if_block1_anchor = empty();
				attr_dev(span0, "title", /*gid*/ ctx[0]);
				add_location(span0, file$5, 43, 0, 844);
				add_location(rt, file$5, 44, 0, 923);
				add_location(ruby, file$5, 40, 0, 721);
				attr_dev(span1, "class", "msg");
				add_location(span1, file$5, 55, 0, 1241);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, ruby, anchor);
				append_dev(ruby, span0);
				span0.innerHTML = /*svg*/ ctx[7];
				append_dev(ruby, t0);
				append_dev(ruby, rt);
				if_block0.m(rt, null);
				insert_dev(target, t1, anchor);
				insert_dev(target, span1, anchor);
				append_dev(span1, t2);
				insert_dev(target, t3, anchor);
				key_block.m(target, anchor);
				insert_dev(target, t4, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert_dev(target, if_block1_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen_dev(span0, "click", /*click_handler*/ ctx[13], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*gid*/ 1) {
					attr_dev(span0, "title", /*gid*/ ctx[0]);
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(ctx);

					if (if_block0) {
						if_block0.c();
						if_block0.m(rt, null);
					}
				}

				if (!current || dirty & /*msg*/ 16) set_data_dev(t2, /*msg*/ ctx[4]);

				if (dirty & /*batch*/ 32 && safe_not_equal(previous_key, previous_key = /*batch*/ ctx[5])) {
					group_outros();
					transition_out(key_block, 1, 1, noop);
					check_outros();
					key_block = create_key_block$2(ctx);
					key_block.c();
					transition_in(key_block, 1);
					key_block.m(t4.parentNode, t4);
				} else {
					key_block.p(ctx, dirty);
				}

				if (/*batch*/ ctx[5] * batchsize < /*derived*/ ctx[6].length) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block$1(ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(key_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(key_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(ruby);
					detach_dev(t1);
					detach_dev(span1);
					detach_dev(t3);
					detach_dev(t4);
					detach_dev(if_block1_anchor);
				}

				if_block0.d();
				key_block.d(detaching);
				if (if_block1) if_block1.d(detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	const batchsize = 30;

	function instance$5($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Glyph', slots, []);
		let { gid } = $$props;
		let { derivable = false, fontface } = $$props;
		let { size = 48 * (derivable ? 1.5 : 1) } = $$props;
		let msg = '';
		let { onclick = null } = $$props;
		let batch = 0;
		const svg = drawGlyph(gid, { size, fontface });
		let derived = [];

		const genDerived = () => {
			if (!derivable) return;

			if (derived.length) {
				$$invalidate(5, batch = 0);
			} else {
				$$invalidate(4, msg = '⌛...');

				setTimeout(
					() => {
						$$invalidate(6, derived = derivedOf(gid));
						$$invalidate(5, batch = 1);
						$$invalidate(4, msg = '');
					},
					1
				);
			}
		};

		const partialDerived = () => {
			const s = derived.slice(0, batchsize * batch);
			return s;
		};

		const morebatch = () => {
			$$invalidate(5, batch++, batch);
		};

		const toPNG = evt => {
			downloadSvg(evt.target, gid2ch(gid) + ".png", size);
		};

		$$self.$$.on_mount.push(function () {
			if (gid === undefined && !('gid' in $$props || $$self.$$.bound[$$self.$$.props['gid']])) {
				console.warn("<Glyph> was created without expected prop 'gid'");
			}

			if (fontface === undefined && !('fontface' in $$props || $$self.$$.bound[$$self.$$.props['fontface']])) {
				console.warn("<Glyph> was created without expected prop 'fontface'");
			}
		});

		const writable_props = ['gid', 'derivable', 'fontface', 'size', 'onclick'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Glyph> was created with unknown prop '${key}'`);
		});

		const click_handler = e => onclick ? onclick(e) : toPNG(e);

		$$self.$$set = $$props => {
			if ('gid' in $$props) $$invalidate(0, gid = $$props.gid);
			if ('derivable' in $$props) $$invalidate(1, derivable = $$props.derivable);
			if ('fontface' in $$props) $$invalidate(2, fontface = $$props.fontface);
			if ('size' in $$props) $$invalidate(12, size = $$props.size);
			if ('onclick' in $$props) $$invalidate(3, onclick = $$props.onclick);
		};

		$$self.$capture_state = () => ({
			drawGlyph,
			gid2ch,
			derivedOf,
			downloadSvg,
			gid,
			derivable,
			fontface,
			size,
			msg,
			batchsize,
			onclick,
			batch,
			svg,
			derived,
			genDerived,
			partialDerived,
			morebatch,
			toPNG
		});

		$$self.$inject_state = $$props => {
			if ('gid' in $$props) $$invalidate(0, gid = $$props.gid);
			if ('derivable' in $$props) $$invalidate(1, derivable = $$props.derivable);
			if ('fontface' in $$props) $$invalidate(2, fontface = $$props.fontface);
			if ('size' in $$props) $$invalidate(12, size = $$props.size);
			if ('msg' in $$props) $$invalidate(4, msg = $$props.msg);
			if ('onclick' in $$props) $$invalidate(3, onclick = $$props.onclick);
			if ('batch' in $$props) $$invalidate(5, batch = $$props.batch);
			if ('derived' in $$props) $$invalidate(6, derived = $$props.derived);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			gid,
			derivable,
			fontface,
			onclick,
			msg,
			batch,
			derived,
			svg,
			genDerived,
			partialDerived,
			morebatch,
			toPNG,
			size,
			click_handler
		];
	}

	class Glyph extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$5, create_fragment$5, safe_not_equal, {
				gid: 0,
				derivable: 1,
				fontface: 2,
				size: 12,
				onclick: 3
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Glyph",
				options,
				id: create_fragment$5.name
			});
		}

		get gid() {
			throw new Error("<Glyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set gid(value) {
			throw new Error("<Glyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get derivable() {
			throw new Error("<Glyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set derivable(value) {
			throw new Error("<Glyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get fontface() {
			throw new Error("<Glyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fontface(value) {
			throw new Error("<Glyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get size() {
			throw new Error("<Glyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set size(value) {
			throw new Error("<Glyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get onclick() {
			throw new Error("<Glyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set onclick(value) {
			throw new Error("<Glyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	const CJKRanges={
	    'BMP': [0x4e00,0x9fa5],
	    'ExtA':[0x3400,0x4dff],
	    'ExtB':[0x20000,0x2A6FF],
	    'ExtC':[0x2A700,0x2B73F],
	    'ExtD':[0x2B740,0x2B81F],
	    'ExtE':[0x2B820,0x2CEAF],
	    'ExtF':[0x2CEB0,0x2EBE0],
	    'ExtG':[0x30000,0x3134F],
	    'ExtH':[0x31350,0x323AF],
	    'ExtZ':[0xA0000,0xD47FF]
	};
	const enumCJKRangeNames=()=>Object.keys(CJKRanges);

	const getCJKRange=(name)=>CJKRanges[name]||[0,0];

	const CJKRangeName=(s)=>{//return cjk range name by a char or unicode number value or a base 16 string
	    let cp=0;
	    if (typeof s==='string') {
	        const code=parseInt(s,16);
	        if (!isNaN(code)) {
	            cp=code;
	        } else {
	            cp=s.codePointAt(0)||0;
	        }
	    }
	    for (let rangename in CJKRanges) {
	        const [from,to]=CJKRanges[rangename];
	        if (cp>=from && cp<=to) return rangename;
	    }
	};
	const string2codePoint=(str, snap)=>{
	    if (!str) return 0;
	    const cp=str.codePointAt(0)||0;
	    let n;
	    if (cp>=0x3400 && cp<0x2ffff) {
	        n=cp; 
	    } else {
	        n=(parseInt(str,16)||0x4e00);
	    }
	    return snap? n&0x3ff80 : n;
	};

	/* src\charmaprow.svelte generated by Svelte v4.2.18 */
	const file$4 = "src\\charmaprow.svelte";

	function get_each_context$4(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[12] = list[i];
		return child_ctx;
	}

	// (33:0) {#each chars as ch}
	function create_each_block$4(ctx) {
		let ruby;
		let rb;
		let span;
		let raw_value = /*draw*/ ctx[5](/*ch*/ ctx[12], /*ire*/ ctx[1]) + "";
		let rt;
		let t1;
		let mounted;
		let dispose;

		function click_handler() {
			return /*click_handler*/ ctx[9](/*ch*/ ctx[12]);
		}

		const block = {
			c: function create() {
				ruby = element("ruby");
				rb = element("rb");
				span = element("span");
				rt = element("rt");
				rt.textContent = `${/*ch*/ ctx[12].codePointAt(0).toString(16)}`;
				t1 = space();
				attr_dev(span, "title", /*todraw*/ ctx[4](/*ch*/ ctx[12]));
				add_location(span, file$4, 35, 27, 989);
				attr_dev(rb, "class", "charmap-glyph");
				add_location(rb, file$4, 35, 0, 962);
				attr_dev(rt, "class", "charmap-codepoint");
				toggle_class(rt, "selected", /*glyph*/ ctx[0] == /*ch*/ ctx[12]);
				add_location(rt, file$4, 35, 84, 1046);
				add_location(ruby, file$4, 34, 0, 928);
			},
			m: function mount(target, anchor) {
				insert_dev(target, ruby, anchor);
				append_dev(ruby, rb);
				append_dev(rb, span);
				span.innerHTML = raw_value;
				append_dev(ruby, rt);
				append_dev(ruby, t1);

				if (!mounted) {
					dispose = listen_dev(ruby, "click", click_handler, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*ire*/ 2 && raw_value !== (raw_value = /*draw*/ ctx[5](/*ch*/ ctx[12], /*ire*/ ctx[1]) + "")) span.innerHTML = raw_value;
				if (dirty & /*glyph, chars*/ 5) {
					toggle_class(rt, "selected", /*glyph*/ ctx[0] == /*ch*/ ctx[12]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(ruby);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$4.name,
			type: "each",
			source: "(33:0) {#each chars as ch}",
			ctx
		});

		return block;
	}

	function create_fragment$4(ctx) {
		let each_1_anchor;
		let each_value = ensure_array_like_dev(/*chars*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*onClick, chars, glyph, todraw, draw, ire*/ 63) {
					each_value = ensure_array_like_dev(/*chars*/ ctx[2]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$4(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$4($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Charmaprow', slots, []);
		let { rowstart = 0x4e00 } = $$props;
		let { fontface } = $$props;
		let { glyph = '' } = $$props;
		let { base = '' } = $$props;
		let ire = false;
		let chars = [];
		let selected = String.fromCodePoint(string2codePoint(glyph));

		for (let i = 0; i < 16; i++) {
			chars.push(String.fromCodePoint(rowstart + i));
		}

		const copyToClipboard = async ch => {
			await navigator.clipboard.writeText(ch);
		};

		const onClick = async ch => {
			if (glyph == ch) {
				$$invalidate(1, ire = !ire);
			} else {
				$$invalidate(0, glyph = ch);
			}

			await copyToClipboard();
		};

		const todraw = ch => ch; //(ire && base && glyph==ch)?reBase(ch,base):ch;

		const draw = (ch, glyph) => drawPinx(todraw(ch), {
			size: 48,
			alt: true,
			fontface,
			color: todraw(ch) !== ch ? 'green' : 'black'
		});

		$$self.$$.on_mount.push(function () {
			if (fontface === undefined && !('fontface' in $$props || $$self.$$.bound[$$self.$$.props['fontface']])) {
				console.warn("<Charmaprow> was created without expected prop 'fontface'");
			}
		});

		const writable_props = ['rowstart', 'fontface', 'glyph', 'base'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Charmaprow> was created with unknown prop '${key}'`);
		});

		const click_handler = ch => onClick(ch);

		$$self.$$set = $$props => {
			if ('rowstart' in $$props) $$invalidate(6, rowstart = $$props.rowstart);
			if ('fontface' in $$props) $$invalidate(7, fontface = $$props.fontface);
			if ('glyph' in $$props) $$invalidate(0, glyph = $$props.glyph);
			if ('base' in $$props) $$invalidate(8, base = $$props.base);
		};

		$$self.$capture_state = () => ({
			Glyph,
			drawPinx,
			splitPinx,
			string2codePoint,
			rowstart,
			fontface,
			glyph,
			base,
			ire,
			chars,
			selected,
			copyToClipboard,
			onClick,
			todraw,
			draw
		});

		$$self.$inject_state = $$props => {
			if ('rowstart' in $$props) $$invalidate(6, rowstart = $$props.rowstart);
			if ('fontface' in $$props) $$invalidate(7, fontface = $$props.fontface);
			if ('glyph' in $$props) $$invalidate(0, glyph = $$props.glyph);
			if ('base' in $$props) $$invalidate(8, base = $$props.base);
			if ('ire' in $$props) $$invalidate(1, ire = $$props.ire);
			if ('chars' in $$props) $$invalidate(2, chars = $$props.chars);
			if ('selected' in $$props) selected = $$props.selected;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			glyph,
			ire,
			chars,
			onClick,
			todraw,
			draw,
			rowstart,
			fontface,
			base,
			click_handler
		];
	}

	class Charmaprow extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$4, create_fragment$4, safe_not_equal, {
				rowstart: 6,
				fontface: 7,
				glyph: 0,
				base: 8
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Charmaprow",
				options,
				id: create_fragment$4.name
			});
		}

		get rowstart() {
			throw new Error("<Charmaprow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set rowstart(value) {
			throw new Error("<Charmaprow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get fontface() {
			throw new Error("<Charmaprow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fontface(value) {
			throw new Error("<Charmaprow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get glyph() {
			throw new Error("<Charmaprow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set glyph(value) {
			throw new Error("<Charmaprow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get base() {
			throw new Error("<Charmaprow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set base(value) {
			throw new Error("<Charmaprow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\charmap.svelte generated by Svelte v4.2.18 */

	const file$3 = "src\\charmap.svelte";

	function get_each_context$3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[9] = list[i];
		return child_ctx;
	}

	function get_each_context_1$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[12] = list[i];
		return child_ctx;
	}

	// (41:0) {#each enumCJKRangeNames() as name}
	function create_each_block_1$2(ctx) {
		let span;
		let mounted;
		let dispose;

		function click_handler() {
			return /*click_handler*/ ctx[6](/*name*/ ctx[12]);
		}

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = `${/*name*/ ctx[12]}`;
				attr_dev(span, "class", "clickable");
				toggle_class(span, "selected", CJKRangeName(/*glyph*/ ctx[0]) == /*name*/ ctx[12]);
				add_location(span, file$3, 44, 0, 1136);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);

				if (!mounted) {
					dispose = listen_dev(span, "click", click_handler, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (dirty & /*glyph*/ 1) {
					toggle_class(span, "selected", CJKRangeName(/*glyph*/ ctx[0]) == /*name*/ ctx[12]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1$2.name,
			type: "each",
			source: "(41:0) {#each enumCJKRangeNames() as name}",
			ctx
		});

		return block;
	}

	// (40:0) {#key glyph}
	function create_key_block_1(ctx) {
		let each_1_anchor;
		let each_value_1 = ensure_array_like_dev(enumCJKRangeNames());
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*glyph*/ 1) {
					each_value_1 = ensure_array_like_dev(enumCJKRangeNames());
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_1$2(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_1.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_key_block_1.name,
			type: "key",
			source: "(40:0) {#key glyph}",
			ctx
		});

		return block;
	}

	// (50:0) {#each rows as rowstart }
	function create_each_block$3(ctx) {
		let div;
		let charmaprow;
		let updating_glyph;
		let current;

		function charmaprow_glyph_binding(value) {
			/*charmaprow_glyph_binding*/ ctx[7](value);
		}

		let charmaprow_props = {
			rowstart: /*rowstart*/ ctx[9],
			fontface: /*fontface*/ ctx[1]
		};

		if (/*glyph*/ ctx[0] !== void 0) {
			charmaprow_props.glyph = /*glyph*/ ctx[0];
		}

		charmaprow = new Charmaprow({ props: charmaprow_props, $$inline: true });
		binding_callbacks.push(() => bind(charmaprow, 'glyph', charmaprow_glyph_binding));

		const block = {
			c: function create() {
				div = element("div");
				create_component(charmaprow.$$.fragment);
				add_location(div, file$3, 50, 0, 1328);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(charmaprow, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const charmaprow_changes = {};
				if (dirty & /*rows*/ 4) charmaprow_changes.rowstart = /*rowstart*/ ctx[9];
				if (dirty & /*fontface*/ 2) charmaprow_changes.fontface = /*fontface*/ ctx[1];

				if (!updating_glyph && dirty & /*glyph*/ 1) {
					updating_glyph = true;
					charmaprow_changes.glyph = /*glyph*/ ctx[0];
					add_flush_callback(() => updating_glyph = false);
				}

				charmaprow.$set(charmaprow_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(charmaprow.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(charmaprow.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(charmaprow);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$3.name,
			type: "each",
			source: "(50:0) {#each rows as rowstart }",
			ctx
		});

		return block;
	}

	// (49:0) {#key rows}
	function create_key_block$1(ctx) {
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*rows*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*rows, fontface, glyph*/ 7) {
					each_value = ensure_array_like_dev(/*rows*/ ctx[2]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$3(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_key_block$1.name,
			type: "key",
			source: "(49:0) {#key rows}",
			ctx
		});

		return block;
	}

	function create_fragment$3(ctx) {
		let span0;
		let t1;
		let input;
		let t2;
		let span1;
		let t4;
		let br;
		let t5;
		let previous_key = /*glyph*/ ctx[0];
		let t6;
		let previous_key_1 = /*rows*/ ctx[2];
		let key_block1_anchor;
		let current;
		let mounted;
		let dispose;
		let key_block0 = create_key_block_1(ctx);
		let key_block1 = create_key_block$1(ctx);

		const block = {
			c: function create() {
				span0 = element("span");
				span0.textContent = "⏪";
				t1 = space();
				input = element("input");
				t2 = space();
				span1 = element("span");
				span1.textContent = "⏩";
				t4 = space();
				br = element("br");
				t5 = space();
				key_block0.c();
				t6 = space();
				key_block1.c();
				key_block1_anchor = empty();
				attr_dev(span0, "class", "clickable");
				add_location(span0, file$3, 32, 0, 710);
				attr_dev(input, "size", "4");
				add_location(input, file$3, 33, 0, 761);
				attr_dev(span1, "class", "clickable");
				add_location(span1, file$3, 37, 0, 913);
				add_location(br, file$3, 38, 0, 964);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, span0, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, input, anchor);
				set_input_value(input, /*glyph*/ ctx[0]);
				insert_dev(target, t2, anchor);
				insert_dev(target, span1, anchor);
				insert_dev(target, t4, anchor);
				insert_dev(target, br, anchor);
				insert_dev(target, t5, anchor);
				key_block0.m(target, anchor);
				insert_dev(target, t6, anchor);
				key_block1.m(target, anchor);
				insert_dev(target, key_block1_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(span0, "click", /*prevpage*/ ctx[4], false, false, false, false),
						listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
						listen_dev(span1, "click", /*nextpage*/ ctx[3], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*glyph*/ 1 && input.value !== /*glyph*/ ctx[0]) {
					set_input_value(input, /*glyph*/ ctx[0]);
				}

				if (dirty & /*glyph*/ 1 && safe_not_equal(previous_key, previous_key = /*glyph*/ ctx[0])) {
					key_block0.d(1);
					key_block0 = create_key_block_1(ctx);
					key_block0.c();
					key_block0.m(t6.parentNode, t6);
				} else {
					key_block0.p(ctx, dirty);
				}

				if (dirty & /*rows*/ 4 && safe_not_equal(previous_key_1, previous_key_1 = /*rows*/ ctx[2])) {
					group_outros();
					transition_out(key_block1, 1, 1, noop);
					check_outros();
					key_block1 = create_key_block$1(ctx);
					key_block1.c();
					transition_in(key_block1, 1);
					key_block1.m(key_block1_anchor.parentNode, key_block1_anchor);
				} else {
					key_block1.p(ctx, dirty);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(key_block1);
				current = true;
			},
			o: function outro(local) {
				transition_out(key_block1);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span0);
					detach_dev(t1);
					detach_dev(input);
					detach_dev(t2);
					detach_dev(span1);
					detach_dev(t4);
					detach_dev(br);
					detach_dev(t5);
					detach_dev(t6);
					detach_dev(key_block1_anchor);
				}

				key_block0.d(detaching);
				key_block1.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Charmap', slots, []);
		let { glyph } = $$props;
		let { fontface } = $$props;
		let rows = [];

		const updatePage = () => {
			let n = string2codePoint(glyph, true);
			$$invalidate(2, rows.length = 0, rows);

			for (let i = 0; i < 8; i++) {
				rows.push(n + 16 * i);
			}
		};

		const nextpage = () => {
			let n = string2codePoint(glyph, true) + 128;
			$$invalidate(0, glyph = n.toString(16));
			updatePage();
		};

		const prevpage = () => {
			let n = string2codePoint(glyph, true);

			if (n - 128 >= 0x0) {
				$$invalidate(0, glyph = (n - 128).toString(16));
				updatePage();
			}
		};

		$$self.$$.on_mount.push(function () {
			if (glyph === undefined && !('glyph' in $$props || $$self.$$.bound[$$self.$$.props['glyph']])) {
				console.warn("<Charmap> was created without expected prop 'glyph'");
			}

			if (fontface === undefined && !('fontface' in $$props || $$self.$$.bound[$$self.$$.props['fontface']])) {
				console.warn("<Charmap> was created without expected prop 'fontface'");
			}
		});

		const writable_props = ['glyph', 'fontface'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Charmap> was created with unknown prop '${key}'`);
		});

		function input_input_handler() {
			glyph = this.value;
			$$invalidate(0, glyph);
		}

		const click_handler = name => $$invalidate(0, glyph = getCJKRange(name)[0].toString(16));

		function charmaprow_glyph_binding(value) {
			glyph = value;
			$$invalidate(0, glyph);
		}

		$$self.$$set = $$props => {
			if ('glyph' in $$props) $$invalidate(0, glyph = $$props.glyph);
			if ('fontface' in $$props) $$invalidate(1, fontface = $$props.fontface);
		};

		$$self.$capture_state = () => ({
			CharMapRow: Charmaprow,
			CJKRangeName,
			enumCJKRangeNames,
			getCJKRange,
			string2codePoint,
			glyph,
			fontface,
			rows,
			updatePage,
			nextpage,
			prevpage
		});

		$$self.$inject_state = $$props => {
			if ('glyph' in $$props) $$invalidate(0, glyph = $$props.glyph);
			if ('fontface' in $$props) $$invalidate(1, fontface = $$props.fontface);
			if ('rows' in $$props) $$invalidate(2, rows = $$props.rows);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*glyph*/ 1) {
				updatePage();
			}
		};

		return [
			glyph,
			fontface,
			rows,
			nextpage,
			prevpage,
			input_input_handler,
			click_handler,
			charmaprow_glyph_binding
		];
	}

	class Charmap extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, { glyph: 0, fontface: 1 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Charmap",
				options,
				id: create_fragment$3.name
			});
		}

		get glyph() {
			throw new Error("<Charmap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set glyph(value) {
			throw new Error("<Charmap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get fontface() {
			throw new Error("<Charmap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fontface(value) {
			throw new Error("<Charmap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\testbench.svelte generated by Svelte v4.2.18 */
	const file$2 = "src\\testbench.svelte";

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[11] = list[i];
		return child_ctx;
	}

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[14] = list[i];
		return child_ctx;
	}

	// (47:0) {#each glyphdata as unit}
	function create_each_block_1$1(ctx) {
		let div;
		let t_value = /*unit*/ ctx[14] + "";
		let t;

		const block = {
			c: function create() {
				div = element("div");
				t = text(t_value);
				attr_dev(div, "class", "glyphdata svelte-1mstjcy");
				add_location(div, file$2, 47, 0, 1207);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*glyphdata*/ 16 && t_value !== (t_value = /*unit*/ ctx[14] + "")) set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1$1.name,
			type: "each",
			source: "(47:0) {#each glyphdata as unit}",
			ctx
		});

		return block;
	}

	// (50:0) {#each candidates as base}
	function create_each_block$2(ctx) {
		let span;
		let t_value = /*base*/ ctx[11] + "";
		let t;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				span = element("span");
				t = text(t_value);
				attr_dev(span, "class", "clickable");
				toggle_class(span, "selected", /*activeBase*/ ctx[2] == /*base*/ ctx[11]);
				add_location(span, file$2, 53, 0, 1393);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);

				if (!mounted) {
					dispose = listen_dev(
						span,
						"click",
						function () {
							if (is_function(/*setActiveBase*/ ctx[6](/*base*/ ctx[11]))) /*setActiveBase*/ ctx[6](/*base*/ ctx[11]).apply(this, arguments);
						},
						false,
						false,
						false,
						false
					);

					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*candidates*/ 8 && t_value !== (t_value = /*base*/ ctx[11] + "")) set_data_dev(t, t_value);

				if (dirty & /*activeBase, candidates*/ 12) {
					toggle_class(span, "selected", /*activeBase*/ ctx[2] == /*base*/ ctx[11]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$2.name,
			type: "each",
			source: "(50:0) {#each candidates as base}",
			ctx
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let a;
		let t1;
		let table;
		let tr;
		let td0;
		let charmap;
		let updating_glyph;
		let t2;
		let td1;
		let html_tag;
		let t3;
		let br;
		let t4;
		let t5;
		let current;

		function charmap_glyph_binding(value) {
			/*charmap_glyph_binding*/ ctx[7](value);
		}

		let charmap_props = { fontface: /*fontface*/ ctx[0] };

		if (/*glyph*/ ctx[1] !== void 0) {
			charmap_props.glyph = /*glyph*/ ctx[1];
		}

		charmap = new Charmap({ props: charmap_props, $$inline: true });
		binding_callbacks.push(() => bind(charmap, 'glyph', charmap_glyph_binding));
		let each_value_1 = ensure_array_like_dev(/*glyphdata*/ ctx[4]);
		let each_blocks_1 = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
		}

		let each_value = ensure_array_like_dev(/*candidates*/ ctx[3]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				a = element("a");
				a.textContent = "🏠";
				t1 = space();
				table = element("table");
				tr = element("tr");
				td0 = element("td");
				create_component(charmap.$$.fragment);
				t2 = space();
				td1 = element("td");
				html_tag = new HtmlTag(false);
				t3 = space();
				br = element("br");
				t4 = space();

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].c();
				}

				t5 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(a, "class", "homepage");
				attr_dev(a, "href", "https://github.com/accelon/hzpx/");
				add_location(a, file$2, 37, 0, 896);
				attr_dev(td0, "class", "svelte-1mstjcy");
				add_location(td0, file$2, 40, 11, 1115);
				html_tag.a = t3;
				add_location(br, file$2, 45, 0, 1176);
				attr_dev(td1, "class", "svelte-1mstjcy");
				add_location(td1, file$2, 43, 0, 1159);
				add_location(tr, file$2, 40, 7, 1111);
				add_location(table, file$2, 40, 0, 1104);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, table, anchor);
				append_dev(table, tr);
				append_dev(tr, td0);
				mount_component(charmap, td0, null);
				append_dev(tr, t2);
				append_dev(tr, td1);
				html_tag.m(/*svg*/ ctx[5], td1);
				append_dev(td1, t3);
				append_dev(td1, br);
				append_dev(td1, t4);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(td1, null);
					}
				}

				append_dev(td1, t5);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(td1, null);
					}
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				const charmap_changes = {};
				if (dirty & /*fontface*/ 1) charmap_changes.fontface = /*fontface*/ ctx[0];

				if (!updating_glyph && dirty & /*glyph*/ 2) {
					updating_glyph = true;
					charmap_changes.glyph = /*glyph*/ ctx[1];
					add_flush_callback(() => updating_glyph = false);
				}

				charmap.$set(charmap_changes);
				if (!current || dirty & /*svg*/ 32) html_tag.p(/*svg*/ ctx[5]);

				if (dirty & /*glyphdata*/ 16) {
					each_value_1 = ensure_array_like_dev(/*glyphdata*/ ctx[4]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks_1[i]) {
							each_blocks_1[i].p(child_ctx, dirty);
						} else {
							each_blocks_1[i] = create_each_block_1$1(child_ctx);
							each_blocks_1[i].c();
							each_blocks_1[i].m(td1, t5);
						}
					}

					for (; i < each_blocks_1.length; i += 1) {
						each_blocks_1[i].d(1);
					}

					each_blocks_1.length = each_value_1.length;
				}

				if (dirty & /*activeBase, candidates, setActiveBase*/ 76) {
					each_value = ensure_array_like_dev(/*candidates*/ ctx[3]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$2(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(td1, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(charmap.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(charmap.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
					detach_dev(t1);
					detach_dev(table);
				}

				destroy_component(charmap);
				destroy_each(each_blocks_1, detaching);
				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let svg;
		let glyphdata;
		let candidates;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Testbench', slots, []);
		let basew = '', comptofind = '';
		let { fontface } = $$props;
		let glyph = '20000';
		let activeBase = '';

		/*
	最愛構件
	最愛基字

	構件序  glyphwiki 觀點 , hanziyin 觀點
	孳乳    glyphwiki 觀點 , hanziyin 觀點

	基字：以此為基的字...

	狸 ：狗 
	*/
		const resetActiveBase = candidates => {
			if (candidates && ~candidates.indexOf(activeBase)) return;

			if (candidates && candidates.length) {
				$$invalidate(2, activeBase = candidates[0]);
			} else {
				$$invalidate(2, activeBase = ''); //no activebase
			}
		};

		const setActiveBase = base => {
			if (activeBase == base) $$invalidate(2, activeBase = ''); else $$invalidate(2, activeBase = base);
		};

		$$self.$$.on_mount.push(function () {
			if (fontface === undefined && !('fontface' in $$props || $$self.$$.bound[$$self.$$.props['fontface']])) {
				console.warn("<Testbench> was created without expected prop 'fontface'");
			}
		});

		const writable_props = ['fontface'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Testbench> was created with unknown prop '${key}'`);
		});

		function charmap_glyph_binding(value) {
			glyph = value;
			$$invalidate(1, glyph);
		}

		$$self.$$set = $$props => {
			if ('fontface' in $$props) $$invalidate(0, fontface = $$props.fontface);
		};

		$$self.$capture_state = () => ({
			CharMap: Charmap,
			drawPinx,
			drawGlyph,
			getGlyph: getGlyph$1,
			basew,
			comptofind,
			fontface,
			glyph,
			activeBase,
			resetActiveBase,
			setActiveBase,
			candidates,
			glyphdata,
			svg
		});

		$$self.$inject_state = $$props => {
			if ('basew' in $$props) basew = $$props.basew;
			if ('comptofind' in $$props) comptofind = $$props.comptofind;
			if ('fontface' in $$props) $$invalidate(0, fontface = $$props.fontface);
			if ('glyph' in $$props) $$invalidate(1, glyph = $$props.glyph);
			if ('activeBase' in $$props) $$invalidate(2, activeBase = $$props.activeBase);
			if ('candidates' in $$props) $$invalidate(3, candidates = $$props.candidates);
			if ('glyphdata' in $$props) $$invalidate(4, glyphdata = $$props.glyphdata);
			if ('svg' in $$props) $$invalidate(5, svg = $$props.svg);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*glyph, fontface*/ 3) {
				$$invalidate(5, svg = drawPinx(glyph, { size: 200, fontface, frame: true }));
			}

			if ($$self.$$.dirty & /*glyph*/ 2) {
				$$invalidate(4, glyphdata = getGlyph$1(glyph).split('$'));
			}
		};

		$$invalidate(3, candidates = []); //baseCandidate(glyph); 

		return [
			fontface,
			glyph,
			activeBase,
			candidates,
			glyphdata,
			svg,
			setActiveBase,
			charmap_glyph_binding
		];
	}

	class Testbench extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, { fontface: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Testbench",
				options,
				id: create_fragment$2.name
			});
		}

		get fontface() {
			throw new Error("<Testbench>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fontface(value) {
			throw new Error("<Testbench>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	const subscriber_queue = [];

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	const stockbases="㫖仲凒勲匔匰厤吾哪圞埲奛奨娟嬰孲寵屘屢岱峉嶁幥廚彅彨循怠懚戓戭掉敟旟显晔晷暰朥梑歡殣毜毷氇氳泉泴泵沙泊濈炱煴爺牆牕犋犧犧犨狊狸珃瑽璹瓪甂畠畧畩疾皒皸盪睯瞃矞矠矪砠硰磱禧種窟竬竽筯籼粜粪糣緈縆罣羫翇翞翿聘聳聾肿膐艚艚蚦蜰蟧袂袵裂裔觶觺訣諬譵貔賌贎贜趘躎躰軇軸輙達適邁邷鄲酾醒鈝銴鑚钂钰铏闡陚雝霓靟鞃韟韷顢颪飅餥餬馽驕驚骽體髜鬚鬫鬸鬻鮤鯨鵟鷣鸔麜麣黖黸鼊齉齷齾";
	const stockfavorites='鄁阝月$初衤礻$寶缶支$颰犮电$峰夆電雨水$髜昇厏乍电$开腦囟同$衚胡舞$騰月鳥';//鵝鳥烏
	//$𬠶蛇冠寸苗
	//$趁㐱狸里美$国玉囡女书
	//$䳘鳥烏戰口火
	//$痛甬炱台肝
	//$糙造臼
	//月背
	//$寶缶充 not working
	let favorites=writable( ((localStorage.getItem('hzpx-favorites')||stockfavorites).split('$')));
	let bases=writable( splitUTF32Char$1(localStorage.getItem('hzpx-bases')||stockbases));

	let updateTimer;
	const settingsToBeSave={};


	const saveSettings=()=>{ //immediate save
	    for (let key in settingsToBeSave) {
	        localStorage.setItem(key, settingsToBeSave[key]);
	        delete settingsToBeSave[key];
	    }
	    clearTimeout(updateTimer);
	    console.log('settings autosaved on',new Date());
	};

	const updateStorage=items=>{
	    clearTimeout(updateTimer);
	    for (let key in items) {
	        settingsToBeSave['hzpx-'+key]=items[key];    
	    }
	    updateTimer=setTimeout(saveSettings,5000); //autosave in 5 seconds
	};

	bases.subscribe(b=>updateStorage({bases :b.join('')}));
	favorites.subscribe(f=>updateStorage({favorites :f.join('$')}));

	/* src\favorite.svelte generated by Svelte v4.2.18 */
	const file$1 = "src\\favorite.svelte";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i];
		return child_ctx;
	}

	// (26:0) {#each $favorites as f}
	function create_each_block$1(ctx) {
		let span;
		let t_value = /*f*/ ctx[6] + "";
		let t;
		let span_title_value;
		let mounted;
		let dispose;

		function click_handler() {
			return /*click_handler*/ ctx[4](/*f*/ ctx[6]);
		}

		const block = {
			c: function create() {
				span = element("span");
				t = text(t_value);
				attr_dev(span, "class", "clickable");
				attr_dev(span, "title", span_title_value = /*getCodepoints*/ ctx[3](/*f*/ ctx[6]));
				toggle_class(span, "selected", /*value*/ ctx[0] == /*f*/ ctx[6]);
				add_location(span, file$1, 29, 0, 845);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);

				if (!mounted) {
					dispose = listen_dev(span, "click", click_handler, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*$favorites*/ 2 && t_value !== (t_value = /*f*/ ctx[6] + "")) set_data_dev(t, t_value);

				if (dirty & /*$favorites*/ 2 && span_title_value !== (span_title_value = /*getCodepoints*/ ctx[3](/*f*/ ctx[6]))) {
					attr_dev(span, "title", span_title_value);
				}

				if (dirty & /*value, $favorites*/ 3) {
					toggle_class(span, "selected", /*value*/ ctx[0] == /*f*/ ctx[6]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$1.name,
			type: "each",
			source: "(26:0) {#each $favorites as f}",
			ctx
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let span;

		let t0_value = (~/*$favorites*/ ctx[1].indexOf(/*value*/ ctx[0])
		? '❌'
		: '❤') + "";

		let t0;
		let t1;
		let each_1_anchor;
		let mounted;
		let dispose;
		let each_value = ensure_array_like_dev(/*$favorites*/ ctx[1]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				span = element("span");
				t0 = text(t0_value);
				t1 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
				attr_dev(span, "class", "clickable");
				attr_dev(span, "title", "Favorite 最爱");
				add_location(span, file$1, 24, 0, 599);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t0);
				insert_dev(target, t1, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);

				if (!mounted) {
					dispose = listen_dev(span, "click", /*dofavor*/ ctx[2], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*$favorites, value*/ 3 && t0_value !== (t0_value = (~/*$favorites*/ ctx[1].indexOf(/*value*/ ctx[0])
				? '❌'
				: '❤') + "")) set_data_dev(t0, t0_value);

				if (dirty & /*getCodepoints, $favorites, value*/ 11) {
					each_value = ensure_array_like_dev(/*$favorites*/ ctx[1]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
					detach_dev(t1);
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let $favorites;
		validate_store(favorites, 'favorites');
		component_subscribe($$self, favorites, $$value => $$invalidate(1, $favorites = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Favorite', slots, []);
		let { value = '' } = $$props;
		let timer = 0;

		const dofavor = () => {
			if (~$favorites.indexOf(value)) {
				set_store_value(favorites, $favorites = $favorites.filter(it => it !== value), $favorites);
			} else if (value.trim()) {
				$favorites.unshift(value);
			}

			favorites.set($favorites);
		};

		const getCodepoints = str => {
			const codepoints = splitUTF32$1(str);
			return codepoints.map(it => it.toString(16)).join(' ');
		};

		const writable_props = ['value'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Favorite> was created with unknown prop '${key}'`);
		});

		const click_handler = f => $$invalidate(0, value = f);

		$$self.$$set = $$props => {
			if ('value' in $$props) $$invalidate(0, value = $$props.value);
		};

		$$self.$capture_state = () => ({
			splitUTF32: splitUTF32$1,
			favorites,
			value,
			timer,
			dofavor,
			getCodepoints,
			$favorites
		});

		$$self.$inject_state = $$props => {
			if ('value' in $$props) $$invalidate(0, value = $$props.value);
			if ('timer' in $$props) timer = $$props.timer;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [value, $favorites, dofavor, getCodepoints, click_handler];
	}

	class Favorite extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, { value: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Favorite",
				options,
				id: create_fragment$1.name
			});
		}

		get value() {
			throw new Error("<Favorite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set value(value) {
			throw new Error("<Favorite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\app.svelte generated by Svelte v4.2.18 */
	const file = "src\\app.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[32] = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[32] = list[i];
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[37] = list[i];
		return child_ctx;
	}

	function get_each_context_3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[40] = list[i];
		child_ctx[42] = i;
		return child_ctx;
	}

	function get_each_context_4(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[43] = list[i];
		return child_ctx;
	}

	// (65:0) {#if ready}
	function create_if_block_7(ctx) {
		let span;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = "🧪";
				attr_dev(span, "class", "clickable");
				add_location(span, file, 64, 11, 1982);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);

				if (!mounted) {
					dispose = listen_dev(span, "click", /*click_handler*/ ctx[19], false, false, false, false);
					mounted = true;
				}
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_7.name,
			type: "if",
			source: "(65:0) {#if ready}",
			ctx
		});

		return block;
	}

	// (154:0) {:else}
	function create_else_block_2(ctx) {
		let img;
		let img_src_value;
		let t0;
		let br0;
		let t1;
		let br1;
		let t2;

		const block = {
			c: function create() {
				img = element("img");
				t0 = space();
				br0 = element("br");
				t1 = text("汉字拼形载入中(十秒左右)\n");
				br1 = element("br");
				t2 = text("System Loading……in 10 seconds");
				if (!src_url_equal(img.src, img_src_value = "hzpx.png")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", "招財進寶");
				add_location(img, file, 154, 0, 4897);
				add_location(br0, file, 155, 0, 4930);
				add_location(br1, file, 156, 0, 4949);
			},
			m: function mount(target, anchor) {
				insert_dev(target, img, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, br0, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, br1, anchor);
				insert_dev(target, t2, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(img);
					detach_dev(t0);
					detach_dev(br0);
					detach_dev(t1);
					detach_dev(br1);
					detach_dev(t2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_2.name,
			type: "else",
			source: "(154:0) {:else}",
			ctx
		});

		return block;
	}

	// (70:0) {#if ready}
	function create_if_block_1(ctx) {
		let input;
		let button;
		let t1;
		let br0;
		let t2;
		let current_block_type_index;
		let if_block0;
		let t3;
		let span0;
		let t5;
		let span1;
		let t7;
		let t8;
		let br1;
		let t9;
		let t10;
		let t11;
		let br2;
		let t12;
		let t13;
		let previous_key = /*value*/ ctx[0];
		let key_block_anchor;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block_6, create_else_block_1];
		const if_blocks = [];

		function select_block_type_1(ctx, dirty) {
			if (/*message*/ ctx[6]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_1(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		let if_block1 = /*showfont*/ ctx[8] && create_if_block_5(ctx);
		let each_value_3 = ensure_array_like_dev(/*svgs*/ ctx[7]);
		let each_blocks_1 = [];

		for (let i = 0; i < each_value_3.length; i += 1) {
			each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
		}

		let each_value_2 = ensure_array_like_dev(/*replacables*/ ctx[11]);
		let each_blocks = [];

		for (let i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
		}

		let if_block2 = /*value*/ ctx[0].length < 2 && create_if_block_4(ctx);
		let key_block = create_key_block(ctx);

		const block = {
			c: function create() {
				input = element("input");
				button = element("button");
				button.textContent = "📋";
				t1 = space();
				br0 = element("br");
				t2 = space();
				if_block0.c();
				t3 = space();
				span0 = element("span");
				span0.textContent = "⿻";
				t5 = space();
				span1 = element("span");
				span1.textContent = "🗚";
				t7 = space();
				if (if_block1) if_block1.c();
				t8 = space();
				br1 = element("br");
				t9 = space();

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].c();
				}

				t10 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t11 = space();
				br2 = element("br");
				t12 = space();
				if (if_block2) if_block2.c();
				t13 = space();
				key_block.c();
				key_block_anchor = empty();
				attr_dev(input, "class", "input");
				attr_dev(input, "maxlength", "25");
				attr_dev(input, "size", "14");
				attr_dev(input, "placeholder", "基字或构件");
				add_location(input, file, 70, 0, 2116);
				add_location(button, file, 70, 80, 2196);
				add_location(br0, file, 71, 0, 2236);
				attr_dev(span0, "title", "Frame 字框");
				toggle_class(span0, "selected", /*frame*/ ctx[2]);
				add_location(span0, file, 78, 0, 2418);
				attr_dev(span1, "title", "Font 字型");
				attr_dev(span1, "class", "clickable");
				toggle_class(span1, "selected", /*showfont*/ ctx[8]);
				add_location(span1, file, 80, 0, 2558);
				add_location(br1, file, 88, 0, 2928);
				add_location(br2, file, 101, 0, 3374);
			},
			m: function mount(target, anchor) {
				insert_dev(target, input, anchor);
				set_input_value(input, /*value*/ ctx[0]);
				insert_dev(target, button, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, br0, anchor);
				insert_dev(target, t2, anchor);
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, t3, anchor);
				insert_dev(target, span0, anchor);
				insert_dev(target, t5, anchor);
				insert_dev(target, span1, anchor);
				insert_dev(target, t7, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert_dev(target, t8, anchor);
				insert_dev(target, br1, anchor);
				insert_dev(target, t9, anchor);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(target, anchor);
					}
				}

				insert_dev(target, t10, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, t11, anchor);
				insert_dev(target, br2, anchor);
				insert_dev(target, t12, anchor);
				if (if_block2) if_block2.m(target, anchor);
				insert_dev(target, t13, anchor);
				key_block.m(target, anchor);
				insert_dev(target, key_block_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(input, "input", /*input_input_handler*/ ctx[20]),
						listen_dev(button, "click", /*copylink*/ ctx[18], false, false, false, false),
						listen_dev(span0, "click", /*click_handler_1*/ ctx[22], false, false, false, false),
						listen_dev(span1, "click", /*click_handler_2*/ ctx[23], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
					set_input_value(input, /*value*/ ctx[0]);
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_1(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					} else {
						if_block0.p(ctx, dirty);
					}

					transition_in(if_block0, 1);
					if_block0.m(t3.parentNode, t3);
				}

				if (!current || dirty[0] & /*frame*/ 4) {
					toggle_class(span0, "selected", /*frame*/ ctx[2]);
				}

				if (!current || dirty[0] & /*showfont*/ 256) {
					toggle_class(span1, "selected", /*showfont*/ ctx[8]);
				}

				if (/*showfont*/ ctx[8]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_5(ctx);
						if_block1.c();
						if_block1.m(t8.parentNode, t8);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (dirty[0] & /*pinxUnits, toPNG, svgs*/ 49280) {
					each_value_3 = ensure_array_like_dev(/*svgs*/ ctx[7]);
					let i;

					for (i = 0; i < each_value_3.length; i += 1) {
						const child_ctx = get_each_context_3(ctx, each_value_3, i);

						if (each_blocks_1[i]) {
							each_blocks_1[i].p(child_ctx, dirty);
						} else {
							each_blocks_1[i] = create_each_block_3(child_ctx);
							each_blocks_1[i].c();
							each_blocks_1[i].m(t10.parentNode, t10);
						}
					}

					for (; i < each_blocks_1.length; i += 1) {
						each_blocks_1[i].d(1);
					}

					each_blocks_1.length = each_value_3.length;
				}

				if (dirty[0] & /*replaceComp, replacables*/ 67584) {
					each_value_2 = ensure_array_like_dev(/*replacables*/ ctx[11]);
					let i;

					for (i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_2(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(t11.parentNode, t11);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_2.length;
				}

				if (/*value*/ ctx[0].length < 2) {
					if (if_block2) {
						if_block2.p(ctx, dirty);
					} else {
						if_block2 = create_if_block_4(ctx);
						if_block2.c();
						if_block2.m(t13.parentNode, t13);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (dirty[0] & /*value*/ 1 && safe_not_equal(previous_key, previous_key = /*value*/ ctx[0])) {
					group_outros();
					transition_out(key_block, 1, 1, noop);
					check_outros();
					key_block = create_key_block(ctx);
					key_block.c();
					transition_in(key_block, 1);
					key_block.m(key_block_anchor.parentNode, key_block_anchor);
				} else {
					key_block.p(ctx, dirty);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(key_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(key_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(input);
					detach_dev(button);
					detach_dev(t1);
					detach_dev(br0);
					detach_dev(t2);
					detach_dev(t3);
					detach_dev(span0);
					detach_dev(t5);
					detach_dev(span1);
					detach_dev(t7);
					detach_dev(t8);
					detach_dev(br1);
					detach_dev(t9);
					detach_dev(t10);
					detach_dev(t11);
					detach_dev(br2);
					detach_dev(t12);
					detach_dev(t13);
					detach_dev(key_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
				if (if_block1) if_block1.d(detaching);
				destroy_each(each_blocks_1, detaching);
				destroy_each(each_blocks, detaching);
				if (if_block2) if_block2.d(detaching);
				key_block.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(70:0) {#if ready}",
			ctx
		});

		return block;
	}

	// (66:0) {#if testbench}
	function create_if_block(ctx) {
		let testbench_1;
		let current;

		testbench_1 = new Testbench({
				props: { fontface: /*fontface*/ ctx[4] },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(testbench_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(testbench_1, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const testbench_1_changes = {};
				if (dirty[0] & /*fontface*/ 16) testbench_1_changes.fontface = /*fontface*/ ctx[4];
				testbench_1.$set(testbench_1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(testbench_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(testbench_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(testbench_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(66:0) {#if testbench}",
			ctx
		});

		return block;
	}

	// (74:0) {:else}
	function create_else_block_1(ctx) {
		let favorite;
		let updating_value;
		let current;

		function favorite_value_binding(value) {
			/*favorite_value_binding*/ ctx[21](value);
		}

		let favorite_props = {};

		if (/*value*/ ctx[0] !== void 0) {
			favorite_props.value = /*value*/ ctx[0];
		}

		favorite = new Favorite({ props: favorite_props, $$inline: true });
		binding_callbacks.push(() => bind(favorite, 'value', favorite_value_binding));

		const block = {
			c: function create() {
				create_component(favorite.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(favorite, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const favorite_changes = {};

				if (!updating_value && dirty[0] & /*value*/ 1) {
					updating_value = true;
					favorite_changes.value = /*value*/ ctx[0];
					add_flush_callback(() => updating_value = false);
				}

				favorite.$set(favorite_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(favorite.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(favorite.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(favorite, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1.name,
			type: "else",
			source: "(74:0) {:else}",
			ctx
		});

		return block;
	}

	// (73:0) {#if message}
	function create_if_block_6(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text(/*message*/ ctx[6]);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*message*/ 64) set_data_dev(t, /*message*/ ctx[6]);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_6.name,
			type: "if",
			source: "(73:0) {#if message}",
			ctx
		});

		return block;
	}

	// (82:0) {#if showfont}
	function create_if_block_5(ctx) {
		let each_1_anchor;
		let each_value_4 = ensure_array_like_dev(/*fontfaces*/ ctx[12]);
		let each_blocks = [];

		for (let i = 0; i < each_value_4.length; i += 1) {
			each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*fontfaces, fontface*/ 4112) {
					each_value_4 = ensure_array_like_dev(/*fontfaces*/ ctx[12]);
					let i;

					for (i = 0; i < each_value_4.length; i += 1) {
						const child_ctx = get_each_context_4(ctx, each_value_4, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_4(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_4.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_5.name,
			type: "if",
			source: "(82:0) {#if showfont}",
			ctx
		});

		return block;
	}

	// (83:0) {#each fontfaces as ff}
	function create_each_block_4(ctx) {
		let span;
		let t0_value = /*ff*/ ctx[43] + "";
		let t0;
		let t1;
		let mounted;
		let dispose;

		function click_handler_3() {
			return /*click_handler_3*/ ctx[24](/*ff*/ ctx[43]);
		}

		const block = {
			c: function create() {
				span = element("span");
				t0 = text(t0_value);
				t1 = space();
				attr_dev(span, "class", "clickable");
				toggle_class(span, "selected", /*ff*/ ctx[43] == /*fontface*/ ctx[4]);
				add_location(span, file, 85, 0, 2821);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t0);
				append_dev(span, t1);

				if (!mounted) {
					dispose = listen_dev(span, "click", click_handler_3, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty[0] & /*fontfaces*/ 4096 && t0_value !== (t0_value = /*ff*/ ctx[43] + "")) set_data_dev(t0, t0_value);

				if (dirty[0] & /*fontfaces, fontface*/ 4112) {
					toggle_class(span, "selected", /*ff*/ ctx[43] == /*fontface*/ ctx[4]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_4.name,
			type: "each",
			source: "(83:0) {#each fontfaces as ff}",
			ctx
		});

		return block;
	}

	// (90:0) {#each svgs as svg,idx}
	function create_each_block_3(ctx) {
		let span;
		let raw_value = /*svg*/ ctx[40] + "";
		let span_title_value;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				span = element("span");
				attr_dev(span, "title", span_title_value = /*pinxUnits*/ ctx[14][/*idx*/ ctx[42]]);
				add_location(span, file, 93, 0, 3075);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				span.innerHTML = raw_value;

				if (!mounted) {
					dispose = listen_dev(span, "click", /*toPNG*/ ctx[15], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*svgs*/ 128 && raw_value !== (raw_value = /*svg*/ ctx[40] + "")) span.innerHTML = raw_value;
				if (dirty[0] & /*pinxUnits*/ 16384 && span_title_value !== (span_title_value = /*pinxUnits*/ ctx[14][/*idx*/ ctx[42]])) {
					attr_dev(span, "title", span_title_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_3.name,
			type: "each",
			source: "(90:0) {#each svgs as svg,idx}",
			ctx
		});

		return block;
	}

	// (96:0) {#each replacables as comp}
	function create_each_block_2(ctx) {
		let span;
		let t_value = /*comp*/ ctx[37] + "";
		let t;
		let mounted;
		let dispose;

		function click_handler_4() {
			return /*click_handler_4*/ ctx[25](/*comp*/ ctx[37]);
		}

		const block = {
			c: function create() {
				span = element("span");
				t = text(t_value);
				attr_dev(span, "class", "replacecomp");
				add_location(span, file, 99, 0, 3293);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);

				if (!mounted) {
					dispose = listen_dev(span, "click", click_handler_4, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty[0] & /*replacables*/ 2048 && t_value !== (t_value = /*comp*/ ctx[37] + "")) set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_2.name,
			type: "each",
			source: "(96:0) {#each replacables as comp}",
			ctx
		});

		return block;
	}

	// (106:0) {#if value.length<2}
	function create_if_block_4(ctx) {
		let span;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = "👪";
				attr_dev(span, "title", "Members and Derived 成员及孳乳");
				toggle_class(span, "selected", /*showinfo*/ ctx[3]);
				add_location(span, file, 106, 0, 3518);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);

				if (!mounted) {
					dispose = listen_dev(span, "click", /*click_handler_5*/ ctx[26], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*showinfo*/ 8) {
					toggle_class(span, "selected", /*showinfo*/ ctx[3]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_4.name,
			type: "if",
			source: "(106:0) {#if value.length<2}",
			ctx
		});

		return block;
	}

	// (121:0) {:else}
	function create_else_block(ctx) {
		let a;
		let t1;
		let if_block_anchor;
		let mounted;
		let dispose;
		let if_block = /*showhelp*/ ctx[5] && create_if_block_3(ctx);

		const block = {
			c: function create() {
				a = element("a");
				a.textContent = "❓";
				t1 = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				add_location(a, file, 123, 0, 3951);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				insert_dev(target, t1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);

				if (!mounted) {
					dispose = listen_dev(a, "click", /*click_handler_6*/ ctx[28], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*showhelp*/ ctx[5]) {
					if (if_block) ; else {
						if_block = create_if_block_3(ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
					detach_dev(t1);
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(121:0) {:else}",
			ctx
		});

		return block;
	}

	// (110:0) {#if showinfo}
	function create_if_block_2(ctx) {
		let t0;
		let t1;
		let current;
		let each_value_1 = ensure_array_like_dev(/*derives*/ ctx[10]);
		let each_blocks_1 = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
			each_blocks_1[i] = null;
		});

		let each_value = ensure_array_like_dev(/*components*/ ctx[13]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].c();
				}

				t0 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t1 = text("\n\n\n寶缶充\n𡖟它并");
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks_1.length; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(target, anchor);
					}
				}

				insert_dev(target, t0, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, t1, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*derives, fontface, setBase*/ 132112) {
					each_value_1 = ensure_array_like_dev(/*derives*/ ctx[10]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks_1[i]) {
							each_blocks_1[i].p(child_ctx, dirty);
							transition_in(each_blocks_1[i], 1);
						} else {
							each_blocks_1[i] = create_each_block_1(child_ctx);
							each_blocks_1[i].c();
							transition_in(each_blocks_1[i], 1);
							each_blocks_1[i].m(t0.parentNode, t0);
						}
					}

					group_outros();

					for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				if (dirty[0] & /*components, fontface*/ 8208) {
					each_value = ensure_array_like_dev(/*components*/ ctx[13]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(t1.parentNode, t1);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out_1(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value_1.length; i += 1) {
					transition_in(each_blocks_1[i]);
				}

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks_1 = each_blocks_1.filter(Boolean);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					transition_out(each_blocks_1[i]);
				}

				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t0);
					detach_dev(t1);
				}

				destroy_each(each_blocks_1, detaching);
				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(110:0) {#if showinfo}",
			ctx
		});

		return block;
	}

	// (125:0) {#if showhelp}
	function create_if_block_3(ctx) {
		let h30;
		let t1;
		let br0;
		let t2;
		let br1;
		let t3;
		let br2;
		let t4;
		let br3;
		let t5;
		let h31;
		let t7;
		let br4;
		let t8;
		let br5;
		let t9;
		let br6;
		let t10;
		let br7;
		let t11;
		let h32;
		let t13;
		let br8;
		let t14;
		let br9;
		let t15;
		let br10;
		let t16;
		let h33;
		let t18;
		let br11;
		let t19;
		let br12;
		let t20;
		let br13;
		let t21;
		let br14;
		let t22;
		let br15;
		let t23;

		const block = {
			c: function create() {
				h30 = element("h3");
				h30.textContent = "画面说明";
				t1 = text("\n1行：字表, 输入区 (单字视为构件) 📋复制网址\n");
				br0 = element("br");
				t2 = text("2行：❤加入/❌删除最爱 , 库存拼形式 , ⿻显示字框 , 🗚选择字体\n");
				br1 = element("br");
				t3 = text("3行：大字形(点一下存为PNG) 替代构件清单\n");
				br2 = element("br");
				t4 = text("4行：👪字族\n");
				br3 = element("br");
				t5 = text("5行：孳乳\n\n");
				h31 = element("h3");
				h31.textContent = "使用说明";
				t7 = text("\n基字：做为构建字形的基础字。构件：构成字形的元素。\n");
				br4 = element("br");
				t8 = text("拼形式：拼出一个字形的式子。语法是：\"基字/构件/替字\" ，替字也可以是拼形式。\n");
				br5 = element("br");
				t9 = text("输入一个单字，按字族，可得此字之孳乳，点一下将之作为基字。\n");
				br6 = element("br");
				t10 = text("选定基字之後，按一下要替换的构件，再输入替字。\n");
				br7 = element("br");
				t11 = text("字形网址复制后，到Office 365 或 Google SpreadSheet 以 =IMAGE(字形网址) 调用。\n");
				h32 = element("h3");
				h32.textContent = "技术说明";
				t13 = text("\n不依赖服务端，纯html+js 软件。智能识別拼形式和一般字。\n");
				br8 = element("br");
				t14 = text("本字库可生成包括Unicode A-G 的所有字形。\n");
				br9 = element("br");
				t15 = text("「汉字拼形」授权方式为ISC（可做商业用途），但目前基於以下两个GPL授权（可做商业用途但必须开源）之模块。\n");
				br10 = element("br");
				t16 = text("A. Glyphwiki.org 数据库   B. Kage(荫) 矢量笔划产生器 \n");
				h33 = element("h3");
				h33.textContent = "已知问题";
				t18 = text("\n1.由於Glyphwiki造字时并没有考虑字形生成的需求，很多字的字框无法做基字，如「街圭舞」效果不理想。\n");
				br11 = element("br");
				t19 = text("2.为求字形美观，Glyphwiki 将部件拆散为笔划，这样的字无法做为基字。\n");
				br12 = element("br");
				t20 = text("3.glyphwiki是日本风格的字形库，某些细节不符合中国国家标准。\n");
				br13 = element("br");
				t21 = text("4.在稍微牺牲美观的条件下，许多字可替换成拼形式，每字可节约40B左右，理论上全CJK字库可以压缩到2.5MB~3MB，相於16x16点阵字模。\n");
				br14 = element("br");
				t22 = text("5.首次使用孳乳会花几秒钟产生反向索引。由於索引只在内存，网页重载之后必须重建。\n");
				br15 = element("br");
				t23 = text("微信： Sukhanika ,  Gmail : yapcheahshen");
				add_location(h30, file, 125, 0, 4010);
				add_location(br0, file, 127, 0, 4051);
				add_location(br1, file, 128, 0, 4094);
				add_location(br2, file, 129, 0, 4123);
				add_location(br3, file, 130, 0, 4136);
				add_location(h31, file, 132, 0, 4148);
				add_location(br4, file, 134, 0, 4188);
				add_location(br5, file, 135, 0, 4234);
				add_location(br6, file, 136, 0, 4269);
				add_location(br7, file, 137, 0, 4298);
				add_location(h32, file, 138, 0, 4363);
				add_location(br8, file, 140, 0, 4409);
				add_location(br9, file, 141, 0, 4441);
				add_location(br10, file, 142, 0, 4501);
				add_location(h33, file, 143, 0, 4549);
				add_location(br11, file, 145, 0, 4617);
				add_location(br12, file, 146, 0, 4662);
				add_location(br13, file, 147, 0, 4703);
				add_location(br14, file, 148, 0, 4781);
				add_location(br15, file, 149, 0, 4827);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h30, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, br0, anchor);
				insert_dev(target, t2, anchor);
				insert_dev(target, br1, anchor);
				insert_dev(target, t3, anchor);
				insert_dev(target, br2, anchor);
				insert_dev(target, t4, anchor);
				insert_dev(target, br3, anchor);
				insert_dev(target, t5, anchor);
				insert_dev(target, h31, anchor);
				insert_dev(target, t7, anchor);
				insert_dev(target, br4, anchor);
				insert_dev(target, t8, anchor);
				insert_dev(target, br5, anchor);
				insert_dev(target, t9, anchor);
				insert_dev(target, br6, anchor);
				insert_dev(target, t10, anchor);
				insert_dev(target, br7, anchor);
				insert_dev(target, t11, anchor);
				insert_dev(target, h32, anchor);
				insert_dev(target, t13, anchor);
				insert_dev(target, br8, anchor);
				insert_dev(target, t14, anchor);
				insert_dev(target, br9, anchor);
				insert_dev(target, t15, anchor);
				insert_dev(target, br10, anchor);
				insert_dev(target, t16, anchor);
				insert_dev(target, h33, anchor);
				insert_dev(target, t18, anchor);
				insert_dev(target, br11, anchor);
				insert_dev(target, t19, anchor);
				insert_dev(target, br12, anchor);
				insert_dev(target, t20, anchor);
				insert_dev(target, br13, anchor);
				insert_dev(target, t21, anchor);
				insert_dev(target, br14, anchor);
				insert_dev(target, t22, anchor);
				insert_dev(target, br15, anchor);
				insert_dev(target, t23, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h30);
					detach_dev(t1);
					detach_dev(br0);
					detach_dev(t2);
					detach_dev(br1);
					detach_dev(t3);
					detach_dev(br2);
					detach_dev(t4);
					detach_dev(br3);
					detach_dev(t5);
					detach_dev(h31);
					detach_dev(t7);
					detach_dev(br4);
					detach_dev(t8);
					detach_dev(br5);
					detach_dev(t9);
					detach_dev(br6);
					detach_dev(t10);
					detach_dev(br7);
					detach_dev(t11);
					detach_dev(h32);
					detach_dev(t13);
					detach_dev(br8);
					detach_dev(t14);
					detach_dev(br9);
					detach_dev(t15);
					detach_dev(br10);
					detach_dev(t16);
					detach_dev(h33);
					detach_dev(t18);
					detach_dev(br11);
					detach_dev(t19);
					detach_dev(br12);
					detach_dev(t20);
					detach_dev(br13);
					detach_dev(t21);
					detach_dev(br14);
					detach_dev(t22);
					detach_dev(br15);
					detach_dev(t23);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(125:0) {#if showhelp}",
			ctx
		});

		return block;
	}

	// (111:0) {#each derives as gid}
	function create_each_block_1(ctx) {
		let glyph;
		let current;

		function func() {
			return /*func*/ ctx[27](/*gid*/ ctx[32]);
		}

		glyph = new Glyph({
				props: {
					gid: /*gid*/ ctx[32],
					fontface: /*fontface*/ ctx[4],
					onclick: func
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(glyph.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(glyph, target, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				const glyph_changes = {};
				if (dirty[0] & /*derives*/ 1024) glyph_changes.gid = /*gid*/ ctx[32];
				if (dirty[0] & /*fontface*/ 16) glyph_changes.fontface = /*fontface*/ ctx[4];
				if (dirty[0] & /*derives*/ 1024) glyph_changes.onclick = func;
				glyph.$set(glyph_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(glyph.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(glyph.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(glyph, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(111:0) {#each derives as gid}",
			ctx
		});

		return block;
	}

	// (114:0) {#each components as gid}
	function create_each_block(ctx) {
		let br;
		let glyph;
		let current;

		glyph = new Glyph({
				props: {
					gid: /*gid*/ ctx[32],
					derivable: true,
					fontface: /*fontface*/ ctx[4]
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				br = element("br");
				create_component(glyph.$$.fragment);
				add_location(br, file, 114, 0, 3772);
			},
			m: function mount(target, anchor) {
				insert_dev(target, br, anchor);
				mount_component(glyph, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const glyph_changes = {};
				if (dirty[0] & /*components*/ 8192) glyph_changes.gid = /*gid*/ ctx[32];
				if (dirty[0] & /*fontface*/ 16) glyph_changes.fontface = /*fontface*/ ctx[4];
				glyph.$set(glyph_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(glyph.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(glyph.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(br);
				}

				destroy_component(glyph, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(114:0) {#each components as gid}",
			ctx
		});

		return block;
	}

	// (109:0) {#key value}
	function create_key_block(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block_2, create_else_block];
		const if_blocks = [];

		function select_block_type_2(ctx, dirty) {
			if (/*showinfo*/ ctx[3]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_2(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_2(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_key_block.name,
			type: "key",
			source: "(109:0) {#key value}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let div;
		let t;
		let current_block_type_index;
		let if_block1;
		let current;
		let if_block0 = /*ready*/ ctx[1] && create_if_block_7(ctx);
		const if_block_creators = [create_if_block, create_if_block_1, create_else_block_2];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*testbench*/ ctx[9]) return 0;
			if (/*ready*/ ctx[1]) return 1;
			return 2;
		}

		current_block_type_index = select_block_type(ctx);
		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (if_block0) if_block0.c();
				t = space();
				if_block1.c();
				attr_dev(div, "class", "container");
				add_location(div, file, 62, 0, 1890);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append_dev(div, t);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (/*ready*/ ctx[1]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_7(ctx);
						if_block0.c();
						if_block0.m(div, t);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block1 = if_blocks[current_block_type_index];

					if (!if_block1) {
						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block1.c();
					} else {
						if_block1.p(ctx, dirty);
					}

					transition_in(if_block1, 1);
					if_block1.m(div, null);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block1);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block1);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (if_block0) if_block0.d();
				if_blocks[current_block_type_index].d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let pinxUnits;
		let components;
		let fontfaces;
		let replacables;
		let derives;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		Window.Hzpx = Hzpx;
		let value = ''; //𠀁';//邏羅寶貝𩀨從䞃致招'//' //𠈐曳國// //汉字拼形
		let ready = false;
		let showhelp = false;
		let message = '';

		// document.title="汉字拼形-库存字形"+glyphWikiCount();
		let timer;

		onMount(async () => {
			timer = setInterval(
				function () {
					if (isDataReady()) {
						setTimeout(
							function () {
								$$invalidate(0, value = '邏羅寶貝𩀨從䞃致招');
								$$invalidate(1, ready = true);
							},
							2000
						); //wait for data ready

						clearInterval(timer);
					}
				},
				1000
			);
		});

		let svgs = [],
			frame = false,
			showfont = false,
			showinfo = false,
			size = 200,
			fontface = '宋体';

		let testbench = false;
		const toPNG = e => downloadSvg(e.target, value + ".png", size);

		const focusInput = () => {
			const input = document.querySelector('.input');
			input.focus();
			input.selLength = value.length;
		};

		const replaceComp = comp => {
			$$invalidate(0, value += comp + '卍');
			focusInput();
		};

		const setBase = gid => $$invalidate(0, value = gid2ch(gid));

		//why 寶缶匋 cannot ?
		//bug 盟月夕 cannot replace moon
		/* to fix
	//瑇 u248e9 wrong 
	*/
		const copylink = () => {
			const url = "https://nissaya.cn/hzpx?g=" + value;
			navigator.clipboard.writeText(url);
			$$invalidate(6, message = '字形网址已复制到剪贴薄');

			setTimeout(
				() => {
					$$invalidate(6, message = '');
				},
				2000
			);
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
		});

		const click_handler = () => $$invalidate(9, testbench = !testbench);

		function input_input_handler() {
			value = this.value;
			$$invalidate(0, value);
		}

		function favorite_value_binding(value$1) {
			value = value$1;
			$$invalidate(0, value);
		}

		const click_handler_1 = () => $$invalidate(2, frame = !frame);
		const click_handler_2 = () => $$invalidate(8, showfont = !showfont);
		const click_handler_3 = ff => $$invalidate(4, fontface = ff);
		const click_handler_4 = comp => replaceComp(comp);
		const click_handler_5 = () => $$invalidate(3, showinfo = !showinfo);
		const func = gid => setBase(gid);
		const click_handler_6 = () => $$invalidate(5, showhelp = !showhelp);

		$$self.$capture_state = () => ({
			onMount,
			codePointLength: codePointLength$1,
			Hzpx,
			splitPinx,
			drawPinx,
			derivedOf,
			enumFontFace,
			getLastComps,
			gid2ch,
			isDataReady,
			Glyph,
			TestBench: Testbench,
			downloadSvg,
			Favorite,
			value,
			ready,
			showhelp,
			message,
			timer,
			svgs,
			frame,
			showfont,
			showinfo,
			size,
			fontface,
			testbench,
			toPNG,
			focusInput,
			replaceComp,
			setBase,
			copylink,
			derives,
			replacables,
			fontfaces,
			components,
			pinxUnits
		});

		$$self.$inject_state = $$props => {
			if ('value' in $$props) $$invalidate(0, value = $$props.value);
			if ('ready' in $$props) $$invalidate(1, ready = $$props.ready);
			if ('showhelp' in $$props) $$invalidate(5, showhelp = $$props.showhelp);
			if ('message' in $$props) $$invalidate(6, message = $$props.message);
			if ('timer' in $$props) timer = $$props.timer;
			if ('svgs' in $$props) $$invalidate(7, svgs = $$props.svgs);
			if ('frame' in $$props) $$invalidate(2, frame = $$props.frame);
			if ('showfont' in $$props) $$invalidate(8, showfont = $$props.showfont);
			if ('showinfo' in $$props) $$invalidate(3, showinfo = $$props.showinfo);
			if ('size' in $$props) $$invalidate(30, size = $$props.size);
			if ('fontface' in $$props) $$invalidate(4, fontface = $$props.fontface);
			if ('testbench' in $$props) $$invalidate(9, testbench = $$props.testbench);
			if ('derives' in $$props) $$invalidate(10, derives = $$props.derives);
			if ('replacables' in $$props) $$invalidate(11, replacables = $$props.replacables);
			if ('fontfaces' in $$props) $$invalidate(12, fontfaces = $$props.fontfaces);
			if ('components' in $$props) $$invalidate(13, components = $$props.components);
			if ('pinxUnits' in $$props) $$invalidate(14, pinxUnits = $$props.pinxUnits);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*ready, value, fontface, frame*/ 23) {
				$$invalidate(7, svgs = ready ? drawPinx(value, { size, fontface, frame }) : []); //allow mix normal char and pinxing expression
			}

			if ($$self.$$.dirty[0] & /*value*/ 1) {
				$$invalidate(14, pinxUnits = splitPinx(value, true));
			}

			if ($$self.$$.dirty[0] & /*value*/ 1) {
				$$invalidate(11, replacables = getLastComps(value));
			}

			if ($$self.$$.dirty[0] & /*showinfo, value*/ 9) {
				$$invalidate(10, derives = showinfo && codePointLength$1(value) == 1 && derivedOf(value, 200) || []);
			}
		};

		$$invalidate(13, components = []); //getRenderComps(value)||[];
		$$invalidate(12, fontfaces = enumFontFace());

		return [
			value,
			ready,
			frame,
			showinfo,
			fontface,
			showhelp,
			message,
			svgs,
			showfont,
			testbench,
			derives,
			replacables,
			fontfaces,
			components,
			pinxUnits,
			toPNG,
			replaceComp,
			setBase,
			copylink,
			click_handler,
			input_input_handler,
			favorite_value_binding,
			click_handler_1,
			click_handler_2,
			click_handler_3,
			click_handler_4,
			click_handler_5,
			func,
			click_handler_6
		];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	var app = new App({
		target: document.body
	});

	return app;

})();
//# sourceMappingURL=index.js.map