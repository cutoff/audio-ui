export type PropertiesInputProps = {
    label: string;
    name: string;
    value: string | number | boolean;
    onChange: (value: string | number | boolean) => void;
    type?: "text" | "number" | "checkbox";
};
