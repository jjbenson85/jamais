import { evaluateExpression } from "../helpers/evaluateExpression";
import { Directive } from "../types";

export const propDirective: Directive = {
    name: "propDirective",
    matcher: (attr: Attr) => attr.name.startsWith(":prop-"),
    mounted: (el, attrName, attrValue, data) => {
        return () => {
            const shadowRoot = el.shadowRoot;
            if (!shadowRoot) {
                console.error(`${attrName} can only be applied to a component with a shadowRoot\n\n${el.outerHTML}`);
                return;
            }

            const unknownValue = evaluateExpression(attrValue, data, 'propDirective');
            if ('updateProp' in el) {
                (el as { updateProp: (...args: unknown[]) => void }).updateProp(attrName.slice(6), unknownValue);
                return;
            }
            //   el.setAttribute(attrName.slice(1), String(unknownValue));
        };
    },
};