import Link from "next/link";

export default function Home() {
    return (
        <>
            <Link href="/components/knob">
                Knob |&nbsp;
            </Link>
            <Link href="/components/slider">
                Slider
            </Link>
        </>
    );
}
