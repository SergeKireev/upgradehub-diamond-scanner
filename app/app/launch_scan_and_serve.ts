import { launch as launchScan } from "./scan/diamond_scan_process";
import { launch as launchServer } from "./server/server";

async function launch() {
    await launchScan();
    await launchServer();
}

launch();