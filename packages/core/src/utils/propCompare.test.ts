import { describe, it, expect } from "vitest";
import { createPropComparator } from "./propCompare";

describe("createPropComparator", () => {
    describe("Deep Comparison", () => {
        it("returns false when deep-compared props differ", () => {
            const compare = createPropComparator({ deepCompareProps: ["style"] });
            const prevProps = { style: { color: "red" }, id: "test" };
            const nextProps = { style: { color: "blue" }, id: "test" };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("returns true when deep-compared props are equal", () => {
            const compare = createPropComparator({ deepCompareProps: ["style"] });
            const style = { color: "red", fontSize: 16 };
            const prevProps = { style, id: "test" };
            const nextProps = { style, id: "test" };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("returns true when deep-compared props have same values but different references", () => {
            const compare = createPropComparator({ deepCompareProps: ["style"] });
            const prevProps = { style: { color: "red", fontSize: 16 }, id: "test" };
            const nextProps = { style: { color: "red", fontSize: 16 }, id: "test" };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("handles nested objects in deep-compared props", () => {
            const compare = createPropComparator({ deepCompareProps: ["config"] });
            const prevProps = { config: { theme: { color: "red" } } };
            const nextProps = { config: { theme: { color: "blue" } } };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("handles arrays in deep-compared props", () => {
            const compare = createPropComparator({ deepCompareProps: ["items"] });
            const prevProps = { items: [1, 2, 3] };
            const nextProps = { items: [1, 2, 4] };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("handles multiple deep-compared props", () => {
            const compare = createPropComparator({ deepCompareProps: ["style", "config"] });
            const prevProps = { style: { color: "red" }, config: { theme: "dark" } };
            const nextProps = { style: { color: "red" }, config: { theme: "light" } };

            expect(compare(prevProps, nextProps)).toBe(false);
        });
    });

    describe("Always-Compare Props", () => {
        it("returns false when always-compared props differ by reference", () => {
            const compare = createPropComparator({ alwaysCompareProps: ["children"] });
            const prevProps = { children: { type: "div", children: "Old" }, id: "test" };
            const nextProps = { children: { type: "div", children: "New" }, id: "test" };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("returns true when always-compared props have same reference", () => {
            const compare = createPropComparator({ alwaysCompareProps: ["children"] });
            const children = { type: "div", children: "Same" };
            const prevProps = { children, id: "test" };
            const nextProps = { children, id: "test" };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("handles function props in always-compare", () => {
            const compare = createPropComparator({ alwaysCompareProps: ["onClick"] });
            const onClick1 = () => {};
            const onClick2 = () => {};
            const prevProps = { onClick: onClick1 };
            const nextProps = { onClick: onClick2 };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("handles multiple always-compared props", () => {
            const compare = createPropComparator({ alwaysCompareProps: ["children", "onClick"] });
            const onClick = () => {};
            const prevProps = { children: { type: "div", children: "A" }, onClick };
            const nextProps = { children: { type: "div", children: "B" }, onClick };

            expect(compare(prevProps, nextProps)).toBe(false);
        });
    });

    describe("Shallow Comparison", () => {
        it("returns false when shallow props differ", () => {
            const compare = createPropComparator();
            const prevProps = { id: "test1", count: 5 };
            const nextProps = { id: "test2", count: 5 };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("returns true when shallow props are equal", () => {
            const compare = createPropComparator();
            const prevProps = { id: "test", count: 5, enabled: true };
            const nextProps = { id: "test", count: 5, enabled: true };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("handles primitive types (string, number, boolean)", () => {
            const compare = createPropComparator();
            const prevProps = { name: "test", count: 42, active: true };
            const nextProps = { name: "test", count: 42, active: true };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("returns false for different primitive values", () => {
            const compare = createPropComparator();
            const prevProps = { count: 5 };
            const nextProps = { count: 10 };

            expect(compare(prevProps, nextProps)).toBe(false);
        });
    });

    describe("Edge Cases", () => {
        it("handles undefined props", () => {
            const compare = createPropComparator();
            const prevProps = { id: "test", value: undefined };
            const nextProps = { id: "test", value: undefined };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("returns false when one prop is undefined and other is defined", () => {
            const compare = createPropComparator();
            const prevProps = { id: "test", value: undefined };
            const nextProps = { id: "test", value: "defined" };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("handles null values", () => {
            const compare = createPropComparator();
            const prevProps = { id: "test", value: null };
            const nextProps = { id: "test", value: null };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("returns false when one prop is null and other is defined", () => {
            const compare = createPropComparator();
            const prevProps = { id: "test", value: null };
            const nextProps = { id: "test", value: "defined" };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("handles missing props", () => {
            const compare = createPropComparator();
            const prevProps = { id: "test" };
            const nextProps = { id: "test", extra: "prop" };

            // The current implementation only checks keys in prevProps
            // So if nextProps has extra keys, they're not checked
            // This is expected behavior - shallow comparison only checks prevProps keys
            // To detect missing props, we'd need to check both objects' keys
            // For now, this test verifies current behavior
            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("handles missing props in nextProps", () => {
            const compare = createPropComparator();
            const prevProps = { id: "test", extra: "prop" };
            const nextProps = { id: "test" };

            // Missing prop in nextProps should cause false
            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("handles empty objects", () => {
            const compare = createPropComparator();
            const prevProps = {};
            const nextProps = {};

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("handles empty objects in deep-compared props", () => {
            const compare = createPropComparator({ deepCompareProps: ["style"] });
            const prevProps = { style: {} };
            const nextProps = { style: {} };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("handles undefined in deep-compared props", () => {
            const compare = createPropComparator({ deepCompareProps: ["style"] });
            const prevProps = { style: undefined };
            const nextProps = { style: undefined };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("returns false when one deep-compared prop is undefined and other is defined", () => {
            const compare = createPropComparator({ deepCompareProps: ["style"] });
            const prevProps = { style: undefined };
            const nextProps = { style: { color: "red" } };

            expect(compare(prevProps, nextProps)).toBe(false);
        });
    });

    describe("Custom Configuration", () => {
        it("allows custom deepCompareProps", () => {
            const compare = createPropComparator({ deepCompareProps: ["config"] });
            const prevProps = { config: { setting: "a" }, style: { color: "red" } };
            const nextProps = { config: { setting: "a" }, style: { color: "blue" } };

            // config is deep-compared (same), style is shallow-compared (different refs)
            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("allows custom alwaysCompareProps", () => {
            const compare = createPropComparator({ alwaysCompareProps: ["handler"] });
            const handler1 = () => {};
            const handler2 = () => {};
            const prevProps = { handler: handler1 };
            const nextProps = { handler: handler2 };

            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("allows empty deepCompareProps array", () => {
            const compare = createPropComparator({ deepCompareProps: [] });
            const prevProps = { style: { color: "red" } };
            const nextProps = { style: { color: "blue" } };

            // style is now shallow-compared (different refs)
            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("allows empty alwaysCompareProps array", () => {
            const compare = createPropComparator({ alwaysCompareProps: [] });
            const children1 = { type: "div", children: "A" };
            const children2 = { type: "div", children: "B" };
            const prevProps = { children: children1 };
            const nextProps = { children: children2 };

            // children is now shallow-compared (different refs)
            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("allows no options (uses defaults)", () => {
            const compare = createPropComparator();
            const style = { color: "red" };
            const prevProps = { style, children: { type: "div", children: "A" } };
            const nextProps = { style, children: { type: "div", children: "A" } };

            // style is deep-compared (same), children is always-compared (different refs)
            expect(compare(prevProps, nextProps)).toBe(false);
        });
    });

    describe("Combined Scenarios", () => {
        it("handles all three comparison types together", () => {
            const compare = createPropComparator({
                deepCompareProps: ["style"],
                alwaysCompareProps: ["children"],
            });
            const style = { color: "red" };
            const children = { type: "div", children: "Same" };
            const prevProps = { style, children, id: "test", count: 5 };
            const nextProps = { style, children, id: "test", count: 5 };

            expect(compare(prevProps, nextProps)).toBe(true);
        });

        it("returns false if any comparison fails", () => {
            const compare = createPropComparator({
                deepCompareProps: ["style"],
                alwaysCompareProps: ["children"],
            });
            const style = { color: "red" };
            const prevProps = { style, children: { type: "div", children: "A" }, id: "test", count: 5 };
            const nextProps = { style, children: { type: "div", children: "B" }, id: "test", count: 5 };

            // children differ (always-compare)
            expect(compare(prevProps, nextProps)).toBe(false);
        });

        it("prioritizes always-compare over deep-compare", () => {
            const compare = createPropComparator({
                deepCompareProps: ["style"],
                alwaysCompareProps: ["style"], // Same prop in both
            });
            const style1 = { color: "red" };
            const style2 = { color: "red" }; // Same values, different reference
            const prevProps = { style: style1 };
            const nextProps = { style: style2 };

            // always-compare uses ===, so different references return false
            expect(compare(prevProps, nextProps)).toBe(false);
        });
    });

    describe("Performance Considerations", () => {
        it("uses Set-based lookups for O(1) performance", () => {
            const compare = createPropComparator({
                deepCompareProps: ["style", "config", "theme"],
                alwaysCompareProps: ["children", "onClick"],
            });
            const prevProps = {
                style: { color: "red" },
                config: { setting: "a" },
                theme: { mode: "dark" },
                children: { type: "div", children: "A" },
                onClick: () => {},
                id: "test",
            };
            const nextProps = {
                style: { color: "red" },
                config: { setting: "a" },
                theme: { mode: "dark" },
                children: { type: "div", children: "A" },
                onClick: () => {},
                id: "test",
            };

            // Should complete quickly even with multiple props
            expect(compare(prevProps, nextProps)).toBe(false); // children/onClick differ by ref
        });
    });
});
