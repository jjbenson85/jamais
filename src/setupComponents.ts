import { ComponentConstrucor } from "./JComponent";


export function setupComponents(components: Record<string, ComponentConstrucor>) {
    for (const [key, value] of Object.entries(components ?? {})) {
        const alreadyExists = customElements.get(key)
        if (alreadyExists) continue
        if (value.extends) {
            customElements.define(key, value.component, { extends: value.extends[0] });
        } else {
            customElements.define(key, value.component);
        }
    }
}