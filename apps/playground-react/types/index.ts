export type PropertiesInputProps = {
    label: string;
    name: string;
    value: string | number | boolean;
    onChange: (value: any) => void;
    type?: "text" | "number" | "checkbox";
};
