import Git from "git-wrapper";

const git = new Git();

type Callback<T> = (err: Error, data: T) => void;
type Callbackable<T> = (cb: Callback<T>) => void;

function promisify<T>(callbackable: Callbackable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    callbackable((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export const diff = async (
  oldPath: string,
  newPath: string,
  diffPath: string
) => {
  //Diff returns with status code 1 when successful
  await promisify((cb: Callback<string>) =>
    git.exec(
      "diff",
      {
        "no-index": true,
        output: diffPath,
        "diff-filter": "d",
        unified: 10,
        "ignore-blank-lines": true,
        "ignore-all-space": true,
      },
      [oldPath, newPath, "> /dev/null"],
      cb
    )
  ).catch(() => {});
};

export const status = async () => {
  const execP = promisify((cb: Callback<string>) =>
    git.exec("status", {}, [], cb)
  );
  const result = await execP;
  console.log(result);
  return result;
};
