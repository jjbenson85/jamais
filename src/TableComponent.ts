import { TableRowComponent } from "./TableRowComponent";
import { defineComponent } from "./defineComponent";

export const TableComponent = defineComponent({
  template: `
  <table>
    <thead>
      <tr>
        <th data-for="column" data-in="{{columns}}" data-text="{{column.label}}">
        </th>
      </tr>
    </thead>
    <tbody> 
      // <TableRowComponent data-for="{{item}}" data-in="{{items}}" item="{{item}}"></TableRowComponent>
      <tr data-for="item" data-in="{{items}}">
        <td data-class="{{item.class}}" data-text="{{item.name}}"></td>
        <td data-class="{{item.class}}" data-text="{{item.email}}"></td>
        <td data-class="{{item.class}}" data-text="{{item.age}}"></td>
      </tr>
    </tbody>
  </table>`,
  props: ["columns", "items"],
  components: {
    TableRowComponent,
  },
});

