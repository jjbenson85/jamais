var V = Object.defineProperty;
var O = (t, e, n) => e in t ? V(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var a = (t, e, n) => (O(t, typeof e != "symbol" ? e + "" : e, n), n);
class Q {
  constructor() {
    // Use sets to remove duplicates
    a(this, "queue", /* @__PURE__ */ new Set());
    a(this, "postQueue", /* @__PURE__ */ new Set());
    a(this, "timerId");
    a(this, "processQueue", () => {
      for (const e of this.queue.keys())
        e(), this.queue.delete(e);
    });
    a(this, "processPostQueue", () => {
      for (const e of this.postQueue.keys())
        e(), this.postQueue.delete(e);
    });
  }
  add(e, n) {
    C.value && console.info("add: ", { msg: n }), this.queue.add(e), this.queue.size === 1 && queueMicrotask(this.processQueue);
  }
  addPost(e, n) {
    C.value && console.info("addPost: ", { msg: n }), this.postQueue.add(e), this.postQueue.size === 1 && setTimeout(() => {
      queueMicrotask(this.processPostQueue);
    }, 0);
  }
}
const M = new Q();
let E = null;
const C = {
  value: !1,
  get: () => C.value,
  set: (t) => {
    C.value = t;
  }
};
class N {
  constructor(e, n, s = "Signal") {
    a(this, "value");
    a(this, "previous");
    a(this, "validator");
    a(this, "subscribers", /* @__PURE__ */ new Set());
    a(this, "name");
    a(this, "validate", (e) => {
      function n(o) {
        try {
          Reflect.construct(String, [], o);
        } catch {
          return !1;
        }
        return !0;
      }
      const s = n(this.validator), r = ["String", "Number", "Boolean"].includes(
        this.validator.name
      ), i = this.validator.name.toLowerCase();
      (r ? typeof e === i : s ? e instanceof this.validator : this.validator(e)) || console.error(`${this.name} set to an invalid value: ${e}.
        Validator: ${this.validator.name || this.validator.toString()}`);
    });
    a(this, "get", () => (E !== null && (this.subscribers.add(E), E.addSubscription(this)), this.value));
    a(this, "getPrevious", () => this.previous);
    a(this, "set", (e, n) => {
      if (C.value && console.info("set", { msg: n == null ? void 0 : n.msg, newValue: e }, this), e !== this.value) {
        this.validate(e), this.previous = this.value, this.value = e;
        for (const s of this.subscribers.values())
          s.run();
        return this.value;
      }
    });
    a(this, "valueOf", () => {
      var n;
      const e = new Error();
      return console.warn(`Directly using the value of a Signal is not recommended. Use .get() instead.

     ${(n = e.stack) == null ? void 0 : n.split(`
`)[2]}`), this.value;
    });
    a(this, "update", (e, n) => (this.set(e(this.value), { force: !0, ...n }), this.value));
    a(this, "removeSubscriber", (e) => {
      this.subscribers.delete(e);
    });
    this.previous = void 0, this.validator = n, this.name = s, this.validate(e), this.value = e;
  }
}
class _ {
  constructor(e, n) {
    a(this, "effect");
    a(this, "sync");
    a(this, "msg");
    a(this, "subscriptions", /* @__PURE__ */ new Set());
    a(this, "addSubscription", (e) => {
      this.subscriptions.add(e);
    });
    a(this, "run", () => {
      const { effect: e, sync: n, msg: s } = this;
      switch (C.value && console.info("run", this), n) {
        case "sync": {
          e();
          return;
        }
        case "pre": {
          M.add(e, s);
          return;
        }
        case "post": {
          M.addPost(e, s);
          return;
        }
      }
    });
    a(this, "destroy", () => {
      for (const e of this.subscriptions)
        e.removeSubscriber(this);
    });
    var s;
    if (this.effect = e, this.sync = (n == null ? void 0 : n.sync) ?? "pre", this.msg = (n == null ? void 0 : n.msg) ?? "Effect", E = this, (s = n == null ? void 0 : n.watch) != null && s.length)
      for (const r of n.watch)
        r.get();
    else
      e();
    E = null;
  }
}
class I {
  constructor(e, n, s, r) {
    a(this, "effect");
    a(this, "sync");
    a(this, "msg");
    a(this, "subscriptions", /* @__PURE__ */ new Set());
    a(this, "addSubscription", (e) => {
      this.subscriptions.add(e);
    });
    a(this, "run", () => {
      const { effect: e, sync: n, msg: s } = this;
      switch (C.value && console.info("run", this), n) {
        case "sync": {
          e();
          return;
        }
        case "pre": {
          M.add(e, s);
          return;
        }
        case "post": {
          M.addPost(e, s);
          return;
        }
      }
    });
    a(this, "destroy", () => {
      for (const e of this.subscriptions)
        e.removeSubscriber(this);
    });
    this.effect = n, this.sync = s, this.msg = r, e.subscribers.add(this);
  }
}
const A = (t, e = () => !0, n) => new N(t, e, n), L = (t) => t instanceof N;
function k(t, e) {
  const n = (e == null ? void 0 : e.immediate) ?? !0, s = (e == null ? void 0 : e.watch) ?? [];
  if (!n && !s.length && console.error(
    "If immediate is set to false, watch must be set to an array of signals"
  ), !n && s.length) {
    const i = A(void 0);
    for (const l of s)
      new I(
        l,
        () => i.set(t()),
        "pre",
        (e == null ? void 0 : e.name) ?? "computed"
      );
    return i;
  }
  const r = A(void 0, e == null ? void 0 : e.validator, e == null ? void 0 : e.name);
  return new _(() => r.set(t()), { msg: "computed", ...e }), r;
}
const B = A("");
k(() => B.get(), {
  // immediate: true,
  // watch:[query]
});
const F = A(!1), S = A("J"), K = A(0);
k(() => F.get() ? S.get() : K.get());
S.set("JJ");
S.set("JJJ");
S.set("JJ");
S.set("JJJ");
S.set("JJ");
S.set("JJJ");
S.set("JJ");
S.set("JJJ");
const W = (t) => typeof t == "object" && t !== null;
function b(t, e, n = "Error evaluating expression") {
  return P(`return ${t}`, e, n);
}
function z(t, e, n = "Error evaluating statement") {
  P(t, e, n);
}
function P(t, e, n = "Error evaluating expression") {
  const s = { ...e, computed: k, signal: A };
  try {
    return new Function(...Object.keys(s), t)(
      ...Object.values(s)
    );
  } catch (r) {
    const i = n ? `

${n}` : "";
    console.error(
      `Error evaluating expression: ${t}${i}

`,
      r
    );
    return;
  }
}
const U = (t) => Object.entries(t).filter(([e, n]) => n).map(([e]) => e), q = (t) => t.flatMap((e) => e ? typeof e == "string" ? e : Array.isArray(e) ? q(e) : U(e) : []), G = (t) => [...new Set(q([t]))].join(" "), R = (t) => typeof t == "function", D = (t) => L(t) ? t.get() : R(t) ? t() : t, Z = {
  name: "classDirective",
  matcher: (t) => t.name === ":class",
  mounted: (t, e, n, s) => {
    const r = t.getAttribute(":class");
    let i = [];
    return () => {
      const l = i, u = b(r, s, ":class"), o = D(u);
      if (o === null) {
        console.error(`${o} can not be assigned to as a class`);
        return;
      }
      if (typeof o == "object" || typeof o == "string" || o === void 0) {
        const m = G(o).split(" ").filter(Boolean);
        i = m, l.length && t.classList.remove(...l), m.length && t.classList.add(...m);
      }
    };
  }
}, X = {
  name: "eventDirective",
  matcher: (t) => t.name.startsWith("@"),
  mounted: (t, e, n, s) => {
    const [r, i] = e.slice(1).split("."), l = (o) => b(
      n,
      { ...s, $event: o },
      `@${r}`
    ), u = (o) => {
      const m = l(o);
      typeof m == "function" && m();
    };
    i ? t.addEventListener(r, (o) => {
      o instanceof KeyboardEvent && o.key.toLowerCase() === i && u(o);
    }) : t.addEventListener(r, u);
  }
}, Y = {
  name: "forDirective",
  matcher: (t) => t.name === "j-for",
  mounted: (t, e, n, s, r) => {
    var v;
    const [i, l] = n.split(" in ").map((c) => c.trim()), u = (v = i.match(/^\[.*\]$/g)) == null ? void 0 : v.length;
    let o, m;
    if (u ? [o, m] = i.replaceAll(/[\[\]]/g, "").split(",").map((c) => c.trim()) : (o = "$index", m = i), t.removeAttribute("j-for"), !t.parentElement) {
      console.error(`j-for must be a child of an element

${t.outerHTML}`);
      return;
    }
    const g = () => {
      const c = b(l, s, "j-for"), f = D(c);
      return typeof f == "number" ? Array.from({ length: f }, (w, d) => d) : typeof f != "object" ? (console.error(`j-for expects an object, array or a number or a function that returns an object, array or number

${t.outerHTML}

        ${l} is of type ${typeof f}
        `), []) : f;
    }, j = t.parentElement;
    return t.remove(), () => {
      j.innerHTML = "";
      const c = g();
      for (const [f, p] of Object.entries(c)) {
        const w = t.cloneNode(!0);
        j.appendChild(w), x(
          w,
          {
            ...s,
            [o]: f,
            [m]: p
          },
          r
        );
      }
    };
  }
}, ee = (t, e) => {
  var r, i;
  const n = t.previousSibling, s = t.previousElementSibling;
  (n == null ? void 0 : n.textContent) === "j-if" || (n == null ? void 0 : n.textContent) === "j-else-if" || (r = s == null ? void 0 : s.hasAttribute) != null && r.call(s, "j-if") || (i = s == null ? void 0 : s.hasAttribute) != null && i.call(s, "j-else-if") || console.error(`${e} must directly follow an element with j-if or j-else-if.

        ${t.outerHTML}
    `);
}, te = (t, e, n) => {
  e === "j-else-if" && !n && console.warn(`j-else-if expects a value

          ${t.outerHTML}`);
}, ne = {
  name: "ifDirective",
  // Match with if-else and else so they are not caught by other directives
  matcher: (t) => ["j-if", "j-else-if", "j-else"].includes(t.name),
  mounted: (t, e, n, s) => {
    var v;
    if (["j-else-if", "j-else"].includes(e)) {
      te(t, e, n), ee(t, e);
      return;
    }
    if (!n) {
      console.error("j-if expects a value");
      return;
    }
    const r = Array.from(((v = t.parentElement) == null ? void 0 : v.children) ?? []), i = r.filter((c) => c.hasAttribute("j-else-if")), l = r.find((c) => c.hasAttribute("j-else")), u = [t, ...i, l].filter(
      (c) => !!c
    ), o = [
      document.createComment("j-if"),
      ...i.map(() => document.createComment("j-else-if")),
      document.createComment("j-else")
    ], m = i.map((c) => c.getAttribute("j-else-if")), g = t.parentElement;
    return () => {
      const c = b(n, s), f = m.map(
        (d) => d ? b(d, s) : void 0
      ), p = [c, ...f, !0];
      p.some(L) && console.warn("Signals should be called with .get() in the template");
      const w = u.find((d, y) => p[y]);
      for (let d = 0; d < u.length; d++) {
        const y = u[d], h = o[d];
        if (y === w) {
          g.appendChild(y), h.remove();
          continue;
        }
        y.remove(), g.appendChild(h);
      }
    };
  }
}, se = {
  name: "effectDirective",
  matcher: (t) => t.name === "j-effect",
  mounted: (t, e, n, s) => () => {
    z(
      n,
      {
        ...s,
        $el: t
      },
      t.outerHTML
    );
  }
}, re = {
  name: "modelDirective",
  matcher: (t) => t.name === "j-model",
  mounted: (t, e, n, s) => {
    var l;
    const r = b(n, s, e);
    if (!L(r)) {
      let u = `Can only bind signals with ${e}.

${t.outerHTML}`;
      const o = (l = n.match(/\..*\(.*\)/)) == null ? void 0 : l.at(0);
      o ? u += `

Try removing ${o} on ${n}

` : u += `
${n} is not a signal`, console.error(u);
      return;
    }
    const i = typeof r.get() == "number" ? (u) => Number(u) : (u) => u;
    return t.addEventListener("input", (u) => {
      if (u.type !== "input")
        return;
      const o = u.target, g = o.type === "checkbox" ? o.checked : i(o.value);
      r.set(g, { msg: "modelDirective" });
    }), () => {
      t.value = String(r.get());
    };
  }
}, ie = {
  name: "scopeDirective",
  matcher: (t) => t.name === "j-scope",
  mounted: (t, e, n, s) => () => {
    Object.assign(s, b(n, s));
  }
}, oe = (t) => {
  const e = [];
  let n = t.nextElementSibling;
  for (; n; )
    e.push(n), n = n.nextElementSibling;
  return e;
}, ce = (t, e) => `${e} is trying to use a signal

${t.outerHTML}

Try calling ${t.getAttribute(e)} with .get()


`, J = `eg:

<div>
	<div j-switch="greeting.get()" j-case="hello">Hello!</div>
	<div j-case="hi">Hi</div>
	<div :j-case="custom.get()" j-text="custom.get()"></div>
	<div j-default>Howdy</div>
</div>`, ae = {
  name: "switchDirective",
  matcher: (t) => ["j-switch", "j-case", ":j-case", "j-default"].includes(t.name),
  mounted: (t, e, n, s) => {
    var g, j, v;
    if (["j-case", ":j-case", "j-default"].includes(e)) {
      t.hasAttribute("j-switch") || (g = t.previousElementSibling) != null && g.getAttribute("j-switch") || (j = t.previousElementSibling) != null && j.getAttribute(":j-case") || (v = t.previousElementSibling) != null && v.getAttribute("j-case") || console.error(
        `${e} must directly follow an element with j-switch or :j-case.

Try placing

${t.outerHTML}

directly after the j-switch or :j-case.

${J}`
      );
      return;
    }
    if (!t.hasAttribute(":j-case") && !t.hasAttribute("j-case")) {
      console.error(
        `j-switch expects a j-case attribute

${t.outerHTML}

${J}`
      );
      return;
    }
    const r = [t, ...oe(t)], i = r.filter((c) => c.hasAttribute("j-case")), l = r.filter((c) => c.hasAttribute(":j-case")), u = r.find((c) => c.hasAttribute("j-default")), o = [...i, ...l, u].filter(
      (c) => !!c
    );
    return () => {
      const c = i.map((h) => h.getAttribute("j-case")), f = l.map((h) => {
        const $ = h.getAttribute(":j-case");
        if ($)
          return b($, s, ":j-case");
      }), p = b(n, s, "j-switch"), w = D(p), d = [...c, ...f, !0];
      d.some(L) && d.forEach((h, $) => {
        if (!L(h))
          return;
        const H = o[$];
        H && console.error(ce(H, ":j-case"));
      });
      for (const h of o)
        h.style.display = "none";
      const y = o.find((h, $) => w === d[$]);
      y.style.display = "unset";
    };
  }
}, ue = {
  name: "textDirective",
  matcher: (t) => t.name === "j-text",
  mounted: (t, e, n, s) => (t.innerHTML.trim() && console.warn(`Elements will be removed when using j-text:
        ${t.innerHTML.trim()}
from
        ${t.outerHTML.trim()}`), () => {
    const r = b(n, s, t.outerHTML);
    t.textContent = String(D(r));
  })
}, le = (t) => t.replaceAll(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), me = (t = {}) => {
  const e = {};
  for (const n in t) {
    const s = t[n];
    e[n] = s, e[le(n)] = s;
  }
  return e;
}, fe = [
  ie,
  Y,
  X,
  ne,
  // elseIfDirective,
  // elseDirective,
  ae,
  ue,
  Z,
  re,
  se
  // keyDirective,
  // bindDirective,
], T = /* @__PURE__ */ new WeakMap(), de = (t, e, n) => {
  console.error(`Scope must be an object.

                  ${t.outerHTML}

                  ${e} is of type ${typeof n}`);
}, he = (t) => (e) => {
  var u;
  const n = (u = e.parentElement) == null ? void 0 : u.closest("[j-scope]"), s = (n && T.get(n)) ?? t, r = e.getAttribute("j-scope"), i = r ? b(r, s, "j-scope") : void 0, l = Object.assign({}, t, s, i);
  return W(l) ? (T.set(e, l), { el: e, scope: l }) : (de(e, r, l), { el: e, scope: {} });
}, ge = (t) => ({ el: e }) => {
  const n = e.tagName.toLowerCase();
  return n.includes("-") ? n in t ? !0 : (console.warn(`No component found for ${n}.

      Components can be added globally by passing them to the app setup function.

      setup(state,{ attach: "#app", components: { myComponent }});

      or inside a parent component in the defineComponent function.

      defineComponent({
        name: "myParentComponent",
        components: { myChildComponent },
        template: \`<my-child-component></my-child-component>\`
      });`), !1) : !0;
}, ve = (t) => ({ el: e, scope: n }) => {
  const s = e.tagName.toLowerCase();
  return s in t ? {
    el: t[s](e, n, t),
    scope: n
  } : { el: e, scope: n };
}, be = (t) => ({ el: e, scope: n }) => {
  if (!e.parentElement) {
    console.log("el has no parent", e.outerHTML);
    return;
  }
  for (const s of e.attributes) {
    for (const r of fe) {
      if (!r.matcher(s))
        continue;
      const i = r.mounted(
        e,
        s.name,
        s.value,
        n,
        t
      );
      i && new _(i, { msg: r.name });
      break;
    }
    if (!e.parentElement) {
      T.delete(e);
      break;
    }
  }
};
function x(t, e, n = {}) {
  const s = me(n), r = Array.from(
    t.querySelectorAll("*:not([j-for] *)")
  );
  r.unshift(t), r.map(he(e)).filter(ge(s)).map(ve(s)).forEach(be(s));
}
function ye(t, e, n = document) {
  C.value = !!e.debug;
  const s = typeof e.attach == "string" ? n.querySelector(e.attach) : e.attach;
  if (!s)
    throw new Error("No element found");
  x(s, t, e.components), e != null && e.onMounted && document.addEventListener("DOMContentLoaded", e.onMounted);
}
const je = (t) => (e, n, s) => {
  var o, m, g, j;
  e.innerHTML = t.template;
  const r = {}, i = t.props;
  for (const v in i) {
    const c = v, f = i[c], p = "type" in f ? f.type : f, w = "required" in f ? f.required : !1, d = (o = e.attributes.getNamedItem(c)) == null ? void 0 : o.value, y = (m = e.attributes.getNamedItem(`:${c}`)) == null ? void 0 : m.value;
    if (d) {
      const h = v;
      p.name !== "String" && console.warn(
        `Prop ${h} is not a string

${e.outerHTML}`
      ), r[h] = d;
    } else if (y) {
      const h = v, $ = b(y, n);
      $ instanceof p || console.warn(
        `Prop ${h} is not a ${p.name}

${e.outerHTML}`
      ), r[h] = $;
    } else
      w && console.warn(`Prop ${c} is missing

${e.outerHTML}`);
  }
  const l = ((g = t.setup) == null ? void 0 : g.call(t, r)) ?? {}, u = e.firstElementChild;
  return u && x(u, l, {
    ...s,
    ...t.components
  }), (j = t.onMounted) == null || j.call(t), e;
};
export {
  _ as Effect,
  N as Signal,
  G as cls,
  k as computed,
  ye as createApp,
  je as defineComponent,
  L as isSignal,
  A as signal
};
