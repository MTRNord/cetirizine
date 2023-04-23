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

const Button: FC<ButtonProps> = ({ type = "button", style = "primary", onClick, children, readonly }: ButtonProps) => {
    if (style === "secondary") {
        return <button disabled={readonly} onClick={onClick} className="button bg-orange-400 hover:bg-orange-500 ease-out duration-150 disabled:bg-slate-200 disabled:cursor-not-allowed" type={type}>{children}</button>;
    } else if (style === "abort") {
        return <button disabled={readonly} onClick={onClick} className="button bg-red-400 hover:bg-red-500 ease-out duration-150 disabled:bg-slate-200 disabled:cursor-not-allowed" type={type}>{children}</button>;
    } else {
        return <button disabled={readonly} onClick={onClick} className="button bg-green-400 hover:bg-green-500 ease-out duration-150 disabled:bg-slate-200 disabled:cursor-not-allowed" type={type}>{children}</button>;
    }
}
export default memo(Button);