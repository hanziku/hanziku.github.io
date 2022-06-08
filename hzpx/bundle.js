
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
        flushing = false;
        seen_callbacks.clear();
    }
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
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
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
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const alphabetically=(a,b)=>a>b?1: ((a<b)?-1:0);
    const unique=(arr,sorted=false)=>{
        if (!arr||!arr.length)return [];
        if(!sorted) arr.sort(alphabetically);
        let prev,out=[];
        for (let i=0;i<arr.length;i++) {
            if (arr[i]!==prev) out.push(arr[i]);
            prev=arr[i];
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
    const unpack1=str=>{
    	const arr=[];
    	let i1;
    	const count=Math.floor(str.length);
    	for (let i=0;i<count;i++) {
    		i1=str.charCodeAt(i*3) -CodeStart;
    		arr.push( i1 );
    	}
    	return new Int32Array(arr);
    };
    const unpack=(s,delta=false)=>{
    	let arr;
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
    		if (arr) {
    			arr[c]= o + (delta?prev:0);
    			prev=arr[c];
    			c++;
    		} else {
    			arr=new Int32Array(o); //Uint32Array might convert to double
    		}
    		i++;
    	}
    	return arr;
    };

    const splitUTF32=str=>{
        if (!str)return [];
        let i=0;
        const out=[];
        while (i<str.length) {
            const code=str.codePointAt(i);
            out.push(code);
            i++;
            if (code>0xffff) i++;
        }
        return out;
    };
    const splitUTF32Char=str=>splitUTF32(str).map( cp=>String.fromCodePoint(cp));

    const codePointLength=text=>{
        var result = text.match(/[\s\S]/gu);
        return result ? result.length : 0;
    };

    const sameLeadingByte=(t,prev)=>{
      let m=0;
      for (let i=0;i<t.length&&i<prev.length;i++) {
          if (t[i]==prev[i]) m++;
          else break;
      }
      return m;
    };

    const findn= (arr, obj, near,n) =>{
      let low = 0, high = arr.length-1, mid;
      while (low < high) {
        mid = (low + high) >> 1;
        if (arr[mid][n] === obj)  {
          while (mid>-1 && arr[mid-1] &&arr[mid-1][n]===obj ) mid--; //值重覆的元素，回逆到第一個
          return mid;
        }
        (arr[mid][n] < obj) ? low = mid + 1 : high = mid;
      }

      if (near) {
        if (typeof obj=='string'){
          let same=sameLeadingByte( arr[low][n], obj);
          let newsame=low?sameLeadingByte( arr[low-1][n], obj):0;
          while (low>0&&newsame>=same) {
            if (low>0) newsame=sameLeadingByte( arr[low-1][n], obj); else break;
            if (newsame>=same) {
              same=newsame;low--; 
            } else break;
          }  
        }
        return low;
      }

      else if (arr[low][n] === obj) return low;
      else return -1;
    };
    const find = (arr, obj, near,n=-1) =>{
      if (!arr||arr.length<1)return -1;
      if (n>-1) return findn(arr,obj,near,n);

      let low = 0, high = arr.length-1, mid;
      while (low < high) {
        mid = (low + high) >> 1;
        if (arr[mid] === obj)  {
          while (mid>-1 &&arr[mid-1]===obj ) mid--; //值重覆的元素，回逆到第一個
          return mid;
        }
        (arr[mid] < obj) ? low = mid + 1 : high = mid;
      }

      if (near) {
        if (typeof obj=='string'){
          let same=sameLeadingByte( arr[low], obj);
          let newsame=low?sameLeadingByte( arr[low-1], obj):0;
          while (low>0&&newsame>=same) {
            if (low>0) newsame=sameLeadingByte( arr[low-1], obj); else break;
            if (newsame>=same) {
              same=newsame;low--; 
            } else break;
          }  
        }
        return low;
      }

      else if (arr[low] === obj) return low;
      else return -1;
    };



    const find_getter =  (getter, obj, near) =>{ 
      const len=getter();
      let low = 0,high = len;
      while (low < high) {
        var mid = (low + high) >> 1;
        if (getter(mid)===obj) {
          while (mid>-1 &&getter(mid-1)===obj ) mid--; //值重覆的元素，回逆到第一個
          return mid<len?mid:len-1;
        }
        getter(mid)<obj ? low=mid+1 : high=mid;
      }
      if (near) return low<len?low:len-1;
      else if (getter(low)===obj) return low;else return -1;
    };

    const bsearch=(array,value,near, n=-1)=> { //n>-1 , array second level  item index
    	const func=(typeof array=="function")?find_getter:find;
    	return func(array,value,near,n);
    };

    const CJKRanges={
        'BMP': [0x4e00,0x9fa5],
        'ExtA':[0x3400,0x4dff],
        'ExtB':[0x20000,0x2A6FF],
        'ExtC':[0x2A700,0x2B73F],
        'ExtD':[0x2B740,0x2B81F],
        'ExtE':[0x2B820,0x2CEAF],
        'ExtF':[0x2CEB0,0x2EBE0]
    };
    const enumCJKRangeNames=()=>Object.keys(CJKRanges);

    const getCJKRange=name=>CJKRanges[name]||[0,0];

    const CJKRangeName=s=>{//return cjk range name by a char or unicode number value or a base 16 string
        let cp=s;
        if (typeof s==='string') {
            const code=parseInt(s,16);
            if (!isNaN(code)) {
                cp=code;
            } else {
                cp=s.codePointAt(0);
            }
        }
        for (let rangename in CJKRanges) {
            const [from,to]=CJKRanges[rangename];
            if (cp>=from && cp<=to) return rangename;
        }
    };
    const string2codePoint=(str, snap)=>{
        if (!str) return 0;
        const cp=str.codePointAt(0);
        let n;
        if (cp>=0x3400 && cp<0x2ffff) {
            n=cp; 
        } else {
            n=(parseInt(str,16)||0x4e00);
        }
        return snap? n&0x3ff80 : n;
    };

    function Diff() {}
    Diff.prototype = {
      diff: function diff(oldString, newString) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var callback = options.callback;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        }

        this.options = options;
        var self = this;

        function done(value) {
          if (callback) {
            setTimeout(function () {
              callback(undefined, value);
            }, 0);
            return true;
          } else {
            return value;
          }
        } // Allow subclasses to massage the input prior to running


        oldString = this.castInput(oldString);
        newString = this.castInput(newString);
        oldString = this.removeEmpty(this.tokenize(oldString));
        newString = this.removeEmpty(this.tokenize(newString));
        var newLen = newString.length,
            oldLen = oldString.length;
        var editLength = 1;
        var maxEditLength = newLen + oldLen;
        var bestPath = [{
          newPos: -1,
          components: []
        }]; // Seed editLength = 0, i.e. the content starts with the same values

        var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);

        if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
          // Identity per the equality and tokenizer
          return done([{
            value: this.join(newString),
            count: newString.length
          }]);
        } // Main worker method. checks all permutations of a given edit length for acceptance.


        function execEditLength() {
          for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
            var basePath = void 0;

            var addPath = bestPath[diagonalPath - 1],
                removePath = bestPath[diagonalPath + 1],
                _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;

            if (addPath) {
              // No one else is going to attempt to use this value, clear it
              bestPath[diagonalPath - 1] = undefined;
            }

            var canAdd = addPath && addPath.newPos + 1 < newLen,
                canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;

            if (!canAdd && !canRemove) {
              // If this path is a terminal then prune
              bestPath[diagonalPath] = undefined;
              continue;
            } // Select the diagonal that we want to branch from. We select the prior
            // path whose position in the new string is the farthest from the origin
            // and does not pass the bounds of the diff graph


            if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
              basePath = clonePath(removePath);
              self.pushComponent(basePath.components, undefined, true);
            } else {
              basePath = addPath; // No need to clone, we've pulled it from the list

              basePath.newPos++;
              self.pushComponent(basePath.components, true, undefined);
            }

            _oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath); // If we have hit the end of both strings, then we are done

            if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
              return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
            } else {
              // Otherwise track this path as a potential candidate and continue.
              bestPath[diagonalPath] = basePath;
            }
          }

          editLength++;
        } // Performs the length of edit iteration. Is a bit fugly as this has to support the
        // sync and async mode which is never fun. Loops over execEditLength until a value
        // is produced.


        if (callback) {
          (function exec() {
            setTimeout(function () {
              // This should not happen, but we want to be safe.

              /* istanbul ignore next */
              if (editLength > maxEditLength) {
                return callback();
              }

              if (!execEditLength()) {
                exec();
              }
            }, 0);
          })();
        } else {
          while (editLength <= maxEditLength) {
            var ret = execEditLength();

            if (ret) {
              return ret;
            }
          }
        }
      },
      pushComponent: function pushComponent(components, added, removed) {
        var last = components[components.length - 1];

        if (last && last.added === added && last.removed === removed) {
          // We need to clone here as the component clone operation is just
          // as shallow array clone
          components[components.length - 1] = {
            count: last.count + 1,
            added: added,
            removed: removed
          };
        } else {
          components.push({
            count: 1,
            added: added,
            removed: removed
          });
        }
      },
      extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
        var newLen = newString.length,
            oldLen = oldString.length,
            newPos = basePath.newPos,
            oldPos = newPos - diagonalPath,
            commonCount = 0;

        while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
          newPos++;
          oldPos++;
          commonCount++;
        }

        if (commonCount) {
          basePath.components.push({
            count: commonCount
          });
        }

        basePath.newPos = newPos;
        return oldPos;
      },
      equals: function equals(left, right) {
        if (this.options.comparator) {
          return this.options.comparator(left, right);
        } else {
          return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
        }
      },
      removeEmpty: function removeEmpty(array) {
        var ret = [];

        for (var i = 0; i < array.length; i++) {
          if (array[i]) {
            ret.push(array[i]);
          }
        }

        return ret;
      },
      castInput: function castInput(value) {
        return value;
      },
      tokenize: function tokenize(value) {
        return value.split('');
      },
      join: function join(chars) {
        return chars.join('');
      }
    };

    function buildValues(diff, components, newString, oldString, useLongestToken) {
      var componentPos = 0,
          componentLen = components.length,
          newPos = 0,
          oldPos = 0;

      for (; componentPos < componentLen; componentPos++) {
        var component = components[componentPos];

        if (!component.removed) {
          if (!component.added && useLongestToken) {
            var value = newString.slice(newPos, newPos + component.count);
            value = value.map(function (value, i) {
              var oldValue = oldString[oldPos + i];
              return oldValue.length > value.length ? oldValue : value;
            });
            component.value = diff.join(value);
          } else {
            component.value = diff.join(newString.slice(newPos, newPos + component.count));
          }

          newPos += component.count; // Common case

          if (!component.added) {
            oldPos += component.count;
          }
        } else {
          component.value = diff.join(oldString.slice(oldPos, oldPos + component.count));
          oldPos += component.count; // Reverse add and remove so removes are output first to match common convention
          // The diffing algorithm is tied to add then remove output and this is the simplest
          // route to get the desired output with minimal overhead.

          if (componentPos && components[componentPos - 1].added) {
            var tmp = components[componentPos - 1];
            components[componentPos - 1] = components[componentPos];
            components[componentPos] = tmp;
          }
        }
      } // Special case handle for when one terminal is ignored (i.e. whitespace).
      // For this case we merge the terminal into the prior string and drop the change.
      // This is only available for string mode.


      var lastComponent = components[componentLen - 1];

      if (componentLen > 1 && typeof lastComponent.value === 'string' && (lastComponent.added || lastComponent.removed) && diff.equals('', lastComponent.value)) {
        components[componentLen - 2].value += lastComponent.value;
        components.pop();
      }

      return components;
    }

    function clonePath(path) {
      return {
        newPos: path.newPos,
        components: path.components.slice(0)
      };
    }

    //
    // Ranges and exceptions:
    // Latin-1 Supplement, 0080–00FF
    //  - U+00D7  × Multiplication sign
    //  - U+00F7  ÷ Division sign
    // Latin Extended-A, 0100–017F
    // Latin Extended-B, 0180–024F
    // IPA Extensions, 0250–02AF
    // Spacing Modifier Letters, 02B0–02FF
    //  - U+02C7  ˇ &#711;  Caron
    //  - U+02D8  ˘ &#728;  Breve
    //  - U+02D9  ˙ &#729;  Dot Above
    //  - U+02DA  ˚ &#730;  Ring Above
    //  - U+02DB  ˛ &#731;  Ogonek
    //  - U+02DC  ˜ &#732;  Small Tilde
    //  - U+02DD  ˝ &#733;  Double Acute Accent
    // Latin Extended Additional, 1E00–1EFF

    var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
    var reWhitespace = /\S/;
    var wordDiff = new Diff();

    wordDiff.equals = function (left, right) {
      if (this.options.ignoreCase) {
        left = left.toLowerCase();
        right = right.toLowerCase();
      }

      return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
    };

    wordDiff.tokenize = function (value) {
      // All whitespace symbols except newline group into one token, each newline - in separate token
      var tokens = value.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/); // Join the boundary splits that we do not consider to be boundaries. This is primarily the extended Latin character set.

      for (var i = 0; i < tokens.length - 1; i++) {
        // If we have an empty string in the next field and we have only word chars before and after, merge
        if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
          tokens[i] += tokens[i + 2];
          tokens.splice(i + 1, 2);
          i--;
        }
      }

      return tokens;
    };

    var lineDiff = new Diff();

    lineDiff.tokenize = function (value) {
      var retLines = [],
          linesAndNewlines = value.split(/(\n|\r\n)/); // Ignore the final empty token that occurs if the string ends with a new line

      if (!linesAndNewlines[linesAndNewlines.length - 1]) {
        linesAndNewlines.pop();
      } // Merge the content and line separators into single tokens


      for (var i = 0; i < linesAndNewlines.length; i++) {
        var line = linesAndNewlines[i];

        if (i % 2 && !this.options.newlineIsToken) {
          retLines[retLines.length - 1] += line;
        } else {
          if (this.options.ignoreWhitespace) {
            line = line.trim();
          }

          retLines.push(line);
        }
      }

      return retLines;
    };

    var sentenceDiff = new Diff();

    sentenceDiff.tokenize = function (value) {
      return value.split(/(\S.+?[.!?])(?=\s+|$)/);
    };

    var cssDiff = new Diff();

    cssDiff.tokenize = function (value) {
      return value.split(/([{}:;,]|\s+)/);
    };

    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    var objectPrototypeToString = Object.prototype.toString;
    var jsonDiff = new Diff(); // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
    // dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:

    jsonDiff.useLongestToken = true;
    jsonDiff.tokenize = lineDiff.tokenize;

    jsonDiff.castInput = function (value) {
      var _this$options = this.options,
          undefinedReplacement = _this$options.undefinedReplacement,
          _this$options$stringi = _this$options.stringifyReplacer,
          stringifyReplacer = _this$options$stringi === void 0 ? function (k, v) {
        return typeof v === 'undefined' ? undefinedReplacement : v;
      } : _this$options$stringi;
      return typeof value === 'string' ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, '  ');
    };

    jsonDiff.equals = function (left, right) {
      return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
    };
    // object that is already on the "stack" of items being processed. Accepts an optional replacer

    function canonicalize(obj, stack, replacementStack, replacer, key) {
      stack = stack || [];
      replacementStack = replacementStack || [];

      if (replacer) {
        obj = replacer(key, obj);
      }

      var i;

      for (i = 0; i < stack.length; i += 1) {
        if (stack[i] === obj) {
          return replacementStack[i];
        }
      }

      var canonicalizedObj;

      if ('[object Array]' === objectPrototypeToString.call(obj)) {
        stack.push(obj);
        canonicalizedObj = new Array(obj.length);
        replacementStack.push(canonicalizedObj);

        for (i = 0; i < obj.length; i += 1) {
          canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, key);
        }

        stack.pop();
        replacementStack.pop();
        return canonicalizedObj;
      }

      if (obj && obj.toJSON) {
        obj = obj.toJSON();
      }

      if (_typeof(obj) === 'object' && obj !== null) {
        stack.push(obj);
        canonicalizedObj = {};
        replacementStack.push(canonicalizedObj);

        var sortedKeys = [],
            _key;

        for (_key in obj) {
          /* istanbul ignore else */
          if (obj.hasOwnProperty(_key)) {
            sortedKeys.push(_key);
          }
        }

        sortedKeys.sort();

        for (i = 0; i < sortedKeys.length; i += 1) {
          _key = sortedKeys[i];
          canonicalizedObj[_key] = canonicalize(obj[_key], stack, replacementStack, replacer, _key);
        }

        stack.pop();
        replacementStack.pop();
      } else {
        canonicalizedObj = obj;
      }

      return canonicalizedObj;
    }

    var arrayDiff = new Diff();

    arrayDiff.tokenize = function (value) {
      return value.slice();
    };

    arrayDiff.join = arrayDiff.removeEmpty = function (value) {
      return value;
    };

    const loadScript=async (src, cb)=>{
        const script=document.createElement("script");
        script.src=src;
        const promise=new Promise((resolve,reject)=>{
            let tried=0;
            const timer=setInterval(function(){
                if ( cb() ) {
                    clearInterval(timer);
                    resolve();
                } else if (tried>50) {
                    clearInterval(timer);
                    reject('too many trieds loading '+src);
                }
                tried++;
            },50);    
        });
        document.getElementsByTagName("body")[0].appendChild(script);
        return promise;
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

    const beginVowels={
        'a':'a','ā':'aA','i':'i','ī':'iA','u':'u','ū':'uA','o':'o','e':'e',
    };
    const i2p={
        // '|':'|', //allow | in a word, convert from । ॥ and 
        '।':'।','॥':'॥', //as it is

        'k':'k','t':'t','ñ':'Y','ṅ':'N','ṇ':'N','ḍ':'F','ṭ':'W','p':'p','c':'c','j':'j',
        's':'s','b':'b','y':'y','g':'g','d':'d','h':'h','m':'m','l':'l','v':'v','r':'r','n':'n',
        'ḷ':'L',
        'kh':'K', 'gh':'G', 'jh':'J', 'ch':'C' ,'ṭh':'X', 'ḍh':'Q', 'th':'T', 'dh':'D', 'ph':'P', 'bh':'B',
        'kk':'kVk', 'kkh':'kVK',    'gg':'gVg', 'ggh':'gVG',
        'tt':'tVt', 'tth':'tVT',    'ṭṭ':'WVW', 'ṭṭh':'WVX',
        'pp':'pVp', 'pph':'pVP',    'bb':'bVb', 'bbh':'bVB',
        'jj':'jVj', 'jjh':'jVJ',    'cc':'cVc', 'cch':'cVC',
        'll':'lVl', 'mm':'mVm',     'nn':'nVn', 'ññ':'YVY',
        'dd':'dVd', 'ddh':'dVD',    'ḍḍ':'FVF', 'ḍḍh':'FVQ',
        'ss':'sVs', 'yy':'yVy',     'ṇṇ':'NVN', 

        'ṅgh':'NVG','ṅg':'NVg','ṅkh':'NVK','ṅk':'NVk', 'ṅkhy':'NVKVy',
        'dr':'dVr','dv':'dVv','ndr':'nVdVr',

        'br':'bVr',    'khv':'KVv',    'hm':'hVm',    'ly':'lVy',
        'mbh':'mVB','mh':'mVh','mp':'mVp','mb':'mVb',
        'nd':'nVd','ndh':'nVD','ṇṭh':'NVX',
        'ñc':'YVc','ñj':'YVj','ñjh':'YVJ',
        'ṇṭ':'NVV','nt':'nVt','ṇḍ':'NVF',
        'sv':'sVv','sm':'sVm',
        'tv':'tVv',

        //not in font ligature
        'ḷh':'LVh',
        'nth':'nVT',
        'yh':'yVh',
        'ly':'lVy',
        'tr':'tVr',
        'mph':'mVP',
        'nh':'nVh',
        'ñch':'YVC',
        'vh':'vVh',
        'ṇṭ':'NVW',
        'nv':'nVv',
        'ky':'kVy',
        'gy':'gVy',
        'ntv':'nVtVv',
        'my':'mVy',
        'ty':'tVy',
        'gr':'gVr',
        'kr':'kVr',
        'sn':'sVn',
        'kl':'kVl',
        'st':'sVt',
        'khy':'KVy',
        'pl':'pVl',
        'nty':'nVtVy',
        'hv':'hVv',
        'sy':'sVy',
        'dm':'dVm',
        'khv':'KVv',
        'ṇy':'NVy',
        'kv':'kVv',
        'ṇh':'NVh',//newly added
        'ñh':'YVh',
        'vy':'vVy',
        'by':'bVy',
        'py':'pVy',
        'yv':'yVv',
        'ṭy':'WVy',
        'bhy':'BVy',
        'tthy':'tVTVy', //titthyā
        'tn':'tVn', //ratnapīṭha
        'dhv':'DVv', //Madhvāsava
        'dhy':'DVy', //sādhya
        'ny':'nVy', //Nyāsa
        'gv' :'gVv',//gvākappa
        'nky' :'nVkVy',//Mālunkyāputta
        'hy':'hVy', //corehyahāriya
        'ṇv':'NVv',//Ṇvarabhakkha
        'kkhy':'kVKVy',//alakkhyā
        'ntr':'nVtVr',//tantra 
        'bhm':'BVm',//Subhmā , only found in s0513m note of 442. Saṅkhajātakaṃ
        'dy':'dVy',//rare yadyāyaṃ only found in s0514  "ja534:43.3":
        'sp':'sVp',//rare Vanaspatīni only found in s0514 <note>वनस्पतीनि च (सी॰ पी॰), वनप्पतिञ्‍च (स्या॰ क॰)</note>
    };
    const p2i={};
    for (let key in i2p) p2i[i2p[key]]=key;
    for (let key in beginVowels) p2i[beginVowels[key]]=key;

    const CharOrder=[];
    const Order='aiueokKgGMcCjJYWXFQNtTdDnpPbBmhHyrRlLvsSZAIUEOV';
    for (let i=0;i<Order.length;i++) {
        CharOrder[ Order.charCodeAt(i) ] = i+1;
    }

    const NormLexeme={
    	'bODI':'bOjVJ',
    	'smVbODI':'smVbOjVJ',
    	// 'vVyy':'bVby',
    	// 'vVyyYV':'bVbyYV', //can be removed if smarter
    };
    const DeNormLexeme={};
    const samecount=(s1,s2)=>{
    	let c=0,i1=0,i2=0;
    	while (i1 < s1.length&&i2<s2.length) {
    		if (s1[i1]==s2[i2]) c++;
    		else break;
    		i1++;i2++;
    	}
    	return c;
    };
    const sameendcount=(s1,s2)=>{
    	let c=0,i1=s1.length-1,i2=s2.length-1;
    	while (i1>0&&i2>0) {
    		if (s1[i1]==s2[i2]) c++;
    		else break;
    		i1--;i2--;
    	}
    	return c;
    };
    for (let key in NormLexeme) {
    	const rkey=NormLexeme[key];
    	if (key.indexOf('>')>-1) continue;
    	const cnt=samecount(rkey,key);
    	if (cnt) {
    		DeNormLexeme[rkey]=cnt?(key.slice(0,cnt)+'<'+key.slice(cnt)):key;
    	} else {
    		const cnt=sameendcount(rkey,key);
    		DeNormLexeme[rkey]=cnt?(key.slice(0,key.length-cnt)+'>'+key.slice(key.length-cnt)):key;
    	}
    }

    // console.log('denor',DeNormLexeme)

    const InsertRules={'65':'A'};
    const InsertRuleReverse={};
    const Rules={ //規則號不得為 0,1,2
    // A+B=C    A<B=C   A>B=C    A-B=C
    //   C        AC     BC       ACB     替換結果
    //
    	'a<A=A':'3',
        'a<A=m':'4',
    	'a<A=Vv':'5',
    	'a<A=d':'6',
    	'a-A=r':'7',
    	'a<A=t':'9',
    	'a-AA=r':'3',
    	'a<I=E':'3',
    	'a<I=A':'4',
    	'a<I=IA':'5',
    	'a-I=y':'6',
    	'a-I=m':'7',

    	'a<E=E':'3',
    	'a<E=A':'4',
    	'a-E=d':'5',
    	'a-E=m':'6',
    	'a-E=y':'7',
    	'a<E=':'8',
    	'a<g=gVg':'3', //因為不是 gVG ，所以無法 autorule
    	'a<g=NVg':'4',
    	'a<p=pVp':'3',

    	'a<U=O':'3',
    	'a<U=A':'4',
    	'a<U=U':'5',
    	'a<U=UA':'6',
    	'a<O=U':'3',

    	'a<Ū=UA':'3', //左邊的 UA 要用 Ū 表示，但sandhi 不用
    	'a<Ī=IA':'4',  // IA 也是 ， 
    	'a<Ī=E':'5',
    	'a<t=nVt':'4', 
    	'a<v=bVb':'5',

    	'A<AA=':'3',  //但 AA 不轉為 Ā
    	'A+U=UA':'3',
    	'A+I=IA':'3',
    	'A+I=E':'4',
    	'A-I=y':'5',
    	'A-I=r':'6',
    	'A-I=t':'7',
    	'A-E=y':'4',
    	'A<A=y':'3',
    	'A<A=m':'4',
    	'A+A=E':'5',
    	'A+A=A':'6',
    	'A+A=':'7',
    	'M>AA=m':'3',  //kImAnIsMs << kIM-aAnIsMs, remove left, keep right
    	'M+A=A':'3',
    	'M+A=m':'4',
    	'M+A=d':'5',
    	'M+A=':'6',
    	'M+A=nA':'7',
    	'M+E=A':'3',
    	'M+b=bVb':'3',
    	'M+U=UA':'3',
    	'M+I=IA':'3',
    	'M+I=I':'4',
    	'M>I=y':'5',
    	'M+I=':'6',
    	'M+Ī=A':'3',
    	'M+g=NVg':'3',
    	'M+p=pVp':'3',
    	'M+k=NVk':'3',
    	'M+J=jVJ':'3',
    	'M+X=WVX':'3',
    	'M+y=YVY':'3',//sukhaññeva=sukhaṃ-yeva


    	'I+I=IA':'3',
    	'I+I=E':'4',
    	'I-I=y':'5',
    	'I-I=r':'6',
    	'I+A=jVJ':'2', //this is a special rule for bodhi+anga
    	'I+A=IA':'3',
    	'I+A=A':'4',
    	'I+A=Vy':'6',
        'I<A=m':'7',
    	'I<A=y':'8',
    	'I<A=r':'9',
    	'I+A=':'10',

    	'I<d=nVd':'3',
    	'I+U=UA':'3',
    	// 'I>aA=':'3',  //use 1 instead
    	'I+AA=I':'4',
    	'I-AA=r':'5',
    	'I<AA=':'6', //kucchisayā=kucchi-āsayā

    	'I>E=Vv':'3',
    	'I>E=Vp':'4',
    	'I-E=d':'5',
    	'I-E=m':'7',
    	'I-E=r':'8',
    	'I<D=nVD':'3',
    	'I>t=IA':'3', //只有接 t可能長音化
    	'I>k=IA':'3', //長音化
    	'Ī+A=A':'3',
    	'Ī+U=UA':'3',

    	'U+A=UA':'3', //長音化
    	'U+A=Vv':'4',
    	'U+A=A':'5',
    	'U+A=VvA':'6',
    	'U+A=O':'7',
    	'U+A=':'8',

    	'U+I=U':'3',
    	'U+I=O':'4',
    	'U+I=UA':'5',
    	'U+U=UA':'3',
    	'U-U=h':'4',
    	'U>E=Vv':'3',
    	'U-E=d':'4',
    	'U-E=r':'5',
    	'U>AA=Vv':'3',
    	'U<v=bVb':'3',
    	'U<D=nVD':'3',
    	'U>t=UA':'3', //長音化
    	'U<t=tVt':'4',
    	'U<tA=tVt':'4',
    	'U>t=UA':'3',
    	'E+A=A':'3',
    	'E+A=Vy':'4',
    	'E+A=VyA':'5',
    	'E>AA=Vy':'5',
    	'E+A=':'6',
    	'E+U=UA':'3',
    	'E-I=r':'3',

    	'O+A=':'3',
    	'O+A=Vv':'4',
    	'O+A=A':'5',
    	'O+A=VvA':'6',
    	'O>I=Vv':'3',
    	'O-I=r':'4',
    	'O>E=Vv':'3',
    	'O-E=y':'4',
    	'O-E=v':'5',
    	'O>AA=Vv':'3',
    	'O-U=v':'3',//vammikovupacīyati=vammiko-upacīyati
    	'V+A=':'3',
    	'V+A=A':'4',
    	'V+U=UA':'3',


    // might be vri typo , need to fix original text
    	'V+v=':'4',   //sātaccamuccati=sātaccam-vuccati
    	'M+v=m':'4' , //nibbānamuccati [ 'nibbānaṃ', 'vuccati' ]

     	'a<s=r':'9',//pahūtarattaratanāya [ 'pahūta', 'satta', 'ratanāya' ]

    	//reserve rules
    	//01 => A insert A

    	// 'y+v=bVb':'2', //this is a special rule for udaya+vaya  ==>udayabbaya

    };
    const PAIRING='|', EQUAL='='; //pairing left and right as a search key
    const RuleKeysRegEx=/([<>\-+])/;
    const JoinTypes={};
    const BuildRules=()=>{
    	for (let rule in Rules) {
    		const joiner=Rules[rule]; // then join operator
    		if (!JoinTypes[joiner]) JoinTypes[joiner]={};

    		const at=rule.indexOf(EQUAL);
    		const sandhi=rule.slice(at+1);
    		const [left,elision,right]=rule.slice(0,at).split(RuleKeysRegEx);

    		const pair=left+PAIRING+right;
    		if (JoinTypes[joiner][pair]) console.log('key ',pair,'exists');
    		JoinTypes[joiner][pair]=elision+sandhi; //left is not elided
    	}
    	for (let joiner in InsertRules) {
    		InsertRuleReverse[InsertRules[joiner]]=joiner;
    	}
    };
    BuildRules();

    const devanagari={
        'क':'k','ख':'K','ग':'g', 'घ':'G','ङ':'NG', 'ह':'h', // NG 會變為 provident 的 N, 不能重覆故(做反向表時val 變key)
        'च':'c','छ':'C','ज':'j','झ':'J','ञ':'Y','य':'y','श':'Z',
        'ट':'W','ठ':'X','ड':'F','ढ':'Q','ण':'N','र':'r','ष':'S',
        'त':'t','थ':'T','द':'d','ध':'D','न':'n','ल':'l','स':'s',
        'प':'p','फ':'P','ब':'b','भ':'B','म':'m','व':'v','ळ':'L','ं':'M',
        '॰':'',//abbreviation use only by pe...and inside note (版本略符)
        'अ':'a','इ':'i','उ':'u','ए':'e','ओ':'o','आ':'aA','ई':'iI','ऊ':'uU','ऐ':'ai','औ':'au',
        'ा':'A','ि':'I','ी':'IA','ु':'U','ू':'UA','े':'E','ो':'O', 
        '्':'V', //virama , 連接下個輔音。
        '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9',
        // '।':'|','॥':'||',
        '।':'।','॥':'॥',
        'ौ':'aU', //invalid in pali
        'ै' :'aI',//invalid in pali
        'ऋ':'R',
        'ः':'H',//visarga, rare
    };

    const sinhala={
       'ක':'k','ඛ':'K','ග':'g', 'ඝ':'G','ඞ':'NG', 'හ':'h',
       'ච':'c','ඡ':'C','ජ':'j','ඣ':'J','ඤ':'Y','ය':'y','श':'Z',
       'ට':'W','ඨ':'X','ඩ':'F','ඪ':'Q','ණ':'N','ර':'r','ष':'S', 
       'ත':'t','ථ':'T','ද':'d','ධ':'D','න':'n','ල':'l','ස':'s', 
       'ප':'p','ඵ':'P','බ':'b','භ':'B','ම':'m','ව':'v','ළ':'L','ං':'M',
       'අ':'a','ඉ':'i','උ':'u','එ':'e','ඔ':'o','ආ':'aA','ඊ':'iI','ඌ':'uU',
       'ා':'A','ි':'I','ී':'II','ු':'U','ූ':'UU','ෙ':'E','ො':'O', 
       '්':'V',
    };

    const myanmar={
        'က':'k','ခ':'K','ဂ':'g', 'ဃ':'G','င':'NG', 'ဟ':'h',
        'စ':'c','ဆ':'C','ဇ':'j','ဈ':'J','ဉ':'Y','ယ':'y','श':'Z',
        'ဋ':'W','ဌ':'X','ဍ':'F','ဎ':'Q','ဏ':'N','ရ':'r','ष':'S',
        'တ':'t','ထ':'T','ဒ':'d','ဓ':'D','န':'n','လ':'l','သ':'s',
        'ပ':'p','ဖ':'P','ဗ':'b','ဘ':'B','မ':'m','ဝ':'v','ဠ':'L','ံ':'M',
        'အ':'a','ဣ':'i','ဥ':'u','ဧ':'e','ဩ':'o','အာ':'aA','ဤ':'iI','ဦ':'uU',
        'ာ':'A','ိ':'I','ီ':'II','ု':'U','ူ':'UU','ေ':'E','ော':'O',
        '္':'V',
        '၀':'0','၁':'1','၂':'2','၃':'3','၄':'4','၅':'5','၆':'6','၇':'7','၈':'8','၉':'9',
        ' ်':'', //ASAT
        '၊':'।','။':'॥',
    };
    const thai={
        'ก':'k','ข':'K','ค':'g', 'ฆ':'G','ง':'NG', 'ห':'h', 
        'จ':'c','ฉ':'C','ช':'j','ฌ':'J','ญ':'Y','ย':'y','श':'Z',
        'ฏ':'W','ฐ':'X','ฑ':'F','ฒ':'Q','ณ':'N','ร':'r','ष':'S',
        'ต':'t','ถ':'T','ท':'d','ธ':'D','น':'n','ล':'l','ส':'s',
        'ป':'p','ผ':'P','พ':'b','ภ':'B','ม':'m','ว':'v','ฬ':'L','ํ':'M', 
        'อ':'a','อิ':'i','อุ':'u','เอ':'e','โอ':'o','อา':'aA','อี':'iI','อู':'uU',
        'า':'A','ิ':'I','ี':'II','ุ':'U','ู':'UU','เ':'E','โ':'O',
        'ฺ':'V',
        '๐':'0','๑':'1','๒':'2','๓':'3','๔':'4','๕':'5','๖':'6','๗':'7','๘':'8','๙':'9',
    };
    const khmer={
        'ក':'k','ខ':'K','គ':'g', 'ឃ':'G','ង':'NG', 'ហ':'h',
       'ច':'c','ឆ':'C','ជ':'j','ឈ':'J','ញ':'Y','យ':'y','श':'Z',
       'ដ':'W','ឋ':'X','ឌ':'F','ឍ':'Q','ណ':'N','រ':'r','ष':'S',
       'ត':'t','ថ':'T','ទ':'d','ធ':'D','ន':'n','ល':'l','ស':'s',
       'ប':'p','ផ':'P','ព':'b','ភ':'B','ម':'m','វ':'v','ឡ':'L','ំ':'M',
       'អ':'a','ឥ':'i','ឧ':'u','ឯ':'e','ឱ':'o','អា':'aA','ឦ':'iI','ឩ':'uU',
       'ា':'A','ិ':'I','ី':'II','ុ':'U','ូ':'UU','េ':'E','ោ':'O',
          '្':'V',
          '០':'0','១':'1','២':'2','៣':'3','៤':'4','៥':'5','៦':'6','៧':'7','៨':'8','៩':'9',
    };
    const laos={
        'ກ':'k','ຂ':'K','ຄ':'g', 'ຆ':'G','ງ':'NG', 'ຫ':'h',
        'ຈ':'c','ຉ':'C','ຊ':'j','ຌ':'J','ຎ':'Y','ຍ':'y','श':'Z',
        'ຏ':'W','ຐ':'X','ຑ':'F','ຒ':'Q','ຓ':'N','ຣ':'r','ष':'S',
        'ຕ':'t','ຖ':'T','ທ':'d','ຘ':'D','ນ':'n','ລ':'l','ສ':'s',
        'ປ':'p','ຜ':'P','ພ':'b','ຠ':'B','ມ':'m','ວ':'v','ຬ':'L','ໍ':'M',
        'ອ':'a','ອິ':'i','ອຸ':'u','ເອ':'e','ໂອ':'o','ອາ':'aA','ອີ':'iI','ອູ':'uU',
          'າ':'A','ິ':'I','ີ':'II','ຸ':'U','ູ':'UU','ເ':'E','ໂ':'O',
       '຺':'V',
         '໐':'0','໑':'1','໒':'2','໓':'3','໔':'4','໕':'5','໖':'6','໗':'7','໘':'8','໙':'9',
    };
    const tibetan={
        'ཀ':'k','ཁ':'K','ག':'g', 'གྷ':'G','ང':'NG', 'ཧ':'h',
        'ཙ':'c','ཚ':'C','ཛ':'j','ཛྷ':'J','ཉ':'Y','ཡ':'y','श':'Z',
        'ཊ':'W','ཋ':'X','ཌ':'F','ཌྷ':'Q','ཎ':'N','ར':'r','ष':'S',
        'ཏ':'t','ཐ':'T','ད':'d','དྷ':'D','ན':'n','ལ':'l','ས':'s',
        'པ':'p','ཕ':'P','བ':'b','བྷ':'B','མ':'m','ཝ':'v','ལ༹':'L','ཾ':'M',
        'ཨ':'a','ཨི':'i','ཨུ':'u','ཨེ':'e','ཨོ':'o','ཨཱ':'aA','ཨཱི':'iI','ཨཱུ':'uU',
        'ཱ':'A','ི':'I','ཱི':'II','ུ':'U','ཱུ':'UU','ེ':'E','ོ':'O',
        '྄':'V', 
        '༠':'0','༡':'1','༢':'2','༣':'3','༤':'4','༥':'5','༦':'6','༧':'7','༨':'8','༩':'9',
    //subjoin
        'ྐ':'Vk','ྑ':'VK','ྒ':'Vg','ྒྷ':'VG','ྔ':'VN',
        'ྕྖྗ':'Vc','ྖ':'VC','ྗ':'Vj',         'ྙ':'VY',
        'ྚ':'tVt', 'ྛ':'tVT', 'ྜ':'dVd', 'ྜྷ':'dVD','ྞ':'nVN',
         'ྟ':'Vt' , 'ྠ':'VT','ྡ':'Vd','ྡྷ':'VD', 'ྣ':'Vn',
         'ྤ':'Vp','ྥ':'VP','ྦ':'Vb','ྦྷ':'VB','ྨ':'Vm',
         '།':'।','༎':'॥',
    };
    // export const cyrillic={
    //     'к':'k','кх':'K','г':'g', 'гх':'G','н̇а':'N', 'х':'h', 
    //   'ч':'c','чх':'C','дж':'j','джха':'J','н̃а':'Y','йа':'y','श':'Z',
    //   'т̣а':'w','т̣ха':'x','д̣а':'f','д̣ха':'q','н̣а':'н','ра':'р','ष':'с',
    // 'та':'т','тха':'т','да':'д','дха':'д','на':'н','ла':'л','са':'с',
    //  'па':'п','пха':'п','ба':'б','бха':'б','ма':'м','ва':'в','л̣а':'л','м̣':'м',
    //  'а':'а','и':'и','у':'у','е':'е','о':'о','а̄':'аа','ӣ':'ии','ӯ':'уу',
    //  'а̄':'а','и':'и','ӣ':'ии','у':'у','ӯ':'уу','е':'е','о':'о', 
    //   '':'в',  
    // }

    const inverseTable=tbl=>{
        const out={};
        for (let key in tbl) out[ tbl[key] ]=key;
        return out;
    };

    ({
        hi:inverseTable(devanagari), my:inverseTable(myanmar),
        th:inverseTable(thai),       km:inverseTable(khmer),
        lo:inverseTable(laos),       si:inverseTable(sinhala),
        tb:inverseTable(tibetan) //,    cy:inverseTable(cyrillic),
    });

    const copySelection=evt=>{
        const sel=getSelection();
        const range=document.createRange();
        range.setStart(evt.target,0);
        range.setEnd(evt.target,1);
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
    };

    /* compression of glyphwiki format */

    //stroke
    // const gd2='2:7:8:86:92:100:97:110:111$1:0:0:17:115:185:115$2:32:7:100:115:71:140:12:163$1:32:0:58:144:58:180$2:0:7:53:184:75:174:107:159$2:0:7:165:127:148:138:114:156$2:7:0:129:148:154:172:179:180'
    //comp
    // const gd1='99:0:0:0:0:200:200:u79be-01$99:0:0:70:0:193:200:cdp-8dc9';
    // const gd3='99:0:0:0:5:200:132:u4ea0-g:0:0:0$2:0:7:99:109:65:144:14:163$1:32:413:66:140:66:178$2:32:7:66:178:79:172:115:156$2:0:7:159:120:148:127:121:143$2:7:8:98:133:150:156:169:184';

    /*rare stroke type ,  '101': 11,  '103': 3,  '106': 1,  '107': 2, */

    const NUMOFFSET=10;//must more than stroke type
    const NEGATIVE=4000;//some stroke deco 
    const unpackGD=str=>{
    	if (!str) return '';
    	const units=str.split(SEPARATOR2D);
    	const arr=[];
    	for (let i=0;i<units.length;i++) {
    		const s=units[i];
    		const unit=[];

    		const len=unpack1(s[0]);
    		if (len >NUMOFFSET) {
    			const len=unpack1(s[0])-NUMOFFSET;
    			const name=unpackGID(s.slice(1,len+1));
    			const [x1,y1,x2,y2,sx,sy,sx2,sy2]=unpack(s.slice(len+1)).map(UN);

    			unit.push('99');
    			unit.push( sx||'0',sy||'0', x1||'0',y1||'0',x2||'0',y2||'0' , name);
    			unit.push('0',sx2||'0',sy2||'0');
    		} else {
    			const st=len[0];
    			const nums=Array.from(unpack(s.slice(1)).map(UN));
    			unit.push(st,...nums);
    		}
    		arr.push(unit.join(':'));
    	}
    	return arr.join('$');
    };
    const UN=n=>{
    	if (n>NEGATIVE) return -n+NEGATIVE;
    	else n-=NUMOFFSET;
    	return n;
    };
    const unpackGID=gid=>{
    	const cp=gid.codePointAt(0);
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
    // console.log(packGD(gd3).length,gd3.length)
    // console.log(unpackGD(packGD(gd3))==gd3);

    let gw= typeof window!=='undefined' && window.BMP;
    let _cjkbmp= typeof window!=='undefined' && window.CJKBMP;
    let _cjkext= typeof window!=='undefined' && window.CJKEXT;
    let _gwcomp= typeof window!=='undefined' && window.GWCOMP;

    const getGID=id=>{ //replace versioning , allow code point or unicode char
    	if (typeof id=='number') id=ch2gid(id);
    	else if (id.codePointAt(0)>0x2000) {
    		id='u'+id.codePointAt(0).toString(16);
    	}
    	return id.replace(/@\d+$/,''); // no versioning (@) in the key
    };
    const getGlyph_js=s=>{
    	if (!s||( typeof s=='string' && s.codePointAt(0)>0xff && codePointLength(s)>1)) return ''; //is an ire
    	const gid=getGID(s);
    	const m=gid.match(/^u([\da-f]{4,5})$/);
    	if (m) {
    		const cp=parseInt(m[1],16);
    		if (cp>=0x20000) {
    			const gd=_cjkext[cp-0x20000];
    			return unpackGD(gd);
    		} else if (cp>=0x3400 && cp<0x9FFF) {
    			const gd=_cjkbmp[cp-0x3400];
    			// console.log(gid,gd)
    			return unpackGD(gd);
    		}
    	}

    	const gd=getGlyph_lexicon(gid, _gwcomp);
    	return unpackGD(gd);
    };
    const getGlyph_lexicon=(s,lexicon=gw)=>{
    	const gid=getGID(s);
    	const at=bsearch(lexicon,gid+'=',true);
    	let r='';
    	if (at>=0  && (lexicon[at].slice(0,gid.length+1)==gid+'=')) {
    		const from=lexicon[at].indexOf('=');
    		r=lexicon[at].slice(from+1);
    	}
    	return r;
    };
    let getGlyph=getGlyph_js;
    const getGlyph_wiki=gid=>{ //get from raw wiki format
    	if (gid[0]!==' ') gid=' '+gid;//first char is always ' '
    	if (~gid.indexOf('@')) {
    		gid=gid.replace(/@\d+$/,'');
    	}
    	const at=bsearch(gw,gid,true); //try to reuse getGlyph_js

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
    const deserializeGlyphUnit=glyphdata=>glyphdata.split('$').filter(it=>it!=='0:0:0:0').map(item=>item.split(':'));

    const eachGlyph=cb=>{
    	if (_cjkbmp) {
    		for (let i=0;i<_cjkbmp.length;i++) cb('u'+(i+0x3400).toString(16), unpackGD(_cjkbmp[i]));
    		for (let i=0;i<_cjkext.length;i++) cb('u'+(i+0x20000).toString(16), unpackGD(_cjkext[i]));
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
    const componentsOf=(ch,returnid=false)=>{
    	const d=getGlyph(ch);
    	return componentsOfGD(d,returnid).filter(it=>it!==ch);
    	// return []
    };
    const factorsOfGD=(gd,gid)=>{
    	const units=deserializeGlyphUnit(gd);
    	let factors=[];
    	if (units.length==1 && units[0][0]==='99') { //full frame char , dig in 
    		const compid=units[0][7];
    		return factorsOfGD(getGlyph(compid),compid);
    	}
    	for (let i=0;i<units.length;i++) {
    		if (units[i][0]==='99') {
    			factors.push(units[i][7]);
    		}
    	}
    	return gid?factors:factors.map(gid2ch).join('');
    };
    const componentsOfGD=(d,returnid=false)=>{
    	const comps={};
    	loadComponents(d,comps);
    	const out=Object.keys(comps);
    	return returnid?out:out.map( gid2ch );
    };
    let depth=0;
    const loadComponents=(data,compObj,countrefer=false)=>{ //enumcomponents recursively
    	const entries=data.split('$');
    	depth++;
    	if (depth>10) {
    		console.log('too deep fetching',data); //this occur only when glyphwiki data is not in order.
    		return;
    	}
    	for (let i=0;i<entries.length;i++) {
    		if (entries[i].slice(0,3)=='99:') {
    			let gid=entries[i].slice(entries[i].lastIndexOf(':')+1);
    			if (parseInt(gid).toString()==gid) { //部件碼後面帶數字
    				gid=(entries[i].split(':')[7]).replace(/@\d+$/,'');
    			}
    			const d=getGlyph(gid);
    			if (!d) {
    				console.log('glyph not found',gid);
    			} else {
    				if (countrefer) {
    					if (!compObj[gid])compObj[gid]=0;
    					compObj[gid]++;					
    				} else {
    					if (!compObj[gid])compObj[gid]= getGlyph(gid);
    				}
    				loadComponents(d,compObj,countrefer);
    			}
    		}
    	}
    	depth--;
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
    const frameOf=(gd, rawframe)=>{
    	const entries=gd.split('$');
    	let frames=[];
    	let gid='';
    	for (let i=0;i<entries.length;i++) {
    		if (entries[i].slice(0,3)==='99:') {
    			const [m,a1,a2,x1,y1,x2,y2,id]=entries[i].split(':');
    			frames.push([x1,y1,x2,y2]);
    			gid=id;
    		}
    	}
    	if (!rawframe && frames.length==1) { //自動全框展開
    		frames=frameOf(getGlyph(gid));
    	}
    	return frames
    };



    const glyphWikiCount=()=>gw?gw.length: (_gwcomp.length+_cjkbmp.length+_cjkext.length);
    const ch2gid=ch=>'u'+(typeof ch=='number'?ch:(ch.codePointAt(0)||' ')).toString(16);
    const gid2ch=gid=> {
    	if (gid[0]!=='u') return ' ';
    	let n=parseInt(gid.slice(1) ,16);
    	if (n<0x20 ||isNaN(n)) n=0x20;
    	return String.fromCodePoint(n);
    };

    const fontfacedef={};

    const addFontFace=(name,settings)=>{
    	fontfacedef[name]=settings;
    };

    const getFontFace=name=>{
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

    const UnifiedComps ={
    "㴞":"滔",
    "乂":"㐅",
    "乙":"⺄",
    "任":"仼",
    "俞":"兪",
    "兌":"兑",
    "內":"内",
    "兪":"俞",
    "冂":"⺆",
    "別":"别",
    "劵":"券",
    "匀":"勻",
    "卽":"即",
    "吳":"吴",
    "吴":"吳",
    "吿":"告",
    "夂":"夊",
    "寶":"寳",
    "尙":"尚",
    "尚":"𫩠",
    "屛":"屏",
    "巟":"𡿫",
    "巿":"市",
    "强":"強",
    "彔":"录",
    "彥":"彦",
    "慈":"慈",
    "戱":"戯",
    "戶":"户",
    "户":"戶",
    "戾":"戻",
    "手":"龵",
    "抛":"拋",
    "敎":"教",
    "日":"曰",
    "曁":"暨",
    "月":"⺼",
    "朏":"胐",
    "木":"朩",
    "朮":"术",
    "査":"查",
    "步":"歩",
    "殼":"殻",
    "毁":"毀",
    "每":"毎",
    "淸":"清",
    "熏":"𤋱",
    "爲":"為",
    "牜":"牛",
    "產":"産",
    "甯":"𪧟",
    "畚":"𡘞",
    "疉":"𤴁",
    "眔":"𥄳",
    "真":"真",
    "示":"礻",
    "祿":"䘵",
    "禿":"秃",
    "穎":"㯋",
    "算":"𮅕",
    "糸":"糹",
    "絶":"絕",
    "纖":"纎",
    "罓":"冈",
    "羊":"𦍌",
    "翆":"翠",
    "臼":"𦥑",
    "艹":"艹",
    "蒙":"𫎇",
    "薰":"薫",
    "虛:":"虚",
    "虽":"𧈧",
    "蚩":"革",
    "衞":"衛",
    "訁" :"言",
    "豕":"豖",
    "辶":"辶",
    "逬":"迸",
    "邉":"𫟪",
    "鄕":"郷", //"鄕":"鄉",
    "釒":"金",
    "钅":"金",
    "靑":"青",
    "顏":"顔",
    "飮":"飲",
    "髮":"髪",
    "黃":"黄",
    "黑":"黒",
    "黽":"𪓑",
    "龺":"𠦝",
    "龻":"䜌",
    "𠆢":"人",
    "𠔉":"龹",
    "𠘨":"几",
    "𠤎":"匕",
    "𡈼":"壬",
    "𡭔":"小",
    "𢼸":"𣁋",
    "𢾾":"敷",
    "𣗥":"棘",
    "𣡸":"欝",
    "𤛉":"舝",
    "𤣩":"王",
    "𥁕":"昷",
    "𥟖":"𥠖",
    "𦓤":"耒",
    "𧶠":"賣",
    "𩙿":"飠",
    "𩵋":"魚",
    "𫉬":"獲",
    "𫜸":"叱",
    "𬜯":"䓣",
    "𬼆":"爻",
    "𠄢":"𠄢",
    "勺":"勺",
    "巽":"巽",
    "憲":"憲",
    "朗":"朗",
    "爨":"爨",
    "𰆊":"卩",
    "契":"契",
    "郎":"郎",//"郎":"郞",
    "虜":"虜",
    "寧":"寧",
    "便":"便",
    "數":"數",
    "殺":"殺",
    "麗":"麗",
    "連":"連",
    "廉":"廉",
    "遼":"遼",
    "類":"類",
    "隆":"隆",
    "猪":"猪",
    "益":"益",
    "礼":"礼",
    "神":"神",
    "祥":"祥",
    "靖":"靖",
    "精":"精",
    "羽":"羽",
    "諸":"諸",
    "都":"都",
    "勉":"勉",
    "勤":"勤",
    "卑":"卑",
    "器":"器",
    "墨":"墨",
    "層":"層",
    "憎":"憎",
    "敏":"敏",
    "既":"既", //"既":"旣", less likely
    "暑":"暑",
    "梅":"梅",
    "海":"海",
    "渚":"渚",
    "漢":"漢",
    "煮":"煮",
    "碑":"碑",
    "社":"社",
    "祐":"祐",
    "祖":"祖",
    "祝":"祝",
    "穀":"穀",
    "節":"節",
    "繁":"繁",
    "署":"署",
    "者":"者",
    "臭":"臭",
    "艹":"艹",
    "艹":"艹",
    "著":"著",
    "謹":"謹",
    "賓":"賓",
    "辶":"辶",
    "逸":"逸",
    "難":"難",
    "頻":"頻",
    "勇":"勇",
    };  
    const UnifiedComps_UTF32={};
    for (let ch in UnifiedComps) {
    	UnifiedComps_UTF32[ ch.codePointAt(0) ] = UnifiedComps[ch].codePointAt(0);
    }

    const Instructions={};
    const registerInstruction=(inst , func)=>{ //register IRE 
    	Instructions[inst]=func;
    };
    const replaceUncommon=chars=>{//using the base to draw thechar by replacing uncommon char
    	const [base  , op , thechar]=chars; 
    	const comps1=factorsOfGD( getGlyph(base) ,true );
    	const comps2=factorsOfGD( getGlyph(thechar) ,true);
    	if (comps1.length!==comps2.length) return ['',''];
    	for (let i=0;i<comps1.length;i++) {
    		const ch1=gid2ch(comps1[i]);
    		const ch2=gid2ch(comps2[i]);
    		if (ch1!==ch2) return [comps1[i],comps2[i]];
    	}
    	return ['','']
    };
    const INST_REBASE='ⓡ';
    const paliCase=chars=>{
    	let casstyle='' ;
    	const cas=String.fromCodePoint(chars[2]);
    	casstyle= '<text x="170" y="30" style="font-size:16pt ;fill:brown">'+cas+'</text>';
    	return ['','',casstyle]
    };
    const punctuations=chars=>{
    	let casstyle='' ;
    	const cas=String.fromCodePoint(chars[2]);
    	casstyle= '<text x="175" y="180" font-size=64px fill=red>'+cas+'</text>';

    	return ['','',casstyle]	
    };
    registerInstruction(INST_REBASE,replaceUncommon);
    registerInstruction('ⓒ',paliCase);
    registerInstruction('ⓟ',punctuations);

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
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
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const stockbases="㫖仲凒勲匔匰厤吾哪圞埲奛奨娟嬰孲寵屘屢岱峉嶁幥廚彅彨循怠懚戓戭掉敟旟显晔晷暰朥梑歡殣毜毷氇氳泉泴泵沙泊濈炱煴爺牆牕犋犧犧犨狊狸珃瑽璹瓪甂畠畧畩疾皒皸盪睯瞃矞矠矪砠硰磱禧種窟竬竽筯籼粜粪糣緈縆罣羫翇翞翿聘聳聾肿膐艚艚蚦蜰蟧袂袵裂裔觶觺訣諬譵貔賌贎贜趘躎躰軇軸輙達適邁邷鄲酾醒鈝銴鑚钂钰铏闡陚雝霓靟鞃韟韷顢颪飅餥餬馽驕驚骽體髜鬚鬫鬸鬻鮤鯨鵟鷣鸔麜麣黖黸鼊齉齷齾";
    const stockfavorites='初衤礻$颰犮电$峰夆電雨水$𬠶蛇冠寸苗$开腦囟同$寶缶充$衚胡舞$䳘鳥烏戰口火$痛甬炱台肝$髜昇厏乍电$超召狸里美$国玉囡女书';//鵝鳥烏
    let favorites=writable( ((localStorage.getItem('hzpx-favorites')||stockfavorites).split('$')));
    let bases=writable( splitUTF32Char(localStorage.getItem('hzpx-bases')||stockbases));


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

    const autoIRE=(ch,bases)=>{
    	if (!bases || !bases.length || !ch) return '';
    	if (Array.isArray(bases)) {
    		for (let base of bases) {
    			const ire=_autoIRE(ch,base);
    			if (ire) return ire;
    		}
    	} else return _autoIRE(ch,bases)
    };

    const _autoIRE=(ch,base)=>{
    	if (ch==base) return ''
    	const f1=factorsOfGD( getGlyph(ch), true);
    	const f2=factorsOfGD( gettGlyph(base)).map(it=> UnifiedComps_UTF32[it]||it );
    	// if (ch==='䭙') console.log(f1,f2.map(it=>String.fromCodePoint(it)),ch,base)
    	const commonpart=intersect(f1,f2);
    	const from=f2.filter(it=>commonpart.indexOf(it)==-1);
    	const to=f1.filter(it=>commonpart.indexOf(it)==-1);

    	if (from.length===1 && to.length===1) {
    		return base+String.fromCodePoint(from)+String.fromCodePoint(to);
    	}
    	return ''
    };
    const reBase=(ch,bases)=>{
    	const ire=autoIRE(ch,bases);
    	if (ire) {
    		const base=String.fromCodePoint(ire.codePointAt(0));
    		return base+INST_REBASE+ch; //this syntax will preserve the variants
    	}
    };
    const baseCandidate=ch=>{
        const B=get_store_value(bases);
        const out=[];
        for (let i=0;i<B.length;i++) {
            const ire=_autoIRE(ch,B[i]);
            if (ire) out.push(B[i]);
        }
    	return out;
    };
    const splitPinx=(str, auto)=>{
    	const out=[];
    	const chars=splitUTF32Char(str);
    	let i=0;
    	let nesting=0 ,ire='';  
    	while (i<chars.length) {
    		nesting&&nesting--;
    		const comps=componentsOf(chars[i]);
    		if (~comps.indexOf( chars[i+1] ) || Instructions[chars[i+1]]) {
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
    					if (auto&&!getGlyph(ch)) { //not found, try to replace with ire
    						ch=autoIRE(ch) || ch;
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


    const validIRE=ire=>codePointLength(ire)>1 && splitPinx(ire).length==1;

    /*! kage.js v0.4.0
     *  Licensed under GPL-3.0
     *  https://github.com/kurgm/kage-engine#readme
     */
    var Kage = (function () {

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
            var a1;
            var a2;
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
            cdDrawCurveU(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4);
        }
        function cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3, a1, a2) {
            cdDrawCurveU(font, polygons, x1, y1, x2, y2, x2, y2, x3, y3);
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
                        cdDrawCurve(font, polygons, tx1, ty1, x2, y2, x2 - font.kMage * 2, y2 - font.kMage * 0.5);
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
                        cdDrawCurve(font, polygons, x1, y1, x2, y2, tx1, ty1);
                        cdDrawCurve(font, polygons, tx1, ty1, x3, y3, x3 - font.kMage * 2, y3 - font.kMage * 0.5);
                    }
                    else if (a3_100 === 5 && a3_opt === 0) {
                        var tx1 = x3 + font.kMage;
                        var ty1 = y3;
                        var tx2 = tx1 + font.kMage * 0.5;
                        var ty2 = y3 - font.kMage * 2;
                        cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3);
                        cdDrawCurve(font, polygons, x3, y3, tx1, ty1, tx2, ty2);
                    }
                    else {
                        cdDrawCurve(font, polygons, x1, y1, x2, y2, x3, y3);
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
                    cdDrawCurve(font, polygons, tx1, ty1, x2, y2, tx2, ty2);
                    if (a3_100 === 5 && a3_opt_1 === 0 && mageAdjustment === 0) {
                        var tx3 = x3 - font.kMage;
                        var ty3 = y3;
                        var tx4 = x3 + font.kMage * 0.5;
                        var ty4 = y3 - font.kMage * 2;
                        cdDrawLine(font, polygons, tx2, ty2, tx3, ty3, 1, 1);
                        cdDrawCurve(font, polygons, tx3, ty3, x3, y3, tx4, ty4);
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
                        cdDrawBezier(font, polygons, x1, y1, x2, y2, x3, y3, tx1, ty1);
                        cdDrawCurve(font, polygons, tx1, ty1, x4, y4, tx2, ty2);
                    }
                    else {
                        /*
                        cdDrawCurve(x1, y1, x2, y2, (x2 + x3) / 2, (y2 + y3) / 2, a2, 1);
                        cdDrawCurve((x2 + x3) / 2, (y2 + y3) / 2, x3, y3, x4, y4, 1, a3);
                         */
                        cdDrawBezier(font, polygons, x1, y1, x2, y2, x3, y3, x4, y4);
                    }
                    break;
                }
                case 7: {
                    cdDrawLine(font, polygons, x1, y1, x2, y2, a2_100, 1);
                    cdDrawCurve(font, polygons, x2, y2, x3, y3, x4, y4);
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

        return Kage;

    })();

    const FontEngine=Kage;//Kage;
    let pxe = new FontEngine();
    pxe.kUseCurve=true;

    let renderedComponents=[];
    const getRenderComps=()=>{
    	return unique((renderedComponents||[]).sort(alphabetically));
    };
    const getLastComps=(value)=>{
    	if (!value) return [];
    	const chars=splitUTF32Char(value);
    	if (!chars.length) return [];
    	return componentsOf(chars[chars.length-1]);
    };
    const resizeSVG=(svg,size=64)=>svg.replace(/(width|height)=\"\d+\"/g,(m,m1,m2)=>m1+'='+size);
    const patchSVG=(svg,patch)=>svg.replace(/<svg /,'<svg '+patch+' ');
    const patchColor=(svg,color)=>svg.replace(/fill="black"/g,'fill="'+color+'"');
    const setFontEngineOption=(opts,engine)=>{
    	engine=engine||pxe;
    	const fontface=getFontFace(opts.fontface);
    	if (fontface) {
    		engine.kShotai=fontface.hei?1:0;
    		for (let key in fontface) engine.kFont[key]=fontface[key];
    	} else {
    		engine.kShotai=opts.hei?1:0;
    		engine.kFont.kWidth=opts.width||5;		
    	}
    };
    const appendToSVG=(append,svg)=>{
    	if (!append) return svg;
    	if (typeof append=='string') {
    		return svg.replace('</svg>',append)+'</svg>';	
    	} else if (typeof append=='function') {
    		return append(svg);
    	}
    	return svg;
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
    const drawGlyph=(unicode,opts={})=>{
    	if (!unicode) return '';
    	const components={};
    	const size=opts.size||64;
    	let gid;
    	let polygons = new FontEngine.Polygons();

    	if (typeof unicode=='number') {
    		gid='u'+unicode.toString(16);
    	} else {
    		if (unicode.codePointAt(0)<0x2000) { 
    			gid=unicode;
    		} else {
    			gid='u'+unicode.codePointAt(0).toString(16);
    		}
    	}
    	const d=getGlyph(gid);

    	if (!d) return opts.alt?unicode:''
    	
    	loadComponents(d,components);
    	for (let comp in components) {
    		pxe.kBuhin.push(comp,components[comp]);
    	}
    	pxe.kBuhin.push(gid,d);
    	// console.log(pxe.kBuhin.hash)
    	renderedComponents.push(...Object.keys(components));
    	setFontEngineOption(opts,pxe);
    	
    	pxe.makeGlyph(polygons, gid);
    	let svg=polygons.generateSVG(true);
    	svg = opts.frame?addFrameToSVG(d,svg):svg;
    	svg = patchSVG(svg, 'gid='+gid+ ' ch='+unicode);
    	if (opts.color!=='black' && opts.color) svg = patchColor(svg, opts.color);
    	return resizeSVG( svg,size);
    };

    const drawGlyphs=(str,opts={})=>{
    	renderedComponents=[];
    	const chars=splitUTF32(str);
    	return chars.map( ch=>drawGlyph(ch,opts));
    };

    const drawPinxChar=(ire,opts={})=>{
    	const chars=splitUTF32(ire);

    	if (!validIRE(ire)) return drawGlyphs(ire);
    	let i=0,polygons = new FontEngine.Polygons();
    	const size=opts.size||64;
    	let appends=[];
    	while (i<chars.length-2) {
    		const components={};	
    		const d=getGlyph(chars[i]);
    		pxe.kBuhin.push(ch2gid(chars[i]),d);
    		loadComponents(d,components);

    		const func=Instructions[String.fromCodePoint(chars[i+1])];
    		let from,to,append;
    		if (func) {
    			[from,to,append]=func(chars.slice(i));
    			appends.push(append);
    		} else {
    			from = ch2gid(chars[i+1]||'');
    			to   = ch2gid(chars[i+2]||'');
    		}
    		for (let c in components) {
    			if (c.slice(0,from.length)==from) { 
    				let repl=getGlyph(to+c.slice(from.length));//same variant
    				if (!repl) repl=getGlyph(to); 
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
    	const d=getGlyph(chars[0]);
    	pxe.kBuhin.push(ire,d);
    	setFontEngineOption(opts,pxe);
    	pxe.makeGlyph(polygons, ire);
    	let svg=polygons.generateSVG(true);
    	appends.forEach(append=>svg=appendToSVG(append,svg));
    	svg = opts.frame?addFrameToSVG(d,svg):svg;
    	svg = patchSVG(svg, 'ire='+ire);
    	if (opts.color!=='black' && opts.color) svg = patchColor(svg, opts.color);
    	svg = resizeSVG(svg,size);
    	return svg;
    };
    const drawPinx=(str,opts)=>{
    	pxe = new FontEngine();
    	pxe.kUseCurve = true;
    	renderedComponents=[];
        const units=splitPinx(str,true); // char not in glyph database will be expanded automatically

        const out=[];
        for (let i=0;i<units.length;i++) {
        	const u=units[i];
        	out.push( (codePointLength(u)==1? drawGlyph(u,opts): drawPinxChar(u,opts)));
        }
    	return out;
    };

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

    /* src\glyph.svelte generated by Svelte v3.42.4 */
    const file$5 = "src\\glyph.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (48:0) {:else}
    function create_else_block$1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*gid*/ ctx[0]);
    			toggle_class(span, "derivable", /*derivable*/ ctx[1]);
    			add_location(span, file$5, 48, 0, 1035);
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
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(48:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#if derivable}
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
    			add_location(span0, file$5, 45, 0, 906);
    			attr_dev(span1, "class", "clickable");
    			toggle_class(span1, "derivable", /*derivable*/ ctx[1]);
    			add_location(span1, file$5, 46, 0, 950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t2);

    			if (!mounted) {
    				dispose = listen_dev(span1, "click", /*genDerived*/ ctx[8], false, false, false);
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
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(45:0) {#if derivable}",
    		ctx
    	});

    	return block;
    }

    // (55:0) {#each partialDerived(batch) as d}
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
    		source: "(55:0) {#each partialDerived(batch) as d}",
    		ctx
    	});

    	return block;
    }

    // (54:0) {#key batch}
    function create_key_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*partialDerived*/ ctx[9](/*batch*/ ctx[5]);
    	validate_each_argument(each_value);
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
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*partialDerived, batch, fontface*/ 548) {
    				each_value = /*partialDerived*/ ctx[9](/*batch*/ ctx[5]);
    				validate_each_argument(each_value);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block$2.name,
    		type: "key",
    		source: "(54:0) {#key batch}",
    		ctx
    	});

    	return block;
    }

    // (59:0) {#if batch*batchsize<derived.length}
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
    			add_location(span, file$5, 59, 0, 1269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*morebatch*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*derived, batch*/ 96 && t1_value !== (t1_value = /*derived*/ ctx[6].length - /*batch*/ ctx[5] * batchsize + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(59:0) {#if batch*batchsize<derived.length}",
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
    			add_location(span0, file$5, 42, 0, 803);
    			add_location(rt, file$5, 43, 0, 883);
    			add_location(ruby, file$5, 41, 0, 795);
    			attr_dev(span1, "class", "msg");
    			add_location(span1, file$5, 52, 0, 1094);
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
    				dispose = listen_dev(span0, "click", /*click_handler*/ ctx[13], false, false, false);
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
    				transition_in(key_block);
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
    			if (detaching) detach_dev(ruby);
    			if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t3);
    			key_block.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*gid*/ ctx[0] === undefined && !('gid' in props)) {
    			console.warn("<Glyph> was created without expected prop 'gid'");
    		}

    		if (/*fontface*/ ctx[2] === undefined && !('fontface' in props)) {
    			console.warn("<Glyph> was created without expected prop 'fontface'");
    		}
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

    /* src\charmaprow.svelte generated by Svelte v3.42.4 */
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
    	let t0_value = /*ch*/ ctx[12].codePointAt(0).toString(16) + "";
    	let t0;
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
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "title", /*todraw*/ ctx[4](/*ch*/ ctx[12]));
    			add_location(span, file$4, 34, 27, 940);
    			attr_dev(rb, "class", "charmap-glyph");
    			add_location(rb, file$4, 34, 0, 913);
    			attr_dev(rt, "class", "charmap-codepoint");
    			toggle_class(rt, "selected", /*glyph*/ ctx[0] == /*ch*/ ctx[12]);
    			add_location(rt, file$4, 34, 84, 997);
    			add_location(ruby, file$4, 33, 0, 878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ruby, anchor);
    			append_dev(ruby, rb);
    			append_dev(rb, span);
    			span.innerHTML = raw_value;
    			append_dev(ruby, rt);
    			append_dev(rt, t0);
    			append_dev(ruby, t1);

    			if (!mounted) {
    				dispose = listen_dev(ruby, "click", click_handler, false, false, false);
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
    			if (detaching) detach_dev(ruby);
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
    	let each_value = /*chars*/ ctx[2];
    	validate_each_argument(each_value);
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
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*onClick, chars, glyph, todraw, draw, ire*/ 63) {
    				each_value = /*chars*/ ctx[2];
    				validate_each_argument(each_value);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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

    	const todraw = ch => ire && base && glyph == ch ? reBase(ch, base) : ch;

    	const draw = (ch, glyph) => drawPinx(todraw(ch), {
    		size: 48,
    		alt: true,
    		fontface,
    		color: todraw(ch) !== ch ? 'green' : 'black'
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
    		reBase,
    		string2codePoint,
    		copySelection,
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

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fontface*/ ctx[7] === undefined && !('fontface' in props)) {
    			console.warn("<Charmaprow> was created without expected prop 'fontface'");
    		}
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

    /* src\charmap.svelte generated by Svelte v3.42.4 */

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

    // (35:0) {#each enumCJKRangeNames() as name}
    function create_each_block_1$2(ctx) {
    	let span;
    	let t_value = /*name*/ ctx[12] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*name*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "clickable");
    			toggle_class(span, "selected", CJKRangeName(/*glyph*/ ctx[0]) == /*name*/ ctx[12]);
    			add_location(span, file$3, 35, 0, 816);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*CJKRangeName, glyph, enumCJKRangeNames*/ 1) {
    				toggle_class(span, "selected", CJKRangeName(/*glyph*/ ctx[0]) == /*name*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(35:0) {#each enumCJKRangeNames() as name}",
    		ctx
    	});

    	return block;
    }

    // (34:0) {#key glyph}
    function create_key_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = enumCJKRangeNames();
    	validate_each_argument(each_value_1);
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
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*CJKRangeName, glyph, enumCJKRangeNames, getCJKRange*/ 1) {
    				each_value_1 = enumCJKRangeNames();
    				validate_each_argument(each_value_1);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(34:0) {#key glyph}",
    		ctx
    	});

    	return block;
    }

    // (41:0) {#each rows as rowstart }
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
    			add_location(div, file$3, 41, 0, 1014);
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
    			if (detaching) detach_dev(div);
    			destroy_component(charmaprow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(41:0) {#each rows as rowstart }",
    		ctx
    	});

    	return block;
    }

    // (40:0) {#key rows}
    function create_key_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*rows*/ ctx[2];
    	validate_each_argument(each_value);
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
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows, fontface, glyph*/ 7) {
    				each_value = /*rows*/ ctx[2];
    				validate_each_argument(each_value);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block$1.name,
    		type: "key",
    		source: "(40:0) {#key rows}",
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
    			add_location(span0, file$3, 29, 0, 618);
    			attr_dev(input, "size", "4");
    			add_location(input, file$3, 30, 0, 670);
    			attr_dev(span1, "class", "clickable");
    			add_location(span1, file$3, 31, 0, 706);
    			add_location(br, file$3, 32, 0, 758);
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
    					listen_dev(span0, "click", /*prevpage*/ ctx[4], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(span1, "click", /*nextpage*/ ctx[3], false, false, false)
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
    				transition_in(key_block1);
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
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t5);
    			key_block0.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(key_block1_anchor);
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

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*glyph*/ ctx[0] === undefined && !('glyph' in props)) {
    			console.warn("<Charmap> was created without expected prop 'glyph'");
    		}

    		if (/*fontface*/ ctx[1] === undefined && !('fontface' in props)) {
    			console.warn("<Charmap> was created without expected prop 'fontface'");
    		}
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

    /* src\testbench.svelte generated by Svelte v3.42.4 */
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

    // (51:0) {#each glyphdata as unit}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t_value = /*unit*/ ctx[14] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "glyphdata svelte-1mstjcy");
    			add_location(div, file$2, 51, 0, 1409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*glyphdata*/ 16 && t_value !== (t_value = /*unit*/ ctx[14] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(51:0) {#each glyphdata as unit}",
    		ctx
    	});

    	return block;
    }

    // (54:0) {#each candidates as base}
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
    			add_location(span, file$2, 54, 0, 1481);
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
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(54:0) {#each candidates as base}",
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
    	let each_value_1 = /*glyphdata*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*candidates*/ ctx[3];
    	validate_each_argument(each_value);
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
    			html_tag = new HtmlTag();
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
    			add_location(a, file$2, 41, 0, 1088);
    			attr_dev(td0, "class", "svelte-1mstjcy");
    			add_location(td0, file$2, 44, 11, 1310);
    			html_tag.a = t3;
    			add_location(br, file$2, 49, 0, 1376);
    			attr_dev(td1, "class", "svelte-1mstjcy");
    			add_location(td1, file$2, 47, 0, 1357);
    			add_location(tr, file$2, 44, 7, 1306);
    			add_location(table, file$2, 44, 0, 1299);
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
    				each_blocks_1[i].m(td1, null);
    			}

    			append_dev(td1, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td1, null);
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
    				each_value_1 = /*glyphdata*/ ctx[4];
    				validate_each_argument(each_value_1);
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
    				each_value = /*candidates*/ ctx[3];
    				validate_each_argument(each_value);
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
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
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
    		onMount,
    		CharMap: Charmap,
    		loadScript,
    		drawPinx,
    		drawGlyph,
    		getGlyph,
    		reBase,
    		baseCandidate,
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
    			$$invalidate(4, glyphdata = getGlyph(glyph).split('$'));
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

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fontface*/ ctx[0] === undefined && !('fontface' in props)) {
    			console.warn("<Testbench> was created without expected prop 'fontface'");
    		}
    	}

    	get fontface() {
    		throw new Error("<Testbench>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontface(value) {
    		throw new Error("<Testbench>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\favorite.svelte generated by Svelte v3.42.4 */
    const file$1 = "src\\favorite.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (24:0) {#each $favorites as f}
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
    			add_location(span, file$1, 24, 0, 625);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
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
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(24:0) {#each $favorites as f}",
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
    	let each_value = /*$favorites*/ ctx[1];
    	validate_each_argument(each_value);
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
    			add_location(span, file$1, 22, 0, 494);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*dofavor*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$favorites, value*/ 3 && t0_value !== (t0_value = (~/*$favorites*/ ctx[1].indexOf(/*value*/ ctx[0])
    			? '❌'
    			: '❤') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*getCodepoints, $favorites, value*/ 11) {
    				each_value = /*$favorites*/ ctx[1];
    				validate_each_argument(each_value);
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
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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

    const StorageKey = 'hzpx-favorite';

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
    		const codepoints = splitUTF32(str);
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
    		StorageKey,
    		splitUTF32,
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

    const sc2tc=`㑔㑯
㑇㑳
㐹㑶
刾㓨
㘎㘚
㚯㜄
㛣㜏
㟆㠏
㤘㥮
㨫㩜
㧐㩳
擜㩵
㻪㻽
䀥䁻
鿎䃮
䌶䊷
䌺䋙
䌻䋚
䌿䋹
䌾䋻
䎬䎱
䙌䙡
䜧䜀
䞍䝼
䦂䥇
鿏䥑
䥾䥱
䦶䦛
䦷䦟
䯅䯀
鲃䰾
䲣䱷
䲝䱽
鳚䲁
鳤䲘
鹮䴉
丢丟
并<併並
干<幹>乾
乱亂
亚亞
伫佇
来來
仑侖
侣侶
俣俁
系<繫係
伣俔
侠俠
伡俥
伥倀
俩倆
俫倈
仓倉
个個
们們
伦倫
㑈倲
伟偉
㐽偑
侧側
侦偵
伪僞偽
㐷傌
杰<傑
伧傖
伞傘
备備
佣<傭
偬傯
传傳
伛傴
债債
伤傷
倾傾
偻僂
仅僅
佥僉
侨僑
仆<僕
侥僥
偾僨
价<價
仪儀
㑺儁
侬儂
亿億
侩儈
俭儉
傧儐
俦儔
侪儕
尽盡儘
偿償
优<優
储儲
俪儷
㑩儸
傩儺
傥儻
俨儼
兑兌
儿<兒
兖兗
内內
两兩
册冊
幂冪
净凈
冻凍
凛凜
凯凱
别別
删刪
刭剄
则則
克<剋
刹剎
刬剗
刚剛
剥剝
剐剮
剀剴
创創
划<劃
剧劇
刘劉
刽劊
刿劌
剑劍
㓥劏
剂劑
㔉劚
劲勁
动動
务務
勋勛
胜<勝
劳勞
势勢
勚勩
劢勱
励勵
劝勸
匀勻
匦匭
汇彙匯
匮匱
区區
协協
却卻
厍厙
厌厭
厉厲
厣厴
参參
叁叄
丛叢
咤>吒
吴吳
呐吶
吕呂
呙咼
员員
呗唄
吣唚
问問
哑啞
启啟
唡啢
㖞喎
唤喚
丧喪
乔喬
单單
哟喲
呛嗆
啬嗇
唝嗊
吗嗎
呜嗚
唢嗩
哔嗶
叹嘆
喽嘍
啯嘓
呕嘔
啧嘖
尝嘗
唛嘜
哗嘩
唠嘮
啸嘯
叽嘰
哓嘵
呒嘸
啴嘽
嘘噓
㖊噚
咝噝
哒噠
哝噥
哕噦
嗳噯
哙噲
喷噴
吨<噸
当當噹
咛嚀
吓嚇
哜嚌
噜嚕
啮嚙
呖嚦
咙嚨
亸嚲
喾嚳
严嚴
嘤嚶
啭囀
嗫囁
嚣囂
冁囅
呓囈
啰囉
嘱囑
囱囪
囵圇
国國
围圍
园園
圆圓
图圖
团團
埯垵
垭埡
采<採埰
执執
坚堅
垩堊
垴堖
埚堝
尧堯
报報
场場
块塊
茔塋
垲塏
埘塒
涂<塗
坞塢
埙塤
尘塵
堑塹
垫墊
坠墜
堕墮
坟墳
垯墶
垦墾
坛罈壇
垱壋
压壓
垒壘
圹壙
垆壚
坏<壞
垄壟
垅壠
坜壢
坝壩
塆壪
壮壯
壶壺
壸壼
寿壽
够夠
梦夢
夹夾
奂奐
奥奧
奁奩
夺奪
奨奬
奋奮
姹奼
妆妝
姗姍
奸<姦
娱娛
娄婁
妇婦
娅婭
娲媧
妫媯
㛀媰
媪媼
妈媽
妪嫗
妩嫵
娴嫻
婳嫿
媭嬃
娆嬈
婵嬋
娇嬌
嫱嬙
嫒嬡
嬷嬤
嫔嬪
婴嬰
婶嬸
㛤孋
娈孌
孙孫
学學
孪孿
宫宮
寝寢
实實
宁<寧
审審
写寫
宽寬
㝦寯
宠寵
宝寶
将將
专專
寻尋
对對
导導
尴尷
届屆
尸<屍
屃屓
屉屜
屡屢
层層
屦屨
属屬
冈岡
岘峴
岛島
峡峽
崃崍
岗崗
峥崢
岽崬
岚嵐
㟥嵾
嵝嶁
崭嶄
岖嶇
嵚嶔
崂嶗
峤嶠
峣嶢
峄嶧
崄嶮
岙嶴
嵘嶸
岭<嶺
屿嶼
岿巋
峦巒
巅巔
巯巰
帅帥
师師
帐帳
带帶
帧幀
帏幃
㡎幓
帼幗
帻幘
帜幟
币幣
帮幫
帱幬
么<麼>幺>麽
几<幾
库庫
厕廁
厢廂
厩廄
厦廈
厨廚
厮廝
庙廟
厂<廠
庑廡
废廢
广廣
廪廩
庐廬
厅廳
弑弒
弪弳
张張
强強
弹彈
弥彌
弯彎
彝<彞
彟彠
彦彥
彨彲
后<>後
径徑
从從
徕徠
复<複復>覆
征<>徵
彻徹
恒恆
耻恥
悦悅
悮悞
怅悵
闷悶
恶惡
恼惱
恽惲
恻惻
爱愛
惬愜
悫愨
怆愴
恺愷
忾愾
栗<慄
态態
愠慍
惨慘
惭慚
恸慟
惯慣
怄慪
怂慫
虑慮
悭慳
庆慶
㥪慺
忧憂
惫憊
㤭憍
怜<憐
凭憑
愦憒
慭憖
惮憚
愤憤
悯憫
怃憮
宪憲
忆憶
恳懇
应應
怿懌
懔懍
怼懟
懑懣
㤽懤
㤖懧
恹懨
惩懲
懒懶
怀<懷
悬懸
忏<懺
惧懼
慑懾
恋戀
戆戇
戋戔
戗戧
戬戩
战戰
戯戱
戏戲
户戶
抛拋
捝挩
挟挾
舍<捨
扪捫
扫掃
抡掄
㧏掆
挜掗
挣掙
挂<掛
拣揀
扬揚
换換
挥揮
损損
摇搖
捣搗
揾搵
抢搶
掴摑
掼摜
搂摟
挚摯
抠摳
抟摶
掺摻
捞撈
挦撏
撑撐
挠撓
㧑撝
挢撟
掸撣
拨撥
抚撫
扑<撲
揿撳
挞撻
挝撾
捡撿
拥擁
掳擄
择擇
击擊
挡擋
㧟擓
担擔
据<據
挤擠
㧛擥
拟擬
摈擯
拧擰
搁擱
掷擲
扩擴
撷擷
摆擺
擞擻
撸擼
㧰擽
扰<擾
摅攄
撵攆
拢攏
拦攔
撄攖
搀攙
撺攛
携攜
摄攝
攒攢
挛攣
摊攤
搅攪
揽攬
败敗
叙敘
敌敵
数數
敛斂
毙斃
敩斆
斓斕
斩斬
断斷
于<>於
时時
晋晉
昼晝
晕暈
晖暉
旸暘
畅暢
暂暫
晔曄
历歷曆
昙曇
晓曉
向<曏
暧曖
旷曠
昽曨
晒<曬
书書
会會
胧朧
东東
栅柵
杆<桿
栀梔
枧梘
条條
枭梟
棁梲
弃棄
枨棖
枣棗
栋棟
㭎棡
栈棧
栖<棲
梾棶
桠椏
㭏椲
杨楊
枫楓
桢楨
业業
极<極
杩榪
荣榮
榅榲
桤榿
构<構
枪槍
梿槤
椠槧
椁槨
椮槮
桨槳
椢槶
椝槼
桩樁
乐樂
枞樅
楼樓
标標
枢樞
㭤樢
样樣
㭴樫
桪樳
朴<樸
树樹
桦樺
椫樿
桡橈
桥橋
机<機
椭橢
横橫
檩檁
柽檉
档檔
桧檜
槚檟
检檢
樯檣
梼檮
台<颱臺檯
槟檳
柠檸
槛檻
柜<櫃
橹櫓
榈櫚
栉櫛
椟櫝
橼櫞
栎櫟
橱櫥
槠櫧
栌櫨
枥櫪
橥櫫
榇櫬
蘖櫱
栊櫳
榉櫸
樱櫻
栏欄
权權
椤欏
栾欒
榄欖
棂欞
钦欽
欧歐
欤歟
欢歡
岁歲
归歸
殁歿
残殘
殒殞
殇殤
㱮殨
殚殫
殓殮
殡殯
㱩殰
歼殲
杀殺
壳殼
毁毀
殴毆
毵毿
牦氂
毡氈
氇氌
气<氣
氢氫
氩氬
氲氳
决決
没沒
冲衝沖
况況
汹洶
浃浹
泾涇
凉涼
泪淚
渌淥
沦淪
渊淵
涞淶
浅淺
涣渙
减減
沨渢
涡渦
测測
浑渾
凑湊
浈湞
汤湯
沩溈
准<準
沟溝
温溫
浉溮
涢溳
沧滄
灭滅
涤滌
荥滎
沪滬
滞滯
渗滲
浒滸
浐滻
滚滾
满滿
渔漁
溇漊
沤漚
汉漢
涟漣
渍漬
涨漲
溆漵
渐漸
浆漿
颍潁
泼潑
洁<潔
㴋潚
潜潛
润潤
浔潯
溃潰
滗潷
涠潿
涩澀
浇澆
涝澇
涧澗
渑澠
泽澤
滪澦
泶澩
浍澮
淀<澱
㳠澾
浊濁
浓濃
㳡濄
湿濕
泞<濘
溁濚
浕濜
济濟
涛濤
㳔濧
滥濫
潍濰
滨濱
溅濺
泺濼
滤濾
澛瀂
滢瀅
渎瀆
㲿瀇
泻瀉
沈<瀋
浏瀏
濒瀕
泸瀘
沥瀝
潇瀟
潆瀠
潴瀦
泷瀧
濑瀨
㳽瀰
潋瀲
澜瀾
沣灃
滠灄
洒<灑
漓<灕
滩灘
灏灝
漤灠
㳕灡
湾灣
滦灤
滟灧
灾災
为為
乌烏
烃烴
无無
炼煉
炜煒
烟煙
茕煢
焕煥
烦煩
炀煬
㶽煱
煴熅
荧熒
炝熗
热熱
颎熲
炽熾
烨燁
灯燈
烧燒
烫燙
焖燜
营營
灿燦
烛燭
烩燴
㶶燶
烬燼
焘燾
烁爍
炉爐
烂爛
争爭
爷爺
尔爾
墙牆
牍牘
牵牽
荦犖
犊犢
牺犧
状狀
狭狹
狈狽
狰猙
犹猶
狲猻
犸獁
狱獄
狮獅
奖獎
独獨
狯獪
猃獫
狝獮
狞獰
㺍獱
获穫獲
猎獵
犷獷
兽獸
獭獺
献獻
猕獼
猡玀
现現
珐琺
珲琿
玮瑋
玚瑒
琐瑣
瑶瑤
莹瑩
玛瑪
玱瑲
琏璉
琎璡
玑璣
瑷璦
珰璫
㻅璯
环環
玙璵
瑸璸
玺璽
琼瓊
珑瓏
璎瓔
瓒瓚
瓯甌
产產
亩畝
毕畢
画畫
异<異
畴疇
叠疊
痉痙
疴痾
痖瘂
疯瘋
疡瘍
痪瘓
瘗瘞
疮瘡
疟瘧
瘆瘮
疭瘲
瘘瘺
疗療
痨癆
痫癇
瘅癉
疠癘
瘪癟
痒<癢
疖癤
症<癥
疬癧
癞癩
癣癬
瘿癭
瘾癮
痈癰
瘫癱
癫癲
发髮發
皑皚
疱皰
皲皸
皱皺
盗盜
盏盞
监監
盘盤
卢盧
荡蕩盪
眦眥
众眾
困<睏
睁睜
睐睞
眍瞘
䁖瞜
瞒瞞
瞆瞶
睑瞼
眬矓
瞩矚
矫矯
硁硜
硖硤
砗硨
砚硯
硕碩
砀碭
砜碸
确<確
码碼
䂵碽
硙磑
砖磚
硵磠
碜磣
碛磧
矶磯
硗磽
䃅磾
硚礄
硷鹼礆
础礎
碍礙
矿礦
砺礪
砾礫
矾礬
砻礱
禄祿
祸禍
祯禎
祎禕
祃禡
御<禦
禅禪
礼禮
祢禰
祷禱
秃禿
籼秈
税稅
秆稈
䅉稏
禀稟
种<種
称稱
谷<穀
䅟穇
稣穌
积積
颖穎
秾穠
穑穡
秽穢
稳穩
稆穭
窝窩
洼<窪
穷窮
窑窯
窎窵
窭窶
窥窺
窜竄
窍竅
窦竇
窃竊
竞競
笔筆
笋筍
笕筧
䇲筴
笺箋
筝箏
节節
范<範
筑<築
箧篋
筼篔
笃篤
筛篩
筚篳
箦簀
篓簍
箪簞
简簡
篑簣
箫簫
筜簹
签簽
帘<簾
篮籃
筹籌
䉤籔
箓籙
篯籛
箨籜
籁籟
笼籠
笾籩
簖籪
篱<籬
箩籮
粤粵
糁糝
粪糞
粮糧
粝糲
籴糴
粜糶
纟糹
纠糾
纪紀
纣紂
约約
红紅
纡紆
纥紇
纨紈
纫紉
纹紋
纳納
纽紐
纾紓
纯純
纰紕
纼紖
纱紗
纮紘
纸紙
级級
纷紛
纭紜
纴紝
纺紡
䌷紬
细細
绂紱
绁紲
绅紳
纻紵
绍紹
绀紺
绋紼
绐紿
绌絀
终終
组組
䌹絅
绊絆
绗絎
结結
绝絕
绦縧絛
绔絝
绞絞
络絡
绚絢
给給
绒絨
绖絰
统統
丝絲
绛絳
绢絹
绑綁
绡綃
绠綆
绨綈
绤綌
绥綏
䌼綐
经經
综綜
缍綞
绿綠
绸綢
绻綣
绶綬
维維
绹綯
绾綰
纲綱
网<網
缀綴
䌽綵
纶綸
绺綹
绮綺
绽綻
绰綽
绫綾
绵綿
绲緄
缁緇
紧緊
绯緋
绪緒
绬緓
绱鞝緔
缃緗
缄緘
缂緙
线線
缉緝
缎緞
缔締
缗緡
缘緣
缌緦
编編
缓緩
缅緬
纬緯
缑緱
缈緲
练練
缏緶
缇緹
致<緻
萦縈
缙縉
缢縊
缒縋
绉縐
缣縑
缊縕
缞縗
缚縛
缜縝
缟縞
缛縟
县縣
缝縫
缡縭
缩縮
纵縱
缧縲
䌸縳
缦縵
絷縶
缕縷
缥縹
总總
绩績
绷繃
缫繅
缪繆
缯繒
织織
缮繕
缭繚
绕繞
绣繡
缋繢
绳繩
绘繪
茧<繭
缰韁繮
缳繯
缲繰
缴繳
䍁繸
绎繹
继繼
缤繽
缱繾
䍀繿
颣纇
缬纈
纩纊
续續
累<纍
缠纏
缨纓
纤纖
缵纘
缆纜
钵缽
罂罌
罚罰
骂罵
罢罷
罗羅
罴羆
羁羈
芈羋
羟羥
义義
习習
翚翬
翘翹
翙翽
耧耬
耢耮
圣<聖
闻聞
联聯
聪聰
声聲
耸聳
聩聵
聂聶
职職
聍聹
听<聽
聋聾
肃肅
胁脅
脉脈
胫脛
脱脫
胀脹
肾腎
胨腖
脶腡
脑腦
肿腫
脚腳
肠腸
腽膃
腘膕
肤膚
䏝膞
胶膠
腻膩
胆膽
脍膾
脓膿
䐪臇
脸臉
脐臍
膑臏
腊<臘
胪臚
脏髒臟
脔臠
臜臢
临臨
与<與
兴興
举舉
旧舊
舱艙
舣艤
舰艦
舻艫
艰艱
艳艷
刍芻
苎苧
兹茲
荆荊
庄<莊
茎莖
荚莢
苋莧
华華
苌萇
莱萊
万<萬
荝萴
莴萵
叶葉
荭葒
着>著
荮葤
苇葦
荤葷
莳蒔
莅蒞
苍蒼
荪蓀
盖蓋
莲蓮
苁蓯
莼蓴
荜蓽
蒌蔞
蒋蔣
葱蔥
茑蔦
荫蔭
荨蕁
蒇蕆
荞蕎
荬蕒
芸<蕓
莸蕕
荛蕘
蒉蕢
芜蕪
萧蕭
蓣蕷
蕰薀
荟薈
蓟薊
芗薌
蔷薔
荙薘
莶薟
荐<薦
萨薩
䓕薳
苧<薴
䓓薵
荠薺
蓝藍
荩藎
艺藝
药藥
薮藪
苈藶
蔼藹
蔺藺
萚蘀
蕲蘄
芦蘆
苏蘇
蕴蘊
苹<蘋
藓蘚
蔹蘞
茏蘢
兰蘭
蓠蘺
萝蘿
蔂<虆
处處
虚虛
虏虜
号號
亏虧
虬虯
蛱蛺
蜕蛻
蚬蜆
蚀蝕
猬蝟
虾蝦
蜗蝸
蛳螄
蚂螞
萤螢
䗖螮
蝼螻
螀螿
蛰蟄
蝈蟈
螨蟎
虮<蟣
蝉蟬
蛲蟯
虫<蟲
蛏蟶
蚁蟻
蚃蠁
蝇蠅
虿蠆
蛴蠐
蝾蠑
蜡<蠟
蛎蠣
蟏蠨
蛊蠱
蚕<蠶
蛮蠻
术術
同<衕
胡<鬍衚
卫衛
衮袞
袅裊
补補
装裝
里<裡
制<製
裈褌
袆褘
裤褲
裢褳
褛褸
亵褻
裥襇
褝襌
袯襏
袄襖
裣襝
裆襠
褴襤
袜襪
䙓襬
衬襯
袭襲
襕襴
见見
觃覎
规規
觅覓
视視
觇覘
觋覡
觍覥
觎覦
亲親
觊覬
觏覯
觐覲
觑覷
觉覺
览覽
觌覿
观觀
觞觴
觯觶
触<觸
讠訁
订訂
讣訃
计計
讯訊
讧訌
讨討
讦訐
讱訒
训訓
讪訕
讫訖
讬託
记記
讹訛
讶訝
讼訟
䜣訢
诀訣
讷訥
讻訩
访訪
设設
许許
诉訴
诃訶
诊診
注<註
诂詁
诋詆
讵詎
诈詐
诒詒
诏詔
评評
诐詖
诇詗
诎詘
诅詛
词詞
咏詠
诩詡
询詢
诣詣
试試
诗詩
诧詫
诟詬
诡詭
诠詮
诘詰
话話
该該
详詳
诜詵
诙詼
诖詿
诔誄
诛誅
诓誆
夸<誇
志<誌
认認
诳誑
诶誒
诞誕
诱誘
诮誚
语語
诚誠
诫誡
诬誣
误誤
诰誥
诵誦
诲誨
说說
谁誰
课課
谇誶
诽誹
谊誼
訚誾
调調
谄諂
谆諄
谈談
诿諉
请請
诤諍
诹諏
诼諑
谅諒
论論
谂諗
谀諛
谍諜
谞諝
谝諞
诨諢
谔諤
谛諦
谐諧
谏諫
谕諭
谘諮
讳諱
谙諳
谌諶
讽諷
诸諸
谚諺
谖諼
诺諾
谋謀
谒謁
谓謂
誊謄
诌謅
谎謊
谜謎
谧謐
谑謔
谡謖
谤謗
谦謙
谥謚
讲講
谢謝
谣謠
谟謨
谪謫
谬謬
谫譾謭
讴謳
谨謹
谩謾
证證
谲譎
讥譏
谮譖
识識
谯譙
谭譚
谱譜
谵譫
译譯
议議
谴譴
护護
诪譸
䛓譼
誉譽
读讀
谉讅
变變
詟讋
䜩讌
雠讎
谗讒
让讓
谰讕
谶讖
谠讜
谳讞
岂豈
竖豎
丰<豐
猪豬
豮豶
猫貓
䝙貙
贝貝
贞貞
贠貟
负負
财財
贡貢
贫貧
货貨
贩販
贪貪
贯貫
责責
贮貯
贳貰
赀貲
贰貳
贵貴
贬貶
买買
贷貸
贶貺
费費
贴貼
贻貽
贸貿
贺賀
贲賁
赂賂
赁賃
贿賄
赅賅
资資
贾賈
贼賊
赈賑
赊賒
宾賓
赇賕
赒賙
赉賚
赐賜
赏賞
赔賠
赓賡
贤賢
卖賣
贱賤
赋賦
赕賧
质質
账賬
赌賭
䞐賰
赖賴
赗賵
赚賺
赙賻
购購
赛賽
赜賾
贽贄
赘贅
赟贇
赠贈
赞贊
赝贗贋
赡贍
赢贏
赆贐
赃贓
赑贔
赎贖
赣贛
赪赬
赶<趕
赵趙
趋趨
趱趲
迹跡
践踐
踊<踴
跄蹌
跸蹕
蹒蹣
踪蹤
跷蹺
跶躂
趸躉
踌躊
跻躋
跃躍
䟢躎
踯躑
跞躒
踬躓
蹰躕
跹躚
蹑躡
蹿躥
躜躦
躏躪
躯軀
车車
轧軋
轨軌
军軍
轪軑
轩軒
轫軔
轭軛
软軟
轷軤
轸軫
轱軲
轴軸
轵軹
轺軺
轲軻
轶軼
轼軾
较較
辂輅
辁輇
辀輈
载載
轾輊
辄輒
挽<輓
辅輔
轻輕
辆輛
辎輜
辉輝
辋輞
辍輟
辊輥
辇輦
辈輩
轮輪
辌輬
辑輯
辏輳
输輸
辐輻
辗輾
舆輿
辒轀
毂轂
辖轄
辕轅
辘轆
转轉
辙轍
轿轎
辚轔
轰轟
辔轡
轹轢
轳轤
办辦
辞辭
辫辮
辩辯
农農
迳逕
这這
连連
进進
运運
过過
达達
违違
遥遙
逊遜
递遞
远遠
适<適
迟遲
迁遷
选選
遗遺
辽遼
迈邁
还還
迩邇
边邊
逻邏
逦邐
郏郟
邮郵
郓鄆
乡鄉
邹鄒
邬鄔
郧鄖
邓鄧
郑鄭
邻鄰
郸鄲
邺鄴
郐鄶
邝鄺
酂酇
郦酈
丑<醜
酝醞
医醫
酱醬
酦醱
酿釀
衅釁
酾釃
酽釅
释釋
厘<釐
钅釒
钆釓
钇釔
钌釕
钊釗
钉釘
钋釙
针針
钓釣
钐釤
钏釧
钒釩
钗釵
钍釷
钕釹
钎釺
䥺釾
钯鈀
钫鈁
钘鈃
钭鈄
钚鈈
钠鈉
钝鈍
钩鉤鈎
钤鈐
钣鈑
钑鈒
钞鈔
钮鈕
钧鈞
钙鈣
钬鈥
钛鈦
钪鈧
铌鈮
铈鈰
钶鈳
铃鈴
钴鈷
钹鈸
铍鈹
钰鈺
钸鈽
铀鈾
钿鈿
钾鉀
钜鉅
铊鉈
铉鉉
铇鉋
铋鉍
铂鉑
钷鉕
钳鉗
铆鉚
铅鉛
钺鉞
钲鉦
鿭鑈鉨
钼鉬
钽鉭
铏鉶
铰鉸
铒鉺
铬鉻
铪鉿
银銀
铳銃
铜銅
铚銍
铣銑
铨銓
铢銖
铭銘
铫銚
铦銛
衔銜
铑銠
铷銣
铱銥
铟銦
铵銨
铥銩
铕銪
铯銫
铐銬
铞銱
锐銳
销銷
锈鏽銹
锑銻
锉銼
铝鋁
锒鋃
锌鋅
钡鋇
铤鋌
铗鋏
锋鋒
铻鋙
锊鋝
锓鋟
铘鋣
锄鋤
锃鋥
锔鋦
锇鋨
铓鋩
铺鋪
铖鋮
锆鋯
锂鋰
铽鋱
锍鋶
锯鋸
钢鋼
锞錁
录錄
锖錆
锫錇
锩錈
铔錏
锥錐
锕錒
锟錕
锤錘
锱錙
铮錚
锛錛
锬錟
锭錠
锜錡
钱錢
锦錦
锚錨
锠錩
锡錫
锢錮
错錯
锰錳
表<錶
铼錸
锝鍀
锨鍁
锪鍃
钔鍆
锴鍇
锳鍈
锅鍋
镀鍍
锷鍔
铡鍘
钖鍚
锻鍛
锽鍠
锸鍤
锲鍥
锘鍩
锹鍬
锾鍰
键鍵
锶鍶
锗鍺
钟鐘鍾
镁鎂
锿鎄
镅鎇
镑鎊
镕鎔
锁鎖
镉鎘
镈鎛
镃鎡
钨鎢
蓥鎣
镏鎦
铠鎧
铩鎩
锼鎪
镐鎬
镇鎮
镒鎰
镋鎲
镍鎳
镓鎵
鿔鎶
镎鎿
镞鏃
镟鏇
链鏈
镆鏌
镙鏍
镠鏐
镝鏑
铿鏗
锵鏘
镗鏜
镘鏝
镛鏞
铲鏟
镜鏡
镖鏢
镂鏤
錾鏨
镚鏰
铧鏵
镤鏷
镪鏹
䥽鏺
铙鐃
铴鐋
镣鐐
铹鐒
镦鐓
镡鐔
镫鐙
镢鐝
镨鐠
䦅鐥
锎鐦
锏鐧
镄鐨
镌鐫
镰鐮
䦃鐯
镯鐲
镭鐳
铁鐵
镮鐶
铎鐸
铛鐺
镱鐿
铸鑄
镬鑊
镔鑌
鉴鑒
镲鑔
锧鑕
镴鑞
铄鑠
镳鑣
镥鑥
镧鑭
钥鑰
镵鑱
镶鑲
镊鑷
镩鑹
锣鑼
钻鑽
銮鑾
凿鑿
䦆钁
长長
门門
闩閂
闪閃
闫閆
闬閈
闭閉
开開
闶閌
闳閎
闰閏
闲閒閑
间間
闵閔
闸閘
阂閡
阁閣
阀閥
闺閨
闽閩
阃閫
阆閬
闾閭
阅閱
阊閶
阉閹
阎閻
阏閼
阍閽
阈閾
阌閿
阒闃
板<闆
闱闈
阔闊
阕闋
阑闌
阇闍
阗闐
阘闒
闿闓
阖闔
阙闕
闯闖
关關
阚闞
阓闠
阐闡
辟<闢
阛闤
闼闥
坂>阪
陉陘
陕陝
阵陣
阴陰
陈陳
陆陸
阳陽
陧隉
队隊
阶階
陨隕
际際
随隨
险險
陦隯
隐隱
陇隴
隶隸
只<隻
隽雋
虽雖
双雙
雏雛
杂雜
鸡雞
离<離
难難
云<雲
电電
霡霢
雾霧
霁霽
雳靂
霭靄
叇靆
灵靈
叆靉
靓靚
静靜
䩄靦
靥靨
鼗鞀
巩鞏
鞒鞽
鞑韃
鞯韉
韦韋
韧韌
韨韍
韩韓
韪韙
韬韜
韫韞
韵韻
响響
页頁
顶頂
顷頃
项項
顺順
顸頇
须鬚須
顼頊
颂頌
颀頎
颃頏
预預
顽頑
颁頒
顿頓
颇頗
领領
颌頜
颉頡
颐頤
颏頦
头頭
颒頮
颊頰
颋頲
颕頴
颔頷
颈頸
颓頹
频頻
颗顆
题題
额額
颚顎
颜顏
颙顒
颛顓
愿<願
颡顙
颠顛
类類
颟顢
颢顥
顾顧
颤顫
颥顬
显顯
颦顰
颅顱
颞顳
颧顴
风風
飐颭
飑颮
飒颯
刮<颳
飓颶
飔颸
飏颺
飖颻
飕颼
飗飀
飘飄
飙飆
飚飈
飞飛
饣飠
饥飢
饤飣
饦飥
饨飩
饪飪
饫飫
饬飭
饭飯
饮飲
饴飴
饲飼
饱飽
饰飾
饳飿
饺餃
饸餄
饼餅
饷餉
养養
饵餌
饹餎
饻餏
饽餑
馁餒
饿餓
馂餕
饾餖
余<餘
肴<餚
馄餛
馃餜
饯餞
馅餡
馆館
糇餱
饧餳
馉餶
馇餷
馎餺
饩餼
馏餾
馊餿
馌饁
馍饃
馒饅
馐饈
馑饉
馓饊
馈饋
馔饌
饶饒
飨饗
餍饜
馋饞
馕饢
马馬
驭馭
冯馮
驮馱
驰馳
驯馴
驲馹
驳駁
驻駐
驽駑
驹駒
驵駔
驾駕
骀駘
驸駙
驶駛
驼駝
驷駟
骈駢
骇駭
骃駰
骆駱
骎駸
骏駿
骋騁
骍騂
骓騅
骔騌
骒騍
骑騎
骐騏
骛騖
骗騙
骙騤
䯄騧
骞騫
骘騭
骝騮
腾騰
驺騶
骚騷
骟騸
骡騾
蓦驀
骜驁
骖驂
骠驃
骢驄
驱驅
骅驊
骕驌
骁驍
骣驏
骄驕
验驗
惊<驚
驿驛
骤驟
驴驢
骧驤
骥驥
骦驦
骊驪
骉驫
肮<骯
髅髏
体<體
髌髕
髋髖
松<鬆
鬓鬢
斗<鬥
闹鬧
阋鬩
阄鬮
郁<鬱
鬶鬹
魉魎
魇魘
鱼魚
鱽魛
鱾魢
鲀魨
鲁魯
鲂魴
鱿魷
鲄魺
鲅鮁
鲆鮃
鲌鮊
鲉鮋
鲏鮍
鲇鮎
鲐鮐
鲍鮑
鲋鮒
鲊鮓
鲒鮚
鲘鮜
鲕鮞
䲟鮣
鲖鮦
鲔鮪
鲛鮫
鲑鮭
鲜鮮
鲓鮳
鲪鮶
鲝鮺
鲧鯀
鲠鯁
鲩鯇
鲤鯉
鲨鯊
鲬鯒
鲻鯔
鲯鯕
鲭鯖
鲞鯗
鲷鯛
鲴鯝
鲱鯡
鲵鯢
鲲鯤
鲳鯧
鲸鯨
鲮鯪
鲰鯫
鲶鯰
鲺鯴
鳀鯷
鲫鯽
鳊鯿
鳈鰁
鲗鰂
鳂鰃
䲠鰆
鲽鰈
鳇鰉
䲡鰌
鳅鰍
鲾鰏
鳄鱷鰐
鳆鰒
鳃鰓
鳒鰜
鳑鰟
鳋鰠
鲥鰣
鳏鰥
䲢鰧
鳎鰨
鳐鰩
鳍鰭
鳁鰮
鲢鰱
鳌鰲
鳓鰳
鳘鰵
鲦鰷
鲣鰹
鲹鰺
鳗鰻
鳛鰼
鳔鰾
鳉鱂
鳙鱅
鳕鱈
鳖鱉
鳟鱒
鳝鱔
鳜鱖
鳞鱗
鲟鱘
鲼鱝
鲎鱟
鲙鱠
鳣鱣
鳡鱤
鳢鱧
鲿鱨
鲚鱭
鳠鱯
鲈鱸
鲡鱺
鸟鳥
凫鳧
鸠鳩
鸤鳲
凤鳳
鸣鳴
鸢鳶
䴓鳾
鸩鴆
鸨鴇
鸦鴉
鸰鴒
鸵鴕
鸳鴛
鸲鴝
鸮鴞
鸱鴟
鸪鴣
鸯鴦
鸭鴨
鸸鴯
鸹鴰
鸻鴴
䴕鴷
鸿鴻
鸽鴿
䴔鵁
鸺鵂
鸼鵃
鹀鵐
鹃鵑
鹆鵒
鹁鵓
鹈鵜
鹅鵝
鹄鵠
鹉鵡
鹌鵪
鹏鵬
鹐鵮
鹎鵯
鹊鵲
鹓鵷
鹍鵾
䴖鶄
鸫鶇
鹑鶉
鹒鶊
鹋鶓
鹙鶖
鹕鶘
鹗鶚
鹖鶡
鹛鶥
鹜鶩
䴗鶪
鸧鶬
莺鶯
鹟鶲
鹤鶴
鹠鶹
鹡鶺
鹘鶻
鹣鶼
鹚鷀
鹢鷁
鹞鷂
䴘鷉鷈
鹝鷊
鹧鷓
鹥鷖
鸥鷗
鸷鷙
鹨鷚
鸶鷥
鹪鷦
鹔鷫
鹩鷯
鹫鷲
鹇鷳
鹬鷸
鹰鷹
鹭鷺
鸴鷽
䴙鸊鷿
㶉鸂
鹯鸇
鹱鸌
鹲鸏
鸬鸕
鹴鸘
鹦鸚
鹳鸛
鹂鸝
鸾鸞
卤鹵
咸<鹹
鹾鹺
盐鹽
丽麗
麦麥
麸麩
曲<麯
麹>麴
面<麵
黄黃
黉黌
点點
党<黨
黪黲
黡黶
黩黷
黾黽
鼋黿
鼍鼉
鼹鼴
齐齊
斋齋
赍齎
齑齏
齿齒
龀齔
龁齕
龂齗
龅齙
龇齜
龃齟
龆齠
龄齡
出<齣
龈齦
龊齪
龉齬
龋齲
腭齶
龌齷
龙龍
厐龎
庞龐
䶮龑
龚龔
龛龕
龟龜
䜤鿁
䲤鿐
鿓鿒`;

    const mapping=sc2tc.split(/\r?\n/);
    mapping.push('“「');
    mapping.push('‘『');
    mapping.push('”」');
    mapping.push('’』');
    /*
    伪=偽僞   //對應兩個繁體字
    㐷=傌     //gb 與 big5 一對一 (繁體無㐷字)
    杰~傑     //繁體有「杰」字
    */


    const overwrite= 
    {"获":"獲穫","缰":"繮韁","赝":"贋贗","伪":"僞偽","汇":"匯彙","坛":"壇罈","台":"臺颱檯"
    ,"冲":"沖衝","硷":"礆鹼","绱":"緔鞝","脏":"臟髒","谫":"謭譾","钩":"鈎鉤","鿭":"鉨鑈",
    "锈":"銹鏽","闲":"閑閒", "须":"須鬚", "鳄":"鰐鱷"};
    const t2s={}, t2s_unsafe1={} ,  s2t={};
    mapping.forEach((line,idx)=>{
    	const r=line.match(/(.)(<?)(.+)/u);
    	if (!r) throw 'wrong data format '+idx
    	let [m,sc, op,tc]=r;
    	let oldtc=tc;
    	if (overwrite[sc]) tc=overwrite[sc];

    	if (op=='') {
    		if (tc.length==1) {//完美一對一 //左邊的字只有gb收，右邊只有big5收
    			t2s[tc]=sc;
    		} else {
    			if (tc[0]=='>') { //只有4個   着>著 , 坂>阪
    				t2s_unsafe1[tc.substring(1)]=sc; 
    			} else {  //假設只有
    				//历歷曆  , 发髮發 , 脏臟髒
    				t2s[tc[0]] = sc;        //第一個繁體可以安全轉到簡體
    				tc=tc.substring(1);
    				for (let i=0;i<tc.length;i++) { //目前只有一個
    					const cp=tc.codePointAt(i); //考慮未來 surrogate
    					if (!cp) break;
    					t2s_unsafe1[String.fromCodePoint(cp)] =sc ;
    				} 
    			}
    		}
    	} else { 
    		if (tc.length==1) {  // 圣聖  听聽  同衕  云雲  松鬆  体體  咸鹹
    			t2s_unsafe1[tc] = sc;  //簡字也在big5中
    		} else {      
    			while (tc&&tc[0]!=='>') {//干幹>乾  台臺<颱檯 
    				//接受 幹=>干 ,臺=>台 
    				const ch=String.fromCodePoint(tc.codePointAt(0));
    				t2s_unsafe1[ ch ] = sc;
    				tc=tc.substring(ch.length);
    			}
    			//最後剩六組  干乾  后後  复覆 征徵  于於  么幺麽
    			//繁體都收，不轉換
    		}
    	}
    	tc=oldtc.replace(/\>/g,'');
    	if (op=='<') {
    		s2t[sc]=tc.replace(sc,'')+sc; //簡字也可能是繁字 ， 簡字「面」 可能是繁字的「麵」或「面」
    	} else s2t[sc]=tc;
    });

    //one character word is skipped
    'the,this,these,must,we,them,out,of,is,but,or,with,to,by,on,he,it,for,an,not,as,if,his,her,she,can,do,also,than,then,have,has,had,at,they,from,will,no,so,in,all,that,be,been,between,only,was,were,us,up,while,more,very,some,other,such,which,under,against,what,who,why,would,their,and,are,our,over,its,'.split(',').sort(alphabetically);

    /*
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt')
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      // showInstallPromotion();
      // Optionally, send analytics event that PWA install promo was shown.
      console.log(`'beforeinstallprompt' event was fired.`);
    });

    export async  function installPWA(){
      // Hide the app provided install promotion
    //   hideInstallPromotion();
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      // Optionally, send analytics event with outcome of user choice
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      deferredPrompt = null;
    };
    */
    window.addEventListener('appinstalled', () => {
        // Hide the app-provided install promotion
        // hideInstallPromotion();
        // Clear the deferredPrompt so it can be garbage collected
        // deferredPrompt = null;
        // Optionally, send analytics event to indicate successful install
        console.log('PWA was installed');
      });

    function getPWADisplayMode() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (document.referrer.startsWith('android-app://')) {
          return 'twa';
        } else if (navigator.standalone || isStandalone) {
          return 'standalone';
        }
        return 'browser';
    }
    function registerServiceWorker(swfn="./sw.js"){
      const p=document.location.protocol;
      const h=document.location.hostname;
      const localhost= p=='http:' && (h=='127.0.0.1' || h=='localhost');
      if ("serviceWorker" in navigator && (localhost||p=='https:') ) {
        navigator.serviceWorker.register(swfn);
      }
    }

    /* src\app.svelte generated by Svelte v3.42.4 */
    const file = "src\\app.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    // (49:0) {:else}
    function create_else_block(ctx) {
    	let input;
    	let t0;
    	let br0;
    	let t1;
    	let favorite;
    	let updating_value;
    	let t2;
    	let span0;
    	let t4;
    	let span1;
    	let t6;
    	let t7;
    	let br1;
    	let t8;
    	let t9;
    	let t10;
    	let br2;
    	let t11;
    	let span2;
    	let t13;
    	let previous_key = /*value*/ ctx[0];
    	let key_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function favorite_value_binding(value) {
    		/*favorite_value_binding*/ ctx[17](value);
    	}

    	let favorite_props = {};

    	if (/*value*/ ctx[0] !== void 0) {
    		favorite_props.value = /*value*/ ctx[0];
    	}

    	favorite = new Favorite({ props: favorite_props, $$inline: true });
    	binding_callbacks.push(() => bind(favorite, 'value', favorite_value_binding));
    	let if_block = /*showfont*/ ctx[5] && create_if_block_2(ctx);
    	let each_value_3 = /*svgs*/ ctx[1];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*replacables*/ ctx[8];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			create_component(favorite.$$.fragment);
    			t2 = space();
    			span0 = element("span");
    			span0.textContent = "⿻";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "🗚";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			br1 = element("br");
    			t8 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			br2 = element("br");
    			t11 = space();
    			span2 = element("span");
    			span2.textContent = "👪";
    			t13 = space();
    			key_block.c();
    			key_block_anchor = empty();
    			attr_dev(input, "class", "input");
    			attr_dev(input, "maxlength", "25");
    			attr_dev(input, "placeholder", "基字或构件");
    			add_location(input, file, 49, 0, 1793);
    			add_location(br0, file, 50, 0, 1865);
    			attr_dev(span0, "title", "Frame 字框");
    			toggle_class(span0, "selected", /*frame*/ ctx[2]);
    			add_location(span0, file, 52, 0, 1896);
    			attr_dev(span1, "title", "Font 字型");
    			attr_dev(span1, "class", "clickable");
    			toggle_class(span1, "selected", /*showfont*/ ctx[5]);
    			add_location(span1, file, 53, 0, 1980);
    			add_location(br1, file, 59, 0, 2240);
    			add_location(br2, file, 66, 0, 2459);
    			attr_dev(span2, "title", "Members and Derived 成员及孳乳");
    			toggle_class(span2, "selected", /*showinfo*/ ctx[3]);
    			add_location(span2, file, 67, 0, 2466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(favorite, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t8, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert_dev(target, t9, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t10, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, span2, anchor);
    			insert_dev(target, t13, anchor);
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[16]),
    					listen_dev(span0, "click", /*click_handler_1*/ ctx[18], false, false, false),
    					listen_dev(span1, "click", /*click_handler_2*/ ctx[19], false, false, false),
    					listen_dev(span2, "click", /*click_handler_5*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			const favorite_changes = {};

    			if (!updating_value && dirty[0] & /*value*/ 1) {
    				updating_value = true;
    				favorite_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			favorite.$set(favorite_changes);

    			if (dirty[0] & /*frame*/ 4) {
    				toggle_class(span0, "selected", /*frame*/ ctx[2]);
    			}

    			if (dirty[0] & /*showfont*/ 32) {
    				toggle_class(span1, "selected", /*showfont*/ ctx[5]);
    			}

    			if (/*showfont*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(t7.parentNode, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*pinxUnits, toPNG, svgs*/ 6146) {
    				each_value_3 = /*svgs*/ ctx[1];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(t9.parentNode, t9);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty[0] & /*replaceComp, replacables*/ 8448) {
    				each_value_2 = /*replacables*/ ctx[8];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t10.parentNode, t10);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*showinfo*/ 8) {
    				toggle_class(span2, "selected", /*showinfo*/ ctx[3]);
    			}

    			if (dirty[0] & /*value*/ 1 && safe_not_equal(previous_key, previous_key = /*value*/ ctx[0])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(favorite.$$.fragment, local);
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(favorite.$$.fragment, local);
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			destroy_component(favorite, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t6);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t8);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(49:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:0) {#if testbench}
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
    		source: "(46:0) {#if testbench}",
    		ctx
    	});

    	return block;
    }

    // (55:0) {#if showfont}
    function create_if_block_2(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*fontfaces*/ ctx[9];
    	validate_each_argument(each_value_4);
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
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*fontfaces, fontface*/ 528) {
    				each_value_4 = /*fontfaces*/ ctx[9];
    				validate_each_argument(each_value_4);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(55:0) {#if showfont}",
    		ctx
    	});

    	return block;
    }

    // (56:0) {#each fontfaces as ff}
    function create_each_block_4(ctx) {
    	let span;
    	let t0_value = /*ff*/ ctx[37] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[20](/*ff*/ ctx[37]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "clickable");
    			toggle_class(span, "selected", /*ff*/ ctx[37] == /*fontface*/ ctx[4]);
    			add_location(span, file, 56, 0, 2130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*fontfaces*/ 512 && t0_value !== (t0_value = /*ff*/ ctx[37] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*fontfaces, fontface*/ 528) {
    				toggle_class(span, "selected", /*ff*/ ctx[37] == /*fontface*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(56:0) {#each fontfaces as ff}",
    		ctx
    	});

    	return block;
    }

    // (61:0) {#each svgs as svg,idx}
    function create_each_block_3(ctx) {
    	let span;
    	let raw_value = /*svg*/ ctx[34] + "";
    	let span_title_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "title", span_title_value = /*pinxUnits*/ ctx[11][/*idx*/ ctx[36]]);
    			add_location(span, file, 61, 0, 2272);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*toPNG*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*svgs*/ 2 && raw_value !== (raw_value = /*svg*/ ctx[34] + "")) span.innerHTML = raw_value;
    			if (dirty[0] & /*pinxUnits*/ 2048 && span_title_value !== (span_title_value = /*pinxUnits*/ ctx[11][/*idx*/ ctx[36]])) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(61:0) {#each svgs as svg,idx}",
    		ctx
    	});

    	return block;
    }

    // (64:0) {#each replacables as comp}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = /*comp*/ ctx[31] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[21](/*comp*/ ctx[31]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "replacecomp");
    			add_location(span, file, 64, 0, 2376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*replacables*/ 256 && t_value !== (t_value = /*comp*/ ctx[31] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(64:0) {#each replacables as comp}",
    		ctx
    	});

    	return block;
    }

    // (77:0) {:else}
    function create_else_block_1(ctx) {
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
    	let br4;
    	let t6;
    	let h31;
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
    	let a;

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "画面说明";
    			t1 = text("\r\n1行：字表, 输入区 (单字视为构件)\r\n");
    			br0 = element("br");
    			t2 = text("2行：加入/删除最爱 , 拼形式清单 , 显示字框 , 选择字体\r\n");
    			br1 = element("br");
    			t3 = text("3行：大字形(点一下存为PNG) 替代构件清单\r\n");
    			br2 = element("br");
    			t4 = text("4行：字族按钮\r\n");
    			br3 = element("br");
    			t5 = text("5行：构件之孳乳\r\n");
    			br4 = element("br");
    			t6 = text("6~：拼形所用到的构件，点字形存为PNG，点代码列出此构件之孳乳\r\n");
    			h31 = element("h3");
    			h31.textContent = "使用说明";
    			t8 = text("\r\n基字：做为构建字形的基础字。构件：构成字形的元素。\r\n");
    			br5 = element("br");
    			t9 = text("拼形式：拼出一个字形的式子。语法是：\"基字/构件/替字\" ，替字也可以是拼形式。\r\n");
    			br6 = element("br");
    			t10 = text("输入一个单字，按字族，可得此字之孳乳，点一下将之作为基字。\r\n");
    			br7 = element("br");
    			t11 = text("选定基字之後，按一下要替换的构件，再输入替字。\r\n");
    			h32 = element("h3");
    			h32.textContent = "技术说明";
    			t13 = text("\r\n不依赖服务端，纯html+js 软件。智能识別拼形式和一般字。\r\n");
    			br8 = element("br");
    			t14 = text("本字库可生成包括Unicode A-F 的所有字形。数据量约为 4.2MB。\r\n");
    			br9 = element("br");
    			t15 = text("「汉字拼形」授权方式为ISC（可做商业用途），但目前基於以下两个GPL授权（可做商业用途但必须开源）之模块。\r\n");
    			br10 = element("br");
    			t16 = text("A. Glyphwiki.org 数据库   B. Kage(荫) 矢量笔划产生器 \r\n");
    			h33 = element("h3");
    			h33.textContent = "已知问题";
    			t18 = text("\r\n1.由於Glyphwiki造字时并没有考虑字形生成的需求，很多字的字框无法做基字，如「街圭舞」效果不理想。\r\n");
    			br11 = element("br");
    			t19 = text("2.为求字形美观，Glyphwiki 将部件拆散为笔划，这样的字无法做为基字。\r\n");
    			br12 = element("br");
    			t20 = text("3.glyphwiki是日本风格的字形库，某些细节不符合中国国家标准。\r\n");
    			br13 = element("br");
    			t21 = text("4.在稍微牺牲美观的条件下，许多字可替换成拼形式，每字可节约40B左右，理论上全CJK字库可以压缩到2.5MB~3MB，相於16x16点阵字模。\r\n");
    			br14 = element("br");
    			t22 = text("5.首次使用孳乳会花几秒钟产生反向索引。由於索引只在内存，网页重载之后必须重建。\r\n");
    			br15 = element("br");
    			t23 = space();
    			a = element("a");
    			a.textContent = "hzpx 源代码";
    			add_location(h30, file, 77, 0, 2789);
    			add_location(br0, file, 79, 0, 2825);
    			add_location(br1, file, 80, 0, 2864);
    			add_location(br2, file, 81, 0, 2894);
    			add_location(br3, file, 82, 0, 2908);
    			add_location(br4, file, 83, 0, 2923);
    			add_location(h31, file, 84, 0, 2962);
    			add_location(br5, file, 86, 0, 3004);
    			add_location(br6, file, 87, 0, 3051);
    			add_location(br7, file, 88, 0, 3087);
    			add_location(h32, file, 89, 0, 3117);
    			add_location(br8, file, 91, 0, 3165);
    			add_location(br9, file, 92, 0, 3210);
    			add_location(br10, file, 93, 0, 3271);
    			add_location(h33, file, 94, 0, 3320);
    			add_location(br11, file, 96, 0, 3390);
    			add_location(br12, file, 97, 0, 3436);
    			add_location(br13, file, 98, 0, 3478);
    			add_location(br14, file, 99, 0, 3557);
    			add_location(br15, file, 100, 0, 3604);
    			attr_dev(a, "target", "_new");
    			attr_dev(a, "href", "https://github.com/accelon/hzpx/");
    			add_location(a, file, 100, 6, 3610);
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
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, h31, anchor);
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
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(h32);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(br10);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(h33);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(br12);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(br13);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(br14);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(br15);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(77:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (70:0) {#if showinfo}
    function create_if_block_1(ctx) {
    	let t;
    	let each1_anchor;
    	let current;
    	let each_value_1 = /*derives*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*components*/ ctx[10];
    	validate_each_argument(each_value);
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

    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*derives, fontface, setBase*/ 16528) {
    				each_value_1 = /*derives*/ ctx[7];
    				validate_each_argument(each_value_1);
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
    						each_blocks_1[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*components, fontface*/ 1040) {
    				each_value = /*components*/ ctx[10];
    				validate_each_argument(each_value);
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
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
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
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(70:0) {#if showinfo}",
    		ctx
    	});

    	return block;
    }

    // (71:0) {#each derives as gid}
    function create_each_block_1(ctx) {
    	let glyph;
    	let current;

    	function func() {
    		return /*func*/ ctx[23](/*gid*/ ctx[26]);
    	}

    	glyph = new Glyph({
    			props: {
    				gid: /*gid*/ ctx[26],
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
    			if (dirty[0] & /*derives*/ 128) glyph_changes.gid = /*gid*/ ctx[26];
    			if (dirty[0] & /*fontface*/ 16) glyph_changes.fontface = /*fontface*/ ctx[4];
    			if (dirty[0] & /*derives*/ 128) glyph_changes.onclick = func;
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
    		source: "(71:0) {#each derives as gid}",
    		ctx
    	});

    	return block;
    }

    // (74:0) {#each components as gid}
    function create_each_block(ctx) {
    	let br;
    	let glyph;
    	let current;

    	glyph = new Glyph({
    			props: {
    				gid: /*gid*/ ctx[26],
    				derivable: true,
    				fontface: /*fontface*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			br = element("br");
    			create_component(glyph.$$.fragment);
    			add_location(br, file, 74, 0, 2721);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			mount_component(glyph, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const glyph_changes = {};
    			if (dirty[0] & /*components*/ 1024) glyph_changes.gid = /*gid*/ ctx[26];
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
    			if (detaching) detach_dev(br);
    			destroy_component(glyph, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(74:0) {#each components as gid}",
    		ctx
    	});

    	return block;
    }

    // (69:0) {#key value}
    function create_key_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*showinfo*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
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
    			current_block_type_index = select_block_type_1(ctx);

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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(69:0) {#key value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let span;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*testbench*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "🧪";
    			t1 = space();
    			if_block.c();
    			attr_dev(span, "class", "clickable");
    			add_location(span, file, 44, 0, 1671);
    			attr_dev(div, "class", "container");
    			add_location(div, file, 43, 0, 1646);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
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
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
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
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
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
    	registerServiceWorker();
    	let value = '邏羅寶貝𩀨從䞃致招'; //' //𠈐曳國// //汉字拼形
    	document.title = "汉字拼形-库存字形" + glyphWikiCount();

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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(6, testbench = !testbench);

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function favorite_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	const click_handler_1 = () => $$invalidate(2, frame = !frame);
    	const click_handler_2 = () => $$invalidate(5, showfont = !showfont);
    	const click_handler_3 = ff => $$invalidate(4, fontface = ff);
    	const click_handler_4 = comp => replaceComp(comp);
    	const click_handler_5 = () => $$invalidate(3, showinfo = !showinfo);
    	const func = gid => setBase(gid);

    	$$self.$capture_state = () => ({
    		onMount,
    		Glyph,
    		codePointLength,
    		TestBench: Testbench,
    		downloadSvg,
    		glyphWikiCount,
    		derivedOf,
    		ch2gid,
    		gid2ch,
    		Favorite,
    		drawPinx,
    		drawGlyph,
    		getRenderComps,
    		enumFontFace,
    		getLastComps,
    		getGlyph,
    		splitPinx,
    		getPWADisplayMode,
    		registerServiceWorker,
    		value,
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
    		derives,
    		replacables,
    		fontfaces,
    		components,
    		pinxUnits
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('svgs' in $$props) $$invalidate(1, svgs = $$props.svgs);
    		if ('frame' in $$props) $$invalidate(2, frame = $$props.frame);
    		if ('showfont' in $$props) $$invalidate(5, showfont = $$props.showfont);
    		if ('showinfo' in $$props) $$invalidate(3, showinfo = $$props.showinfo);
    		if ('size' in $$props) $$invalidate(24, size = $$props.size);
    		if ('fontface' in $$props) $$invalidate(4, fontface = $$props.fontface);
    		if ('testbench' in $$props) $$invalidate(6, testbench = $$props.testbench);
    		if ('derives' in $$props) $$invalidate(7, derives = $$props.derives);
    		if ('replacables' in $$props) $$invalidate(8, replacables = $$props.replacables);
    		if ('fontfaces' in $$props) $$invalidate(9, fontfaces = $$props.fontfaces);
    		if ('components' in $$props) $$invalidate(10, components = $$props.components);
    		if ('pinxUnits' in $$props) $$invalidate(11, pinxUnits = $$props.pinxUnits);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*value, fontface, frame*/ 21) {
    			$$invalidate(1, svgs = (getGlyph(value) ? drawGlyph : drawPinx)(value, { size, fontface, frame })); //allow mix normal char and pinxing expression
    		}

    		if ($$self.$$.dirty[0] & /*value, svgs*/ 3) {
    			if (getGlyph(value) && !Array.isArray(typeof svgs[0])) $$invalidate(1, svgs = [svgs]); //single glyph as svg array
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			$$invalidate(11, pinxUnits = splitPinx(value, true));
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			$$invalidate(10, components = getRenderComps() || []);
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			$$invalidate(8, replacables = getLastComps(value));
    		}

    		if ($$self.$$.dirty[0] & /*showinfo, value*/ 9) {
    			$$invalidate(7, derives = showinfo && codePointLength(value) == 1 && derivedOf(value, 200) || []);
    		}
    	};

    	$$invalidate(9, fontfaces = enumFontFace());

    	return [
    		value,
    		svgs,
    		frame,
    		showinfo,
    		fontface,
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
    		click_handler,
    		input_input_handler,
    		favorite_value_binding,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		func
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

}());
//# sourceMappingURL=bundle.js.map
