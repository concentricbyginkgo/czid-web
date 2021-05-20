import PropTypes from "prop-types";
import React from "react";

const IconEditSmall = ({ className }) => {
  return (
    <svg
      className={className}
      width="14px"
      height="14px"
      viewBox="0 0 14 14"
      fillRule="evenodd"
      fill="#3867FA"
    >
      <path d="M8.237,3.858 L10.6,6.304 L3.59612034,13.308054 L1.03989985,13.7489033 C0.903837281,13.7723688 0.774514206,13.6810909 0.751048673,13.5450283 C0.746193799,13.5168778 0.746199477,13.4881034 0.751065461,13.4599548 L1.1935929,10.9000364 L8.237,3.858 Z M11.5512158,1.05983554 L11.6217479,1.10655272 L11.7059989,1.18136916 L13.3496609,2.82671743 C13.5508146,3.02787106 13.5508146,3.3540901 13.3495057,3.55550632 L11.709,5.195 L9.346,2.749 L10.9451978,1.15088795 C11.1081546,0.987931236 11.3559481,0.955983945 11.5512158,1.05983554 Z" />
    </svg>
  );
};

IconEditSmall.propTypes = {
  className: PropTypes.string,
};

export default IconEditSmall;
