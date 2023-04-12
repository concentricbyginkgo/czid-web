import React from "react";
import cs from "~/styles/themes/_elements.scss";

const ImgDownloadPrimary = props => {
  return (
    <svg
      {...props}
      fill="#3867FA"
      fillRule="evenodd"
      height={cs.imgM}
      transform="translate(1.500000, 18.000000)"
      viewBox={`0 0 ${cs.imgM} ${cs.imgM}`}
      width={cs.imgM}
    >
      <path d="M54.7175562,76.5435465 C53.3645226,76.5435465 52.2676721,77.6372308 52.2676721,78.9863587 C52.2676721,80.3354866 53.3645226,81.4291708 54.7175562,81.4291708 C56.0705897,81.4291708 57.1674402,80.3354866 57.1674402,78.9863587 C57.1674402,77.6372308 56.0705897,76.5435465 54.7175562,76.5435465 L54.7175562,76.5435465 Z M46.5512762,76.5435465 C45.1982427,76.5435465 44.1013923,77.6372308 44.1013923,78.9863587 C44.1013923,80.3354866 45.1982427,81.4291708 46.5512762,81.4291708 C47.9043098,81.4291708 49.0011602,80.3354866 49.0011602,78.9863587 C49.0011602,77.6372308 47.9043098,76.5435465 46.5512762,76.5435465 L46.5512762,76.5435465 Z M77.5831398,18.3557603 C82.9457678,13.735166 90.4616221,12.5212211 97.0129091,15.217505 C103.564196,17.9137889 108.033183,24.0602815 108.566006,31.1072398 C108.650187,31.9425209 109.357354,32.5771341 110.199261,32.5729685 C110.66227,32.5752419 111.104505,32.3814954 111.415962,32.0398817 C111.727419,31.6982681 111.878825,31.2408942 111.832518,30.7815315 C111.161507,22.5608172 105.932456,15.4061332 98.2896585,12.2514233 C90.6468614,9.09671334 81.87618,10.4727415 75.574235,15.8152356 C75.2185334,16.1075047 75.0032402,16.536028 74.9814647,16.9950967 C74.9596891,17.4541654 75.1334586,17.9010372 75.4599071,18.225477 L75.4599071,18.225477 C76.0430634,18.8041259 76.966832,18.8599503 77.6158049,18.3557603 L77.5831398,18.3557603 Z M73.4999999,43.2377119 C74.8157513,43.2377119 75.8832559,44.3021351 75.8832559,45.6162534 L75.8832559,45.6162534 L75.882,106.6545 L86.797383,95.775237 C87.3313135,95.1535615 88.1437834,94.8536937 88.9455866,94.9687579 L88.9455866,94.9687579 L89.1637784,95.0104966 C90.0342043,95.2192701 90.7142618,95.8973646 90.9239168,96.7664256 C91.1336817,97.6359428 90.8369745,98.5492258 90.1987972,99.0912321 L90.1987972,99.0912321 L75.1875922,114.059102 C74.2582136,114.980299 72.7581189,114.980299 71.8274466,114.057816 L71.8274466,114.057816 L56.8437373,99.1304897 C56.1630253,98.5492258 55.8663182,97.6359428 56.0760831,96.7664257 C56.2857378,95.8973647 56.9657955,95.2192701 57.8362212,95.0104966 C58.7061927,94.8018319 59.6201472,95.0970456 60.1632197,95.7327966 L60.1632197,95.7327966 L71.1165,106.6545 L71.1167439,45.6162534 C71.1167439,44.3751416 72.0689317,43.3567518 73.2831471,43.2474279 L73.2831471,43.2474279 Z M63.700464,13.0304297 C72.1365005,1.81484948 86.8236327,-2.75982177 100.162178,1.67352558 C113.500723,6.10687293 122.497679,18.5534519 122.497679,32.5729272 C129.516529,32.5719714 136.198688,35.5728184 140.849531,40.8144405 C145.500375,46.0560627 147.673161,53.0349692 146.816861,59.9812799 C145.091432,72.3778918 134.395303,81.5643788 121.844377,81.4291708 L121.844377,81.4291708 L92.2824437,81.4291708 C90.9294102,81.4291708 89.8325597,80.3354866 89.8325597,78.9863587 C89.8325597,77.6372308 90.9294102,76.5435465 92.2824437,76.5435465 L92.2824437,76.5435465 L121.942373,76.5435465 C132.137302,76.6577317 140.782266,69.0976751 141.998755,59.004155 C142.567477,53.5008131 140.77015,48.0149893 137.052728,43.9078261 C133.335306,39.800663 128.046176,37.4570744 122.497679,37.4585516 C119.829425,37.4590837 117.651277,35.3306603 117.597911,32.6706397 C117.600292,20.763047 109.966302,10.1877857 98.6411451,6.41009017 C87.3159882,2.63239473 74.8368764,6.49859492 67.6529436,16.0106605 C66.8639574,17.0563561 65.6872425,17.7427472 64.3864315,17.9160541 L64.3864315,17.9160541 L63.700464,17.9160541 C62.6440104,17.9254706 61.612801,17.5941512 60.7606033,16.9715 C57.378949,14.4100344 53.2478897,13.0255475 49.0011602,13.0304297 C38.25927,13.0298012 29.518459,21.6509623 29.4020885,32.3612168 C29.3853423,35.1316154 27.1655669,37.3882412 24.3879926,37.4585516 C18.8751623,37.4914517 13.6311445,39.8379219 9.94181587,43.9225884 C6.25248727,48.0072549 4.45904071,53.4523632 5.00124414,58.9227279 C6.1799329,69.0548604 14.8450469,76.6615242 25.0739601,76.5435465 L25.0739601,76.5435465 L38.3849964,76.5435465 C39.7380299,76.5435465 40.8348803,77.6372308 40.8348803,78.9863587 C40.8348803,80.3354866 39.7380299,81.4291708 38.3849964,81.4291708 L38.3849964,81.4291708 L25.1556229,81.4291708 C12.6046964,81.5643788 1.90856787,72.3778918 0.183139,59.9812799 C-0.67316075,53.0349692 1.49962501,46.0560627 6.15046857,40.8144405 C10.8013121,35.5728184 17.4834708,32.5719714 24.5023205,32.5729272 C24.5023205,23.3202372 29.7451305,14.8616796 38.044946,10.7237508 C46.3447617,6.585822 56.2768833,7.47881569 63.700464,13.0304297 Z"></path>
    </svg>
  );
};

export default ImgDownloadPrimary;
