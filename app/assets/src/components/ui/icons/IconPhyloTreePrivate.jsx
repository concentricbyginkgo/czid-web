import { forbidExtraProps } from "airbnb-prop-types";
import PropTypes from "prop-types";
import React from "react";

const IconPhyloTreePrivate = ({ className }) => {
  return (
    <svg className={className} width="32px" height="32px" viewBox="0 0 32 32">
      <path
        fill="#CCCCCC"
        d="M18.2808511,21.2 L12.8680851,21.2 L12.8680851,14.8 L16.8510638,14.8 C17.2595745,16.4 18.6893617,17.5 20.3234043,17.5 C22.3659574,17.5 24,15.9 24,13.9 C24,11.9 22.3659574,10.3 20.3234043,10.3 C18.6893617,10.3 17.2595745,11.4 16.8510638,13 L12.8680851,13 L12.8680851,6.6 L16.8510638,6.6 C17.2595745,8.2 18.6893617,9.2 20.3234043,9.2 C22.3659574,9.2 24,7.6 24,5.6 C24,3.6 22.3659574,2 20.3234043,2 C18.6893617,2 17.1574468,3.2 16.8510638,4.8 L12.0510638,4.8 C12.0510638,4.8 12.0510638,4.8 12.0510638,4.8 C11.8468085,4.8 11.6425532,4.9 11.4382979,5.1 C11.2340426,5.3 11.1319149,5.5 11.1319149,5.7 L11.1319149,13 L7.14893617,13 C6.74042553,11.4 5.3106383,10.3 3.67659574,10.3 C1.63404255,10.3 0,11.9 0,13.9 L0,14 L0,14 C0.10212766,15.9 1.73617021,17.5 3.67659574,17.5 C5.3106383,17.5 6.74042553,16.4 7.14893617,14.8 L11.1319149,14.8 L11.1319149,22.1 C11.1319149,22.6 11.5404255,23 12.0510638,23 C12.0510638,23 12.0510638,23 12.0510638,23 L17.4638298,23 C17.5659574,22.3 17.8723404,21.8 18.2808511,21.2 Z M20.3234043,12.1 C21.3446809,12.1 22.1617021,12.9 22.1617021,13.9 C22.1617021,14.9 21.3446809,15.8 20.3234043,15.8 C19.3021277,15.8 18.4851064,15 18.4851064,13.9 C18.3829787,12.9 19.2,12.1 20.3234043,12.1 Z M20.3234043,3.8 C21.3446809,3.8 22.1617021,4.6 22.1617021,5.7 C22.1617021,6.7 21.3446809,7.5 20.3234043,7.5 C19.3021277,7.5 18.4851064,6.7 18.4851064,5.7 C18.3829787,4.7 19.3021277,3.8 20.3234043,3.8 Z M3.57446809,15.8 C2.55319149,15.8 1.73617021,15 1.73617021,13.9 C1.73617021,12.9 2.55319149,12.1 3.57446809,12.1 C4.59574468,12.1 5.51489362,12.9 5.51489362,13.9 C5.51489362,14.9 4.59574468,15.8 3.57446809,15.8 Z"
      ></path>
      <path
        fill="#3867FA"
        d="M24.5,17 C28.7,17 32,20.4 32,24.5 C32,28.6 28.6,32 24.5,32 C20.4,32 17,28.6 17,24.5 C17,20.4 20.4,17 24.5,17 Z M24.5,19.6 C23.1,19.6 21.9,20.8 21.9,22.2 L21.9,22.2 L21.9,23.1 C21.4,23.1 21,23.5 21,24 L21,24 L21,27.5 C21,28 21.4,28.4 21.9,28.4 L21.9,28.4 L27.1,28.4 C27.6,28.4 28,28 28,27.5 L28,27.5 L28,24 C28,23.5 27.6,23.1 27.1,23.1 L27.1,23.1 L27.1,22.2 C27.1,20.8 25.9,19.6 24.5,19.6 Z M24.5,24.6 C24.9,24.6 25.2,24.9 25.1,25.2 C25.1,25.5 25,25.7 24.8,25.8 L24.8,25.8 L24.8,26.7 C24.8,26.9 24.7,27 24.5,27 C24.3,27 24.2,26.9 24.2,26.7 L24.2,26.7 L24.2,25.8 C24,25.6 23.9,25.4 23.9,25.2 C23.9,24.9 24.1,24.6 24.5,24.6 Z M24.5,20.5 C25.5,20.5 26.3,21.3 26.2,22.3 L26.2,22.3 L26.2,23.2 L22.7,23.2 L22.7,22.3 C22.7,21.3 23.5,20.5 24.5,20.5 Z"
      ></path>
    </svg>
  );
};

IconPhyloTreePrivate.propTypes = forbidExtraProps({
  className: PropTypes.string,
});

export default IconPhyloTreePrivate;
