import {useState} from "react";
import DemoSkeletonPage from "./DemoSkeletonPage.jsx";
import Slider from "cutoff-audiokit/src/components/Slider";

function Component({value, min, max, label, center, size, stretch, onChange, onClick, style, className}) {
    return (
        <Slider style={style} className={className}
                min={min} center={center} max={max} value={value} label={label} stretch={stretch}
                size={size}
                onClick={onClick}
                onChange={onChange}
        />
    );
}

export default function SliderDemoPage() {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [label, setLabel] = useState("Default");
    const [center, setCenter] = useState(0);
    const [size, setSize] = useState("normal");

    const codeString = `<Slider min={${min}} max={${max}} value={${value}} label='${label}' size='${size}' center={${center}} />`;

    const handleExampleClick = (num) => {
        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setLabel("Default");
                setCenter(0);
                setSize("normal");
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Center");
                setCenter(64);
                setSize("normal");
                break;
            case 2:
                setValue(22);
                setMin(0);
                setMax(127);
                setLabel("Large");
                setCenter(0);
                setSize("large");
                break;
        }
    };

    const componentProps = {min, center, max, value, label, size};

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
        </label>
    ]

    const examples = [
        <Slider key="0" style={{cursor: "pointer"}}
              min={0} max={100} value={42} label="Default"
              onClick={() => handleExampleClick(0)}
        />,
        <Slider key="1" style={{cursor: "pointer"}}
              min={0} center={64} max={127} value={64} label="Center"
              onClick={() => handleExampleClick(1)}
        />,
        <Slider key="2" style={{cursor: "pointer"}}
              min={0} center={0} max={127} value={22} size="large" label="Large"
              onClick={() => handleExampleClick(2)}
        />,
    ];

    return (
        <DemoSkeletonPage
            codeSnippet={codeString}
            PageComponent={Component}
            componentProps={componentProps}
            properties={properties}
            examples={examples}
            onChange={(newValue) => setValue(newValue)}
        />
    );
}