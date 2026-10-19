import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Password field with a show/hide button. All other props go to the <input>.
const PasswordInput = ({ id, ...inputProps }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <input id={id} type={visible ? "text" : "password"} {...inputProps} />
      <button
        type="button"
        className="icon-btn password-toggle"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={id}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;
