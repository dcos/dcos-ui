import { Application } from "plugin-baby";
import container from "./container";

const app = container.get(Application);

app.start();
