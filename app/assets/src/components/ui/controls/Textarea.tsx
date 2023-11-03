import cx from "classnames";
import React from "react";
import { TextArea as SemanticTextarea, TextAreaProps } from "semantic-ui-react";
import cs from "./textarea.scss";

interface TextAreaInternalProps extends Omit<TextAreaProps, "onChange"> {
  onChange?: (val: string) => void;
}

const Textarea = ({ className, onChange, ...props }: TextAreaInternalProps) => {
  const handleChange = (_: unknown, inputProps: TextAreaProps) => {
    if (onChange) {
      // @ts-expect-error CZID-8698 expect strictNullCheck error: error TS2532
      onChange(inputProps.value.toString());
    }
  };
  return (
    <SemanticTextarea
      className={cx(cs.textarea, className)}
      {...props}
      onChange={handleChange}
    />
  );
};

export default Textarea;
