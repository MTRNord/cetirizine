import "./button.scss";

type ButtonProps = {
    /**
     * The button type
     */
    type?: "button" | "submit" | "reset";
    /**
     * The button style
     */
    style?: "primary" | "secondary" | "abort";
    /**
     * The button onClick handler
     */
    onClick?: () => void;
    /**
     * The button Label
     */
    children: string
};

export default function Button({ type = "button", style = "primary", onClick, children }: ButtonProps) {
    if (style === "secondary") {
        return <button onClick={onClick} className="button bg-orange-400" type={type}>{children}</button>;
    } else if (style === "abort") {
        return <button onClick={onClick} className="button bg-red-400" type={type}>{children}</button>;
    } else {
        return <button onClick={onClick} className="button bg-green-400" type={type}>{children}</button>;
    }
}