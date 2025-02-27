"use client"

import {useState} from "react";
import {Knob, KnobProps, KnobSwitch, KnobSwitchProps, Option} from "@cutoff/audio-ui-react";
import DemoSkeletonPage from "@/components/DemoSkeletonPage";

const iconSineWave = "/sine-wave.svg";
const iconTriangleWave = "/triangle-wave.svg";
const iconSawWave = "/saw-wave.svg";
const iconSquareWave = "/square-wave.svg";

const sampleOptions = [
    <Option key={0} value={0}><img src={iconSineWave} alt="Sine"/></Option>,
    <Option key={1} value={1}><img src={iconTriangleWave} alt="Triangle"/></Option>,
    <Option key={2} value={2}><img src={iconSquareWave} alt="Saw"/></Option>,
    <Option key={3} value={3}><img src={iconSawWave} alt="Saw"/></Option>,
    <Option key={4} value={4}>Oth</Option>
];

function generateCodeSnippet(
    enableOptions: boolean,
    value: number,
    label: string,
    min: number,
    max: number,
    center: number
): string {
    if (enableOptions) {
        return `<Knob value={${value}} label='${label}'>
    <Option value={0}><img src={iconSineWave} /></Option>
    <Option value={1}><img src={iconTriangleWave} /></Option>
    <Option value={2}><img src={iconSquareWave} /></Option>
    <Option value={3}><img src={iconSawWave} /></Option>
    <Option value={4}>Oth</Option>
</Knob>
`;
    } else {
        return `<Knob min={${min}} max={${max}} value={${value}} label='${label}' center={${center}} />`;
    }
}

type KnobComponentProps = {
    value: number;
    min: number;
    max: number;
    label?: string;
    center?: number;
    enableOptions: boolean;
    stretch?: boolean;
    style?: React.CSSProperties;
    className?: string;
    onChange?: KnobProps['onChange'] | KnobSwitchProps['onChange'];
    onClick?: KnobProps['onClick'] | KnobSwitchProps['onClick'];
};

function KnobComponent({
                           value,
                           min,
                           max,
                           label,
                           center,
                           enableOptions,
                           stretch,
                           onChange,
                           onClick,
                           style,
                           className
                       }: KnobComponentProps) {
    if (enableOptions) {
        return (
            <KnobSwitch
                value={value}
                stretch={stretch}
                label={label}
                style={style}
                onClick={onClick}
                onChange={onChange}
            >
                {sampleOptions}
            </KnobSwitch>
        );
    } else {
        return (
            <Knob
                min={min}
                max={max}
                value={value}
                label={label}
                center={center === undefined}
                stretch={stretch}
                style={style}
                className={className}
                onClick={onClick}
                onChange={onChange}
            />
        );
    }
}

export default function KnobDemoPage() {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [label, setLabel] = useState("Default");
    const [center, setCenter] = useState(0);
    const [enableOptions, setEnableOptions] = useState(false);

    const handleExampleClick = (num: 0 | 1 | 2): void => {

        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setLabel("Default");
                setCenter(0);
                setEnableOptions(false);
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Center");
                setCenter(64);
                setEnableOptions(false);
                break;
            case 2:
                setValue(0);
                setMin(0);
                setMax(4);
                setLabel("Enum");
                setCenter(0);
                setEnableOptions(true);
                break;
        }
    };
    const properties = [
        <label key="label" className="propertiesLabel">
            Label:
            <input name="labelProp" className="propertiesInputText"
                   value={label} onChange={(e) => setLabel(e.target.value)}
            />
        </label>,
        <label key="min" className="propertiesLabel">
            Min:
            <input name="minProp" className="propertiesInputText"
                   value={min} onChange={(e) => setMin(Number(e.target.value))}
            />
        </label>,
        <label key="max" className="propertiesLabel">
            Max:
            <input name="maxProp" className="propertiesInputText"
                   value={max} onChange={(e) => setMax(Number(e.target.value))}
            />
        </label>,
        <label key="center" className="propertiesLabel">
            Center:
            <input name="centerProp" className="propertiesInputText"
                   value={center} onChange={(e) => setCenter(Number(e.target.value))}
            />
        </label>,
        <label key="enableOptions" className="propertiesLabel">
            Options:
            <input name="enableOptionsProp" className="propertiesInputText"
                   type="checkbox"
                   checked={enableOptions} onChange={(e) => setEnableOptions(e.target.checked)}
            />
        </label>
    ]

    const examples = [
        <Knob key="0" style={{cursor: "pointer"}}
              min={0} max={100} value={42} label="Default"
              onClick={() => handleExampleClick(0)}
        />,
        <Knob key="1" style={{cursor: "pointer"}}
              min={0} center={true} max={127} value={64} label="Center"
              onClick={() => handleExampleClick(1)}
        />,
        <KnobSwitch key="2" style={{cursor: "pointer"}}
                    value={0} label="Enum"
                    onClick={() => handleExampleClick(2)}
        >
            {sampleOptions}
        </KnobSwitch>
    ];

    const codeString = generateCodeSnippet(enableOptions, value, label, min, max, center);
    const componentProps = {min, center, max, value, label, enableOptions};

    return (
        <DemoSkeletonPage
            componentName="Knob"
            codeSnippet={codeString}
            PageComponent={KnobComponent}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(newValue) => setValue(newValue)}
        />
    );
}
