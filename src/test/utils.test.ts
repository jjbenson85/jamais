import { describe, it, expect } from "vitest";

import { prettyHTML } from "./utils";

describe("prettyHTML", () => {
  it("should format the html", () => {
    const str = "<div><div><div></div></div></div>";
    expect(prettyHTML(str)).toBe(
      "<div>\n  <div>\n    <div>\n    </div>\n  </div>\n</div>"
    );
  });
  it("should format the html", () => {
    const str = "<div><div></div><div></div><div></div></div>";
    expect(prettyHTML(str)).toBe(
      "<div>\n  <div>\n  </div>\n  <div>\n  </div>\n  <div>\n  </div>\n</div>"
    );
  });
});
