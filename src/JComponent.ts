import { bindDirectives } from "./bindDirectives";
import { setupComponents } from "./setupComponents";
import { Effect, Signal, computed, createEffect, signal } from "./signal";
import { Directive } from "./types";

interface Constructable {
  new (...args: never[]): unknown;
}

type Opts<
  T extends HTMLElement = HTMLElement,
  Props extends Record<string, Constructable> = Record<string, Constructable>,
> = {
  name: string;
  extends?: [string, new () => T];
  template: string;
  setup?(
    props: {
      [K in keyof Props]: InstanceType<Props[K]>;
    },
  ): Record<string, unknown>;
  style?: string;
  props?: Props;
  components?: Record<string, ComponentConstrucor>;
  onMounted?: () => void;
  onUnmounted?: () => void;
};

export type ComponentConstrucor = ReturnType<typeof ExtendsJComponent>;
function ExtendsJComponent(opts: Opts) {
  const extendedHTMLElement = opts.extends?.[1] ?? HTMLElement;

  class JComponent extends extendedHTMLElement {
    static observedAttributes: string[] = opts.props
      ? Object.keys(opts.props).map((p) => p.replace(":", ""))
      : [];
    isComponent: true = true;
    $props: Signal<Record<string, unknown>> = signal({});
    $setup = opts.setup ?? (() => opts.props ?? {});
    $scope: Signal<Record<string, unknown>> = signal({});
    $directives: Directive[] = [];
    initialized = false;
    shadowRoot!: ShadowRoot;
    rawProps: Record<string, Constructable> = opts.props ?? {};
    templateString = opts.template;
    styleString = opts.style;
    components = opts.components ?? {};
    bindDirectiveEffect: Effect | null = null;
    scopeEffect: Effect | null = null;
    initializedProps = computed(() => {
      const propKeys = Object.keys(opts.props ?? []);
      for (const key of propKeys) {
        if (!Object.hasOwn(this.$props.get(), key)) return false;
      }
      return true;
    }, `initializedProps ${opts.name}`);

    constructor() {
      super();
      this.shadowRoot = this.attachShadow({ mode: "open" });
      this.createTemplate();
      this.createStyle();

      setupComponents(this.components);

      const doBind = () => {
        this.bindDirectiveEffect = createEffect(() => {
          bindDirectives(
            this.shadowRoot.firstChild as HTMLElement,
            this.$scope.get(),
            globalThis.window.$directives,
          );
        }, `bindDirectiveEffect ${opts.name}`);
      };

      createEffect(() => {
        if (!this.initializedProps.get()) return;
        const props = this.$props.get();
        const newScope = opts.setup?.(props);
        newScope &&
          this.$scope.set(newScope, `setupEffect ${opts.name} $scope`);

        doBind();
      }, `setupEffect ${opts.name}`);
    }

    createTemplate() {
      const templateEl = document.createElement("template");
      templateEl.innerHTML = this.templateString.trim();
      this.shadowRoot.appendChild(templateEl.content.cloneNode(true));
    }

    createStyle() {
      if (!this.styleString) return;
      const styleEl = document.createElement("style");
      styleEl.innerHTML = this.styleString;
      this.shadowRoot.appendChild(styleEl);
    }

    connectedCallback() {
      opts.onMounted?.();
    }

    disconnectedCallback() {
      this.bindDirectiveEffect?.destroy();
      opts.onUnmounted?.();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      if (oldValue === newValue) return;
      this.$props.set({ ...this.$props, [name]: newValue });
    }

    setProp(prop: string, value: unknown) {
      const currentValue = this.$props.get()[prop];

      if (currentValue) return;

      this.$props.set(
        { ...this.$props.get(), [prop]: value },
        `updateProp ${opts.name}`,
      );
    }
  }

  return {
    extends: opts.extends,
    component: JComponent,
  };
}
export type JComponent = InstanceType<
  ReturnType<typeof ExtendsJComponent>["component"]
>;
export { ExtendsJComponent as defineComponent };
