"use client";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Square as LuSquare,
  RectangleVertical as LuRectangleVertical,
  RectangleHorizontal as LuRectangleHorizontal,
  PanelTop as LuPanelTop,
  PanelBottom as LuPanelBottom,
  AlignVerticalJustifyStart as LuAlignVerticalJustifyStart,
  AlignVerticalJustifyCenter as LuAlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd as LuAlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart as LuAlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter as LuAlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd as LuAlignHorizontalJustifyEnd,
} from "lucide-react";

// Value types for props (keep simple string unions)
export type FlexAlignValue = "start" | "center" | "end";
export type ShapeValue = "square" | "vertical" | "horizontal";
export type LabelPositionValue = "above" | "below";
export type DisplayModeValue = "scaleToFit" | "fill";
export type LabelModeValue = "none" | "hidden" | "visible";

export type LabelHeightUnitsValue = number;

const VALIGN_LABEL: Record<FlexAlignValue, string> = {
  start: "Top",
  center: "Center",
  end: "Bottom",
};
const HALIGN_LABEL: Record<FlexAlignValue, string> = {
  start: "Left",
  center: "Center",
  end: "Right",
};
const SHAPE_LABEL: Record<ShapeValue, string> = {
  square: "Square",
  vertical: "Vertical rectangle",
  horizontal: "Horizontal rectangle",
};
const LABEL_POS_LABEL: Record<LabelPositionValue, string> = {
  above: "Above",
  below: "Below",
};
const DISPLAY_MODE_LABEL: Record<DisplayModeValue, string> = {
  scaleToFit: "Scale to fit",
  fill: "Fill",
};
const LABEL_MODE_LABEL: Record<LabelModeValue, string> = {
  none: "None",
  hidden: "Hidden",
  visible: "Visible",
};

export interface ControlsProps {
  width: number;
  onWidthChange: (value: number) => void;
  height: number;
  onHeightChange: (value: number) => void;
  shape: ShapeValue;
  onShapeChange: (value: ShapeValue) => void;
  labelPosition: LabelPositionValue;
  onLabelPositionChange: (value: LabelPositionValue) => void;
  displayMode: DisplayModeValue;
  onDisplayModeChange: (value: DisplayModeValue) => void;
  labelMode: LabelModeValue;
  onLabelModeChange: (value: LabelModeValue) => void;
  asVAlign: FlexAlignValue;
  onAsVAlignChange: (value: FlexAlignValue) => void;
  asHAlign: FlexAlignValue;
  onAsHAlignChange: (value: FlexAlignValue) => void;
  labelAlign: FlexAlignValue;
  onLabelAlignChange: (value: FlexAlignValue) => void;
  labelHeightUnits: LabelHeightUnitsValue;
  onLabelHeightUnitsChange: (value: LabelHeightUnitsValue) => void;
}

export default function Controls(props: ControlsProps) {
  const {
    width,
    onWidthChange,
    height,
    onHeightChange,
    shape,
    onShapeChange,
    labelPosition,
    onLabelPositionChange,
    displayMode,
    onDisplayModeChange,
    labelMode,
    onLabelModeChange,
    asVAlign,
    onAsVAlignChange,
    asHAlign,
    onAsHAlignChange,
    labelAlign,
    onLabelAlignChange,
    labelHeightUnits,
    onLabelHeightUnitsChange,
  } = props;
  return (
    <div className="w-full max-w-md space-y-4 text-sm">
      {/* Dimensions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="control-section-header">Dimensions</h3>
          <div className="flex gap-2">
            <span className="control-value-badge">W {width}px</span>
            <span className="control-value-badge">H {height}px</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="control-group">
            <label className="text-xs text-muted-foreground">Width</label>
            <Slider
              defaultValue={[width]}
              min={50}
              max={700}
              step={1}
              onValueChange={(value) => onWidthChange(value[0])}
            />
          </div>
          <div className="control-group">
            <label className="text-xs text-muted-foreground">Height</label>
            <Slider
              defaultValue={[height]}
              min={50}
              max={400}
              step={1}
              onValueChange={(value) => onHeightChange(value[0])}
            />
          </div>
        </div>
      </div>
      {/* Shape & Display Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Shape */}
        <div className="control-group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Shape</span>
            <span className="control-value-badge">{SHAPE_LABEL[shape]}</span>
          </div>
          <ToggleGroup
            type="single"
            value={shape}
            onValueChange={(val) => val && onShapeChange(val as ShapeValue)}
            className="w-full flex gap-0"
            variant="outline"
          >
            <ToggleGroupItem value="square" aria-label="Square" className="control-toggle-item">
              <LuSquare size={16} />
              <span className="sr-only">Square</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="vertical" aria-label="Vertical rectangle" className="control-toggle-item">
              <LuRectangleVertical size={16} />
              <span className="sr-only">Vertical rectangle</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="horizontal" aria-label="Horizontal rectangle" className="control-toggle-item">
              <LuRectangleHorizontal size={16} />
              <span className="sr-only">Horizontal rectangle</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        {/* Display Mode */}
        <div className="control-group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Display Mode</span>
            <span className="control-value-badge">{DISPLAY_MODE_LABEL[displayMode]}</span>
          </div>
          <ToggleGroup
            type="single"
            value={displayMode}
            onValueChange={(val) => val && onDisplayModeChange(val as DisplayModeValue)}
            className="w-full flex gap-0"
            variant="outline"
          >
            <ToggleGroupItem value="scaleToFit" aria-label="Scale to fit" className="control-toggle-item">
              <span>Scale</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="fill" aria-label="Fill" className="control-toggle-item">
              <span>Fill</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      {/* Alignment */}
      <div className="space-y-2">
        <h3 className="control-section-header">Alignment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Aspect Scaler vertical alignment */}
          <div className="control-group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Aspect V</span>
              <span className="control-value-badge">{VALIGN_LABEL[asVAlign]}</span>
            </div>
            <ToggleGroup
              type="single"
              value={asVAlign}
              onValueChange={(val) => val && onAsVAlignChange(val as FlexAlignValue)}
              className="w-full flex gap-0"
              variant="outline"
            >
              <ToggleGroupItem value="start" aria-label="Align top" className="control-toggle-item">
                <LuAlignVerticalJustifyStart size={16} />
                <span className="sr-only">Top</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align middle" className="control-toggle-item">
                <LuAlignVerticalJustifyCenter size={16} />
                <span className="sr-only">Center</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="end" aria-label="Align bottom" className="control-toggle-item">
                <LuAlignVerticalJustifyEnd size={16} />
                <span className="sr-only">Bottom</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {/* Aspect Scaler horizontal alignment */}
          <div className="control-group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Aspect H</span>
              <span className="control-value-badge">{HALIGN_LABEL[asHAlign]}</span>
            </div>
            <ToggleGroup
              type="single"
              value={asHAlign}
              onValueChange={(val) => val && onAsHAlignChange(val as FlexAlignValue)}
              className="w-full flex gap-0"
              variant="outline"
            >
              <ToggleGroupItem value="start" aria-label="Align left" className="control-toggle-item">
                <LuAlignHorizontalJustifyStart size={16} />
                <span className="sr-only">Left</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center" className="control-toggle-item">
                <LuAlignHorizontalJustifyCenter size={16} />
                <span className="sr-only">Center</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="end" aria-label="Align right" className="control-toggle-item">
                <LuAlignHorizontalJustifyEnd size={16} />
                <span className="sr-only">Right</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      {/* Label */}
      <div className="space-y-2">
        <h3 className="control-section-header">Label</h3>
        {/* Label mode */}
        <div className="control-group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Label Mode</span>
            <span className="control-value-badge">{LABEL_MODE_LABEL[labelMode]}</span>
          </div>
          <ToggleGroup
            type="single"
            value={labelMode}
            onValueChange={(val) => val && onLabelModeChange(val as LabelModeValue)}
            className="w-full flex gap-0"
            variant="outline"
          >
            <ToggleGroupItem value="none" aria-label="No label" className="control-toggle-item">
              <span>None</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="hidden" aria-label="Hidden label" className="control-toggle-item">
              <span>Hidden</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="visible" aria-label="Visible label" className="control-toggle-item">
              <span>Visible</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="control-group">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Label Size</label>
            <span className="control-value-badge">{labelHeightUnits}</span>
          </div>
          <Slider
            defaultValue={[labelHeightUnits]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => onLabelHeightUnitsChange(value[0])}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Label position */}
          <div className="control-group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Label Position</span>
              <span className="control-value-badge">{LABEL_POS_LABEL[labelPosition]}</span>
            </div>
            <ToggleGroup
              type="single"
              value={labelPosition}
              onValueChange={(val) => val && onLabelPositionChange(val as LabelPositionValue)}
              className="w-full flex gap-0"
              variant="outline"
            >
              <ToggleGroupItem value="above" aria-label="Label above" className="control-toggle-item">
                <LuPanelTop size={16} />
                <span className="sr-only">Above</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="below" aria-label="Label below" className="control-toggle-item">
                <LuPanelBottom size={16} />
                <span className="sr-only">Below</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {/* Label horizontal alignment */}
          <div className="control-group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Label H</span>
              <span className="control-value-badge">{HALIGN_LABEL[labelAlign]}</span>
            </div>
            <ToggleGroup
              type="single"
              value={labelAlign}
              onValueChange={(val) => val && onLabelAlignChange(val as FlexAlignValue)}
              className="w-full flex gap-0"
              variant="outline"
            >
              <ToggleGroupItem value="start" aria-label="Label left" className="control-toggle-item">
                <LuAlignHorizontalJustifyStart size={16} />
                <span className="sr-only">Left</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Label center" className="control-toggle-item">
                <LuAlignHorizontalJustifyCenter size={16} />
                <span className="sr-only">Center</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="end" aria-label="Label right" className="control-toggle-item">
                <LuAlignHorizontalJustifyEnd size={16} />
                <span className="sr-only">Right</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
