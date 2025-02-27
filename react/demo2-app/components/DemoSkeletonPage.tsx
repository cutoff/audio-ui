"use client"

import "./DemoPage.css";

import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {useMemo} from "react";

export default function DemoSkeletonPage({codeSnippet, PageComponent, componentProps, properties, examples, onChange}) {
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
                        <PageComponent
                            stretch={true}
                            onChange={onChange}
                            {...componentProps}
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
                        {codeSnippet}
                    </SyntaxHighlighter>
                </div>
                <div className="maxWidth propertiesZone">
                    <p className="subTitle">Properties</p>
                    {properties}
                </div>
            </div>
            <div className="centralPart">
                <div className="centralColumn">
                    <div className="flexColumnNoWrap">
                        <p className="mainTitle">Examples</p>
                        <div className="flexRowWrap gapLarge">
                            {examples.map((item, i) => (
                                <div key={i} className="exampleItem">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flexRowWrap gapLarge maxWidth">
                        <div>
                            <p className="mainTitle">Size</p>
                            <PageComponent {...componentProps} />
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
                            <PageComponent style={{
                                gridArea: "2 / 1 / span 1 / span 1",
                                justifySelf: "center",
                                alignSelf: "start"
                            }}
                                           stretch={true}
                                           {...componentProps}
                            />
                            <p style={{
                                gridArea: "1 / 2 / span 1 / span 1",
                                justifySelf: "center",
                                alignSelf: "end"
                            }} className="subTitle">end</p>
                            <PageComponent style={{
                                gridArea: "2 / 2 / span 1 / span 1",
                                justifySelf: "center",
                                alignSelf: "end"
                            }}
                                           stretch={true}
                                           {...componentProps}
                            />
                            <p style={{
                                gridArea: "1 / 3 / span 1 / span 1",
                                justifySelf: "center",
                                alignSelf: "end"
                            }} className="subTitle">center</p>
                            <PageComponent style={{
                                gridArea: "2 / 3 / span 1 / span 1",
                                justifySelf: "center",
                                alignSelf: "center"
                            }}
                                           stretch={true}
                                           {...componentProps}
                            />
                            <PageComponent style={{
                                gridArea: "1 / 5 / span 2 / span 2",
                                justifySelf: "center",
                                alignSelf: "start"
                            }}
                                           stretch={true}
                                           {...componentProps}
                            />
                            <p style={{
                                gridArea: "3 / 5 / span 1 / span 2",
                                justifySelf: "center",
                                alignSelf: "end"
                            }} className="subTitle">2x2</p>
                            <PageComponent style={{
                                gridArea: "2 / 7 / span 2 / span 3",
                                justifySelf: "center",
                                alignSelf: "end"
                            }}
                                           stretch={true}
                                           {...componentProps}
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
