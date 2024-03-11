import { defineComponent } from "./defineComponent";

export const TableRowComponent = defineComponent({
  template: `
    <tr>
        <td data-class="item.class" data-text="item.name"></td>
        <td data-class="item.class" data-text="item.email"></td>
        <td data-class="item.class" data-text="item.age"></td>
    </tr>`,
  props: ["item"],
});
