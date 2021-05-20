import PropTypes from "prop-types";
import React from "react";

const IconFilters = props => {
  return (
    <svg
      className={props.className}
      viewBox="0 0 32 32"
      fill="#3867FA"
      fillRule="evenodd"
    >
      <path d="M16.5367579,20.4238222 C18.0268008,20.4238222 19.3378405,21.3889094 19.7541472,22.7922182 L19.7541472,22.7922182 L28.0412081,22.7922182 C28.5707342,22.7922182 29,23.2132641 29,23.7326506 C29,24.252037 28.5707342,24.6730829 28.0412081,24.6730829 L28.0412081,24.6730829 L19.7541472,24.6730829 C19.3285627,26.0620909 18.0203595,27.00965 16.5417001,26.9999258 C15.0480484,27.00352 13.7312179,26.0397461 13.3094841,24.6343022 L13.3094841,24.6343022 L3.93902305,24.6343022 C3.60354244,24.6343022 3.29354555,24.4587526 3.12580524,24.1737812 C2.95806492,23.8888098 2.95806492,23.5377106 3.12580524,23.2527392 C3.29354555,22.9677678 3.60354244,22.7922182 3.93902305,22.7922182 L3.93902305,22.7922182 L13.3193686,22.7922182 C13.7356753,21.3889094 15.046715,20.4238222 16.5367579,20.4238222 Z M16.4823934,22.2589834 C15.6635386,22.2589834 14.9997255,22.9100853 14.9997255,23.7132602 C14.9997255,24.5164351 15.6635386,25.1675371 16.4823934,25.1675371 C17.3012483,25.1675371 17.9650613,24.5164351 17.9650613,23.7132602 C17.9650613,22.9100853 17.3012483,22.2589834 16.4823934,22.2589834 Z M9.74613886,12.4319908 C11.2361818,12.4319908 12.5472214,13.397078 12.9635282,14.8003868 L12.9635282,14.8003868 L28.056932,14.8003868 C28.5755401,14.8003868 28.995955,15.2127514 28.995955,15.7214288 C28.995955,16.2301063 28.5755401,16.6424708 28.056932,16.6424708 L28.056932,16.6424708 L12.9635282,16.6424708 C12.5534526,18.0433909 11.2469385,19.0084682 9.76096554,19.0081492 C8.27004902,19.012954 6.95409336,18.0537676 6.52874953,16.652166 L6.52874953,16.652166 L3.93902294,16.652166 C3.42041488,16.6521659 3,16.2398014 3,15.731124 C3,15.2224466 3.42041488,14.810082 3.93902294,14.810082 L3.93902294,14.810082 L6.52874953,14.810082 L6.52874953,14.8003868 C6.94505628,13.397078 8.25609596,12.4319908 9.74613886,12.4319908 Z M9.72142773,14.2962375 C9.12484583,14.2962375 8.58720078,14.64927 8.35983319,15.1902644 C8.13246561,15.7312587 8.260293,16.3533523 8.68355807,16.7657261 C9.10682314,17.1780999 9.74190793,17.2992876 10.2919203,17.0726359 C10.8419326,16.8459841 11.1982151,16.316269 11.1942112,15.731124 C11.1887779,14.9370924 10.530979,14.2962375 9.72142773,14.2962375 Z M21.0490105,5 C22.5407422,5 23.8517231,5.96999244 24.2614576,7.37688391 L24.2614576,7.37688391 L27.6814782,7.37688391 C28.0890724,7.2454795 28.5365494,7.38699002 28.7891299,7.72716871 C29.0417105,8.0673474 29.0417105,8.52850439 28.7891299,8.86868309 C28.5365494,9.20886178 28.0890724,9.35037229 27.6814782,9.21896789 L27.6814782,9.21896789 L24.2614576,9.21896789 C23.8543212,10.6343163 22.5284175,11.6047308 21.0292416,11.5845915 C19.5344968,11.5914346 18.2158951,10.6263645 17.7970256,9.21896789 L17.7970256,9.21896789 L3.9587919,9.21896789 C3.42926576,9.21896789 3,8.79792198 3,8.27853554 C3,7.7591491 3.42926576,7.33810319 3.9587919,7.33810319 L3.9587919,7.33810319 L17.7970256,7.33810319 L17.8365634,7.37688391 C18.2462978,5.96999244 19.5572787,5 21.0490105,5 Z M20.9897038,6.81456354 C20.1830577,6.8145816 19.5286463,7.4550422 19.5268381,8.24624009 C19.5250373,9.03743798 20.1765207,9.680764 20.9831586,9.68433678 C21.7897965,9.68787992 22.4471524,9.05032699 22.4526028,8.25914518 L22.4526028,8.25914518 L22.4921406,8.24945 C22.4759331,7.44851558 21.8064162,6.80910054 20.9897038,6.81456354 Z" />
    </svg>
  );
};

IconFilters.propTypes = {
  className: PropTypes.string,
};

export default IconFilters;
