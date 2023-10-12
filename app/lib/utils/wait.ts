export async function wait(millis: number) {
  return new Promise((res) => {
    setTimeout(() => res(undefined), millis);
  });
}
