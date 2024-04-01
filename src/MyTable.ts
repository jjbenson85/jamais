import { defineComponent } from "./JComponent";
import { Signal } from "./signal";

export const MyTable = defineComponent({
  name: "MyTable",
  template: `<table>
    <thead>
        <tr>
            <th :data-for="[key, column] in columns" :data-text="column" class="px-4 m-4"></th>
        </tr>
    </thead>
    <tbody>
        <tr :data-for="[itemKey, item] in items.get()">
            <td 
                :data-for="[columnKey, column] in columns" 
                :data-text="item[column]" 
                :class="item.class"
            ></td>
        </tr>
    </tbody>
</table>`,
  props: {
    columns: Array,
    items: Signal,
  },
  setup(props) {
    return {
      columns: props.columns,
      items: props.items,
    };
  },
});