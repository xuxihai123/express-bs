import express from "../../src/main";
import mockData from "../../mock";

const app = express();
app.mock("xhr", mockData);
