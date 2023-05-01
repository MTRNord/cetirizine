import { ChangeEvent, FC, memo } from 'react';

type InputProps = {
    /**
     * The Placeholder text
     */
    placeholder: string
    /**
     * If it is a password input
     */
    password?: boolean
    /**
     * If input should be autofocused
     */
    autoFocus?: boolean
    /**
     * The value of the input field
     */
    value: string
    /**
     * If the input is readonly
     */
    readonly: boolean
    /**
     * Handler for the onChange event
     */
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Input: FC<InputProps> = ({ placeholder, password = false, autoFocus = false, value, readonly, onChange }: InputProps) => {
    return (
        <input
            disabled={readonly}
            className='text-base form-input rounded-lg disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors ease-in-out delay-150'
            value={value}
            type={password ? "password" : "text"}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChange={onChange}
        />
    );
}
export default memo(Input);