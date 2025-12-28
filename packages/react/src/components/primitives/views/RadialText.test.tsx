import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RadialText from "./RadialText";

describe("RadialText", () => {
    it("renders without crashing", () => {
        const { container } = render(
            <svg>
                <RadialText cx={50} cy={50} radius={40} text="Hello" />
            </svg>
        );
        expect(container.querySelector("text")).toBeTruthy();
    });

    it("renders single line text", () => {
        const { container } = render(
            <svg>
                <RadialText cx={50} cy={50} radius={40} text="Hello" />
            </svg>
        );
        
        const text = container.querySelector("text");
        expect(text?.getAttribute("x")).toBe("50");
        expect(text?.getAttribute("y")).toBe("50");
        expect(text?.getAttribute("text-anchor")).toBe("middle");
        expect(text?.getAttribute("dominant-baseline")).toBe("middle");
        
        const tspan = container.querySelector("tspan");
        expect(tspan?.textContent).toBe("Hello");
    });

    it("renders multiline text", () => {
        const { container } = render(
            <svg>
                <RadialText cx={50} cy={50} radius={40} text={["-6", "dB"]} />
            </svg>
        );
        
        const text = container.querySelector("text");
        expect(text).toBeTruthy();
        
        const tspans = container.querySelectorAll("tspan");
        expect(tspans.length).toBe(2);
        expect(tspans[0]?.textContent).toBe("-6");
        expect(tspans[1]?.textContent).toBe("dB");
    });

    it("calculates font size based on radius and scale", () => {
        const { container } = render(
            <svg>
                <RadialText cx={50} cy={50} radius={40} text="Test" fontSizeScale={0.3} />
            </svg>
        );
        
        const text = container.querySelector("text");
        expect(text?.getAttribute("font-size")).toBe("12"); // 40 * 0.3
    });

    it("applies custom textAnchor and dominantBaseline", () => {
        const { container } = render(
            <svg>
                <RadialText 
                    cx={50} 
                    cy={50} 
                    radius={40} 
                    text="Test"
                    textAnchor="start"
                    dominantBaseline="hanging"
                />
            </svg>
        );
        
        const text = container.querySelector("text");
        expect(text?.getAttribute("text-anchor")).toBe("start");
        expect(text?.getAttribute("dominant-baseline")).toBe("hanging");
    });

    it("applies className and style", () => {
        const { container } = render(
            <svg>
                <RadialText 
                    cx={50} 
                    cy={50} 
                    radius={40} 
                    text="Test"
                    className="test-class"
                    style={{ fill: "red" }}
                />
            </svg>
        );
        
        const text = container.querySelector("text");
        expect(text?.getAttribute("class")).toBe("test-class");
        expect(text?.getAttribute("style")).toBe("fill: red;");
    });
});

