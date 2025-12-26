import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Rotary from "./Rotary";

describe("Rotary", () => {
    it("renders without crashing", () => {
        const { container } = render(
            <svg>
                <Rotary cx={50} cy={50} radius={40} normalizedValue={0.5} />
            </svg>
        );
        expect(container.querySelector("g")).toBeTruthy();
    });

    it("applies correct rotation transform for value 0.5 (center)", () => {
        const { container } = render(
            <svg>
                <Rotary cx={50} cy={50} radius={40} normalizedValue={0.5} openness={90} />
            </svg>
        );
        
        // At value 0.5:
        // openness = 90
        // start = 180 + 45 = 225
        // end = 540 - 45 = 495
        // range = 270
        // value 0.5 -> angle = 225 + 0.5 * 270 = 225 + 135 = 360
        // rotation = 360 - 0 (default) = 360
        
        const group = container.querySelector("g");
        const transform = group?.getAttribute("transform");
        expect(transform).toBe("rotate(360, 50, 50)");
    });

    it("applies correct rotation transform for value 0 (min)", () => {
        const { container } = render(
            <svg>
                <Rotary cx={50} cy={50} radius={40} normalizedValue={0} openness={90} />
            </svg>
        );
        
        // At value 0:
        // angle = 225
        // rotation = 225 - 0 = 225
        
        const group = container.querySelector("g");
        const transform = group?.getAttribute("transform");
        expect(transform).toBe("rotate(225, 50, 50)");
    });

    it("applies correct rotation transform for value 1 (max)", () => {
        const { container } = render(
            <svg>
                <Rotary cx={50} cy={50} radius={40} normalizedValue={1} openness={90} />
            </svg>
        );
        
        // At value 1:
        // angle = 495
        // rotation = 495 - 0 = 495
        
        const group = container.querySelector("g");
        const transform = group?.getAttribute("transform");
        expect(transform).toBe("rotate(495, 50, 50)");
    });

    it("renders image if imageHref is provided", () => {
        const { container } = render(
            <svg>
                <Rotary cx={50} cy={50} radius={40} normalizedValue={0.5} imageHref="knob.png" />
            </svg>
        );
        
        const image = container.querySelector("image");
        expect(image).toBeTruthy();
        expect(image?.getAttribute("href")).toBe("knob.png");
        expect(image?.getAttribute("x")).toBe("10"); // 50 - 40
        expect(image?.getAttribute("y")).toBe("10"); // 50 - 40
        expect(image?.getAttribute("width")).toBe("80"); // 40 * 2
        expect(image?.getAttribute("height")).toBe("80"); // 40 * 2
    });

    it("renders children content", () => {
        const { container } = render(
            <svg>
                <Rotary cx={50} cy={50} radius={40} normalizedValue={0.5}>
                    <circle r={10} className="indicator" />
                </Rotary>
            </svg>
        );
        
        expect(container.querySelector(".indicator")).toBeTruthy();
    });
});

