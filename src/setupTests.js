import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// React Router 7 needs these in the jsdom test environment.
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
