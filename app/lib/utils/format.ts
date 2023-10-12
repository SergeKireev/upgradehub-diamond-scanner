import { EventData } from "../interfaces/block_data";

export function formatEvent(event: EventData) {
  if (event.logIndex === "0x") event.logIndex = "0x0";
  if (event.transactionIndex === "0x") event.transactionIndex = "0x0";
  event.address = event.address.toLowerCase();
}
