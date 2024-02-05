import dynamic from "next/dynamic";
import { Props } from "react-joyride";
import TourTooltip from "@/components/product-tour/TourTooltip";

const JoyRide = dynamic(() => import("react-joyride"), { ssr: false });

export default function ProductTour(props: Props) {
  return (
    <JoyRide
      showProgress={true}
      continuous={true}
      spotlightClicks={true}
      tooltipComponent={TourTooltip}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
      {...props}
    />
  );
}
