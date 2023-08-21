import { FC, memo } from "react";
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

    /**
     * If the button is readonly
     */
    readonly: boolean
};

const Button: FC<ButtonProps> = memo(({ type = "button", style = "primary", onClick, children, readonly }: ButtonProps) => {
    if (style === "secondary") {
        return <button disabled={readonly} onClick={onClick} className="button secondary" type={type}>{children}</button>;
    } else if (style === "abort") {
        return <button disabled={readonly} onClick={onClick} className="button abort" type={type}>{children}</button>;
    } else {
        return <button disabled={readonly} onClick={onClick} className="button primary" type={type}>{children}</button>;
    }
})
export default Button;