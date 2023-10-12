interface ArrayElement {
  transaction_hash: string;
  log_index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

function joinArraysOnKey(
  arr1: ArrayElement[],
  arr2: ArrayElement[],
  key1: keyof ArrayElement,
  key2: keyof ArrayElement
): ArrayElement[] {
  const map: { [key: string]: ArrayElement } = {};

  arr1.forEach((item) => {
    const combinedKey = `${item[key1]}_${item[key2]}`;
    map[combinedKey] = { ...item };
  });

  arr2.forEach((item) => {
    const combinedKey = `${item[key1]}_${item[key2]}`;
    if (map[combinedKey]) {
      map[combinedKey] = { ...map[combinedKey], ...item };
    } else {
      map[combinedKey] = { ...item };
    }
  });

  return Object.values(map);
}

// Example arrays
const array1: ArrayElement[] = [
  { transaction_hash: "tx1", log_index: 0, data1: "some data" },
  { transaction_hash: "tx2", log_index: 1, data1: "other data" },
];

const array2: ArrayElement[] = [
  { transaction_hash: "tx1", log_index: 0, data2: "extra data" },
  { transaction_hash: "tx3", log_index: 2, data2: "additional data" },
];

const joinedArray = joinArraysOnKey(
  array1,
  array2,
  "transaction_hash",
  "log_index"
);
console.log(joinedArray);
