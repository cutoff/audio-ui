import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RadialImage from "./RadialImage";

describe("RadialImage", () => {
    it("renders without crashing", () => {
        const { container } = render(
            <svg>
                <RadialImage cx={50} cy={50} radius={40} imageHref="test.png" />
            </svg>
        );
        expect(container.querySelector("g")).toBeTruthy();
        expect(container.querySelector("image")).toBeTruthy();
    });

    it("renders image with correct attributes", () => {
        const { container } = render(
            <svg>
                <RadialImage cx={50} cy={50} radius={40} imageHref="knob.png" />
            </svg>
        );
        
        const image = container.querySelector("image");
        expect(image?.getAttribute("href")).toBe("knob.png");
        expect(image?.getAttribute("x")).toBe("10"); // 50 - 40
        expect(image?.getAttribute("y")).toBe("10"); // 50 - 40
        expect(image?.getAttribute("width")).toBe("80"); // 40 * 2
        expect(image?.getAttribute("height")).toBe("80"); // 40 * 2
        expect(image?.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet");
    });

    it("renders children SVG content", () => {
        const { container } = render(
            <svg>
                <RadialImage cx={50} cy={50} radius={40}>
                    <circle r={10} className="icon" />
                </RadialImage>
            </svg>
        );
        
        expect(container.querySelector(".icon")).toBeTruthy();
        expect(container.querySelector("image")).toBeFalsy();
    });

    it("renders both image and children when both are provided", () => {
        const { container } = render(
            <svg>
                <RadialImage cx={50} cy={50} radius={40} imageHref="knob.png">
                    <circle r={5} className="indicator" />
                </RadialImage>
            </svg>
        );
        
        expect(container.querySelector("image")).toBeTruthy();
        expect(container.querySelector(".indicator")).toBeTruthy();
    });

    it("renders without image when only children are provided", () => {
        const { container } = render(
            <svg>
                <RadialImage cx={50} cy={50} radius={40}>
                    <path d="M 10 10 L 20 20" className="icon-path" />
                </RadialImage>
            </svg>
        );
        
        expect(container.querySelector("image")).toBeFalsy();
        expect(container.querySelector(".icon-path")).toBeTruthy();
    });

    it("applies className and style to group", () => {
        const { container } = render(
            <svg>
                <RadialImage 
                    cx={50} 
                    cy={50} 
                    radius={40} 
                    imageHref="test.png"
                    className="test-class"
                    style={{ opacity: 0.5 }}
                />
            </svg>
        );
        
        const group = container.querySelector("g");
        expect(group?.getAttribute("class")).toBe("test-class");
        expect(group?.getAttribute("style")).toBe("opacity: 0.5;");
    });
});

