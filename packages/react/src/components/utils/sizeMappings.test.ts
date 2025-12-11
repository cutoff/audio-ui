import { describe, expect, it } from "vitest";
import {
    getSizeClassForComponent,
    squareSizeClassMap,
    horizontalSliderSizeClassMap,
    verticalSliderSizeClassMap,
    keybedSizeClassMap,
} from "./sizeMappings";

describe("sizeMappings", () => {
    it("provides expected class name for square components (knob/button) normal size", () => {
        expect(squareSizeClassMap.normal).toBe("audioui-size-square-normal");
    });

    it("provides expected class name for button normal size", () => {
        expect(squareSizeClassMap.normal).toBe("audioui-size-square-normal");
    });

    it("provides expected class name for keybed small size", () => {
        expect(keybedSizeClassMap.small).toBe("audioui-size-keybed-small");
    });

    it("provides expected class names for slider normal vertical/horizontal sizes", () => {
        expect(verticalSliderSizeClassMap.normal).toBe("audioui-size-vslider-normal");
        expect(horizontalSliderSizeClassMap.normal).toBe("audioui-size-hslider-normal");
    });

    it("getSizeClassForComponent returns correct class for button", () => {
        expect(getSizeClassForComponent("button", "large")).toBe("audioui-size-square-large");
    });

    it("getSizeClassForComponent returns correct class for knob", () => {
        expect(getSizeClassForComponent("knob", "normal")).toBe("audioui-size-square-normal");
    });

    it("getSizeClassForComponent returns correct class for slider orientation", () => {
        expect(getSizeClassForComponent("slider", "xsmall", "vertical")).toBe("audioui-size-vslider-xsmall");
        expect(getSizeClassForComponent("slider", "xsmall", "horizontal")).toBe("audioui-size-hslider-xsmall");
    });

    it("getSizeClassForComponent returns correct class for keybed", () => {
        expect(getSizeClassForComponent("keybed", "normal")).toBe("audioui-size-keybed-normal");
    });

    it("getSizeClassForComponent throws for invalid component type", () => {
        // @ts-expect-error intentionally wrong component type for test
        expect(() => getSizeClassForComponent("unknown", "normal")).toThrowError();
    });
});
