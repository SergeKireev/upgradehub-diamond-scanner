import { diff, status } from "../lib/diff/git_differ";

describe("Git diff", () => {
  it("diff works between old and new", async () => {
    const oldPath = "codediff/example/old";
    const newPath = "codediff/example/new";
    await diff(oldPath, newPath, "codediff/example/diff.patch");
  });

  it("status works", async () => {
    await status();
  });
});
