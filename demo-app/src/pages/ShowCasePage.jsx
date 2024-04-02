import Knob from "cutoff-audiokit/src/components/Knob.jsx";
import "./ShowCasePage.css";

import iconSineWave from "../assets/sine-wave.svg";
import iconTriangleWave from "../assets/triangle-wave.svg";
import iconSawWave from "../assets/saw-wave.svg";
import iconSquareWave from "../assets/square-wave.svg";

import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {useMemo, useState} from "react";
import KnobSwitch from "cutoff-audiokit/src/components/KnobSwitch.jsx";
import Option from "cutoff-audiokit/src/components/Option.jsx";

export default function ShowcasePage() {
    const [value, setValue] = useState(42);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [label, setLabel] = useState("Min-Max");
    const [center, setCenter] = useState(0);

    const codeString = `<Knob min={${min}} max={${max}} value={${value}} label='${label}' center={${center}} />`;

    const handleExampleClick = (num) => {
        switch (num) {
            case 0:
                setValue(42);
                setMin(0);
                setMax(100);
                setLabel("Min-Max");
                setCenter(0);
                break;
            case 1:
                setValue(64);
                setMin(0);
                setMax(127);
                setLabel("Center");
                setCenter(64);
                break;
            case 2:
                setValue(0);
                setMin(0);
                setMax(4);
                setLabel("Enum");
                setCenter(0);
                // TODO options
                break;
        }
    };

    /**
     * Fake grid items created to highlight the borders of the grid
     */
    const fillItems = useMemo(() => {
        let items = [];
        for (let i = 0; i < 27; i++) {
            items.push(<div className="gridItem" style={{
                gridArea: `${(i % 3) + 1} / ${Math.floor(i / 3) + 1} / span 1 / span 1`
            }} />)
        }
        return items;
    }, []);

    return (
        <div className="mainLayout">
            <div className="sidePart">
                <div className="maxWidth mainComponentZone">
                    <p className="mainTitle">Knob</p>
                    <div className="mainComponent">
                        <Knob
                            style={{width: "128px"}}
                            min={min} center={center} max={max} value={value} label={label}
                            onChange={(newValue) => setValue(newValue)}
                        />
                    </div>
                </div>
                <div className="maxWidth codeSnippetZone">
                    <p className="subTitle">Code Snippet</p>
                    <SyntaxHighlighter className="codeSnippet"
                                       customStyle={{backgroundColor: "transparent"}}
                                       language="jsx"
                                       style={oneDark}
                                       wrapLongLines={true}>
                        {codeString}
                    </SyntaxHighlighter>
                </div>
                <div className="maxWidth propertiesZone">
                    <p className="subTitle">Properties</p>
                    <label className="propertiesLabel">
                        Label:
                        <input name="labelProp" className="propertiesInputText"
                               value={label} onChange={(e) => setLabel(e.target.value)}
                        />
                    </label>
                    <label className="propertiesLabel">
                        Min:
                        <input name="minProp" className="propertiesInputText"
                               value={min} onChange={(e) => setMin(Number(e.target.value))}
                        />
                    </label>
                    <label className="propertiesLabel">
                        Max:
                        <input name="maxProp" className="propertiesInputText"
                               value={max} onChange={(e) => setMax(Number(e.target.value))}
                        />
                    </label>
                    <label className="propertiesLabel">
                        Center:
                        <input name="centerProp" className="propertiesInputText"
                               value={center} onChange={(e) => setCenter(Number(e.target.value))}
                        />
                    </label>
                </div>
            </div>
            <div className="centralPart">
                <div className="centralColumn">
                    <div className="flexColumnNoWrap">
                        <p className="mainTitle">Examples</p>
                        <div className="flexRowWrap gapLarge">
                            <Knob style={{cursor: "pointer"}}
                                  min={0} max={100} value={42} label="Min-Max"
                                  onClick={() => handleExampleClick(0)}
                            />
                            <Knob style={{cursor: "pointer"}}
                                  min={0} center={64} max={127} value={64} label="Center"
                                  onClick={() => handleExampleClick(1)}
                            />
                            <KnobSwitch style={{cursor: "pointer"}}
                                        value={0} label="Enum"
                                        onClick={() => handleExampleClick(2)}
                            >
                                <Option value={0}><img src={iconSineWave} alt="Sine"/></Option>
                                <Option value={1}><img src={iconTriangleWave} alt="Triangle"/></Option>
                                <Option value={2}><img src={iconSawWave} alt="Saw"/></Option>
                                <Option value={3}><img src={iconSquareWave} alt="Square"/></Option>
                                <Option value={4}>Oth</Option>
                            </KnobSwitch>
                        </div>
                    </div>

                    <div className="flexRowWrap gapLarge maxWidth">
                        <div>
                            <p className="mainTitle">Size</p>
                            <Knob min={min} max={max} value={value} label={label}/>
                            <p className="subTitle">Default</p>
                        </div>
                    </div>

                    <div>
                    <p className="mainTitle">Grid Layout</p>
                        <div className="gridLayout">
                            {fillItems}
                            <p style={{
                                gridArea: "1 / 1 / span 1 / span 3",
                                justifySelf: "center",
                                alignSelf: "start"
                            }} className="subTitle">align-self</p>
                            <p style={{
                                gridArea: "1 / 1 / span 1 / span 1",
                                justifySelf: "center",
                                alignSelf: "end"
                            }} className="subTitle">start</p>
                            <Knob style={{
                                gridArea: "2 / 1 / span 1 / span 1",
                                alignSelf: "start"
                            }}
                                  stretch={true}
                                  min={min} max={max} value={value} label={label}
                            />
                            <p style={{
                                gridArea: "1 / 2 / span 1 / span 1",
                                justifySelf: "center",
                                alignSelf: "end"
                            }} className="subTitle">end</p>
                            <Knob style={{
                                gridArea: "2 / 2 / span 1 / span 1",
                                alignSelf: "end"
                            }}
                                  stretch={true}
                                  min={min} max={max} value={value} label={label}
                            />
                            <p style={{
                                gridArea: "1 / 3 / span 1 / span 1",
                                justifySelf: "center",
                                alignSelf: "end"
                            }} className="subTitle">center</p>
                            <Knob style={{
                                gridArea: "2 / 3 / span 1 / span 1",
                                alignSelf: "center"
                            }}
                                  stretch={true}
                                  min={min} max={max} value={value} label={label}
                            />
                            <Knob style={{
                                gridArea: "1 / 5 / span 2 / span 2",
                                alignSelf: "start"
                            }}
                                  stretch={true}
                                  min={min} max={max} value={value} label={label}
                            />
                            <p style={{
                                gridArea: "3 / 5 / span 1 / span 2",
                                justifySelf: "center",
                                alignSelf: "end"
                            }} className="subTitle">2x2</p>
                            <Knob style={{
                                gridArea: "2 / 7 / span 2 / span 3",
                                alignSelf: "end"
                            }}
                                  stretch={true}
                                  min={min} max={max} value={value} label={label}
                            />
                            <p style={{
                                gridArea: "1 / 7 / span 1 / span 3",
                                justifySelf: "center",
                                alignSelf: "center"
                            }} className="subTitle">2x3</p>
                            <p style={{
                                gridArea: "3 / 1 / span 1 / span 2",
                                justifySelf: "start",
                                alignSelf: "end"
                            }} className="subTitle">stretch=true</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}