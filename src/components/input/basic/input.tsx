import { ChangeEvent, memo } from 'react';

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
     * Handler for the onChange event
     */
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default memo(function Input({ placeholder, password = false, autoFocus = false, value, onChange }: InputProps) {
    return (
        <input
            className='form-input rounded-lg'
            value={value}
            type={password ? "password" : "text"}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChange={onChange}
        />
    );
});