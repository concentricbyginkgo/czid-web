// SVG generated with Sketch, from Jenn
import cx from "classnames";
import React from "react";
import { IconAlertProps } from "~/interface/icon";
import cs from "./icon_alert.scss";

const IconAlertSmall = ({ className, type }: IconAlertProps) => {
  return (
    // @ts-expect-error CZID-8698 expect strictNullCheck error: error TS2538
    <svg className={cx(className, cs[type])} viewBox="0 0 14 14">
      <g stroke="none" strokeWidth="1" fillRule="evenodd">
        <g fillRule="nonzero">
          <path d="M7,0 C10.8660974,0 14,3.1339026 14,7 C14,10.8660974 10.8660974,14 7,14 C3.1339026,14 0,10.8660974 0,7 C0,3.1339026 3.1339026,0 7,0 Z M7,1.70731707 C4.08190227,1.70731707 1.70731707,4.08190227 1.70731707,7 C1.70731707,9.91809773 4.08190227,12.2926829 7,12.2926829 C9.91809773,12.2926829 12.2926829,9.91809773 12.2926829,7 C12.2926829,4.08190227 9.91809773,1.70731707 7,1.70731707 Z M6.1871437,8.71380057 C6.61439883,8.28328082 7.38567263,8.28219896 7.80652352,8.71171824 C8.02350898,8.92818215 8.14634146,9.22386195 8.14634146,9.53018928 C8.14634146,9.8331351 8.02436664,10.1282022 7.81129711,10.3407149 C7.59434202,10.5588214 7.30055459,10.6829268 7,10.6829268 C6.69758624,10.6829268 6.40217692,10.5593173 6.18709499,10.3430983 C5.97749177,10.1317223 5.85365854,9.8297284 5.85365854,9.53018928 C5.85365854,9.22454616 5.97472296,8.92767624 6.1871437,8.71380057 Z M7,2.92682927 C7.44396352,2.92682927 7.82203142,3.2325643 7.9249372,3.66021535 L7.94481,3.76956166 L7.95121951,3.87804878 L7.95121951,6.6097561 C7.95121951,7.13510013 7.52534403,7.56097561 7,7.56097561 C6.55603648,7.56097561 6.17796858,7.25524058 6.0750628,6.82758953 L6.05519,6.71824322 L6.04878049,6.6097561 L6.04878049,3.87804878 C6.04878049,3.35270475 6.47465597,2.92682927 7,2.92682927 Z" />
        </g>
      </g>
    </svg>
  );
};

IconAlertSmall.defaultProps = {
  type: "info",
};

export default IconAlertSmall;
