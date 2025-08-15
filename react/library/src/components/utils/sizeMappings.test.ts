import { describe, it, expect } from "vitest";
import { buttonSizeMap, knobSizeMap, keybedSizeMap, sliderSizeMap, getSizeForComponent } from "./sizeMappings";

describe("sizeMappings", () => {
    it("provides expected dimensions for knob normal size", () => {
        expect(knobSizeMap.normal).toEqual({ width: 75, height: 75 });
    });

    it("provides expected dimensions for button normal size", () => {
        expect(buttonSizeMap.normal).toEqual({ width: 50, height: 50 });
    });

    it("provides expected dimensions for keybed small size", () => {
        expect(keybedSizeMap.small).toEqual({ width: 460, height: 115 });
    });

    it("provides expected dimensions for slider normal vertical/horizontal sizes", () => {
        expect(sliderSizeMap.normal.vertical).toEqual({ width: 40, height: 160 });
        expect(sliderSizeMap.normal.horizontal).toEqual({ width: 160, height: 40 });
    });

    it("getSizeForComponent returns correct mapping for button", () => {
        expect(getSizeForComponent("button", "large")).toEqual({ width: 60, height: 60 });
    });

    it("getSizeForComponent returns correct mapping for slider orientation", () => {
        expect(getSizeForComponent("slider", "xsmall", "vertical")).toEqual({ width: 25, height: 100 });
        expect(getSizeForComponent("slider", "xsmall", "horizontal")).toEqual({ width: 100, height: 25 });
    });

    it("getSizeForComponent throws for invalid component type", () => {
        // @ts-expect-error intentionally wrong component type for test
        expect(() => getSizeForComponent("unknown", "normal")).toThrowError();
    });
});
